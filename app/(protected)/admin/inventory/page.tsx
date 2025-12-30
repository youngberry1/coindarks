import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    Package,
    AlertCircle
} from "lucide-react";
import { InventoryToggleCard } from "@/components/admin/InventoryToggleCard";

export default async function AdminInventoryPage() {
    const session = await auth();

    // Strict admin check
    if (session?.user?.role !== "ADMIN") {
        redirect("/dashboard");
    }

    // Fetch inventory
    const { data: inventory } = await supabase
        .from('inventory')
        .select('*')
        .order('asset', { ascending: true });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Inventory Control</h1>
                    <p className="text-foreground/50 font-medium">
                        Toggle asset availability for trading and set stock status.
                    </p>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <Package className="h-5 w-5 text-primary" />
                    <div>
                        <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest leading-none mb-1">Total Assets</p>
                        <p className="text-sm font-bold">{inventory?.length || 0} Listed</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inventory?.map((item) => (
                    <InventoryToggleCard key={item.asset} item={item} />
                ))}
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-4 p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 max-w-2xl">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-sm font-bold text-amber-500">Inventory Notice</p>
                    <p className="text-xs text-foreground/50 leading-relaxed font-medium">
                        Disabling an asset will immediately hide it from the Buy/Sell interfaces for all users.
                        Pending orders for disabled assets will still need to be processed manually by the finance team.
                    </p>
                </div>
            </div>
        </div>
    );
}
