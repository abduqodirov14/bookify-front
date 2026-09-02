import React, { useState } from 'react';
import { TOP_CHAMPIONS, HALL_OF_FAME, Champion } from '../../data/champions';
import { Trophy, Award, Crown, Medal, ShieldCheck, Download, Share2, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';

export default function LeaderboardPodium() {
  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);

  const triggerCelebration = (champ: Champion) => {
    setSelectedChampion(champ);
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 animate-in fade-in duration-300">
      
      <div className="text-center space-y-3">
        <span className="text-xs font-mono uppercase tracking-widest text-[#E05638] font-bold">
          Milliy Adabiy Chempionat • Bahor 2026
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-stone-950 dark:text-white">
          Zukko Kitobxonlar Shohsupasi
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto leading-relaxed">
          Eng ko'p vaqt va durdona asarlarni mutolaa qilgan peshqadam kitobxonlar reytingi
        </p>
      </div>

      {/* ── Top 3 Grand Podium ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end pt-8">
        
        {/* 2nd Place (Silver) */}
        <div className="order-2 sm:order-1 p-6 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs text-center space-y-3 flex flex-col items-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-slate-300 shadow-lg">
              <img src={TOP_CHAMPIONS[1].avatar} alt={TOP_CHAMPIONS[1].name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-300 text-stone-900 font-mono font-bold text-xs flex items-center justify-center">
              2
            </div>
          </div>

          <div>
            <h4 className="font-serif font-bold text-base text-stone-950 dark:text-white">{TOP_CHAMPIONS[1].name}</h4>
            <span className="text-xs text-[#E05638] font-mono font-bold">{TOP_CHAMPIONS[1].hours} soat</span>
          </div>

          <button
            onClick={() => triggerCelebration(TOP_CHAMPIONS[1])}
            className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-white/10 text-xs font-mono font-bold hover:bg-[#E05638] hover:text-white transition-colors cursor-pointer"
          >
            Kumush Diplomni Ochish →
          </button>
        </div>

        {/* 1st Place (Gold Champion) */}
        <div className="order-1 sm:order-2 p-8 rounded-3xl bg-gradient-to-b from-[#FFFDF9] to-[#FBF4E4] dark:from-[#1E1912] dark:to-[#121620] border-2 border-[#C5A059] shadow-2xl text-center space-y-4 flex flex-col items-center relative -translate-y-4">
          <Crown size={32} className="text-[#C5A059] animate-bounce" />
          
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#C5A059] shadow-2xl ring-4 ring-[#C5A059]/30">
              <img src={TOP_CHAMPIONS[0].avatar} alt={TOP_CHAMPIONS[0].name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#C5A059] text-stone-950 font-mono font-bold text-xs shadow-md">
              1-O'RIN
            </div>
          </div>

          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C5A059]/20 text-[#C5A059] uppercase tracking-wider">
              {TOP_CHAMPIONS[0].badge}
            </span>
            <h3 className="font-serif font-bold text-xl text-stone-950 dark:text-white mt-1">{TOP_CHAMPIONS[0].name}</h3>
            <span className="text-sm text-[#E05638] font-mono font-bold">{TOP_CHAMPIONS[0].hours} soat mutolaa</span>
          </div>

          <button
            onClick={() => triggerCelebration(TOP_CHAMPIONS[0])}
            className="w-full py-3 rounded-2xl bg-[#C5A059] hover:bg-[#A6823F] text-stone-950 font-bold text-xs font-mono transition-transform active:scale-95 shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles size={15} />
            <span>Rasmiy Oltin Diplomni Ko'rish</span>
          </button>
        </div>

        {/* 3rd Place (Bronze) */}
        <div className="order-3 p-6 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs text-center space-y-3 flex flex-col items-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-amber-600 shadow-lg">
              <img src={TOP_CHAMPIONS[2].avatar} alt={TOP_CHAMPIONS[2].name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-600 text-white font-mono font-bold text-xs flex items-center justify-center">
              3
            </div>
          </div>

          <div>
            <h4 className="font-serif font-bold text-base text-stone-950 dark:text-white">{TOP_CHAMPIONS[2].name}</h4>
            <span className="text-xs text-[#E05638] font-mono font-bold">{TOP_CHAMPIONS[2].hours} soat</span>
          </div>

          <button
            onClick={() => triggerCelebration(TOP_CHAMPIONS[2])}
            className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-white/10 text-xs font-mono font-bold hover:bg-[#E05638] hover:text-white transition-colors cursor-pointer"
          >
            Bronza Diplomni Ochish →
          </button>
        </div>

      </div>

      {/* ── Official Wax-Sealed Golden Diploma Modal ── */}
      {selectedChampion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-gradient-to-b from-[#FDFBF7] to-[#F5EBD4] text-stone-900 p-8 sm:p-12 rounded-3xl shadow-2xl border-8 border-[#C5A059]/40 space-y-6 animate-in zoom-in-95">
            
            <button
              onClick={() => setSelectedChampion(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-stone-200 text-stone-700 hover:bg-stone-300 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-2 border-b-2 border-[#C5A059]/30 pb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#7F602B] font-bold">
                O'ZBEKISTON MILLIY KITOBXONLIK AKADEMIYASI
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D2C12] tracking-tight">
                RASMIY OLTIN DIPLOM
              </h2>
              <span className="text-xs font-mono text-[#C5A059]">№ {selectedChampion.certificateId}</span>
            </div>

            <div className="text-center space-y-3 py-2">
              <p className="text-xs font-serif italic text-stone-600">
                Ushbu faxriy yorliq 2026-yilgi Milliy Adabiy Chempionatdagi tengsiz mutolaa matonati uchun taqdim etiladi:
              </p>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#E05638] tracking-tight">
                {selectedChampion.name}
              </h3>

              <div className="p-4 rounded-2xl bg-white/70 border border-[#C5A059]/30 text-xs font-mono space-y-1">
                <div>Qayd etilgan mutolaa: <strong>{selectedChampion.hours} soat</strong></div>
                <div>O'qilgan sahifalar: <strong>{selectedChampion.pages} bet</strong></div>
                <div>Anti-Cheat Xolislik ko'rsatkichi: <strong className="text-emerald-700">{selectedChampion.verifiedAccuracy}</strong></div>
              </div>
            </div>

            {/* Wax Stamp & Actions */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-[#C5A059]/30">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-[#8B2500] text-white flex items-center justify-center font-serif font-bold text-xs shadow-md border-2 border-amber-300">
                  SEAL
                </div>
                <div className="text-[10px] font-mono text-stone-600 leading-tight">
                  <div>FIANNY 2026</div>
                  <div>VERIFIED OK</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toast.success("Diplom PDF formatida yuklab olindi!", { icon: '📜' })}
                  className="px-4 py-2 rounded-xl bg-[#3D2C12] text-white font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md hover:bg-black"
                >
                  <Download size={14} />
                  <span>Yuklab Olish</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
