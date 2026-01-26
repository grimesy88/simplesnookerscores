import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Simple Snooker Scores - Live Results & Upcoming Fixtures",
  description:
    "Fast and lightweight live snooker scores and fixtures. Follow the World Snooker Tour, Masters, and World Championship with real-time frame scores. No ads, no bloat - just the scores you need.",
  keywords: [
    "snooker",
    "live scores",
    "snooker results",
    "World Snooker Tour",
    "Masters snooker",
    "World Championship snooker",
    "frame scores",
    "snooker fixtures",
  ],
  openGraph: {
    title: "Simple Snooker Scores - Live Results & Upcoming Fixtures",
    description:
      "Fast and lightweight live snooker scores and fixtures. Follow the World Snooker Tour, Masters, and World Championship with real-time frame scores.",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Simple Snooker Scores - Live snooker results and fixtures",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Simple Snooker Scores - Live Results & Upcoming Fixtures",
    description:
      "Fast and lightweight live snooker scores and fixtures. Real-time frame scores for World Snooker Tour events.",
    images: ["/og-image.jpg"],
  },
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-JBT6QWBY7F"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JBT6QWBY7F');
          `}
        </Script>
      </head>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
