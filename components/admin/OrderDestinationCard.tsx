"use client";

import { Wallet, Copy, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState } from "react";

interface OrderDestinationCardProps {
    address: string;
    network: string | null;
    orderType: 'BUY' | 'SELL';
}

export function OrderDestinationCard({ address, network, orderType }: OrderDestinationCardProps) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(address);
        toast.success("Address copied to clipboard");
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="p-8 rounded-[32px] bg-card border border-white/5 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">
                    <Wallet className="h-4 w-4" /> {orderType === 'BUY' ? 'User Destination Wallet' : 'User Payout Account'}
                </div>
                {network && (
                    <Badge variant="secondary" className="px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border-primary/20">
                        Network: {network}
                    </Badge>
                )}
            </div>

            <div className="space-y-2">
                <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
                    {orderType === 'BUY' ? 'Receiving Address' : 'Fiat Account Details'}
                </p>
                <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5 group hover:border-white/10 transition-colors">
                    <code className="flex-1 font-mono text-xs sm:text-sm text-foreground/80 break-all">
                        {address}
                    </code>
                    <button
                        onClick={handleCopy}
                        className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-foreground/30 hover:text-primary hover:border-primary/20 transition-all active:scale-95 shrink-0"
                        title="Copy Address"
                    >
                        {isCopied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
