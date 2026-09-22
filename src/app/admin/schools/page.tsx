"use client";
import React, { useEffect, useState } from "react";
import { Building2, Plus, Search, Filter, MoreVertical, TrendingUp, Users } from "lucide-react";
import { b2bService } from "@/services/b2b.service";
import { SCHOOLS as fallbackSchools } from "@/data/schools";

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState<any[]>(fallbackSchools);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    b2bService.getSchools()
      .then((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          setSchools(data);
        }
      })
      .catch((err: any) => {
        console.log("Using default school metrics:", err);
      });
  }, []);
  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Maktablar (B2B)</h1>
          <p className="text-gray-500 font-medium mt-1">Platformaga ulangan barcha ta'lim muassasalari va ularning reytingi</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Maktab qidirish..." className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 w-full sm:w-64" />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black active:scale-95 transition-all whitespace-nowrap">
            <Plus size={18} /> Maktab qo'shish
          </button>
        </div>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
            <Building2 size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">4 ta</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Ulangan maktablar</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">2,270</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Faol o'quvchilar</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">11.4M so'm</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Oylik tushum (MRR)</div>
          </div>
        </div>
      </div>

      {/* Schools List */}
      <div className="bg-white border border-gray-100 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-5">Maktab Nomi</th>
                <th className="p-5">Direktor</th>
                <th className="p-5">Faollik (Progress)</th>
                <th className="p-5">O'quvchilar</th>
                <th className="p-5">Obuna</th>
                <th className="p-5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schools.map((school: any) => (
                <tr key={school.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-5">
                    <div className="font-bold text-gray-900">{school.name}</div>
                    <div className="text-xs font-medium text-gray-500">{school.region}</div>
                  </td>
                  <td className="p-5 text-sm font-bold text-gray-700">{school.director}</td>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${school.progress > 80 ? 'bg-green-500' : school.progress > 50 ? 'bg-orange-500' : 'bg-red-500'}`}
                          style={{ width: `${school.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-gray-600 w-8">{school.progress}%</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="text-sm font-bold text-gray-900">{school.activeStudents} <span className="text-gray-400">/ {school.studentsCount}</span></div>
                  </td>
                  <td className="p-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      school.plan === 'VIP' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                      school.plan === 'Premium' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {school.plan}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <button className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}