
const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price";
// const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY; // Not using key for simple test if possible, or use from env

async function testFetch() {
    const dbRates = [
      { pair: "USDT-GHS", is_active: true, is_automated: false },
      { pair: "BTC-USD", is_active: true, is_automated: true },
      { pair: "LTC-USD", is_active: true, is_automated: true }
    ];

    const assetMapping = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'LTC': 'litecoin',
        'SOL': 'solana',
        'USDT': 'tether',
        'XLM': 'stellar',
        'USDC': 'usd-coin'
    };

    const ids = new Set();
    const currencies = new Set();

    dbRates.forEach((r) => {
        const [base, quote] = r.pair.split('-');
        if (assetMapping[base]) ids.add(assetMapping[base]);
        if (quote) currencies.add(quote.toLowerCase());
    });

    console.log("IDs:", Array.from(ids));
    console.log("Currencies:", Array.from(currencies));

    if (ids.size > 0) {
        const idString = Array.from(ids).join(',');
        const currencyString = Array.from(currencies).join(',');
        
        const url = `${COINGECKO_API_URL}?ids=${idString}&vs_currencies=${currencyString}`;
        console.log("Fetching URL:", url);

        try {
            const res = await fetch(url);
            const apiRates = await res.json();
            console.log("API Response:", JSON.stringify(apiRates, null, 2));

             dbRates.map((r) => {
                const [base, quote] = r.pair.split('-');
                const coingeckoId = assetMapping[base];
                const quoteLower = quote ? quote.toLowerCase() : 'usd';
        
                let baseRate = 0;
        
                if (r.is_automated && coingeckoId && apiRates[coingeckoId] && apiRates[coingeckoId][quoteLower]) {
                    baseRate = apiRates[coingeckoId][quoteLower];
                }
                console.log(`Pair: ${r.pair}, Rate: ${baseRate}`);
            });

        } catch (e) {
            console.error("Error:", e);
        }
    }
}

testFetch();
