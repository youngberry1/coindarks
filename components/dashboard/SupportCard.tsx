'use client';

import { Settings } from 'lucide-react';
import Link from 'next/link';

export function SupportCard() {
    return (
        <div className="glass-morphism rounded-3xl p-8 border border-white/5 text-center">
            <div className="h-16 w-16 mx-auto rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                <Settings className="h-8 w-8 text-secondary" />
            </div>
            <h4 className="font-bold mb-2">Need Help?</h4>
            <p className="text-xs text-foreground/40 mb-6">
                Our support team is available 24/7 for you.
            </p>
            <Link
                href="/support"
                className="block w-full py-3 rounded-xl border border-white/10 text-xs font-bold hover:bg-foreground/5 transition-all"
            >
                Contact Support
            </Link>
        </div>
    );
}
