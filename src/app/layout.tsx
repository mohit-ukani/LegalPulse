import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafbfc" },
    { media: "(prefers-color-scheme: dark)", color: "#181a20" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "LegalPulse — AI for Legal Assistance & Access",
    template: "%s | LegalPulse",
  },
  description:
    "An intelligent legal workstation featuring grounded visual citations, one-click guided actions, risk scoring, and contract comparison powered by Google Gemini 1.5 Flash.",
  keywords: [
    "AI Legal Assistant",
    "Contract Risk Analysis",
    "Legal Access",
    "Grounded Citations",
    "Gemini 1.5 Flash",
    "PromptWars",
    "LegalTech",
    "Contract Comparison",
    "Plain English Legal",
    "Pro Bono Legal AI",
  ],
  authors: [{ name: "LegalPulse Team" }],
  creator: "LegalPulse",
  openGraph: {
    title: "LegalPulse — AI for Legal Assistance & Access",
    description:
      "Enterprise-grade legal intelligence workstation with interactive PDF clause citation highlighting, bilateral contract comparison, and multilingual access.",
    url: "https://legalpulse.app",
    siteName: "LegalPulse",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LegalPulse — AI for Legal Assistance & Access",
    description:
      "Grounded legal assistance powered by Google Gemini. Interactive clause citations, bilateral contract comparison, and multilingual accessibility.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
