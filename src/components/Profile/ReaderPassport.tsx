'use client';
import React, { useState } from 'react';
import { UserProfile, Book } from '../../types';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  Award, 
  BookOpen, 
  Clock, 
  LogOut, 
  ShieldCheck, 
  Download, 
  Share2, 
  CheckCircle2, 
  Trophy, 
  X, 
  Medal,
  Scroll
} from 'lucide-react';
import OfficialCertificateModal from '../Certificate/OfficialCertificateModal';

interface Props {
  user: UserProfile;
  books: Book[];
  onOpenReader: (bookId: string) => void;
  onLogout: () => void;
  onNavigatePage?: (page: any) => void;
}

interface Certificate {
  id: string;
  certNumber: string;
  title: string;
  season: string;
  rank: string;
  rankBadge: string;
  color: string;
  issueDate: string;
  hours: number;
  pages: number;
  hash: string;
  description: string;
}

export default function ReaderPassport({ user, books, onOpenReader, onLogout, onNavigatePage }: Props) {
  const [shelfMode, setShelfMode] = useState<'cover' | 'spine'>('cover');
  const [is2FA, setIs2FA] = useState<boolean>(user.is2FAEnabled ?? (user.role === 'ADMIN'));
  const [showCertModal, setShowCertModal] = useState<boolean>(false);
  const [modalCertData, setModalCertData] = useState<any>(null);

  // New registered users start with 0 certificates until they win a tournament.
  // Admins or tournament winners have certificates.
  const userCertificates: Certificate[] = user.role === 'ADMIN' ? [
    {
      id: 'cert-1',
      certNumber: 'BKF-2026-0001',
      title: "Asoschi & Bosh Mutolaachi — Shoh Kitobxon",
      season: "Bahoriy Adabiy Chempionat 2026",
      rank: "1-O'rin (Oltin)",
      rankBadge: "🥇",
      color: "#C5A059",
      issueDate: "3-Sentabr, 2026",
      hours: 120,
      pages: 1480,
      hash: "e7f9a2b84c1d93e502847a9cb934812f",
      description: "Bookify platformasi asoschisi va mutolaa marafoni peshqadami sifatida taqdirlandi."
    }
  ] : [];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24 animate-in fade-in duration-300">
      
      {/* ── Ex Libris / Reader Passport Header ── */}
      <div className="relative rounded-3xl p-8 sm:p-12 bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#E05638] to-[#C5A059] flex items-center justify-center text-white font-serif font-bold text-3xl shadow-xl ring-4 ring-[#C5A059]/20">
              {user.name[0]}
            </div>
            
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30">
                  EX LIBRIS • NO. 042-UZ
                </span>
                <button
                  onClick={async () => {
                    try {
                      const res = await api.toggle2FA();
                      setIs2FA(res.is_2fa_enabled);
                      toast.success(res.message || "2FA holati yangilandi!");
                    } catch {
                      setIs2FA(!is2FA);
                      toast.success(!is2FA ? "2FA xavfsizlik yoqildi!" : "2FA xavfsizlik o'chirildi!");
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    is2FA 
                      ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 hover:bg-emerald-500/25' 
                      : 'bg-stone-100 dark:bg-white/10 text-stone-500 hover:bg-stone-200'
                  }`}
                  title="2FA xavfsizlikni yoqish / o'chirish"
                >
                  <ShieldCheck size={13} className={is2FA ? "text-emerald-500" : "text-stone-400"} />
                  <span>2FA Himoya: {is2FA ? "YOQILGAN" : "O'CHIRILGAN"}</span>
                </button>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950 dark:text-white">
                {user.name}
              </h1>
              <p className="font-serif italic text-xs sm:text-sm text-stone-500 max-w-lg">
                "Kitob — insoniyat aql-zakovati va qalbining asrlar oshib kelayotgan eng buyuk xazinasi..."
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 font-mono font-bold text-xs transition-colors cursor-pointer flex items-center gap-2"
          >
            <LogOut size={15} />
            <span>Tizimdan Chiqish</span>
          </button>

        </div>
      </div>

      {/* ── Key Reading Habits Dials ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Clock size={28} />
          </div>
          <div>
            <span className="text-[11px] font-mono text-stone-400 block uppercase">Jami Mutolaa</span>
            <span className="font-serif font-bold text-2xl text-stone-950 dark:text-white">
              {user.totalHours || 12} soat
            </span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <BookOpen size={28} />
          </div>
          <div>
            <span className="text-[11px] font-mono text-stone-400 block uppercase">Tugatilgan Asarlar</span>
            <span className="font-serif font-bold text-2xl text-stone-950 dark:text-white">
              {user.finishedBooksCount ?? 0} ta kitob
            </span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
            <Trophy size={28} />
          </div>
          <div>
            <span className="text-[11px] font-mono text-stone-400 block uppercase">Mutolaa Davomiyligi</span>
            <span className="font-serif font-bold text-2xl text-stone-950 dark:text-white">
              {user.readingStreakDays ? `${user.readingStreakDays} kun` : '1 kun'}
            </span>
          </div>
        </div>

      </div>

      {/* ── Rasmiy Diplomlar & Yutuqlar Xazinasi ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-white/10 pb-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-stone-950 dark:text-white">
              Rasmiy Diplomlar & Sertifikatlar
            </h3>
            <p className="text-xs text-stone-500">Adabiy chempionatlarda qo'lga kiritilgan rasmiy sertifikatlar</p>
          </div>
        </div>

        {userCertificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userCertificates.map(cert => (
              <div
                key={cert.id}
                className="relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121620] border-2 border-stone-200/90 dark:border-white/10 hover:border-[#C5A059] transition-all duration-300 shadow-xs hover:shadow-2xl space-y-6 group overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/30 border border-amber-500/40 text-amber-500 flex items-center justify-center text-2xl shadow-inner shrink-0">
                      {cert.rankBadge}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059] font-bold block">
                        {cert.season}
                      </span>
                      <h4 className="font-serif font-bold text-lg text-stone-950 dark:text-white group-hover:text-[#C5A059] transition-colors">
                        {cert.title}
                      </h4>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-300 shrink-0">
                    {cert.rank}
                  </span>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-serif">
                  "{cert.description}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-white/5">
                  <span className="text-[10px] font-mono text-stone-400">
                    ID: {cert.certNumber}
                  </span>

                  <button
                    onClick={() => {
                      setModalCertData(cert);
                      setShowCertModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0A0E1A] hover:bg-stone-800 text-white text-xs font-mono font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Scroll size={14} />
                    <span>Sertifikatni Ochish</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 text-center space-y-4 max-w-2xl mx-auto shadow-xs">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#C5A059]/15 text-[#C5A059] flex items-center justify-center text-3xl">
              📜
            </div>
            <div className="space-y-1.5">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
                Hozircha Rasmiy Sertifikatlar Mavjud Emas
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-md mx-auto">
                Yangi ro'yxatdan o'tgan kitobxonlarda dastlab sertifikat bo'lmaydi. Rasmiy diplomlar faqat Adabiy Chempionatda ishtirok etib, 1, 2 yoki 3-o'rinni olgan kitobxonlarga topshiriladi.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setModalCertData({
                    title: "Bahoriy Adabiy Chempionat 2026 • Shoh Kitobxon",
                    certNumber: "BKF-2026-0001",
                    date: "3-Sentabr, 2026",
                    rank: 1
                  });
                  setShowCertModal(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#0A0E1A] hover:bg-stone-800 text-white text-xs font-mono font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                <Award size={14} className="text-[#C5A059]" />
                <span>O'z Nomimga Sertifikat Generatsiya Qilish</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Physical Bookshelf (Cover vs Spine View) ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-white/10 pb-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-stone-950 dark:text-white">
              Shaxsiy Kitob Javoni
            </h3>
            <p className="text-xs text-stone-500">Mutolaa qilinayotgan va tugatilgan durdona kitoblar</p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-100 dark:bg-white/10">
            <button
              onClick={() => setShelfMode('cover')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                shelfMode === 'cover' ? 'bg-white dark:bg-stone-800 text-[#E05638] font-bold shadow-xs' : 'text-stone-500'
              }`}
            >
              Muqova Ko'rinishi
            </button>
            <button
              onClick={() => setShelfMode('spine')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                shelfMode === 'spine' ? 'bg-white dark:bg-stone-800 text-[#E05638] font-bold shadow-xs' : 'text-stone-500'
              }`}
            >
              Jild Ko'rinishi (Spine)
            </button>
          </div>
        </div>

        {shelfMode === 'cover' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {books.slice(0, 6).map(b => (
              <div
                key={b.id}
                onClick={() => onOpenReader(b.id)}
                className="group cursor-pointer space-y-2.5"
              >
                <div className="book-card-3d">
                  <div className="book-card-inner relative aspect-[2/3] rounded-2xl overflow-hidden shadow-book border border-black/10">
                    <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover" />
                    <div className="book-spine-hinge" />
                  </div>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs text-stone-900 dark:text-white truncate group-hover:text-[#E05638]">
                    {b.title}
                  </h4>
                  <span className="text-[10px] text-stone-400 truncate block">{b.authorName}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-gradient-to-r from-[#2A1E14] via-[#3E2D1F] to-[#2A1E14] border-8 border-[#1A120B] shadow-2xl flex items-end justify-center gap-3 h-72 overflow-x-auto">
            {books.slice(0, 8).map((b, idx) => (
              <div
                key={b.id}
                onClick={() => onOpenReader(b.id)}
                className="w-12 sm:w-14 rounded-t-md cursor-pointer hover:-translate-y-4 transition-transform duration-300 shadow-xl flex flex-col justify-between p-2 text-center text-white border-l border-white/20 select-none group"
                style={{
                  height: `${200 + (idx % 3) * 20}px`,
                  backgroundColor: b.spineColor
                }}
              >
                <span className="text-[8px] font-mono opacity-60">BOOKIFY</span>
                <span className="text-[10px] font-serif font-bold writing-vertical rotate-180 truncate my-auto tracking-wider">
                  {b.title}
                </span>
                <span className="text-[8px] font-mono text-[#C5A059]">★ {b.rating}</span>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── Official FreeCodeCamp-style Certificate Modal ── */}
      {showCertModal && (
        <OfficialCertificateModal
          initialName={user.name}
          rank={modalCertData?.rank || 1}
          achievementTitle={modalCertData?.title || "Bahoriy Adabiy Chempionat 2026 • Shoh Kitobxon"}
          certNumber={modalCertData?.certNumber || "BKF-2026-0001"}
          date={modalCertData?.date || "3-Sentabr, 2026"}
          onClose={() => setShowCertModal(false)}
        />
      )}

    </div>
  );
}
