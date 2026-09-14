"use client";
import React from "react";
import { UploadCloud, FileText, Image as ImageIcon, CheckCircle } from "lucide-react";

export default function UploadBookPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Kitob Yuklash</h1>
        <p className="text-gray-500 font-medium mt-1">Yangi kitobni tizimga qo'shish va nashr qilish</p>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 text-lg">Asosiy ma'lumotlar</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Kitob nomi</label>
                <input type="text" placeholder="Masalan: O'tkan Kunlar" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Muallif</label>
                  <input type="text" placeholder="Abdulla Qodiriy" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Janr</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5">
                    <option>Roman</option>
                    <option>Qissa</option>
                    <option>She'riyat</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tavsif</label>
                <textarea rows={4} placeholder="Kitob haqida qisqacha ma'lumot..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5"></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-center justify-center text-center border-dashed border-2 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
              <ImageIcon size={28} />
            </div>
            <span className="font-bold text-gray-900">Muqova yuklash</span>
            <span className="text-xs text-gray-400 mt-1">JPG, PNG (Max 2MB)</span>
          </div>

          <div className="bg-white p-6 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-center justify-center text-center border-dashed border-2 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-4">
              <FileText size={28} />
            </div>
            <span className="font-bold text-gray-900">Matn (EPUB/PDF) yuklash</span>
            <span className="text-xs text-gray-400 mt-1">EPUB, PDF (Max 20MB)</span>
          </div>

          <button className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-lg shadow-black/20 hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2">
            <CheckCircle size={20} /> Kitobni Nashr Qilish
          </button>
        </div>

      </div>
    </div>
  );
}