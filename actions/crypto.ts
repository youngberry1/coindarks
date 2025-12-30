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
    return { success: true };
}

export async function addCrypto(data: { symbol: string; name: string; icon_url: string }) {
    const { error } = await supabaseAdmin
        .from('cryptocurrencies')
        .insert([
            {
                symbol: data.symbol,
                name: data.name,
                icon_url: data.icon_url,
                is_active: true,
                stock_status: 'IN STOCK'
            }
        ]);

    if (error) {
        throw new Error('Failed to add crypto: ' + error.message);
    }

    revalidatePath('/dashboard');
    revalidatePath('/admin/settings');
    return { success: true };
}
