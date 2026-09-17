"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { User, BookOpen, LogOut } from "lucide-react";
import { api, getCachedUser, clearAuthToken } from "@/services/api";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const cached = getCachedUser();
    if (cached) setUser(cached);
    
    api.getMe().then(u => {
      if (u) setUser(u);
    }).catch(() => {});
  }, []);

  const handleLogout = () => {
    clearAuthToken();
    setUser(null);
    setIsMenuOpen(false);
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#F5F5F7]/80 backdrop-blur-xl border-b border-black/5 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center shadow-sm shadow-orange-500/20">
          <span className="text-white font-bold text-lg leading-none">B</span>
        </div>
        <span className="font-semibold text-gray-900 text-lg tracking-tight">Bookify</span>
      </Link>
      
      {user ? (
        <div className="relative">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-all border border-gray-200">
            <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="text-sm font-bold text-gray-900 pr-1 max-w-[100px] truncate">{user.name || 'User'}</span>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-fade-in">
              <div className="px-3 py-2 border-b border-gray-50 mb-2">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{user.role || 'USER'}</div>
                <div className="text-sm font-medium text-gray-900 truncate">{user.email}</div>
              </div>
              
              {user.role === 'ADMIN' && (
                <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                  <User size={16} /> Admin Panel
                </Link>
              )}
              {user.role === 'SCHOOL_DIRECTOR' && (
                <Link href="/director" className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                  <User size={16} /> Direktor Panel
                </Link>
              )}
              {user.role === 'LIBRARIAN' && (
                <Link href="/librarian" className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                  <BookOpen size={16} /> Kutubxona Panel
                </Link>
              )}
              
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-1">
                <LogOut size={16} /> Chiqish
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link href="/auth" className="px-5 py-2 bg-gray-900 text-white rounded-full text-sm font-bold shadow-md shadow-black/10 hover:bg-black transition-colors active:scale-95">Kirish</Link>
      )}
    </nav>
  );
}
