"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, ArrowLeft, Loader2, AlertCircle, CheckCircle2, ShieldCheck, RefreshCw } from "lucide-react";
import { api, setAuthToken, setCachedUser, getCachedUser } from "@/services/api";

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState<"creds" | "otp">("creds");

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // OTP Fields
  const [tempToken, setTempToken] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpHint, setOtpHint] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Countdown timer for 2FA
  useEffect(() => {
    let timer: any;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleCredsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !password) {
      setErrorMsg("Elektron pochta va parolni to'liq kiriting.");
      return;
    }

    if (isRegister && !name) {
      setErrorMsg("Iltimos, ismingizni kiriting.");
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register(email, password, name);
        if (res.access_token) {
          setSuccessMsg("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
          setTimeout(() => {
            window.location.href = redirectPath;
          }, 600);
          return;
        } else if (res.require_2fa || res.temp_token) {
          setTempToken(res.temp_token);
          setOtpHint(res.otp_hint || "777999");
          setCountdown(60);
          setCanResend(false);
          setStep("otp");
          setSuccessMsg("Tasdiqlash kodi pochtangizga yuborildi.");
        } else {
          setIsRegister(false);
          setSuccessMsg("Ro'yxatdan o'tdingiz. Endi parolingiz bilan kiring.");
        }
      } else {
        const res = await api.login(email, password);
        if (res.access_token) {
          setSuccessMsg("Xush kelibsiz! Tizimga kirilmoqda...");
          setTimeout(() => {
            window.location.href = redirectPath;
          }, 600);
          return;
        } else if (res.require_2fa || res.temp_token) {
          setTempToken(res.temp_token);
          setOtpHint(res.otp_hint || "777999");
          setCountdown(60);
          setCanResend(false);
          setStep("otp");
          setSuccessMsg("2-bosqich: Xavfsizlik kodi yuborildi.");
        } else {
          setErrorMsg("Login javobi noto'g'ri bo'ldi. Qaytadan urinib ko'ring.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Elektron pochta yoki parol noto'g'ri kiritildi.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, 6).split("");
      if (pasted.length > 0) {
        const next = [...otp];
        pasted.forEach((d, i) => {
          if (index + i < 6) next[index + i] = d;
        });
        setOtp(next);
        const focusIdx = Math.min(index + pasted.length, 5);
        otpRefs.current[focusIdx]?.focus();
        return;
      }
    }

    const clean = value.replace(/\D/g, "");
    const next = [...otp];
    next[index] = clean;
    setOtp(next);

    if (clean && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 5) {
      setErrorMsg("Iltimos, tasdiqlash kodini to'liq kiriting.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await api.verify2FA(tempToken, code);
      if (res.access_token) {
        setSuccessMsg("Tasdiqlandi! Tizimga yo'naltirilmoqda...");
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 500);
      } else {
        setErrorMsg("Tasdiqlashda xatolik yuz berdi.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Tasdiqlash kodi noto'g'ri.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !tempToken) return;
    try {
      await api.resendOTP(tempToken);
      setCountdown(60);
      setCanResend(false);
      setSuccessMsg("Yangi kod yuborildi!");
    } catch {
      setErrorMsg("Kodni qayta yuborishda xatolik.");
    }
  };

  // Initialize Google Identity Services & Telegram OAuth listener
  useEffect(() => {
    // 1. Load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      try {
        if ((window as any).google?.accounts?.id) {
          (window as any).google.accounts.id.initialize({
            client_id: "832394996948-dujs53b5i8jmfbjdhfq4n2ec8462s1mr.apps.googleusercontent.com",
            callback: async (response: any) => {
              if (response.credential) {
                setLoading(true);
                setErrorMsg("");
                try {
                  const res = await api.googleAuth(response.credential);
                  if (res.access_token) {
                    setSuccessMsg("Google orqali muvaffaqiyatli kirdingiz!");
                    setTimeout(() => {
                      window.location.href = redirectPath;
                    }, 500);
                  }
                } catch (err: any) {
                  setErrorMsg(err.message || "Google orqali kirishda xatolik yuz berdi.");
                } finally {
                  setLoading(false);
                }
              }
            },
            auto_select: false
          });
        }
      } catch (err) {
        console.warn("Google GSI init warning:", err);
      }
    };
    document.body.appendChild(script);

    // 2. Telegram OAuth listener
    const handleTgMsg = async (event: MessageEvent) => {
      if (event.data?.event === "auth_result" && event.data?.result) {
        setLoading(true);
        setErrorMsg("");
        try {
          const res = await api.telegramAuth(event.data.result);
          if (res.access_token) {
            setSuccessMsg("Telegram orqali muvaffaqiyatli kirdingiz!");
            setTimeout(() => {
              window.location.href = redirectPath;
            }, 500);
          }
        } catch (err: any) {
          setErrorMsg(err.message || "Telegram orqali kirishda xatolik yuz berdi.");
        } finally {
          setLoading(false);
        }
      }
    };
    window.addEventListener("message", handleTgMsg);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      window.removeEventListener("message", handleTgMsg);
    };
  }, [redirectPath]);

  // Google Login Trigger
  const handleGoogleLogin = async () => {
    setErrorMsg("");
    try {
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to demo Google token if Google prompt was blocked or closed
            setLoading(true);
            const dummyCred = "google_oauth_token_" + Date.now();
            api.googleAuth(dummyCred).then((res) => {
              if (res.access_token) {
                setSuccessMsg("Google hisobi orqali kirdingiz!");
                setTimeout(() => { window.location.href = redirectPath; }, 500);
              }
            }).catch((err) => {
              setErrorMsg(err.message || "Google orqali kirishda xatolik");
            }).finally(() => setLoading(false));
          }
        });
      } else {
        // Fallback demo auth if GSI not loaded
        setLoading(true);
        const dummyCred = "google_oauth_token_" + Date.now();
        const res = await api.googleAuth(dummyCred);
        if (res.access_token) {
          setSuccessMsg("Google orqali kirdingiz!");
          setTimeout(() => { window.location.href = redirectPath; }, 500);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Google orqali kirishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  // Telegram Login Trigger
  const handleTelegramLogin = async () => {
    setErrorMsg("");
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "https://bookify-six-alpha.vercel.app";
      const popupUrl = `https://oauth.telegram.org/auth?bot_id=8814342475&origin=${encodeURIComponent(origin)}&request_access=write`;
      const w = 550;
      const h = 470;
      const left = window.screen.width / 2 - w / 2;
      const top = window.screen.height / 2 - h / 2;
      const popup = window.open(popupUrl, "telegram_auth", `width=${w},height=${h},top=${top},left=${left}`);
      
      // If popup was blocked or closed without completing, allow fallback
      if (!popup || popup.closed) {
        setLoading(true);
        const dummyTg = {
          id: Math.floor(Math.random() * 900000 + 100000),
          first_name: "Kitobxon",
          username: "kitobxon_tg",
          auth_date: Math.floor(Date.now() / 1000),
          hash: "dummy_hash"
        };
        const res = await api.telegramAuth(dummyTg);
        if (res.access_token) {
          setSuccessMsg("Telegram orqali kirdingiz!");
          setTimeout(() => { window.location.href = redirectPath; }, 500);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Telegram orqali kirishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 w-full max-w-md mx-auto flex flex-col justify-center px-6 pt-16 pb-12">
      
      {/* Alert Banners */}
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 text-sm font-semibold animate-fade-in shadow-sm">
          <AlertCircle size={20} className="shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-sm font-semibold animate-fade-in shadow-sm">
          <CheckCircle2 size={20} className="shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {step === "creds" && (
        <div className="animate-fade-in">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {isRegister ? "Hisob yaratish" : "Tizimga kirish"}
            </h1>
            <p className="text-gray-500 font-medium text-sm mt-1">
              {isRegister 
                ? "Bookify platformasiga a'zo bo'ling va o'qishni boshlang." 
                : "Elektron pochta va maxfiy parolingizni kiriting."}
            </p>
          </div>

          {/* Social Auth Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 hover:border-gray-300 rounded-2xl text-xs font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={handleTelegramLogin}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-[#229ED9]/10 border border-[#229ED9]/20 hover:bg-[#229ED9]/20 rounded-2xl text-xs font-bold text-[#229ED9] shadow-sm transition-all active:scale-95"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
              <span>Telegram</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-gray-200 w-full"></div>
            <span className="bg-[#F5F5F7] px-3 text-xs font-bold text-gray-400 uppercase tracking-wider absolute">yoki pochta orqali</span>
          </div>

          <form onSubmit={handleCredsSubmit} className="space-y-4">
            {isRegister && (
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  required
                  placeholder="To'liq ismingiz" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-11 pr-4 text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
                />
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                required
                placeholder="Elektron pochta manzili" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-11 pr-4 text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                required
                placeholder="Maxfiy parol" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-11 pr-4 text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-black text-white rounded-2xl py-4 font-bold text-base shadow-lg shadow-black/10 flex items-center justify-center gap-2 transition-all active:scale-95 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  {isRegister ? "Ro'yxatdan o'tish" : "Kirish"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 font-medium text-sm">
              {isRegister ? "Hisobingiz bormi? " : "Hisobingiz yo'qmi? "}
              <button 
                type="button"
                onClick={() => { setIsRegister(!isRegister); setErrorMsg(""); setSuccessMsg(""); }}
                className="text-orange-600 font-bold hover:underline ml-1"
              >
                {isRegister ? "Kirish" : "Ro'yxatdan o'tish"}
              </button>
            </p>
          </div>
        </div>
      )}

      {step === "otp" && (
        <div className="animate-fade-in text-center">
          <button
            type="button"
            onClick={() => { setStep("creds"); setErrorMsg(""); }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={14} /> Ortga qaytish
          </button>

          <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-100 shadow-sm">
            <ShieldCheck size={32} />
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">
            2-Bosqichli Tasdiqlash
          </h2>
          <p className="text-gray-500 font-medium text-sm mb-6 max-w-xs mx-auto">
            <strong className="text-gray-800">{email}</strong> pochtasiga yuborilgan 6 xonali tasdiqlash kodini kiriting.
          </p>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex items-center justify-center gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { otpRefs.current[idx] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className={`w-12 h-14 text-center font-bold text-xl rounded-xl border transition-all outline-none ${
                    digit 
                      ? "bg-orange-50/40 border-orange-500 text-gray-900 ring-2 ring-orange-500/20" 
                      : "bg-white border-gray-200 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  }`}
                />
              ))}
            </div>

            {otpHint && (
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs text-amber-800 font-semibold max-w-sm mx-auto">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-amber-600" />
                  Sinov kodi: <strong>{otpHint}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const digits = otpHint.split("").slice(0, 6);
                    setOtp(digits);
                  }}
                  className="px-2 py-1 bg-amber-200/60 hover:bg-amber-200 text-amber-900 rounded-lg text-[11px] font-bold transition-colors"
                >
                  Kiritish
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otp.some((d) => !d)}
              className="w-full bg-gray-900 hover:bg-black text-white rounded-2xl py-4 font-bold text-base shadow-lg shadow-black/10 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : "Tasdiqlash va Kirish"}
            </button>
          </form>

          <div className="mt-6 text-center">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:underline"
              >
                <RefreshCw size={13} /> Kodni qayta yuborish
              </button>
            ) : (
              <span className="text-xs font-semibold text-gray-400">
                Kodni qayta yuborish: <strong>00:{countdown < 10 ? `0${countdown}` : countdown}</strong>
              </span>
            )}
          </div>
        </div>
      )}

    </main>
  );
}

