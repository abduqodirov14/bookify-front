import React, { useState, useEffect } from 'react';
import { Search, Bell, ArrowLeft, Menu, Sun, Moon, LogOut, Command, BookOpen, Trophy, CheckCheck, X } from 'lucide-react';
import { UserProfile, Book, Page } from '../../types';

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
  onOpenMobileMenu?: () => void;
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
  onOpenVipModal?: () => void;
  currentPage?: Page;
}

export default function Header({
  onGoBack,
  onOpenMobileMenu,
  canGoBack,
  onOpenSearch,
  currentUser,
  theme,
  onToggleTheme,
  onLogout,
  onNavigateProfile,
  books,
  onOpenBookReader,
  onNavigatePage,
  onOpenVipModal,
  currentPage
}: Props) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const list: AppNotification[] = [];
    if (books && books.length > 0) {
      books.slice(0, 3).forEach((b, idx) => {
        list.push({
          id: `notif-book-${b.id}`,
          title: `Yangi Kitob: ${b.title}`,
          message: `${b.authorName} asari kutubxonaga qo'shildi. Mutolaa qilish uchun bosing.`,
          type: 'book',
          bookId: b.id,
          time: idx === 0 ? 'Hozirgina' : `${(idx + 1) * 10} daqiqa oldin`,
          unread: true
        });
      });
    }
    list.push({
      id: 'notif-tournament',
      title: '🏆 Adabiy Chempionat 2026',
      message: "Yangi adabiy mavsum boshlandi. Ishtirok etish uchun bosing.",
      type: 'challenge',
      time: 'Bugun',
      unread: true
    });
    setNotifications(list);
  }, [books]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleNotificationClick = (notif: AppNotification) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n));
    setShowNotifications(false);
    if (notif.type === 'book' && notif.bookId) {
      onOpenBookReader(notif.bookId);
    } else if (notif.type === 'challenge') {
      onNavigatePage('challenge');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-parchment dark:bg-ink border-b border-black/10 dark:border-white/10 transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="md:hidden p-2 -ml-2 text-ink/70 dark:text-parchment/70 hover:bg-black/5 dark:hover:bg-white/5 rounded-md cursor-pointer"
            >
              <Menu size={20} />
            </button>
          )}

          {canGoBack && (
            <button
              onClick={onGoBack}
              className="hidden sm:flex p-2 items-center justify-center text-ink/70 dark:text-parchment/70 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </button>
          )}

          {/* Minimal Search Bar */}
          <div className="max-w-md w-full hidden sm:block relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-ink/40 dark:text-parchment/40" />
            </div>
            <input
              type="text"
              placeholder="Kitob yoki muallifni izlash..."
              onClick={onOpenSearch}
              readOnly
              className="w-full pl-9 pr-12 py-2 bg-transparent border border-black/10 dark:border-white/10 rounded-md text-sm text-ink dark:text-parchment placeholder-ink/40 dark:placeholder-parchment/40 focus:outline-none focus:border-ink/30 dark:focus:border-parchment/30 transition-colors cursor-pointer"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-black/10 dark:border-white/10">
                <Command size={10} className="text-ink/40 dark:text-parchment/40" />
                <span className="text-[10px] font-mono text-ink/40 dark:text-parchment/40">K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center justify-end gap-2 sm:gap-4 flex-1">
          
          <button
            onClick={onOpenSearch}
            className="sm:hidden p-2 text-ink/70 dark:text-parchment/70 cursor-pointer"
          >
            <Search size={20} />
          </button>

          {/* Theme Toggle (Mobile only, Desktop is in Sidebar) */}
          <button
            onClick={onToggleTheme}
            className="md:hidden p-2 text-ink/70 dark:text-parchment/70 cursor-pointer"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 relative text-ink/70 dark:text-parchment/70 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors cursor-pointer"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-ember rounded-full"></span>
              )}
            </button>

            {/* Notifications Dropdown (Flat, no shadow, just border) */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-parchment dark:bg-ink border border-black/10 dark:border-white/10 rounded-md z-50">
                <div className="flex items-center justify-between p-3 border-b border-black/10 dark:border-white/10">
                  <span className="font-bold text-sm text-ink dark:text-parchment">Xabarnomalar</span>
                  <button 
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                    className="text-[11px] font-mono text-ink/60 dark:text-parchment/60 hover:text-ink dark:hover:text-parchment cursor-pointer"
                  >
                    Barchasini o'qilgan qilish
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(notif => (
                    <div 
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3 border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors ${notif.unread ? 'bg-black/5 dark:bg-white/5' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {notif.type === 'book' ? <BookOpen size={16} className="text-ink/60 dark:text-parchment/60" /> : <Trophy size={16} className="text-ember" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-[13px] font-bold text-ink dark:text-parchment mb-0.5">{notif.title}</h4>
                          <p className="text-[11px] text-ink/70 dark:text-parchment/70 leading-relaxed mb-1">{notif.message}</p>
                          <span className="text-[10px] font-mono text-ink/40 dark:text-parchment/40">{notif.time}</span>
                        </div>
                        {notif.unread && (
                          <div className="w-1.5 h-1.5 bg-ember rounded-full mt-1.5"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile / Auth Button */}
          {currentUser ? (
            <div className="flex items-center gap-3 border-l border-black/10 dark:border-white/10 pl-3 sm:pl-4">
              {currentUser.is_premium && (
                <span className="hidden sm:flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-sm text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  <CheckCheck size={12} /> VIP
                </span>
              )}
              <button
                onClick={onNavigateProfile}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              >
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10 object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 flex items-center justify-center">
                    <span className="font-bold text-sm text-ink dark:text-parchment">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigatePage('auth')}
              className="ml-2 px-4 py-2 bg-ink dark:bg-parchment text-parchment dark:text-ink text-xs font-bold rounded-sm uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
            >
              Kirish
            </button>
          )}

        </div>
      </div>
    </header>
  );
}