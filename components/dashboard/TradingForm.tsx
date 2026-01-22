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
    Plus
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
        console.log("Submit clicked. Validating...", { amountFiat, amountCrypto, receivingAddress });
        if ((!amountFiat && !amountCrypto) || !receivingAddress) {
            console.log("Validation failed: Missing fields");
            toast.error("Please fill in all fields");
            return;
        }

        // Validation logic is handled by validateAmount and error state check below.

        // Let's rely on validateAmount state if possible, or re-run.
        // We have `error` state.
        if (error) {
            console.log("Validation failed: Error state present", error);
            toast.error(error);
            return;
        }

        setIsSubmitting(true);
        console.log("Calling createOrder...");

        try {
            // We send the RAW input user typed. Server recalculates everything.
            const inputVal = lastInputType === 'FIAT' ? Number(amountFiat) : Number(amountCrypto);

            console.log("Calling createOrder with data:", {
                type,
                asset: asset.id,
                amount_input: inputVal,
                input_type: lastInputType,
                fiat_currency: fiat.id,
                receiving_address: receivingAddress
            });

            const result = await createOrder({
                type,
                asset: asset.id,
                amount_input: inputVal,
                input_type: lastInputType,
                fiat_currency: fiat.id,
                receiving_address: receivingAddress
            });

            console.log("createOrder result:", result);

            if (result.success) {
                console.log("Order success! Setting state...");
                setOrderSuccess({
                    id: result.orderNumber!,
                    depositAddress: result.depositAddress || null,
                    amounts: result.amounts || { crypto: 0, fiat: 0 }
                });
                toast.success("Order initiated!");
            } else {
                console.error("Order failed:", result.error);
                toast.error(result.error || "Order creation failed");
            }
        } catch (err) {
            console.error("Exception in handleSubmit:", err);
            toast.error("Failed to submit order");
        } finally {
            console.log("Setting isSubmitting to false");
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
                className="p-8 md:p-12 rounded-[40px] border border-white/5 bg-card-bg/50 backdrop-blur-xl text-center space-y-8"
            >
                <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 border-4 border-emerald-500/20 animate-pulse">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-3xl font-black">Trade Initiated!</h2>
                    <p className="text-foreground/50 font-medium">Order <span className="text-primary font-mono font-bold">#{orderSuccess.id}</span> created.</p>
                </div>

                <div className="bg-black/20 p-6 rounded-3xl border border-white/10 space-y-4 text-left max-w-md mx-auto">
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4 pb-4 border-b border-white/5">
                        <div>
                            <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">Date</p>
                            <p className="font-bold">{new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">Time</p>
                            <p className="font-bold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">You Pay</p>
                            <p className="font-bold text-primary">{type === 'BUY' ? `${fiat.symbol}${orderSuccess.amounts.fiat}` : `${orderSuccess.amounts.crypto} ${asset.id}`}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">You Get</p>
                            <p className="font-bold text-emerald-500">{type === 'BUY' ? `${orderSuccess.amounts.crypto} ${asset.id}` : `${fiat.symbol}${orderSuccess.amounts.fiat}`}</p>
                        </div>
                    </div>

                    {orderSuccess.depositAddress ? (
                        <>
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Action Required</p>
                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                                    <p className="text-xs text-amber-500 font-bold">1. Send EXACTLY <span className="text-foreground">{type === 'BUY' ? `${fiat.symbol}${orderSuccess.amounts.fiat}` : `${orderSuccess.amounts.crypto} ${asset.id}`}</span></p>
                                    <p className="text-[10px] text-amber-500/80 font-medium">Sending a different amount may delay your order.</p>
                                </div>
                                {type === 'BUY' && (
                                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-500 space-y-1">
                                        <p className="text-xs font-bold">2. Use Reference: <span className="text-white font-mono">{orderSuccess.id}</span></p>
                                        <p className="text-[10px] text-blue-500/80 font-medium">Add this as the &quot;Note&quot; or &quot;Remarks&quot; in your bank app.</p>
                                    </div>
                                )}
                                {type === 'SELL' && (
                                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-500 space-y-1">
                                        <p className="text-xs font-bold">2. Use High/Priority Gas Fee</p>
                                        <p className="text-[10px] text-blue-500/80 font-medium">Increase your network fee to ensure the transaction hits the blockchain instantly.</p>
                                    </div>
                                )}
                                <p className="text-xs font-bold pt-2">{type === 'BUY' ? 'Payment Account Details:' : 'Send Wallet Address:'}</p>
                            </div>
                            <button
                                type="button"
                                className="flex items-center gap-3 p-4 bg-black/40 rounded-2xl border border-white/5 group cursor-pointer w-full"
                                onClick={() => copyToClipboard(orderSuccess.depositAddress!)}
                                aria-label="Copy deposit address"
                            >
                                <p className="font-mono text-xs break-all text-foreground/80 flex-1 text-left whitespace-pre-line">{orderSuccess.depositAddress}</p>
                                <Copy className="h-4 w-4 text-foreground/20 group-hover:text-primary transition-colors" />
                            </button>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                                Payment Instructions Sent to <span className="text-primary">your email</span>
                            </p>
                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 text-amber-500 text-xs font-bold leading-relaxed">
                                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                                <p>Please wait up to 30 minutes for processing. If not received, contact support immediatey.</p>
                            </div>
                        </div>
                    )}

                    {type === 'SELL' && (
                        <p className="text-[10px] text-foreground/40 leading-relaxed">
                            <Info className="h-3 w-3 inline mr-1" />
                            Once confirmed, we release fiat to your account.
                        </p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <a href={`/dashboard/orders`} className="px-10 py-4 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                        Track Order
                    </a>
                    <button onClick={() => { setOrderSuccess(null); setAmountFiat(""); setAmountCrypto(""); }} className="px-10 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all">
                        New Trade
                    </button>
                </div>
            </motion.div>
        );
    }

    // FORM VIEW
    return (
        <div className="p-6 md:p-10 lg:p-14 rounded-[40px] border border-border bg-card-bg/50 backdrop-blur-xl shadow-sm dark:shadow-none">
            <AnimatePresence>
                {isSubmitting && (
                    <Loading message="Securing exchange rate..." />
                )}
            </AnimatePresence>

            <div className="flex p-1.5 rounded-2xl bg-card-bg/50 border border-border mb-8 md:mb-12 w-full sm:w-max shadow-inner dark:shadow-none">
                <button
                    onClick={() => setType('BUY')}
                    className={cn(
                        "flex-1 sm:flex-none px-6 md:px-10 py-3.5 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest transition-all",
                        type === 'BUY' ? "bg-primary text-white shadow-lg" : "text-foreground/40 hover:text-foreground"
                    )}
                >
                    Buy
                </button>
                <button
                    onClick={() => setType('SELL')}
                    className={cn(
                        "flex-1 sm:flex-none px-6 md:px-10 py-3.5 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest transition-all",
                        type === 'SELL' ? "bg-rose-500 text-white shadow-lg" : "text-foreground/40 hover:text-foreground"
                    )}
                >
                    Sell
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14">
                <div className="space-y-6 md:space-y-8">
                    {/* INPUT BLOCK 1 */}
                    <div className="space-y-6">
                        <div className="p-8 md:p-10 rounded-[32px] bg-card-bg/40 border border-border focus-within:border-primary/50 focus-within:bg-card-bg/60 transition-all shadow-sm dark:shadow-none relative overflow-hidden">
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">{type === 'BUY' ? 'You Pay' : 'You Send'}</p>
                                <div className="flex items-center gap-2">
                                    {type === 'BUY' ? (
                                        <AssetSelector value={fiat.id} onChange={(val) => setFiat(FIAT.find(f => f.id === val)!)} options={FIAT} type="FIAT" />
                                    ) : (
                                        <AssetSelector value={asset.id} onChange={(val) => setAsset(supportedAssets.find(a => a.id === val)!)} options={supportedAssets} type="CRYPTO" />
                                    )}
                                </div>
                            </div>
                            <div className="flex items-end justify-between gap-4 relative z-10">
                                <input
                                    id="pay-amount"
                                    type="number"
                                    value={type === 'BUY' ? amountFiat : amountCrypto}
                                    onChange={(e) => type === 'BUY' ? handleFiatChange(e.target.value) : handleCryptoChange(e.target.value)}
                                    placeholder="0.00"
                                    aria-label={type === 'BUY' ? 'Amount to pay in fiat' : 'Amount to send in crypto'}
                                    className={cn(
                                        "bg-transparent text-2xl md:text-4xl font-black outline-none w-full placeholder:text-foreground/10 transition-colors",
                                        error && type === 'BUY' ? "text-rose-500" : ""
                                    )}
                                />
                            </div>
                            {error && type === 'BUY' && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-rose-500 text-xs font-bold mt-2 absolute bottom-2"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </div>

                        <div className="flex justify-center -my-9 relative z-10">
                            <div className="h-14 w-14 rounded-2xl bg-card-bg border border-border flex items-center justify-center shadow-2xl text-primary">
                                <ArrowDown className="h-6 w-6" />
                            </div>
                        </div>

                        {/* INPUT BLOCK 2 */}
                        <div className="p-8 md:p-10 rounded-[32px] bg-card-bg/40 border border-border focus-within:border-primary/50 focus-within:bg-card-bg/60 transition-all shadow-sm dark:shadow-none">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">{type === 'BUY' ? 'You Receive' : 'You Get Paid'}</p>
                                <div className="flex items-center gap-2">
                                    {type === 'BUY' ? (
                                        <AssetSelector value={asset.id} onChange={(val) => setAsset(supportedAssets.find(a => a.id === val)!)} options={supportedAssets} type="CRYPTO" />
                                    ) : (
                                        <AssetSelector value={fiat.id} onChange={(val) => setFiat(FIAT.find(f => f.id === val)!)} options={FIAT} type="FIAT" />
                                    )}
                                </div>
                            </div>
                            <div className="flex items-end justify-between gap-4">
                                <input
                                    id="receive-amount"
                                    type="number"
                                    value={type === 'BUY' ? amountCrypto : amountFiat}
                                    onChange={(e) => type === 'BUY' ? handleCryptoChange(e.target.value) : handleFiatChange(e.target.value)}
                                    placeholder="0.00"
                                    readOnly={true}
                                    aria-label={type === 'BUY' ? 'Estimated crypto to receive' : 'Estimated fiat to receive'}
                                    className="bg-transparent text-2xl md:text-3xl font-black outline-none w-full placeholder:text-foreground/10 cursor-default"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8 flex flex-col justify-between">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-2">
                                {type === 'BUY' ? `${asset.id} Receiving Address` : `Your ${fiat.id} Payment Details`}
                            </label>
                            <div className="relative group">
                                <Wallet className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    value={receivingAddress}
                                    onChange={(e) => type !== 'SELL' && setReceivingAddress(e.target.value)}
                                    readOnly={type === 'SELL'}
                                    onFocus={() => setShowWalletDropdown(true)}
                                    // Delay blur to allow clicking items
                                    onBlur={() => setTimeout(() => setShowWalletDropdown(false), 200)}
                                    placeholder={type === 'BUY' ? `Enter your ${asset.id} wallet...` : "Select a saved account..."}
                                    className={cn(
                                        "w-full pl-16 pr-6 py-5 rounded-[24px] bg-card-bg/30 border border-border focus:border-primary focus:bg-card-bg/50 focus:outline-none transition-all font-bold text-sm shadow-inner dark:shadow-none",
                                        type === 'SELL' ? "cursor-pointer hover:bg-card-bg/40 selection:bg-transparent" : ""
                                    )}
                                />
                                <AnimatePresence>
                                    {showWalletDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto"
                                        >
                                            <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground/30 bg-white/5">
                                                {type === 'BUY' ? 'Saved Wallets' : 'Saved Accounts'}
                                            </div>

                                            {savedWallets.length > 0 ? (
                                                savedWallets.map((w: SavedWallet) => (
                                                    <button
                                                        key={w.id}
                                                        onClick={() => setReceivingAddress(w.address)}
                                                        className="w-full text-left px-4 py-3 hover:bg-primary/20 hover:text-primary text-sm font-medium flex flex-col gap-0.5 transition-colors border-b border-white/5 last:border-0"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {w.type === 'FIAT' && (w.network === 'Mobile Money' ? <Smartphone className="h-3 w-3" /> : <Landmark className="h-3 w-3" />)}
                                                            <span className="font-bold">{w.name || 'Unnamed'}</span>
                                                        </div>
                                                        <span className="text-[10px] font-mono opacity-50 truncate w-full block">{w.address}</span>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-5 py-8 text-center space-y-2">
                                                    <p className="text-xs font-bold text-foreground/40 italic">No saved {type === 'BUY' ? 'wallets' : 'accounts'} found.</p>
                                                </div>
                                            )}

                                            {/* Add New Option */}
                                            <a
                                                href={type === 'BUY' ? "/dashboard/wallets?tab=crypto" : "/dashboard/wallets?tab=fiat"}
                                                className="w-full text-left px-4 py-4 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors sticky bottom-0 backdrop-blur-2xl border-t border-white/10"
                                            >
                                                <div className="h-5 w-5 rounded-full border-2 border-current flex items-center justify-center">
                                                    <Plus className="h-3 w-3 stroke-[3px]" />
                                                </div>
                                                Add New {type === 'BUY' ? 'Wallet' : 'Account'}
                                            </a>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="p-8 rounded-[32px] bg-linear-to-br from-primary/5 to-transparent border border-border space-y-6 shadow-sm dark:shadow-none">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-foreground/40 font-medium">Global Market Rate</span>
                                    <div className={cn(
                                        "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all duration-500",
                                        refreshCountdown <= 5
                                            ? "bg-amber-500/10 border-amber-500/20 text-amber-500 animate-pulse"
                                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                    )}>
                                        <div className={cn(
                                            "h-1.5 w-1.5 rounded-full bg-current",
                                            refreshCountdown <= 5 ? "animate-ping" : ""
                                        )} />
                                        Refreshing in {refreshCountdown}s
                                    </div>
                                </div>
                                <span className="font-bold">
                                    {!displayRate ? (
                                        isLoading ? <span className="text-foreground/20 text-xs text-gradient animate-pulse tracking-widest uppercase">Syncing...</span> : <span className="text-rose-500 text-xs">Rate unavailable</span>
                                    ) : `1 ${asset.id} ≈ ${fiat.symbol}${displayRate.toLocaleString()}`}
                                </span>
                            </div>
                            <div className="pt-6 border-t border-border flex justify-between items-center">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground/40">Estimated Total</span>
                                <span className="text-2xl font-black text-primary">
                                    {fiat.symbol}{Number(amountFiat).toLocaleString() || '0.00'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {!isAvailable ? (
                        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-500">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p className="text-xs font-bold">{asset.id} currently unavailable.</p>
                        </div>
                    ) : (
                        <button
                            disabled={isSubmitting || !amountFiat || !receivingAddress || !!error}
                            onClick={handleSubmit}
                            className={cn(
                                "w-full py-6 rounded-[24px] text-white font-black text-lg uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 group",
                                type === 'BUY' ? "bg-primary shadow-primary/20 hover:scale-[1.02]" : "bg-rose-500 shadow-rose-500/20 hover:scale-[1.02]",
                                (isSubmitting || !amountFiat || !receivingAddress || !!error) && "opacity-50 grayscale cursor-not-allowed scale-100"
                            )}
                        >
                            {isSubmitting ? 'Processing...' : `Confirm ${type === 'BUY' ? 'Purchase' : 'Sale'}`}
                            {!isSubmitting && <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
