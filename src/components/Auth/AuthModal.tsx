import React, { useState } from 'react';
import { api, setAuthToken, API_BASE_URL } from '../../services/api';
import { Lock, Mail, ShieldCheck, ArrowRight, UserPlus, LogIn, ArrowLeft, X, Sparkles, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Props {
  onSuccess: (user: any) => void;
  onCancel?: () => void;
}

export default function AuthModal({ onSuccess, onCancel }: Props) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'creds' | 'otp'>('creds');
  const [tempToken, setTempToken] = useState<string>('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

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
        // Register flow
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password: password.trim(), name: name.trim() })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Ro'yxatdan o'tishda xatolik");
        
        if (data.require_2fa) {
          setTempToken(data.temp_token);
          if (data.otp_hint) setOtp(data.otp_hint);
          setStep('otp');
          toast.success(data.message || "Tasdiqlash kodi yuborildi!", { icon: '🛡️' });
        } else if (data.access_token) {
          setAuthToken(data.access_token);
          onSuccess(data.user);
          toast.success(`Hisobingiz ochildi! Xush kelibsiz, ${data.user?.name || 'Kitobxon'}!`);
        }
      } else {
        // Login flow
        const data = await api.login(email.trim(), password.trim());
        if (data.require_2fa) {
          setTempToken(data.temp_token);
          if (data.otp_hint) setOtp(data.otp_hint);
          setStep('otp');
          toast.success("Xavfsizlik 2FA tasdiqlash kodi yuborildi", { icon: '🛡️' });
        } else if (data.access_token) {
          setAuthToken(data.access_token);
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error("Iltimos, 6 xonali tasdiqlash kodini kiriting");
      return;
    }

    setLoading(true);
    try {
      const data = await api.verify2FA(tempToken, otp.trim());
      if (data.access_token) {
        setAuthToken(data.access_token);
        onSuccess(data.user);
        toast.success(`Xavfsizlik tekshiruvidan muvaffaqiyatli o'tildi! Xush kelibsiz, ${data.user?.name || 'Kitobxon'}! 👑`);
      }
    } catch (err: any) {
      toast.error(err.message || "Kod noto'g'ri yoki muddati o'tgan");
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
            className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-mono text-stone-500 hover:text-[#E05638] dark:hover:text-amber-400 transition-colors cursor-pointer group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Bosh sahifaga qaytish</span>
          </button>
        )}

        {/* Brand Crest */}
        <div className="text-center space-y-2 pt-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E05638] to-[#C5A059] flex items-center justify-center text-white font-serif font-bold text-2xl shadow-lg mx-auto">
            B
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950 dark:text-white">
            {step === 'otp' ? "2-Bosqichli Tasdiqlash" : isRegister ? "Yangi Hisob Ochish" : "Tizimga Kirish"}
          </h2>
          <p className="text-xs text-stone-500">
            {step === 'otp' 
              ? "Profilingiz xavfsizligi uchun maxsus kod kiritilishi lozim" 
              : "Barcha durdona asarlar va shaxsiy mutolaa javoni"}
          </p>
        </div>

        {/* STEP 1: Credentials Form */}
        {step === 'creds' && (
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#E05638] hover:bg-[#C74326] text-white font-bold text-xs font-mono uppercase tracking-wider transition-transform active:scale-95 shadow-xl cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
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
        )}

        {/* STEP 2: 2FA OTP Challenge */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="p-4 rounded-2xl bg-[#C5A059]/10 border border-[#C5A059]/30 text-stone-800 dark:text-stone-200 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#A6823F]">
                <ShieldCheck size={16} />
                <span>2-Bosqichli Xavfsizlik Himoyasi (2FA)</span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-300">
                Xavfsizlik kodi: <strong className="font-mono text-stone-900 dark:text-white">{otp || "984211"}</strong>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block text-center">
                6 Xonali Tasdiqlash Kodini Kiriting
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="984211"
                className="w-full text-center tracking-[0.4em] font-mono font-bold text-2xl py-3 rounded-2xl bg-stone-50 dark:bg-[#0E1218] border border-stone-200 dark:border-white/10 text-stone-900 dark:text-white outline-none focus:border-[#E05638]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#E05638] hover:bg-[#C74326] text-white font-bold text-xs font-mono uppercase tracking-wider transition-transform active:scale-95 shadow-xl cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? "Tasdiqlanmoqda..." : "Kodni Tasdiqlash & Kirish"}</span>
              <ShieldCheck size={16} />
            </button>

            <button
              type="button"
              onClick={() => setStep('creds')}
              className="w-full text-center text-xs text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              ← Orqaga qaytish
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
