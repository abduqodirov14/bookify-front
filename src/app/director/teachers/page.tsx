"use client";
import React from "react";
import { GraduationCap, Search, Mail, Phone, MoreVertical } from "lucide-react";

export default function TeachersPage() {
  const teachers = [
    { id: 1, name: "Karimova Malika", subject: "Ona tili va Adabiyot", class: "9-'A' sinf", students: 32, phone: "+998 90 123 45 67" },
    { id: 2, name: "Olimov Sardor", subject: "Tarix", class: "10-'B' sinf", students: 28, phone: "+998 90 987 65 43" },
    { id: 3, name: "Tohirova Nodira", subject: "Matematika", class: "8-'V' sinf", students: 35, phone: "+998 93 456 78 90" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">O'qituvchilar</h1>
          <p className="text-gray-500 font-medium mt-1">Maktabdagi sinf rahbarlari ro'yxati</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Ism bo'yicha qidirish..." className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64" />
        </div>
      </header>

      <div className="bg-white border border-gray-100 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-5">O'qituvchi</th>
                <th className="p-5">Biriktirilgan Sinf</th>
                <th className="p-5">O'quvchilar</th>
                <th className="p-5">Telefon</th>
                <th className="p-5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teachers.map(teacher => (
                <tr key={teacher.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                      {teacher.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{teacher.name}</div>
                      <div className="text-xs font-medium text-gray-500">{teacher.subject}</div>
                    </div>
                  </td>
                  <td className="p-5 text-sm font-bold text-gray-700">{teacher.class}</td>
                  <td className="p-5 text-sm font-bold text-gray-700">{teacher.students} ta</td>
                  <td className="p-5 text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" /> {teacher.phone}
                  </td>
                  <td className="p-5 text-right">
                    <button className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors">
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