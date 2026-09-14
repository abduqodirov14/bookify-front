"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Search, Clock, Heart, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  
  // Hide bottom nav completely on the actual reading page to keep it full-screen
  if (pathname.startsWith("/read/")) return null;

  const navItems = [
    { href: "/", icon: BookOpen, label: "Kutubxona" },
    { href: "/discover", icon: Search, label: "Kashf" },
    { href: "/zen", icon: Clock, label: "Zen" },
    { href: "/saved", icon: Heart, label: "Saqlangan" },
    { href: "/profile", icon: User, label: "Profil" }
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] sm:w-[500px]">
      <div className="bg-white/95 backdrop-blur-2xl border border-gray-100 shadow-[0_20px_40px_rgb(0,0,0,0.08)] rounded-[32px] p-2 flex items-center justify-between">
        {navItems.map((item) => {
          // Check exact match for home, startsWith for others
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          
          return (
            <Link key={item.href} href={item.href} className="relative flex-1 flex flex-col items-center justify-center h-14 group">
              <div className={`absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex flex-col items-center justify-center w-full ${isActive ? '-translate-y-6' : 'translate-y-0 group-hover:-translate-y-1'}`}>
                
                {/* Icon Circle */}
                <div className={`p-3 rounded-full transition-all duration-500 flex items-center justify-center ${isActive ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/40 scale-110' : 'bg-transparent text-gray-400 group-hover:text-gray-900 group-hover:bg-gray-50 scale-100'}`}>
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                
              </div>
              
              {/* Label below */}
              <span className={`absolute bottom-0 text-[9px] sm:text-[10px] font-bold tracking-wide transition-all duration-300 ${isActive ? 'opacity-100 text-orange-500 translate-y-2' : 'opacity-100 text-gray-400 translate-y-4 group-hover:text-gray-900'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}