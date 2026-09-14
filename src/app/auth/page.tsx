"use client";

import React, { useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Mail, Lock, User, ArrowRight, Check, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { api, setAuthToken, setCachedUser } from "@/services/api";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState<'creds' | 'otp'>('creds');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleCredsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register(email, password, name);
        if (res.access_token) {
          router.push(redirectPath);
        } else {
          setIsRegister(false);
          setErrorMsg("Ro'yxatdan o'tdingiz. Endi kiring.");
        }
      } else {
        const res = await api.login(email, password);
        if (res.access_token) {
          router.push(redirectPath);
        } else if (res.temp_token) {
          setTempToken(res.temp_token);
          setStep('otp');
        } else {
          router.push(redirectPath);
        }
      }
    } catch (err: any) {
      console.warn("API login failed, fallback for testing:", err);
      // If user enters mock/demo or network error, let them in with appropriate role
      setErrorMsg(err.message || "Kirishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 5) return;
    setLoading(true);
    setErrorMsg('');

    try {
      if (tempToken) {
        await api.verify2FA(tempToken, code);
      }
      router.push(redirectPath);
    } catch (err: any) {
      setErrorMsg(err.message || "Kod noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  // Quick Test Roles (for easy demonstration without backend friction)
  const handleQuickLogin = (role: 'ADMIN' | 'SCHOOL_DIRECTOR' | 'LIBRARIAN' | 'STUDENT') => {
    const mockToken = "mock_token_" + role.toLowerCase() + "_" + Date.now();
    const mockUser = {
      id: "user_" + role.toLowerCase(),
      name: role === 'ADMIN' ? "Super Administrator" :
            role === 'SCHOOL_DIRECTOR' ? "Maktab Direktori" :
            role === 'LIBRARIAN' ? "Kutubxonachi" : "O'quvchi",
      email: `${role.toLowerCase()}@bookify.uz`,
      role: role
    };
    setAuthToken(mockToken);
    setCachedUser(mockUser);
    router.push(redirectPath);
  };

  return (
    <main className="flex-1 w-full max-w-md mx-auto flex flex-col justify-center px-6 pt-20 pb-12">
      
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 text-sm font-medium animate-fade-in">
          <AlertCircle size={20} className="shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {step === 'creds' && (
        <div className="animate-fade-in">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
            {isRegister ? "Xush kelibsiz!" : "Qaytganingiz bilan!"}
          </h1>
          <p className="text-gray-500 font-medium mb-8">
            {isRegister 
              ? "Yangi hisob yaratish uchun ma'lumotlarni kiriting." 
              : "Tizimga kirish uchun elektron pochta va parolingizni kiriting."}
          </p>

          <form onSubmit={handleCredsSubmit} className="space-y-4">
            {isRegister && (
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                  <User size={20} />
                </div>
                <input 
                  type="text" 
                  required
                  placeholder="Ismingiz" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-[20px] py-4 pl-12 pr-4 text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all shadow-sm"
                />
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <Mail size={20} />
              </div>
              <input 
                type="email" 
                required
                placeholder="Elektron pochta" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-[20px] py-4 pl-12 pr-4 text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all shadow-sm"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <Lock size={20} />
              </div>
              <input 
                type="password" 
                required
                placeholder="Parol" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-[20px] py-4 pl-12 pr-4 text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all shadow-sm"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-black text-white rounded-[20px] py-4 font-bold text-lg shadow-lg shadow-black/20 flex items-center justify-center gap-2 transition-transform active:scale-95 mt-6 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Davom etish
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 font-medium text-sm">
              {isRegister ? "Hisobingiz bormi? " : "Hisobingiz yo'qmi? "}
              <button 
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-blue-600 font-bold hover:underline"
              >
                {isRegister ? "Kirish" : "Ro'yxatdan o'tish"}
              </button>
            </p>
          </div>

          {/* Quick Access Roles for Testing */}
          <div className="mt-10 pt-6 border-t border-gray-200/80">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              <ShieldCheck size={14} /> Tezkor Sinov Rolllari
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="p-2.5 bg-white border border-gray-200 hover:border-black rounded-xl text-xs font-bold text-gray-900 transition-all text-center"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('SCHOOL_DIRECTOR')}
                className="p-2.5 bg-blue-50 border border-blue-200 hover:border-blue-400 rounded-xl text-xs font-bold text-blue-700 transition-all text-center"
              >
                Direktor
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('LIBRARIAN')}
                className="p-2.5 bg-emerald-50 border border-emerald-200 hover:border-emerald-400 rounded-xl text-xs font-bold text-emerald-700 transition-all text-center"
              >
                Kutubxonachi
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'otp' && (
        <div className="animate-fade-in flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-blue-100">
            <Mail size={36} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Tasdiqlash kodi</h1>
          <p className="text-gray-500 font-medium mb-8 px-4">
            <span className="font-bold text-gray-700">{email}</span> manziliga yuborilgan kodni kiriting.
          </p>

          <div className="flex items-center gap-2 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { otpRefs.current[index] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-12 h-14 bg-white border border-gray-200 rounded-2xl text-center text-2xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
              />
            ))}
          </div>

          <button 
            onClick={handleVerify}
            disabled={loading || otp.join('').length < 5}
            className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-[20px] py-4 font-bold text-lg shadow-lg shadow-black/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : <><Check size={24} /> Tasdiqlash</>}
          </button>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setStep('creds')} 
              className="text-gray-500 hover:text-gray-900 font-medium text-sm"
            >
              Ortga qaytish
            </button>
          </div>
        </div>
      )}

    </main>
  );
}

export default function AuthPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#F5F5F7]/80 backdrop-blur-xl px-4 py-4 flex items-center justify-between">
        <button onClick={() => router.push('/')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
          <ChevronLeft size={28} className="text-gray-900" />
        </button>
      </nav>

      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      }>
        <AuthForm />
      </Suspense>
    </div>
  );
}