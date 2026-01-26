'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export interface Cryptocurrency {
    id: string;
    symbol: string;
    name: string;
    icon_url: string;
    is_active: boolean;
    stock_status: 'IN STOCK' | 'OUT OF STOCK';
    networks: string[];
}

export async function getCryptos(onlyActive = true) {
    let query = supabase.from('cryptocurrencies').select('*').order('symbol');

    if (onlyActive) {
        query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching cryptos:', error);
        return [];
    }

    return data as Cryptocurrency[];
}

export async function updateCryptoStatus(id: string, inStock: boolean) {
    const status = inStock ? 'IN STOCK' : 'OUT OF STOCK';

    const { error } = await supabaseAdmin
        .from('cryptocurrencies')
        .update({ stock_status: status })
        .eq('id', id);

    if (error) {
        throw new Error('Failed to update crypto status: ' + error.message);
    }

    revalidatePath('/dashboard');
    revalidatePath('/admin/settings');
    revalidatePath('/admin/inventory');
    return { success: true };
}

export async function toggleCryptoActive(id: string, isActive: boolean) {
    const { error } = await supabaseAdmin
        .from('cryptocurrencies')
        .update({ is_active: isActive })
        .eq('id', id);

    if (error) {
        throw new Error('Failed to toggle crypto active status: ' + error.message);
    }

    revalidatePath('/dashboard');
    revalidatePath('/admin/settings');
    revalidatePath('/admin/inventory');
    return { success: true };
}

export async function addCrypto(data: { symbol: string; name: string; icon_url: string; networks: string[] }) {
    const { error } = await supabaseAdmin
        .from('cryptocurrencies')
        .insert([
            {
                symbol: data.symbol.toUpperCase(),
                name: data.name,
                icon_url: data.icon_url,
                is_active: true,
                stock_status: 'IN STOCK',
                networks: data.networks
            }
        ]);

    if (error) {
        throw new Error('Failed to add crypto: ' + error.message);
    }

    revalidatePath('/dashboard');
    revalidatePath('/admin/settings');
    revalidatePath('/admin/inventory');
    return { success: true };
}

export async function updateCryptoNetworks(id: string, networks: string[]) {
    const { error } = await supabaseAdmin
        .from('cryptocurrencies')
        .update({ networks: networks })
        .eq('id', id);

    if (error) {
        throw new Error('Failed to update crypto networks: ' + error.message);
    }

    revalidatePath('/dashboard');
    revalidatePath('/admin/settings');
    revalidatePath('/admin/inventory');
    return { success: true };
}

export async function deleteCrypto(id: string) {
    // First, get the symbol from cryptocurrencies table
    const { data: crypto, error: fetchError } = await supabaseAdmin
        .from('cryptocurrencies')
        .select('symbol')
        .eq('id', id)
        .single();

    if (fetchError) {
        throw new Error('Failed to find cryptocurrency: ' + fetchError.message);
    }

    // Delete from cryptocurrencies table
    const { error: cryptoError } = await supabaseAdmin
        .from('cryptocurrencies')
        .delete()
        .eq('id', id);

    if (cryptoError) {
        throw new Error('Failed to delete cryptocurrency: ' + cryptoError.message);
    }

    // Delete from inventory table using the symbol/asset
    if (crypto?.symbol) {
        const { error: inventoryError } = await supabaseAdmin
            .from('inventory')
            .delete()
            .eq('asset', crypto.symbol);

        if (inventoryError) {
            console.error('Failed to delete from inventory:', inventoryError.message);
            // Don't throw here - crypto is already deleted
        }
    }

    revalidatePath('/dashboard');
    revalidatePath('/admin/settings');
    revalidatePath('/admin/inventory');
    revalidatePath('/dashboard/exchange');
    return { success: true };
}
