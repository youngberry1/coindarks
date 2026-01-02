import { Resend } from 'resend';
import { VerificationEmail } from "@/emails/VerificationEmail";
import { PasswordResetEmail } from "@/emails/PasswordResetEmail";
import { PasswordChangeConfirmationEmail } from "@/emails/PasswordChangeConfirmationEmail";
import { render } from "@react-email/render";

const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const getResend = () => {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY is not set. Emails will not be sent.");
        return null;
    }
    return new Resend(process.env.RESEND_API_KEY);
};

export const sendVerificationEmail = async (email: string, token: string) => {
    const confirmLink = `${domain}/verify?token=${token}`;

    // In dev, we still log for convenience
    console.log("-----------------------------------------");
    console.log(`VERIFICATION EMAIL SENT TO: ${email}`);
    console.log(`LINK: ${confirmLink}`);
    console.log("-----------------------------------------");

    const resend = getResend();
    if (!resend) return;

    try {
        const emailHtml = await render(VerificationEmail({ validationLink: confirmLink }));

        await resend.emails.send({
            from: `CoinDarks <${process.env.EMAIL_FROM}>`,
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

    const resend = getResend();
    if (!resend) return;

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

    const resend = getResend();
    if (!resend) return;

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

    const resend = getResend();
    if (!resend) return;

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
                <li>Unlock premium features and enhanced security</li>
            </ul>
            <p>You can check your KYC status anytime in your dashboard.</p>
            <a href="${domain}/dashboard/settings?tab=verification" class="button">Check KYC Status</a>
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

    const resend = getResend();
    if (!resend) return;

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
                <li><strong>Instant Withdrawals:</strong> Faster bank transfers</li>
                <li><strong>Priority Support:</strong> Dedicated account manager</li>
                <li><strong>Better Rates:</strong> Access to premium GHS/NGN rates</li>
                <li><strong>Secure Trading:</strong> Your account is fully protected</li>
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

    const resend = getResend();
    if (!resend) return;

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


export const sendSupportReplyEmail = async (
    email: string,
    fullName: string,
    ticketId: string,
    message: string,
    fromEmail: string
) => {
    console.log("-----------------------------------------");
    console.log(`SUPPORT REPLY EMAIL SENT TO: ${email}`);
    console.log(`FROM: ${fromEmail}`);
    console.log("-----------------------------------------");

    const resend = getResend();
    if (!resend) return;

    try {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        blockquote { background: #e5e7eb; padding: 15px; border-left: 4px solid #3b82f6; border-radius: 4px; margin: 20px 0; font-style: italic; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Reply to Ticket #${ticketId}</h1>
        </div>
        <div class="content">
            <p>Hello ${fullName},</p>
            <p>You have received a new reply from our support team:</p>
            <blockquote>
                ${message.replace(/\n/g, '<br/>')}
            </blockquote>
            <p>You can view the full conversation and reply by logging into your dashboard.</p>
            <a href="${domain}/dashboard/support/${ticketId}" class="button">View Ticket</a>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"/>
            <p>Best regards,<br><strong>CoinDarks Support Team</strong></p>
        </div>
        <div class="footer">
            <p>© 2025 CoinDarks. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;

        await resend.emails.send({
            from: `CoinDarks Support <${fromEmail}>`,
            to: email,
            subject: `Re: Ticket #${ticketId} - Response from Support`,
            html: emailHtml,
        });
        console.log("Support email sent via Resend!");
    } catch (error) {
        console.error("Failed to send support reply email via Resend:", error);
    }
}

export const sendTicketCreatedEmail = async (
    email: string,
    fullName: string,
    ticketId: string,
    subject: string,
    message: string
) => {
    console.log("-----------------------------------------");
    console.log(`TICKET CREATED EMAIL SENT TO: ${email}`);
    console.log(`TICKET ID: ${ticketId}`);
    console.log("-----------------------------------------");

    const resend = getResend();
    if (!resend) return;

    try {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .info-box { background: #e5e7eb; padding: 15px; border-radius: 4px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Support Request Received</h1>
        </div>
        <div class="content">
            <p>Hello ${fullName},</p>
            <p>We have received your support request. A ticket has been created for you:</p>
            
            <div class="info-box">
                <p><strong>Ticket ID:</strong> ${ticketId}</p>
                <p><strong>Subject:</strong> ${subject}</p>
            </div>

            <p><strong>Your Message:</strong></p>
            <blockquote style="background: #f4f4f5; padding: 15px; border-left: 4px solid #3b82f6; border-radius: 4px; margin: 20px 0; font-style: italic;">
                ${message.replace(/\n/g, '<br/>')}
            </blockquote>

            <p>Our support team will review your request and get back to you as soon as possible. You can view the status of your ticket or add more information by visiting your dashboard.</p>
            
            <a href="${domain}/dashboard/support/${ticketId}" class="button">View Ticket</a>
            
            <p>Thank you for contacting CoinDarks Support.</p>
            <p>Best regards,<br><strong>CoinDarks Support Team</strong></p>
        </div>
        <div class="footer">
            <p>© 2025 CoinDarks. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;

        await resend.emails.send({
            from: `CoinDarks Support <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: `[Received] Ticket #${ticketId} - ${subject}`,
            html: emailHtml,
        });
        console.log("Ticket created email sent via Resend!");
    } catch (error) {
        console.error("Failed to send ticket created email via Resend:", error);
    }
}

export const sendTicketClosedEmail = async (
    email: string,
    fullName: string,
    ticketId: string
) => {
    console.log("-----------------------------------------");
    console.log(`TICKET CLOSED EMAIL SENT TO: ${email}`);
    console.log(`TICKET ID: ${ticketId}`);
    console.log("-----------------------------------------");

    const resend = getResend();
    if (!resend) return;

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
        .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Ticket Closed</h1>
        </div>
        <div class="content">
            <p>Hello ${fullName},</p>
            <p>Your support ticket <strong>#${ticketId}</strong> has been marked as <strong>Resolved/Closed</strong>.</p>
            <p>This ticket has been removed from your active dashboard list.</p>
            <p>If you need further assistance, please create a new ticket.</p>
            
            <a href="${domain}/dashboard/support" class="button">Go to Dashboard</a>
            
            <p>Thank you for using CoinDarks.</p>
            <p>Best regards,<br><strong>CoinDarks Support Team</strong></p>
        </div>
        <div class="footer">
            <p>© 2025 CoinDarks. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;

        await resend.emails.send({
            from: `CoinDarks Support <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: `[Closed] Ticket #${ticketId}`,
            html: emailHtml,
        });
        console.log("Ticket closed email sent via Resend!");
    } catch (error) {
        console.error("Failed to send ticket closed email via Resend:", error);
    }
}
