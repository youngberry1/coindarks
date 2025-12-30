'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCryptos, updateCryptoStatus, toggleCryptoActive, addCrypto, Cryptocurrency } from '@/actions/crypto';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CryptoManager() {
    const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newCrypto, setNewCrypto] = useState({ symbol: '', name: '', icon_url: '' });

    const fetchCryptos = useCallback(async () => {
        setLoading(true);
        const data = await getCryptos(false); // Fetch all, including inactive
        setCryptos(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchCryptos();
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

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Symbol</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Stock Status</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : cryptos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No cryptocurrencies found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            cryptos.map((crypto) => (
                                <TableRow key={crypto.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                                                <Image
                                                    src={crypto.icon_url?.startsWith('http') ? crypto.icon_url : `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${crypto.symbol.toLowerCase()}.svg`}
                                                    alt={crypto.symbol}
                                                    width={24}
                                                    height={24}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.parentElement!.innerText = crypto.symbol[0];
                                                    }}
                                                />
                                            </div>
                                            {crypto.symbol}
                                        </div>
                                    </TableCell>
                                    <TableCell>{crypto.name}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={crypto.stock_status === 'IN STOCK' ? 'default' : 'destructive'}
                                            className="cursor-pointer"
                                            onClick={() => handleStockToggle(crypto.id, crypto.stock_status)}
                                        >
                                            {crypto.stock_status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {/* Simplified toggle since we didn't check for Switch component, using Button variant */}
                                        <Button
                                            size="sm"
                                            variant={crypto.is_active ? "outline" : "ghost"}
                                            className={crypto.is_active ? "text-green-500 border-green-500" : "text-muted-foreground"}
                                            onClick={() => handleActiveToggle(crypto.id, crypto.is_active)}
                                        >
                                            {crypto.is_active ? "Visible" : "Hidden"}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {/* Add edit/delete later if needed */}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
