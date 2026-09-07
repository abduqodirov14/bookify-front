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
  FileText
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
    toast.success("Volontyorlik kodi nusxalandi!");
    setTimeout(() => setCopied(false), 2000);
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
      toast.success("Tabriklaymiz! Volontyorlik maqomi muvaffaqiyatli faollashtirildi! 🤝🎉");
      
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
      
      {/* ── HERO BANNER ── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0D131F] via-[#151D2A] to-[#0A0D14] border border-amber-500/20 p-8 sm:p-12 text-white shadow-2xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-gradient-to-br from-amber-500/10 to-[#E05638]/20 blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 opacity-10 pointer-events-none hidden lg:block">
          <Award size={280} className="text-[#C5A059]" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-wider uppercase">
            <Sparkles size={13} className="animate-spin" />
            <span>Madaniy Meros & Ovozli Adabiyot Harakati</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Bookify Volontyorlar Markazi
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl font-sans">
            O'zbek xalqining boy adabiy durdonalari va nodir mumtoz asarlarini ovozlashtirish, sifatli audioboblarga aylantirish hamda har bir kitobxonga bepul yetkazish harakatiga qo'shiling.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-stone-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>100% Bepul & Ochiq</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Bot size={14} className="text-[#24A1DE]" />
              <span>Telegram Bot Integratsiyasi</span>
            </span>
            <span className="flex items-center gap-1.5">
              <GraduationCap size={14} className="text-amber-400" />
              <span>Rasmiy Universitet Sertifikatlari</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── SECTION 1: IF USER IS VOLUNTEER (VIP PROFILE CARD & CTA) ── */}
      {isVolunteer ? (
        <div className="space-y-8">
          
          {/* VIP Card */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1c1813] via-[#14120e] to-[#0d0c0a] border-2 border-amber-500/40 p-6 sm:p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              {/* User Identity */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-[#E05638] text-white font-bold flex items-center justify-center text-2xl uppercase shadow-lg ring-4 ring-amber-500/20 shrink-0">
                  {currentUser?.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    (currentUser?.name || 'V').charAt(0)
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-xl sm:text-2xl text-white">
                      {currentUser?.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      VIP VOLONTYOR
                    </span>
                  </div>
                  <p className="text-amber-200/80 text-xs sm:text-sm font-medium">
                    {volunteerTitle}
                  </p>
                  <p className="text-xs text-stone-400 font-mono">
                    {currentUser?.email}
                  </p>
                </div>
              </div>

              {/* Secret Volunteer Code Box */}
              <div className="w-full md:w-auto bg-black/40 backdrop-blur-md border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 shadow-inner">
                <div className="text-center sm:text-left space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-semibold block">
                    Shaxsiy Volontyorlik Kodi (PIN)
                  </span>
                  <div className="font-mono text-2xl font-extrabold tracking-widest text-white drop-shadow">
                    {volunteerCode || "VOL-FAOL"}
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono block">
                    Telegram botda ovoz yozish uchun kalit
                  </span>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
                >
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  <span>{copied ? "Nusxalandi!" : "Nusxa Olish"}</span>
                </button>
              </div>

            </div>

            {/* Stats Footer of VIP Card */}
            <div className="mt-6 pt-6 border-t border-amber-500/20 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-stone-400 text-[11px] block">Hisoblangan Soatlar:</span>
                <span className="text-lg font-bold text-amber-400">
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
                <span className="text-stone-400 text-[11px] block">Faoliyat Maqomi:</span>
                <span className="text-lg font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Tasdiqlangan</span>
                </span>
              </div>
            </div>

          </div>

          {/* Telegram Bot Action CTA */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#24A1DE] text-white flex items-center justify-center shrink-0 shadow-md">
                <Bot size={26} />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                  Telegram Botda Asarlarga Ovoz Yozish
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 max-w-xl leading-relaxed">
                  Ovoz yozish juda oson: Telegram botimizga kiring, shaxsiy kodingizni (<b>{volunteerCode}</b>) yuboring va xohlagan kitobingizga audioboblar yuklang. 20MB limit avtomatik boshqariladi.
                </p>
              </div>
            </div>

            <a
              href={`https://t.me/book1fy_bot?start=vol_${volunteerCode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-[#24A1DE] hover:bg-[#1f8ec4] text-white text-xs font-mono font-bold transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Mic size={16} />
              <span>Telegram Botni Ochish (@book1fy_bot)</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {/* My Certificates Section */}
          {myCertificates.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-stone-950 dark:text-white flex items-center gap-2">
                  <GraduationCap size={22} className="text-amber-500" />
                  <span>Mening Rasmiy Volontyorlik Sertifikatlarim</span>
                </h3>
                <span className="text-xs font-mono text-stone-400">
                  {myCertificates.length} ta sertifikat
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myCertificates.map(cert => (
                  <div
                    key={cert.id || cert.serial_number}
                    className="p-5 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200 dark:border-white/10 shadow-xs flex flex-col justify-between gap-4 hover:border-amber-500/40 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          {cert.serial_number}
                        </span>
                        <span className="text-[10px] font-mono text-stone-400">
                          {cert.issue_date || '2026'}
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                        {cert.role_title}
                      </h4>

                      <p className="text-xs text-stone-500 font-mono">
                        Akkreditatsiya: {cert.accredited_hours} • {cert.quality_grade || 'Grade A+'}
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigate('verify', cert.serial_number)}
                      className="w-full py-2.5 rounded-xl bg-stone-100 dark:bg-white/5 hover:bg-amber-500/10 hover:text-amber-600 text-stone-700 dark:text-stone-300 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Award size={14} />
                      <span>Sertifikatni Ko'rish & Yuklab Olish</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      ) : (
        /* ── SECTION 2: FOR REGULAR USERS / GUESTS (CLAIM CODE & JOIN) ── */
        <div className="space-y-8">
          
          {/* Claim Code Box */}
          <div className="rounded-3xl p-6 sm:p-10 bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-sm space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <KeyRound size={24} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-950 dark:text-white">
                  Sizda Volontyorlik Kodi Bormi?
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl leading-relaxed">
                  Agar Bookify ma'muriyati sizga <b>VOL-XXXXXX</b> ko'rinishidagi maxsus kod bergan bo'lsa, uni quyidagi maydonga kiriting va profilingizda rasmiy Volontyorlik imkoniyatlarini faollashtiring.
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
                className="w-full sm:flex-1 px-5 py-3.5 rounded-2xl bg-stone-50 dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-sm font-mono font-bold tracking-widest text-[#E05638] focus:outline-none focus:border-[#E05638] transition-colors uppercase"
              />
              <button
                type="submit"
                disabled={isClaiming}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#E05638] to-[#C5A059] hover:opacity-95 text-white text-xs font-mono font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 shrink-0"
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

          {/* Why Volunteer (Benefits) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <GraduationCap size={20} />
              </div>
              <h4 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                Universitet & Grant Sertifikati
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Volontyorlik faoliyatingiz uchun xalqaro standartlarga mos, QR-kod bilan tasdiqlanuvchi rasmiy akademik sertifikat taqdim etiladi.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-[#24A1DE] flex items-center justify-center">
                <Headphones size={20} />
              </div>
              <h4 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                Ovozli Asarlar Yaratish
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Telegram botimiz orqali o'zingiz tanlagan nodir asarga ovoz bering. Siz yaratgan audioboblarni butun respublika bo'ylab minglab kitobxonlar tinglaydi.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-[#E05638]/10 text-[#E05638] flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h4 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                Mualliflik & VIP Maqom
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Har bir yuklangan audiobobda sizning ismingiz rasmiy diktor sifatida ko'rsatiladi va profil kartangizda oltin ko'krak nishoni porlab turadi.
              </p>
            </div>

          </div>

          {/* Contact Admin to become volunteer */}
          <div className="rounded-3xl p-6 sm:p-8 bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                Volontyor bo'lishni xohlaysizmi?
              </h4>
              <p className="text-xs text-stone-500">
                Administrator bilan bog'laning, qisqa ovoz namunangizni yuboring va maxsus kodingizni qabul qilib oling.
              </p>
            </div>

            <a
              href="https://t.me/koder_oka"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-2xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-[#E05638] dark:hover:bg-[#E05638] dark:hover:text-white text-xs font-mono font-bold transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Send size={14} />
              <span>Adminga Bog'lanish (Telegram)</span>
            </a>
          </div>

        </div>
      )}

      {/* ── SECTION 3: BOOKS READY FOR NARRATION ── */}
      <div className="space-y-6 pt-6 border-t border-stone-200 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-950 dark:text-white flex items-center gap-2">
              <BookOpen size={22} className="text-[#E05638]" />
              <span>Ovoz Yozilishi Mumkin Bo'lgan Asarlar</span>
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Quyidagi asarlardan birini tanlab, Telegram botimizda audioboblar yozishni boshlashingiz mumkin
            </p>
          </div>
          <span className="text-xs font-mono text-stone-400 hidden sm:block">
            {narratableBooks.length} ta asar
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {narratableBooks.map(book => {
            const hasAudio = Boolean(book.audioTracks && book.audioTracks.length > 0) || Boolean(book.audioDuration);
            const tracksCount = book.audioTracks?.length || 0;

            return (
              <div
                key={book.id}
                className="group p-4 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 hover:border-amber-500/40 transition-all shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="flex gap-4">
                  <div className="w-18 h-24 rounded-xl overflow-hidden shadow-md shrink-0 bg-stone-100 dark:bg-stone-800">
                    <img 
                      src={book.coverImage} 
                      alt={book.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
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
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <Headphones size={11} />
                          <span>{tracksCount > 0 ? `${tracksCount} ta audiobob` : 'Audiosi bor'}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                          <Mic size={11} />
                          <span>Ovoz kutmoqda</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 dark:border-white/5 flex items-center gap-2">
                  <a
                    href={`https://t.me/book1fy_bot?start=rec_${book.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-[#E05638]/15 hover:from-amber-500/25 hover:to-[#E05638]/25 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-amber-500/30"
                  >
                    <Mic size={13} />
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
