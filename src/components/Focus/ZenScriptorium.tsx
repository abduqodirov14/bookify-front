import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Sparkles, Coffee, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ZenScriptorium() {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [soundscape, setSoundscape] = useState<string | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft(prev => prev - 1), 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      toast.success("Ajoyib! 25 daqiqalik sokin fokus mashg'uloti muvaffaqiyatli yakunlandi!", { icon: '✨' });
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(25 * 60);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8 pb-24 animate-in fade-in duration-300">
      
      <div className="text-center space-y-3">
        <span className="text-xs font-mono uppercase tracking-widest text-[#E05638] font-bold">
          Sokin Diqqat & Fokus Markazi
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-stone-950 dark:text-white">
          Zen Scriptorium
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto leading-relaxed">
          Tashqi shovqindan xoli, faqat siz, kitob va sokin kutubxona ruhiyati
        </p>
      </div>

      {/* ── Circular Pomodoro Dial ── */}
      <div className="relative w-72 h-72 sm:w-84 sm:h-84 mx-auto rounded-full bg-white dark:bg-[#121620] border-4 border-stone-200/90 dark:border-white/10 shadow-2xl flex flex-col items-center justify-center p-8 transition-colors">
        
        <span className="text-xs font-mono text-[#E05638] uppercase font-bold tracking-widest mb-1">
          {isActive ? "● FOKUS VAQTI" : "TAYYOR"}
        </span>

        <div className="font-mono text-5xl sm:text-6xl font-bold text-stone-950 dark:text-white tracking-tight">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>

        <span className="text-[11px] font-mono text-stone-400 mt-2">
          Me'yor: 25 daqiqa
        </span>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={resetTimer}
            className="p-3 rounded-full bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-stone-300 hover:bg-stone-200 transition-colors cursor-pointer"
            title="Qayta o'rnatish"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={toggleTimer}
            className="px-6 py-3 rounded-full bg-[#E05638] hover:bg-[#C74326] text-white font-mono font-bold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
          >
            {isActive ? <Pause size={16} /> : <Play size={16} />}
            <span>{isActive ? "Pauza" : "Boshlash"}</span>
          </button>
        </div>

      </div>

      {/* ── Ambient Soundscapes Selector ── */}
      <div className="p-8 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-serif font-bold text-stone-950 dark:text-white">
            <Volume2 size={16} className="text-[#E05638]" />
            <span>Kutubxona Muhit Tovushlari (Ambient Soundscapes)</span>
          </div>
          <span className="text-[10px] font-mono text-stone-400">Tinchlantiruvchi fon</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'rain', label: "🌧️ Yomg'ir & Deraza", desc: 'Mayin tomchilar sadosi' },
            { id: 'fire', label: "🪵 O'tin Olovi", desc: 'Qadimiy kamin shukuxi' },
            { id: 'library', label: "📖 Sokin Kutubxona", desc: 'Varaqlar va sokinlik' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => {
                setSoundscape(soundscape === s.id ? null : s.id);
                toast.success(`${s.label} tovushi faollashdi!`, { icon: '🎧' });
              }}
              className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                soundscape === s.id
                  ? 'border-[#E05638] bg-[#E05638]/10 text-stone-950 dark:text-white font-bold'
                  : 'border-stone-200 dark:border-white/10 hover:border-stone-400 text-stone-700 dark:text-stone-300'
              }`}
            >
              <div className="text-xs font-bold">{s.label}</div>
              <div className="text-[10px] text-stone-400 font-mono mt-0.5">{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
