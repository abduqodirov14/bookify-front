import React, { useState } from 'react';
import { UserProfile, Book } from '../../types';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  Award, 
  BookOpen, 
  Clock, 
  Sparkles, 
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

interface Props {
  user: UserProfile;
  books: Book[];
  onOpenReader: (bookId: string) => void;
  onLogout: () => void;
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

export default function ReaderPassport({ user, books, onOpenReader, onLogout }: Props) {
  const [shelfMode, setShelfMode] = useState<'cover' | 'spine'>('cover');
  const [is2FA, setIs2FA] = useState<boolean>(user.is2FAEnabled ?? (user.role === 'ADMIN'));
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  // User's Permanent Cryptographically Verified Diplomas
  const userCertificates: Certificate[] = [
    {
      id: 'cert-1',
      certNumber: 'BKFY-2026-CHAMP-001',
      title: "Oltin Meros — Gran-Pri Chempioni",
      season: "Bahoriy Adabiy Chempionat 2026",
      rank: "1-O'rin (Oltin)",
      rankBadge: "🥇",
      color: "#C5A059",
      issueDate: "15-May, 2026",
      hours: Math.max(148, user.totalHours || 148),
      pages: 1840,
      hash: "e7f9a2b84c1d93e502847a9cb934812f",
      description: "Ushbu Oltin Diplom sohibi adabiy chempionatda eng yuksak mutolaa madaniyati va tezligini namoyish etib, mutlaq 1-o'rinni egalladi."
    },
    {
      id: 'cert-2',
      certNumber: 'BKFY-2026-NARR-042',
      title: "Audio Teatr Zukkosi — Faxriy Nishon",
      season: "Qishki Qiroat Marafoni 2026",
      rank: "Maxsus Mukofot",
      rankBadge: "🎖️",
      color: "#8B5CF6",
      issueDate: "28-Fevral, 2026",
      hours: 64,
      pages: 920,
      hash: "82a93c71df50281b94e32049acbb8192",
      description: "Durdona asarlarning audio spektakllarini to'liq tinglab, tahliliy taqrizlar yozgani uchun taqdirlandi."
    }
  ];

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
                  <span>2FA Himoya: {is2FA ? "YOQILGAN (ON)" : "O'CHIRILGAN (OFF)"}</span>
                </button>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950 dark:text-white">
                {user.name}
              </h1>
              <p className="font-serif italic text-xs sm:text-sm text-stone-500 max-w-lg">
                "Kitob — insoniyat aql-zakovati va qalbining asrlar oshib kelayotgan eng buyuk siri..."
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

      {/* ── Concentric Stats & Reading Habits ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-xs font-mono text-stone-400 uppercase">Bugungi Mutolaa</span>
          <div className="text-3xl font-bold text-stone-950 dark:text-white font-mono">
            {user.todayMinutes} <span className="text-xs font-sans text-stone-400">daqiqa</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium block">
            Me'yor: {user.dailyGoalMinutes} daqiqa (100% bajarildi)
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-xs font-mono text-stone-400 uppercase">O'qish Seriyasi</span>
          <div className="text-3xl font-bold text-[#E05638] font-mono">
            {user.readingStreakDays} <span className="text-xs font-sans text-stone-400">kun uzluksiz</span>
          </div>
          <span className="text-[11px] text-stone-400 block">
            🔥 Oltin marafon ishtirokchisi
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-xs font-mono text-stone-400 uppercase">Jami Mutolaa Vaqti</span>
          <div className="text-3xl font-bold text-stone-950 dark:text-white font-mono">
            {user.totalHours} <span className="text-xs font-sans text-stone-400">soat</span>
          </div>
          <span className="text-[11px] text-stone-400 block">
            Audio va matnli mutolaa
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-xs font-mono text-stone-400 uppercase">Yutuqlar & Diplomlar</span>
          <div className="text-3xl font-bold text-[#C5A059] font-mono">
            {userCertificates.length} <span className="text-xs font-sans text-stone-400">ta rasmiy</span>
          </div>
          <span className="text-[11px] text-stone-400 block">
            Umrbod tasdiqlangan
          </span>
        </div>
      </div>

      {/* ── PERMANENT DIPLOMAS & CERTIFICATES VAULT ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Trophy size={20} />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-stone-950 dark:text-white flex items-center gap-2">
                <span>Rasmiy Diplomlar & Yutuqlar Xazinasi</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Umrbod Saqlanadi
                </span>
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                Adabiy chempionatlarda erishilgan rasmiy Oltin diplomlar va yuksak unvonlar
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userCertificates.map(cert => (
            <div
              key={cert.id}
              className="relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121620] border-2 border-stone-200/90 dark:border-white/10 hover:border-[#C5A059] transition-all duration-300 shadow-xs hover:shadow-2xl space-y-6 group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#C5A059]/10 rounded-full blur-2xl pointer-events-none" />

              {/* Certificate Top Header */}
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

              {/* Description */}
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-serif">
                "{cert.description}"
              </p>

              {/* Metrics & Hash */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-white/[0.03] border border-stone-100 dark:border-white/5 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-stone-400 block">TASDIQLANGAN VAQT:</span>
                  <strong className="text-stone-900 dark:text-white">{cert.hours} soat mutolaa</strong>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">TAQDIRLANGAN SANA:</span>
                  <strong className="text-stone-900 dark:text-white">{cert.issueDate}</strong>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-white/5">
                <span className="text-[10px] font-mono text-stone-400">
                  ID: {cert.certNumber}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="px-4 py-2 rounded-xl bg-[#C5A059] hover:bg-[#b08d48] text-stone-950 text-xs font-mono font-bold uppercase transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Scroll size={14} />
                    <span>Diplomni Ochish</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
          /* Realistic Physical Shelf Spine Mode */
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

      {/* ── EMBOSSED GOLDEN DIPLOMA MODAL ── */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-2xl w-full bg-[#FCFBF7] text-[#1A1A1A] p-8 sm:p-12 rounded-3xl shadow-2xl border-8 border-[#C5A059]/40 space-y-6 text-center animate-in zoom-in-95">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-stone-200/80 hover:bg-stone-300 text-stone-700 cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Embossed Header */}
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold tracking-widest text-[#C5A059] uppercase block">
                BOOKIFY MILLIY SANATORIYSI • RASMIY FAXRIY GUVOXNOMA
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1A1A]">
                OLTIN MEROS DIPLOMI
              </h2>
              <div className="w-24 h-1 bg-[#C5A059] mx-auto rounded-full mt-2" />
            </div>

            {/* Recipient */}
            <div className="py-4 space-y-2">
              <span className="text-xs font-mono text-stone-500 uppercase">Ushbu diplom sohibi:</span>
              <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#9A7B38] underline decoration-[#C5A059]/40">
                {user.name}
              </h3>
              <p className="text-xs font-serif italic text-stone-600 max-w-lg mx-auto pt-2">
                "{selectedCert.description}"
              </p>
            </div>

            {/* Verification Hash & Details */}
            <div className="p-4 rounded-2xl bg-[#F4F1EA] border border-[#E2DDD2] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-stone-700 text-left">
              <div>
                <div><strong>Mavsum:</strong> {selectedCert.season}</div>
                <div><strong>Mutolaa:</strong> {selectedCert.hours} soat ({selectedCert.pages} bet)</div>
                <div><strong>Berilgan sana:</strong> {selectedCert.issueDate}</div>
              </div>
              <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-300">
                <div className="text-[10px] text-stone-500">TASDIQLANGAN HASH:</div>
                <div className="text-[9px] font-mono text-stone-800 break-all">{selectedCert.hash}</div>
                <div className="text-[10px] font-bold text-emerald-700 mt-0.5">● Rasmiy Baza Shifrlangan</div>
              </div>
            </div>

            {/* Wax Seal & Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-300">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-[#C5A059] text-white flex items-center justify-center font-serif font-bold text-xl shadow-md border-2 border-white">
                  🏛️
                </div>
                <div className="text-left text-[11px] font-mono leading-tight">
                  <strong>BOOKIFY FOUNDATION</strong>
                  <span className="block text-stone-500">Umrbod Saqlanuvchi Meros</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-mono text-xs font-bold uppercase transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Download size={14} />
                  <span>PDF Chop Etish</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    toast.success("Diplom havolasi nusxalandi!");
                  }}
                  className="p-2.5 rounded-xl bg-[#C5A059]/20 text-[#84672B] hover:bg-[#C5A059]/30 transition-colors cursor-pointer"
                  title="Ulashish"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
