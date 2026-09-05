'use client';
import React, { useState, useEffect } from 'react';
import { api, setAuthToken, setCachedUser } from '../../services/api';
import { Lock, Mail, ShieldCheck, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Props {
  onSuccess: (user: any) => void;
  onCancel?: () => void;
}

const GOOGLE_CLIENT_ID = "832394996948-dujs53b5i8jmfbjdhfq4n2ec8462s1mr.apps.googleusercontent.com";

export default function AuthModal({ onSuccess, onCancel }: Props) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'creds' | 'otp'>('creds');
  const [tempToken, setTempToken] = useState<string>('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const [isResending, setIsResending] = useState<boolean>(false);

  // 60-second OTP resend countdown
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Initialize Cloudflare Turnstile Captcha
  useEffect(() => {
    if (step !== 'creds') return;
    const scriptId = 'cf-turnstile-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const initTurnstile = () => {
      const container = document.getElementById('turnstile-widget');
      if (container && (window as any).turnstile) {
        container.innerHTML = '';
        try {
          (window as any).turnstile.render('#turnstile-widget', {
            sitekey: process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || '0x4AAAAAAEpTeNVFrbGyXEPM',
            callback: (token: string) => {
              setTurnstileToken(token);
            },
            'expired-callback': () => {
              setTurnstileToken('');
            },
            theme: 'auto',
            size: 'normal'
          });
        } catch (e) {
          console.warn('Turnstile render warning:', e);
        }
      }
    };

    const timer = setTimeout(initTurnstile, 500);
    return () => clearTimeout(timer);
  }, [step, isRegister]);

  // Initialize Google Identity Services (One-Tap & Native Button)
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      try {
        if ((window as any).google?.accounts?.id) {
          (window as any).google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false
          });

          const container = document.getElementById('google-native-signin-btn');
          if (container) {
            (window as any).google.accounts.id.renderButton(container, {
              theme: 'outline',
              size: 'large',
              width: 340,
              text: 'continue_with',
              shape: 'pill',
              logo_alignment: 'left'
            });
            setGoogleReady(true);
          }
        }
      } catch (err) {
        console.warn("Google auth init:", err);
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Initialize Telegram Login Handler & Widget
  useEffect(() => {
    (window as any).onTelegramAuth = async (user: any) => {
      setLoading(true);
      try {
        const data = await api.telegramAuth(user);
        if (data.access_token) {
          onSuccess(data.user);
          toast.success(`Xush kelibsiz, ${data.user?.name || 'Kitobxon'}! 🚀`);
        }
      } catch (err: any) {
        toast.error(err.message || "Telegram orqali kirishda xatolik");
      } finally {
        setLoading(false);
      }
    };

    // Listen for Telegram OAuth popup messages
    const handleTgMsg = async (event: MessageEvent) => {
      if (event.data?.event === 'auth_result' && event.data?.result) {
        (window as any).onTelegramAuth(event.data.result);
      }
    };
    window.addEventListener('message', handleTgMsg);

    return () => {
      window.removeEventListener('message', handleTgMsg);
    };
  }, []);

  const handleTelegramClick = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bookify-six-alpha.vercel.app';
    const popupUrl = `https://oauth.telegram.org/auth?bot_id=8814342475&origin=${encodeURIComponent(origin)}&request_access=write`;
    const w = 550;
    const h = 470;
    const left = (window.screen.width / 2) - (w / 2);
    const top = (window.screen.height / 2) - (h / 2);
    window.open(popupUrl, 'telegram_auth', `width=${w},height=${h},top=${top},left=${left}`);
  };

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response.credential) return;
    setLoading(true);
    try {
      const data = await api.googleAuth(response.credential);
      if (data.access_token) {
        setAuthToken(data.access_token);
        if (data.user) setCachedUser(data.user);
        onSuccess(data.user);
        toast.success(`Xush kelibsiz, ${data.user?.name || 'Kitobxon'}!`);
      }
    } catch (err: any) {
      toast.error(err.message || "Google orqali kirishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleManualGoogleClick = () => {
    try {
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.prompt();
      } else {
        toast.error("Google xizmati ulanmoqda, iltimos 2 soniya kuting...");
      }
    } catch {
      toast.error("Google tizimiga ulanib bo'lmadi");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Iltimos, elektron pochta va parolni kiriting");
      return;
    }
    if (isRegister && !name.trim()) {
      toast.error("Iltimos, ismingizni kiriting");
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        const data = await api.register(email.trim(), password.trim(), name.trim(), turnstileToken);
        if (data.require_2fa) {
          setTempToken(data.temp_token);
          setStep('otp');
          setResendCountdown(60);
          toast.success(data.message || "5 xonali tasdiqlash kodi pochtangizga yuborildi!", { icon: '📩' });
        } else if (data.access_token) {
          setAuthToken(data.access_token);
          if (data.user) setCachedUser(data.user);
          onSuccess(data.user);
          toast.success(`Hisobingiz ochildi! Xush kelibsiz, ${data.user?.name || 'Kitobxon'}!`);
        }
      } else {
        const data = await api.login(email.trim(), password.trim(), turnstileToken);
        if (data.require_2fa) {
          setTempToken(data.temp_token);
          setStep('otp');
          setResendCountdown(60);
          toast.success(data.message || "5 xonali tasdiqlash kodi pochtangizga yuborildi", { icon: '📩' });
        } else if (data.access_token) {
          setAuthToken(data.access_token);
          if (data.user) setCachedUser(data.user);
          onSuccess(data.user);
          toast.success(`Xush kelibsiz, ${data.user?.name || 'Kitobxon'}!`);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || isResending || !tempToken) return;
    setIsResending(true);
    try {
      const res = await api.resendOTP(tempToken);
      toast.success(res.message || "Yangi 5 xonali kod pochtangizga yuborildi!", { icon: '📩' });
      setResendCountdown(60);
    } catch (err: any) {
      toast.error(err.message || "Kodni qayta yuborishda xatolik");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error("Iltimos, 5 xonali tasdiqlash kodini kiriting");
      return;
    }

    setLoading(true);
    try {
      const data = await api.verify2FA(tempToken, otp.trim());
      if (data.access_token) {
        setAuthToken(data.access_token);
        if (data.user) setCachedUser(data.user);
        onSuccess(data.user);
        toast.success(`Xavfsizlik tekshiruvidan muvaffaqiyatli o'tildi! Xush kelibsiz, ${data.user?.name || 'Kitobxon'}!`);
      }
    } catch (err: any) {
      toast.error(err.message || "5 xonali kod noto'g'ri yoki muddati o'tgan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
        
        {/* Back to Home Button */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-mono text-stone-500 hover:text-[#E05638] transition-colors cursor-pointer group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Bosh sahifa</span>
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E05638] to-[#C5A059] flex items-center justify-center text-white font-serif font-bold text-2xl shadow-lg mx-auto">
            B
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950 dark:text-white">
            {step === 'otp' ? "Xavfsizlik Tasdig'i" : isRegister ? "Yangi Hisob Ochish" : "Tizimga Kirish"}
          </h2>
          <p className="text-xs text-stone-500">
            {step === 'otp' 
              ? "Profilingiz himoyasi uchun tasdiqlash kodini kiriting" 
              : "Durdona asarlar va shaxsiy mutolaa javoniga kirish"}
          </p>
        </div>

        {/* STEP 1: Credentials Form */}
        {step === 'creds' && (
          <div className="space-y-5">

            {/* ── SOCIAL AUTH: GOOGLE & TELEGRAM ── */}
            <div className="space-y-3">
              {/* Google Button */}
              <button
                type="button"
                onClick={handleManualGoogleClick}
                className="w-full h-12 px-5 rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-[#0E1218] hover:bg-stone-50 dark:hover:bg-white/5 text-stone-800 dark:text-stone-200 font-semibold text-xs flex items-center justify-center gap-3 transition-all shadow-xs hover:shadow-md active:scale-[0.99] cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google hisobi orqali kirish</span>
              </button>

              {/* Telegram Button */}
              <button
                type="button"
                onClick={handleTelegramClick}
                className="w-full h-12 px-5 rounded-2xl border border-[#24A1DE]/40 bg-[#24A1DE] hover:bg-[#208fca] active:scale-[0.99] text-white font-semibold text-xs flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                </svg>
                <span>Telegram orqali kirish</span>
              </button>
            </div>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-stone-200 dark:bg-white/10" />
              <span className="text-[11px] font-mono text-stone-400 uppercase">yoki elektron pochta</span>
              <div className="flex-1 h-px bg-stone-200 dark:bg-white/10" />
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              
              {isRegister && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">
                    Ism va Familiya *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Dilshodbek Abduqodirov"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-[#0E1218] border border-stone-200 dark:border-white/10 text-xs text-stone-900 dark:text-white outline-none focus:border-[#E05638]"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">
                  Elektron Pochta *
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    required
                    placeholder="nomingiz@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-stone-50 dark:bg-[#0E1218] border border-stone-200 dark:border-white/10 text-xs text-stone-900 dark:text-white outline-none focus:border-[#E05638]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">
                  Maxfiy Parol *
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-stone-50 dark:bg-[#0E1218] border border-stone-200 dark:border-white/10 text-xs text-stone-900 dark:text-white outline-none focus:border-[#E05638]"
                  />
                </div>
              </div>

              {/* Cloudflare Turnstile Captcha Widget */}
              <div id="turnstile-widget" className="flex justify-center my-2 min-h-[65px]"></div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#E05638] hover:bg-[#C74326] text-white font-bold text-xs font-mono uppercase tracking-wider transition-transform active:scale-95 shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? "Tekshirilmoqda..." : isRegister ? "Ro'yxatdan O'tish" : "Tizimga Kirish"}</span>
                <ArrowRight size={15} />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setName('');
                    setEmail('');
                    setPassword('');
                  }}
                  className="text-xs text-stone-500 hover:text-[#E05638] dark:hover:text-white transition-colors cursor-pointer"
                >
                  {isRegister ? "Profilingiz bormi? Tizimga kirish" : "Hisobingiz yo'qmi? Yangi hisob ochish"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: 2FA OTP Challenge (5-Digit Gmail Code) */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-white/[0.03] border border-stone-200 dark:border-white/10 text-stone-800 dark:text-stone-200 space-y-1.5 text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-stone-900 dark:text-white">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span>Pochta Tasdig'i &amp; 2FA</span>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Bir martalik <strong>5 xonali tasdiqlash kodi</strong> sizning pochtangizga (<strong className="text-[#E05638] dark:text-amber-400">{email}</strong>) yuborildi. Iltimos, pochtangizni (kerak bo'lsa Spam bo'limini) tekshiring.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block text-center">
                5 Xonali Tasdiqlash Kodi
              </label>
              <input
                type="text"
                required
                maxLength={5}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="•••••"
                className="w-full text-center tracking-[0.6em] font-mono font-bold text-3xl py-3 rounded-2xl bg-stone-50 dark:bg-[#0E1218] border border-stone-200 dark:border-white/10 text-stone-900 dark:text-white outline-none focus:border-[#E05638]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#E05638] hover:bg-[#C74326] text-white font-bold text-xs font-mono uppercase tracking-wider transition-transform active:scale-95 shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? "Tasdiqlanmoqda..." : "Kodni Tasdiqlash"}</span>
              <Check size={16} />
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                disabled={resendCountdown > 0 || isResending}
                onClick={handleResendOtp}
                className="text-xs text-stone-500 hover:text-[#E05638] dark:hover:text-amber-400 font-mono disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                {isResending 
                  ? "Yuborilmoqda..." 
                  : resendCountdown > 0 
                    ? `Kodni qayta yuborish (${resendCountdown}s)` 
                    : "Kodni qayta yuborish 📩"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setStep('creds')}
              className="w-full text-center text-xs text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              ← Boshqa hisob bilan kirish
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
