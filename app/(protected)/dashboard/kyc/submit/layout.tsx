import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Identity Verification | CoinDarks",
    description: "Complete your KYC verification to start trading on CoinDarks.",
};

export default function KYCSubmitLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
