"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Mail, Lock, User, ArrowRight, Check } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState<'creds' | 'otp'>('creds');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleCredsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setStep('otp');
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

  const handleVerify = () => {
    // "Auth shart emas hozircha" - Mock successful login
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans flex flex-col">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#F5F5F7]/80 backdrop-blur-xl px-4 py-4 flex items-center justify-between">
        <button onClick={() => { step === 'otp' ? setStep('creds') : router.push('/') }} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
          <ChevronLeft size={28} className="text-gray-900" />
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-md mx-auto flex flex-col justify-center px-6 pt-20 pb-12">
        
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

              <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white rounded-[20px] py-4 font-bold text-lg shadow-lg shadow-black/20 flex items-center justify-center gap-2 transition-transform active:scale-95 mt-6">
                Davom etish
                <ArrowRight size={20} />
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
          </div>
        )}

        {step === 'otp' && (
          <div className="animate-fade-in flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-blue-100">
              <Mail size={36} strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Tasdiqlash kodi</h1>
            <p className="text-gray-500 font-medium mb-8 px-4">
              <span className="font-bold text-gray-700">{email}</span> manziliga yuborilgan 6 xonali kodni kiriting.
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
              disabled={otp.join('').length !== 6}
              className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-[20px] py-4 font-bold text-lg shadow-lg shadow-black/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Check size={24} />
              Tasdiqlash
            </button>

            <div className="mt-8 text-center">
              <p className="text-gray-500 font-medium text-sm">
                Kodni olmadingizmi? <button className="text-blue-600 font-bold hover:underline ml-1">Qaytadan yuborish</button>
              </p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}