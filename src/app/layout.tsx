import type { Metadata } from "next";
import { Newsreader, Inter } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bookify — oʻzbek tilidagi kitoblar: oʻqing va tinglang",
  description: "Zamonaviy va klassik asarlarni onlayn oʻqing, audio tinglang, Zen rejimida chalgʻimay mutolaa qiling.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${newsreader.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#F6F1E7] text-[#1B1A17] antialiased">
        {children}
      </body>
    </html>
  );
}
