
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";


interface PasswordResetEmailProps {
    resetLink?: string;
}

export const PasswordResetEmail = ({
    resetLink,
}: PasswordResetEmailProps) => (
    <Html>
        <Head />
        <Preview>Reset your CoinDarks password</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Reset Password</Heading>
                <Section style={contentSection}>
                    <Text style={text}>
                        We received a request to reset the password for your CoinDarks account.
                        If this wasn&apos;t you, you can safely ignore this email.
                    </Text>
                    <Section style={buttonContainer}>
                        <Button
                            style={button}
                            href={resetLink || "#"}
                            target="_blank"
                        >
                            Reset Password
                        </Button>
                    </Section>
                    <Text style={subtext}>
                        The link will expire in 1 hour. Or copy and paste this URL:
                    </Text>
                    <Text style={linkText}>
                        {resetLink}
                    </Text>
                </Section>

                <Hr style={hr} />

                <Section style={footerSection}>
                    <Text style={footerNotice}>
                        This is a security-related email regarding your CoinDarks account.
                    </Text>
                    <Text style={footerCopyright}>
                        © {new Date().getFullYear()} CoinDarks. All rights reserved.
                    </Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

export default PasswordResetEmail;

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
    color: "#b91c1c", // Red for security/reset actions
    letterSpacing: "-0.5px",
};

const text = {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#475569",
    textAlign: "center" as const,
    margin: "0 0 24px",
};

const subtext = {
    fontSize: "14px",
    lineHeight: "1.5",
    color: "#64748b",
    textAlign: "center" as const,
    margin: "24px 0 8px",
};

const linkText = {
    fontSize: "13px",
    lineHeight: "1.5",
    color: "#b91c1c",
    textAlign: "center" as const,
    wordBreak: "break-all" as const,
    padding: "16px",
    backgroundColor: "#fef2f2",
    borderRadius: "6px",
    border: "1px dashed #fecaca",
};

const buttonContainer = {
    textAlign: "center" as const,
    margin: "24px 0 32px",
};

const button = {
    backgroundColor: "#dc2626", // Red for reset
    borderRadius: "8px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "16px 32px",
    lineHeight: "100%",
    cursor: "pointer",
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
