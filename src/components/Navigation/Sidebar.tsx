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
  Layers,
  X
} from 'lucide-react';
import { Page, UserProfile } from '../../types';

interface Props {
  currentPage: Page;
  onNavigate: (page: Page, param?: string) => void;
  currentUser: UserProfile | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  currentPage,
  onNavigate,
  currentUser,
  theme,
  onToggleTheme,
  onLogout,
  isMobileOpen = false,
  onCloseMobile
}: Props) {
  const isAdmin = currentUser?.role === 'ADMIN';

  const navItems: { id: Page; label: string; icon: any; badge?: string }[] = [
    { id: 'home', label: 'Bosh Sahifa', icon: Home },
    { id: 'discover', label: 'Xazina & Katalog', icon: Compass },
    { id: 'author', label: 'Buyuk Allomalar', icon: Users2 },
    { id: 'library', label: 'Mening Javonim', icon: Library },
    { id: 'time', label: 'Sokin Mutolaa', icon: Clock },
    { id: 'challenge', label: 'Adabiy Chempionat', icon: Trophy },
    { id: 'vision' as Page, label: 'Kelajak & Rejalar', icon: Layers },
    { id: 'profile', label: 'Kitobxon Pasporti', icon: User },
    ...(isAdmin ? [{ id: 'admin' as Page, label: 'Boshqaruv & 2FA', icon: ShieldCheck, badge: 'Admin' }] : [])
  ];

  const handleNav = (id: Page) => {
    onNavigate(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const content = (
    <div className="w-60 lg:w-64 h-full bg-white dark:bg-[#0A0D14] border-r border-stone-200/90 dark:border-white/10 flex flex-col justify-between p-4 transition-colors">
      
      {/* Brand Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div 
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
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
                Elektron Kutubxona
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
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

      {/* Footer User Info & Theme */}
      <div className="pt-4 border-t border-stone-200/90 dark:border-white/10 space-y-3">
        {currentUser ? (
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-stone-50 dark:bg-white/[0.03] border border-stone-100 dark:border-white/5">
            <div 
              onClick={() => handleNav('profile')}
              className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E05638] to-[#C5A059] flex items-center justify-center text-white font-serif font-bold text-xs shrink-0 shadow-xs">
                {currentUser.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-serif font-bold text-xs text-stone-900 dark:text-white truncate block">
                  {currentUser.name}
                </span>
                <span className="text-[10px] font-mono text-stone-400 block truncate">
                  {currentUser.email}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0 ml-1"
              title="Chiqish"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleNav('auth')}
            className="w-full py-3 rounded-2xl bg-[#E05638] hover:bg-[#C74326] text-white font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Tizimga Kirish
          </button>
        )}

        <div className="flex items-center justify-between px-2 pt-1 text-[11px] font-mono text-stone-400">
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <Sun size={13} className="text-amber-400" />
                <span>Yorug' Mavzu</span>
              </>
            ) : (
              <>
                <Moon size={13} className="text-amber-600" />
                <span>Tungi Obsidiyan</span>
              </>
            )}
          </button>
          <span className="text-[9px] opacity-60">v2.0.0</span>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (Hidden on Mobile) */}
      <aside className="hidden md:flex shrink-0 h-screen z-40">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-300 h-full">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
