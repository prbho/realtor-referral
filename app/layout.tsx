import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://realtor.regalpdc.com"),

  title: {
    default: "Regal PDC Realtor",
    template: "%s",
  },

  description:
    "Join Regal PDC Realtor and grow your real estate career. Create your referral link, invite new agents, track referrals, and earn rewards through Nigeria's trusted real estate referral platform.",

  keywords: [
    "Regal PDC Realtor",
    "Real Estate",
    "Real Estate Agent",
    "Realtor",
    "Referral Program",
    "Property Consultant",
    "Real Estate Referral",
    "Estate Agent",
    "Nigeria Real Estate",
    "Agent Recruitment",
    "Property Sales",
    "Referral Platform",
  ],

  applicationName: "Regal PDC Realtor",

  authors: [
    {
      name: "Regal PDC Realtor",
    },
  ],

  creator: "Regal PDC Realtor",

  publisher: "Regal PDC Realtor",

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: "Regal PDC Realtor | Real Estate Agent Platform",
    description:
      "Join Regal PDC Realtor, create your referral link, invite agents, and grow your real estate network.",

    url: "https://realtor.regalpdc.com",
    siteName: "Regal PDC Realtor",
    locale: "en_US",
    type: "website",

  },

  twitter: {
    card: "summary_large_image",
    title: "Regal PDC Realtor",
    description: "Nigeria's modern real estate agent referral platform.",

  },

  alternates: {
    canonical: "/",
  },

  category: "Real Estate",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <ThemeProvider>
        <Providers>
          <body className="min-h-full h-screen flex flex-col">{children}</body>
        </Providers>
      </ThemeProvider>
    </html>
  );
}
