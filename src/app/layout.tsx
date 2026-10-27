import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "E-Waste Value Recovery | Editorial Circular Hardware Valuation",
  description:
    "An independent decision engine comparing repair, cash buyback, store vouchers, component harvesting, and certified material recycling across Delhi NCR.",
  keywords: [
    "e-waste value recovery",
    "electronics repair vs replace",
    "delhi e-waste pilot",
    "device trade-in valuation",
    "lithium battery safety guidelines",
    "authorised recycling Delhi CPCB DPCC",
    "hardware lifecycle recovery"
  ],
  authors: [{ name: "E-Waste Value Recovery Project · Delhi Pilot" }],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F7F5EE] text-[#141413] selection:bg-[#1B3B2B] selection:text-[#F7F5EE]">
        {children}
      </body>
    </html>
  );
}
