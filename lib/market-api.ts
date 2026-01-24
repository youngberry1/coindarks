export const ASSET_IDS = ["bitcoin", "stellar", "tether", "usd-coin", "solana", "litecoin"];

export async function fetchRawMarketData() {
    try {
        const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ASSET_IDS.join(",")}&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`,
            {
                next: { revalidate: 30 }, // Cache for 30 seconds globally
            }
        );

        if (!response.ok) {
            throw new Error(`Coingecko API returned ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("[MARKET_FETCH_ERROR]", error);
        return null;
    }
}
