"use client";
import React, { useEffect, useState } from "react";
import { Users, GraduationCap, ArrowRight, Plus, Loader2 } from "lucide-react";
import { b2bService } from "@/services/b2b.service";

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    b2bService.getClasses()
      .then(res => setClasses(Array.isArray(res) ? res : []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Sinflar reytingi</h1>
          <p className="text-gray-500 font-medium mt-1">Maktabdagi barcha sinflarning mutolaa monitoringi</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black active:scale-95 transition-all">
          <Plus size={18} /> Yangi Sinf
        </button>
      </header>

      {loading ? (
        <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400 font-medium bg-white rounded-3xl">Hozircha sinflar qo'shilmagan.</div>
          ) : classes.map((cls, idx) => (
            <div key={cls.id || idx} className="bg-white rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-xl transition-shadow group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 flex justify-end">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">{idx + 1}</div>
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-black text-gray-900">{cls.name || "Nomsiz Sinf"}</h3>
                <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-sm font-medium">
                  <GraduationCap size={16} /> <span>Sinf rahbari: {cls.teacher_name || "Biriktirilmagan"}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs font-bold text-gray-400 uppercase">O'quvchilar</div>
                  <div className="text-lg font-bold text-gray-900">{cls.students_count || 0} nafar</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-3">
                  <div className="text-xs font-bold text-orange-400 uppercase">Soat</div>
                  <div className="text-lg font-bold text-orange-600">{cls.total_hours || 0}</div>
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors">
                Batafsil <ArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}