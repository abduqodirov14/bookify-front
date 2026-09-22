"use client";
import React, { useState } from "react";
import { Search, Filter, MoreVertical, Shield, User, Star, Ban } from "lucide-react";

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState('Barchasi');

  const users = [
    { id: 1, name: "Aliyev Azamat", email: "azamat@example.com", role: "VIP", status: "Active", avatar: "A" },
    { id: 2, name: "Rustamov Bekzod", email: "bekzod@example.com", role: "VOLUNTEER", status: "Active", avatar: "R" },
    { id: 3, name: "Toshmatov Vali", email: "vali@example.com", role: "USER", status: "Banned", avatar: "T" },
    { id: 4, name: "G'aniyev Sardor", email: "sardor@example.com", role: "ADMIN", status: "Active", avatar: "G" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Foydalanuvchilar</h1>
          <p className="text-gray-500 font-medium mt-1">Tizimdagi barcha foydalanuvchilarni boshqarish</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Qidirish..." className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 w-full sm:w-64" />
          </div>
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"><Filter size={18} /></button>
        </div>
      </header>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['Barchasi', 'Adminlar', 'Ko\'ngillilar', 'VIP', 'Bloklanganlar'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-black text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-5">Foydalanuvchi</th>
                <th className="p-5">Email</th>
                <th className="p-5">Rol</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-blue-500 flex items-center justify-center text-white font-bold shadow-sm">
                      {user.avatar}
                    </div>
                    <span className="font-bold text-gray-900">{user.name}</span>
                  </td>
                  <td className="p-5 text-sm font-medium text-gray-500">{user.email}</td>
                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      user.role === 'ADMIN' ? 'bg-purple-50 text-purple-600' :
                      user.role === 'VIP' ? 'bg-orange-50 text-orange-600' :
                      user.role === 'VOLUNTEER' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      user.status === 'Active' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                    }`}>
                      {user.status === 'Active' ? 'Faol' : 'Bloklangan'}
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