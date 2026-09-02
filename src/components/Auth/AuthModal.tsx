import React, { useState } from 'react';
import { api, setAuthToken } from '../../services/api';
import { Lock, Mail, ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Props {
  onSuccess: (user: any) => void;
}

export default function AuthModal({ onSuccess }: Props) {
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/register`, {
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
      toast.error("6 xonali tasdiqlash kodini kiriting");
      return;
    }

    setLoading(true);
    try {
      const data = await api.verify2FA(tempToken, otp.trim());
      setAuthToken(data.access_token);
      onSuccess(data.user);
      toast.success(`Xush kelibsiz, ${data.user?.name || 'Kitobxon'}! 🎉`);
    } catch (err: any) {
      toast.error(err.message || "2FA kodi noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC] dark:bg-[#080B0F] transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 animate-in zoom-in-95">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E05638] to-[#C5A059] flex items-center justify-center text-white font-serif font-bold text-2xl mx-auto shadow-md">
            F
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-950 dark:text-white">
            {step === 'otp' ? "2-Bosqichli 2FA Tasdiqlash" : (isRegister ? "Yangi Hisob Ochish" : "Fianny Book Tizimiga Kirish")}
          </h2>
          <p className="text-xs text-stone-500">
            {step === 'otp' 
              ? "Hisobingiz 100% xavfsiz himoyalangan"
              : (isRegister ? "Barcha durdona asarlar va shaxsiy mutolaa javoni" : "O'z hisobingizga kiring")}
          </p>
        </div>

        {step === 'creds' ? (
          <form onSubmit={handleAuth} className="space-y-4">
            
            {isRegister && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">Ism va Familiya *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Dilshodbek Abduqodirov"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#0E1218] border border-stone-200 dark:border-white/10 text-xs text-stone-900 dark:text-white outline-none focus:border-[#E05638]"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">Elektron Pochta *</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  required
                  placeholder="nomingiz@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#0E1218] border border-stone-200 dark:border-white/10 text-xs text-stone-900 dark:text-white outline-none focus:border-[#E05638]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">Maxfiy Parol *</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#0E1218] border border-stone-200 dark:border-white/10 text-xs text-stone-900 dark:text-white outline-none focus:border-[#E05638]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#E05638] hover:bg-[#C74326] text-white font-bold text-xs font-mono uppercase tracking-wider transition-transform active:scale-95 shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? "Jarayonda..." : (isRegister ? "Ro'yxatdan O'tish" : "Tizimga Kirish")}</span>
              <ArrowRight size={15} />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-xs text-stone-500 hover:text-[#E05638] transition-colors cursor-pointer"
              >
                {isRegister ? "Profilingiz bormi? Tizimga kirish" : "Hisobingiz yo'qmi? Yangi hisob ochish"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block text-center">
                6 xonali 2FA tasdiqlash kodini kiriting
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                className="w-full py-3 rounded-xl bg-stone-50 dark:bg-[#0E1218] border border-stone-200 dark:border-white/10 text-center font-mono text-xl font-bold tracking-widest text-[#E05638] outline-none focus:border-[#E05638]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#E05638] hover:bg-[#C74326] text-white font-bold text-xs font-mono uppercase tracking-wider transition-transform active:scale-95 shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck size={16} />
              <span>{loading ? "Tasdiqlanmoqda..." : "Xavfsiz Kirishni Yakunlash"}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
