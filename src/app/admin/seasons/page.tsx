"use client";
import React from "react";
import { Calendar, Plus, Users, BookOpen, Clock } from "lucide-react";

export default function SeasonsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mavsumlar</h1>
          <p className="text-gray-500 font-medium mt-1">Kitobxonlar o'rtasidagi musobaqalar va mavsumlar</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black active:scale-95 transition-all">
          <Plus size={18} /> Yangi Mavsum
        </button>
      </header>

      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-[32px] p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="relative z-10 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/30">
            Joriy Mavsum
          </div>
          <h2 className="text-3xl font-black mb-2">Kuzgi Mutolaa 2026</h2>
          <p className="text-white/80 font-medium mb-6 max-w-md">1-Sentyabrdan 30-Noyabrgacha davom etadi. Eng ko'p kitob o'qiganlarga qimmatbaho sovg'alar!</p>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Users size={18} /></div>
              <div><div className="text-sm font-bold">Qatnashchilar</div><div className="text-xs text-white/70">1,204 ta</div></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><BookOpen size={18} /></div>
              <div><div className="text-sm font-bold">O'qilgan asarlar</div><div className="text-xs text-white/70">4,320 ta</div></div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 w-full md:w-auto">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-[24px] text-center">
            <div className="text-sm font-bold text-white/70 mb-2 uppercase tracking-wide">Tugashiga qoldi</div>
            <div className="text-4xl font-black">45 Kun</div>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
      </div>
    </div>
  );
}