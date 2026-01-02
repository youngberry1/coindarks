"use server";

import { supabaseAdmin } from "@/lib/kyc-storage";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { sendKYCApprovalEmail, sendKYCRejectionEmail } from "@/lib/mail";

export async function processKYC(submissionId: string, action: 'APPROVE' | 'REJECT', reason?: string) {
    const session = await auth();
    console.log("Admin Action - Session Role:", session?.user?.role);
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

    console.log("Processing KYC Submission:", submissionId, "Action:", action);

    try {
        // 1. Fetch submission and user info using Admin client
        const { data: submission, error: fetchError } = await supabaseAdmin
            .from('kyc_submissions')
            .select(`
                *,
                users (
                    id,
                    email,
                    first_name,
                    last_name
                )
            `)
            .eq('id', submissionId)
            .single();

        if (fetchError || !submission) {
            console.error("Fetch Error:", fetchError);
            return { error: "Submission not found" };
        }

        const user = submission.users;
        const fullName = `${user.first_name} ${user.last_name}`;

        if (action === 'APPROVE') {
            console.log("Approving KYC for user:", user.id);
            // Update submission status
            const { error: subError } = await supabaseAdmin.from('kyc_submissions').update({
                status: 'APPROVED',
                reviewed_at: new Date().toISOString()
            }).eq('id', submissionId);

            if (subError) {
                console.error("KYC Subscriptions Update Error:", subError);
                return { error: `Submission update failed: ${subError.message}` };
            }

            // Update user status
            const { error: userError } = await supabaseAdmin.from('users').update({
                kyc_status: 'APPROVED'
            }).eq('id', user.id);

            if (userError) {
                console.error("User Status Update Error:", userError);
                return { error: `User status update failed: ${userError.message}` };
            }

            // Send Email
            await sendKYCApprovalEmail(user.email, fullName);
        } else {
            console.log("Rejecting KYC for user:", user.id, "Reason:", reason);
            // Update submission status
            const { error: subError } = await supabaseAdmin.from('kyc_submissions').update({
                status: 'REJECTED',
                rejection_reason: reason,
                reviewed_at: new Date().toISOString()
            }).eq('id', submissionId);

            if (subError) {
                console.error("KYC Subscriptions Rejection Error:", subError);
                return { error: `Submission rejection failed: ${subError.message}` };
            }

            // Update user status
            const { error: userError } = await supabaseAdmin.from('users').update({
                kyc_status: 'REJECTED'
            }).eq('id', user.id);

            if (userError) {
                console.error("User Status Rejection Error:", userError);
                return { error: `User status update failed: ${userError.message}` };
            }

            // Send Email
            await sendKYCRejectionEmail(user.email, fullName, reason || "Documents provided were not clear or did not match our requirements.");
        }

        revalidatePath("/admin/kyc");
        revalidatePath("/admin");
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/exchange");
        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (error) {
        console.error("KYC Process Fatal Error:", error);
        return { error: "An unexpected error occurred during processing" };
    }
}

export async function toggleUserStatus(userId: string, status: 'ACTIVE' | 'BANNED') {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

    try {
        const { error } = await supabaseAdmin
            .from('users')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (error) throw error;
        revalidatePath("/admin/users");
        revalidatePath("/admin");
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/exchange");
        revalidatePath("/dashboard/settings");
        return { success: `User status updated to ${status}` };
    } catch {
        return { error: "Failed to update user status" };
    }
}

export async function toggleInventoryStatus(asset: string, field: 'buy_enabled' | 'sell_enabled', value: boolean) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

    try {
        const { error } = await supabaseAdmin
            .from('inventory')
            .update({ [field]: value, updated_at: new Date().toISOString() })
            .eq('asset', asset);

        if (error) throw error;
        revalidatePath("/admin/inventory");
        revalidatePath("/admin");
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/exchange");
        return { success: `${asset} ${field.replace('_', ' ')} updated` };
    } catch {
        return { error: `Failed to update ${asset} inventory` };
    }
}

export async function updateOrderStatus(orderId: string, status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED') {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

    try {
        const { error } = await supabaseAdmin
            .from('orders')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', orderId);

        if (error) throw error;
        revalidatePath("/admin/orders");
        revalidatePath("/admin");
        revalidatePath("/dashboard/orders");
        return { success: `Order status updated to ${status}` };
    } catch {
        return { error: `Failed to update order status` };
    }
}
