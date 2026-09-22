"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Lock, ShieldAlert, ArrowRight, Loader2, LogIn } from "lucide-react";
import { getAuthToken, api, getCachedUser } from "@/services/api";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  panelTitle?: string;
  themeColor?: "blue" | "emerald" | "black";
}

export default function AuthGuard({
  children,
  allowedRoles,
  panelTitle = "Boshqaruv Paneli",
  themeColor = "black"
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [authState, setAuthState] = useState<"loading" | "authorized" | "unauthenticated" | "forbidden">("loading");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkAccess() {
      const token = getAuthToken();
      if (!token) {
        if (isMounted) setAuthState("unauthenticated");
        return;
      }

      try {
        // Fetch or get cached user profile
        const user = await api.getMe();
        if (!isMounted) return;

        if (!user) {
          setAuthState("unauthenticated");
          return;
        }

        setCurrentUser(user);

        // Role verification (if specific roles are required)
        if (allowedRoles && allowedRoles.length > 0) {
          const userRole = (user.role || "USER").toUpperCase();
          const hasAccess = userRole === "ADMIN" || allowedRoles.some(r => r.toUpperCase() === userRole);
          if (!hasAccess) {
            setAuthState("forbidden");
            return;
          }
        }

        setAuthState("authorized");
      } catch (err) {
        console.error("Auth check failed:", err);
        if (isMounted) {
          // If cached token exists, fallback to cached user or unauthenticated
          const cached = getCachedUser();
          if (cached) {
            setCurrentUser(cached);
            setAuthState("authorized");
          } else {
            setAuthState("unauthenticated");
          }
        }
      }
    }

    checkAccess();
    return () => { isMounted = false; };
  }, [pathname, allowedRoles]);

  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center max-w-sm w-full text-center animate-pulse">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 text-gray-400">
            <Loader2 size={24} className="animate-spin text-gray-500" />
          </div>
          <h3 className="font-extrabold text-gray-900 text-lg">Ruxsat tekshirilmoqda...</h3>
          <p className="text-gray-400 text-xs mt-1">Xavfsizlik protokoli faol</p>
        </div>
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-10 rounded-[36px] shadow-[0_12px_40px_rgb(0,0,0,0.06)] border border-gray-100 max-w-md w-full text-center animate-fade-in">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg ${
            themeColor === "blue" ? "bg-blue-600 text-white shadow-blue-600/20" :
            themeColor === "emerald" ? "bg-emerald-600 text-white shadow-emerald-600/20" :
            "bg-black text-white shadow-black/20"
          }`}>
            <Lock size={28} />
          </div>

          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            Himoyalangan Hudud
          </span>

          <h2 className="text-2xl font-black text-gray-900 mb-2">
            {panelTitle}
          </h2>
          <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
            Ushbu panelga kirish uchun tizimga o'z hisobingiz orqali kirishingiz talab etiladi.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => router.push(`/auth?redirect=${encodeURIComponent(pathname)}`)}
              className={`w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                themeColor === "blue" ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/25" :
                themeColor === "emerald" ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25" :
                "bg-black hover:bg-gray-800 shadow-black/20"
              }`}
            >
              <LogIn size={18} /> Kirish / Ro'yxatdan o'tish
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-2xl text-sm transition-colors"
            >
              Bosh sahifaga qaytish
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (authState === "forbidden") {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-10 rounded-[36px] shadow-[0_12px_40px_rgb(0,0,0,0.06)] border border-red-100 max-w-md w-full text-center animate-fade-in">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-500/10">
            <ShieldAlert size={28} />
          </div>

          <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            Ruxsat Cheklangan (403)
          </span>

          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Ruxsat Etilmagan
          </h2>
          <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
            Sizning hisobingiz (<strong className="text-gray-800">{currentUser?.email || "Foydalanuvchi"}</strong>) {panelTitle} ga kirish vakolatiga ega emas.
          </p>

          <button
            onClick={() => router.push("/")}
            className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl shadow-lg shadow-black/10 transition-all active:scale-95"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}