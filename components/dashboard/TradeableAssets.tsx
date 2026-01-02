'use client';

import { useEffect, useState } from 'react';
import { getCryptos, Cryptocurrency } from '@/actions/crypto';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import Image from 'next/image';

interface TradeableAssetsProps {
    initialData?: Cryptocurrency[];
}

export default function TradeableAssets({ initialData = [] }: TradeableAssetsProps) {
    const [cryptos, setCryptos] = useState<Cryptocurrency[]>(initialData);

    useEffect(() => {
        if (initialData.length === 0) {
            getCryptos(true).then(setCryptos);
        }
    }, [initialData]);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold tracking-tight">TRADEABLE ASSETS</h2>
                <Badge variant="outline" className="gap-2 bg-background/50">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live availability
                </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {cryptos.map((crypto) => {
                    // Use CDN matching the package version/style
                    const iconUrl = `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${crypto.symbol.toLowerCase()}.svg`;

                    return (
                        <Card key={crypto.id} className="bg-black/40 border-white/10 p-6 flex flex-col items-center justify-center hover:bg-black/60 transition-colors group">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-shadow">
                                <Image
                                    src={crypto.icon_url?.startsWith('http') ? crypto.icon_url : iconUrl}
                                    alt={crypto.symbol}
                                    width={48}
                                    height={48}
                                    className="rounded-full"
                                    onError={(e) => {
                                        // Fallback to text if image fails
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement!.innerText = crypto.symbol[0];
                                        e.currentTarget.parentElement!.className += ' bg-[#111] border border-white/5 text-blue-500 font-bold';
                                    }}
                                />
                            </div>

                            <span className="font-bold text-lg mb-2">{crypto.symbol}</span>

                            <Badge
                                variant="outline"
                                className={`
                 ${crypto.stock_status === 'IN STOCK'
                                        ? 'text-green-500 border-green-500/20 bg-green-500/10'
                                        : 'text-red-500 border-red-500/20 bg-red-500/10'}
                 text-[10px] px-2 py-0.5 h-auto tracking-wider
               `}
                            >
                                • {crypto.stock_status}
                            </Badge>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
