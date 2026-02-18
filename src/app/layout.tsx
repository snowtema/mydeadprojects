import type { Metadata } from "next";
import { JetBrains_Mono, Cormorant_Garamond, Lora } from "next/font/google";

export const dynamic = "force-dynamic";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "My Dead Projects — A Graveyard for Abandoned Ideas",
    template: "%s | My Dead Projects",
  },
  description:
    "Give your abandoned side projects a proper burial. A memorial for the code that never shipped.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: "My Dead Projects",
    description:
      "A graveyard for abandoned side projects. Rest in peace, dear code.",
    type: "website",
    siteName: "My Dead Projects",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og"],
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🪦</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jetbrainsMono.variable} ${cormorantGaramond.variable} ${lora.variable} font-mono bg-bg text-text antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
