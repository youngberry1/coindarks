"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
    CheckCircle2,
    Wallet,
    Info,
    AlertCircle,
    ArrowDown,
    Copy,
    Landmark,
    RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createOrder } from "@/actions/exchange";
import { getExchangeRates, ExchangeRate } from "@/actions/rates";
import { getWallets } from "@/actions/wallets";
import { getPaymentMethods } from "@/actions/payment-methods";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Cryptocurrency } from "@/actions/crypto";
import { AssetSelector } from "@/components/dashboard/AssetSelector";
import { Loading } from "@/components/ui/Loading";

export interface AssetMetadata {
    id: string;
    name: string;
    icon: string;
    coingeckoId: string;
}

const FIAT = [
    { id: "GHS", name: "Ghana Cedi", symbol: "GH₵", rate: 16.5, icon: "https://flagcdn.com/w40/gh.png" }, // Simulated
    { id: "NGN", name: "Nigerian Naira", symbol: "₦", rate: 1650, icon: "https://flagcdn.com/w40/ng.png" }, // Simulated
];

interface TradingFormProps {
    initialInventory: Cryptocurrency[];
    supportedAssets: AssetMetadata[];
}

interface SavedWallet {
    id: string;
    user_id?: string;
    asset: string;
    address: string;
    network: string;
    name: string;
    type?: 'CRYPTO' | 'FIAT';
}

export function TradingForm({ initialInventory, supportedAssets }: TradingFormProps) {
    const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
    const [asset, setAsset] = useState(supportedAssets[0]);
    const [fiat, setFiat] = useState(FIAT[0]);

    // Inputs
    const [amountFiat, setAmountFiat] = useState("");
    const [amountCrypto, setAmountCrypto] = useState("");
    const [lastInputType, setLastInputType] = useState<'FIAT' | 'CRYPTO'>('FIAT');

    const [receivingAddress, setReceivingAddress] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Price State
    const [displayRate, setDisplayRate] = useState<number | null>(null);
    const [cachedRates, setCachedRates] = useState<ExchangeRate[]>([]);

    // Success State
    const [orderSuccess, setOrderSuccess] = useState<{
        id: string;
        depositAddress: string | null;
        amounts: { crypto: number, fiat: number }
    } | null>(null);

    // Validation State
    const [error, setError] = useState<string | null>(null);

    // Wallet State
    const [savedWallets, setSavedWallets] = useState<SavedWallet[]>([]);
    const [showWalletDropdown, setShowWalletDropdown] = useState(false);

    useEffect(() => {
        // Fetch saved wallets or payment methods
        const loadWallets = async () => {
            setSavedWallets([]); // Clear on toggle
            if (type === 'BUY') {
                const wallets = await getWallets(asset.id);
                setSavedWallets(wallets.map(w => ({ ...w, type: 'CRYPTO' })));
            } else {
                // Fetch fiat payment methods for SELL
                const methods = await getPaymentMethods();
                setSavedWallets(methods.map(m => ({
                    id: m.id,
                    asset: 'FIAT', // generic
                    address: `${m.provider} - ${m.account_number} (${m.account_name})`,
                    network: m.method_type === 'MOBILE_MONEY' ? 'Mobile Money' : 'Bank Transfer',
                    name: m.provider,
                    type: 'FIAT'
                })));
            }
        };
        loadWallets();
    }, [asset.id, type]);

    const [refreshCountdown, setRefreshCountdown] = useState(15);

    // 1. Fetch Raw Rates from DB/API
    const updateRatesCache = useCallback(async () => {
        try {
            const rates = await getExchangeRates();
            setCachedRates(rates);
            setRefreshCountdown(15);
        } catch {
            // Error handled by timeout/retry in rates.ts
        }
    }, []);

    // 2. Synchronous Price Calculation (Instant UI update)
    useEffect(() => {
        if (!cachedRates.length) return;

        const exactPair = cachedRates.find(r => r.pair === `${asset.id}-${fiat.id}`);
        const usdPair = cachedRates.find(r => r.pair === `${asset.id}-USD` || r.pair === `${asset.id}-USDT`);

        // Robust Multiplier Logic
        const bridgePair = cachedRates.find(r =>
            (r.pair === `USDT-${fiat.id}` || r.pair === `USDC-${fiat.id}` || r.pair === `USD-${fiat.id}`) &&
            (r.display_rate > 0 || r.rate > 0)
        );

        const fiatMultiplier = bridgePair ? (bridgePair.display_rate || bridgePair.rate) : fiat.rate;

        let baseRate = 0;
        let buyMargin = 0;
        let sellMargin = 0;

        if (exactPair && (exactPair.display_rate || exactPair.rate) > 0) {
            baseRate = exactPair.display_rate || exactPair.rate;
            buyMargin = exactPair.buy_margin;
            sellMargin = exactPair.sell_margin;
        } else if (usdPair) {
            baseRate = (usdPair.display_rate || usdPair.rate) * fiatMultiplier;
            buyMargin = usdPair.buy_margin;
            sellMargin = usdPair.sell_margin;
        } else {
            setDisplayRate(null);
            return;
        }

        const currentMargin = type === 'BUY' ? buyMargin : sellMargin;
        const marginMultiplier = type === 'BUY'
            ? (1 + (currentMargin / 100))
            : (1 - (currentMargin / 100));

        setDisplayRate(baseRate * marginMultiplier);
    }, [cachedRates, asset, fiat, type]);

    // 3. Periodic Background Refresh
    useEffect(() => {
        setIsLoading(true);
        updateRatesCache().finally(() => setIsLoading(false));

        const priceInterval = setInterval(updateRatesCache, 15000);
        const timerInterval = setInterval(() => {
            setRefreshCountdown(prev => (prev > 0 ? prev - 1 : 15));
        }, 1000);

        return () => {
            clearInterval(priceInterval);
            clearInterval(timerInterval);
        };
    }, [updateRatesCache]);

    // Validation
    const validateAmount = (fiatVal: number) => {
        if (fiatVal <= 0) {
            setError("Amount must be greater than zero");
            return false;
        }

        const ghsRate = FIAT.find(f => f.id === 'GHS')?.rate || 16.5;
        // Min order ~ $6.5 USD (rounded for clean numbers)
        const minUsd = 100 / ghsRate;
        const minCurrentFiat = minUsd * fiat.rate;

        if (fiatVal < minCurrentFiat) {
            setError(`Minimum ${type === 'BUY' ? 'purchase' : 'sale'} is ${fiat.symbol}${Math.ceil(minCurrentFiat).toLocaleString()}`);
            return false;
        }
        setError(null);
        return true;
    };

    // Update estimated counter-values when rate changes or input changes
    useEffect(() => {
        if (!displayRate) return;

        if (lastInputType === 'FIAT' && amountFiat) {
            const rawVal = parseFloat(amountFiat);
            if (!isNaN(rawVal)) {
                setAmountCrypto((rawVal / displayRate).toFixed(8));
            }
        } else if (lastInputType === 'CRYPTO' && amountCrypto) {
            const rawVal = parseFloat(amountCrypto);
            if (!isNaN(rawVal)) {
                setAmountFiat((rawVal * displayRate).toFixed(2));
            }
        }
    }, [displayRate, amountFiat, amountCrypto, lastInputType]);

    // Handle Input Changes
    const handleFiatChange = (val: string) => {
        // Block negative input immediately
        if (val.startsWith('-')) return;

        setAmountFiat(val);
        setLastInputType('FIAT');

        if (!val) {
            setAmountCrypto("");
            setError(null);
            return;
        }

        const numVal = parseFloat(val);
        if (!isNaN(numVal)) {
            validateAmount(numVal);
        }

        if (displayRate && !isNaN(numVal) && numVal > 0) {
            setAmountCrypto((numVal / displayRate).toFixed(8));
        } else if (numVal <= 0) {
            setAmountCrypto("0.00");
        }
    };

    const handleCryptoChange = (val: string) => {
        // Block negative input immediately
        if (val.startsWith('-')) return;

        setAmountCrypto(val);
        setLastInputType('CRYPTO');

        if (!val) {
            setAmountFiat("");
            setError(null);
            return;
        }

        const numVal = parseFloat(val);
        if (displayRate && !isNaN(numVal) && numVal > 0) {
            const fiatVal = numVal * displayRate;
            setAmountFiat(fiatVal.toFixed(2));
            validateAmount(fiatVal);
        } else if (numVal <= 0) {
            setAmountFiat("0.00");
            setError("Amount must be greater than zero");
        }
    };

    const handleSubmit = async () => {
        if ((!amountFiat && !amountCrypto) || !receivingAddress) {
            toast.error("Please fill in all fields");
            return;
        }

        if (error) {
            toast.error(error);
            return;
        }

        setIsSubmitting(true);

        try {
            const inputVal = lastInputType === 'FIAT' ? Number(amountFiat) : Number(amountCrypto);

            const result = await createOrder({
                type,
                asset: asset.id,
                amount_input: inputVal,
                input_type: lastInputType,
                fiat_currency: fiat.id,
                receiving_address: receivingAddress
            });

            if (result.success) {
                setOrderSuccess({
                    id: result.orderNumber!,
                    depositAddress: result.depositAddress || null,
                    amounts: result.amounts || { crypto: 0, fiat: 0 }
                });
                toast.success("Order initiated!");
            } else {
                toast.error(result.error || "Order creation failed");
            }
        } catch (err) {
            console.error("Exception in handleSubmit:", err);
            toast.error("Failed to submit order");
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    const assetInfo = initialInventory.find(i => i.symbol === asset.id);
    const isAvailable = assetInfo?.is_active && assetInfo?.stock_status === 'IN STOCK';

    // SUCCESS VIEW
    if (orderSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg mx-auto bg-card-bg border border-white/5 rounded-3xl p-8 space-y-8 animate-in zoom-in-95 duration-300"
            >
                <div className="text-center space-y-4">
                    <div className="mx-auto h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight">Trade Initiated</h2>
                        <p className="text-sm font-medium text-foreground/50">Ref: <span className="font-mono text-primary font-bold">#{orderSuccess.id}</span></p>
                    </div>
                </div>

                <div className="bg-black/20 rounded-2xl p-6 space-y-4 text-sm">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                        <span className="text-foreground/50 font-medium">You Pay</span>
                        <span className="font-bold text-lg">{type === 'BUY' ? `${fiat.symbol}${orderSuccess.amounts.fiat.toLocaleString()}` : `${orderSuccess.amounts.crypto} ${asset.id}`}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-foreground/50 font-medium">You Receive</span>
                        <span className="font-bold text-lg text-emerald-500">{type === 'BUY' ? `${orderSuccess.amounts.crypto} ${asset.id}` : `${fiat.symbol}${orderSuccess.amounts.fiat.toLocaleString()}`}</span>
                    </div>
                </div>

                {orderSuccess.depositAddress ? (
                    <div className="space-y-4">
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center space-y-2">
                            <p className="text-xs font-black uppercase tracking-widest text-amber-500">Action Required</p>
                            <p className="text-sm font-medium">Send <span className="font-bold text-white bg-amber-500/20 px-1.5 py-0.5 rounded-md">{type === 'BUY' ? `${fiat.symbol}${orderSuccess.amounts.fiat.toLocaleString()}` : `${orderSuccess.amounts.crypto} ${asset.id}`}</span> to the address below.</p>
                        </div>

                        <div className="relative group/copy cursor-pointer" onClick={() => copyToClipboard(orderSuccess.depositAddress!)}>
                            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 font-mono text-xs break-all text-center hover:bg-white/10 transition-colors">
                                {orderSuccess.depositAddress}
                            </div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/20 group-hover/copy:text-primary transition-colors">
                                <Copy className="h-4 w-4" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 flex items-center gap-3 text-amber-500">
                        <Info className="h-5 w-5 shrink-0" />
                        <p className="text-xs font-bold">Manual review required. Check your email for instructions.</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <Link href="/dashboard/orders" className="flex items-center justify-center py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold border border-white/5 transition-all">Track Order</Link>
                    <button onClick={() => { setOrderSuccess(null); setAmountFiat(""); setAmountCrypto(""); }} className="flex items-center justify-center py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">New Trade</button>
                </div>
            </motion.div>
        );
    }

    // FORM VIEW
    return (
        <div className="w-full max-w-[480px] mx-auto relative group/form">
            <AnimatePresence>
                {isSubmitting && (
                    <Loading message="PROCESSING..." />
                )}
            </AnimatePresence>

            {/* Main Trading Card */}
            <div className="bg-[#13161B] border border-white/5 rounded-[32px] p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">

                {/* Header / Tabs */}
                <div className="flex items-center justify-between mb-8">
                    <div className="text-lg font-black tracking-tight text-white">Swap</div>
                    <div className="flex bg-black/40 p-1 rounded-full border border-white/5">
                        <button
                            onClick={() => setType('BUY')}
                            className={cn("px-6 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all", type === 'BUY' ? "bg-primary text-white shadow-lg" : "text-foreground/40 hover:text-foreground")}
                        >Buy</button>
                        <button
                            onClick={() => setType('SELL')}
                            className={cn("px-6 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all", type === 'SELL' ? "bg-rose-500 text-white shadow-lg" : "text-foreground/40 hover:text-foreground")}
                        >Sell</button>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-foreground/30">
                        {refreshCountdown}s <RefreshCw className={cn("h-3 w-3", refreshCountdown < 5 && "animate-spin")} />
                    </div>
                </div>

                <div className="space-y-2 relative">
                    {/* Input Block 1: Pay */}
                    <div className="bg-[#0A0C10] rounded-[24px] p-6 border border-white/5 hover:border-white/10 transition-colors group/pay relative z-0">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs text-foreground/40 font-bold uppercase tracking-wide">You Pay</span>
                            {/* Asset Selector Integrated */}
                            <div className="scale-90 origin-right">
                                {type === 'BUY' ? (
                                    <AssetSelector value={fiat.id} onChange={(val) => setFiat(FIAT.find(f => f.id === val)!)} options={FIAT} type="FIAT" />
                                ) : (
                                    <AssetSelector value={asset.id} onChange={(val) => setAsset(supportedAssets.find(a => a.id === val)!)} options={supportedAssets} type="CRYPTO" />
                                )}
                            </div>
                        </div>
                        <input
                            type="number"
                            value={type === 'BUY' ? amountFiat : amountCrypto}
                            onChange={(e) => type === 'BUY' ? handleFiatChange(e.target.value) : handleCryptoChange(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-transparent text-4xl font-black outline-none placeholder:text-white/5 transition-all text-white py-2"
                        />
                        <div className="text-right text-[11px] font-medium text-foreground/30 mt-2 h-4">
                            {/* Balance Placeholder */}
                        </div>
                    </div>

                    {/* Arrow Connector */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <div className="bg-[#13161B] p-2 rounded-xl border border-white/10 shadow-xl">
                            <div className="bg-white/5 p-2 rounded-lg text-foreground/70 hover:text-primary transition-colors cursor-pointer">
                                <ArrowDown className="h-4 w-4" />
                            </div>
                        </div>
                    </div>

                    {/* Input Block 2: Receive */}
                    <div className="bg-[#0A0C10] rounded-[24px] p-6 border border-white/5 hover:border-white/10 transition-colors group/receive relative z-0">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs text-foreground/40 font-bold uppercase tracking-wide">You Receive</span>
                            <div className="scale-90 origin-right">
                                {type === 'BUY' ? (
                                    <AssetSelector value={asset.id} onChange={(val) => setAsset(supportedAssets.find(a => a.id === val)!)} options={supportedAssets} type="CRYPTO" />
                                ) : (
                                    <AssetSelector value={fiat.id} onChange={(val) => setFiat(FIAT.find(f => f.id === val)!)} options={FIAT} type="FIAT" />
                                )}
                            </div>
                        </div>
                        <input
                            type="number"
                            value={type === 'BUY' ? amountCrypto : amountFiat}
                            onChange={(e) => type === 'BUY' ? handleCryptoChange(e.target.value) : handleFiatChange(e.target.value)}
                            placeholder="0.00"
                            readOnly
                            className="w-full bg-transparent text-4xl font-black outline-none placeholder:text-white/5 text-emerald-500 transition-all cursor-default py-2"
                        />
                        <div className="text-right text-[11px] font-medium text-foreground/30 mt-2 h-4 flex justify-end items-center gap-1">
                            {isLoading ? <span className="animate-pulse">Fetching rates...</span> : (
                                displayRate ? `1 ${asset.id} ≈ ${fiat.symbol}${displayRate.toLocaleString()}` : "Rate unavailable"
                            )}
                        </div>
                    </div>
                </div>

                {/* Address Section */}
                <div className="mt-6">
                    <div className="relative group/address">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within/address:text-primary transition-colors">
                            {type === 'BUY' ? <Wallet className="h-5 w-5" /> : <Landmark className="h-5 w-5" />}
                        </div>
                        <input
                            value={receivingAddress}
                            onChange={(e) => type !== 'SELL' && setReceivingAddress(e.target.value)}
                            readOnly={type === 'SELL'}
                            onFocus={() => setShowWalletDropdown(true)}
                            onBlur={() => setTimeout(() => setShowWalletDropdown(false), 200)}
                            placeholder={type === 'BUY' ? `Paste your ${asset.id} Address` : "Select Banking Account"}
                            className="w-full bg-[#0A0C10] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-foreground/20 focus:outline-none focus:border-primary/50 transition-all"
                        />

                        {/* Dropdown */}
                        <AnimatePresence>
                            {showWalletDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute bottom-full left-0 right-0 mb-2 bg-[#0A0C10] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto"
                                >
                                    <div className="p-3 border-b border-white/5 text-[10px] font-bold text-foreground/30 uppercase tracking-widest bg-white/5">Saved Wallets</div>
                                    {savedWallets.length > 0 ? (
                                        savedWallets.map(w => (
                                            <button key={w.id} onMouseDown={() => setReceivingAddress(w.address)} className="w-full text-left p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group/wallet">
                                                <div className="font-bold text-xs text-white group-hover/wallet:text-primary transition-colors">{w.name}</div>
                                                <div className="text-[10px] font-mono text-foreground/40 break-all mt-1">{w.address}</div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-xs text-foreground/30 italic">No saved addresses found</div>
                                    )}
                                    <Link href={type === 'BUY' ? "/dashboard/wallets?tab=crypto" : "/dashboard/wallets?tab=fiat"} className="block p-3 text-center text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 transition-colors border-t border-white/5">
                                        + Add New
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Error & Warning */}
                {error && (
                    <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/10 text-red-500 text-xs font-bold flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        {error}
                    </div>
                )}

                {/* Submit Button */}
                <div className="mt-6">
                    {!isAvailable ? (
                        <button disabled className="w-full py-5 rounded-[20px] bg-white/5 border border-white/5 text-foreground/30 font-bold cursor-not-allowed text-sm uppercase tracking-widest">
                            Currently Unavailable
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !!error || !amountFiat || !receivingAddress}
                            className={cn(
                                "w-full py-5 rounded-[20px] font-black text-sm uppercase tracking-widest transition-all shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:grayscale disabled:hover:scale-100",
                                type === 'BUY' ? "bg-primary text-white shadow-primary/20 hover:shadow-primary/30" : "bg-rose-500 text-white shadow-rose-500/20 hover:shadow-rose-500/30"
                            )}>
                            {isSubmitting ? "Processing..." : `Confirm ${type}`}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
