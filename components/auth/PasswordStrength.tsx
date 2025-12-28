
"use client";

import { Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PasswordStrengthProps {
    password: string;
    confirmPassword?: string;
    showMatch?: boolean;
}

export const PasswordStrength = ({
    password,
    confirmPassword = "",
    showMatch = false
}: PasswordStrengthProps) => {
    const requirements = [
        {
            label: "At least 6 characters",
            met: password.length >= 6,
        },
        {
            label: "At least one uppercase letter",
            met: /[A-Z]/.test(password),
        },
        {
            label: "At least one special character",
            met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        },
    ];

    const isMatching = showMatch && password.length > 0 && password === confirmPassword;
    const hasTypedConfirm = showMatch && confirmPassword.length > 0;
    const metCount = requirements.filter(r => r.met).length;
    const strengthPercentage = (metCount / requirements.length) * 100;

    return (
        <div className="space-y-4 py-2">
            {/* Requirements List - Minimal Design */}
            <div className="space-y-2">
                {requirements.map((req, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 group"
                    >
                        <div className={`shrink-0 transition-all duration-300 ${req.met
                            ? 'text-green-500'
                            : 'text-foreground/20'
                            }`}>
                            {req.met ? (
                                <Check className="h-4 w-4 stroke-3" />
                            ) : (
                                <X className="h-4 w-4" />
                            )}
                        </div>
                        <span className={`text-sm font-medium transition-colors duration-300 ${req.met
                            ? 'text-foreground'
                            : 'text-foreground/40'
                            }`}>
                            {req.label}
                        </span>
                    </motion.div>
                ))}

                {/* Password Match Indicator */}
                {showMatch && (
                    <AnimatePresence>
                        {hasTypedConfirm && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex items-center gap-3 pt-2 border-t border-foreground/5"
                            >
                                <div className={`shrink-0 transition-all duration-300 ${isMatching
                                    ? 'text-green-500'
                                    : 'text-red-500'
                                    }`}>
                                    {isMatching ? (
                                        <Check className="h-4 w-4 stroke-3" />
                                    ) : (
                                        <X className="h-4 w-4 stroke-3" />
                                    )}
                                </div>
                                <span className={`text-sm font-medium transition-colors duration-300 ${isMatching
                                    ? 'text-green-500'
                                    : 'text-red-500'
                                    }`}>
                                    {isMatching ? "Passwords match" : "Passwords do not match"}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>

            {/* Strength Progress Bar */}
            <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                        Password Strength
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${metCount === 3 ? 'text-green-500' :
                        metCount >= 1 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                        {metCount === 3 ? 'Strong' :
                            metCount >= 1 ? 'Medium' : 'Weak'}
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full transition-all duration-500 ${metCount === 3 ? 'bg-green-500' :
                            metCount >= 1 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${strengthPercentage}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>
            </div>
        </div>
    );
};
