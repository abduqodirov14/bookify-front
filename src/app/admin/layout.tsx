"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Users, Headphones, UploadCloud, Calendar, MessageSquare, ChevronLeft, LogOut, Film } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Foydalanuvchilar", href: "/admin/users", icon: Users },
    { name: "Maktablar (B2B)", href: "/admin/schools", icon: Building2 },
    { name: "Audio Moderatsiya", href: "/admin/audio", icon: Headphones },
    { name: "Kitob Yuklash", href: "/admin/upload", icon: UploadCloud },
    { name: "Mavsumlar", href: "/admin/seasons", icon: Calendar },
    { name: "Izohlar", href: "/admin/comments", icon: MessageSquare },
  ];

  return (
    <AuthGuard panelTitle="Super Admin Paneli" allowedRoles={["ADMIN"]} themeColor="black">
      <div className="min-h-screen bg-[#F5F5F7] font-sans flex flex-col md:flex-row">
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-100 shadow-[4px_0_24px_rgb(0,0,0,0.02)] z-20">
        <div className="p-6 border-b border-gray-50 flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg shadow-black/20">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <div>
            <h2 className="font-extrabold text-gray-900 text-lg leading-tight">Admin Panel</h2>
            <p className="text-xs font-semibold text-gray-400">Bookify System</p>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link key={tab.name} href={tab.href} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${isActive ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <tab.icon size={20} className={isActive ? 'text-white' : 'text-gray-400'} />
                {tab.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-50">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={20} />
            Chiqish
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">B</span>
          </div>
          <h2 className="font-extrabold text-gray-900">Admin Panel</h2>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-900">
          <LayoutDashboard size={20} />
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute top-16 right-4 w-64 bg-white rounded-[24px] shadow-2xl border border-gray-100 p-2 animate-fade-in" onClick={e => e.stopPropagation()}>
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link key={tab.name} href={tab.href} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm mb-1 ${isActive ? 'bg-black text-white' : 'text-gray-600'}`}>
                  <tab.icon size={18} />
                  {tab.name}
                </Link>
              );
            })}
            <div className="h-px bg-gray-100 my-2"></div>
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-500">
              <LogOut size={18} />
              Chiqish
            </Link>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-x-hidden relative">
        <div className="p-4 sm:p-8">
          {children}
        </div>
      </main>

      </div>
    </AuthGuard>
  );
}