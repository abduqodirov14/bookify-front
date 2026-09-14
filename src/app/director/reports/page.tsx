"use client";
import React from "react";
import { FileText, Download, FileSpreadsheet, AlertCircle } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Rasmiy Hisobotlar</h1>
        <p className="text-gray-500 font-medium mt-1">Xalq Ta'limi Vazirligi va tuman bo'limlari uchun tayyor hisobotlar</p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* RayONO PDF */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[32px] text-white shadow-xl shadow-blue-900/20 relative overflow-hidden flex flex-col justify-between min-h-[240px]">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={20} className="text-blue-200" />
              <span className="font-bold text-blue-200 text-sm tracking-wide uppercase">Tuman bo'limi uchun</span>
            </div>
            <h2 className="text-2xl font-black mb-2">Umumiy Mutolaa Hisoboti (PDF)</h2>
            <p className="text-blue-100 text-sm max-w-sm">Joriy oydagi maktab o'quvchilarining jami o'qigan kitoblari va soatlari rasmiy hujjat shaklida.</p>
          </div>
          <button className="relative z-10 self-start mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold shadow-lg hover:bg-gray-50 active:scale-95 transition-all">
            <Download size={18} /> PDF Yuklash
          </button>
          <div className="absolute right-0 bottom-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        </div>

        {/* Excel Data */}
        <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between min-h-[240px]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileSpreadsheet size={20} className="text-green-500" />
              <span className="font-bold text-gray-400 text-sm tracking-wide uppercase">Batafsil ma'lumotlar</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">O'quvchilar bazasi (Excel)</h2>
            <p className="text-gray-500 text-sm max-w-sm">Hamma o'quvchilarning ismlari, sinflari va individual o'qish ballari tushirilgan Excel jadvali.</p>
          </div>
          <button className="self-start mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl font-bold transition-all">
            <Download size={18} /> Excel Yuklash
          </button>
        </div>
      </div>

      <div className="bg-orange-50 rounded-[24px] p-6 flex items-start gap-4">
        <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={24} />
        <div>
          <h4 className="font-bold text-orange-900 mb-1">Muhim eslatma</h4>
          <p className="text-orange-700 text-sm font-medium">Bu hisobotlar har oyning 1-sanasida avtomatik ravishda yangilanadi. Agar qo'shimcha ko'rsatkichlar kerak bo'lsa, Super Admin bilan bog'laning.</p>
        </div>
      </div>

    </div>
  );
}