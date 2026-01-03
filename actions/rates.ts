"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price";
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

export type ExchangeRate = {
    pair: string;
    rate: number;
    manual_rate: number | null;
    margin_percent: number;
    is_automated: boolean;
    display_rate: number; // The final rate shown to user (Base +/- Margin)
};

export async function getExchangeRates(): Promise<ExchangeRate[]> {
    // 1. Fetch config from DB
    const { data: dbRates, error } = await supabaseAdmin
        .from('exchange_rates')
        .select('*');

    if (error) {
        console.error("DB Rate Fetch Error:", error);
        return [];
    }

    if (!dbRates || dbRates.length === 0) return [];

    // 2. If any automated, fetch from API
    // Mapping: 'BTC-USD' -> 'bitcoin' vs 'usd'
    const pairsToFetch = dbRates.filter((r) => r.is_active || true); // Assuming all in DB are active

    // For now, hardcode mapping since we only have a few assets. 
    // Ideally store 'coingecko_id' in DB.
    const assetMapping: Record<string, string> = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'LTC': 'litecoin',
        'SOL': 'solana',
        'USDT': 'tether',
        'XLM': 'stellar',
        'USDC': 'usd-coin'
    };

    const ids = new Set<string>();
    const currencies = new Set<string>();

    pairsToFetch.forEach((r) => {
        const [base, quote] = r.pair.split('-');
        if (assetMapping[base]) ids.add(assetMapping[base]);
        if (quote) currencies.add(quote.toLowerCase());
    });

    // Default to USD if empty
    if (currencies.size === 0) currencies.add('usd');

    let apiRates: Record<string, Record<string, number>> = {};

    if (ids.size > 0) {
        try {
            const idString = Array.from(ids).join(',');
            const currencyString = Array.from(currencies).join(',');

            const url = `${COINGECKO_API_URL}?ids=${idString}&vs_currencies=${currencyString}`;
            const options = COINGECKO_API_KEY ? { headers: { 'x-cg-demo-api-key': COINGECKO_API_KEY } } : {};

            const res = await fetch(url, { ...options, next: { revalidate: 60 } }); // Cache for 60s
            apiRates = await res.json();
        } catch (e) {
            console.error("CoinGecko API Error:", e);
        }
    }

    // 3. Calculate final rates
    return dbRates.map((r) => {
        const [base, quote] = r.pair.split('-');
        const coingeckoId = assetMapping[base];
        const quoteLower = quote ? quote.toLowerCase() : 'usd';

        let baseRate = 0;

        if (r.is_automated && coingeckoId && apiRates[coingeckoId] && apiRates[coingeckoId][quoteLower]) {
            baseRate = apiRates[coingeckoId][quoteLower];
        } else {
            baseRate = Number(r.manual_rate) || Number(r.rate) || 0;
        }

        return {
            pair: r.pair,
            rate: baseRate,
            manual_rate: Number(r.manual_rate),
            margin_percent: Number(r.margin_percent),
            is_automated: r.is_automated,
            display_rate: baseRate // Just base for now, UI determines final
        };
    });
}

// Admin Actions for Rates
export async function updateRateConfig(pair: string, data: { manual_rate?: number; margin_percent?: number; is_automated?: boolean }) {
    const { error } = await supabaseAdmin
        .from('exchange_rates')
        .update(data)
        .eq('pair', pair);

    if (error) return { error: "Failed to update rate" };

    revalidatePath('/admin/settings');
    revalidatePath('/dashboard/exchange');
    return { success: "Rate updated" };
}

export async function createRatePair(pair: string): Promise<{ success?: string; error?: string; rate?: ExchangeRate }> {
    // 1. Check if exists
    const { data: existing } = await supabaseAdmin
        .from('exchange_rates')
        .select('*')
        .eq('pair', pair)
        .single();

    if (existing) return { error: "Pair already exists" };

    const { data: newRate, error } = await supabaseAdmin
        .from('exchange_rates')
        .insert({ pair, is_automated: true, margin_percent: 2 })
        .select()
        .single();

    if (error) return { error: "Failed to add pair" };
    revalidatePath('/admin/settings');

    // Transform to match RateData structure (basic)
    return { success: "Pair added", rate: { ...newRate, display_rate: 0 } as ExchangeRate };
}

export async function deleteRatePair(pair: string) {
    const { error } = await supabaseAdmin
        .from('exchange_rates')
        .delete()
        .eq('pair', pair);

    if (error) return { error: "Failed to delete pair" };
    revalidatePath('/admin/settings');
    return { success: "Pair deleted" };
}
