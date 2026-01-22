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
                        "group/trigger w-[160px] h-12 px-4 rounded-[16px] bg-black/40 backdrop-blur-xl border border-white/5 hover:border-primary/50 hover:bg-black/60 transition-all duration-300 shadow-2xl outline-none focus:ring-0 flex items-center justify-between gap-2",
                        className
                    )}
                    aria-label={`Select ${type === 'CRYPTO' ? 'Cryptocurrency' : 'Fiat Currency'}`}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        {/* Icon handling */}
                        {type === "CRYPTO" ? (
                            <div className="h-7 w-7 relative shrink-0">
                                {selectedOption && (
                                    <CryptoIcon
                                        symbol={selectedOption.id}
                                        iconUrl={selectedOption.icon}
                                        className="rounded-full"
                                    />
                                )}
                            </div>
                        ) : selectedOption?.icon ? (
                            <div className="h-7 w-7 relative shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={selectedOption.icon} alt={selectedOption.name} className="h-full w-full object-contain rounded-full shadow-sm" />
                            </div>
                        ) : (
                            <div className="h-7 w-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black shrink-0">
                                {selectedOption?.symbol ? selectedOption.symbol[0] : '$'}
                            </div>
                        )}

                        <div className="flex flex-col items-start text-left min-w-0">
                            <span className="font-black text-xs uppercase tracking-tight block leading-none text-white group-hover/trigger:text-primary transition-colors truncate w-full">
                                {selectedOption?.id}
                            </span>
                            <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest block mt-0.5 leading-none truncate max-w-[80px]">
                                {selectedOption?.name}
                            </span>
                        </div>
                    </div>
                    <ChevronDown className="h-3 w-3 text-white/30 group-hover/trigger:text-white transition-colors shrink-0" />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] bg-black/80 backdrop-blur-2xl border-white/10 p-0 gap-0 overflow-hidden shadow-2xl">
                <DialogHeader className="px-4 py-3 border-b border-white/5 bg-white/5">
                    <DialogTitle className="text-xs font-black uppercase tracking-[0.2em] text-foreground/50">
                        Select Asset
                    </DialogTitle>
                </DialogHeader>

                {/* Search */}
                <div className="p-4 pb-2">
                    <div className="relative group/search">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30 group-focus-within/search:text-primary transition-colors" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search assets..."
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-white placeholder:text-foreground/20 outline-none focus:border-primary/50 transition-all"
                            autoFocus
                        />
                    </div>
                </div>

                {/* List */}
                <div className="max-h-[360px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => {
                            const isSelected = option.id === value;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleSelect(option.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-xl transition-all group/item",
                                        isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-white/5 border border-transparent"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        {type === "CRYPTO" ? (
                                            <div className="h-10 w-10 relative shrink-0 bg-white/5 rounded-full p-1.5 flex items-center justify-center">
                                                <CryptoIcon
                                                    symbol={option.id}
                                                    iconUrl={option.icon}
                                                    className="object-contain"
                                                />
                                            </div>
                                        ) : option.icon ? (
                                            <div className="h-10 w-10 relative shrink-0 overflow-hidden rounded-full">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={option.icon} alt={option.name} className="h-full w-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-xs font-black shrink-0">
                                                {option.symbol?.[0] || '$'}
                                            </div>
                                        )}
                                        <div className="flex flex-col text-left">
                                            <span className={cn("font-black text-sm uppercase tracking-tight", isSelected ? "text-primary" : "text-white group-hover/item:text-primary transition-colors")}>
                                                {option.name}
                                            </span>
                                            <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">{option.id}</span>
                                        </div>
                                    </div>
                                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                                </button>
                            );
                        })
                    ) : (
                        <div className="py-8 text-center text-foreground/30 text-xs font-medium italic">
                            No assets found
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
