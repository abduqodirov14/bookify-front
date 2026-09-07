'use client';

import React, { useState } from 'react';
import { 
  HeartHandshake, 
  ShieldCheck, 
  Mic, 
  BookOpen, 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  AlertCircle,
  FileCheck,
  Volume2
} from 'lucide-react';
import { UserProfile } from '../../types';

interface Props {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function VolunteerOnboardingModal({
  user,
  isOpen,
  onClose,
  onAccept
}: Props) {
  const [isChecked, setIsChecked] = useState(false);
  const [step, setStep] = useState<'charter' | 'welcome'>('charter');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!isChecked) return;
    setStep('welcome');
  };

  const handleFinish = () => {
    onAccept();
    onClose();
  };

  const volunteerCode = user.volunteer_code || 'VOL-FAOL';
  const volunteerTitle = user.volunteer_title || 'Bosh Ovozli Diktor & Madaniy Meros Volontyori';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {step === 'charter' ? (
        /* ── STEP 1: OFFICIAL VOLUNTEER CHARTER & AGREEMENT ── */
        <div className="relative w-full max-w-2xl bg-white dark:bg-[#121620] border border-stone-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Header Banner */}
          <div className="p-6 sm:p-8 bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-transparent border-b border-stone-200/80 dark:border-white/10 relative">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
              <Sparkles size={15} />
              <span>Bookify Madaniy Meros Dasturi • Rasmiy Nizom</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950 dark:text-white tracking-tight">
              Tabriklaymiz, {user.name}! 🤝
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1.5 leading-relaxed">
              Sizga Bookify platformasining rasmiy <b>«{volunteerTitle}»</b> maqomi berildi. Faoliyatni boshlashdan oldin quyidagi vazifalar, imtiyozlar va mas'uliyat bilan tanishib chiqing.
            </p>

            {/* Secret PIN preview pill */}
            <div className="mt-4 inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-stone-800 dark:text-stone-200">
              <span className="text-amber-600 dark:text-amber-400 font-bold">Shaxsiy PIN-kodingiz:</span>
              <span className="font-bold tracking-wider text-[#E05638]">{volunteerCode}</span>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-stone-700 dark:text-stone-300 text-xs sm:text-sm">
            
            {/* 1. Nima ishlar qilasiz? */}
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-base text-stone-950 dark:text-white flex items-center gap-2">
                <FileCheck size={18} className="text-[#E05638]" />
                <span>1. Sizning Asosiy Vazifalaringiz (Nima ishlar qilasiz?)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-white/[0.03] border border-stone-200/80 dark:border-white/5 space-y-1">
                  <div className="w-8 h-8 rounded-xl bg-[#24A1DE]/10 text-[#24A1DE] flex items-center justify-center font-bold mb-2">
                    <Mic size={16} />
                  </div>
                  <h4 className="font-bold text-stone-900 dark:text-white text-xs">
                    Audio Yozish
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                    Audiosi bo'lmagan kitoblarni Telegram botimiz (@book1fy_bot) orqali bobma-bob, tiniq ovozda o'qib yuborish.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-white/[0.03] border border-stone-200/80 dark:border-white/5 space-y-1">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold mb-2">
                    <BookOpen size={16} />
                  </div>
                  <h4 className="font-bold text-stone-900 dark:text-white text-xs">
                    Matn Aniqligi
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                    Asar matnini o'zgartirmasdan, adabiy til me'yorlari, to'g'ri urg'u va ravon diksiya bilan talaffuz qilish.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-white/[0.03] border border-stone-200/80 dark:border-white/5 space-y-1">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold mb-2">
                    <Volume2 size={16} />
                  </div>
                  <h4 className="font-bold text-stone-900 dark:text-white text-xs">
                    Sifat Nazorati
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                    Yozuvni begona shovqinlarsiz, sokin muhitda tayyorlash va milliy audio fondimiz sifatini yuksak tutish.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Sizga Beriladigan Imtiyozlar */}
            <div className="space-y-3 pt-2">
              <h3 className="font-serif font-bold text-base text-stone-950 dark:text-white flex items-center gap-2">
                <Award size={18} className="text-amber-500" />
                <span>2. Sizga Beriladigan Rasmiy Imkoniyatlar va Imtiyozlar</span>
              </h3>

              <div className="p-4 rounded-2xl bg-amber-500/[0.06] border border-amber-500/20 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <GraduationCap size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs text-stone-900 dark:text-white block">
                      Akkreditatsiyalangan Rasmiy Sertifikat & Diplom
                    </span>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                      O'zbekiston OTMlari rektoratlari (stipendiya, diplom ilovasi), magistratura hamda xalqaro ta'lim grantlari (Chevening, Erasmus, DAAD, El-yurt umidi) uchun Bookify rasmiy reyestrida QR-kod bilan tasdiqlanadigan davlat darajasidagi akademik sertifikat beriladi.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-amber-500/15">
                  <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs text-stone-900 dark:text-white block">
                      Shaxsiy Ijodiy Staj va Tinglovchilar Qamrovi
                    </span>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                      Ovozlashtirgan har bir kitobingizda sizning ismingiz rasmiy ijrochi (suxandon) sifatida qayd etiladi va 10,000 dan ortiq kitobxonlarga taqdim etiladi.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Mas'uliyat va Qoidalar */}
            <div className="p-4 rounded-2xl bg-stone-100/70 dark:bg-white/[0.03] border border-stone-200/80 dark:border-white/5 space-y-2 text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
              <div className="font-bold text-stone-900 dark:text-white text-xs flex items-center gap-1.5">
                <AlertCircle size={14} className="text-[#E05638]" />
                <span>Muhim Eslatmalar:</span>
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>Har bir audiobobni 10-20 daqiqa (Telegram 20 MB limiti doirasida) yuborish tavsiya qilinadi.</li>
                <li>Asarlar matniga o'zboshimchalik bilan o'zgartirish yoki nomaqbul so'zlar kiritish taqiqlanadi.</li>
                <li>Barcha yuklangan audioboblar tahririyat tomonidan tekshirilgach, sertifikat soatlaringizga avtomatik qo'shiladi.</li>
              </ul>
            </div>

            {/* 4. MANDATORY AGREEMENT CHECKBOX */}
            <div className="p-4 rounded-2xl bg-emerald-500/[0.08] border-2 border-emerald-500/30 transition-all">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300 dark:border-white/20 cursor-pointer"
                />
                <span className="text-xs font-medium text-stone-900 dark:text-white leading-relaxed">
                  Men Bookify volontyorlik qoidalari, yuklatilgan mas'uliyat va vazifalarim bilan to'liq tanishdim hamda milliy adabiyotimizni rivojlantirishga sidqidildan hissa qo'shishga roziman.
                </span>
              </label>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-5 sm:p-6 bg-stone-50 dark:bg-[#0E1218] border-t border-stone-200/80 dark:border-white/10 flex items-center justify-between gap-3">
            <span className="text-xs text-stone-500">
              {isChecked ? "✅ Rozilik belgilandi" : "⚠️ Davom etish uchun rozilik bildiring"}
            </span>

            <button
              onClick={handleConfirm}
              disabled={!isChecked}
              className={`px-6 py-3 rounded-2xl text-xs font-mono uppercase tracking-wider font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                isChecked
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20 active:scale-95'
                  : 'bg-stone-200 dark:bg-white/10 text-stone-400 dark:text-stone-500 cursor-not-allowed opacity-60'
              }`}
            >
              <span>Roziman & Boshlash</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </div>
      ) : (
        /* ── STEP 2: CELEBRATION & WELCOME SCREEN ("Welcome username") ── */
        <div className="relative w-full max-w-lg bg-white dark:bg-[#121620] border border-stone-200 dark:border-white/10 rounded-3xl shadow-2xl p-8 sm:p-10 text-center space-y-6 animate-in zoom-in-95 duration-300">
          
          {/* Confetti Icon */}
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-teal-500 p-0.5 mx-auto shadow-xl shadow-emerald-500/20">
            <div className="w-full h-full rounded-3xl bg-white dark:bg-[#121620] flex items-center justify-center text-amber-500">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs shadow-md animate-bounce">
              ★
            </div>
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 uppercase tracking-widest inline-block">
              ✦ Rasmiy Qabul Qilindi
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950 dark:text-white tracking-tight">
              Xush Kelibsiz, {user.name}! 🎉
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-sm mx-auto leading-relaxed">
              Bookify Adabiy Hamjamiyati safiga muvaffaqiyatli qo'shildingiz. Ovozli adabiyot studiyangiz va shaxsiy kabinetingiz to'liq faollashtirildi!
            </p>
          </div>

          {/* Credential Badge Card */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-white/[0.04] border border-stone-200/80 dark:border-white/10 text-left space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center text-stone-500">
              <span>Volontyorlik Kodi:</span>
              <span className="font-bold text-[#E05638] text-sm">{volunteerCode}</span>
            </div>
            <div className="flex justify-between items-center text-stone-500">
              <span>Unvoningiz:</span>
              <span className="font-semibold text-stone-900 dark:text-white truncate max-w-[200px]">{volunteerTitle}</span>
            </div>
            <div className="flex justify-between items-center text-stone-500">
              <span>Telegram Studiya:</span>
              <span className="text-[#24A1DE] font-semibold">@book1fy_bot</span>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="w-full py-3.5 rounded-2xl bg-[#E05638] hover:bg-[#C74326] text-white text-xs font-mono uppercase tracking-wider font-bold transition-all shadow-xl hover:shadow-2xl active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>🚀 Studiyaga Kirish</span>
          </button>

        </div>
      )}

    </div>
  );
}
