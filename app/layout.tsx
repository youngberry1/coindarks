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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL?.startsWith('http')
      ? process.env.NEXT_PUBLIC_APP_URL
      : `https://${process.env.NEXT_PUBLIC_APP_URL || 'coindarks.com'}`
  ),
  title: "CoinDarks | Secure Crypto-Fiat Exchange Ghana & Nigeria",
  description: "CoinDarks is Ghana and Nigeria's most secure platform to exchange Crypto to Fiat instantly. Buy and sell BTC, USDT with GHS and NGN at premium rates.",
  keywords: ["crypto exchange ghana", "crypto exchange nigeria", "buy bitcoin ghana", "sell usdt nigeria", "ghs to btc", "ngn to usdt", "secure crypto fiat bridge"],
  authors: [{ name: "Abdul Barcky Arimiyao" }, { name: "The TBX Team" }],
  creator: "Abdul Barcky Arimiyao",
  publisher: "The TBX Team - Trending Boss Next-Gen Technology",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon1.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon0.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FinancialService",
      "@id": "https://coindarks.com/#organization",
      "name": "CoinDarks",
      "url": "https://coindarks.com",
      "logo": "https://coindarks.com/icon1.png",
      "description": "Premium Crypto-to-Fiat exchange service in West Africa.",
      "address": [
        {
          "@type": "PostalAddress",
          "streetAddress": "Suite 402, Heritage Tower, Ridge",
          "addressLocality": "Accra",
          "addressCountry": "GH"
        },
        {
          "@type": "PostalAddress",
          "streetAddress": "15 Admiralty Way, Lekki Phase 1",
          "addressLocality": "Lagos",
          "addressCountry": "NG"
        }
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "support@coindarks.com",
        "contactType": "customer service"
      }
    },
    {
      "@type": "Person",
      "@id": "https://coindarks.com/#author",
      "name": "Abdul Barcky Arimiyao",
      "jobTitle": "Lead Developer & System Architect",
      "url": "https://coindarks.com",
      "worksFor": {
        "@type": "Organization",
        "name": "The TBX Team - Trending Boss Next-Gen Technology"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://coindarks.com/#website",
      "url": "https://coindarks.com",
      "name": "CoinDarks",
      "publisher": { "@id": "https://coindarks.com/#organization" },
      "author": { "@id": "https://coindarks.com/#author" }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
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
