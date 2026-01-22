"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { newVerification } from "@/actions/new-verification";
import { Loading } from "@/components/ui/Loading";
import { Logo } from "@/components/ui/Logo";

function VerifyContent() {
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    useEffect(() => {
        const verify = async () => {
            if (!token || success || error) return;
            try {
                const data = await newVerification(token);
                if (data.success) setSuccess(data.success);
                else setError(data.error);
            } catch {
                setError("Registry synchronization failed.");
            }
        };
        verify();
    }, [token, success, error]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-[480px] glass-card p-10 sm:p-14 rounded-[48px] shadow-2xl relative z-10 text-center space-y-10"
        >
            <div className="space-y-6">
                <Logo className="mx-auto" />
                <div className="space-y-2">
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
                        {!success && !error && "Registry Link."}
                        {success && "Access Verified."}
                        {error && "Registry Error."}
                    </h2>
                    <p className="text-sm text-foreground/40 font-medium uppercase tracking-widest">
                        {!success && !error && "Synchronizing Profile"}
                        {success && "Security Check Complete"}
                        {error && "Synchronization Failed"}
                    </p>
                </div>
            </div>

            <div className="flex justify-center h-20 items-center">
                {!success && !error && (
                    <div className="flex flex-col items-center gap-4">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full shadow-2xl shadow-primary/20"
                        />
                    </div>
                )}
                {success && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="h-20 w-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-2xl shadow-emerald-500/10"
                    >
                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                    </motion.div>
                )}
                {error && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="h-20 w-20 rounded-3xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-2xl shadow-red-500/10"
                    >
                        <XCircle className="h-10 w-10 text-red-500" />
                    </motion.div>
                )}
            </div>

            <div className="space-y-4">
                <p className="text-base text-foreground/60 font-medium leading-relaxed">
                    {!success && !error && "Verifying your security credentials against the institutional registry..."}
                    {success && "Your master profile has been successfully integrated. Access to all exchange pipelines is now granted."}
                    {error && error}
                </p>
            </div>

            <div className="pt-4">
                <Link
                    href="/login"
                    className="w-full h-16 inline-flex items-center justify-center gap-3 rounded-[24px] bg-primary text-white text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95"
                >
                    {success ? "Access Portal" : "Return to Login"}
                    <ArrowRight className="h-5 w-5" />
                </Link>
            </div>

            {success && (
                <div className="pt-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">
                    <ShieldCheck className="h-3 w-3" /> Professional Security Active
                </div>
            )}
        </motion.div>
    );
}

export default function VerifyPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-mesh opacity-30 -z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[160px] rounded-full -z-10 animate-pulse-slow" />

            <Suspense fallback={<Loading message="Accessing secure channel..." />}>
                <VerifyContent />
            </Suspense>
        </div>
    );
}
