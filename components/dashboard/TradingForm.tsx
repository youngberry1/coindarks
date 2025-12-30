"use client";

import { useState, useEffect, useCallback } from "react";
import {
    ArrowDown,
    Loader2,
    CheckCircle2,
    Wallet,
    Info,
    ArrowRight,
    AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { createOrder } from "@/actions/exchange";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AssetMetadata {
    id: string;
    name: string;
    icon: string;
    coingeckoId: string;
}

const FIAT = [
    { id: "GHS", name: "Ghana Cedi", symbol: "GH₵", rate: 16.5 }, // Simulated rate vs USD
    { id: "NGN", name: "Nigerian Naira", symbol: "₦", rate: 1650 }, // Simulated rate vs USD
];

interface TradingFormProps {
    initialInventory: {
        asset: string;
        buy_enabled: boolean;
        sell_enabled: boolean;
    }[];
    supportedAssets: AssetMetadata[];
}

export function TradingForm({ initialInventory, supportedAssets }: TradingFormProps) {
    const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
    const [asset, setAsset] = useState(supportedAssets[0]);
    const [fiat, setFiat] = useState(FIAT[0]);
    const [amountFiat, setAmountFiat] = useState("");
    const [amountCrypto, setAmountCrypto] = useState("");
    const [receivingAddress, setReceivingAddress] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [price, setPrice] = useState<number | null>(null);
    const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

    // Fetch Price
    const fetchPrice = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${asset.coingeckoId}&vs_currencies=usd`);
            const data = await response.json();
            const usdPrice = data[asset.coingeckoId].usd;
            setPrice(usdPrice);
        } catch {
            toast.error("Failed to fetch current price");
        } finally {
            setIsLoading(false);
        }
    }, [asset]);

    useEffect(() => {
        fetchPrice();
        const interval = setInterval(fetchPrice, 30000); // 30s refresh
        return () => clearInterval(interval);
    }, [fetchPrice]);

    // Calculate conversions
    const handleFiatChange = (val: string) => {
        setAmountFiat(val);
        if (!price || isNaN(Number(val))) {
            setAmountCrypto("");
            return;
        }
        const usdVal = Number(val) / fiat.rate;
        setAmountCrypto((usdVal / price).toFixed(8));
    };

    const handleCryptoChange = (val: string) => {
        setAmountCrypto(val);
        if (!price || isNaN(Number(val))) {
            setAmountFiat("");
            return;
        }
        const usdVal = Number(val) * price;
        setAmountFiat((usdVal * fiat.rate).toFixed(2));
    };

    const handleSubmit = async () => {
        if (!amountFiat || !amountCrypto || !receivingAddress) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createOrder({
                type,
                asset: asset.id,
                amount_crypto: Number(amountCrypto),
                amount_fiat: Number(amountFiat),
                fiat_currency: fiat.id,
                receiving_address: receivingAddress
            });

            if (result.success) {
                setOrderSuccess(result.orderNumber!);
                toast.success("Order placed successfully!");
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error("Failed to submit order");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isAvailable = initialInventory.find(i => i.asset === asset.id)?.[type === 'BUY' ? 'buy_enabled' : 'sell_enabled'];

    if (orderSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-12 rounded-[40px] border border-white/5 bg-card-bg/50 backdrop-blur-xl text-center space-y-8"
            >
                <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 border-4 border-emerald-500/20">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                </div>
                <div>
                    <h2 className="text-3xl font-black mb-3">Order Placed!</h2>
                    <p className="text-foreground/50 font-medium mb-2">Your order <span className="text-primary font-mono">{orderSuccess}</span> is being processed.</p>
                    <p className="text-xs text-foreground/30 max-w-sm mx-auto">Please check your email for payment instructions. Your order will be fulfilled once payment is confirmed.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={() => setOrderSuccess(null)} className="px-10 py-4 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                        Make Another Trade
                    </button>
                    <a href="/dashboard/orders" className="px-10 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all">
                        View Order Status
                    </a>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="p-6 md:p-12 rounded-[40px] border border-white/5 bg-card-bg/50 backdrop-blur-xl">
            {/* Type Toggle */}
            <div className="flex p-1.5 rounded-2xl bg-white/5 border border-white/5 mb-8 md:mb-10 w-full sm:w-max">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                <div className="space-y-6 md:space-y-8">
                    {/* Send / Receive Inputs */}
                    <div className="space-y-4">
                        <div className="p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-white/5 border border-white/10 focus-within:border-primary/50 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">{type === 'BUY' ? 'You Pay' : 'You Send'}</p>
                                <div className="flex items-center gap-2 group cursor-pointer">
                                    <select
                                        value={fiat.id}
                                        onChange={(e) => setFiat(FIAT.find(f => f.id === e.target.value)!)}
                                        className="bg-transparent font-black text-xs uppercase tracking-widest outline-none cursor-pointer"
                                    >
                                        {FIAT.map(f => <option key={f.id} value={f.id} className="bg-background text-foreground">{f.id} - {f.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-end justify-between gap-4">
                                <input
                                    type="number"
                                    value={amountFiat}
                                    onChange={(e) => handleFiatChange(e.target.value)}
                                    placeholder="0.00"
                                    className="bg-transparent text-2xl md:text-4xl font-black outline-none w-full placeholder:text-foreground/10"
                                />
                                <span className="text-xl md:text-2xl font-black text-foreground/40 mb-1">{fiat.id}</span>
                            </div>
                        </div>

                        <div className="flex justify-center -my-8 relative z-10">
                            <div className="h-12 w-12 rounded-2xl bg-card-bg border border-white/5 flex items-center justify-center shadow-2xl text-primary">
                                <ArrowDown className="h-5 w-5" />
                            </div>
                        </div>

                        <div className="p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-white/5 border border-white/10 focus-within:border-primary/50 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">{type === 'BUY' ? 'You Receive' : 'You Get Paid'}</p>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={asset.id}
                                        onChange={(e) => setAsset(supportedAssets.find(a => a.id === e.target.value)!)}
                                        className="bg-transparent font-black text-xs uppercase tracking-widest outline-none cursor-pointer"
                                    >
                                        {supportedAssets.map(a => <option key={a.id} value={a.id} className="bg-background text-foreground">{a.id} - {a.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-end justify-between gap-4">
                                <input
                                    type="number"
                                    value={amountCrypto}
                                    onChange={(e) => handleCryptoChange(e.target.value)}
                                    placeholder="0.00000000"
                                    className="bg-transparent text-2xl md:text-3xl font-black outline-none w-full placeholder:text-foreground/10"
                                />
                                <span className="text-lg md:text-xl font-black text-foreground/40 mb-1">{asset.id}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8 flex flex-col justify-between">
                    <div className="space-y-6">
                        {/* Address Input */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-2">
                                {type === 'BUY' ? `${asset.id} Receiving Address` : `Your ${fiat.id} Payout Details`}
                            </label>
                            <div className="relative group">
                                <Wallet className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    value={receivingAddress}
                                    onChange={(e) => setReceivingAddress(e.target.value)}
                                    placeholder={type === 'BUY' ? `Enter your ${asset.id} wallet address` : "Enter Mobile Money or Bank details"}
                                    className="w-full pl-16 pr-6 py-5 rounded-[24px] bg-white/5 border border-white/10 focus:border-primary focus:outline-none transition-all font-bold text-sm"
                                />
                            </div>
                            <p className="flex items-center gap-2 text-[10px] text-foreground/30 font-medium ml-2">
                                <Info className="h-3 w-3" /> Double check address. Incorrect details may lead to loss of funds.
                            </p>
                        </div>

                        {/* Summary Block */}
                        <div className="p-6 rounded-3xl bg-linear-to-br from-white/5 to-transparent border border-white/5 space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-foreground/40 font-medium">Exchange Rate</span>
                                <span className="font-bold">
                                    {isLoading ? <Loader2 className="h-3 w-3 animate-spin inline mr-2" /> : `1 ${asset.id} ≈ ${(price! * fiat.rate).toLocaleString()} ${fiat.id}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-foreground/40 font-medium">Service Fee</span>
                                <span className="font-bold text-emerald-500">0.00 {fiat.id}</span>
                            </div>
                            <div className="pt-4 border-t border-white/5 flex justify-between">
                                <span className="text-sm font-black uppercase tracking-widest text-foreground/60">Estimated Total</span>
                                <span className="text-lg font-black text-primary">{fiat.symbol}{Number(amountFiat).toLocaleString() || '0.00'}</span>
                            </div>
                        </div>
                    </div>

                    {!isAvailable ? (
                        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-500">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p className="text-xs font-bold">{asset.id} {type.toLowerCase()} transactions are temporarily disabled.</p>
                        </div>
                    ) : (
                        <button
                            disabled={isSubmitting || !amountFiat || !receivingAddress}
                            onClick={handleSubmit}
                            className={cn(
                                "w-full py-6 rounded-[24px] text-white font-black text-lg uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 group",
                                type === 'BUY' ? "bg-primary shadow-primary/20 hover:scale-[1.02]" : "bg-rose-500 shadow-rose-500/20 hover:scale-[1.02]",
                                (isSubmitting || !amountFiat || !receivingAddress) && "opacity-50 grayscale cursor-not-allowed scale-100"
                            )}
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-7 w-7 animate-spin" />
                            ) : (
                                <>
                                    Confirm {type === 'BUY' ? 'Purchase' : 'Sale'}
                                    <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
