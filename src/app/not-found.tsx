'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Home, Compass, Sparkles, RefreshCw, BookOpen, Terminal, ArrowLeft } from 'lucide-react';

const ASCII_BANNER = [
  "   ____    ___    _  _   ",
  "  |___ \\  / _ \\  | || |  ",
  "    __) || | | | | || |_ ",
  "   / __/ | |_| | |__   _|",
  "  |_____| \\___/     |_|  "
];

const ASCII_BOOKS_FRAMES = [
`
       .---.               .---.
      /     \\             /     \\
     | () () |           | () () |
      \\  -  /             \\  -  /
     .-'---'-.           .-'---'-.
    /  404    \\         /  BOOK   \\
   |   PAGE    |       |  LOST     |
   |   NOT     |       |  IN THE   |
   |   FOUND   |       |  LIBRARY  |
    \\_________/         \\_________/
`,
`
       ______               ______
     .-"      "-.         .-"      "-.
    /            \\       /            \\
   |   BOOKIFY    |     |    SAHIFA    |
   |,  .------.  ,|     |,  .------.  ,|
   | \\_| 404  |_/ |     | \\_| YO'Q  |_/ |
   |   '------'   |     |   '------'   |
    \\            /       \\            /
     '-.______.-'         '-.______.-'
`,
`
      .----------------.  .----------------.
     | .--------------. || .--------------. |
     | |   4 0 4      | || |   KITOB      | |
     | |   SAHIFA     | || |   TOPILMADI  | |
     | |   YO'QOLGAN  | || |   ADASHGAN   | |
     | '--------------' || '--------------' |
      '----------------'  '----------------'
`
];

const MATRIX_GLYPHS = ['@', '#', '$', '%', '&', '*', '+', '=', '~', ':', '.', '✦', '✧', '§', '¶', '0', '1'];

export default function NotFound() {
  const [frameIdx, setFrameIdx] = useState(0);
  const [interactiveMode, setInteractiveMode] = useState<'retro_amber' | 'terracotta' | 'matrix_green'>('terracotta');
  const [glitchText, setGlitchText] = useState("404_PAGE_NOT_FOUND");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Rotate ASCII book animation
  useEffect(() => {
    const timer = setInterval(() => {
      setFrameIdx(prev => (prev + 1) % ASCII_BOOKS_FRAMES.length);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  // Matrix / Dither background particle effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const cols = Math.floor(canvas.width / 24);
    const drops: number[] = Array(cols).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(8, 11, 15, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = '13px monospace';
      
      for (let i = 0; i < drops.length; i++) {
        const text = MATRIX_GLYPHS[Math.floor(Math.random() * MATRIX_GLYPHS.length)];
        const x = i * 24;
        const y = drops[i] * 20;

        if (interactiveMode === 'terracotta') {
          ctx.fillStyle = Math.random() > 0.9 ? '#F5EFE0' : (Math.random() > 0.5 ? '#E05638' : '#C5A059');
        } else if (interactiveMode === 'retro_amber') {
          ctx.fillStyle = Math.random() > 0.8 ? '#FFF' : '#F59E0B';
        } else {
          ctx.fillStyle = Math.random() > 0.85 ? '#FFF' : '#10B981';
        }

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [interactiveMode]);

  const colorStyles = {
    terracotta: {
      accent: 'text-[#E05638]',
      border: 'border-[#E05638]/40',
      badge: 'bg-[#E05638]/15 text-[#E05638] border-[#E05638]/30',
      glow: 'shadow-[#E05638]/20',
      ascii: 'text-[#E05638] dark:text-[#F39C12]'
    },
    retro_amber: {
      accent: 'text-amber-500',
      border: 'border-amber-500/40',
      badge: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
      glow: 'shadow-amber-500/20',
      ascii: 'text-amber-400'
    },
    matrix_green: {
      accent: 'text-emerald-500',
      border: 'border-emerald-500/40',
      badge: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
      glow: 'shadow-emerald-500/20',
      ascii: 'text-emerald-400'
    }
  }[interactiveMode];

  return (
    <div className="relative min-h-screen bg-[#080B0F] text-stone-100 flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden font-sans select-none">
      
      {/* ── Background ASCII Digital Rain Canvas ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40 z-0"
      />

      {/* Decorative Radial Vignette */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#080B0F]/70 to-[#080B0F] pointer-events-none z-1" />

      {/* ── Main ASCII 404 HUD Container ── */}
      <div className="relative z-10 w-full max-w-2xl bg-stone-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 text-center animate-in fade-in zoom-in-95 duration-500">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E05638] animate-ping" />
            <span className="text-stone-400">STATUS:</span>
            <span className="font-bold text-[#E05638]">404 NOT FOUND</span>
          </div>

          {/* ASCII Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setInteractiveMode('terracotta')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                interactiveMode === 'terracotta' ? 'bg-[#E05638] text-white' : 'text-stone-400 hover:text-white'
              }`}
              title="Terracotta rejim"
            >
              Terracotta
            </button>
            <button
              onClick={() => setInteractiveMode('retro_amber')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                interactiveMode === 'retro_amber' ? 'bg-amber-500 text-stone-950 font-black' : 'text-stone-400 hover:text-white'
              }`}
              title="Amber Retro rejim"
            >
              Amber
            </button>
            <button
              onClick={() => setInteractiveMode('matrix_green')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                interactiveMode === 'matrix_green' ? 'bg-emerald-500 text-stone-950 font-black' : 'text-stone-400 hover:text-white'
              }`}
              title="Matrix rejim"
            >
              Matrix
            </button>
          </div>
        </div>

        {/* ── Giant ASCII Typography Banner ── */}
        <div className="py-2 overflow-x-auto select-all">
          <pre className={`font-mono text-xs sm:text-sm md:text-base font-bold tracking-widest leading-none ${colorStyles.ascii} inline-block filter drop-shadow-md`}>
            {ASCII_BANNER.join('\n')}
          </pre>
        </div>

        {/* ── Animated ASCII Book Illustration ── */}
        <div className="bg-black/60 rounded-2xl p-4 sm:p-5 border border-white/5 font-mono overflow-x-auto relative group">
          <pre className="text-[11px] sm:text-xs text-stone-300 leading-tight inline-block transition-transform duration-300 group-hover:scale-105">
            {ASCII_BOOKS_FRAMES[frameIdx]}
          </pre>
          <div className="absolute top-2 right-3 text-[10px] font-mono text-stone-500 flex items-center gap-1">
            <RefreshCw size={10} className="animate-spin text-[#E05638]" />
            <span>Kadr: {frameIdx + 1}/{ASCII_BOOKS_FRAMES.length}</span>
          </div>
        </div>

        {/* ── Title & Poetic Message ── */}
        <div className="space-y-3">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Sahifa Qadimiy Matnlar Qatida Yo'qolgan
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
            Siz izlagan sahifa yoki manzil boshqa bir adabiy javonga ko'chirilgan, 
            yoxud hali kashf etilmagan qo'lyozmalar orasida adashib qolgan ko'rinadi.
          </p>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#E05638] hover:bg-[#c94427] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#E05638]/25 cursor-pointer"
          >
            <Home size={15} />
            <span>Bosh Sahifaga Qaytish</span>
          </Link>

          <Link
            href="/?view=discover"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
          >
            <Compass size={15} />
            <span>Katalogga O'tish</span>
          </Link>
        </div>

        {/* Footer Meta */}
        <div className="pt-2 text-[11px] font-mono text-stone-500 flex items-center justify-center gap-2">
          <span>Bookify Dynamic ASCII Engine 👾</span>
          <span>•</span>
          <span>48kHz Audio & 3D Reader</span>
        </div>

      </div>
    </div>
  );
}
