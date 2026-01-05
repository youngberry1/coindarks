
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


interface VerificationEmailProps {
    validationLink?: string;
}

export const VerificationEmail = ({
    validationLink,
}: VerificationEmailProps) => (
    <Html>
        <Head />
        <Preview>Verify your CoinDarks account</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Welcome to CoinDarks</Heading>
                <Section style={contentSection}>
                    <Text style={text}>
                        Thanks for starting your journey with the most trusted crypto exchange
                        for Ghana & Nigeria.
                    </Text>
                    <Section style={buttonContainer}>
                        <Button
                            style={button}
                            href={validationLink || "#"}
                            target="_blank"
                            pX={32}
                            pY={16}
                        >
                            Verify your email address
                        </Button>
                    </Section>
                    <Text style={subtext}>
                        Or copy and paste this URL into your browser:
                    </Text>
                    <Text style={linkText}>
                        {validationLink}
                    </Text>
                </Section>

                <Hr style={hr} />

                <Section style={footerSection}>
                    <Text style={footerNotice}>
                        If you didn&apos;t request this email, you can safely ignore it.
                    </Text>
                    <Text style={footerCopyright}>
                        © {new Date().getFullYear()} CoinDarks. All rights reserved.
                    </Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

export default VerificationEmail;

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
    color: "#1e293b",
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
    color: "#3b82f6",
    textAlign: "center" as const,
    wordBreak: "break-all" as const,
    padding: "16px",
    backgroundColor: "#f8fafc",
    borderRadius: "6px",
    border: "1px dashed #cbd5e1",
};

const buttonContainer = {
    textAlign: "center" as const,
    margin: "24px 0 32px",
};

const button = {
    backgroundColor: "#3b82f6",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
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
