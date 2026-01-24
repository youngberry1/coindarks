"use server";


import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price";
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

export type ExchangeRate = {
    pair: string;
    rate: number;
    manual_rate: number | null;
    buy_margin: number;
    sell_margin: number;
    is_automated: boolean;
    display_rate: number; // The final rate shown to user (Base +/- Margin)
    percent_change_24h: number;
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
    const pairsToFetch = dbRates.filter((r) => r.is_active || true);

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

    if (currencies.size === 0) currencies.add('usd');

    let apiRates: Record<string, Record<string, number>> = {};

    if (ids.size > 0) {
        const idString = Array.from(ids).join(',');
        const currencyString = Array.from(currencies).join(',');
        const url = `${COINGECKO_API_URL}?ids=${idString}&vs_currencies=${currencyString}&include_24hr_change=true`;
        const options = COINGECKO_API_KEY ? { headers: { 'x-cg-demo-api-key': COINGECKO_API_KEY } } : {};

        // Robust Fetch Helper with Timeout & Retry
        const fetchWithRetry = async (url: string, options: RequestInit, retries = 2): Promise<unknown> => {
            for (let i = 0; i <= retries; i++) {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

                try {
                    const response = await fetch(url, { ...options, signal: controller.signal });
                    clearTimeout(timeoutId);
                    if (response.ok) return await response.json();
                    if (response.status === 429) { // Rate limit
                        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
                        continue;
                    }
                } catch (err: unknown) {
                    clearTimeout(timeoutId);
                    if (err instanceof Error && err.name === 'AbortError') console.warn(`Fetch timeout on attempt ${i + 1}`);
                    if (i === retries) throw err;
                    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                }
            }
        };

        try {
            apiRates = await fetchWithRetry(url, { ...options, next: { revalidate: 30 } }) as Record<string, Record<string, number>>;
        } catch (e) {
            console.error("CoinGecko API Final Failure:", e);
        }
    }

    // 3. Calculate final rates & multipliers
    const ghsBridge = dbRates.find(r => r.pair === 'USD-GHS' || r.pair === 'USDT-GHS');
    const ngnBridge = dbRates.find(r => r.pair === 'USD-NGN' || r.pair === 'USDT-NGN');

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

        // Bridge Multiplier Logic for display_rate
        let displayRate = baseRate;
        if (quote === 'GHS' && baseRate === 0 && ghsBridge) {
            // If GHS rate is missing (automated fail), try to bridge via USD
            const btcUsd = dbRates.find(rt => rt.pair === `${base}-USD` || rt.pair === `${base}-USDT`);
            if (btcUsd) {
                const usdPrice = btcUsd.is_automated && apiRates[assetMapping[base]]?.usd
                    ? apiRates[assetMapping[base]].usd
                    : (Number(btcUsd.manual_rate) || 0);
                displayRate = usdPrice * (Number(ghsBridge.manual_rate) || 0);
            }
        } else if (quote === 'NGN' && baseRate === 0 && ngnBridge) {
            // If NGN rate is missing, bridge via USD
            const btcUsd = dbRates.find(rt => rt.pair === `${base}-USD` || rt.pair === `${base}-USDT`);
            if (btcUsd) {
                const usdPrice = btcUsd.is_automated && apiRates[assetMapping[base]]?.usd
                    ? apiRates[assetMapping[base]].usd
                    : (Number(btcUsd.manual_rate) || 0);
                displayRate = usdPrice * (Number(ngnBridge.manual_rate) || 0);
            }
        }

        return {
            pair: r.pair,
            rate: baseRate,
            manual_rate: Number(r.manual_rate),
            buy_margin: Number(r.buy_margin),
            sell_margin: Number(r.sell_margin),
            is_automated: r.is_automated,
            display_rate: displayRate,
            percent_change_24h: coingeckoId && apiRates[coingeckoId] ? (apiRates[coingeckoId][`${quoteLower}_24h_change`] || 0) : 0
        };
    });
}

// Admin Actions for Rates
export async function updateRateConfig(pair: string, data: { manual_rate?: number; buy_margin?: number; sell_margin?: number; is_automated?: boolean }) {
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
        .insert({ pair, is_automated: true, buy_margin: 2, sell_margin: 2 })
        .select()
        .single();

    if (error) return { error: "Failed to add pair" };
    revalidatePath('/admin/settings');

    // Transform to match RateData structure (basic)
    return { success: "Pair added", rate: { ...newRate, display_rate: 0, percent_change_24h: 0 } as ExchangeRate };
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
