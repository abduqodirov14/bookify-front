"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, BookOpen, Clock, Heart, LogOut, ChevronRight, 
  Shield, Sparkles, Loader2, LogIn, ArrowRight
} from "lucide-react";
import { api, getCachedUser, clearAuthToken, setCachedUser } from "@/services/api";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = getCachedUser();
    if (cached) {
      setUser(cached);
    }

    api.getMe()
      .then((u) => {
        if (u) {
          setUser(u);
          setCachedUser(u);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        // Guest user
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    clearAuthToken();
    setUser(null);
    router.push("/");
  };

  const userInitial = (user?.name?.trim()?.charAt(0) || user?.email?.trim()?.charAt(0) || "K").toUpperCase();

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans pb-32">
      <main className="px-4 sm:px-6 pt-8 max-w-xl mx-auto space-y-6">

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <Loader2 size={36} className="animate-spin text-[#E05638]" />
            <p className="text-xs font-semibold text-gray-400">Profil ma'lumotlari yuklanmoqda...</p>
          </div>
        ) : !user ? (
          /* GUEST / NOT LOGGED IN STATE - ZERO FAKE DATA */
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-[32px] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-center space-y-5">
              <div className="w-20 h-20 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto shadow-inner">
                <User size={38} strokeWidth={1.8} />
              </div>

              <div className="space-y-2 max-w-sm mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Hisobingizga kiring</h2>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  Mutolaa tarixi, saqlangan sara kitoblaringiz va shaxsiy natijalaringizni ko'rish uchun profilingizga kiring.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 max-w-xs mx-auto">
                <Link
                  href="/auth"
                  className="flex-1 py-3.5 px-6 bg-[#E05638] hover:bg-[#D04C2E] text-white font-bold text-sm rounded-2xl shadow-lg shadow-[#E05638]/20 transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <LogIn size={16} />
                  <span>Kirish</span>
                </Link>
                <Link
                  href="/auth"
                  className="flex-1 py-3.5 px-6 bg-stone-100 hover:bg-stone-200 text-gray-800 font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Ro'yxatdan o'tish</span>
                </Link>
              </div>
            </div>

            {/* Platform advantages for guests */}
            <div className="bg-white rounded-[28px] p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">Bookify a'zoligi imkoniyatlari</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3.5 p-2 text-sm font-semibold text-gray-700">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#E05638] flex items-center justify-center shrink-0">
                    <BookOpen size={16} />
                  </div>
                  <span>Sara durdona asarlarni to'liq mutolaa qilish</span>
                </div>
                <div className="flex items-center gap-3.5 p-2 text-sm font-semibold text-gray-700">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Clock size={16} />
                  </div>
                  <span>O'qilgan sahifalar va mutolaa vaqtini saqlab borish</span>
                </div>
                <div className="flex items-center gap-3.5 p-2 text-sm font-semibold text-gray-700">
                  <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                    <Heart size={16} />
                  </div>
                  <span>Sevimli asarlarni shaxsiy javonga saqlash</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* LOGGED IN STATE - REAL USER DATA ONLY */
          <div className="space-y-6 animate-fade-in">
            {/* Real User Profile Card */}
            <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-[#E05638] flex items-center justify-center text-white text-3xl font-bold font-serif shadow-lg shadow-[#E05638]/25 shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold text-gray-900 truncate">
                  {user.name || "Kitobxon"}
                </h2>
                <p className="text-xs text-gray-400 font-medium truncate mt-0.5">
                  {user.email}
                </p>
                <div className="mt-2.5">
                  {user.role === "admin" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-200">
                      👑 Boshqaruvchi (Admin)
                    </span>
                  ) : user.is_premium ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                      💎 VIP A'zo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-xs font-bold">
                      📖 Kitobxon
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Navigation / Settings */}
            <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden divide-y divide-gray-100">
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="w-full flex items-center gap-4 p-4 sm:p-5 hover:bg-purple-50/50 transition-colors group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Shield size={20} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-gray-900 text-sm">Boshqaruv Paneli (Admin)</div>
                    <div className="text-[11px] text-gray-400 font-medium">Kitoblar va audiolarni boshqarish</div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
                </Link>
              )}

              <Link
                href="/saved"
                className="w-full flex items-center gap-4 p-4 sm:p-5 hover:bg-gray-50 transition-colors group"
              >
                <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Heart size={20} />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-gray-900 text-sm">Saqlangan Kitoblarim</div>
                  <div className="text-[11px] text-gray-400 font-medium">Sevimli asarlaringiz ro'yxati</div>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
              </Link>

              <Link
                href="/zen"
                className="w-full flex items-center gap-4 p-4 sm:p-5 hover:bg-gray-50 transition-colors group"
              >
                <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Clock size={20} />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-gray-900 text-sm">Zen Mutolaa</div>
                  <div className="text-[11px] text-gray-400 font-medium">Diqqatni jamlab kitob o'qish</div>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
              </Link>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full bg-white hover:bg-red-50 rounded-[24px] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center justify-center gap-2 text-red-600 font-bold text-sm transition-colors cursor-pointer"
            >
              <LogOut size={18} />
              <span>Hisobdan chiqish</span>
            </button>
          </div>
        )}

      </main>

      {/* Floating Bottom Navigation Bar (iOS Style) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
        <div className="bg-white/90 backdrop-blur-xl border border-black/5 shadow-[0_20px_40px_rgb(0,0,0,0.08)] rounded-[32px] p-2 flex items-center justify-between">
          <Link href="/" className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-orange-500 transition-colors">
            <BookOpen size={22} className="mb-1" />
            <span className="text-[10px] font-bold">Kutubxona</span>
          </Link>
          <Link href="/zen" className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-gray-900 transition-colors">
            <Clock size={22} className="mb-1" />
            <span className="text-[10px] font-bold">Zen Mutolaa</span>
          </Link>
          <Link href="/saved" className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-red-500 transition-colors">
            <Heart size={22} className="mb-1" />
            <span className="text-[10px] font-bold">Saqlangan</span>
          </Link>
          <Link href="/profile" className="flex-1 flex flex-col items-center justify-center py-2 text-orange-500 transition-colors">
            <User size={22} className="mb-1" />
            <span className="text-[10px] font-bold">Profil</span>
          </Link>
        </div>
      </div>

    </div>
  );
}