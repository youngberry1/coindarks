"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { newVerification } from "@/actions/new-verification";

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
                if (data.success) {
                    setSuccess(data.success);
                } else {
                    setError(data.error);
                }
            } catch {
                setError("Something went wrong!");
            }
        };

        verify();
    }, [token, success, error]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-morphism p-10 rounded-3xl text-center space-y-6"
        >
            <div className="flex justify-center">
                {!success && !error && (
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                )}
                {success && (
                    <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                )}
                {error && (
                    <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
                        <XCircle className="h-8 w-8 text-red-500" />
                    </div>
                )}
            </div>

            <h1 className="text-2xl font-bold">
                {!success && !error && "Confirming your verification"}
                {success && "Verification successful!"}
                {error && "Verification failed"}
            </h1>

            <p className="text-foreground/60 text-sm">
                {!success && !error && "Please wait while we verify your email address..."}
                {success && "Your email has been confirmed. You can now access all features."}
                {error && error}
            </p>

            <div className="pt-4">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-3 text-sm font-bold text-white hover:bg-primary-dark transition-all"
                >
                    {success ? "Go to Login" : "Back to Login"}
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </motion.div>
    );
}

export default function VerifyPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <Suspense fallback={
                <div className="glass-morphism p-10 rounded-3xl text-center">
                    <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                </div>
            }>
                <VerifyContent />
            </Suspense>
        </div>
    );
}
