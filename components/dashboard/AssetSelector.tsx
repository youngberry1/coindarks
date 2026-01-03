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
                className={cn("w-full md:min-w-[180px] border-none bg-transparent focus:ring-0 px-0 h-auto gap-2 shadow-none", className)}
                aria-label={`Select ${type === 'CRYPTO' ? 'Cryptocurrency' : 'Fiat Currency'}`}
            >
                <div className="flex items-center gap-3">
                    {/* Icon handling */}
                    {/* Icon handling */}
                    {type === "CRYPTO" ? (
                        <div className="h-6 w-6 relative shrink-0">
                            {selectedOption && (
                                <CryptoIcon
                                    symbol={selectedOption.id}
                                    iconUrl={selectedOption.icon}
                                    className="object-contain"
                                />
                            )}
                        </div>
                    ) : selectedOption?.icon ? (
                        <div className="h-6 w-6 relative shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={selectedOption.icon} alt={selectedOption.name} className="h-full w-full object-contain rounded-full" />
                        </div>
                    ) : (
                        <div className="h-6 w-6 rounded-full bg-foreground/10 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {selectedOption?.symbol ? selectedOption.symbol[0] : '$'}
                        </div>
                    )}

                    <div className="flex flex-col items-start text-left">
                        <SelectValue placeholder="Select asset">
                            <span className="font-black text-sm uppercase tracking-wider block leading-none">
                                {selectedOption?.id}
                            </span>
                            <span className="text-[10px] font-medium text-foreground/40 block mt-0.5 leading-none truncate max-w-[100px]">
                                {selectedOption?.name}
                            </span>
                        </SelectValue>
                    </div>
                </div>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
                <SelectGroup>
                    <SelectLabel className="text-[10px] uppercase tracking-widest text-foreground/40">Select {type === 'CRYPTO' ? 'Asset' : 'Currency'}</SelectLabel>
                    {options.map((option) => (
                        <SelectItem key={option.id} value={option.id} className="py-3 cursor-pointer">
                            <div className="flex items-center gap-3">
                                {type === "CRYPTO" ? (
                                    <div className="h-6 w-6 relative shrink-0">
                                        <CryptoIcon
                                            symbol={option.id}
                                            iconUrl={option.icon}
                                            className="object-contain"
                                        />
                                    </div>
                                ) : option.icon ? (
                                    <div className="h-6 w-6 relative shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={option.icon} alt={option.name} className="h-full w-full object-contain rounded-full" />
                                    </div>
                                ) : (
                                    <div className="h-6 w-6 rounded-full bg-foreground/10 flex items-center justify-center text-[10px] font-bold shrink-0">
                                        {option.symbol?.[0] || '$'}
                                    </div>
                                )}
                                <div className="flex flex-col text-left">
                                    <span className="font-bold text-sm leading-none">{option.id}</span>
                                    <span className="text-xs text-foreground/50 leading-none mt-1">{option.name}</span>
                                </div>
                            </div>
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
