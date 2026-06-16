import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthProvider";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  axes: ["opsz"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://niyyah-os.vercel.app";
const DESCRIPTION =
  "A premium behavioral diagnosis for traders. Discover your archetype, your blind spots, the nafs beneath your mistakes, and a personal 30-day plan to change them.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Niyyah OS — Understand why you keep sabotaging yourself",
    template: "%s · Niyyah OS",
  },
  description: DESCRIPTION,
  applicationName: "Niyyah OS",
  keywords: ["trading psychology", "trader behavior", "discipline", "accountability", "behavioral diagnosis"],
  openGraph: {
    type: "website",
    siteName: "Niyyah OS",
    title: "Niyyah OS — Understand why you keep sabotaging yourself",
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Niyyah OS — Understand why you keep sabotaging yourself",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#F4F1EA",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
