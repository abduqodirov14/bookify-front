"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, QrCode, Library, AlertCircle, LogOut, LayoutDashboard } from "lucide-react";

export default function LibrarianLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { name: "Asosiy Oyna", href: "/librarian", icon: LayoutDashboard },
    { name: "Kitob berish (QR)", href: "/librarian/scan", icon: QrCode },
    { name: "Kitoblar bazasi", href: "/librarian/books", icon: Library },
    { name: "Qarzdorlar", href: "/librarian/overdue", icon: AlertCircle },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col md:flex-row">
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-100 shadow-[4px_0_24px_rgb(0,0,0,0.02)] z-20">
        <div className="p-6 border-b border-gray-50 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <BookOpen size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-extrabold text-gray-900 text-lg leading-tight">Kutubxona</h2>
            <p className="text-xs font-semibold text-gray-400">Kutubxonachi Paneli</p>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link key={tab.name} href={tab.href} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
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

      {/* Main Content */}
      <main className="flex-1 w-full overflow-x-hidden relative">
        <div className="p-4 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}