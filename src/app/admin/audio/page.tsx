"use client";
import React from "react";
import { Play, Check, X, Headphones, Clock } from "lucide-react";

export default function AudioModerationPage() {
  const tracks = [
    { id: 1, book: "O'tkan Kunlar", chapter: "1-bob", volunteer: "Rustamov Bekzod", duration: "12:45", date: "2 soat oldin" },
    { id: 2, book: "Yashamoq", chapter: "4-bob", volunteer: "G'afforova Malika", duration: "18:20", date: "5 soat oldin" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Audio Moderatsiya</h1>
        <p className="text-gray-500 font-medium mt-1">Ko'ngillilar yuklagan audio kitoblarni tekshirish va tasdiqlash</p>
      </header>

      <div className="grid gap-4">
        {tracks.map(track => (
          <div key={track.id} className="bg-white p-5 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button className="w-14 h-14 bg-blue-50 text-blue-500 hover:bg-blue-100 rounded-2xl flex items-center justify-center shrink-0 transition-colors">
                <Play size={24} className="ml-1" />
              </button>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{track.book} <span className="text-gray-400 font-medium text-sm ml-2">({track.chapter})</span></h3>
                <div className="flex items-center gap-3 text-sm font-medium text-gray-500 mt-1">
                  <span className="flex items-center gap-1"><Headphones size={14} /> {track.volunteer}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {track.duration}</span>
                </div>
              </div>
            </div>

            <div className="flex w-full md:w-auto items-center gap-2 border-t md:border-0 border-gray-50 pt-4 md:pt-0">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl font-bold transition-colors">
                <Check size={18} /> Tasdiqlash
              </button>
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-colors">
                <X size={18} /> Rad etish
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}