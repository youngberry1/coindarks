import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import {
    BookOpen,
    Activity,
    Calculator,
    ArrowRightLeft,
    Info,
    Settings,
    TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
    title: "Exchange Rate Documentation | CoinDarks Admin",
    description: "Complete guide to managing exchange rates and trading pairs",
};

export default async function DocsPage() {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
        redirect("/dashboard");
    }

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex items-center gap-6 border-b border-white/10 pb-8">
                <div className="h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <BookOpen className="h-10 w-10 text-primary" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">Exchange Rate Master Guide</h1>
                    <p className="text-lg text-foreground/60 font-medium">Step-by-step functionality for managing your crypto rates.</p>
                </div>
            </div>

            {/* Quick Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a href="#concept" className="p-6 rounded-3xl bg-card-bg/50 border border-white/5 hover:border-primary/20 hover:bg-white/5 transition-all group">
                    <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Info className="h-5 w-5 text-primary" />
                    </div>
                    <p className="font-bold text-lg mb-1">1. The Concept</p>
                    <p className="text-sm text-foreground/40">Understand the &quot;Bridge&quot; logic</p>
                </a>
                <a href="#tutorial" className="p-6 rounded-3xl bg-card-bg/50 border border-white/5 hover:border-emerald-500/20 hover:bg-white/5 transition-all group">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Settings className="h-5 w-5 text-emerald-500" />
                    </div>
                    <p className="font-bold text-lg mb-1">2. Setup Tutorial</p>
                    <p className="text-sm text-foreground/40">Follow exact steps</p>
                </a>
                <a href="#verification" className="p-6 rounded-3xl bg-card-bg/50 border border-white/5 hover:border-amber-500/20 hover:bg-white/5 transition-all group">
                    <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Calculator className="h-5 w-5 text-amber-500" />
                    </div>
                    <p className="font-bold text-lg mb-1">3. Verification</p>
                    <p className="text-sm text-foreground/40">Check your math</p>
                </a>
            </div>

            {/* SECTION 1: THE CONCEPT */}
            <section id="concept" className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary text-black flex items-center justify-center font-black text-xl">1</div>
                    <h2 className="text-3xl font-black">How It Works (The &quot;Bridge&quot; System)</h2>
                </div>

                <div className="p-8 rounded-[40px] bg-card-bg/50 border border-white/5 space-y-8">
                    <p className="text-lg text-foreground/80 leading-relaxed">
                        To simplify your job, you do NOT need to set a rate for every single crypto (BTC, ETH, SOL, etc.).
                        Instead, we use <strong>USD</strong> as a &quot;Bridge&quot;.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 items-center">
                        <div className="p-6 rounded-3xl bg-black/20 text-center space-y-3 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Activity className="h-8 w-8 text-emerald-500 mx-auto" />
                            <h3 className="font-bold text-emerald-500">Global Crypto Price</h3>
                            <p className="text-xs text-foreground/50">Automated from market data</p>
                            <div className="py-2 px-4 rounded-lg bg-emerald-500/10 text-emerald-500 font-mono font-bold text-sm inline-block">
                                BTC = $95,000
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-2 text-foreground/20">
                            <ArrowRightLeft className="h-8 w-8 animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-widest text-center">Multiplied By &<br />Spread Applied</span>
                        </div>

                        <div className="p-6 rounded-3xl bg-black/20 text-center space-y-3 relative overflow-hidden group border-2 border-primary/20">
                            <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Settings className="h-8 w-8 text-primary mx-auto" />
                            <h3 className="font-bold text-primary">Your USD Rate</h3>
                            <p className="text-xs text-foreground/50">Set this for GHS or NGN</p>
                            <div className="py-2 px-4 rounded-lg bg-primary/10 text-primary font-mono font-bold text-sm inline-block">
                                $1 USD = 17.00 GHS
                            </div>
                        </div>
                    </div>

                    {/* PRO TIP: BUY/SELL EXPLANATION */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 space-y-4">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-emerald-500" />
                                <h3 className="font-bold uppercase tracking-widest text-sm text-emerald-500">Buy Rate (USER BUYS)</h3>
                            </div>
                            <p className="text-sm text-foreground/70 leading-relaxed">
                                When a user <strong>buys</strong> from you, the system <strong>ADDS</strong> your specific <strong>Buy Margin</strong> to the base price.
                            </p>
                            <div className="p-4 rounded-2xl bg-black/20 font-mono text-xs space-y-1">
                                <p className="text-foreground/40">Base Price: 100 GHS</p>
                                <p className="text-foreground/40">Buy Margin: +3%</p>
                                <p className="text-white font-bold text-sm underline">User Pays: 103 GHS</p>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/10 space-y-4">
                            <div className="flex items-center gap-2">
                                <Calculator className="h-5 w-5 text-rose-500" />
                                <h3 className="font-bold uppercase tracking-widest text-sm text-rose-500">Sell Rate (USER SELLS)</h3>
                            </div>
                            <p className="text-sm text-foreground/70 leading-relaxed">
                                When a user <strong>sells</strong> to you, the system <strong>SUBTRACTS</strong> your specific <strong>Sell Margin</strong> from the base price.
                            </p>
                            <div className="p-4 rounded-2xl bg-black/20 font-mono text-xs space-y-1">
                                <p className="text-foreground/40">Base Price: 100 GHS</p>
                                <p className="text-foreground/40">Sell Margin: -1.5%</p>
                                <p className="text-white font-bold text-sm underline">User Receives: 98.5 GHS</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-linear-to-r from-emerald-500/10 via-primary/10 to-amber-500/10 border border-white/10 text-center">
                        <p className="text-sm font-bold text-foreground/50 uppercase tracking-widest mb-3">Independent Profit Control</p>
                        <p className="mt-2 text-sm text-foreground/60 max-w-2xl mx-auto">
                            You can now have a wide spread (e.g. 5% Buy / 1% Sell) or a tight one. By changing only the <strong>USD-GHS</strong> rate, you instantly update the base price for <strong>ALL</strong> crypto assets while keeping your custom profit margins intact.
                        </p>
                    </div>
                </div>
            </section>

            {/* SECTION 2: TUTORIAL */}
            <section id="tutorial" className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-black text-xl">2</div>
                    <h2 className="text-3xl font-black">Setting the Buy/Sell Rate</h2>
                </div>

                <div className="space-y-12">
                    {/* Step A */}
                    <div className="relative pl-8 md:pl-0">
                        <div className="hidden md:flex absolute -left-4 top-0 bottom-0 w-1 bg-white/5 rounded-full" />

                        <div className="grid md:grid-cols-[200px,1fr] gap-8">
                            <div className="space-y-2">
                                <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-black uppercase tracking-widest">Step A</span>
                                <h3 className="text-xl font-bold">The Cedi Multiplier</h3>
                            </div>
                            <div className="space-y-4">
                                <p className="text-foreground/70">
                                    Define the base value of $1 USD in GHS. This is the foundation of your pricing.
                                </p>
                                <div className="p-6 rounded-2xl bg-card-bg border border-white/5 space-y-4">
                                    <ol className="list-decimal list-inside space-y-3 text-sm font-medium text-foreground/80">
                                        <li>Go to <strong>Admin Settings</strong> → <strong>Exchange Rates</strong>.</li>
                                        <li>Locate or Add <code className="bg-primary/20 text-primary px-2 py-1 rounded">USD-GHS</code>.</li>
                                        <li>Set Animation to <span className="text-amber-500 font-bold">MANUAL</span>.</li>
                                        <li>Enter today&apos;s market rate (e.g., <code className="bg-white/10 px-2 py-1 rounded">17.20</code>).</li>
                                        <li><strong>Buy/Sell Margins:</strong> Set both to <code className="bg-white/10 px-2 py-1 rounded">0</code> (this is a bridge).</li>
                                        <li>Click <strong>Save</strong>.</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step B */}
                    <div className="relative pl-8 md:pl-0">
                        <div className="hidden md:flex absolute -left-4 top-0 bottom-0 w-1 bg-white/5 rounded-full" />

                        <div className="grid md:grid-cols-[200px,1fr] gap-8">
                            <div className="space-y-2">
                                <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-black uppercase tracking-widest">Step B</span>
                                <h3 className="text-xl font-bold">Independent Margins</h3>
                            </div>
                            <div className="space-y-4">
                                <p className="text-foreground/70">
                                    Set individual margins for each asset to control your precise profit per trade direction.
                                </p>
                                <div className="p-6 rounded-2xl bg-card-bg border border-white/5 space-y-4">
                                    <ol className="list-decimal list-inside space-y-3 text-sm font-medium text-foreground/80">
                                        <li>Locate <code className="bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded">BTC-USD</code>.</li>
                                        <li>Set Automation to <span className="text-emerald-500 font-bold">AUTO</span>.</li>
                                        <li>
                                            <strong>Set Your Spread:</strong>
                                            <ul className="pl-6 mt-2 space-y-2 text-foreground/60 text-xs">
                                                <li>• <code className="bg-emerald-500/10 px-1.5 rounded text-emerald-500 font-bold">Buy %:</code> Controls price when users buy from you.</li>
                                                <li>• <code className="bg-rose-500/10 px-1.5 rounded text-rose-500 font-bold">Sell %:</code> Controls price when users sell to you.</li>
                                            </ul>
                                        </li>
                                        <li>Click <strong>Save</strong>.</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 3: VERIFICATION */}
            <section id="verification" className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black text-xl">3</div>
                    <h2 className="text-3xl font-black">Wait, Which Rate Do I Change?</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-card-bg/50 border border-white/5 flex flex-col h-full">
                        <h3 className="font-bold text-lg mb-4">Case 1: Market moves</h3>
                        <p className="text-sm text-foreground/70 mb-6 flex-1">
                            The GHS is now weaker against the Dollar (e.g. went from 17.0 to 17.5).
                        </p>
                        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                            <p className="text-xs font-bold text-primary mb-1">ACTION</p>
                            <p className="text-sm text-foreground/80 font-medium">
                                Update the <code className="font-mono bg-black/20 px-1 rounded">USD-GHS</code> base rate. This moves both Buy and Sell prices up together.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-card-bg/50 border border-white/5 flex flex-col h-full">
                        <h3 className="font-bold text-lg mb-4">Case 2: Directional Profit</h3>
                        <p className="text-sm text-foreground/70 mb-6 flex-1">
                            You have too much Bitcoin and want to encourage users to buy from you, but discourage them from selling to you.
                        </p>
                        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                            <p className="text-xs font-bold text-primary mb-1">ACTION</p>
                            <p className="text-sm text-foreground/80 font-medium">
                                Decrease the <code className="font-mono bg-black/20 px-1 rounded text-emerald-500">Buy %</code> to make your price more attractive, or increase the <code className="font-mono bg-black/20 px-1 rounded text-rose-500">Sell %</code> to pay users less.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
