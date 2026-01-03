import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CoinDarks | Secure Crypto-Fiat Exchange Ghana & Nigeria",
  description: "Experience the fastest and most secure way to exchange Crypto to Fiat in Ghana and Nigeria. Premium rates, instant transactions.",
  appleWebApp: {
    title: "Coindarks",
    statusBarStyle: "default",
    capable: true,
  },
  openGraph: {
    title: "CoinDarks | Secure Crypto-Fiat Exchange",
    description: "Instant Crypto-Fiat exchange in Ghana & Nigeria. Secure, fast, and reliable.",
    url: "https://coindarks.com",
    siteName: "CoinDarks",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CoinDarks - Secure Crypto Exchange",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CoinDarks | Secure Crypto-Fiat Exchange",
    description: "Instant Crypto-Fiat exchange in Ghana & Nigeria. Secure, fast, and reliable.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
