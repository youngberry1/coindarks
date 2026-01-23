"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export function AdminNotificationListener() {
    // Determine if we can use AudioContext (client-side only)
    const audioContextRef = useRef<AudioContext | null>(null);

    const playNotificationSound = () => {
        try {
            if (!audioContextRef.current) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }

            const ctx = audioContextRef.current;
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            // Play a pleasant "ding"
            // E5 (659.25Hz) to C6 (1046.50Hz) sweep for a "ding" data effect
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(659.25, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1);

            // Envelope
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05); // Attack
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5); // Decay

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.5);

        } catch (error) {
            console.error("Audio playback failed:", error);
        }
    };

    useEffect(() => {
        // Create a single channel for admin notifications
        const channel = supabase
            .channel('admin-realtime-notifications')

            // Listen for new orders
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'orders',
                },
                (payload) => {
                    if (payload.new) {
                        playNotificationSound();
                        toast.info("New Order Received", {
                            description: `Order #${payload.new.order_number} (${payload.new.asset}) is pending review.`,
                            duration: 8000,
                            icon: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        });
                    }
                }
            )

            // Listen for new KYC
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'kyc_submissions',
                },
                (payload) => {
                    if (payload.new) {
                        playNotificationSound();
                        toast.info("New KYC Submission", {
                            description: "A user has submitted documents for verification.",
                            duration: 8000,
                            icon: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        });
                    }
                }
            )
            .subscribe((status, err) => {
                if (err) console.error("Realtime Error:", err);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return null; // This component is invisible
}
