"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, getCachedUser, clearAuthToken, setCachedUser } from "@/services/api";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Profil — Bookify';
    const cached = getCachedUser();
    if (cached) setUser(cached);

    api.getMe()
      .then((u) => {
        if (u) {
          setUser(u);
          setCachedUser(u);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    clearAuthToken();
    setUser(null);
    router.push("/");
  };

  const userInitial = (user?.name?.trim()?.charAt(0) || user?.email?.trim()?.charAt(0) || "K").toUpperCase();

  return (
    <div className="min-h-screen bg-[#F6F1E7] font-[var(--font-inter)] text-[#1B1A17] pb-24">
      
      <header className="sticky top-0 z-40 bg-[#F6F1E7]/95 backdrop-blur-sm border-b border-[#E3DCCB] px-4 py-3">
        <Link href="/" className="font-[var(--font-newsreader)] text-xl font-semibold text-[#1B1A17]">
          Bookify
        </Link>
      </header>

      <main className="max-w-md mx-auto px-4 pt-10">

        {loading ? (
          <div className="py-20 text-[#6B675E] text-sm">Yuklanmoqda...</div>
        ) : !user ? (
          <div className="py-12 border-t border-[#E3DCCB] mt-4">
            <h2 className="font-[var(--font-newsreader)] text-2xl font-bold mb-3">Hisobingizga kiring</h2>
            <p className="text-sm text-[#6B675E] mb-8 leading-relaxed">
              Mutolaa tarixi, saqlangan sara kitoblaringiz va profilingizni boshqarish uchun kiring.
            </p>
            <div className="flex gap-3">
              <Link href="/auth" className="px-5 py-2 bg-[#B4472B] text-white text-sm rounded-md hover:bg-[#9e3d25] transition-colors">
                Kirish
              </Link>
              <Link href="/auth" className="px-5 py-2 border border-[#E3DCCB] text-[#1B1A17] text-sm rounded-md hover:bg-[#FBF8F1] transition-colors">
                Roʻyxatdan oʻtish
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-[#B4472B] text-white flex items-center justify-center text-2xl font-bold font-[var(--font-newsreader)] shrink-0">
                {userInitial}
              </div>
              <div>
                <h2 className="font-[var(--font-newsreader)] text-2xl font-bold text-[#1B1A17]">{user.name || "Kitobxon"}</h2>
                <p className="text-sm text-[#6B675E]">{user.email}</p>
                <div className="mt-1">
                  <span className="text-xs text-[#1B1A17] border border-[#E3DCCB] px-2 py-0.5 rounded-sm bg-[#FBF8F1]">
                    {user.role === "admin" ? "Boshqaruvchi" : user.is_premium ? "Premium" : "Kitobxon"}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#E3DCCB] divide-y divide-[#E3DCCB]">
              {user.role === "admin" && (
                <Link href="/admin" className="block py-4 text-sm text-[#1B1A17] hover:text-[#B4472B] transition-colors font-medium">
                  Boshqaruv paneli (Admin)
                </Link>
              )}
              <Link href="/saved" className="block py-4 text-sm text-[#1B1A17] hover:text-[#B4472B] transition-colors font-medium">
                Saqlangan kitoblar
              </Link>
              <Link href="/zen" className="block py-4 text-sm text-[#1B1A17] hover:text-[#B4472B] transition-colors font-medium">
                Zen mutolaa
              </Link>
            </div>

            <div className="pt-4">
              <button onClick={handleLogout} className="text-sm text-[#B4472B] font-medium hover:underline">
                Hisobdan chiqish
              </button>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}