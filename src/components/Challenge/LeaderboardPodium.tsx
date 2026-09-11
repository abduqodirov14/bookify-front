'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Flame, Crown, Trophy, Users, ShieldCheck, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LeaderboardPodium() {
  const [activeChallenge, setActiveChallenge] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [skip, setSkip] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const loadLeaderboardData = async () => {
    try {
      const active = await api.getActiveChallenge();
      if (active && active.id) {
        setActiveChallenge(active);

        const data = await api.getChallengeLeaderboard(active.id, 0, 50);
        if (data && data.items && data.items.length > 0) {
          setParticipants(data.items);
          setTotalCount(data.total_count || data.items.length);
          setHasMore((data.items.length) < (data.total_count || 0));
        } else {
          setParticipants([]);
          setTotalCount(0);
        }
      } else {
        setParticipants([]);
        setTotalCount(0);
      }
    } catch {
      setParticipants([]);
      setTotalCount(0);
    }
  };

  useEffect(() => {
    loadLeaderboardData();
  }, []);

  const triggerCelebration = (p: any) => {
    toast(`Sertifikat tizimi tez orada ishga tushadi!`, { icon: '🎓' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-20 pb-32 animate-in fade-in duration-500">
      
      {/* Editorial Header */}
      <div className="text-center space-y-6 pt-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-ink dark:bg-parchment text-parchment dark:text-ink text-[10px] font-mono font-bold uppercase tracking-[0.2em] rounded-sm">
          <Flame size={12} className="animate-pulse" />
          <span>{activeChallenge?.name || "Milliy Adabiy Chempionat — Bahor 2026"}</span>
        </div>
        <h1 className="font-serif text-5xl sm:text-7xl font-bold text-ink dark:text-parchment tracking-tight leading-[1.05]">
          Shohsupa
        </h1>
        <p className="text-sm sm:text-base font-serif italic text-ink/70 dark:text-parchment/70 max-w-xl mx-auto leading-relaxed">
          "Eng ko'p mutolaa qilgan peshqadam kitobxonlar va butun mamlakat reytingi."
        </p>
      </div>

      {/* 🏅 Top 3 Grand Podium / Minimalist Style */}
      {participants.length >= 3 ? (
        <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end pt-8 max-w-4xl mx-auto">
          
          {/* 2nd Place (Silver) */}
          <div className="order-2 sm:order-1 p-4 sm:p-8 border-t border-black/10 dark:border-white/10 bg-parchment dark:bg-ink flex flex-col items-center text-center">
            <div className="text-2xl sm:text-3xl mb-4 grayscale opacity-60">🥈</div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 overflow-hidden grayscale">
              <img src={participants[1].avatar || participants[1].avatar_url} alt="2nd" className="w-full h-full object-cover" />
            </div>
            <h4 className="font-serif font-bold text-xs sm:text-base text-ink dark:text-parchment mb-1 line-clamp-1">
              {participants[1].name || participants[1].user_name}
            </h4>
            <div className="font-mono text-[10px] sm:text-xs text-ink/60 dark:text-parchment/60 uppercase tracking-widest">
              {participants[1].verified_reading_score || 0} ball
            </div>
            <div className="font-mono text-[9px] text-ink/40 dark:text-parchment/40 mt-1">
              {participants[1].reading_percent || 0}% mutolaa
            </div>
            <button
              onClick={() => triggerCelebration(participants[1])}
              className="mt-6 px-4 py-2 border border-black/10 dark:border-white/10 text-[9px] font-bold uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-colors w-full cursor-pointer"
            >
              Sertifikat
            </button>
          </div>

          {/* 1st Place (Gold Champion) */}
          <div className="order-1 sm:order-2 p-6 sm:p-10 border border-ink dark:border-parchment bg-ink/5 dark:bg-parchment/5 flex flex-col items-center text-center relative -translate-y-4 sm:-translate-y-8 shadow-sm">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-ink dark:bg-parchment text-parchment dark:text-ink text-[9px] font-mono font-bold uppercase tracking-[0.2em] whitespace-nowrap">
              Mutlaq G'olib
            </div>
            <div className="text-3xl sm:text-4xl mb-4 mt-2">👑</div>
            <div className="w-20 h-20 sm:w-28 sm:h-28 mb-4 border border-ink dark:border-parchment p-1 bg-parchment dark:bg-ink overflow-hidden">
              <img src={participants[0].avatar || participants[0].avatar_url} alt="1st" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-serif font-bold text-sm sm:text-xl text-ink dark:text-parchment mb-1 line-clamp-1">
              {participants[0].name || participants[0].user_name}
            </h3>
            <div className="font-mono text-[11px] sm:text-sm font-bold text-ember uppercase tracking-widest mt-1">
              {participants[0].verified_reading_score || 0} ball
            </div>
            <div className="font-mono text-[10px] text-ink/60 dark:text-parchment/60 mt-1">
              {participants[0].reading_percent || 0}% mutolaa · {participants[0].reading_time_text || `${participants[0].hours || 0} soat`}
            </div>
            <button
              onClick={() => triggerCelebration(participants[0])}
              className="mt-6 px-6 py-3 bg-ink dark:bg-parchment text-parchment dark:text-ink text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 w-full cursor-pointer"
            >
              <Trophy size={14} /> Sertifikat
            </button>
          </div>

          {/* 3rd Place (Bronze) */}
          <div className="order-3 p-4 sm:p-8 border-t border-black/10 dark:border-white/10 bg-parchment dark:bg-ink flex flex-col items-center text-center">
            <div className="text-2xl sm:text-3xl mb-4 grayscale opacity-40">🥉</div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 overflow-hidden grayscale">
              <img src={participants[2].avatar || participants[2].avatar_url} alt="3rd" className="w-full h-full object-cover" />
            </div>
            <h4 className="font-serif font-bold text-xs sm:text-base text-ink dark:text-parchment mb-1 line-clamp-1">
              {participants[2].name || participants[2].user_name}
            </h4>
            <div className="font-mono text-[10px] sm:text-xs text-ink/60 dark:text-parchment/60 uppercase tracking-widest">
              {participants[2].verified_reading_score || 0} ball
            </div>
            <div className="font-mono text-[9px] text-ink/40 dark:text-parchment/40 mt-1">
              {participants[2].reading_percent || 0}% mutolaa
            </div>
            <button
              onClick={() => triggerCelebration(participants[2])}
              className="mt-6 px-4 py-2 border border-black/10 dark:border-white/10 text-[9px] font-bold uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-colors w-full cursor-pointer"
            >
              Sertifikat
            </button>
          </div>

        </div>
      ) : (
        <div className="p-16 border border-black/10 dark:border-white/10 text-center space-y-4 max-w-2xl mx-auto">
          <Trophy size={24} className="mx-auto text-ink/40 dark:text-parchment/40" />
          <h3 className="font-serif text-2xl font-bold">Yangi Chempionat Boshlandi</h3>
          <p className="text-sm font-mono text-ink/60 dark:text-parchment/60">
            Hozircha g'oliblar shohsupasi bo'sh. Saytda mutolaa qilib birinchilardan bo'ling!
          </p>
        </div>
      )}

      {/* 📄 Ranked Roster Table (Minimalist List) */}
      <div className="pt-10 max-w-4xl mx-auto">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-4 mb-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-ink dark:text-parchment">
              Umumiy Reyting
            </h3>
            <p className="text-[11px] font-mono text-ink/50 dark:text-parchment/50 mt-1 uppercase tracking-widest">
              Faoliyat yuritayotgan barcha kitobxonlar
            </p>
          </div>
          <div className="text-[10px] font-mono text-ink/60 dark:text-parchment/60 uppercase tracking-widest border border-black/10 dark:border-white/10 px-3 py-1">
            Jami: {totalCount} ishtirokchi
          </div>
        </div>

        {participants.length > 0 ? (
          <div className="divide-y divide-black/5 dark:divide-white/5">
            {participants.map((p, idx) => {
              const r = p.rank || idx + 1;
              const uName = p.name || p.user_name || `Kitobxon #${r}`;
              const avatarUrl = p.avatar || p.avatar_url;
              const hoursCount = p.hours || Math.round((p.verified_reading_score || 840) / 12);
              const pagesCount = p.pages || (p.completed_books_count ? p.completed_books_count * 320 : 100);

              return (
                <div 
                  key={p.participant_id || p.rank || idx}
                  className="py-4 flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="w-8 text-left font-mono font-bold text-xs text-ink/40 dark:text-parchment/40">
                      {(r).toString().padStart(2, '0')}
                    </span>

                    {avatarUrl ? (
                      <div className="w-10 h-10 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                        <img src={avatarUrl} alt={uName} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 border border-black/10 dark:border-white/10 bg-ink dark:bg-parchment text-parchment dark:text-ink flex items-center justify-center font-serif font-bold text-sm">
                        {uName[0]}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-sm text-ink dark:text-parchment truncate">
                          {uName}
                        </h4>
                        <ShieldCheck size={12} className="text-ink/30 dark:text-parchment/30" />
                      </div>
                      <span className="text-[10px] text-ink/50 dark:text-parchment/50 font-mono uppercase tracking-widest mt-1 block">
                        {pagesCount} bet · {p.badge || "Faol"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <div className="font-mono font-bold text-[11px] text-ink dark:text-parchment uppercase tracking-widest">
                        {p.verified_reading_score !== undefined ? `${p.verified_reading_score} ball` : `${hoursCount} soat`}
                      </div>
                      <div className="text-[9px] text-ink/40 dark:text-parchment/40 font-mono flex items-center justify-end gap-1 mt-1 uppercase tracking-widest">
                        <span>{p.reading_percent !== undefined ? p.reading_percent : 0}% o'qish</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-xs font-mono text-ink/40 dark:text-parchment/40 uppercase tracking-widest">
            Ro'yxat bo'sh
          </div>
        )}
        
        {participants.length > 0 && (
          <div className="mt-8 pt-8 border-t border-black/10 dark:border-white/10 text-center">
            <button className="px-6 py-2 border border-black/10 dark:border-white/10 text-[10px] font-mono font-bold uppercase tracking-[0.15em] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer inline-flex items-center gap-2">
              <Download size={14} /> To'liq reytingni yuklash
            </button>
          </div>
        )}

      </div>
    </div>
  );
}