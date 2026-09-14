"use client";
import React from "react";
import Link from "next/link";
import { Users, BookOpen, Clock, Download, TrendingUp, Trophy, ArrowRight } from "lucide-react";

export default function DirectorDashboard() {
  const topClasses = [
    { rank: 1, name: "9-'A' sinf", teacher: "Karimova M.", hours: 1250, score: 98 },
    { rank: 2, name: "10-'B' sinf", teacher: "Olimov S.", hours: 980, score: 85 },
    { rank: 3, name: "8-'V' sinf", teacher: "Tohirova N.", hours: 840, score: 79 },
    { rank: 4, name: "11-'A' sinf", teacher: "Rustamov D.", hours: 620, score: 60 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Xush kelibsiz, Alisher aka!</h1>
          <p className="text-gray-500 font-medium mt-1">Toshkent shahri, Prezident Maktabining umumiy mutolaa holati</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold transition-colors whitespace-nowrap">
          <Download size={18} /> RayONO uchun hisobot (PDF)
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <div className="text-3xl font-black text-gray-900 mb-1">410 <span className="text-gray-400 text-lg font-bold">/ 450</span></div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Faol o'quvchilar</div>
        </div>
        
        <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen size={24} />
          </div>
          <div className="text-3xl font-black text-gray-900 mb-1">1,248 ta</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">O'qilgan asarlar (Oy)</div>
        </div>

        <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mb-4">
            <Clock size={24} />
          </div>
          <div className="text-3xl font-black text-gray-900 mb-1">12,500s</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Jami mutolaa vaqti</div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[24px] shadow-xl shadow-blue-900/20 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
              <Trophy size={24} className="text-yellow-400" />
            </div>
            <div className="text-3xl font-black mb-1">#1 O'rinda</div>
            <div className="text-xs font-bold text-white/70 uppercase tracking-wide">Respublika maktablari orasida</div>
          </div>
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 translate-y-1/2"></div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Classes Ranking */}
        <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Sinflar Reytingi</h2>
            <Link href="/director/classes" className="text-blue-600 font-bold text-sm hover:underline">Barchasi</Link>
          </div>
          
          <div className="space-y-4">
            {topClasses.map((cls) => (
              <div key={cls.rank} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${cls.rank === 1 ? 'bg-yellow-100 text-yellow-600' : cls.rank === 2 ? 'bg-gray-100 text-gray-600' : cls.rank === 3 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
                  {cls.rank}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-900">{cls.name}</span>
                    <span className="font-bold text-gray-600 text-sm">{cls.hours} soat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${cls.score}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 w-24 truncate">Rahbar: {cls.teacher}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Books / Activities */}
        <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Maktab kutubxonasiga kelgan yangiliklar</h2>
          <div className="space-y-6">
            
            <div className="flex gap-4">
              <div className="w-16 h-20 bg-gray-100 rounded-xl flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: "url('https://api.asaxiy.uz/v1/media/pictures/books/yashamoq.jpg')" }}></div>
              <div>
                <div className="inline-block px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider rounded mb-1">Yangi jismoniy kitob</div>
                <h4 className="font-bold text-gray-900">Yashamoq</h4>
                <p className="text-sm font-medium text-gray-500 mt-1">Kutubxonachi 15 ta nusxada qabul qildi.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-16 h-20 bg-gray-100 rounded-xl flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: "url('https://kitobxon.com/img_knigi/s679.jpg')" }}></div>
              <div>
                <div className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded mb-1">Elektron format qo'shildi</div>
                <h4 className="font-bold text-gray-900">Ufq romani</h4>
                <p className="text-sm font-medium text-gray-500 mt-1">Barcha o'quvchilar endi ilovada o'qishi mumkin.</p>
              </div>
            </div>

          </div>
          <Link href="/director/library" className="w-full mt-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
            Kutubxonaga o'tish <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
}