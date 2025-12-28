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
