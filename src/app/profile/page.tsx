"use client";

import React from "react";
import Link from "next/link";
import { User, Settings, Bell, BookOpen, Clock, Trophy, ChevronRight, Heart, Crown, LogOut, ChevronLeft } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans pb-32">
      
      {/* iOS Style Minimal Navbar */}
      <Navbar />

      <main className="px-4 sm:px-6 mt-6 max-w-2xl mx-auto space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-400 to-orange-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-orange-500/30">
              A
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white">
                <Crown size={12} strokeWidth={3} />
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Aliyev Azamat</h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wide">
              VIP Obunachi
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-3">
              <BookOpen size={24} />
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1">24</div>
            <div className="text-sm font-semibold text-gray-500">O'qilgan kitoblar</div>
          </div>
          <div className="bg-white p-5 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center mb-3">
              <Clock size={24} />
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1">142s</div>
            <div className="text-sm font-semibold text-gray-500">Mutolaa vaqti</div>
          </div>
        </div>

        {/* Streak / Goals */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-black rounded-[32px] p-6 text-white shadow-xl shadow-black/10">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={20} className="text-yellow-400" />
                <span className="font-bold text-gray-300 text-sm tracking-wide">MUTOLAA ODATI</span>
              </div>
              <div className="text-3xl font-black mb-1">7 Kunlik Olov!</div>
              <p className="text-gray-400 text-sm font-medium">Zo'r ketyapsiz, to'xtamang.</p>
            </div>
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center font-black text-3xl border border-white/20">
              7
            </div>
          </div>
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl"></div>
        </div>

        {/* Settings Links */}
        <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          {[
            { icon: User, label: "Shaxsiy ma'lumotlar", color: "text-blue-500", bg: "bg-blue-50" },
            { icon: Bell, label: "Bildirishnomalar", color: "text-purple-500", bg: "bg-purple-50" },
            { icon: Trophy, label: "Yutuqlar va reyting", color: "text-orange-500", bg: "bg-orange-50" },
            { icon: Heart, label: "Yoqtirgan janrlar", color: "text-red-500", bg: "bg-red-50" }
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center gap-4 p-4 sm:p-5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 group">
              <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                <item.icon size={22} />
              </div>
              <div className="flex-1 text-left font-bold text-gray-900 text-base">{item.label}</div>
              <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
            </button>
          ))}
        </div>

        {/* Log Out Button */}
        <Link href="/auth" className="w-full bg-white rounded-[24px] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center justify-center gap-2 text-red-500 font-bold hover:bg-red-50 transition-colors">
          <LogOut size={20} />
          Hisobdan chiqish</Link>

      </main>

      {/* Floating Bottom Navigation Bar (iOS Style) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
        <div className="bg-white/90 backdrop-blur-xl border border-black/5 shadow-[0_20px_40px_rgb(0,0,0,0.08)] rounded-[32px] p-2 flex items-center justify-between">
          
          <Link href="/" className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-orange-500 transition-colors">
            <BookOpen size={22} className="mb-1" />
            <span className="text-[10px] font-bold">Kutubxona</span>
          </Link>
          
          <Link href="/zen" className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-gray-900 transition-colors">
            <Clock size={22} className="mb-1" />
            <span className="text-[10px] font-bold">Zen Mutolaa</span>
          </Link>
          
          <Link href="/saved" className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-red-500 transition-colors">
            <Heart size={22} className="mb-1" />
            <span className="text-[10px] font-bold">Saqlangan</span>
          </Link>
          
          <Link href="/profile" className="flex-1 flex flex-col items-center justify-center py-2 text-blue-500 hover:text-blue-600 transition-colors">
            <User size={22} className="mb-1" />
            <span className="text-[10px] font-bold">Profil</span>
          </Link>

        </div>
      </div>
    </div>
  );
}