import React from 'react';
import { 
  Home, 
  Compass, 
  Users2, 
  Library, 
  Clock, 
  Trophy, 
  User, 
  ShieldCheck, 
  LogOut, 
  Sun, 
  Moon,
  Sparkles
} from 'lucide-react';
import { Page, UserProfile } from '../../types';

interface Props {
  currentPage: Page;
  onNavigate: (page: Page, param?: string) => void;
  currentUser: UserProfile | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
}

export default function Sidebar({
  currentPage,
  onNavigate,
  currentUser,
  theme,
  onToggleTheme,
  onLogout
}: Props) {
  const isAdmin = currentUser?.role === 'ADMIN';

  const navItems: { id: Page; label: string; icon: any; badge?: string }[] = [
    { id: 'home', label: 'Bosh Sahifa', icon: Home },
    { id: 'discover', label: 'Xazina & Katalog', icon: Compass },
    { id: 'author', label: 'Buyuk Allomalar', icon: Users2 },
    { id: 'library', label: 'Mening Javonim', icon: Library },
    { id: 'time', label: 'Sokin Scriptorium', icon: Clock },
    { id: 'challenge', label: 'Adabiy Chempionat', icon: Trophy },
    { id: 'profile', label: 'Kitobxon Pasporti', icon: User },
    ...(isAdmin ? [{ id: 'admin' as Page, label: 'Boshqaruv & 2FA', icon: ShieldCheck, badge: 'Admin' }] : [])
  ];

  return (
    <aside className="w-68 h-screen bg-white/95 dark:bg-[#0A0D14]/95 border-r border-stone-200/90 dark:border-white/10 flex flex-col justify-between p-4 shrink-0 transition-colors z-40">
      
      {/* Brand Header */}
      <div className="space-y-6">
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 px-2 cursor-pointer group select-none"
        >
          <img 
            src="/icon.png" 
            alt="Bookify Logo" 
            className="w-10 h-10 rounded-2xl object-cover shadow-md ring-2 ring-[#C5A059]/20 group-hover:scale-105 transition-transform" 
          />
          <div>
            <h1 className="font-serif font-bold text-lg tracking-tight text-stone-900 dark:text-white group-hover:text-[#E05638] transition-colors">
              Bookify
            </h1>
            <span className="text-[10px] font-mono tracking-widest text-[#C5A059] uppercase block font-semibold">
              Milliy Sanatoriy
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#E05638] text-white shadow-lg shadow-[#E05638]/25 font-bold translate-x-1'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100/80 dark:hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={17} className={isActive ? 'text-white' : 'text-stone-500 dark:text-stone-400'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-[#E05638]/10 text-[#E05638] dark:bg-amber-400/10 dark:text-amber-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile & Dark Mode */}
      <div className="space-y-3 pt-4 border-t border-stone-200/90 dark:border-white/10">
        
        {/* Theme Switcher Button */}
        <button
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-stone-600" />}
            <span>{theme === 'dark' ? "Kunduzgi Rejim" : "Tungi Obsidiyan"}</span>
          </div>
          <span className="text-[10px] font-mono uppercase text-stone-400">
            {theme === 'dark' ? "Light" : "Dark"}
          </span>
        </button>

        {/* User Card */}
        {currentUser ? (
          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-[#121620] border border-stone-200/80 dark:border-white/10 flex items-center justify-between">
            <div 
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2.5 cursor-pointer min-w-0"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E05638] to-[#C5A059] flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="font-serif font-bold text-xs text-stone-900 dark:text-white truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] font-mono text-stone-500 uppercase">
                  {currentUser.role === 'ADMIN' ? '🛡️ Administrator' : '📖 Kitobxon'}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-xl text-stone-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Chiqish"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onNavigate('auth')}
            className="w-full py-2.5 rounded-2xl bg-[#E05638] hover:bg-[#C74326] text-white font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-md cursor-pointer text-center"
          >
            Tizimga Kirish
          </button>
        )}

      </div>

    </aside>
  );
}
