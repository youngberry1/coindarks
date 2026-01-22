"use client";

import * as React from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CryptoIcon } from "@/components/CryptoIcon";
import { cn } from "@/lib/utils";

interface AssetOption {
    id: string;
    name: string;
    icon?: string;
    symbol?: string; // For Fiat symbols like $ or GH₵
}

interface AssetSelectorProps {
    value: string;
    onChange: (value: string) => void;
    options: AssetOption[];
    type: "CRYPTO" | "FIAT";
    className?: string;
}

export function AssetSelector({ value, onChange, options, type, className }: AssetSelectorProps) {
    const selectedOption = options.find(o => o.id === value);

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger
                className={cn(
                    "group/trigger w-auto h-12 px-4 rounded-[16px] bg-black/40 backdrop-blur-xl border border-white/5 hover:border-primary/50 hover:bg-black/60 transition-all duration-500 shadow-2xl outline-none focus:ring-0",
                    className
                )}
                aria-label={`Select ${type === 'CRYPTO' ? 'Cryptocurrency' : 'Fiat Currency'}`}
            >
                <div className="flex items-center gap-3">
                    {/* Icon handling */}
                    {type === "CRYPTO" ? (
                        <div className="h-8 w-8 relative shrink-0">
                            {selectedOption && (
                                <CryptoIcon
                                    symbol={selectedOption.id}
                                    iconUrl={selectedOption.icon}
                                    className="rounded-full"
                                />
                            )}
                        </div>
                    ) : selectedOption?.icon ? (
                        <div className="h-8 w-8 relative shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={selectedOption.icon} alt={selectedOption.name} className="h-full w-full object-contain rounded-full shadow-sm" />
                        </div>
                    ) : (
                        <div className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black shrink-0 transition-transform duration-500 group-hover/trigger:scale-110">
                            {selectedOption?.symbol ? selectedOption.symbol[0] : '$'}
                        </div>
                    )}

                    <div className="flex flex-col items-start text-left min-w-[60px]">
                        <SelectValue placeholder="Asset">
                            <span className="font-black text-xs uppercase tracking-tight block leading-none text-white group-hover/trigger:text-primary transition-colors">
                                {selectedOption?.id}
                            </span>
                            <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest block mt-1 leading-none truncate max-w-[80px]">
                                {selectedOption?.name}
                            </span>
                        </SelectValue>
                    </div>

                </div>
            </SelectTrigger>
            <SelectContent className="bg-black/95 backdrop-blur-3xl border border-white/10 rounded-[32px] p-2 min-w-[220px] z-50 shadow-2xl">
                <SelectGroup>
                    <SelectLabel className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">Available Assets</SelectLabel>
                    {options.map((option) => (
                        <SelectItem
                            key={option.id}
                            value={option.id}
                            className="rounded-2xl py-4 px-4 m-1 cursor-pointer focus:bg-primary/20 focus:text-primary transition-all group/item"
                        >
                            <div className="flex items-center gap-4">
                                {type === "CRYPTO" ? (
                                    <div className="h-8 w-8 relative shrink-0">
                                        <CryptoIcon
                                            symbol={option.id}
                                            iconUrl={option.icon}
                                            className="object-contain"
                                        />
                                    </div>
                                ) : option.icon ? (
                                    <div className="h-8 w-8 relative shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={option.icon} alt={option.name} className="h-full w-full object-contain rounded-full" />
                                    </div>
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black shrink-0">
                                        {option.symbol?.[0] || '$'}
                                    </div>
                                )}
                                <div className="flex flex-col text-left min-w-[60px]">
                                    <span className="font-black text-xs uppercase tracking-tight leading-none group-focus-within/item:text-primary">{option.id}</span>
                                    <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest leading-none mt-1.5 truncate max-w-[120px]">{option.name}</span>
                                </div>
                            </div>
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
