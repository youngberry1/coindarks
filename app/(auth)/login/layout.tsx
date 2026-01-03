import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login | CoinDarks Exchange",
    description: "Securely sign in to your CoinDarks account to manage your crypto trades.",
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
