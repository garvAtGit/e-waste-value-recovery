import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "E-Waste Value Recovery | Consumer-First Electronics Evaluation",
  description:
    "Compare repair, cash resale, trade-in, refurbishment, donation, and certified recycling for unwanted or faulty electronics and appliances.",
  keywords: [
    "e-waste recovery",
    "electronics repair vs replace",
    "device trade-in comparison",
    "sell broken electronics",
    "authorised e-waste recycling",
    "data sanitisation guide",
    "WEEE recycling"
  ],
  authors: [{ name: "E-Waste Value Recovery Project" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
