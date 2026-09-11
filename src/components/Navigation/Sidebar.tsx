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
  X,
  HeartHandshake
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
  onOpenVipModal?: () => void;
}

export default function Sidebar({
  currentPage,
  onNavigate,
  currentUser,
  theme,
  onToggleTheme,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
  onOpenVipModal
}: Props) {
  const isAdmin = currentUser?.role === 'ADMIN';
  const isVolunteer = Boolean(
    currentUser?.is_volunteer || 
    currentUser?.role === 'VOLUNTEER' || 
    currentUser?.volunteer_code
  );

  const navItems: { id: Page; label: string; icon: any; badge?: string }[] = [
    { id: 'home', label: 'Bosh Sahifa', icon: Home },
    { id: 'discover', label: 'Katalog', icon: Compass },
    { id: 'author', label: 'Buyuk Allomalar', icon: Users2 },
    { id: 'library', label: 'Mening Javonim', icon: Library },
    ...(isVolunteer || isAdmin ? [{ id: 'volunteer' as Page, label: 'Volontyorlik', icon: HeartHandshake, badge: 'VIP' }] : []),
    { id: 'time', label: 'Sokin Mutolaa', icon: Clock },
    { id: 'challenge', label: 'Adabiy Chempionat', icon: Trophy },
    { id: 'profile', label: 'Shaxsiy Profil', icon: User },
    ...(isAdmin ? [{ id: 'admin' as Page, label: 'Boshqaruv & 2FA', icon: ShieldCheck, badge: 'Admin' }] : [])
  ];

  const handleNav = (id: Page) => {
    onNavigate(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const content = (
    <div className="w-60 lg:w-64 h-full bg-parchment dark:bg-ink border-r border-black/10 dark:border-white/10 flex flex-col justify-between p-4 transition-colors">
      
      {/* Brand Header */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-2 pt-2">
          <div 
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-8 h-8 bg-ink dark:bg-parchment rounded-sm flex items-center justify-center">
              <span className="font-serif font-bold text-parchment dark:text-ink text-xl leading-none pt-1">B</span>
            </div>
            <div>
              <h1 className="font-serif font-bold text-xl tracking-tight text-ink dark:text-parchment">
                Bookify
              </h1>
            </div>
          </div>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-2 text-ink/50 hover:text-ink dark:text-parchment/50 dark:hover:text-parchment cursor-pointer"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md transition-all cursor-pointer group ` + 
                  (isActive 
                    ? `bg-black/5 dark:bg-white/10 text-ink dark:text-parchment font-semibold` 
                    : `text-ink/60 dark:text-parchment/60 hover:bg-black/5 dark:hover:bg-white/5 hover:text-ink dark:hover:text-parchment font-medium`
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon 
                    size={18} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={isActive ? "text-ember" : "text-ink/40 dark:text-parchment/40 group-hover:text-ink dark:group-hover:text-parchment"} 
                  />
                  <span className="text-[13px] tracking-wide">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-mono font-bold bg-black/10 dark:bg-white/10 text-ink/70 dark:text-parchment/70 uppercase">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Area */}
      <div className="space-y-4">
        {/* Flat VIP Subscription Box */}
        {(!currentUser?.is_premium) && (
          <div className="p-4 border border-black/10 dark:border-white/10 rounded-lg bg-parchment-dim dark:bg-ink-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-ink dark:text-parchment">
                Bookify VIP
              </span>
              <span className="text-base">👑</span>
            </div>
            <p className="text-[11px] leading-tight text-ink/70 dark:text-parchment/70 mb-3">
              Cheksiz audiokitoblar va VIP asarlar uchun obuna bo'ling.
            </p>
            <button 
              onClick={onOpenVipModal}
              className="w-full py-2 bg-ink dark:bg-parchment text-parchment dark:text-ink text-[11px] font-bold uppercase tracking-wider rounded-sm hover:opacity-90 transition-opacity cursor-pointer"
            >
              29 000 so'm/oy
            </button>
          </div>
        )}

        <div className="border-t border-black/10 dark:border-white/10 pt-4 flex flex-col gap-2">
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-ink/60 dark:text-parchment/60 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === 'dark' ? 'Yorug` rejim' : 'Qorong`i rejim'}</span>
          </button>

          {currentUser ? (
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-ember/80 hover:text-ember hover:bg-ember/10 rounded-md transition-colors cursor-pointer"
            >
              <LogOut size={16} />
              <span>Tizimdan chiqish</span>
            </button>
          ) : (
            <button
              onClick={() => handleNav('auth')}
              className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-ink dark:text-parchment hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors cursor-pointer"
            >
              <User size={16} />
              <span>Kirish / Ro'yxatdan o'tish</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block h-full z-30 shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 h-full w-60 transform transition-transform duration-300">
            {content}
          </div>
        </div>
      )}
    </>
  );
}