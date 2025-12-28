import { Resend } from 'resend';
import { VerificationEmail } from "@/emails/VerificationEmail";
import { PasswordResetEmail } from "@/emails/PasswordResetEmail";
import { PasswordChangeConfirmationEmail } from "@/emails/PasswordChangeConfirmationEmail";
import { render } from "@react-email/render";

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const sendVerificationEmail = async (email: string, token: string) => {
    const confirmLink = `${domain}/verify?token=${token}`;

    // In dev, we still log for convenience
    console.log("-----------------------------------------");
    console.log(`VERIFICATION EMAIL SENT TO: ${email}`);
    console.log(`LINK: ${confirmLink}`);
    console.log("-----------------------------------------");

    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY not set. Email not sent via Resend.");
        return;
    }

    try {
        const emailHtml = await render(VerificationEmail({ validationLink: confirmLink }));

        await resend.emails.send({
            from: `CoinDarks <${process.env.EMAIL_FROM}>`, // Change this to your domain later e.g. support@coindarks.com
            to: email,
            subject: "Verify your email - CoinDarks",
            html: emailHtml,
        });
        console.log("Email sent via Resend!");
    } catch (error) {
        console.error("Failed to send email via Resend:", error);
    }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
    const resetLink = `${domain}/new-password?token=${token}`;

    console.log("-----------------------------------------");
    console.log(`RESET PASSWORD EMAIL SENT TO: ${email}`);
    console.log(`LINK: ${resetLink}`);
    console.log("-----------------------------------------");

    if (!process.env.RESEND_API_KEY) return;

    try {
        const emailHtml = await render(PasswordResetEmail({ resetLink }));

        await resend.emails.send({
            from: `CoinDarks <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: "Reset your password - CoinDarks",
            html: emailHtml,
        });
    } catch (error) {
        console.error("Failed to send reset email via Resend:", error);
    }
}

export const sendPasswordChangeConfirmationEmail = async (email: string) => {
    console.log("-----------------------------------------");
    console.log(`PASSWORD CHANGE CONFIRMATION SENT TO: ${email}`);
    console.log("-----------------------------------------");

    if (!process.env.RESEND_API_KEY) return;

    try {
        const emailHtml = await render(PasswordChangeConfirmationEmail());

        await resend.emails.send({
            from: `CoinDarks <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: "Security Alert: Password Changed - CoinDarks",
            html: emailHtml,
        });
    } catch (error) {
        console.error("Failed to send password change confirmation via Resend:", error);
    }
}

// ============================================
// KYC Email Notifications
// ============================================

export const sendKYCSubmissionEmail = async (email: string, fullName: string) => {
    console.log("-----------------------------------------");
    console.log(`KYC SUBMISSION EMAIL SENT TO: ${email}`);
    console.log("-----------------------------------------");

    if (!process.env.RESEND_API_KEY) return;

    try {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 KYC Submitted Successfully!</h1>
        </div>
        <div class="content">
            <p>Hi ${fullName},</p>
            <p>Thank you for submitting your KYC verification documents to <strong>CoinDarks</strong>.</p>
            <p>Your submission is now under review by our compliance team. We typically review applications within <strong>24-48 hours</strong>.</p>
            <h3>What happens next?</h3>
            <ul>
                <li>Our team will verify your identity documents</li>
                <li>You'll receive an email once the review is complete</li>
                <li>If approved, you'll unlock higher trading limits</li>
            </ul>
            <p>You can check your KYC status anytime in your dashboard.</p>
            <a href="${domain}/dashboard/kyc/status" class="button">Check KYC Status</a>
            <p>If you have any questions, our support team is available 24/7.</p>
            <p>Best regards,<br><strong>The CoinDarks Team</strong></p>
        </div>
        <div class="footer">
            <p>© 2025 CoinDarks. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;

        await resend.emails.send({
            from: `CoinDarks <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: "KYC Verification Submitted - CoinDarks",
            html: emailHtml,
        });
    } catch (error) {
        console.error("Failed to send KYC submission email via Resend:", error);
    }
}

export const sendKYCApprovalEmail = async (email: string, fullName: string) => {
    console.log("-----------------------------------------");
    console.log(`KYC APPROVAL EMAIL SENT TO: ${email}`);
    console.log("-----------------------------------------");

    if (!process.env.RESEND_API_KEY) return;

    try {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .badge { display: inline-block; padding: 8px 16px; background: #10b981; color: white; border-radius: 20px; font-weight: bold; }
        .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ KYC Approved!</h1>
        </div>
        <div class="content">
            <p>Hi ${fullName},</p>
            <p><strong>Congratulations!</strong> Your KYC verification has been approved.</p>
            <p style="text-align: center;"><span class="badge">✓ VERIFIED</span></p>
            <h3>What you can do now:</h3>
            <ul>
                <li><strong>Higher Trading Limits:</strong> Trade up to $10,000+ daily</li>
                <li><strong>Instant Withdrawals:</strong> Faster bank transfers</li>
                <li><strong>Priority Support:</strong> Dedicated account manager</li>
                <li><strong>Better Rates:</strong> Access to premium GHS/NGN rates</li>
            </ul>
            <p>Your account is now fully verified and ready for trading!</p>
            <a href="${domain}/dashboard" class="button">Start Trading Now</a>
            <p>Thank you for choosing CoinDarks for your crypto-to-fiat needs.</p>
            <p>Best regards,<br><strong>The CoinDarks Team</strong></p>
        </div>
        <div class="footer">
            <p>© 2025 CoinDarks. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;

        await resend.emails.send({
            from: `CoinDarks <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: "🎉 KYC Approved - Start Trading Now!",
            html: emailHtml,
        });
    } catch (error) {
        console.error("Failed to send KYC approval email via Resend:", error);
    }
}

export const sendKYCRejectionEmail = async (email: string, fullName: string, reason: string) => {
    console.log("-----------------------------------------");
    console.log(`KYC REJECTION EMAIL SENT TO: ${email}`);
    console.log(`REASON: ${reason}`);
    console.log("-----------------------------------------");

    if (!process.env.RESEND_API_KEY) return;

    try {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .reason-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>KYC Verification Update</h1>
        </div>
        <div class="content">
            <p>Hi ${fullName},</p>
            <p>Thank you for submitting your KYC verification to CoinDarks.</p>
            <p>Unfortunately, we were unable to approve your verification at this time.</p>
            <div class="reason-box">
                <strong>Reason:</strong><br>
                ${reason}
            </div>
            <h3>What you can do:</h3>
            <ul>
                <li>Review the reason above carefully</li>
                <li>Prepare new documents that address the issue</li>
                <li>Resubmit your KYC verification</li>
            </ul>
            <p>Don't worry - you can resubmit your KYC anytime with updated documents.</p>
            <a href="${domain}/dashboard/kyc/submit" class="button">Resubmit KYC</a>
            <p>If you have questions or need help, please contact our support team.</p>
            <p>Best regards,<br><strong>The CoinDarks Team</strong></p>
        </div>
        <div class="footer">
            <p>© 2025 CoinDarks. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;

        await resend.emails.send({
            from: `CoinDarks <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: "KYC Verification Update - CoinDarks",
            html: emailHtml,
        });
    } catch (error) {
        console.error("Failed to send KYC rejection email via Resend:", error);
    }
}

