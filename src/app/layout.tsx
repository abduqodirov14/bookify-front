import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Literata, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const serif = Literata({
  subsets: ["latin"],
  variable: "--font-serif",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Bookify — Milliy Kitob & Audio Sanatoriysi",
  description: "O'zbekistonning eng sara durdona asarlari, audio spektakllari va adabiy chempionati.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </head>
      <body className="font-sans antialiased bg-[#F8FAFC] dark:bg-[#080B0F] text-stone-900 dark:text-stone-100 min-h-screen">
        <Toaster position="top-center" reverseOrder={false} />
        {children}
      </body>
    </html>
  );
}
