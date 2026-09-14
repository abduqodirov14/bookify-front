"use client";
import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, CheckCircle2, Clock, XCircle, AlertTriangle, BookOpen, BrainCircuit } from "lucide-react";

export default function TaskDetailPage() {
  const params = useParams();
  const classId = params?.id as string;

  const results = [
    { id: 1, name: "Azizov Bekzod", status: "finished", testScore: "5/5", readTime: "4 soat 15 min", color: "text-green-600 bg-green-50" },
    { id: 2, name: "Komilova Shahnoza", status: "finished", testScore: "4/5", readTime: "3 soat 50 min", color: "text-green-600 bg-green-50" },
    { id: 3, name: "Rahimov Sardor", status: "reading", testScore: "-", readTime: "1 soat 20 min", color: "text-orange-600 bg-orange-50" },
    { id: 4, name: "Tursunov Diyor", status: "not_started", testScore: "-", readTime: "0 min", color: "text-red-600 bg-red-50" },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <Link href={`/director/classes/${classId}`} className="w-11 h-11 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm transition-colors">
          <ChevronLeft size={22} />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Vazifa natijalari</h1>
          <p className="text-gray-500 font-medium mt-1">"O'tkan kunlar" (1-qism) bo'yicha batafsil hisobot</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mb-4"><CheckCircle2 size={24}/></div>
          <div className="text-3xl font-black text-gray-900 mb-1">18 ta</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Tugatganlar</div>
        </div>
        <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-4"><Clock size={24}/></div>
          <div className="text-3xl font-black text-gray-900 mb-1">10 ta</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">O'qiyotganlar</div>
        </div>
        <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4"><AlertTriangle size={24}/></div>
          <div className="text-3xl font-black text-gray-900 mb-1">4 ta</div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Boshlamaganlar</div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-xl font-bold text-gray-900">O'quvchilar kesimida</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-5 pl-6">O'quvchi</th>
                <th className="p-5">Holat</th>
                <th className="p-5">O'qish vaqti</th>
                <th className="p-5">Test (Viktorina)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {results.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-5 pl-6 font-bold text-gray-900">{r.name}</td>
                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${r.color}`}>
                      {r.status === 'finished' ? <CheckCircle2 size={14}/> : r.status === 'reading' ? <Clock size={14}/> : <XCircle size={14}/>}
                      {r.status === 'finished' ? 'Tugatdi' : r.status === 'reading' ? "O'qimoqda" : 'Boshlamadi'}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <BookOpen size={16} className="text-gray-400" /> {r.readTime}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <BrainCircuit size={16} className="text-gray-400" /> {r.testScore}
                    </div>
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