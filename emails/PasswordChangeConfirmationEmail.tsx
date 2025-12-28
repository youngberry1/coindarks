
import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";


export const PasswordChangeConfirmationEmail = () => (
    <Html>
        <Head />
        <Preview>Security Alert: Your password has been changed</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Password Changed</Heading>
                <Section style={contentSection}>
                    <Text style={text}>
                        This is a confirmation that the password for your CoinDarks account was recently changed.
                    </Text>
                    <Text style={text}>
                        If you made this change, you can safely ignore this email. No further action is required.
                    </Text>
                    <Section style={securitySection}>
                        <Text style={securityTitle}>
                            <b>If you did not change your password:</b>
                        </Text>
                        <Text style={securityText}>
                            Please contact our support team immediately or use the &quot;Forgot Password&quot; link on our login page to secure your account.
                        </Text>
                    </Section>
                </Section>

                <Hr style={hr} />

                <Section style={footerSection}>
                    <Text style={footerNotice}>
                        This is an automated security notification from CoinDarks.
                    </Text>
                    <Text style={footerCopyright}>
                        © {new Date().getFullYear()} CoinDarks. All rights reserved.
                    </Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

export default PasswordChangeConfirmationEmail;

const main = {
    backgroundColor: "#ffffff",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: "0 auto",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "32px 0",
    maxWidth: "600px",
    width: "100%",
};

const contentSection = {
    padding: "0 40px",
};

const h1 = {
    fontSize: "28px",
    fontWeight: "800",
    textAlign: "center" as const,
    margin: "0 0 30px",
    color: "#10b981", // Emerald/Green for success
    letterSpacing: "-0.5px",
};

const text = {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#475569",
    textAlign: "center" as const,
    margin: "0 0 24px",
};

const securitySection = {
    padding: "24px",
    backgroundColor: "#fef2f2",
    borderRadius: "8px",
    border: "1px solid #fee2e2",
    margin: "24px 0 0",
};

const securityTitle = {
    fontSize: "15px",
    color: "#b91c1c",
    margin: "0 0 8px",
    textAlign: "center" as const,
};

const securityText = {
    fontSize: "14px",
    lineHeight: "1.5",
    color: "#7f1d1d",
    margin: "0",
    textAlign: "center" as const,
};

const hr = {
    borderColor: "#e2e8f0",
    margin: "24px 0",
};

const footerSection = {
    padding: "0 40px",
};

const footerNotice = {
    fontSize: "12px",
    lineHeight: "18px",
    color: "#94a3b8",
    textAlign: "center" as const,
    margin: "0 0 8px",
};

const footerCopyright = {
    color: "#94a3b8",
    fontSize: "12px",
    lineHeight: "16px",
    textAlign: "center" as const,
    margin: "0",
    fontWeight: "500",
};
