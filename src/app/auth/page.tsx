import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Kirish — Bookify",
  description: "Bookify hisobingizga kiring yoki yangi hisob oching.",
};

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-[#F6F1E7] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <a href="/" className="font-[var(--font-newsreader)] text-3xl font-semibold text-[#1B1A17] tracking-tight">Bookify</a>
          <p className="mt-2 text-sm text-[#5C584F]">Oʻzbek adabiyotining eng sara asarlari</p>
        </div>
        <Suspense fallback={<div className="h-64 flex items-center justify-center text-sm text-[#6B675E]">Yuklanmoqda...</div>}>
          <AuthForm />
        </Suspense>
      </div>
    </main>
  );
}
