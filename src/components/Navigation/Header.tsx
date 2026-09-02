import React, { useState, useEffect } from 'react';
import { Search, Bell, ArrowLeft, Sun, Moon, LogOut, Command, Sparkles, BookOpen, Trophy, CheckCheck, X } from 'lucide-react';
import { UserProfile, Book } from '../../types';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'book' | 'challenge' | 'system';
  bookId?: string;
  time: string;
  unread: boolean;
}

interface Props {
  onGoBack: () => void;
  canGoBack: boolean;
  onOpenSearch: () => void;
  currentUser: UserProfile | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
  onNavigateProfile: () => void;
  books: Book[];
  onOpenBookReader: (bookId: string) => void;
  onNavigatePage: (page: any) => void;
}

export default function Header({
  onGoBack,
  canGoBack,
  onOpenSearch,
  currentUser,
  theme,
  onToggleTheme,
  onLogout,
  onNavigateProfile,
  books,
  onOpenBookReader,
  onNavigatePage
}: Props) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Generate dynamic notifications based on real books in PostgreSQL
  useEffect(() => {
    const list: AppNotification[] = [];

    // Latest book notifications
    if (books && books.length > 0) {
      books.slice(0, 3).forEach((b, idx) => {
        list.push({
          id: `notif-book-${b.id}`,
          title: `Yangi Asar: ${b.title}`,
          message: `${b.authorName} qalamiga mansub durdona asar kutubxonaga qo'shildi. Mutolaa qilish uchun bosing!`,
          type: 'book',
          bookId: b.id,
          time: idx === 0 ? 'Hozirgina' : `${(idx + 1) * 10} daqiqa oldin`,
          unread: true
        });
      });
    }

    // Active tournament notification
    list.push({
      id: 'notif-tournament',
      title: '🏆 Bahoriy Adabiy Chempionat 2026',
      message: "15,000,000 UZS mukofot jamg'armasi bilan yangi adabiy mavsum boshlandi. Ishtirok etish uchun bosing!",
      type: 'challenge',
      time: 'Bugun',
      unread: true
    });

    setNotifications(list);
  }, [books]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleNotificationClick = (notif: AppNotification) => {
    // Mark as read
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n));
    setShowNotifications(false);

    if (notif.type === 'book' && notif.bookId) {
      onOpenBookReader(notif.bookId);
    } else if (notif.type === 'challenge') {
      onNavigatePage('challenge');
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  return (
    <header className="h-16 px-6 lg:px-8 flex items-center justify-between border-b border-stone-200/90 dark:border-white/10 bg-white/90 dark:bg-[#0A0D14]/90 backdrop-blur-md shrink-0 z-30 transition-colors">
      
      <div className="flex items-center gap-3">
        {/* Back Button */}
        <button
          onClick={onGoBack}
          disabled={!canGoBack}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
            canGoBack 
              ? 'bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/20 text-stone-800 dark:text-stone-200' 
              : 'opacity-30 cursor-not-allowed text-stone-400'
          }`}
          title="Orqaga"
        >
          <ArrowLeft size={16} />
        </button>

        {/* Spotlight Search Pill (Cmd+K) */}
        <div
          onClick={onOpenSearch}
          className="flex items-center gap-3 w-80 sm:w-96 px-3.5 py-2 rounded-xl bg-stone-100/90 dark:bg-white/[0.05] border border-stone-200 dark:border-white/10 hover:border-stone-300 dark:hover:border-white/20 transition-colors cursor-pointer group shadow-2xs"
        >
          <Search size={15} className="text-stone-400 group-hover:text-[#E05638] transition-colors" />
          <span className="flex-1 text-xs text-stone-500 dark:text-stone-400">
            Durdona asarlar, allomalar yoki audio...
          </span>
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white dark:bg-white/10 border border-stone-200 text-[10px] font-mono text-stone-500">
            <Command size={10} />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        
        {/* Dark/Light Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-white/20 transition-colors cursor-pointer"
          title="Mavzuni o'zgartirish"
        >
          {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-amber-600" />}
        </button>

        {/* Real Dynamic Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-white/20 transition-colors cursor-pointer relative"
            title="Xabarnomalar"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E05638] text-white text-[10px] font-bold font-mono flex items-center justify-center animate-pulse shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-84 sm:w-96 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200 dark:border-white/10 shadow-2xl p-4 space-y-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-serif font-bold text-stone-900 dark:text-white">Xabarnomalar</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#E05638]/10 text-[#E05638] text-[10px] font-mono font-bold">
                      {unreadCount} ta yangi
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] text-stone-500 hover:text-[#E05638] font-mono cursor-pointer flex items-center gap-1"
                  >
                    <CheckCheck size={12} />
                    <span>O'qilgan deb belgilash</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 pr-1 divide-y divide-stone-100 dark:divide-white/5">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all ${
                      n.unread 
                        ? 'bg-[#E05638]/5 dark:bg-[#E05638]/10 hover:bg-[#E05638]/15 border border-[#E05638]/20' 
                        : 'hover:bg-stone-50 dark:hover:bg-white/5 opacity-80'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        n.type === 'book' 
                          ? 'bg-amber-500/10 text-amber-600' 
                          : 'bg-[#E05638]/10 text-[#E05638]'
                      }`}>
                        {n.type === 'book' ? <BookOpen size={15} /> : <Trophy size={15} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-serif font-bold text-xs text-stone-900 dark:text-white truncate">
                            {n.title}
                          </h4>
                          <span className="text-[10px] text-stone-400 font-mono shrink-0">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-[#E05638] font-semibold font-mono mt-1 inline-block">
                          {n.type === 'book' ? "📖 O'qishni boshlash →" : "🏆 Chempionatga o'tish →"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Pill & Log Out */}
        <div 
          onClick={onNavigateProfile}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-white/10 border border-stone-200 dark:border-white/10 cursor-pointer hover:bg-stone-200 dark:hover:bg-white/20 transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-[#E05638] text-white font-bold text-[10px] flex items-center justify-center">
            {currentUser?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <span className="text-xs font-medium text-stone-800 dark:text-stone-200 hidden sm:inline">
            {currentUser?.name || 'Administrator'}
          </span>
        </div>

        <button
          onClick={onLogout}
          className="p-2 rounded-xl bg-stone-100 dark:bg-white/10 text-stone-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
          title="Tizimdan Chiqish"
        >
          <LogOut size={16} />
        </button>

      </div>

    </header>
  );
}
