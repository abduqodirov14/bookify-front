import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, X, Sparkles, BookOpen } from 'lucide-react';
import { AudioTrack } from '../../types';

interface Props {
  track: AudioTrack | null;
  onClose: () => void;
  onOpenReader: (bookId: string) => void;
}

export default function AudioDock({ track, onClose, onOpenReader }: Props) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(1.0);
  const [progress, setProgress] = useState(35);

  useEffect(() => {
    if (!track) return;
    setIsPlaying(true);
  }, [track]);

  if (!track) return null;

  const togglePlay = () => setIsPlaying(!isPlaying);
  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    setSpeed(next);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-2xl bg-white/95 dark:bg-[#121620]/95 backdrop-blur-xl border border-stone-200/90 dark:border-white/10 rounded-2xl shadow-2xl p-3.5 transition-all animate-in slide-in-from-bottom-6 duration-300">
      
      {/* Progress Bar Top Line */}
      <div 
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const p = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
          setProgress(p);
        }}
        className="absolute top-0 left-3 right-3 h-1 bg-stone-100 dark:bg-white/10 rounded-full cursor-pointer overflow-hidden group"
      >
        <div 
          className="h-full bg-[#E05638] rounded-full transition-all group-hover:bg-[#C74326]" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        
        {/* Left: Book Cover & Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative w-11 h-15 rounded-md overflow-hidden shrink-0 shadow-sm border border-black/10">
            <img src={track.coverImage} alt={track.title} className="w-full h-full object-cover" />
            <div className="book-spine-hinge" />
          </div>

          <div className="flex flex-col min-w-0">
            <h4 className="text-xs font-semibold text-stone-900 dark:text-white truncate">
              {track.title}
            </h4>
            <span className="text-[10px] text-[#E05638] dark:text-amber-400 font-mono truncate font-medium">
              {track.chapterTitle}
            </span>
            <span className="text-[10px] text-stone-400 truncate">
              Suhandon: Afzal Rafiqov
            </span>
          </div>
        </div>

        {/* Center: Live Waveform & Audio Controls */}
        <div className="flex items-center gap-3">
          
          {/* Animated Waveform */}
          <div className="hidden sm:flex items-center gap-0.5 h-6 px-2">
            {[40, 80, 50, 100, 70, 90, 45, 85, 60, 95].map((h, i) => (
              <span
                key={i}
                className={`w-0.5 bg-[#E05638] rounded-full transition-all ${
                  isPlaying ? 'waveform-bar' : 'opacity-40'
                }`}
                style={{
                  height: `${h}%`,
                  animationDelay: `${i * 0.12}s`,
                }}
              />
            ))}
          </div>

          {/* 15s Rewind */}
          <button 
            onClick={() => setProgress(prev => Math.max(0, prev - 5))}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="15 soniya orqaga"
          >
            <RotateCcw size={15} />
          </button>

          {/* Play/Pause Button */}
          <button 
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-[#E05638] hover:bg-[#C74326] text-white flex items-center justify-center shadow-md hover:shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            {isPlaying ? <Pause size={17} /> : <Play size={17} className="ml-0.5" />}
          </button>

          {/* 15s Forward */}
          <button 
            onClick={() => setProgress(prev => Math.min(100, prev + 5))}
            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="15 soniya oldinga"
          >
            <RotateCw size={15} />
          </button>

          {/* Speed Selector */}
          <button
            onClick={cycleSpeed}
            className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-stone-300 hover:bg-stone-200 cursor-pointer"
          >
            {speed}x
          </button>
        </div>

        {/* Right Actions: Open in Reader & Close */}
        <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-stone-200 dark:border-white/10">
          <button
            onClick={() => onOpenReader(track.bookId)}
            className="p-2 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-[#E05638] hover:text-white text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
            title="Matnini o'qish (Reader)"
          >
            <BookOpen size={14} />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Pleyerni yopish"
          >
            <X size={15} />
          </button>
        </div>

      </div>
    </div>
  );
}
