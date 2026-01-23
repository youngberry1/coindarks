import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CryptoIcon } from "@/components/CryptoIcon";
import { cn } from "@/lib/utils";
import { Search, ChevronDown, Check } from "lucide-react";

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
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const selectedOption = options.find(o => o.id === value);

    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (id: string) => {
        onChange(id);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button
                    className={cn(
                        "group/trigger min-w-[140px] h-11 px-4 rounded-xl bg-[#16191E] border border-white/5 hover:border-emerald-500/30 hover:bg-[#1C2127] transition-all duration-300 outline-none focus:ring-0 flex items-center justify-between gap-3",
                        className
                    )}
                    aria-label={`Select ${type === 'CRYPTO' ? 'Cryptocurrency' : 'Fiat Currency'}`}
                >
                    <div className="flex items-center gap-2 overflow-hidden">
                        {/* Icon handling */}
                        {type === "CRYPTO" ? (
                            <div className="h-6 w-6 relative shrink-0">
                                {selectedOption && (
                                    <CryptoIcon
                                        symbol={selectedOption.id}
                                        iconUrl={selectedOption.icon}
                                        className="rounded-full"
                                    />
                                )}
                            </div>
                        ) : selectedOption?.icon ? (
                            <div className="h-6 w-6 relative shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={selectedOption.icon} alt={selectedOption.name} className="h-full w-full object-contain rounded-full" />
                            </div>
                        ) : (
                            <div className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-black shrink-0">
                                {selectedOption?.symbol ? selectedOption.symbol[0] : '$'}
                            </div>
                        )}

                        <div className="flex flex-col items-start text-left min-w-0">
                            <span className="font-black text-[10px] uppercase tracking-wider block leading-none text-white group-hover/trigger:text-emerald-500 transition-colors truncate">
                                {selectedOption?.id}
                            </span>
                        </div>
                    </div>
                    <ChevronDown className="h-3 w-3 text-white/20 group-hover/trigger:text-white transition-colors shrink-0" />
                </button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined} className="sm:max-w-[420px] bg-[#0D0F12] border border-white/10 p-0 gap-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-[2rem]">
                <DialogHeader className="px-6 py-5 border-b border-white/5 bg-[#16191E]/50">
                    <DialogTitle className="text-xs font-black uppercase tracking-[0.3em] text-white/40">
                        Select Terminal Asset
                    </DialogTitle>
                </DialogHeader>

                {/* Search */}
                <div className="p-6 pb-4">
                    <div className="relative group/search">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within/search:text-emerald-500 transition-colors" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Type to search assets..."
                            className="w-full bg-[#16191E] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-white placeholder:text-white/10 outline-none focus:border-emerald-500/30 transition-all"
                            autoFocus
                        />
                    </div>
                </div>

                {/* List */}
                <div className="max-h-[380px] overflow-y-auto custom-scrollbar px-3 pb-6 space-y-1">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => {
                            const isSelected = option.id === value;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleSelect(option.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-4 rounded-2xl transition-all group/item",
                                        isSelected ? "bg-emerald-500/5 border border-emerald-500/20" : "hover:bg-white/5 border border-transparent"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        {type === "CRYPTO" ? (
                                            <div className="h-10 w-10 relative shrink-0 bg-[#16191E] rounded-full p-2 flex items-center justify-center border border-white/5 group-hover/item:border-emerald-500/30 transition-colors">
                                                <CryptoIcon
                                                    symbol={option.id}
                                                    iconUrl={option.icon}
                                                    className="object-contain"
                                                />
                                            </div>
                                        ) : option.icon ? (
                                            <div className="h-10 w-10 relative shrink-0 overflow-hidden rounded-full border border-white/5 group-hover/item:border-emerald-500/30 transition-colors bg-white/5">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={option.icon} alt={option.name} className="h-full w-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-[#16191E] flex items-center justify-center text-xs font-black shrink-0 border border-white/5">
                                                {option.symbol?.[0] || '$'}
                                            </div>
                                        )}
                                        <div className="flex flex-col text-left">
                                            <span className={cn("font-black text-sm uppercase tracking-tight", isSelected ? "text-emerald-500" : "text-white group-hover/item:text-emerald-500 transition-colors")}>
                                                {option.name}
                                            </span>
                                            <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{option.id}</span>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <Check className="h-3 w-3 text-emerald-500" />
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    ) : (
                        <div className="py-12 text-center text-white/10 text-[10px] font-black uppercase tracking-[0.2em] italic">
                            No matching assets found
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
