import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Account | CoinDarks Exchange",
    description: "Join CoinDarks and start trading crypto in Ghana and Nigeria with premium rates.",
};

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
