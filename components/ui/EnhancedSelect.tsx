"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface EnhancedSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    options: {
        id: string;
        name: string;
        description?: string;
        icon?: string | React.ReactNode;
    }[];
    placeholder?: string;
    label?: string;
    className?: string;
    triggerClassName?: string;
}

export function EnhancedSelect({
    value,
    onValueChange,
    options,
    placeholder = "Select an option",
    label,
    className,
    triggerClassName
}: EnhancedSelectProps) {
    const selectedOption = options.find(o => o.id === value);

    return (
        <div className={cn("space-y-2", className)}>
            {label && (
                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-2">
                    {label}
                </label>
            )}
            <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
                <SelectPrimitive.Trigger
                    className={cn(
                        "w-full flex items-center justify-between px-6 py-4 rounded-[20px] bg-card/30 border border-border hover:bg-card/50 hover:border-primary/30 transition-all outline-none group",
                        triggerClassName
                    )}
                >
                    <SelectPrimitive.Value placeholder={placeholder}>
                        <div className="flex items-center gap-3">
                            {selectedOption?.icon && (
                                <div className="h-6 w-6 shrink-0 flex items-center justify-center">
                                    {typeof selectedOption.icon === 'string' ? (
                                        <Image src={selectedOption.icon} alt="" width={24} height={24} className="object-contain" />
                                    ) : (
                                        selectedOption.icon
                                    )}
                                </div>
                            )}
                            <div className="text-left">
                                <p className="text-sm font-bold leading-none">{selectedOption?.name || placeholder}</p>
                                {selectedOption?.description && (
                                    <p className="text-[10px] text-foreground/40 font-medium mt-1 uppercase tracking-wider">{selectedOption.description}</p>
                                )}
                            </div>
                        </div>
                    </SelectPrimitive.Value>
                    <SelectPrimitive.Icon>
                        <ChevronDown className="h-4 w-4 text-foreground/20 group-hover:text-primary transition-colors" />
                    </SelectPrimitive.Icon>
                </SelectPrimitive.Trigger>

                <SelectPrimitive.Portal>
                    <SelectPrimitive.Content
                        position="popper"
                        sideOffset={8}
                        className="z-9999 min-w-(--radix-select-trigger-width) overflow-hidden rounded-[24px] border border-border glass-card shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                    >
                        <SelectPrimitive.ScrollUpButton className="flex items-center justify-center h-8 bg-card/50 cursor-default">
                            <ChevronUp className="h-4 w-4" />
                        </SelectPrimitive.ScrollUpButton>

                        <SelectPrimitive.Viewport className="p-2">
                            {options.map((option) => (
                                <SelectPrimitive.Item
                                    key={option.id}
                                    value={option.id}
                                    className="relative flex items-center px-4 py-3 rounded-[16px] text-sm font-medium outline-none cursor-default select-none data-highlighted:bg-primary data-highlighted:text-primary-foreground transition-colors group mb-1 last:mb-0"
                                >
                                    <div className="flex items-center gap-3 w-full">
                                        {option.icon && (
                                            <div className="h-8 w-8 shrink-0 flex items-center justify-center bg-foreground/5 rounded-xl group-data-highlighted:bg-white/10 transition-colors p-1.5">
                                                {typeof option.icon === 'string' ? (
                                                    <Image src={option.icon} alt="" width={32} height={32} className="object-contain" />
                                                ) : (
                                                    option.icon
                                                )}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="font-bold">{option.name}</p>
                                            {option.description && (
                                                <p className="text-[10px] opacity-60 uppercase tracking-widest">{option.description}</p>
                                            )}
                                        </div>
                                        <SelectPrimitive.ItemIndicator>
                                            <Check className="h-4 w-4" />
                                        </SelectPrimitive.ItemIndicator>
                                    </div>
                                </SelectPrimitive.Item>
                            ))}
                        </SelectPrimitive.Viewport>

                        <SelectPrimitive.ScrollDownButton className="flex items-center justify-center h-8 bg-card/50 cursor-default">
                            <ChevronDown className="h-4 w-4" />
                        </SelectPrimitive.ScrollDownButton>
                    </SelectPrimitive.Content>
                </SelectPrimitive.Portal>
            </SelectPrimitive.Root>
        </div>
    );
}
