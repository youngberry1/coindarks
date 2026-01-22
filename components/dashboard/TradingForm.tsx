"use client";

import { useState, useEffect, useCallback } from "react";
import {
    CheckCircle2,
    Wallet,
    Info,
    ArrowRight,
    AlertCircle,
    ArrowDown,
    Copy,
    Landmark,
    Smartphone,
    Plus,
    RefreshCw,
    TrendingUp,
    Shield
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

interface AssetMetadata {
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
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="p-10 md:p-16 rounded-[48px] border border-white/5 bg-white/2 backdrop-blur-3xl text-center space-y-12 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-12 text-emerald-500/5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                    <CheckCircle2 className="h-64 w-64" />
                </div>

                <div className="relative">
                    <div className="h-28 w-28 rounded-[36px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20 animate-pulse">
                        <CheckCircle2 className="h-14 w-14 text-emerald-500" />
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-4xl font-black uppercase tracking-tighter">Settlement <span className="text-emerald-500">Initiated</span></h2>
                        <p className="text-foreground/40 font-black uppercase tracking-[0.2em] text-xs">Reference Hash: <span className="text-primary font-mono select-all">#{orderSuccess.id}</span></p>
                    </div>
                </div>

                <div className="bg-black/40 p-10 rounded-[40px] border border-white/5 space-y-8 text-left max-w-2xl mx-auto relative group/info">
                    <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover/info:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    <div className="grid grid-cols-2 gap-10 text-xs mb-4 pb-8 border-b border-white/5">
                        <div className="space-y-2">
                            <p className="text-[10px] text-foreground/20 font-black uppercase tracking-widest">Transaction Date</p>
                            <p className="font-bold text-base uppercase">{new Date().toLocaleDateString()} {" // "} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className="text-right space-y-2">
                            <p className="text-[10px] text-foreground/20 font-black uppercase tracking-widest">Trade Pair</p>
                            <p className="font-bold text-base uppercase text-primary">{asset.id} / {fiat.id}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] text-foreground/20 font-black uppercase tracking-widest">Paid Amount</p>
                            <p className="font-black text-2xl text-white tracking-tighter">{type === 'BUY' ? `${fiat.symbol}${orderSuccess.amounts.fiat.toLocaleString()}` : `${orderSuccess.amounts.crypto} ${asset.id}`}</p>
                        </div>
                        <div className="text-right space-y-2">
                            <p className="text-[10px] text-foreground/20 font-black uppercase tracking-widest">Received Amount</p>
                            <p className="font-black text-2xl text-emerald-500 tracking-tighter">{type === 'BUY' ? `${orderSuccess.amounts.crypto} ${asset.id}` : `${fiat.symbol}${orderSuccess.amounts.fiat.toLocaleString()}`}</p>
                        </div>
                    </div>

                    {orderSuccess.depositAddress ? (
                        <>
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Action Required</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-[28px] space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/50">Step 01</p>
                                        <p className="text-xs text-foreground/80 font-bold leading-relaxed">Send EXACTLY <span className="text-white bg-amber-500/20 px-2 py-0.5 rounded-lg">{type === 'BUY' ? `${fiat.symbol}${orderSuccess.amounts.fiat.toLocaleString()}` : `${orderSuccess.amounts.crypto} ${asset.id}`}</span></p>
                                    </div>

                                    <div className="p-6 bg-primary/10 border border-primary/20 rounded-[28px] space-y-2 text-primary">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/50">Step 02</p>
                                        <p className="text-xs font-bold leading-relaxed">{type === 'BUY' ? 'Attach payment ref' : 'Confirm transaction'}: <span className="text-white font-mono bg-primary/20 px-2 py-0.5 rounded-lg">{type === 'BUY' ? orderSuccess.id : 'ASAP'}</span></p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20 px-4">{type === 'BUY' ? 'Settlement Account' : 'Gateway address'}</p>
                                    <button
                                        type="button"
                                        className="flex items-center gap-6 p-6 bg-white/3 rounded-[32px] border border-white/5 group/addr cursor-pointer w-full transition-all hover:bg-white/5 active:scale-[0.98]"
                                        onClick={() => copyToClipboard(orderSuccess.depositAddress!)}
                                    >
                                        <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 group-hover/addr:text-primary transition-colors">
                                            <Copy className="h-5 w-5" />
                                        </div>
                                        <p className="font-mono text-xs break-all text-foreground/60 flex-1 text-left whitespace-pre-line leading-relaxed">{orderSuccess.depositAddress}</p>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div className="p-8 bg-amber-500/5 border border-amber-500/20 rounded-[32px] flex gap-6 items-center text-amber-500">
                                <Info className="h-8 w-8 shrink-0 opacity-50" />
                                <div className="space-y-1">
                                    <p className="text-sm font-black uppercase tracking-tight">Manual Review Required</p>
                                    <p className="text-[11px] font-bold leading-relaxed opacity-60">Complete instructions have been sent to your email. Our team is standing by.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-5 justify-center pt-8">
                    <a href={`/dashboard/orders`} className="px-12 py-5 rounded-[24px] bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all flex items-center justify-center gap-3">
                        Track Settlement <ArrowRight className="h-4 w-4" />
                    </a>
                    <button onClick={() => { setOrderSuccess(null); setAmountFiat(""); setAmountCrypto(""); }} className="px-12 py-5 rounded-[24px] bg-white/5 border border-white/10 font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all active:scale-95">
                        New Exchange
                    </button>
                </div>
            </motion.div>
        );
    }

    // FORM VIEW
    return (
        <div className="p-8 md:p-12 lg:p-16 rounded-[64px] border border-white/5 bg-white/2 backdrop-blur-3xl relative overflow-hidden group/form shadow-2xl">
            <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover/form:opacity-100 transition-opacity duration-1000 pointer-events-none" />

            <AnimatePresence>
                {isSubmitting && (
                    <Loading message="PROCESSING TRANSACTION..." />
                )}
            </AnimatePresence>

            {/* Type Toggle */}
            <div className="relative p-1.5 rounded-[28px] bg-black/40 border border-white/5 mb-12 w-full sm:w-max flex">
                <div className="absolute inset-y-1.5 transition-all duration-500 ease-out bg-primary rounded-[22px]"
                    style={{
                        left: type === 'BUY' ? '6px' : 'calc(50% + 1px)',
                        width: 'calc(50% - 7px)',
                        backgroundColor: type === 'BUY' ? 'rgb(var(--primary))' : 'rgb(244 63 94)'
                    }}
                />
                <button
                    onClick={() => setType('BUY')}
                    className={cn(
                        "relative z-10 flex-1 sm:flex-none px-12 py-4 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.3em] transition-all duration-500",
                        type === 'BUY' ? "text-white" : "text-foreground/20 hover:text-foreground/40"
                    )}
                >
                    Buy Crypto
                </button>
                <button
                    onClick={() => setType('SELL')}
                    className={cn(
                        "relative z-10 flex-1 sm:flex-none px-12 py-4 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.3em] transition-all duration-500",
                        type === 'SELL' ? "text-white" : "text-foreground/20 hover:text-foreground/40"
                    )}
                >
                    Sell Crypto
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
                <div className="space-y-8">
                    {/* INPUT BLOCK 1 */}
                    <div className="space-y-4">
                        <div className="group/input p-10 rounded-[48px] bg-white/2 border border-white/5 focus-within:border-primary/50 focus-within:bg-white/5 transition-all relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary/2 opacity-0 group-focus-within/input:opacity-100 transition-opacity pointer-events-none" />
                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <div className="space-y-2">
                                    <p className="text-[11px] font-black text-foreground/60 uppercase tracking-[0.4em]">You Pay</p>
                                    <p className="text-xs font-black text-primary uppercase tracking-widest">{type === 'BUY' ? 'Payment Method' : 'Asset to Sell'}</p>
                                </div>
                                {type === 'BUY' ? (
                                    <AssetSelector value={fiat.id} onChange={(val) => setFiat(FIAT.find(f => f.id === val)!)} options={FIAT} type="FIAT" />
                                ) : (
                                    <AssetSelector value={asset.id} onChange={(val) => setAsset(supportedAssets.find(a => a.id === val)!)} options={supportedAssets} type="CRYPTO" />
                                )}
                            </div>
                            <div className="relative z-10">
                                <input
                                    id="pay-amount"
                                    type="number"
                                    value={type === 'BUY' ? amountFiat : amountCrypto}
                                    onChange={(e) => type === 'BUY' ? handleFiatChange(e.target.value) : handleCryptoChange(e.target.value)}
                                    placeholder="0.00"
                                    className={cn(
                                        "bg-transparent text-5xl md:text-6xl font-black outline-none w-full placeholder:text-foreground/5 tracking-tighter transition-colors",
                                        error && type === 'BUY' ? "text-rose-500/50" : "text-white"
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex justify-center -my-12 relative z-20">
                            <motion.div
                                animate={{ rotate: type === 'BUY' ? 0 : 180 }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="h-20 w-20 rounded-[32px] bg-black border-[6px] border-[#0a0a0a] flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] text-primary group/arrow cursor-pointer transition-colors hover:text-white"
                            >
                                <div className="absolute inset-0 bg-primary/10 rounded-[28px] opacity-0 group-hover/arrow:opacity-100 transition-opacity" />
                                <ArrowDown className="h-8 w-8 relative z-10 transition-transform duration-500 group-hover/arrow:translate-y-0.5" />
                            </motion.div>
                        </div>

                        {/* INPUT BLOCK 2 */}
                        <div className="p-10 rounded-[48px] bg-white/2 border border-white/5 focus-within:border-emerald-500/50 focus-within:bg-white/5 transition-all relative overflow-hidden">
                            <div className="flex items-center justify-between mb-10">
                                <div className="space-y-2">
                                    <p className="text-[11px] font-black text-foreground/60 uppercase tracking-[0.4em]">You Receive</p>
                                    <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">{type === 'BUY' ? 'Asset to Buy' : 'Payout Method'}</p>
                                </div>
                                {type === 'BUY' ? (
                                    <AssetSelector value={asset.id} onChange={(val) => setAsset(supportedAssets.find(a => a.id === val)!)} options={supportedAssets} type="CRYPTO" />
                                ) : (
                                    <AssetSelector value={fiat.id} onChange={(val) => setFiat(FIAT.find(f => f.id === val)!)} options={FIAT} type="FIAT" />
                                )}
                            </div>
                            <div>
                                <input
                                    id="receive-amount"
                                    type="number"
                                    value={type === 'BUY' ? amountCrypto : amountFiat}
                                    onChange={(e) => type === 'BUY' ? handleCryptoChange(e.target.value) : handleFiatChange(e.target.value)}
                                    placeholder="0.00"
                                    readOnly={true}
                                    className="bg-transparent text-4xl md:text-5xl font-black outline-none w-full placeholder:text-foreground/5 text-foreground/80 tracking-tighter cursor-default"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-10 flex flex-col justify-between">
                    <div className="space-y-8">
                        {/* Address Input Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-4">
                                <label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em]">
                                    {type === 'BUY' ? 'Your Wallet Address' : 'Payment Account Details'}
                                </label>
                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-rose-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
                                    >
                                        <AlertCircle className="h-3 w-3" /> {error}
                                    </motion.p>
                                )}
                            </div>
                            <div className="relative group/addr-input">
                                <div className="absolute left-8 top-1/2 -translate-y-1/2 h-14 w-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-foreground/20 group-focus-within/addr-input:text-primary transition-all duration-500">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <input
                                    type="text"
                                    value={receivingAddress}
                                    onChange={(e) => type !== 'SELL' && setReceivingAddress(e.target.value)}
                                    readOnly={type === 'SELL'}
                                    onFocus={() => setShowWalletDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowWalletDropdown(false), 200)}
                                    placeholder={type === 'BUY' ? `Enter secure ${asset.id} hash...` : "Select node account..."}
                                    className={cn(
                                        "w-full pl-28 pr-10 py-8 rounded-[36px] bg-white/2 border border-white/5 focus:border-primary/50 focus:bg-white/5 focus:outline-none transition-all font-bold text-sm leading-relaxed tracking-wider",
                                        type === 'SELL' ? "cursor-pointer" : ""
                                    )}
                                />
                                <AnimatePresence>
                                    {showWalletDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                            className="absolute top-full left-0 right-0 mt-4 bg-black/95 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-2xl z-50 overflow-hidden"
                                        >
                                            <div className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20 bg-white/5 flex items-center justify-between">
                                                <span>Saved Addresses</span>
                                                <div className="h-1 w-8 bg-primary rounded-full" />
                                            </div>

                                            <div className="max-h-72 overflow-y-auto custom-scrollbar">
                                                {savedWallets.length > 0 ? (
                                                    savedWallets.map((w: SavedWallet) => (
                                                        <button
                                                            key={w.id}
                                                            onClick={() => setReceivingAddress(w.address)}
                                                            className="w-full text-left px-8 py-5 hover:bg-primary/10 group/item transition-all border-b border-white/5 last:border-0"
                                                        >
                                                            <div className="flex items-center justify-between mb-1">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-foreground/20 group-hover/item:text-primary transition-colors">
                                                                        {w.type === 'FIAT' ? (w.network === 'Mobile Money' ? <Smartphone className="h-4 w-4" /> : <Landmark className="h-4 w-4" />) : <Wallet className="h-4 w-4" />}
                                                                    </div>
                                                                    <span className="font-black text-xs uppercase tracking-tight group-hover/item:text-primary transition-colors">{w.name || 'Unknown Node'}</span>
                                                                </div>
                                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-20 group-hover/item:opacity-50">{w.network}</span>
                                                            </div>
                                                            <span className="text-[10px] font-mono text-foreground/30 truncate block pl-11">{w.address}</span>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-10 py-12 text-center space-y-4">
                                                        <p className="text-xs font-bold text-foreground/20 italic tracking-widest uppercase">No localized nodes detected</p>
                                                    </div>
                                                )}
                                            </div>

                                            <a
                                                href={type === 'BUY' ? "/dashboard/wallets?tab=crypto" : "/dashboard/wallets?tab=fiat"}
                                                className="w-full h-20 bg-primary/10 hover:bg-primary/20 text-primary transition-all flex items-center justify-center gap-4 border-t border-white/10"
                                            >
                                                <div className="h-8 w-8 rounded-xl border border-current flex items-center justify-center">
                                                    <Plus className="h-4 w-4 stroke-[3px]" />
                                                </div>
                                                <span className="font-black text-[10px] uppercase tracking-[0.3em]">Register New Node</span>
                                            </a>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Rate Info Block */}
                        <div className="p-10 rounded-[48px] bg-linear-to-br from-white/3 to-transparent border border-white/5 space-y-8 group/info relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 text-primary/5 -rotate-12 group-hover/info:rotate-0 transition-transform duration-1000">
                                <TrendingUp className="h-32 w-32" />
                            </div>

                            <div className="flex justify-between items-center relative z-10">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em]">Temporal Sync</p>
                                    <div className={cn(
                                        "inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-700",
                                        refreshCountdown <= 5 ? "text-amber-500 bg-amber-500/10 border border-amber-500/10" : "text-emerald-500 bg-emerald-500/10 border border-emerald-500/10"
                                    )}>
                                        <RefreshCw className={cn("h-3 w-3", refreshCountdown <= 5 ? "animate-spin" : "")} />
                                        <span>Refresh Cycle: {refreshCountdown}S</span>
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em]">Unit Matrix</p>
                                    <p className="text-xs font-black uppercase tracking-tight text-white/80">
                                        {!displayRate ? (
                                            isLoading ? "Syncing..." : "Offline"
                                        ) : `1 ${asset.id} ≈ ${fiat.symbol}${displayRate.toLocaleString()}`}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5 flex justify-between items-end relative z-10">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em]">Total Settlement</p>
                                    <p className="text-xs font-black text-primary/50 uppercase tracking-[0.2em]">{type === 'BUY' ? 'Inc. Network Fees' : 'Net Liquidity'}</p>
                                </div>
                                <span className="text-4xl font-black text-primary tracking-tighter">
                                    {fiat.symbol}{Number(amountFiat).toLocaleString() || '0.00'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {!isAvailable ? (
                        <div className="p-8 rounded-[32px] bg-rose-500/5 border border-rose-500/20 flex items-center gap-6 text-rose-500 shadow-2xl">
                            <AlertCircle className="h-8 w-8 shrink-0 opacity-50" />
                            <div className="space-y-1">
                                <p className="text-sm font-black uppercase tracking-tight">Zone Offline</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{asset.id} liquidity pool currently depleted.</p>
                            </div>
                        </div>
                    ) : (
                        <button
                            disabled={isSubmitting || !amountFiat || !receivingAddress || !!error}
                            onClick={handleSubmit}
                            className={cn(
                                "w-full py-8 md:py-10 rounded-[36px] text-white font-black text-base md:text-xl uppercase tracking-[0.4em] shadow-2xl transition-all flex items-center justify-center gap-6 group relative overflow-hidden",
                                type === 'BUY' ? "bg-primary shadow-primary/30" : "bg-rose-500 shadow-rose-500/30",
                                (isSubmitting || !amountFiat || !receivingAddress || !!error) ? "opacity-20 grayscale scale-[0.98]" : "hover:scale-[1.02] hover:brightness-110 active:scale-95"
                            )}
                        >
                            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            <span className="relative z-10">{isSubmitting ? 'Processing...' : `Confirm ${asset.id} ${type === 'BUY' ? 'Purchase' : 'Sale'}`}</span>
                            {!isSubmitting && <ArrowRight className="h-7 w-7 relative z-10 group-hover:translate-x-2 transition-transform duration-500" />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
