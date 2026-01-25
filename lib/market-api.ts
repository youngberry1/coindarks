export const ASSET_IDS = ["bitcoin", "stellar", "tether", "usd-coin", "solana", "litecoin"];

/**
 * Robust Fetch Helper with Timeout & Retry
 * Prevents "fetch failed" / ETIMEDOUT from hanging the app
 */
async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 2): Promise<unknown> {
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

            throw new Error(`API returned ${response.status}`);
        } catch (err: unknown) {
            clearTimeout(timeoutId);
            const error = err as Error;
            if (error.name === 'AbortError') console.warn(`[MARKET_API] Timeout on attempt ${i + 1}`);
            if (i === retries) throw err;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

export async function fetchRawMarketData() {
    try {
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ASSET_IDS.join(",")}&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`;

        return await fetchWithRetry(url, {
            next: { revalidate: 30 }
        });
    } catch (error) {
        console.error("[MARKET_FETCH_ERROR]", error);
        return null;
    }
}
