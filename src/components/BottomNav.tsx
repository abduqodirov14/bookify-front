"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Clock, Heart, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  
  if (pathname.startsWith("/read/")) return null;

  const navItems = [
    { href: "/", icon: BookOpen, label: "Kutubxona" },
    { href: "/zen", icon: Clock, label: "Zen" },
    { href: "/saved", icon: Heart, label: "Saqlangan" },
    { href: "/profile", icon: User, label: "Profil" }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FBF8F1] border-t border-[#E3DCCB] flex">
      {navItems.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        
        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 ${isActive ? 'text-[#B4472B]' : 'text-[#6B675E]'}`}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}