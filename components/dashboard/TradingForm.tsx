"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
    CheckCircle2,
    Wallet,
    ArrowDown,
    Landmark,
    ArrowUpRight
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

// Simple Sparkline Component for visual fidelity
const Sparkline = ({ color = "#10B981" }: { color?: string }) => {
    const points = useMemo(() => {
        // Deterministic decorative points for stability
        const values = [40, 35, 45, 30, 55, 40, 60, 45, 70, 50, 65, 40, 55, 35, 50, 30, 45, 35, 50, 40];
        return values.map((y, i) => ({
            x: i * 10,
            y
        }));
    }, []);

    const pathData = points.reduce((acc, p, i) =>
        acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), ""
    );

    return (
        <svg viewBox="0 0 200 100" className="w-full h-12 opacity-50">
            <motion.path
                d={pathData}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            />
        </svg>
    );
};

export function TradingForm({ initialInventory, supportedAssets }: TradingFormProps) {
    const router = useRouter();
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
        id: string; // The human-readable ID (e.g. CD-...)
        orderId?: string; // The UUID for navigation
        depositAddress: string | null;
        amounts: { crypto: number, fiat: number }
    } | null>(null);

    // Validation State
    const [error, setError] = useState<string | null>(null);

    // Wallet State
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
        const marginMultiplier = type === 'BUY'
            ? (1 + (currentMargin / 100))
            : (1 - (currentMargin / 100));

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

        return () => {
            clearInterval(priceInterval);
            clearInterval(timerInterval);
        };
    }, [updateRatesCache]);

    const validateAmount = (fiatVal: number) => {
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
    };

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

    const handleFiatChange = (val: string) => {
        if (val.startsWith('-')) return;
        setAmountFiat(val);
        setLastInputType('FIAT');
        if (!val) { setAmountCrypto(""); setError(null); return; }
        const numVal = parseFloat(val);
        if (!isNaN(numVal)) validateAmount(numVal);
        const precision = getCryptoPrecision(asset.id);
        if (displayRate && !isNaN(numVal) && numVal > 0) setAmountCrypto((numVal / displayRate).toFixed(precision));
        else if (numVal <= 0) setAmountCrypto("0.00");
    };

    const handleCryptoChange = (val: string) => {
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
    };

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
                // Redirect immediately to the order details page
                if (result.orderId) {
                    router.push(`/dashboard/orders/${result.orderId}`);
                }
            } else {
                toast.error(result.error || "Trade execution failed");
            }
        } catch {
            toast.error("Exchange Error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const assetInfo = initialInventory.find(i => i.symbol === asset.id);
    const isAvailable = assetInfo?.is_active && assetInfo?.stock_status === 'IN STOCK';

    if (orderSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-4xl bg-[#16191E] border border-white/5 rounded-[2.5rem] p-8 md:p-14 shadow-2xl space-y-8"
            >
                <div className="text-center space-y-6">
                    <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">Exchange Started</h2>
                        <p className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">TRADE NUMBER: {orderSuccess.id}</p>
                    </div>
                </div>

                <div className="bg-[#0D0F12] rounded-2xl p-6 border border-white/5 space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-white/30 uppercase tracking-widest">You Send</span>
                        <span className="text-white font-mono">{type === 'BUY' ? `${fiat.symbol}${orderSuccess.amounts.fiat.toLocaleString()}` : `${orderSuccess.amounts.crypto} ${asset.id}`}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold border-t border-white/5 pt-4">
                        <span className="text-primary/50 uppercase tracking-widest">Estimated Receive</span>
                        <span className="text-primary font-mono italic">{type === 'BUY' ? `${orderSuccess.amounts.crypto} ${asset.id}` : `${fiat.symbol}${orderSuccess.amounts.fiat.toLocaleString()}`}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <Link href={orderSuccess.orderId ? `/dashboard/orders/${orderSuccess.orderId}` : "/dashboard/orders"} className="flex items-center justify-center w-full py-5 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] text-white/60 hover:text-white hover:bg-white/10 transition-all">
                        View Trade Details
                    </Link>
                    <button onClick={() => { setOrderSuccess(null); setAmountFiat(""); setAmountCrypto(""); }} className="flex items-center justify-center w-full py-5 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        New Trade
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="w-full max-w-4xl space-y-6">
            <AnimatePresence>
                {isSubmitting && <Loading message="Processing your trade..." />}
            </AnimatePresence>

            {/* Trading Core */}
            <div className="bg-[#16191E]/95 border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden group">
                {/* Decorative Edge Glow */}
                <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />

                <div className="space-y-8">
                    {/* Header: Toggle & Stats */}
                    <div className="flex flex-col xs:flex-row items-center justify-between gap-6">
                        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 w-full xs:w-auto overflow-hidden">
                            <button
                                onClick={() => setType('BUY')}
                                className={cn(
                                    "flex-1 xs:flex-none px-3 sm:px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest sm:tracking-[0.2em] transition-all whitespace-nowrap",
                                    type === 'BUY' ? "bg-primary text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "text-white/30 hover:text-white/60"
                                )}
                            >Buy Crypto</button>
                            <button
                                onClick={() => setType('SELL')}
                                className={cn(
                                    "flex-1 xs:flex-none px-3 sm:px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest sm:tracking-[0.2em] transition-all whitespace-nowrap",
                                    type === 'SELL' ? "bg-primary text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "text-white/30 hover:text-white/60"
                                )}
                            >Sell Crypto</button>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-primary/50 uppercase tracking-widest tabular-nums">{refreshCountdown}S</span>
                                <span className="text-[8px] font-bold text-white/10 uppercase italic">Update</span>
                            </div>
                        </div>
                    </div>

                    {/* Integrated Price Visualization */}
                    <div className="bg-white/3 rounded-2xl p-4 border border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-6 w-6 relative shrink-0">
                                    <CryptoIcon symbol={asset.id} iconUrl={asset.icon} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Live {asset.id} Feed</span>
                            </div>
                            <span className="text-[10px] font-mono text-primary font-bold flex items-center gap-1">
                                <ArrowUpRight className="h-3 w-3" />
                                2.45%
                            </span>
                        </div>
                        <Sparkline />
                    </div>

                    <div className="space-y-3 relative">
                        {/* Block 1: Input */}
                        <div className="bg-white/3 rounded-3xl p-6 sm:p-8 border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 mb-6">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Choose Currency</span>
                                <AssetSelector
                                    value={type === 'BUY' ? fiat.id : asset.id}
                                    onChange={(val) => type === 'BUY' ? setFiat(FIAT.find(f => f.id === val)!) : setAsset(supportedAssets.find(a => a.id === val)!)}
                                    options={type === 'BUY' ? FIAT : supportedAssets}
                                    type={type === 'BUY' ? "FIAT" : "CRYPTO"}
                                    className="h-10 bg-black/20 border-white/5 hover:border-primary/30 w-full xs:w-auto"
                                />
                            </div>
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-baseline gap-2 overflow-hidden">
                                    <input
                                        type="number"
                                        value={type === 'BUY' ? amountFiat : amountCrypto}
                                        onChange={(e) => type === 'BUY' ? handleFiatChange(e.target.value) : handleCryptoChange(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full min-w-0 bg-transparent text-2xl sm:text-4xl md:text-5xl font-black outline-none placeholder:text-white/5 text-white tracking-tighter"
                                    />
                                    <span className="text-lg sm:text-2xl font-black text-white/20 tracking-tighter shrink-0">{type === 'BUY' ? fiat.id : asset.id}</span>
                                </div>
                                <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest">Initial Amount</span>
                            </div>
                        </div>

                        {/* Mid Divider Arrow */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden sm:block">
                            <div className="h-12 w-12 rounded-full bg-[#16191E] border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                                <ArrowDown className="h-4 w-4 text-primary" />
                            </div>
                        </div>

                        {/* Block 2: Output */}
                        <div className="bg-white/3 rounded-3xl p-6 sm:p-8 border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 mb-6">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">You Receive</span>
                                <AssetSelector
                                    value={type === 'BUY' ? asset.id : fiat.id}
                                    onChange={(val) => type === 'BUY' ? setAsset(supportedAssets.find(a => a.id === val)!) : setFiat(FIAT.find(f => f.id === val)!)}
                                    options={type === 'BUY' ? supportedAssets : FIAT}
                                    type={type === 'BUY' ? "CRYPTO" : "FIAT"}
                                    className="h-10 bg-black/20 border-white/5 hover:border-primary/30 w-full xs:w-auto"
                                />
                            </div>
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-baseline gap-2 overflow-hidden">
                                    <input
                                        type="number"
                                        value={type === 'BUY' ? amountCrypto : amountFiat}
                                        readOnly
                                        placeholder="0.00"
                                        className="w-full min-w-0 bg-transparent text-2xl sm:text-4xl md:text-5xl font-black outline-none placeholder:text-white/5 text-primary tracking-tighter"
                                    />
                                    <span className="text-lg sm:text-2xl font-black text-primary/20 tracking-tighter shrink-0">{type === 'BUY' ? asset.id : fiat.id}</span>
                                </div>
                                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                                    <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest">Expected Result</span>
                                    <span className="text-[10px] font-mono text-primary/50 font-bold bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">
                                        {isLoading ? "REFRESHING..." : `RATE: ${displayRate?.toLocaleString() ?? '---'}`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Destination Input */}
                    <div className="space-y-4">
                        <div className="relative group/address">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20">
                                {type === 'BUY' ? <Wallet className="h-5 w-5" /> : <Landmark className="h-5 w-5" />}
                            </div>
                            <input
                                value={receivingAddress}
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                onChange={(e) => { }} // Disabled manual entry
                                readOnly={true} // Always force selection
                                onFocus={() => setShowWalletDropdown(true)}
                                onBlur={() => setTimeout(() => setShowWalletDropdown(false), 200)}
                                placeholder={type === 'BUY' ? `Select saved ${asset.id} wallet...` : "Select bank account or mobile money..."}
                                className={cn(
                                    "w-full h-16 bg-white/3 border border-white/5 rounded-3xl pl-16 pr-6 text-[11px] font-black uppercase tracking-widest placeholder:text-white/10 focus:outline-none focus:border-primary/30 transition-all text-white cursor-pointer",
                                    !receivingAddress && "animate-pulse border-primary/20"
                                )}
                            />

                            <AnimatePresence>
                                {showWalletDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute bottom-full left-0 right-0 mb-4 bg-[#16191E] border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto"
                                    >
                                        {savedWallets.length > 0 ? (
                                            <>
                                                <div className="p-4 border-b border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                                                    {type === 'BUY' ? 'Saved Wallets' : 'Saved Accounts'}
                                                </div>
                                                {savedWallets.map(w => (
                                                    <button key={w.id} onMouseDown={() => setReceivingAddress(w.address)} className="w-full text-left p-5 hover:bg-white/5 transition-colors border-b border-white/5 group/wallet">
                                                        <div className="font-black text-[10px] text-white/60 group-hover/wallet:text-primary transition-colors uppercase tracking-widest">{w.name}</div>
                                                        <div className="text-[10px] font-mono text-white/20 mt-1 truncate">{w.address}</div>
                                                    </button>
                                                ))}
                                                <Link
                                                    href={type === 'BUY' ? '/dashboard/wallets' : '/dashboard/wallets?tab=fiat'}
                                                    className="w-full text-center p-5 hover:bg-primary/5 transition-colors border-t border-white/5 text-primary text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                                                >
                                                    <ArrowUpRight className="h-3 w-3" />
                                                    {type === 'BUY' ? 'Add New Wallet' : 'Add Payment Method'}
                                                </Link>
                                            </>
                                        ) : (
                                            <div className="p-8 text-center space-y-4">
                                                <div className="text-[10px] text-white/40 font-medium leading-relaxed">
                                                    {type === 'BUY'
                                                        ? `No ${asset.id} wallets saved yet.`
                                                        : 'No payment methods saved yet.'}
                                                </div>
                                                <Link
                                                    href={type === 'BUY' ? '/dashboard/wallets' : '/dashboard/wallets?tab=fiat'}
                                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl text-primary text-[10px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    <ArrowUpRight className="h-3 w-3" />
                                                    {type === 'BUY' ? 'Add Your First Wallet' : 'Add Payment Method'}
                                                </Link>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Execution Action */}
                    <div className="pt-2">
                        {error && (
                            <div className="mb-6 p-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center italic">
                                {error}
                            </div>
                        )}

                        {!isAvailable || isRateMissing ? (
                            <button disabled className="w-full h-16 rounded-3xl bg-white/5 border border-white/5 text-white/20 font-black text-[11px] uppercase tracking-[0.4em] cursor-not-allowed italic">
                                Market Currently Closed
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !!error || !amountFiat || !receivingAddress || !displayRate}
                                className="w-full h-16 rounded-3xl bg-primary text-black font-black text-[10px] sm:text-[11px] uppercase tracking-wider sm:tracking-[0.4em] transition-all shadow-[0_10px_40px_rgba(16,185,129,0.2)] hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-20 disabled:grayscale px-4"
                            >
                                {isSubmitting ? "Finalizing..." : `Confirm ${type} Execution`}
                            </button>
                        )}
                    </div>

                    <div className="flex justify-center border-t border-white/5 pt-6">
                        <Link href="/dashboard/support" className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-primary transition-colors">
                            <ArrowUpRight className="h-3 w-3" /> System Heartbeat: Nominal
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
