'use client';
import React from 'react';
import { Home, Compass, Trophy, Gift, User, Sparkles } from 'lucide-react';
import { Page } from '../../types';
import { useTelegramWebApp } from '../../hooks/useTelegramWebApp';

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function TelegramMobileNav({ currentPage, onNavigate }: Props) {
  const { triggerHaptic } = useTelegramWebApp();

  const navItems: { id: Page; label: string; icon: any }[] = [
    { id: 'home', label: 'Asosiy', icon: Home },
    { id: 'discover', label: 'Katalog', icon: Compass },
    { id: 'challenge', label: 'Reyting', icon: Trophy },
    { id: 'vision', label: 'Vizyon', icon: Sparkles },
    { id: 'profile', label: 'Pasport', icon: User },
  ];

  const handleNav = (id: Page) => {
    triggerHaptic('medium');
    onNavigate(id);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0A0D14]/95 backdrop-blur-xl border-t border-stone-200/90 dark:border-white/10 px-4 py-2 flex items-center justify-around shadow-2xl sm:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleNav(item.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              isActive
                ? 'text-[#E05638] font-bold scale-105'
                : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-colors ${
              isActive ? 'bg-[#E05638]/10 text-[#E05638]' : ''
            }`}>
              <Icon size={18} />
            </div>
            <span className="text-[10px] font-mono tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
