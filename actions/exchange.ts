"use server";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { generateOrderId } from "@/lib/utils/order-id";
import { getExchangeRates } from "@/actions/rates";
import { sendOrderStatusEmail } from "@/lib/mail";

export async function createOrder(data: {
    type: 'BUY' | 'SELL';
    asset: string;
    amount_input: number; // The amount the user typed
    input_type: 'CRYPTO' | 'FIAT'; // Which field the user filled
    fiat_currency: string;
    receiving_address: string; // User's wallet (for BUY) or Payment Info (for SELL)
}) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Authentication required" };

    try {
        // 1. Verify KYC
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('kyc_status, role')
            .eq('id', session.user.id)
            .single();

        // Exempt ADMINs from KYC check
        if (user?.role !== 'ADMIN' && user?.kyc_status !== 'APPROVED') {
            return { error: "KYC verification required to trade" };
        }

        // 2. Fetch Rates & Calculate
        const allRates = await getExchangeRates();

        // Try to find exact pair first (e.g., BTC-GHS)
        const rateData = allRates.find(r => r.pair === `${data.asset}-${data.fiat_currency}`);
        let effectiveRate = 0;
        let pairMargin = 0;

        if (rateData && (rateData.manual_rate || rateData.rate) > 0) {
            // Direct pair found (e.g. BTC-GHS or USDT-GHS)
            effectiveRate = rateData.manual_rate || rateData.rate;
            pairMargin = data.type === 'BUY' ? rateData.buy_margin : rateData.sell_margin;
        } else {
            // Fallback Logic: Use USD rate * Admin Bridge Rate
            const usdPair = allRates.find(r => r.pair === `${data.asset}-USD` || r.pair === `${data.asset}-USDT`);
            if (!usdPair) {
                return { error: `No exchange rate found for ${data.asset}.` };
            }

            // Look for specific bridge pair (e.g., USDT-GHS, USDC-GHS, or USD-GHS)
            const bridgePair = allRates.find(r =>
                (r.pair === `USDT-${data.fiat_currency}` || r.pair === `USDC-${data.fiat_currency}` || r.pair === `USD-${data.fiat_currency}`) &&
                (r.display_rate > 0 || r.rate > 0)
            );

            // Use bridge pair rate if found, otherwise use hardcoded fallback for GHS/NGN
            const fiatMultiplier = bridgePair ? (bridgePair.display_rate || bridgePair.rate) : (data.fiat_currency === 'GHS' ? 16.5 : (data.fiat_currency === 'NGN' ? 1650 : 1)); // Default to 1 if neither GHS/NGN and no bridge pair

            effectiveRate = (usdPair.manual_rate || usdPair.rate) * fiatMultiplier;
            pairMargin = data.type === 'BUY' ? usdPair.buy_margin : usdPair.sell_margin;
        }

        // 3. Apply Margin (Buy/Sell spread)
        const marginMultiplier = data.type === 'BUY'
            ? (1 + (pairMargin / 100))
            : (1 - (pairMargin / 100));

        const finalRate = effectiveRate * marginMultiplier;

        // 4. Calculate Amounts
        let amount_crypto = 0;
        let amount_fiat = 0;

        if (data.input_type === 'FIAT') {
            amount_fiat = data.amount_input;
            amount_crypto = amount_fiat / finalRate;
        } else {
            amount_crypto = data.amount_input;
            amount_fiat = amount_crypto * finalRate;
        }

        // Rounding
        amount_crypto = parseFloat(amount_crypto.toFixed(8));
        amount_fiat = parseFloat(amount_fiat.toFixed(2));

        // -- MINIMUM ORDER CHECK --
        if (data.type === 'SELL') {
            if (data.fiat_currency === 'GHS' && amount_fiat < 100) {
                return { error: `Minimum sell amount is 100 GHS (You are trying to sell ${amount_fiat} GHS)` };
            }
            if (data.fiat_currency === 'NGN' && amount_fiat < 15000) { // Approx 100 GHS equivalent
                return { error: `Minimum sell amount is 15,000 NGN (You are trying to sell ${amount_fiat} NGN)` };
            }
        }
        // -------------------------

        // 5. Get Admin Wallet
        let deposit_address = null;

        let targetCurrency = '';
        if (data.type === 'SELL') {
            targetCurrency = data.asset;
        } else {
            // BUY -> we need a wallet for the FIAT currency (e.g. GHS)
            targetCurrency = data.fiat_currency;
        }

        // Direct query to bypass "getAdminWallets" role check (which restricts to ADMIN users)
        // We use supabaseAdmin here which is safe as we are on server side controlling the query
        const { data: adminWallets } = await supabaseAdmin
            .from('admin_wallets')
            .select('address')
            .eq('currency', targetCurrency)
            .eq('is_active', true);

        if (!adminWallets || adminWallets.length === 0) {
            return { error: `System account not available for ${targetCurrency}. Please contact support.` };
        }

        // Joined addresses for display in UI/Email
        deposit_address = adminWallets.map(w => w.address).join('\n');

        // 5. Create Order
        const orderNumber = generateOrderId();

        const { data: newOrder, error } = await supabaseAdmin
            .from('orders')
            .insert({
                order_number: orderNumber,
                user_id: session.user.id,
                type: data.type,
                asset: data.asset,
                amount_crypto: amount_crypto,
                amount_fiat: amount_fiat,
                fiat_currency: data.fiat_currency,
                receiving_address: data.receiving_address,
                // store deposit_address? if schema allows. For now we just return it.
                status: 'PENDING'
            })
            .select()
            .single();

        if (error || !newOrder) throw error;

        // Send Confirmation Email (Non-blocking)
        try {
            if (session.user?.email) {
                const fullName = `${session.user.name || 'Valued Customer'}`;
                await sendOrderStatusEmail(
                    session.user.email,
                    fullName,
                    orderNumber,
                    'PENDING',
                    data.asset,
                    amount_crypto.toString(),
                    `${amount_fiat} ${data.fiat_currency}`,
                    deposit_address
                );
            }
        } catch (emailErr) {
            console.error("Email notification failed:", emailErr);
        }

        revalidatePath("/dashboard/orders");
        revalidatePath("/admin/orders");

        return {
            success: true,
            orderNumber,
            orderId: newOrder.id, // UUID
            depositAddress: deposit_address,
            amounts: { crypto: amount_crypto, fiat: amount_fiat }
        };

    } catch (err) {
        console.error("Order Creation Error:", err);
        return { error: "Failed to process order" };
    }
}

// Keep existing getter
export async function getInventory() {
    const { data } = await supabaseAdmin
        .from('inventory')
        .select('*')
        .order('asset', { ascending: true });
    return data || [];
}
