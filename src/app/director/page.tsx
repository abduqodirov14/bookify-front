"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Users, BookOpen, Clock, Download, TrendingUp, Trophy, ArrowRight, Loader2 } from "lucide-react";
import { b2bService } from "@/services/b2b.service";

export default function DirectorDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    b2bService.getDirectorDashboard()
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {
    active_students: 0,
    total_students: 0,
    books_read: 0,
    total_reading_hours: 0,
    school_name: "Maktab",
    rank: 0
  };

  const topClasses = data?.top_classes || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Xush kelibsiz, Direktor!</h1>
          <p className="text-gray-500 font-medium mt-1">{stats.school_name} maktabining umumiy mutolaa holati</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold transition-colors whitespace-nowrap">
          <Download size={18} /> RayONO uchun hisobot (PDF)
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4"><Users size={24} /></div>
              <div className="text-3xl font-black text-gray-900 mb-1">{stats.active_students} <span className="text-gray-400 text-lg font-bold">/ {stats.total_students || 1}</span></div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Faol o'quvchilar</div>
            </div>
            
            <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-4"><BookOpen size={24} /></div>
              <div className="text-3xl font-black text-gray-900 mb-1">{stats.books_read} ta</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">O'qilgan asarlar</div>
            </div>

            <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mb-4"><Clock size={24} /></div>
              <div className="text-3xl font-black text-gray-900 mb-1">{stats.total_reading_hours} soat</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Jami mutolaa vaqti</div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[24px] shadow-xl shadow-blue-900/20 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4"><Trophy size={24} className="text-yellow-400" /></div>
                <div className="text-3xl font-black mb-1">#{stats.rank || 1} O'rinda</div>
                <div className="text-xs font-bold text-white/70 uppercase tracking-wide">Respublika maktablari orasida</div>
              </div>
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 translate-y-1/2"></div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 px-1">Top Sinflar Reytingi</h2>
            <div className="bg-white rounded-[32px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
              {topClasses.length === 0 ? (
                <div className="p-8 text-center text-gray-400 font-medium">Hali sinflar faolligi yo'q</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">O'rin</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Sinf</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Sinf rahbari</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Mutolaa soati</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">O'zlashish</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topClasses.map((item: any, idx: number) => (
                      <tr key={idx} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                        <td className="px-6 py-4">
                          <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm ${idx === 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>{idx + 1}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-500">{item.teacher_name || "Noma'lum"}</td>
                        <td className="px-6 py-4 font-bold text-blue-600">{item.hours} soat</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-100 rounded-full h-2 max-w-[100px]"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${item.score}%` }}></div></div>
                            <span className="text-xs font-bold text-gray-600">{item.score}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}