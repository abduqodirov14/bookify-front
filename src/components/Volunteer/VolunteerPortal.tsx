import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Award, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  Headphones, 
  BookOpen, 
  Bot, 
  CheckCircle2, 
  Send, 
  KeyRound, 
  GraduationCap, 
  ShieldCheck, 
  Clock, 
  Users, 
  Mic, 
  ChevronRight, 
  Loader2,
  Volume2,
  Radio,
  Bookmark,
  Share2,
  Sliders,
  CheckCheck
} from 'lucide-react';
import { Book, UserProfile, Page } from '../../types';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

interface Props {
  books: Book[];
  currentUser: UserProfile | null;
  onNavigate: (page: Page, param?: string) => void;
  onUserUpdate?: (updatedUser: UserProfile) => void;
}

export default function VolunteerPortal({
  books,
  currentUser,
  onNavigate,
  onUserUpdate
}: Props) {
  const [claimCodeInput, setClaimCodeInput] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [myCertificates, setMyCertificates] = useState<any[]>([]);
  const [isLoadingCerts, setIsLoadingCerts] = useState(false);

  const isVolunteer = Boolean(
    currentUser?.is_volunteer || 
    currentUser?.role === 'VOLUNTEER' || 
    currentUser?.volunteer_code
  );

  const volunteerCode = currentUser?.volunteer_code || '';
  const volunteerTitle = currentUser?.volunteer_title || 'Bosh Ovozli Diktor & Madaniy Meros Volontyori';
  const volunteerHours = currentUser?.volunteer_hours || 0;

  // Fetch certificates for current volunteer
  useEffect(() => {
    if (currentUser?.id) {
      setIsLoadingCerts(true);
      api.getUserCertificates(currentUser.id)
        .then(data => {
          setMyCertificates(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          setMyCertificates([]);
        })
        .finally(() => {
          setIsLoadingCerts(false);
        });
    }
  }, [currentUser]);

  const handleCopyCode = () => {
    if (!volunteerCode) return;
    navigator.clipboard.writeText(volunteerCode);
    setCopied(true);
    toast.success("Volontyorlik kodi nusxalandi! Telegram botga yuborishingiz mumkin.");
    setTimeout(() => setCopied(false), 2200);
  };

  const handleClaimCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Iltimos, avval tizimga kiring!");
      onNavigate('auth');
      return;
    }

    const cleanCode = claimCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      toast.error("Iltimos, volontyorlik kodini kiriting!");
      return;
    }

    setIsClaiming(true);
    try {
      const res = await api.claimVolunteerCode(cleanCode);
      toast.success("Xush kelibsiz! Volontyorlik maqomi muvaffaqiyatli faollashtirildi! 🤝🎉");
      
      const updatedUser: UserProfile = {
        ...currentUser,
        role: 'VOLUNTEER',
        is_volunteer: true,
        volunteer_code: res.volunteer_code || cleanCode,
        volunteer_title: res.volunteer_title || 'Bosh Ovozli Diktor & Madaniy Meros Volontyori'
      };

      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
      setClaimCodeInput('');
    } catch (err: any) {
      toast.error(err.message || "Kodni tasdiqlashda xatolik yuz berdi");
    } finally {
      setIsClaiming(false);
    }
  };

  // Books that can be narrated
  const narratableBooks = books.filter(b => b.status === 'PUBLISHED' || !b.status);

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-300">
      
      {/* ── 1. EDITORIAL HERO BANNER ── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#121620] via-[#1A2230] to-[#0D1117] border border-amber-500/30 p-8 sm:p-12 text-white shadow-2xl">
        {/* Subtle background glow */}
        <div className="absolute -right-16 -top-16 w-96 h-96 rounded-full bg-gradient-to-br from-amber-500/15 to-[#E05638]/20 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        {/* Decorative corner watermark */}
        <div className="absolute right-8 bottom-4 opacity-5 pointer-events-none hidden lg:block text-white">
          <Award size={260} />
        </div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold tracking-wider uppercase shadow-inner">
            <Sparkles size={14} className="text-amber-400" />
            <span>O'zbek Madaniy Merosi & Ovozli Adabiyot Harakati</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Bookify Volontyorlar Markazi
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl font-sans">
            Xalqimizning nodir durdonalari, mumtoz she'riyat va zamonaviy kitoblarni ovozlashtirib, kelajak avlodlarga yetkazish harakatiga xush kelibsiz. Har bir ovoz yozuvi — xalqimiz ma'naviyati uchun qoldirilgan abadiy merosdir.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-5 text-xs font-mono text-stone-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span>100% Bepul Ochiq Kutubxona</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Bot size={15} className="text-[#24A1DE]" />
              <span>Telegram Audio Studiya (@book1fy_bot)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <GraduationCap size={15} className="text-amber-400" />
              <span>Rasmiy Akademik Sertifikatlar</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. VIP VOLUNTEER SECTION (FOR REGISTERED VOLUNTEERS) ── */}
      {isVolunteer ? (
        <div className="space-y-10">
          
          {/* ── LUXURY GUILD PASS (VIP GUVOXNOMA) ── */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1E1914] via-[#2A231C] to-[#14110E] border-2 border-[#C5A059]/40 p-6 sm:p-9 shadow-2xl">
            {/* Ambient metallic sheen */}
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#C5A059]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-1/4 -bottom-10 w-48 h-48 bg-[#E05638]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Guilloché Header Line */}
            <div className="flex items-center justify-between border-b border-[#C5A059]/25 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono tracking-[0.25em] text-[#C5A059] uppercase font-bold">
                  BOOKIFY ADABIY HAMJAMIYATI · RASMIY VOLONTYORLIK GUVOXNOMASI
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C5A059]/20 text-[#E5C578] border border-[#C5A059]/40">
                VIP STATUS
              </span>
            </div>

            {/* Main Pass Body */}
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              
              {/* Left: User Identity */}
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="relative">
                  <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-br from-[#E05638] via-[#C5A059] to-[#E05638] text-white font-bold flex items-center justify-center text-2xl sm:text-3xl uppercase shadow-xl ring-4 ring-[#C5A059]/30 shrink-0">
                    {currentUser?.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full rounded-2xl object-cover" />
                    ) : (
                      (currentUser?.name || 'V').charAt(0)
                    )}
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center shadow-md ring-2 ring-stone-900" title="Rasmiy Diktor">
                    <Mic size={14} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white tracking-tight">
                      {currentUser?.name}
                    </h3>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium">
                    <Award size={13} className="text-amber-400 shrink-0" />
                    <span>{volunteerTitle}</span>
                  </div>

                  <p className="text-xs text-stone-400 font-mono">
                    {currentUser?.email}
                  </p>
                </div>
              </div>

              {/* Right: Tactile Secret PIN Box */}
              <div className="w-full lg:w-auto bg-black/60 backdrop-blur-md border border-[#C5A059]/40 rounded-2xl p-5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-center gap-5">
                <div className="text-center sm:text-left space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A059] font-bold block">
                    Shaxsiy Volontyorlik Kodi (PIN)
                  </span>
                  <div className="font-mono text-2xl sm:text-3xl font-extrabold tracking-widest text-[#FFF4DE] drop-shadow">
                    {volunteerCode || "VOL-FAOL"}
                  </div>
                  <span className="text-[11px] text-stone-400 font-mono block">
                    Telegram botda ovoz yozish uchun kalit raqamingiz
                  </span>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-[#E05638]/20 hover:from-amber-500/30 hover:to-[#E05638]/30 border border-[#C5A059]/50 text-amber-200 text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-md"
                  title="Kodni nusxalash"
                >
                  {copied ? (
                    <>
                      <Check size={16} className="text-emerald-400" />
                      <span className="text-emerald-300">Nusxalandi! ✓</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="text-amber-400" />
                      <span>Kodni Nusxa Olish</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Pass Credentials Footer */}
            <div className="mt-8 pt-6 border-t border-[#C5A059]/25 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-stone-400 text-[11px] block">Hisoblangan Xizmat:</span>
                <span className="text-lg font-bold text-amber-300">
                  {volunteerHours} soat
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-stone-400 text-[11px] block">Rasmiy Sertifikatlar:</span>
                <span className="text-lg font-bold text-emerald-400">
                  {myCertificates.length} ta diplom
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-stone-400 text-[11px] block">Ruxsat Etilgan Bot:</span>
                <span className="text-lg font-bold text-[#24A1DE]">
                  @book1fy_bot
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-stone-400 text-[11px] block">Reyestr Holati:</span>
                <span className="text-lg font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Tasdiqlangan</span>
                </span>
              </div>
            </div>

          </div>

          {/* ── 3. SOUND RECORDING STUDIO CONSOLE (OVOZ YOZISH STUDIYASI) ── */}
          <div className="rounded-3xl p-6 sm:p-9 bg-[#121620] border border-amber-500/20 shadow-xl space-y-7">
            
            {/* Studio Header Bar with Audio Visualizer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-rose-400 flex items-center gap-2">
                  <span>● ON AIR</span>
                  <span className="text-stone-500">|</span>
                  <span className="text-stone-300">OVOZ YOZISH & AUDIO SPEKTAKL STUDIYASI</span>
                </span>
              </div>

              {/* Stylized Audio Frequency Soundwave */}
              <div className="flex items-center gap-1 h-6 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <span className="text-[10px] font-mono text-stone-400 mr-2 flex items-center gap-1">
                  <Volume2 size={12} className="text-[#C5A059]" />
                  <span>Ovoz To'lqini:</span>
                </span>
                {[12, 18, 8, 22, 14, 20, 10, 16, 24, 15, 9, 18].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}px` }}
                    className="w-1 rounded-full bg-gradient-to-t from-[#E05638] to-[#C5A059] opacity-80"
                  />
                ))}
              </div>
            </div>

            {/* Studio Guide Steps (Human Sound Director guidance) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono font-bold text-sm">
                  1
                </div>
                <h4 className="font-serif font-bold text-base text-white">
                  Asarni Tanlang
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed font-sans">
                  Quyidagi kutubxonadan o'zingizga ma'qul kitobni tanlang. Matnni ko'zdan kechirib, ruhiyatingizga yaqin bobni belgilang.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#24A1DE]/10 text-[#24A1DE] flex items-center justify-center font-mono font-bold text-sm">
                  2
                </div>
                <h4 className="font-serif font-bold text-base text-white">
                  Telegram Botga Kiring
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed font-sans">
                  Telegram botimizga (<a href={`https://t.me/book1fy_bot?start=vol_${volunteerCode}`} target="_blank" rel="noopener noreferrer" className="text-[#24A1DE] underline">@book1fy_bot</a>) o'ting va shaxsiy kodingizni yuboring. Bot sizni taniydi va yozuvni boshlaydi.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm">
                  3
                </div>
                <h4 className="font-serif font-bold text-base text-white">
                  Merosga Muhrlangan Ovoz
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed font-sans">
                  Har bir audiobob 10-15 daqiqa (18 MB gacha) bo'lishi tavsiya etiladi. Bot fayllarni tartiblaydi va sizning nomingiz diktor sifatida saqlanadi.
                </p>
              </div>

            </div>

            {/* Primary Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/30">
              <div className="space-y-0.5 text-center sm:text-left">
                <h4 className="font-serif font-bold text-base text-white flex items-center justify-center sm:justify-start gap-2">
                  <Bot size={18} className="text-[#24A1DE]" />
                  <span>Telegram Ovoz Yozish Botiga To'g'ridan-To'g'ri O'tish</span>
                </h4>
                <p className="text-xs text-stone-300 font-mono">
                  Sizning shaxsiy kodingiz ({volunteerCode}) bot havolasiga biriktirilgan
                </p>
              </div>

              <a
                href={`https://t.me/book1fy_bot?start=vol_${volunteerCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#24A1DE] hover:bg-[#1e8bc2] text-white text-xs font-mono font-bold transition-all shadow-lg hover:shadow-cyan-500/20 active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Mic size={16} />
                <span>Telegram Studiyani Ochish (@book1fy_bot)</span>
                <ExternalLink size={14} />
              </a>
            </div>

          </div>

          {/* ── 4. MY OFFICIAL ACADEMIC CERTIFICATES ── */}
          {myCertificates.length > 0 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-white flex items-center gap-2.5">
                    <GraduationCap size={24} className="text-amber-500" />
                    <span>Mening Rasmiy Volontyorlik Sertifikatlarim</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Universitetlar, xalqaro grantlar va akademik reyestrlar uchun QR-kodli rasmiy diplomlar
                  </p>
                </div>
                <span className="text-xs font-mono text-stone-400">
                  {myCertificates.length} ta sertifikat
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myCertificates.map(cert => (
                  <div
                    key={cert.id || cert.serial_number}
                    className="p-6 rounded-3xl bg-white dark:bg-[#121620] border border-amber-500/30 shadow-md flex flex-col justify-between gap-5 hover:border-amber-500 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          {cert.serial_number}
                        </span>
                        <span className="text-xs font-mono text-stone-400">
                          {cert.issue_date || '2026-yil'}
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                        {cert.role_title}
                      </h4>

                      <p className="text-xs text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
                        {cert.custom_citation || "O'zbek mumtoz adabiyotini ovozlashtirish va madaniy merosni rivojlantirishdagi beqiyos hissasi uchun."}
                      </p>

                      <div className="pt-2 flex items-center gap-4 text-xs font-mono text-stone-500">
                        <span>Akkreditatsiya: <b>{cert.accredited_hours}</b></span>
                        <span>Daraja: <b className="text-amber-500">{cert.quality_grade || 'Grade A+'}</b></span>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('verify', cert.serial_number)}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500/15 to-[#E05638]/15 hover:from-amber-500/25 hover:to-[#E05638]/25 text-amber-800 dark:text-amber-300 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 border border-amber-500/30 cursor-pointer"
                    >
                      <Award size={15} />
                      <span>Diplomni Ko'rish & A4 Chop Etish (PDF)</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      ) : (
        /* ── 5. SECTION FOR GUESTS / REGULAR USERS (CLAIM CODE & JOIN) ── */
        <div className="space-y-10">
          
          {/* ── PARCHMENT INVITATION / CLAIM CODE CARD ── */}
          <div className="rounded-3xl p-8 sm:p-12 bg-white dark:bg-[#121620] border-2 border-amber-500/30 shadow-xl space-y-7 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 via-transparent to-transparent pointer-events-none" />

            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C5A059] to-[#E05638] text-white flex items-center justify-center shrink-0 shadow-lg ring-2 ring-amber-500/20">
                <KeyRound size={28} />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif font-bold text-2xl text-stone-950 dark:text-white">
                  Sizda Volontyorlik Kodi Bormi?
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed font-sans">
                  Agar Bookify ma'muriyati sizni volontyorlikka qabul qilib, <b>VOL-XXXXXX</b> ko'rinishidagi maxsus PIN-kod bergan bo'lsa, uni quyidagi maydonga kiriting. Shunda shaxsiy VIP Guvohnomangiz va ovoz yozish studiyangiz faollashadi.
                </p>
              </div>
            </div>

            <form onSubmit={handleClaimCodeSubmit} className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <input
                type="text"
                value={claimCodeInput}
                onChange={(e) => setClaimCodeInput(e.target.value.toUpperCase())}
                placeholder="Masalan: VOL-849201"
                required
                className="w-full sm:flex-1 px-6 py-4 rounded-2xl bg-stone-50 dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-base font-mono font-bold tracking-widest text-[#E05638] focus:outline-none focus:border-[#C5A059] transition-colors uppercase shadow-inner"
              />
              <button
                type="submit"
                disabled={isClaiming}
                className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-gradient-to-r from-[#E05638] via-[#C5A059] to-[#E05638] hover:opacity-95 text-white text-xs font-mono font-bold transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2.5 shrink-0"
              >
                {isClaiming ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Tekshirilmoqda...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Kodni Faollashtirish</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Why Become a Volunteer? (Literary Guild benefits) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-7 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 space-y-3.5 shadow-sm hover:border-amber-500/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <GraduationCap size={24} />
              </div>
              <h4 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                Universitet & Grant Sertifikati
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
                Har bir volontyorlik faoliyatingiz uchun xalqaro darajadagi, OTMlar va grantlar (Chevening, Erasmus, Fulbright) qabul qiladigan rasmiy QR-kodli sertifikat taqdim etiladi.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 space-y-3.5 shadow-sm hover:border-blue-500/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-[#24A1DE] flex items-center justify-center">
                <Headphones size={24} />
              </div>
              <h4 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                Ovozli Asarlar Yaratish
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
                Telegram bot orqali o'zingiz yoqtirgan asarga ovoz bering. Siz o'qigan har bir audiobob butun mamlakatimiz bo'ylab minglab kitobxonlar xonadonida yangraydi.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 space-y-3.5 shadow-sm hover:border-[#E05638]/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#E05638]/10 text-[#E05638] flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <h4 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                Mualliflik & VIP Maqom
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
                Har bir yuklangan audiobobda sizning ism-sharifingiz bosh diktor sifatida qayd etiladi va profil kartangizda oltin ko'krak nishoni abadiy saqlanadi.
              </p>
            </div>

          </div>

          {/* Contact Admin to become volunteer */}
          <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-stone-100 to-amber-50 dark:from-[#151a24] dark:to-[#121620] border border-stone-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1.5 text-center md:text-left">
              <h4 className="font-serif font-bold text-xl text-stone-950 dark:text-white">
                Volontyor sifatida qo'shilishni xohlaysizmi?
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-xl">
                Loyiha asoschisi va administrator bilan Telegramda bog'laning, 1 daqiqalik qisqa ovoz namunangizni yuboring va shaxsiy <b>VOL-XXXXXX</b> kodingizni qabul qilib oling.
              </p>
            </div>

            <a
              href="https://t.me/koder_oka"
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 rounded-2xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-[#E05638] dark:hover:bg-[#E05638] dark:hover:text-white text-xs font-mono font-bold transition-all shadow-md flex items-center gap-2.5 shrink-0 cursor-pointer"
            >
              <Send size={15} />
              <span>Adminga Murojaat Qilish (@koder_oka)</span>
            </a>
          </div>

        </div>
      )}

      {/* ── 6. BOOKS READY FOR NARRATION (OVOZ YOZILISHI KUTILAYOTGAN ASARLAR) ── */}
      <div className="space-y-6 pt-6 border-t border-stone-200 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950 dark:text-white flex items-center gap-2.5">
              <BookOpen size={26} className="text-[#E05638]" />
              <span>Ovoz Yozilishi Mumkin Bo'lgan Asarlar</span>
            </h3>
            <p className="text-xs text-stone-500 mt-1 font-sans">
              Quyidagi asarlardan birini tanlab, Telegram botimiz orqali to'g'ridan-to'g'ri audioboblar yozishni boshlashingiz mumkin
            </p>
          </div>
          <span className="text-xs font-mono text-stone-400">
            {narratableBooks.length} ta asar mavjud
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {narratableBooks.map(book => {
            const hasAudio = Boolean(book.audioTracks && book.audioTracks.length > 0) || Boolean(book.audioDuration);
            const tracksCount = book.audioTracks?.length || 0;

            return (
              <div
                key={book.id}
                className="group p-5 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 hover:border-amber-500/50 hover:shadow-xl transition-all flex flex-col justify-between gap-5"
              >
                <div className="flex gap-4">
                  {/* Book Cover with Physical Hardcover Depth */}
                  <div className="w-20 h-28 rounded-xl overflow-hidden shadow-lg shrink-0 bg-stone-100 dark:bg-stone-800 relative group-hover:scale-105 transition-transform">
                    <img 
                      src={book.coverImage} 
                      alt={book.title} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/15 pointer-events-none" />
                  </div>

                  {/* Metadata */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block truncate">
                      {book.category}
                    </span>

                    <h4 className="font-serif font-bold text-base text-stone-950 dark:text-white truncate group-hover:text-[#E05638] transition-colors">
                      {book.title}
                    </h4>

                    <p className="text-xs text-stone-500 truncate">
                      {book.authorName}
                    </p>

                    <div className="pt-2 flex items-center gap-2 text-[10px] font-mono">
                      {hasAudio ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 border border-emerald-500/30">
                          <Headphones size={11} />
                          <span>{tracksCount > 0 ? `${tracksCount} ta bob yozilgan` : 'Audiosi bor'}</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 border border-amber-500/30">
                          <Mic size={11} />
                          <span>Ovoz kutmoqda</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Studio CTA on card */}
                <div className="pt-3 border-t border-stone-100 dark:border-white/5">
                  <a
                    href={`https://t.me/book1fy_bot?start=rec_${book.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500/15 to-[#E05638]/15 hover:from-amber-500/25 hover:to-[#E05638]/25 text-amber-800 dark:text-amber-300 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-500/30 shadow-xs"
                  >
                    <Mic size={14} />
                    <span>Telegramda Ovoz Yozish</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
