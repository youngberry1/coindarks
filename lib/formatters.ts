export const STABLECOINS = ['USDT', 'USDC', 'DAI', 'USD', 'BUSD'];

/**
 * Smartly formats a crypto amount based on the asset symbol.
 * - Stablecoins (USDT, USDC): Defaults to 2 decimals, max 4 if small fraction.
 * - Volatile (BTC, ETH): Defaults to 8 decimals precision, removing trailing zeros.
 * 
 * @param amount The numeric amount to format.
 * @param symbol The asset symbol (e.g., 'BTC', 'USDT').
 * @param isInput If true, returns string without minimal decimal enforcement for inputs.
 */
export function formatCryptoAmount(amount: number | string, symbol: string): string {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(value)) return "0.00";
    if (value === 0) return "0.00";

    const isStable = STABLECOINS.includes(symbol.toUpperCase());

    if (isStable) {
        // For stablecoins, we behave like Fiat (2 decimals) mostly.
        // If there's a tiny fraction we might show up to 4, but usually 2 is standard for USDT.
        return value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4 // Allow up to 4 if there are significant small digits, otherwise standard 2
        });
    }

    // For volatile/high-value assets (BTC, ETH), show up to 8 decimals
    // but don't force trailing zeros if it's a clean number (e.g. 1.5 BTC)
    return value.toLocaleString('en-US', {
        minimumFractionDigits: 2, // Always show at least 2 for consistency
        maximumFractionDigits: 8
    });
}

/**
 * Plain number formatter for raw calculations (returning string fixed)
 */
export function getCryptoPrecision(symbol: string): number {
    return STABLECOINS.includes(symbol.toUpperCase()) ? 4 : 8;
}
