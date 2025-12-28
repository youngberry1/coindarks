import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Navbar } from "@/components/dashboard/Navbar";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar - Desktop */}
            <Sidebar role={session.user.role} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:ml-72 min-h-screen transition-all duration-300">
                <Navbar user={session.user} />

                <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
                    {children}
                </main>

                {/* Optional Footer or decorative elements */}
                <footer className="p-10 border-t border-white/5 text-center text-foreground/20 text-[10px] font-bold uppercase tracking-[0.2em]">
                    CoinDarks Secure Infrastructure • © {new Date().getFullYear()}
                </footer>
            </div>
        </div>
    );
}
