import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Award, 
  Copy, 
  Check, 
  ExternalLink, 
  Headphones, 
  BookOpen, 
  Bot, 
  CheckCircle2, 
  GraduationCap, 
  Clock, 
  Mic, 
  ChevronRight, 
  Loader2,
  ArrowRight,
  ShieldCheck,
  Send,
  FileText
} from 'lucide-react';
import VolunteerOnboardingModal from './VolunteerOnboardingModal';
import { Book, UserProfile, Page } from '../../types';
import { calculateVolunteerPeriod } from '../../utils/dateUtils';
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
  const [copied, setCopied] = useState(false);
  const [myCertificates, setMyCertificates] = useState<any[]>([]);
  const [isLoadingCerts, setIsLoadingCerts] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const isVolunteer = Boolean(
    currentUser?.is_volunteer || 
    currentUser?.role === 'VOLUNTEER' || 
    currentUser?.volunteer_code ||
    currentUser?.role === 'ADMIN'
  );
  const periodCalc = calculateVolunteerPeriod(currentUser?.created_at || '2025-09-01');

  // Auto-open onboarding charter for new volunteers who haven't accepted yet
  useEffect(() => {
    if (currentUser?.id && isVolunteer) {
      const acceptedKey = `bookify_volunteer_onboarded_${currentUser.id}`;
      const hasAccepted = localStorage.getItem(acceptedKey);
      if (!hasAccepted) {
        setIsOnboardingOpen(true);
      }
    }
  }, [currentUser?.id, isVolunteer]);

  const volunteerCode = currentUser?.volunteer_code || 'VOL-FAOL';
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

  // If user is not volunteer, show gentle notice
  if (!isVolunteer) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
          <HeartHandshake size={32} />
        </div>
        <h2 className="font-serif font-bold text-2xl text-stone-900 dark:text-white">
          Volontyorlik Bo'limi
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
          Ushbu sahifa faqat Bookify ma'muriyati tomonidan volontyorlik maqomi berilgan ishtirokchilar uchun mo'ljallangan.
        </p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="px-5 py-2.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold cursor-pointer"
          >
            Bosh Sahifaga Qaytish
          </button>
          <a
            href="https://t.me/koder_oka"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Send size={14} />
            <span>Adminga Murojaat Qilish</span>
          </a>
        </div>
      </div>
    );
  }

  // Faqat audiosi YO'Q bo'lgan asarlar volontyorlarga ovoz yozish uchun taklif qilinadi
  const isBookWithoutAudio = (b: Book) => {
    const hasTracks = Boolean(b.audioTracks && b.audioTracks.length > 0);
    const hasDuration = Boolean(b.audioDuration && b.audioDuration.trim() !== '' && b.audioDuration !== '0' && b.audioDuration !== '0:00');
    return !hasTracks && !hasDuration;
  };

  const booksNeedingVoice = books.filter(b => (b.status === 'PUBLISHED' || !b.status) && isBookWithoutAudio(b));

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-200 max-w-6xl mx-auto">
      
      {/* ── 1. CLEAN HUMAN-MADE PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-[#E05638]">
            <HeartHandshake size={15} />
            <span>Volontyorlar Maydoni</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950 dark:text-white tracking-tight">
            Ovozli Adabiyot Studiyasi
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-2xl">
            Kitoblarni ovozlashtirish, audioboblarni Telegram botimiz orqali yuklash va rasmiy xizmat ko'rsatkichlaringizni kuzatib borish bo'limi.
          </p>
        </div>

        <button
          onClick={() => setIsOnboardingOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25 text-amber-700 dark:text-amber-400 text-xs font-medium transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-2xs"
        >
          <FileText size={15} />
          <span>Volontyorlik Nizomi & Vazifalar</span>
        </button>
      </div>

      {/* ── 2. REFINED MEMBER CARD (HUMAN-MADE, LIGHT & DARK BALANCED) ── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs space-y-6">
        
        {/* Top row: Profile & Secret Code */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          
          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E05638] text-white font-bold flex items-center justify-center text-xl uppercase shadow-xs shrink-0">
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                (currentUser?.name || 'V').charAt(0)
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-950 dark:text-white">
                  {currentUser?.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  Volontyor
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                {volunteerTitle}
              </p>
              <p className="text-xs text-stone-400">
                {currentUser?.email}
              </p>
            </div>
          </div>

          {/* Clean Volunteer Code Box */}
          <div className="flex items-center justify-between sm:justify-end gap-3 p-3 sm:px-4 sm:py-2.5 rounded-2xl bg-stone-50 dark:bg-white/[0.04] border border-stone-200/80 dark:border-white/10 shrink-0">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold block">
                Shaxsiy Kod (PIN)
              </span>
              <span className="font-mono text-base sm:text-lg font-bold text-[#E05638] tracking-wider">
                {volunteerCode}
              </span>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-3 py-2 rounded-xl bg-white dark:bg-white/10 hover:bg-stone-100 dark:hover:bg-white/15 border border-stone-200/80 dark:border-white/10 text-stone-700 dark:text-stone-200 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Kodni nusxalash"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Nusxalandi</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Nusxa</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Bottom row: Clean 4 Metrics with calculated service period */}
        <div className="pt-5 border-t border-stone-100 dark:border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="space-y-0.5">
            <span className="text-stone-400 text-[11px] block">Xizmat davri (Muddati):</span>
            <span className="font-semibold text-sm text-stone-900 dark:text-white">
              {periodCalc.durationText} ({periodCalc.academicYearText.split(' ')[0]})
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="text-stone-400 text-[11px] block">Rasmiy sertifikatlar:</span>
            <span className="font-semibold text-sm text-stone-900 dark:text-white">
              {myCertificates.length} ta diplom
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="text-stone-400 text-[11px] block">Telegram studiya:</span>
            <a 
              href={`https://t.me/book1fy_bot?start=vol_${volunteerCode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sm text-[#24A1DE] hover:underline"
            >
              @book1fy_bot
            </a>
          </div>
          <div className="space-y-0.5">
            <span className="text-stone-400 text-[11px] block">Holat:</span>
            <span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Faol & Tasdiqlangan</span>
            </span>
          </div>
        </div>

      </div>

      {/* ── 3. TELEGRAM AUDIO RECORDING GUIDE (HUMAN-MADE, NO NEON JUNK) ── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-stone-50 dark:bg-[#121620] border border-stone-200/80 dark:border-white/10 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-lg text-stone-950 dark:text-white flex items-center gap-2">
              <Mic size={18} className="text-[#24A1DE]" />
              <span>Telegram orqali audio yozish</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Audioboblarni yozish va serverga yetkazish tartibi
            </p>
          </div>

          <a
            href={`https://t.me/book1fy_bot?start=vol_${volunteerCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#24A1DE] hover:bg-[#1f8ec4] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Bot size={15} />
            <span>Telegram Botni Ochish</span>
            <ExternalLink size={13} />
          </a>
        </div>

        {/* 3 Steps in Clean Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-stone-200/70 dark:border-white/5 space-y-1.5">
            <span className="font-mono font-bold text-[#E05638] text-xs block">
              1-qadam
            </span>
            <h4 className="font-medium text-stone-900 dark:text-white">
              Asarni tanlang
            </h4>
            <p className="text-stone-500 dark:text-stone-400 text-[11px] leading-relaxed">
              Quyidagi ro'yxatdan o'zingizga ma'qul kitobni tanlang va qaysi bobini o'qimoqchi ekanligingizni belgilang.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-stone-200/70 dark:border-white/5 space-y-1.5">
            <span className="font-mono font-bold text-[#24A1DE] text-xs block">
              2-qadam
            </span>
            <h4 className="font-medium text-stone-900 dark:text-white">
              Botga kodingizni yuboring
            </h4>
            <p className="text-stone-500 dark:text-stone-400 text-[11px] leading-relaxed">
              Telegram botimizga (<a href={`https://t.me/book1fy_bot?start=vol_${volunteerCode}`} target="_blank" rel="noopener noreferrer" className="text-[#24A1DE] underline">@book1fy_bot</a>) o'ting va shaxsiy kodingizni yuboring.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-stone-200/70 dark:border-white/5 space-y-1.5">
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs block">
              3-qadam
            </span>
            <h4 className="font-medium text-stone-900 dark:text-white">
              Ovozli xabar yuboring
            </h4>
            <p className="text-stone-500 dark:text-stone-400 text-[11px] leading-relaxed">
              Har bir audiobobni 10-15 daqiqa (18 MB gacha) qilib yuboring. Bot fayllarni asarga tartib bilan ulaydi.
            </p>
          </div>
        </div>
      </div>

      {/* ── 4. MY OFFICIAL CERTIFICATES (IF ANY ISSUED) ── */}
      {myCertificates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-950 dark:text-white flex items-center gap-2">
              <GraduationCap size={20} className="text-amber-500" />
              <span>Mening Sertifikatlarim</span>
            </h3>
            <span className="text-xs text-stone-400 font-mono">
              {myCertificates.length} ta sertifikat
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myCertificates.map(cert => (
              <div
                key={cert.id || cert.serial_number}
                className="p-5 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      {cert.serial_number}
                    </span>
                    <span className="text-xs text-stone-400">
                      {cert.issue_date || '2026'}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                    {cert.role_title}
                  </h4>

                  {cert.impact_summary && (
                    <div className="text-xs text-stone-700 dark:text-stone-300 flex items-center gap-1.5 font-medium">
                      <BookOpen size={13} className="text-amber-500 shrink-0" />
                      <span className="truncate">{cert.impact_summary}</span>
                    </div>
                  )}

                  <p className="text-xs text-stone-500">
                    Akkreditatsiya: {cert.accredited_hours} • {cert.quality_grade || 'Grade A+'}
                  </p>
                </div>

                <button
                  onClick={() => onNavigate('verify', cert.serial_number)}
                  className="w-full py-2.5 rounded-xl bg-stone-100 dark:bg-white/5 hover:bg-stone-200 dark:hover:bg-white/10 text-stone-700 dark:text-stone-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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

      {/* ── 5. BOOKS AVAILABLE FOR NARRATION ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-950 dark:text-white flex items-center gap-2">
              <BookOpen size={20} className="text-[#E05638]" />
              <span>Ovoz Yozilishi Kutilayotgan Asarlar</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Istalgan asarni tanlab, Telegram orqali ovoz yozishingiz mumkin
            </p>
          </div>
          <span className="text-xs text-stone-400 font-mono hidden sm:block">
            {booksNeedingVoice.length} ta asar
          </span>
        </div>

        {booksNeedingVoice.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {booksNeedingVoice.map(book => {
              return (
                <div
                  key={book.id}
                  className="p-4 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 hover:border-stone-300 dark:hover:border-white/20 transition-all shadow-xs flex flex-col justify-between gap-4"
                >
                  <div className="flex gap-3.5">
                    <div className="w-16 h-22 rounded-xl overflow-hidden shadow-xs shrink-0 bg-stone-100 dark:bg-stone-800">
                      <img 
                        src={book.coverImage} 
                        alt={book.title} 
                        className="w-full h-full object-cover" 
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block truncate">
                        {book.category}
                      </span>
                      <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-white truncate">
                        {book.title}
                      </h4>
                      <p className="text-xs text-stone-500 truncate">
                        {book.authorName}
                      </p>

                      <div className="pt-1.5 flex items-center gap-2 text-[10px]">
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                          <Mic size={11} />
                          <span>Ovoz kutilmoqda</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`https://t.me/book1fy_bot?start=rec_${book.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 rounded-xl bg-stone-100 dark:bg-white/5 hover:bg-[#E05638] hover:text-white text-stone-700 dark:text-stone-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Mic size={13} />
                    <span>Telegramda Ovoz Yozish</span>
                    <ExternalLink size={12} />
                  </a>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 space-y-2 shadow-xs">
            <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
            <h4 className="font-serif font-bold text-base text-stone-900 dark:text-white">
              Barcha asarlarga ovoz yozilgan!
            </h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Hozirda kutubxonadagi barcha kitoblarning audio talqini mavjud. Yangi asarlar qo'shilgach, ular bu yerda aks etadi.
            </p>
          </div>
        )}
      </div>

      {/* ── 6. VOLUNTEER CHARTER & ONBOARDING MODAL ── */}
      {currentUser && (
        <VolunteerOnboardingModal
          user={currentUser}
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          onAccept={() => {
            if (currentUser?.id) {
              localStorage.setItem(`bookify_volunteer_onboarded_${currentUser.id}`, 'true');
            }
            setIsOnboardingOpen(false);
            toast.success(`Xush kelibsiz, ${currentUser.name}! Volontyorlik studiyangiz faollashdi! 🎉`);
          }}
        />
      )}

    </div>
  );
}
