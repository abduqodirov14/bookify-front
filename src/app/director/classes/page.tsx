"use client";
import React from "react";
import Link from "next/link";
import { Users, Plus, ChevronRight, Award } from "lucide-react";

export default function ClassesPage() {
  const classes = [
    { id: 1, name: "9-'A' sinf", teacher: "Karimova Malika", students: 32, active: 30, score: 98, color: "bg-blue-50 text-blue-600" },
    { id: 2, name: "10-'B' sinf", teacher: "Olimov Sardor", students: 28, active: 25, score: 85, color: "bg-green-50 text-green-600" },
    { id: 3, name: "8-'V' sinf", teacher: "Tohirova Nodira", students: 35, active: 28, score: 79, color: "bg-orange-50 text-orange-600" },
    { id: 4, name: "11-'A' sinf", teacher: "Rustamov Davron", students: 25, active: 15, score: 60, color: "bg-red-50 text-red-600" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Sinflar va O'quvchilar</h1>
          <p className="text-gray-500 font-medium mt-1">Maktabdagi barcha sinflarning mutolaa holati</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold transition-colors whitespace-nowrap shadow-lg shadow-blue-600/20">
          <Plus size={18} /> Yangi Sinf Qo'shish
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map(cls => (
          <Link href={`/director/classes/${cls.id}`} key={cls.id} className="block bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-blue-100 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${cls.color}`}>
                {cls.name.split('-')[0]}
              </div>
              <div className="flex items-center gap-1 text-gray-400 group-hover:text-blue-600 transition-colors">
                <span className="text-sm font-bold">Ichiga kirish</span>
                <ChevronRight size={18} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{cls.name}</h3>
            <p className="text-sm font-medium text-gray-500 mb-6">Rahbar: {cls.teacher}</p>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-gray-500">Faol o'quvchilar</span>
                  <span className="text-gray-900">{cls.active} / {cls.students}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(cls.active / cls.students) * 100}%` }}></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><Award size={14}/> Sinf Reytingi</span>
                <span className="font-black text-gray-900">{cls.score} ball</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}