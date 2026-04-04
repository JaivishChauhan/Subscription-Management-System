import type { Metadata, Viewport } from "next";
import { Syne, DM_Mono } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

/**
 * Primary brand typeface — Syne.
 * Applied globally via CSS variable (--font-sans).
 */
const fontSans = Syne({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

/**
 * Monospace typeface for code blocks and data displays.
 * Applied via CSS variable (--font-mono).
 */
const fontMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "SubsMS — Subscription Management System",
    template: "%s | SubsMS",
  },
  description:
    "Centralized subscription billing, invoicing, and analytics for recurring revenue businesses. Manage plans, customers, payments and reports in one platform.",
  keywords: [
    "subscription management",
    "recurring billing",
    "SaaS billing",
    "invoice management",
    "payment tracking",
  ],
  authors: [{ name: "SubsMS Team" }],
  openGraph: {
    title: "SubsMS — Subscription Management System",
    description:
      "Centralized subscription billing and analytics for recurring revenue businesses.",
    type: "website",
    locale: "en_US",
    siteName: "SubsMS",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
    >
      <body>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
