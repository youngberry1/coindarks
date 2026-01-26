"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
    CheckCircle2,
    Wallet,
    Activity,
    Landmark,
    ArrowUpRight,
    ArrowUpDown,
    Info,
    History,
    Zap,
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
import { Loading } from "@/components/ui/LoadingSpinner";
import { CryptoIcon } from "@/components/CryptoIcon";
import { getCryptoPrecision } from "@/lib/formatters";

export interface AssetMetadata {
    id: string;
    name: string;
    icon: string;
    coingeckoId: string;
}

const FIAT = [
    { id: "GHS", name: "Ghana Cedi", symbol: "GH₵", rate: 16.5, icon: "https://flagcdn.com/w40/gh.png" },
    { id: "NGN", name: "Nigerian Naira", symbol: "₦", rate: 1650, icon: "https://flagcdn.com/w40/ng.png" },
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

const Sparkline = ({ color = "#10B981" }: { color?: string }) => {
    const points = useMemo(() => {
        const values = [40, 35, 45, 30, 55, 40, 60, 45, 70, 50, 65, 40, 55, 35, 50, 30, 45, 35, 50, 40];
        return values.map((y, i) => ({ x: i * 10, y }));
    }, []);
    const pathData = points.reduce((acc, p, i) => acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), "");
    return (
        <svg viewBox="0 0 200 100" className="w-full h-12 opacity-50">
            <motion.path d={pathData} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }} />
        </svg>
    );
};

const MeshBackground = () => (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="mesh" width="30" height="30" patternUnits="userSpaceOnUse" className="sm:w-[40px] sm:h-[40px]">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary/10" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mesh)" />
        </svg>
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/20" />
    </div>
);

interface InputBlockProps {
    assetType: 'FIAT' | 'CRYPTO';
    type: 'BUY' | 'SELL';
    amountFiat: string;
    amountCrypto: string;
    fiat: typeof FIAT[0];
    asset: AssetMetadata;
    handleFiatChange: (val: string) => void;
    handleCryptoChange: (val: string) => void;
    setFiat: (fiat: typeof FIAT[0]) => void;
    setAsset: (asset: AssetMetadata) => void;
    supportedAssets: AssetMetadata[];
    isLoading: boolean;
}

const InputBlock = ({
    assetType,
    type,
    amountFiat,
    amountCrypto,
    fiat,
    asset,
    handleFiatChange,
    handleCryptoChange,
    setFiat,
    setAsset,
    supportedAssets,
    isLoading
}: InputBlockProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const isFiat = assetType === 'FIAT';
    const value = isFiat ? amountFiat : amountCrypto;
    const onChange = isFiat ? handleFiatChange : handleCryptoChange;
    const currentAsset = isFiat ? fiat : asset;

    const setAssetFn = isFiat
        ? (id: string) => setFiat(FIAT.find(f => f.id === id)!)
        : (id: string) => setAsset(supportedAssets.find(a => a.id === id)!);

    const options = isFiat ? FIAT : supportedAssets;

    const isPaying = type === 'BUY' ? isFiat : !isFiat;
    const roleLabel = isPaying ? 'You Pay' : 'You Receive';

    return (
        <motion.div
            layout
            animate={{
                scale: isFocused ? 1.01 : 1,
                borderColor: isFocused ? "rgba(var(--primary), 0.3)" : "rgba(255, 255, 255, 0.05)"
            }}
            className={cn(
                "p-4 sm:p-10 rounded-[24px] sm:rounded-[40px] border transition-all duration-700 group/block relative overflow-hidden",
                !isPaying ? "bg-black/40 shadow-2xl shadow-primary/5" : "bg-white/3 hover:bg-white/5",
                isFocused && "shadow-[0_0_50px_rgba(var(--primary), 0.1)]"
            )}
        >
            <AnimatePresence>
                {isFocused && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0"
                    >
                        <MeshBackground />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-6 mb-8 relative z-10">
                <div className="space-y-1">
                    <span className={cn(
                        "text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] font-mono",
                        isPaying ? "text-white/20" : "text-primary/60"
                    )}>
                        {roleLabel}
                    </span>
                    <div className="h-0.5 w-8 bg-primary/20 rounded-full" />
                </div>
                <AssetSelector value={currentAsset.id} onChange={setAssetFn} options={options} type={assetType} className="h-12 bg-black/60 border-white/5 group-hover/block:border-primary/20 w-full xs:w-auto rounded-2xl" />
            </div>

            <div className="flex flex-col space-y-2 relative z-10">
                <div className="flex items-baseline gap-3 overflow-hidden">
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="0.00"
                        className={cn(
                            "w-full min-w-0 bg-transparent text-2xl sm:text-6xl font-black font-mono outline-none placeholder:text-white/5 tracking-tighter transition-all duration-500",
                            !isPaying ? "text-primary" : "text-white",
                            isFocused ? "translate-x-1" : ""
                        )}
                    />
                    <span className={cn(
                        "text-xl sm:text-3xl font-black font-mono tracking-tighter shrink-0",
                        !isPaying ? "text-primary/20" : "text-white/10"
                    )}>
                        {currentAsset.id}
                    </span>
                </div>
            </div>
            {isLoading && <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-transparent via-primary/40 to-transparent animate-pulse pointer-events-none" />}
        </motion.div>
    );
};

export function TradingForm({ initialInventory, supportedAssets }: TradingFormProps) {
    const router = useRouter();
    const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
    const [asset, setAsset] = useState(supportedAssets[0]);
    const [fiat, setFiat] = useState(FIAT[0]);

    const [isCryptoOnTop, setIsCryptoOnTop] = useState(false);

    const [amountFiat, setAmountFiat] = useState("");
    const [amountCrypto, setAmountCrypto] = useState("");
    const [lastInputType, setLastInputType] = useState<'FIAT' | 'CRYPTO'>('FIAT');

    const [receivingAddress, setReceivingAddress] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [displayRate, setDisplayRate] = useState<number | null>(null);
    const [cachedRates, setCachedRates] = useState<ExchangeRate[]>([]);

    const [orderSuccess, setOrderSuccess] = useState<{
        id: string;
        orderId?: string;
        depositAddress: string | null;
        amounts: { crypto: number, fiat: number }
    } | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [savedWallets, setSavedWallets] = useState<SavedWallet[]>([]);
    const [showWalletDropdown, setShowWalletDropdown] = useState(false);

    useEffect(() => {
        const loadWallets = async () => {
            setSavedWallets([]);
            if (type === 'BUY') {
                const wallets = await getWallets(asset.id);
                setSavedWallets(wallets.map(w => ({ ...w, type: 'CRYPTO' })));
            } else {
                const methods = await getPaymentMethods();
                setSavedWallets(methods.map(m => ({
                    id: m.id,
                    asset: 'FIAT',
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
    const updateRatesCache = useCallback(async () => {
        try {
            const rates = await getExchangeRates();
            setCachedRates(rates);
            setRefreshCountdown(15);
        } catch { }
    }, []);

    useEffect(() => {
        if (!cachedRates.length) return;
        const exactPair = cachedRates.find(r => r.pair === `${asset.id}-${fiat.id}`);
        const usdPair = cachedRates.find(r => r.pair === `${asset.id}-USD` || r.pair === `${asset.id}-USDT`);
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
        const marginMultiplier = type === 'BUY' ? (1 + (currentMargin / 100)) : (1 - (currentMargin / 100));
        setDisplayRate(baseRate * marginMultiplier);
    }, [cachedRates, asset, fiat, type]);

    const isRateMissing = !isLoading && cachedRates.length > 0 && displayRate === null;

    useEffect(() => {
        if (isRateMissing) {
            setAmountFiat("");
            setAmountCrypto("");
        }
    }, [isRateMissing]);

    useEffect(() => {
        setIsLoading(true);
        updateRatesCache().finally(() => setIsLoading(false));
        const priceInterval = setInterval(updateRatesCache, 15000);
        const timerInterval = setInterval(() => {
            setRefreshCountdown(prev => (prev > 0 ? prev - 1 : 15));
        }, 1000);
        return () => { clearInterval(priceInterval); clearInterval(timerInterval); };
    }, [updateRatesCache]);

    const validateAmount = useCallback((fiatVal: number) => {
        if (fiatVal <= 0) {
            setError("Amount must be greater than zero");
            return false;
        }
        const ghsRate = FIAT.find(f => f.id === 'GHS')?.rate || 16.5;
        const minCurrentFiat = (100 / ghsRate) * fiat.rate;
        if (fiatVal < minCurrentFiat) {
            setError(`Minimum amount: ${fiat.symbol}${Math.ceil(minCurrentFiat).toLocaleString()}`);
            return false;
        }
        setError(null);
        return true;
    }, [fiat.rate, fiat.symbol]);

    useEffect(() => {
        if (!displayRate) return;
        if (lastInputType === 'FIAT' && amountFiat) {
            const rawVal = parseFloat(amountFiat);
            const precision = getCryptoPrecision(asset.id);
            if (!isNaN(rawVal)) setAmountCrypto((rawVal / displayRate).toFixed(precision));
        } else if (lastInputType === 'CRYPTO' && amountCrypto) {
            const rawVal = parseFloat(amountCrypto);
            if (!isNaN(rawVal)) setAmountFiat((rawVal * displayRate).toFixed(2));
        }
    }, [displayRate, amountFiat, amountCrypto, lastInputType, asset.id]);

    const handleFiatChange = useCallback((val: string) => {
        if (val.startsWith('-')) return;
        setAmountFiat(val);
        setLastInputType('FIAT');
        if (!val) { setAmountCrypto(""); setError(null); return; }
        const numVal = parseFloat(val);
        if (!isNaN(numVal)) validateAmount(numVal);
        const precision = getCryptoPrecision(asset.id);
        if (displayRate && !isNaN(numVal) && numVal > 0) setAmountCrypto((numVal / displayRate).toFixed(precision));
        else if (numVal <= 0) setAmountCrypto("0.00");
    }, [asset.id, displayRate, validateAmount]);

    const handleCryptoChange = useCallback((val: string) => {
        if (val.startsWith('-')) return;
        setAmountCrypto(val);
        setLastInputType('CRYPTO');
        if (!val) { setAmountFiat(""); setError(null); return; }
        const numVal = parseFloat(val);
        if (displayRate && !isNaN(numVal) && numVal > 0) {
            const fiatVal = numVal * displayRate;
            setAmountFiat(fiatVal.toFixed(2));
            validateAmount(fiatVal);
        } else if (numVal <= 0) {
            setAmountFiat("0.00");
            setError("Amount must be greater than zero");
        }
    }, [displayRate, validateAmount]);

    const toggleSwap = () => setIsCryptoOnTop(!isCryptoOnTop);

    const handleSubmit = async () => {
        if ((!amountFiat && !amountCrypto) || !receivingAddress) {
            toast.error("Required fields missing");
            return;
        }
        if (error) { toast.error(error); return; }
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
                    orderId: result.orderId,
                    depositAddress: result.depositAddress || null,
                    amounts: result.amounts || { crypto: 0, fiat: 0 }
                });
                toast.success("Trade confirmed successfully.");
                if (result.orderId) router.push(`/dashboard/orders/${result.orderId}`);
            } else {
                toast.error(result.error || "Trade execution failed");
            }
        } catch {
            toast.error("Exchange Error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputProps = useMemo(() => ({
        type,
        amountFiat,
        amountCrypto,
        fiat,
        asset,
        handleFiatChange,
        handleCryptoChange,
        setFiat,
        setAsset,
        supportedAssets,
        isLoading
    }), [type, amountFiat, amountCrypto, fiat, asset, handleFiatChange, handleCryptoChange, supportedAssets, isLoading]);

    const assetInfo = initialInventory.find(i => i.symbol === asset.id);
    const isAvailable = assetInfo?.is_active && assetInfo?.stock_status === 'IN STOCK';

    if (orderSuccess) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg bg-card-bg/60 backdrop-blur-3xl border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl space-y-8 mx-auto">
                <div className="text-center space-y-6">
                    <div className="mx-auto h-24 w-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 animate-pulse">
                        <CheckCircle2 className="h-12 w-12" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Order Created</h2>
                        <p className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">ID: {orderSuccess.id}</p>
                    </div>
                </div>
                <div className="bg-black/20 rounded-[28px] p-8 border border-white/5 space-y-6">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                        <span className="text-white/30">Sending</span>
                        <span className="text-white font-mono">{type === 'BUY' ? `${fiat.symbol}${orderSuccess.amounts.fiat.toLocaleString()}` : `${orderSuccess.amounts.crypto} ${asset.id}`}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest border-t border-white/5 pt-6">
                        <span className="text-emerald-500/60">Receiving</span>
                        <span className="text-emerald-500 font-mono italic">{type === 'BUY' ? `${orderSuccess.amounts.crypto} ${asset.id}` : `${fiat.symbol}${orderSuccess.amounts.fiat.toLocaleString()}`}</span>
                    </div>
                </div>
                <div className="space-y-4 pt-4">
                    <Link href={orderSuccess.orderId ? `/dashboard/orders/${orderSuccess.orderId}` : "/dashboard/orders"} className="flex items-center justify-center w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white/60 transition-all">
                        View Order Details
                    </Link>
                    <button onClick={() => { setOrderSuccess(null); setAmountFiat(""); setAmountCrypto(""); }} className="flex items-center justify-center w-full py-5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                        Exchange More
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-12 h-full flex flex-col items-center justify-center">
            <AnimatePresence>{isSubmitting && <Loading message="Processing..." />}</AnimatePresence>

            <div className="relative group w-full">
                <div className="absolute -inset-10 sm:-inset-20 bg-primary/5 rounded-[100px] blur-[120px] opacity-20 pointer-events-none" />

                <div className="relative bg-[#0D0F12]/80 border border-white/5 rounded-[32px] sm:rounded-[56px] p-4 sm:p-8 lg:p-16 shadow-[0_60px_120px_rgba(0,0,0,0.8)] backdrop-blur-3xl overflow-hidden space-y-10 sm:space-y-14">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-10 border-b border-white/5 pb-8 sm:pb-10">
                        <div className="flex bg-black/60 p-1.5 sm:p-2 rounded-2xl border border-white/5 shadow-inner w-full sm:w-auto">
                            <button onClick={() => setType('BUY')} className={cn("flex-1 sm:flex-none px-6 sm:px-12 py-3 sm:py-4 rounded-xl text-[10px] font-black uppercase tracking-widest sm:tracking-[0.3em] transition-all duration-500 font-mono", type === 'BUY' ? "bg-primary text-black shadow-[0_0_30px_rgba(var(--primary), 0.3)]" : "text-white/20 hover:text-white/40")}>Buy</button>
                            <button onClick={() => setType('SELL')} className={cn("flex-1 sm:flex-none px-6 sm:px-12 py-3 sm:py-4 rounded-xl text-[10px] font-black uppercase tracking-widest sm:tracking-[0.3em] transition-all duration-500 font-mono", type === 'SELL' ? "bg-primary text-black shadow-[0_0_30px_rgba(var(--primary), 0.3)]" : "text-white/20 hover:text-white/40")}>Sell</button>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="text-right hidden xs:block space-y-1">
                                <div className="text-xs font-mono text-primary font-black tracking-widest">${displayRate?.toLocaleString()}</div>
                                <div className="text-[8px] font-black text-white/10 uppercase tracking-[0.4em] font-mono">Current Spot Rate</div>
                            </div>
                            <div className="h-10 w-px bg-white/5" />
                            <div className="relative h-12 w-12 flex items-center justify-center">
                                <svg className="h-12 w-12 -rotate-90">
                                    <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/5" />
                                    <motion.circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="132" animate={{ strokeDashoffset: (132 * refreshCountdown) / 15 }} className="text-primary" />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black font-mono text-primary">{refreshCountdown}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black/40 rounded-[32px] p-4 sm:p-8 border border-white/5 space-y-4 relative group/spark overflow-hidden">
                        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-8 w-8 relative bg-black rounded-full p-1.5 border border-white/5 shadow-inner">
                                    <CryptoIcon symbol={asset.id} iconUrl={asset.icon} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest sm:tracking-[0.3em] text-white/20 font-mono truncate">Live Market: {asset.name}</span>
                            </div>
                            <div className="self-start xs:self-center px-4 py-1.5 bg-primary/5 rounded-full border border-primary/10 flex items-center gap-2">
                                <Zap className="h-3 w-3 text-primary animate-pulse" />
                                <span className="text-[9px] font-black text-primary uppercase font-mono tracking-widest">Online</span>
                            </div>
                        </div>
                        <Sparkline />
                    </div>

                    <div className="space-y-6 relative">
                        <motion.div className="flex flex-col space-y-6">
                            {(isCryptoOnTop ? ["CRYPTO", "FIAT"] as const : ["FIAT", "CRYPTO"] as const).map((blockType) => (
                                <InputBlock
                                    key={blockType}
                                    assetType={blockType}
                                    {...inputProps}
                                />
                            ))}
                        </motion.div>

                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                            <button onClick={toggleSwap} className="h-20 w-20 rounded-full bg-[#0D0F12] border border-white/10 flex items-center justify-center shadow-[0_30px_60px_rgba(0,0,0,0.9)] hover:border-primary/50 hover:scale-110 active:scale-90 transition-all duration-500 group/swap cursor-pointer">
                                <motion.div animate={{ rotate: isCryptoOnTop ? 180 : 0 }}>
                                    <ArrowUpDown className="h-8 w-8 text-primary/60 group-hover/swap:text-primary transition-colors" />
                                </motion.div>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-12 group/terminal">
                        <div className="relative group/address flex items-center h-24 sm:h-28">
                            <div className="absolute left-6 sm:left-10 text-white/20 group-hover/address:text-primary/60 transition-colors animate-pulse z-10 pointer-events-none flex items-center justify-center h-full">
                                {type === 'BUY' ? <Wallet className="h-6 w-6 sm:h-8 sm:w-8" /> : <Landmark className="h-6 w-6 sm:h-8 sm:w-8" />}
                            </div>
                            <input
                                value={receivingAddress}
                                readOnly
                                onFocus={() => setShowWalletDropdown(true)}
                                onBlur={() => setTimeout(() => setShowWalletDropdown(false), 200)}
                                placeholder={type === 'BUY' ? "Select Wallet Address" : "Select Payout Account"}
                                className={cn(
                                    "w-full h-full bg-black/60 border border-white/5 rounded-[32px] sm:rounded-[40px] pl-[60px] sm:pl-[100px] pr-10 text-[9px] sm:text-xs font-black uppercase tracking-widest sm:tracking-[0.4em] font-mono placeholder:text-white/10 transition-all text-white cursor-pointer hover:bg-black/90",
                                    !receivingAddress && "border-primary/20 shadow-[0_0_40px_rgba(var(--primary), 0.05)] text-white/40"
                                )}
                            />
                            <AnimatePresence>
                                {showWalletDropdown && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-[110%] left-0 right-0 bg-[#0A0C0E] border border-white/10 rounded-[40px] shadow-[0_60px_120px_rgba(0,0,0,1)] z-100 overflow-hidden backdrop-blur-4xl p-3 gap-2 flex flex-col">
                                        {savedWallets.length > 0 ? (
                                            <>
                                                <div className="p-5 px-8 text-[9px] font-black uppercase tracking-[0.5em] text-white/10 font-mono">Saved Accounts</div>
                                                {savedWallets.map(w => (
                                                    <button key={w.id} onMouseDown={() => setReceivingAddress(w.address)} className="w-full text-left p-6 hover:bg-white/5 rounded-3xl transition-all group/wallet flex items-center justify-between border border-transparent hover:border-white/5">
                                                        <div className="space-y-2">
                                                            <div className="font-black text-xs text-white group-hover/wallet:text-primary transition-colors font-mono tracking-widest">{w.name}</div>
                                                            <div className="text-[10px] font-mono text-white/20 truncate max-w-[200px] sm:max-w-md uppercase tracking-wider">{w.address}</div>
                                                        </div>
                                                        <ArrowUpRight className="h-5 w-5 text-white/5 group-hover/wallet:text-primary transition-all group-hover/wallet:translate-x-1.5 group-hover/wallet:-translate-y-1.5" />
                                                    </button>
                                                ))}
                                                <Link href={type === 'BUY' ? '/dashboard/wallets' : '/dashboard/wallets?tab=fiat'} className="w-full p-8 bg-primary/5 hover:bg-primary/10 rounded-3xl text-primary text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all font-mono">
                                                    <Plus size={18} /> ADD NEW ACCOUNT
                                                </Link>
                                            </>
                                        ) : (
                                            <div className="p-16 text-center space-y-10 min-h-[300px] flex flex-col items-center justify-center">
                                                <div className="space-y-3">
                                                    <Info className="h-12 w-12 text-white/5 mx-auto" />
                                                    <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em] font-mono">NO SAVED ACCOUNTS FOUND</p>
                                                </div>
                                                <Link href={type === 'BUY' ? '/dashboard/wallets' : '/dashboard/wallets?tab=fiat'} className="inline-flex items-center gap-6 px-12 py-6 bg-primary/10 border border-primary/20 rounded-2xl text-primary text-[10px] font-black uppercase tracking-[0.4em] hover:bg-primary/20 transition-all font-mono">MANAGE ACCOUNTS</Link>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="pt-4 px-2">
                        {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10 p-8 rounded-3xl bg-red-500/5 border border-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-[0.4em] text-center italic font-mono animate-pulse">{error}</motion.div>}

                        {!isAvailable || isRateMissing ? (
                            <button disabled className="w-full h-32 rounded-[48px] bg-white/5 border border-white/5 text-white/5 font-black text-sm uppercase tracking-[0.6em] cursor-not-allowed italic font-mono">OFFLINE</button>
                        ) : (
                            <button onClick={handleSubmit} disabled={isSubmitting || !!error || (!amountFiat && !amountCrypto) || !receivingAddress || !displayRate} className="w-full h-32 rounded-[56px] bg-primary text-black font-black text-lg uppercase tracking-[0.4em] transition-all duration-700 shadow-[0_30px_90px_rgba(var(--primary), 0.3)] hover:bg-primary/90 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-8 group/btn font-mono">
                                {isSubmitting ? "SYNCING..." : <>CONFIRM EXCHANGE <ArrowUpRight className="h-8 w-8 group-hover/btn:translate-x-2 group-hover/btn:-translate-y-2 transition-transform duration-500" /></>}
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-10 pt-10 border-t border-white/5">
                        <div className="flex items-center gap-8">
                            <Link href="/dashboard/orders" className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-white transition-all group/link font-mono">
                                <History className="h-4 w-4 group-hover/link:-rotate-45 transition-transform" /> TRADE HISTORY
                            </Link>
                            <div className="h-5 w-px bg-white/10" />
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 animate-pulse font-mono">
                                <Activity className="h-4 w-4" /> SYSTEM ONLINE
                            </div>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/5 italic font-mono">PROTECTED BY ENCRYPTION</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
