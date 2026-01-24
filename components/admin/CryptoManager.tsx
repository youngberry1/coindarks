'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCryptos, updateCryptoStatus, toggleCryptoActive, addCrypto, Cryptocurrency } from '@/actions/crypto';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Loading } from '@/components/ui/LoadingSpinner';
import { AnimatePresence } from 'framer-motion';

export default function CryptoManager() {
    const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newCrypto, setNewCrypto] = useState({ symbol: '', name: '', icon_url: '' });

    const fetchCryptos = useCallback(async (isInitial = false) => {
        if (!isInitial) setLoading(true);
        try {
            const data = await getCryptos(false); // Fetch all, including inactive
            setCryptos(data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCryptos(true);
    }, [fetchCryptos]);

    const handleStockToggle = async (id: string, currentStatus: string) => {
        const isInStock = currentStatus === 'IN STOCK';
        try {
            await updateCryptoStatus(id, !isInStock);
            toast.success(`Updated stock status for crypto`);
            fetchCryptos();
        } catch {
            toast.error('Failed to update stock status');
        }
    };

    const handleActiveToggle = async (id: string, currentActive: boolean) => {
        try {
            await toggleCryptoActive(id, !currentActive);
            toast.success(`Updated active status`);
            fetchCryptos();
        } catch {
            toast.error('Failed to update active status');
        }
    };

    const handleAddCrypto = async () => {
        if (!newCrypto.symbol || !newCrypto.name || !newCrypto.icon_url) {
            toast.error('Please fill in all fields');
            return;
        }
        try {
            await addCrypto(newCrypto);
            toast.success('Cryptocurrency added successfully');
            setIsAddOpen(false);
            setNewCrypto({ symbol: '', name: '', icon_url: '' });
            fetchCryptos();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            toast.error('Failed to add crypto: ' + message);
        }
    };

    return (
        <div className="space-y-6">
            <AnimatePresence>
                {loading && cryptos.length > 0 && (
                    <Loading message="Processing asset update..." />
                )}
            </AnimatePresence>
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Cryptocurrency Management</h2>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Crypto
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Cryptocurrency</DialogTitle>
                            <DialogDescription className="text-sm text-foreground/40">
                                Enter the details for the new cryptocurrency asset.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Symbol (e.g., ETH)</label>
                                <Input
                                    value={newCrypto.symbol}
                                    onChange={(e) => setNewCrypto({ ...newCrypto, symbol: e.target.value.toUpperCase() })}
                                    placeholder="ETH"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name (e.g., Ethereum)</label>
                                <Input
                                    value={newCrypto.name}
                                    onChange={(e) => setNewCrypto({ ...newCrypto, name: e.target.value })}
                                    placeholder="Ethereum"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Icon Code/URL</label>
                                <Input
                                    value={newCrypto.icon_url}
                                    onChange={(e) => setNewCrypto({ ...newCrypto, icon_url: e.target.value })}
                                    placeholder="ETH"
                                />
                                <p className="text-xs text-muted-foreground">Use the symbol code for built-in icons, or a URL.</p>
                            </div>
                            <Button onClick={handleAddCrypto} className="w-full">Create</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-sm">
                {/* Desktop View - Hidden on Mobile */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/10 hover:bg-white/5">
                                <TableHead className="text-foreground/40 font-black uppercase text-[10px] tracking-widest pl-6">Asset</TableHead>
                                <TableHead className="text-foreground/40 font-black uppercase text-[10px] tracking-widest">Name</TableHead>
                                <TableHead className="text-foreground/40 font-black uppercase text-[10px] tracking-widest text-center">Stock Status</TableHead>
                                <TableHead className="text-foreground/40 font-black uppercase text-[10px] tracking-widest text-right pr-6">Visibility</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-48 text-center">
                                        <Loading message="Processing asset update..." fullScreen={false} />
                                    </TableCell>
                                </TableRow>
                            ) : cryptos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        No cryptocurrencies found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                cryptos.map((crypto) => (
                                    <TableRow key={crypto.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                        <TableCell className="font-bold pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center p-1.5 shrink-0">
                                                    <Image
                                                        src={crypto.icon_url?.startsWith('http') ? crypto.icon_url : `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${crypto.symbol.toLowerCase()}.svg`}
                                                        alt={crypto.symbol}
                                                        width={24}
                                                        height={24}
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => {
                                                            const target = e.currentTarget as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            if (target.parentElement) {
                                                                target.parentElement.innerText = crypto.symbol[0];
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <span className="tracking-tight">{crypto.symbol}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-foreground/70 font-medium">{crypto.name}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant={crypto.stock_status === 'IN STOCK' ? 'default' : 'destructive'}
                                                className={`cursor-pointer font-black text-[10px] tracking-widest uppercase transition-all active:scale-95 ${crypto.stock_status === 'IN STOCK' ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'}`}
                                                onClick={() => handleStockToggle(crypto.id, crypto.stock_status)}
                                            >
                                                {crypto.stock_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <button
                                                onClick={() => handleActiveToggle(crypto.id, crypto.is_active)}
                                                className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${crypto.is_active ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20' : 'bg-white/5 border-white/10 text-foreground/40 hover:bg-white/10'}`}
                                            >
                                                {crypto.is_active ? "Active" : "Hidden"}
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile View - Cards Layout */}
                <div className="md:hidden divide-y divide-white/5">
                    {loading ? (
                        <div className="p-12 flex flex-col items-center justify-center gap-4">
                            <Loading message="Processing asset update..." fullScreen={false} />
                        </div>
                    ) : cryptos.length === 0 ? (
                        <div className="p-12 text-center text-foreground/40 font-medium">
                            No cryptocurrencies found.
                        </div>
                    ) : (
                        cryptos.map((crypto) => (
                            <div key={crypto.id} className="p-6 space-y-4 hover:bg-white/5 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center p-2">
                                            <Image
                                                src={crypto.icon_url?.startsWith('http') ? crypto.icon_url : `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${crypto.symbol.toLowerCase()}.svg`}
                                                alt={crypto.symbol}
                                                width={32}
                                                height={32}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    const target = e.currentTarget as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    if (target.parentElement) {
                                                        target.parentElement.innerText = crypto.symbol[0];
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-black tracking-tight">{crypto.symbol}</h4>
                                            <p className="text-xs text-foreground/40 font-medium">{crypto.name}</p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={crypto.stock_status === 'IN STOCK' ? 'default' : 'destructive'}
                                        className={`font-black text-[10px] tracking-widest uppercase transition-all active:scale-95 ${crypto.stock_status === 'IN STOCK' ? 'bg-green-500/10 text-green-500 border-green-500/20 active:bg-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20 active:bg-red-500/20'}`}
                                        onClick={() => handleStockToggle(crypto.id, crypto.stock_status)}
                                    >
                                        {crypto.stock_status}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between gap-4 pt-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">System Visibility</span>
                                    <button
                                        onClick={() => handleActiveToggle(crypto.id, crypto.is_active)}
                                        className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${crypto.is_active ? 'bg-primary/10 border-primary/20 text-primary active:bg-primary/20' : 'bg-white/5 border-white/10 text-foreground/40 active:bg-white/10'}`}
                                    >
                                        {crypto.is_active ? "Switch to Hidden" : "Switch to Active"}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
