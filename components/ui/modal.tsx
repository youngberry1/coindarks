'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ReactNode, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, description, children, maxWidth = 'max-w-md' }: ModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                            "fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 p-4",
                            maxWidth
                        )}
                    >
                        <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
                            {/* Glass Effect Overlay */}
                            <div className="absolute inset-0 bg-foreground/5 pointer-events-none opacity-5 dark:opacity-10" />

                            <div className="relative z-10 p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xl font-bold text-foreground">{title}</h3>
                                    <button
                                        onClick={onClose}
                                        className="p-1 rounded-lg text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {description && (
                                    <p className="text-sm text-foreground/60 mb-6">{description}</p>
                                )}

                                <div>{children}</div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    variant?: 'destructive' | 'default' | 'success';
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isLoading = false,
    variant = 'default'
}: ConfirmationModalProps) {
    const getVariantStyles = () => {
        switch (variant) {
            case 'destructive': return 'bg-red-500 hover:bg-red-600 text-white';
            case 'success': return 'bg-green-500 hover:bg-green-600 text-white';
            default: return 'bg-primary hover:bg-primary-dark text-white';
        }
    };

    const getIcon = () => {
        switch (variant) {
            case 'destructive': return <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />;
            case 'success': return <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />;
            default: return null;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="">
            <div className="flex flex-col items-center text-center">
                {getIcon()}
                <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
                <p className="text-foreground/60 mb-8">{description}</p>

                <div className="flex gap-3 w-full">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-border text-foreground/70 font-medium hover:bg-foreground/5 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={cn(
                            "flex-1 px-4 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center",
                            getVariantStyles()
                        )}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
