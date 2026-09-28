"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function ZenMutolaaPage() {
  const [time, setTime] = useState(30 * 60); // Default 30 mins in seconds
  const [isActive, setIsActive] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(30);

  useEffect(() => {
    document.title = 'Zen Mutolaa — Bookify';
    let interval: NodeJS.Timeout;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((time) => time - 1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, time]);

  const handlePreset = (mins: number) => {
    setSelectedPreset(mins);
    setTime(mins * 60);
    setIsActive(false);
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTime(selectedPreset * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = 1 - (time / (selectedPreset * 60));
  const dashArray = 2 * Math.PI * 120; // radius = 120
  const dashOffset = dashArray * (1 - progress);

  return (
    <div className="min-h-screen bg-[#F6F1E7] font-[var(--font-inter)] text-[#1B1A17] flex flex-col">
      
      <header className="sticky top-0 z-40 px-4 py-4 text-center">
        <Link href="/" className="font-[var(--font-newsreader)] text-xl font-semibold text-[#1B1A17]">
          Bookify
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative pb-24">
        
        <div className="relative flex items-center justify-center mb-10">
          <svg className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="120"
              fill="transparent"
              stroke="#E3DCCB"
              strokeWidth="4"
            />
            <circle
              cx="50%"
              cy="50%"
              r="120"
              fill="transparent"
              stroke="#B4472B"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-[var(--font-newsreader)] text-6xl sm:text-7xl text-[#1B1A17]">
              {formatTime(time)}
            </div>
            <div className="mt-2 text-xs font-medium text-[#6B675E] uppercase tracking-widest">
              Zen
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-8 w-full max-w-xs">
          
          <div className="flex items-center justify-center gap-4 flex-wrap w-full">
            {[15, 30, 45, 60].map((mins) => (
              <button 
                key={mins}
                onClick={() => handlePreset(mins)}
                className={`px-3 py-1 text-sm transition-colors ${
                  selectedPreset === mins 
                    ? 'text-[#B4472B] font-semibold underline underline-offset-4' 
                    : 'text-[#6B675E] hover:text-[#1B1A17]'
                }`}
              >
                {mins} daq
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={resetTimer}
              className="px-4 py-2 text-sm text-[#6B675E] border border-[#E3DCCB] rounded-md hover:bg-[#FBF8F1] transition-colors"
            >
              Qayta
            </button>
            
            <button 
              onClick={toggleTimer}
              className="px-6 py-2 text-sm text-white bg-[#B4472B] rounded-md hover:bg-[#9e3d25] transition-colors"
            >
              {isActive ? 'To\'xtatish' : 'Boshlash'}
            </button>
          </div>

        </div>

      </main>

    </div>
  );
}