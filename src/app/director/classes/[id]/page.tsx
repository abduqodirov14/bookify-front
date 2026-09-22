"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Upload, Plus, BookOpen, Clock, Target, Search, MoreVertical, Download, Filter, ChevronDown, Check } from "lucide-react";

export default function ClassDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Barchasi");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const students = [
    { id: 1, name: "Azizov Bekzod", books: 12, hours: 45, score: 98, status: "A'lochi", avatar: "A" },
    { id: 2, name: "Komilova Shahnoza", books: 8, hours: 32, score: 85, status: "Yaxshi", avatar: "K" },
    { id: 3, name: "Rahimov Sardor", books: 5, hours: 18, score: 65, status: "O'rtacha", avatar: "R" },
    { id: 4, name: "Tursunov Diyor", books: 2, hours: 8, score: 40, status: "Sust", avatar: "T" },
    { id: 5, name: "Yusupova Malika", books: 15, hours: 52, score: 100, status: "A'lochi", avatar: "Y" },
  ];

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === "Barchasi" || s.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/director/classes" className="w-11 h-11 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm transition-colors">
            <ChevronLeft size={22} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">9-'A' sinf</h1>
            <p className="text-gray-500 font-medium mt-1">Sinf rahbari: Karimova Malika • 32 nafar o'quvchi</p>
          </div>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold transition-colors shadow-sm">
          <Download size={18} /> Sinf hisoboti
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border-2 border-dashed border-gray-300 rounded-[20px] text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-400 transition-colors">
          <Upload size={20} /> Excel orqali o'quvchilarni qo'shish
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-600 rounded-[20px] text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
          <Plus size={20} /> Yangi uy vazifasi berish
        </button>
      </div>

      {/* Active Homework Card - Now Clickable! */}
      <Link href={`/director/classes/${id}/task`} className="block group">
        <div className="bg-gradient-to-r from-orange-400 to-red-500 p-6 sm:p-8 rounded-[32px] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl shadow-orange-500/20 relative overflow-hidden group-hover:scale-[1.01] transition-transform duration-300">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 border border-white/30">
              <Target size={12} /> Joriy Vazifa
            </div>
            <h3 className="text-2xl font-black mb-1 group-hover:underline decoration-white/50 underline-offset-4">"O'tkan kunlar" (1-qism)</h3>
            <p className="text-sm font-medium text-orange-100">Juma kunigacha o'qib tugatish va test ishlash</p>
          </div>
          <div className="relative z-10 sm:text-right flex items-center gap-6 sm:block">
            <div>
              <div className="text-4xl font-black">18<span className="text-2xl text-orange-200">/32</span></div>
              <div className="text-xs font-bold text-orange-100 uppercase tracking-wider mt-1">Tugatganlar</div>
            </div>
          </div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 group-hover:bg-white/20 transition-colors duration-500"></div>
        </div>
      </Link>

      {/* Students List */}
      <div className="bg-white border border-gray-100 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-visible">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">O'quvchilar ro'yxati</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="O'quvchi izlash..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all w-full" 
              />
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative w-full sm:w-auto">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2"><Filter size={16} className="text-gray-400"/> {filterStatus}</div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-fade-in">
                  {["Barchasi", "A'lochi", "Yaxshi", "O'rtacha", "Sust"].map(status => (
                    <button 
                      key={status}
                      onClick={() => { setFilterStatus(status); setIsFilterOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                    >
                      {status}
                      {filterStatus === status && <Check size={16} className="text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-5 pl-6">O'quvchi</th>
                <th className="p-5">O'qilgan Kitoblar</th>
                <th className="p-5">Mutolaa Vaqti</th>
                <th className="p-5">Holati</th>
                <th className="p-5 text-right pr-6">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStudents.length > 0 ? filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                  <td className="p-5 pl-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                      {student.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{student.name}</div>
                      <div className="text-xs font-bold text-blue-600">{student.score} ball</div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <BookOpen size={16} className="text-gray-400" /> {student.books} ta
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <Clock size={16} className="text-gray-400" /> {student.hours} soat
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      student.status === "A'lochi" ? "bg-green-50 text-green-600 border border-green-100" :
                      student.status === "Yaxshi" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                      student.status === "O'rtacha" ? "bg-orange-50 text-orange-600 border border-orange-100" : "bg-red-50 text-red-600 border border-red-100"
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="p-5 pr-6 text-right">
                    <button className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">Topilmadi...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}