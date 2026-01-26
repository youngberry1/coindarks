"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { checkNewNotifications } from "@/actions/admin-notifications";

export function AdminNotificationListener() {
    // Determine if we can use AudioContext (client-side only)
    const audioContextRef = useRef<AudioContext | null>(null);
    const [lastCheckTime, setLastCheckTime] = useState<string>(new Date().toISOString());

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
        // Polling interval (every 3 seconds for better responsiveness)
        const INTERVAL_MS = 3000;





        // Using a Ref to track lastCheckTime to avoid dependency loop in useEffect
        let currentTimeReference = lastCheckTime;

        const intervalId = setInterval(async () => {
            try {
                const { events, serverTime } = await checkNewNotifications(currentTimeReference);

                if (events && events.length > 0) {

                    // Play sound once for the batch
                    playNotificationSound();

                    events.forEach(event => {
                        toast.info(event.title, {
                            description: event.description,
                            duration: 8000,
                            icon: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        });
                    });
                }

                // Update time for next check
                currentTimeReference = serverTime;
                // We don't strictly need to update state if we only use the ref/local var,
                // but updating state is good for debugging if we displayed it.
                setLastCheckTime(serverTime);

            } catch (err) {
                console.error("🔔 [AdminNotifications] Polling Error:", err);
            }
        }, INTERVAL_MS);

        return () => {
            clearInterval(intervalId);
        };
        // We act like a mount-only effect, managing time internally
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null; // This component is invisible
}
