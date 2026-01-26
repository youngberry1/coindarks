'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCryptos, updateCryptoStatus, toggleCryptoActive, addCrypto, updateCryptoNetworks, deleteCrypto, Cryptocurrency } from '@/actions/crypto';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Loading } from '@/components/ui/LoadingSpinner';
import { AnimatePresence } from 'framer-motion';

export default function CryptoManager() {
    const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [newCrypto, setNewCrypto] = useState({ symbol: '', name: '', icon_url: '', networks: '' });
    const [editingCrypto, setEditingCrypto] = useState<Cryptocurrency | null>(null);
    const [editForm, setEditForm] = useState({ name: '', icon_url: '', networks: '' });
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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
            toast.success(`Updated stock status`);
            fetchCryptos();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            toast.error(message || 'Failed to update stock status');
        }
    };

    const handleActiveToggle = async (id: string, currentActive: boolean) => {
        try {
            await toggleCryptoActive(id, !currentActive);
            toast.success(`Updated active status`);
            fetchCryptos();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            toast.error(message || 'Failed to update active status');
        }
    };

    const handleAddCrypto = async () => {
        if (!newCrypto.symbol || !newCrypto.name || !newCrypto.icon_url || !newCrypto.networks) {
            toast.error('Please fill in all fields');
            return;
        }
        try {
            const networksArray = newCrypto.networks.split(',').map(n => n.trim()).filter(Boolean);
            await addCrypto({ ...newCrypto, networks: networksArray });
            toast.success('Cryptocurrency added successfully');
            setIsAddOpen(false);
            setNewCrypto({ symbol: '', name: '', icon_url: '', networks: '' });
            fetchCryptos();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            toast.error('Failed to add crypto: ' + message);
        }
    };

    const handleEditClick = (crypto: Cryptocurrency) => {
        setEditingCrypto(crypto);
        setEditForm({
            name: crypto.name,
            icon_url: crypto.icon_url,
            networks: crypto.networks?.join(', ') || ''
        });
        setIsEditOpen(true);
    };

    const handleUpdateCrypto = async () => {
        if (!editingCrypto) return;
        if (!editForm.name || !editForm.icon_url || !editForm.networks) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            const networksArray = editForm.networks.split(',').map(n => n.trim()).filter(Boolean);
            // Reusing addCrypto structure for networks logic but we need an update action
            // or we could use the existing update status/active functions but they are separate.
            // Let's assume we have or will have a generic update action or specific ones.
            // The user asked for editing networks specifically.

            // For now, let's implement the specific update networks call + name/icon if we want
            // I added updateCryptoNetworks in the action file.

            await updateCryptoNetworks(editingCrypto.id, networksArray);

            toast.success('Asset updated successfully');
            setIsEditOpen(false);
            fetchCryptos();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            toast.error(message || 'Failed to update asset');
        }
    };

    const handleDeleteClick = (crypto: Cryptocurrency) => {
        setDeleteConfirmId(crypto.id);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirmId) return;
        setIsDeleting(true);
        try {
            await deleteCrypto(deleteConfirmId);
            toast.success('Cryptocurrency deleted successfully');
            setDeleteConfirmId(null);
            fetchCryptos();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            toast.error(message || 'Failed to delete cryptocurrency');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <AnimatePresence>
                {loading && cryptos.length > 0 && (
                    <Loading message="Processing assets..." />
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
                    <DialogContent className="max-w-md bg-zinc-950 border-zinc-800">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black uppercase tracking-tight">Add New Cryptocurrency</DialogTitle>
                            <DialogDescription className="text-sm text-foreground/40">
                                Enter the details for the new tradeable asset.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Symbol (e.g., ETH)</label>
                                <Input
                                    value={newCrypto.symbol}
                                    onChange={(e) => setNewCrypto({ ...newCrypto, symbol: e.target.value.toUpperCase() })}
                                    placeholder="ETH"
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Name (e.g., Ethereum)</label>
                                <Input
                                    value={newCrypto.name}
                                    onChange={(e) => setNewCrypto({ ...newCrypto, name: e.target.value })}
                                    placeholder="Ethereum"
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Icon Code or URL</label>
                                <Input
                                    value={newCrypto.icon_url}
                                    onChange={(e) => setNewCrypto({ ...newCrypto, icon_url: e.target.value })}
                                    placeholder="ETH"
                                    className="bg-white/5 border-white/10"
                                />
                                <p className="text-[10px] text-foreground/30 italic">Use symbol for built-in icons, or a direct SVG/PNG URL.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Supported Networks</label>
                                <Input
                                    value={newCrypto.networks}
                                    onChange={(e) => setNewCrypto({ ...newCrypto, networks: e.target.value })}
                                    placeholder="ERC20, BEP20, POLYGON"
                                    className="bg-white/5 border-white/10"
                                />
                                <p className="text-[10px] text-foreground/30 italic">Separate with commas (e.g. TRC20, ERC20).</p>
                            </div>
                            <Button onClick={handleAddCrypto} className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs h-12 rounded-xl mt-4">Create Asset</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="max-w-md bg-zinc-950 border-zinc-800">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black uppercase tracking-tight">Edit {editingCrypto?.symbol}</DialogTitle>
                            <DialogDescription className="text-sm text-foreground/40">
                                Update the details for this asset.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Name</label>
                                <Input
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Icon Code or URL</label>
                                <Input
                                    value={editForm.icon_url}
                                    onChange={(e) => setEditForm({ ...editForm, icon_url: e.target.value })}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Supported Networks</label>
                                <Input
                                    value={editForm.networks}
                                    onChange={(e) => setEditForm({ ...editForm, networks: e.target.value })}
                                    className="bg-white/5 border-white/10"
                                />
                                <p className="text-[10px] text-foreground/30 italic">Separate with commas (e.g. TRC20, ERC20).</p>
                            </div>
                            <Button onClick={handleUpdateCrypto} className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs h-12 rounded-xl mt-4">Save Changes</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-[32px] overflow-hidden border border-white/10 bg-black/20 backdrop-blur-sm">
                {/* Desktop View */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="text-foreground/40 font-black uppercase text-[10px] tracking-widest pl-10 h-16">Asset & Networks</TableHead>
                                <TableHead className="text-foreground/40 font-black uppercase text-[10px] tracking-widest">Name</TableHead>
                                <TableHead className="text-foreground/40 font-black uppercase text-[10px] tracking-widest text-center">In-Stock</TableHead>
                                <TableHead className="text-foreground/40 font-black uppercase text-[10px] tracking-widest text-right pr-10">Visibility</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-48 text-center text-foreground/20 italic font-medium">Loading asset inventory...</TableCell>
                                </TableRow>
                            ) : cryptos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-48 text-center text-foreground/20 italic font-medium">No assets found</TableCell>
                                </TableRow>
                            ) : (
                                cryptos.map((crypto) => (
                                    <TableRow key={crypto.id} className="border-white/5 hover:bg-white/2 transition-colors group">
                                        <TableCell className="pl-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center p-2.5 shrink-0 transition-transform group-hover:scale-110">
                                                    <Image
                                                        src={crypto.icon_url?.startsWith('http') ? crypto.icon_url : `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${crypto.symbol.toLowerCase()}.svg`}
                                                        alt={crypto.symbol}
                                                        width={32}
                                                        height={32}
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => {
                                                            const target = e.currentTarget as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            if (target.parentElement) target.parentElement.innerText = crypto.symbol[0];
                                                        }}
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-base font-black tracking-tight leading-none mb-2 uppercase">{crypto.symbol}</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {crypto.networks?.map(n => (
                                                            <span key={n} className="text-[8px] px-2 py-0.5 rounded-lg bg-white/5 text-foreground/30 font-black uppercase tracking-widest border border-white/5">{n}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-foreground/70 font-bold uppercase tracking-tight text-xs">{crypto.name}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant={crypto.stock_status === 'IN STOCK' ? 'default' : 'destructive'}
                                                className={`cursor-pointer font-black text-[9px] tracking-widest uppercase transition-all px-4 py-1.5 rounded-xl border ${crypto.stock_status === 'IN STOCK' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20'}`}
                                                onClick={() => handleStockToggle(crypto.id, crypto.stock_status)}
                                            >
                                                {crypto.stock_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-10">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditClick(crypto)}
                                                    className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleActiveToggle(crypto.id, crypto.is_active)}
                                                    className={`px-5 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${crypto.is_active ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20' : 'bg-white/5 border-white/10 text-foreground/30 hover:bg-white/10'}`}
                                                >
                                                    {crypto.is_active ? "Active" : "Hidden"}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(crypto)}
                                                    className="px-3 py-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all active:scale-95"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden divide-y divide-white/5">
                    {loading ? (
                        <div className="p-12 text-center text-foreground/20 italic font-medium text-xs uppercase tracking-widest">Loading assets...</div>
                    ) : cryptos.length === 0 ? (
                        <div className="p-12 text-center text-foreground/20 italic font-medium text-xs uppercase tracking-widest">No assets found</div>
                    ) : (
                        cryptos.map((crypto) => (
                            <div key={crypto.id} className="p-8 space-y-6 hover:bg-white/2 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center p-3 shrink-0">
                                            <Image
                                                src={crypto.icon_url?.startsWith('http') ? crypto.icon_url : `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${crypto.symbol.toLowerCase()}.svg`}
                                                alt={crypto.symbol}
                                                width={40}
                                                height={40}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    const target = e.currentTarget as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    if (target.parentElement) target.parentElement.innerText = crypto.symbol[0];
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-black tracking-tight text-lg leading-none mb-2 uppercase">{crypto.symbol}</h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {crypto.networks?.map(n => (
                                                    <span key={n} className="text-[7px] px-2 py-0.5 rounded bg-white/5 text-foreground/40 font-black uppercase tracking-widest border border-white/5">{n}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={crypto.stock_status === 'IN STOCK' ? 'default' : 'destructive'}
                                        className={`font-black text-[9px] tracking-widest uppercase transition-all px-4 py-2 rounded-xl border ${crypto.stock_status === 'IN STOCK' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 active:bg-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20 active:bg-rose-500/20'}`}
                                        onClick={() => handleStockToggle(crypto.id, crypto.stock_status)}
                                    >
                                        {crypto.stock_status}
                                    </Badge>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <button
                                            onClick={() => handleEditClick(crypto)}
                                            className="flex-1 py-4 rounded-2xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest active:bg-white/10 active:scale-95 transition-all"
                                        >
                                            Edit Details
                                        </button>
                                        <button
                                            onClick={() => handleActiveToggle(crypto.id, crypto.is_active)}
                                            className={`flex-1 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${crypto.is_active ? 'bg-primary/10 border-primary/20 text-primary active:bg-primary/20' : 'bg-white/5 border-white/10 text-foreground/30 active:bg-white/10'}`}
                                        >
                                            {crypto.is_active ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteClick(crypto)}
                                        className="w-full py-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest active:bg-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="h-4 w-4" /> Delete Asset
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
                <DialogContent className="max-w-md bg-zinc-950 border-zinc-800">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight text-rose-500">Confirm Deletion</DialogTitle>
                        <DialogDescription className="text-sm text-foreground/40">
                            This action cannot be undone. This will permanently delete this cryptocurrency from your inventory.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 pt-4">
                        <Button
                            onClick={() => setDeleteConfirmId(null)}
                            variant="outline"
                            className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs h-12 rounded-xl"
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteConfirm}
                            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-xs h-12 rounded-xl"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
