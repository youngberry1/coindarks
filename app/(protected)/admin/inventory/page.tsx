import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import CryptoManager from "@/components/admin/CryptoManager";

export const metadata: Metadata = {
    title: "Inventory Control | CoinDarks Admin",
    description: "Manage tradeable assets and stock levels.",
};

export default async function AdminInventoryPage() {
    const session = await auth();

    // Strict admin check
    if (session?.user?.role !== "ADMIN") {
        redirect("/dashboard");
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Inventory Control</h1>
                    <p className="text-foreground/50 font-medium">
                        Manage tradeable assets, stock status, and visibility.
                    </p>
                </div>
            </div>

            <CryptoManager />
        </div>
    );
}
