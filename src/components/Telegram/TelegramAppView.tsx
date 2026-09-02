'use client';
import React, { useState } from 'react';
import { 
  BookOpen, 
  Headphones, 
  Trophy, 
  Gift, 
  Flame, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Star,
  Users2,
  Bookmark
} from 'lucide-react';
import { Book, UserProfile } from '../../types';
import { toast } from 'react-hot-toast';
import { useTelegramWebApp } from '../../hooks/useTelegramWebApp';

interface Props {
  books: Book[];
  onOpenReader: (bookId: string) => void;
  onPlayAudio: (book: Book) => void;
  onNavigate: (page: any, param?: string) => void;
  currentUser: UserProfile | null;
}

export default function TelegramAppView({
  books,
  onOpenReader,
  onPlayAudio,
  onNavigate,
  currentUser
}: Props) {
  const { tgUser, triggerHaptic } = useTelegramWebApp();
  const [copied, setCopied] = useState(false);
  const featuredBook = books[0];

  const userName = tgUser?.first_name || currentUser?.name || "Kitobxon";
  const refCode = tgUser?.id ? `BKFY-${String(tgUser.id).slice(-6)}` : "BKFY-984211";
  const refLink = `https://t.me/BookifyRasmiyBot?start=${refCode}`;

  const handleCopyLink = () => {
    triggerHaptic('success');
    navigator.clipboard?.writeText(refLink);
    setCopied(true);
    toast.success("Referal havolangiz nusxalandi! 🎁");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareTelegram = () => {
    triggerHaptic('medium');
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent("Do'stim, Bookify platformasida birga kitob o'qiymiz va Adabiy Chempionatda sovrin yutamiz! 📚✨")}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white p-4 pb-28 space-y-6 animate-in fade-in">
      
      {/* ── Telegram Native Header ── */}
      <div className="flex items-center justify-between p-4 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E05638] to-[#C5A059] flex items-center justify-center font-serif font-bold text-lg shadow-md ring-2 ring-[#C5A059]/30">
            {userName[0]}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-serif font-bold text-base text-white">
                {userName}
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-[11px] font-mono text-stone-400 block">
              TG ID: {tgUser?.id || "984211001"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Flame streak */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#E05638]/15 border border-[#E05638]/30 text-[#E05638] text-xs font-mono font-bold">
            <Flame size={14} className="fill-[#E05638]" />
            <span>1 kun</span>
          </div>

          {/* Points */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#C5A059] text-xs font-mono font-bold">
            <Gift size={13} />
            <span>1,800 b</span>
          </div>
        </div>
      </div>

      {/* ── Grand Featured Book Spotlight Card ("Qiyomat") ── */}
      {featuredBook && (
        <div className="relative rounded-3xl p-6 bg-gradient-to-b from-stone-900 to-[#121620] border border-white/10 shadow-2xl overflow-hidden space-y-5">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#E05638]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#E05638]/20 text-[#E05638] border border-[#E05638]/30 uppercase tracking-wider">
              ✦ Bosh Muharrir Tanlovi
            </span>
            <span className="text-[11px] font-mono text-stone-400">
              {featuredBook.pages} bet • {featuredBook.audioDuration}
            </span>
          </div>

          <div className="flex gap-4 items-center">
            <div 
              onClick={() => {
                triggerHaptic('medium');
                onOpenReader(featuredBook.id);
              }}
              className="shrink-0 w-24 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 cursor-pointer"
            >
              <img src={featuredBook.coverImage} alt={featuredBook.title} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <span className="text-[11px] font-mono font-bold text-[#C5A059] uppercase tracking-wider block">
                {featuredBook.authorName}
              </span>
              <h3 className="font-serif font-bold text-2xl text-white tracking-tight leading-snug truncate">
                {featuredBook.title}
              </h3>
              <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed font-serif italic">
                "{featuredBook.description}"
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                triggerHaptic('medium');
                onOpenReader(featuredBook.id);
              }}
              className="py-3 rounded-2xl bg-[#E05638] hover:bg-[#C74326] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <BookOpen size={16} />
              <span>Mutolaa</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('medium');
                onPlayAudio(featuredBook);
              }}
              className="py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all border border-white/10 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Headphones size={16} className="text-[#C5A059]" />
              <span>Audio Tinglash</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Do'stlarni Taklif Qilish & Referal Card ── */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-rose-500/10 border border-amber-500/20 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C5A059]/20 text-[#C5A059] flex items-center justify-center">
              <Gift size={18} />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-white">Do'stlarni Taklif Qilish</h4>
              <p className="text-[11px] font-mono text-stone-400">+100 ball & +3 soat audio bonus</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#C5A059]/20 text-[#C5A059]">
            Faol Tizim
          </span>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-black/40 border border-white/10 text-xs font-mono">
          <span className="text-stone-300 truncate flex-1 select-all">{refLink}</span>
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? "Nusxalandi" : "Nusxalash"}</span>
          </button>
        </div>

        <button
          onClick={handleShareTelegram}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#C5A059] to-[#b08d48] text-stone-950 font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <Share2 size={15} />
          <span>Telegramda Do'stlarga Ulashish</span>
        </button>
      </div>

      {/* ── Haftalik Reyting & Chempionat Teaser ── */}
      <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-[#C5A059]" />
            <h4 className="font-serif font-bold text-sm text-white">Adabiy Chempionat Reytingi</h4>
          </div>
          <button
            onClick={() => {
              triggerHaptic('medium');
              onNavigate('challenge');
            }}
            className="text-xs font-mono text-[#E05638] font-bold flex items-center gap-1 hover:underline"
          >
            <span>Barchasi</span>
            <ArrowRight size={12} />
          </button>
        </div>

        <div className="space-y-2">
          {[
            { rank: '🥇', name: 'Madina Karimova', hours: '184 soat', points: '2,480 b' },
            { rank: '🥈', name: 'Dilshodbek Abduqodirov', hours: '148 soat', points: '1,800 b' },
            { rank: '🥉', name: 'Alisher Navoiy_muxlisi', hours: '96 soat', points: '1,200 b' },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <span className="text-base">{r.rank}</span>
                <span className="font-bold text-white">{r.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-stone-400">{r.hours}</span>
                <span className="text-[#C5A059] font-bold">{r.points}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
