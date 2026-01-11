import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import {
    BookOpen,
    Activity,
    Calculator,
    ArrowRightLeft,
    Info,
    Settings
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

                <div className="p-8 rounded-[40px] bg-card-bg/50 border border-white/5 space-y-6">
                    <p className="text-lg text-foreground/80 leading-relaxed">
                        To simplify your job, you do NOT need to set a rate for every single crypto (BTC, ETH, SOL, etc.).
                        Instead, we use <strong>USD</strong> as a &quot;Bridge&quot;.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 items-center">
                        <div className="p-6 rounded-3xl bg-black/20 text-center space-y-3 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Activity className="h-8 w-8 text-emerald-500 mx-auto" />
                            <h3 className="font-bold text-emerald-500">Global Crypto Price</h3>
                            <p className="text-xs text-foreground/50">Automated from automated market data</p>
                            <div className="py-2 px-4 rounded-lg bg-emerald-500/10 text-emerald-500 font-mono font-bold text-sm inline-block">
                                BTC = $95,000
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-2 text-foreground/20">
                            <ArrowRightLeft className="h-8 w-8 animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-widest">Multiplied By</span>
                        </div>

                        <div className="p-6 rounded-3xl bg-black/20 text-center space-y-3 relative overflow-hidden group border-2 border-primary/20">
                            <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Settings className="h-8 w-8 text-primary mx-auto" />
                            <h3 className="font-bold text-primary">Your Manual Rate</h3>
                            <p className="text-xs text-foreground/50">You set this ONE time</p>
                            <div className="py-2 px-4 rounded-lg bg-primary/10 text-primary font-mono font-bold text-sm inline-block">
                                $1 USD = 16.50 GHS
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-linear-to-r from-emerald-500/10 via-primary/10 to-amber-500/10 border border-white/10 text-center">
                        <p className="text-sm font-bold text-foreground/50 uppercase tracking-widest mb-3">The Result</p>
                        <p className="text-2xl md:text-4xl font-black">
                            <span className="text-emerald-500">95,000</span> <span className="text-foreground/20">×</span> <span className="text-primary">16.50</span> <span className="text-foreground/20">=</span> <span className="text-white">1,567,500 GHS</span>
                        </p>
                        <p className="mt-4 text-sm text-foreground/60">
                            By changing <strong>only the USD-GHS rate</strong>, you automatically update prices for BTC, ETH, SOL, and every other coin instantly.
                        </p>
                    </div>
                </div>
            </section>

            {/* SECTION 2: TUTORIAL */}
            <section id="tutorial" className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-black text-xl">2</div>
                    <h2 className="text-3xl font-black">Step-by-Step Setup</h2>
                </div>

                <div className="space-y-12">
                    {/* Step A */}
                    <div className="relative pl-8 md:pl-0">
                        <div className="hidden md:flex absolute -left-4 top-0 bottom-0 w-1 bg-white/5 rounded-full" />

                        <div className="grid md:grid-cols-[200px,1fr] gap-8">
                            <div className="space-y-2">
                                <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-black uppercase tracking-widest">Step A</span>
                                <h3 className="text-xl font-bold">Create the Bridge</h3>
                            </div>
                            <div className="space-y-4">
                                <p className="text-foreground/70">
                                    First, tell the system how much <strong>$1 USD</strong> is worth in your local currency (e.g., Ghana Cedis).
                                </p>
                                <div className="p-6 rounded-2xl bg-card-bg border border-white/5 space-y-4">
                                    <ol className="list-decimal list-inside space-y-3 text-sm font-medium text-foreground/80">
                                        <li>Go to <strong>Admin Settings</strong> → <strong>Exchange Rates</strong>.</li>
                                        <li>Click the big blue <strong>&quot;Add Rate&quot;</strong> button.</li>
                                        <li>For Pair Name, enter exactly: <code className="bg-primary/20 text-primary px-2 py-1 rounded">USD-GHS</code> (or USD-NGN).</li>
                                        <li><strong>CRITICAL:</strong> Turn Automation <span className="text-red-500 font-bold">OFF</span>. You must set this manually.</li>
                                        <li>Enter your exchange rate (e.g., <code className="bg-white/10 px-2 py-1 rounded">16.50</code>).</li>
                                        <li>For Margin, usually enter <code className="bg-white/10 px-2 py-1 rounded">0</code> here (we apply margin later).</li>
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
                                <h3 className="text-xl font-bold">Add Crypto Assets</h3>
                            </div>
                            <div className="space-y-4">
                                <p className="text-foreground/70">
                                    Now add the coins you want to sell. These will pull prices automatically from the internet.
                                </p>
                                <div className="p-6 rounded-2xl bg-card-bg border border-white/5 space-y-4">
                                    <ol className="list-decimal list-inside space-y-3 text-sm font-medium text-foreground/80">
                                        <li>Click <strong>&quot;Add Rate&quot;</strong> again.</li>
                                        <li>Enter a pair like: <code className="bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded">BTC-USD</code>.</li>
                                        <li>Ensure Automation is <span className="text-emerald-500 font-bold">ON</span> (this is the default).</li>
                                        <li>
                                            <strong>Set your Profit Margin:</strong>
                                            <ul className="pl-6 mt-2 space-y-1 text-foreground/60 text-xs">
                                                <li>• Enter <code className="bg-white/10 px-1.5 rounded">2</code> for 2% profit.</li>
                                                <li>• Enter <code className="bg-white/10 px-1.5 rounded">5</code> for 5% profit.</li>
                                            </ul>
                                        </li>
                                        <li>Click <strong>Save</strong>.</li>
                                        <li>Repeat for other coins: <code className="mx-1">ETH-USD</code>, <code className="mx-1">SOL-USD</code>, <code className="mx-1">USDT-USD</code>.</li>
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
                    <h2 className="text-3xl font-black">Simple Check</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-card-bg/50 border border-white/5 flex flex-col h-full">
                        <h3 className="font-bold text-lg mb-4">If the rate is too low...</h3>
                        <p className="text-sm text-foreground/70 mb-6 flex-1">
                            Example: Bitcoin is showing as 95,000 GHS instead of 1.5 Million GHS.
                        </p>
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                            <p className="text-xs font-bold text-red-500 mb-1">THE CAUSE</p>
                            <p className="text-sm text-foreground/80">
                                You likely forgot to add the <code className="font-mono bg-black/20 px-1 rounded">USD-GHS</code> bridge pair, so the system is just showing the USD price. Go back to <strong>Step A</strong>.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-card-bg/50 border border-white/5 flex flex-col h-full">
                        <h3 className="font-bold text-lg mb-4">How to Change Today&apos;s Rate</h3>
                        <p className="text-sm text-foreground/70 mb-6 flex-1">
                            The dollar rate changed from 16.50 to 17.00. How do I update everything?
                        </p>
                        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                            <p className="text-xs font-bold text-primary mb-1">THE SOLUTION</p>
                            <p className="text-sm text-foreground/80">
                                Just edit the single <code className="font-mono bg-black/20 px-1 rounded">USD-GHS</code> pair and change 16.50 to 17.00. All crypto prices (BTC, ETH, etc.) will instantly update to reflect the new rate.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
