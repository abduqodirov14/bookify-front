"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Pause, RotateCcw, Clock } from "lucide-react";

export default function ZenMutolaaPage() {
  const [time, setTime] = useState(30 * 60); // Default 30 mins in seconds
  const [isActive, setIsActive] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(30);

  useEffect(() => {
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
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navbar */}
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 p-6">
        
        {/* Timer Circle */}
        <div className="relative flex items-center justify-center mb-12">
          <svg className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] transform -rotate-90">
            {/* Background track */}
            <circle
              cx="50%"
              cy="50%"
              r="120"
              fill="transparent"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="8"
            />
            {/* Progress track */}
            <circle
              cx="50%"
              cy="50%"
              r="120"
              fill="transparent"
              stroke="#3B82F6"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Clock size={32} className="text-blue-400 mb-4 opacity-50" />
            <div className="text-6xl sm:text-8xl font-light tracking-tighter font-mono">
              {formatTime(time)}
            </div>
            <div className="mt-4 text-sm font-medium text-white/40 uppercase tracking-widest">
              qolgan vaqt
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-10 w-full max-w-sm">
          
          {/* Presets */}
          <div className="grid grid-cols-4 gap-3 w-full">
            {[15, 30, 45, 60].map((mins) => (
              <button 
                key={mins}
                onClick={() => handlePreset(mins)}
                className={`py-3 rounded-2xl font-bold text-sm transition-all ${selectedPreset === mins ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
              >
                {mins}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-6">
            <button 
              onClick={resetTimer}
              className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors"
            >
              <RotateCcw size={24} />
            </button>
            
            <button 
              onClick={toggleTimer}
              className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 shadow-[0_10px_30px_rgba(59,130,246,0.4)] transition-transform active:scale-95"
            >
              {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
            </button>
          </div>

        </div>

      </main>

    </div>
  );
}