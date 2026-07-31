import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://shelvedgames.vercel.app';

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Shelved — Steam Backlog Picker & RNG Game Decision Maker",
    template: "%s | Shelved"
  },
  description: "Can't decide what Steam game to play? Shelved picks random games from your Steam library based on available time, mood, multiplayer exclusions, and live Steam stats.",
  keywords: [
    "Steam backlog",
    "what to play on Steam",
    "Steam game picker",
    "random Steam game picker",
    "Steam library picker",
    "RNG game selector",
    "Steam backlog decision maker",
    "shelved games"
  ],
  authors: [{ name: "klebka" }],
  creator: "klebka",
  publisher: "Shelved",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Shelved — Steam Backlog Picker & RNG Game Decision Maker",
    description: "Can't decide what Steam game to play? Let Shelved pick the perfect game from your backlog based on session duration, mood, and exclusions.",
    url: baseUrl,
    siteName: "Shelved",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shelved — Steam Backlog Picker",
    description: "Stop scrolling your Steam library. Let RNG pick your next game based on time, mood, and filters.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "F6dm4odBfTIzq-phYjrUHqH_8esWhKo-s2edLS6YtAE",
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Shelved",
    "url": baseUrl,
    "description": "RNG game picker for your Steam library and backlog based on time available, mood, and exclusions.",
    "applicationCategory": "GameApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
