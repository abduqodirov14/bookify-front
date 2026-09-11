'use client';

import React, { useState, useEffect } from 'react';
import { Page, Book, Author, AudioTrack, UserProfile } from '../types';
import { AUTHORS } from '../data/authors';
import { api, getAuthToken, clearAuthToken, getCachedUser, setCachedUser } from '../services/api';

import Sidebar from '../components/Navigation/Sidebar';
import Header from '../components/Navigation/Header';
import AudioDock from '../components/Audio/AudioDock';
import BookSpread from '../components/Reader/BookSpread';
import AuthorDetail from '../components/Authors/AuthorDetail';
import ReaderPassport from '../components/Profile/ReaderPassport';
import ZenScriptorium from '../components/Focus/ZenScriptorium';
import LeaderboardPodium from '../components/Challenge/LeaderboardPodium';
import DiscoverCatalog from '../components/Discover/DiscoverCatalog';
import AdminPanel from '../components/Admin/AdminPanel';
import LibraryView from '../components/Library/LibraryView';
import AuthModal from '../components/Auth/AuthModal';
import BookReviewsSection from '../components/Comments/BookReviewsSection';
import ComingSoonSection from '../components/Future/ComingSoonSection';
import VerifyCertificatePage from '../components/Certificate/VerifyCertificatePage';
import VolunteerPortal from '../components/Volunteer/VolunteerPortal';
import BookPaywallModal from '../components/Payment/BookPaywallModal';

import { 
  BookOpen, Headphones, ArrowRight, Quote, Search, X, Trophy, UploadCloud,
  Sparkles, ShieldCheck, Bookmark, Flame, Compass, ChevronRight, CheckCircle2, Award, Star, Library, Users, Smartphone, Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function HomeApp() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [history, setHistory] = useState<Page[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>('abdulla-qodiriy');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeAudioTrack, setActiveAudioTrack] = useState<AudioTrack | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [booksList, setBooksList] = useState<Book[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [pendingBookToOpen, setPendingBookToOpen] = useState<string | null>(null);
  const [verifyCertSerial, setVerifyCertSerial] = useState<string>('');
  const [authInitialized, setAuthInitialized] = useState(false);
  const [paywallBook, setPaywallBook] = useState<Book | null>(null);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);

  // Check existing session on mount (Hydration safe) & pre-warm backend
  useEffect(() => {
    // Pre-warm backend immediately
    try {
      fetch('https://3-68-191-39.sslip.io/health', { mode: 'no-cors' }).catch(() => {});
    } catch {}

    const cached = getCachedUser();
    if (cached) {
      setCurrentUser({
        id: cached.id,
        name: cached.name || cached.email?.split('@')[0] || 'Kitobxon',
        email: cached.email || '',
        role: cached.role === 'ADMIN' ? 'ADMIN' : cached.role === 'VOLUNTEER' ? 'VOLUNTEER' : 'USER',
        avatarUrl: cached.avatar_url || cached.avatarUrl || '',
        dailyGoalMinutes: 40,
        todayMinutes: 40,
        readingStreakDays: 1,
        totalHours: cached.total_hours || 0,
        finishedBooksCount: cached.finished_books_count || 0,
        is2FAEnabled: cached.is_2fa_enabled ?? (cached.role === 'ADMIN'),
        volunteer_code: cached.volunteer_code,
        volunteer_title: cached.volunteer_title,
        volunteer_hours: cached.volunteer_hours || 0,
        is_volunteer: cached.is_volunteer || (cached.role === 'VOLUNTEER') || Boolean(cached.volunteer_code),
        is_premium: Boolean(cached.is_premium),
        premium_until: cached.premium_until
      });
    }

    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const me = await api.getMe();
          if (me) {
            setCurrentUser({
              id: me.id,
              name: me.name || me.email?.split('@')[0] || 'Kitobxon',
              email: me.email || '',
              role: me.role === 'ADMIN' ? 'ADMIN' : me.role === 'VOLUNTEER' ? 'VOLUNTEER' : 'USER',
              avatarUrl: me.avatar_url || me.avatarUrl || '',
              dailyGoalMinutes: 40,
              todayMinutes: 40,
              readingStreakDays: 1,
              totalHours: me.total_hours || 0,
              finishedBooksCount: me.finished_books_count || 0,
              is2FAEnabled: me.is_2fa_enabled ?? (me.role === 'ADMIN'),
              volunteer_code: me.volunteer_code,
              volunteer_title: me.volunteer_title,
              volunteer_hours: me.volunteer_hours || 0,
              is_volunteer: me.is_volunteer || (me.role === 'VOLUNTEER') || Boolean(me.volunteer_code),
              is_premium: Boolean(me.is_premium),
              premium_until: me.premium_until
            });
            setCachedUser(me);
          }
        } catch {
          // Token expired or network error
        }
      }
      setAuthInitialized(true);
    };
    initAuth();
  }, []);

  // Security Route Guard: Silent redirect away from admin or volunteer ONLY AFTER auth is fully initialized
  useEffect(() => {
    if (authInitialized && currentPage === 'admin' && currentUser?.role !== 'ADMIN') {
      setCurrentPage('home');
    }
    const isVolunteerUser = Boolean(
      currentUser?.is_volunteer || 
      currentUser?.role === 'VOLUNTEER' || 
      currentUser?.volunteer_code ||
      currentUser?.role === 'ADMIN'
    );
    if (authInitialized && currentPage === 'volunteer' && !isVolunteerUser) {
      setCurrentPage('home');
    }
  }, [currentPage, currentUser, authInitialized]);

  // Refresh books whenever entering Admin panel
  useEffect(() => {
    if (currentPage === 'admin') {
      loadBooksFromBackend();
    }
  }, [currentPage]);

  // Fetch real books from FastAPI backend (Fast direct mapping & local caching)
  const loadBooksFromBackend = async () => {
    try {
      const data = await api.getBooks(true);
      if (Array.isArray(data) && data.length > 0) {
        const formatted: Book[] = data.map((b: any) => ({
          id: String(b.id),
          title: b.title,
          authorId: b.author ? b.author.toLowerCase().replace(/\s+/g, '-').replace(/['`]/g, '') : 'abdulla-qodiriy',
          authorName: b.author || b.author_name || 'Abdulla Qodiriy',
          category: b.category || 'Mumtoz Meros',
          coverImage: b.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
          spineColor: '#8B2500',
          description: b.description || `${b.title} — sara milliy asar.`,
          publishedYear: b.year || 1925,
          pages: b.pages || 350,
          audioDuration: b.audio_duration || '',
          rating: 5.0,
          reviewsCount: 1,
          narrator: b.narrator || 'Afzal Rafiqov',
          featuredQuote: "Moziyga qaytib ish ko'rmak xayrlidir...",
          status: b.status || 'PUBLISHED',
          is_premium: b.is_premium || false,
          price: b.price || 0,
          chapters: [
            {
              id: `c1-${b.id}`,
              number: 1,
              title: `1-Bob: ${b.title}`,
              content: b.description || `${b.title} asari mutolaaga tayyor.`
            }
          ]
        }));

        setBooksList(formatted);
        if (typeof window !== 'undefined') {
          localStorage.setItem('bookify_cached_books', JSON.stringify(formatted));
        }
        if (!selectedBookId && formatted.length > 0) {
          setSelectedBookId(formatted[0].id);
        }
      }
    } catch (e) {
      console.error("Backend books fetch error:", e);
      // If network fails (e.g. Render cold boot), restore from localStorage cache
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('bookify_cached_books');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setBooksList(parsed);
              if (!selectedBookId) setSelectedBookId(parsed[0].id);
            }
          } catch {}
        }
      }
    } finally {
      setIsLoadingBooks(false);
    }
  };

  useEffect(() => {
    // 1. Immediately restore cached books so screen is NEVER empty on refresh
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('bookify_cached_books');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setBooksList(parsed);
            setSelectedBookId(parsed[0].id);
            setIsLoadingBooks(false);
          }
        }
      } catch {}
    }
    // 2. Refresh from backend
    loadBooksFromBackend();
  }, []);

  // URL routing synchronization (load & popstate)
  useEffect(() => {
    const parseUrlParams = () => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view') as Page;
      const authorId = params.get('author');
      const bookId = params.get('book');
      const certParam = params.get('cert') || (window.location.pathname.startsWith('/verify/') ? window.location.pathname.replace('/verify/', '') : '');

      // Handle payment return callback
      const paymentStatus = params.get('payment');
      const orderId = params.get('order_id');
      const targetBookId = params.get('bookId');
      if (paymentStatus === 'success') {
        const cleanUrl = window.location.pathname + (view ? `?view=${view}` : '');
        window.history.replaceState({}, '', cleanUrl || '/');

        toast.success("To'lovingiz muvaffaqiyatli qabul qilindi! VIP obuna faollashtirildi! 🎉", {
          duration: 6000,
          icon: '👑'
        });

        // Sync fresh profile from backend to verify VIP status
        if (orderId) {
          api.verifyPaymentStatus(orderId).catch(() => {});
        }
        api.getMe().then(me => {
          if (me) {
            setCurrentUser(prev => prev ? ({
              ...prev,
              is_premium: Boolean(me.is_premium),
              premium_until: me.premium_until
            }) : null);
            setCachedUser(me);
          }
        }).catch(() => {});

        if (targetBookId) {
          handleOpenReader(targetBookId);
          return;
        }
      }

      if (view === 'verify' || window.location.pathname.startsWith('/verify')) {
        if (certParam) setVerifyCertSerial(certParam);
        setCurrentPage('verify');
        return;
      }

      if (view) {
        if (view === 'auth' && getAuthToken()) {
          const cached = getCachedUser();
          setCurrentPage(cached?.role === 'ADMIN' ? 'admin' : 'home');
          return;
        }
        if (view === 'author' && authorId) setSelectedAuthorId(authorId);
        if ((view === 'reader' || view === 'book') && bookId) setSelectedBookId(bookId);
        setCurrentPage(view);
      } else {
        setCurrentPage('home');
      }
    };

    parseUrlParams();
    window.addEventListener('popstate', parseUrlParams);
    return () => window.removeEventListener('popstate', parseUrlParams);
  }, []);

  // Handle Dark / Light Mode HTML class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Global Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigate = (page: Page, param?: string) => {
    if (page === 'admin' && currentUser?.role !== 'ADMIN') {
      toast.error("Boshqaruv paneliga kirish uchun administrator huquqi talab qilinadi!");
      navigate('auth');
      return;
    }

    if (page === 'profile' && !currentUser) {
      navigate('auth');
      return;
    }

    setHistory(prev => [...prev, currentPage]);
    if (page === 'author' && param) {
      setSelectedAuthorId(param);
    }
    if ((page === 'reader' || page === 'book') && param) {
      setSelectedBookId(param);
    }
    if (page === 'verify' && param) {
      setVerifyCertSerial(param);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (typeof window !== 'undefined') {
      let url = '/';
      if (page !== 'home') {
        const p = new URLSearchParams();
        p.set('view', page);
        if (page === 'author' && (param || selectedAuthorId)) p.set('author', param || selectedAuthorId);
        if ((page === 'reader' || page === 'book') && (param || selectedBookId)) p.set('book', param || selectedBookId);
        if (page === 'verify' && (param || verifyCertSerial)) p.set('cert', param || verifyCertSerial);
        url = `/?${p.toString()}`;
      }
      window.history.pushState({ page, param }, '', url);
    }
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(prevHist => prevHist.slice(0, -1));
      setCurrentPage(prev);
    } else {
      setCurrentPage('home');
    }
  };

  const handleOpenReader = async (bookId: string) => {
    if (!currentUser) {
      setPendingBookToOpen(bookId);
      toast.error("Mutolaani boshlash uchun iltimos, avval tizimga kiring!");
      setCurrentPage('auth');
      return;
    }

    const targetBook = booksList.find(b => String(b.id) === String(bookId));
    const isPremium = Boolean(targetBook && (targetBook.is_premium || (targetBook as any).is_premium));

    if (isPremium) {
      // 1. VIP subscribers have unrestricted access to all books
      if (currentUser.is_premium) {
        setSelectedBookId(bookId);
        setCurrentPage('reader');
        return;
      }

      // 2. Administrators have direct access
      if (currentUser.role === 'ADMIN') {
        setSelectedBookId(bookId);
        setCurrentPage('reader');
        return;
      }

      // 3. Check individual book purchase or active subscription from server
      try {
        const access = await api.checkBookAccess(bookId);
        if (access && access.has_access) {
          setSelectedBookId(bookId);
          setCurrentPage('reader');
          return;
        }
      } catch {}

      // 4. Otherwise, book is locked — open luxury paywall modal
      if (targetBook) {
        setPaywallBook(targetBook);
        return;
      }
    }

    setSelectedBookId(bookId);
    setCurrentPage('reader');
  };

  const handleBuyBook = (book: Book) => {
    if (!currentUser) {
      toast.error("Kitobni xarid qilish uchun iltimos, avval tizimga kiring!");
      setCurrentPage('auth');
      return;
    }
    setPaywallBook(book);
  };

  const handlePlayAudio = (book: Book) => {
    if (!currentUser) {
      toast.error("Audio spektaklni tinglash uchun iltimos, avval tizimga kiring!");
      setCurrentPage('auth');
      return;
    }
    playAudio(book);
  };

  const playAudio = async (book: Book) => {
    let tracks = book.audioTracks || [];
    if (!tracks || tracks.length === 0) {
      try {
        tracks = await api.getBookAudioTracks(book.id);
      } catch (e) {
        tracks = [];
      }
    }

    const firstTrack = tracks.length > 0 ? tracks[0] : null;
    const resolvedUrl = firstTrack?.audioUrl || (firstTrack as any)?.audio_url || '';

    setActiveAudioTrack({
      bookId: book.id,
      title: book.title,
      author: book.authorName,
      coverImage: book.coverImage,
      chapterTitle: firstTrack ? firstTrack.title : (book.chapters[0]?.title || "1-Bob"),
      duration: firstTrack && (firstTrack.durationSeconds || (firstTrack as any)?.duration_seconds) > 0 
        ? `${Math.floor((firstTrack.durationSeconds || (firstTrack as any)?.duration_seconds) / 60)} daqiqa` 
        : book.audioDuration,
      isPlaying: Boolean(resolvedUrl),
      currentTime: 0,
      playbackRate: 1.0,
      audioUrl: resolvedUrl,
      narrator: firstTrack?.narrator || book.narrator || 'Afzal Rafiqov',
      trackList: tracks,
      currentTrackIndex: 0
    });

    if (resolvedUrl) {
      toast.success(`"${book.title}" audio spektakli tinglanmoqda`, { icon: '🎧' });
    } else {
      toast("Ushbu asar uchun hozircha audio trek yuklanmagan. Boshqaruv panelidan yangi audio yuklashingiz mumkin.", { icon: 'ℹ️', duration: 4500 });
    }
  };

  const publishedBooks = booksList.filter(b => !b.status || b.status === 'PUBLISHED');
  const selectedBook = booksList.find(b => b.id === selectedBookId) || publishedBooks[0] || booksList[0];
  const selectedAuthor = AUTHORS.find(a => a.id === selectedAuthorId) || AUTHORS[0];
  const featuredBook = publishedBooks[0] || booksList[0];

  // Full Screen Reader View
  if (currentPage === 'reader' && selectedBook) {
    return (
      <div className="relative min-h-screen">
        <BookSpread
          book={selectedBook}
          onBack={goBack}
          onPlayAudio={() => playAudio(selectedBook)}
          isAudioActive={Boolean(activeAudioTrack && activeAudioTrack.bookId === selectedBook.id)}
        />
        {activeAudioTrack && (
          <AudioDock
            track={activeAudioTrack}
            onClose={() => setActiveAudioTrack(null)}
            onOpenReader={(bookId) => {
              handleOpenReader(bookId);
            }}
          />
        )}
      </div>
    );
  }

  // Auth View
  if (currentPage === 'auth') {
    return (
      <AuthModal
        onSuccess={(user) => {
          setCachedUser(user);
          setCurrentUser({
            id: user.id || "u-1",
            name: user.name || user.email?.split('@')[0] || "Kitobxon",
            email: user.email,
            role: user.role === 'ADMIN' ? 'ADMIN' : user.role === 'VOLUNTEER' ? 'VOLUNTEER' : 'USER',
            avatarUrl: user.avatar_url || user.avatarUrl || '',
            dailyGoalMinutes: 40,
            todayMinutes: 40,
            readingStreakDays: 1,
            totalHours: user.total_hours || 0,
            finishedBooksCount: user.finished_books_count || 0,
            is2FAEnabled: user.is_2fa_enabled ?? (user.role === 'ADMIN'),
            volunteer_code: user.volunteer_code,
            volunteer_title: user.volunteer_title,
            volunteer_hours: user.volunteer_hours || 0,
            is_volunteer: user.is_volunteer || (user.role === 'VOLUNTEER') || Boolean(user.volunteer_code),
            is_premium: Boolean(user.is_premium),
            premium_until: user.premium_until
          });

          if (pendingBookToOpen) {
            const bId = pendingBookToOpen;
            setPendingBookToOpen(null);
            handleOpenReader(bId);
          } else {
            // Restore any pending payment action saved before login
            let hasPendingPay = false;
            if (typeof window !== 'undefined') {
              try {
                const rawPending = localStorage.getItem('bookify_pending_pay');
                if (rawPending) {
                  localStorage.removeItem('bookify_pending_pay');
                  const parsed = JSON.parse(rawPending);
                  if (parsed.bookId) {
                    const found = booksList.find(b => String(b.id) === String(parsed.bookId));
                    if (found) {
                      setPaywallBook(found);
                      hasPendingPay = true;
                    }
                  } else if (parsed.planType) {
                    setIsVipModalOpen(true);
                    hasPendingPay = true;
                  }
                }
              } catch {}
            }

            if (!hasPendingPay) {
              navigate(user.role === 'ADMIN' ? 'admin' : 'home');
            } else {
              setCurrentPage('home');
            }
          }
        }}
        onCancel={() => setCurrentPage('home')}
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#080B0F] text-stone-900 dark:text-stone-100 transition-colors duration-300">
      
      {/* ── Left Fixed Sidebar (Desktop + Mobile Drawer) ── */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(p, param) => {
          navigate(p, param);
          setIsMobileMenuOpen(false);
        }}
        currentUser={currentUser}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onLogout={() => {
          clearAuthToken();
          setCurrentUser(null);
          setCurrentPage('auth');
          toast.success("Tizimdan muvaffaqiyatli chiqildi!");
        }}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenVipModal={() => setIsVipModalOpen(true)}
      />

      {/* ── Center / Right Main Canvas ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        <Header
          onGoBack={goBack}
          canGoBack={history.length > 0}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          currentUser={currentUser}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onLogout={() => {
            clearAuthToken();
            setCurrentUser(null);
            setCurrentPage('auth');
            toast.success("Tizimdan chiqildi!");
          }}
          onNavigateProfile={() => navigate('profile')}
          books={booksList}
          onOpenBookReader={(bookId) => {
            handleOpenReader(bookId);
          }}
          onNavigatePage={(p) => navigate(p)}
          onOpenVipModal={() => setIsVipModalOpen(true)}
          currentPage={currentPage}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 transition-colors pb-24 sm:pb-8">
          
                    {/* 1. HOME VIEW */}
          {currentPage === 'home' && (
            <div className="max-w-7xl mx-auto space-y-20 pb-28 animate-in fade-in duration-300">
              
              {/* ── 1. SPOTLIGHT GRAND HERO SHOWCASE ── */}
              {featuredBook && (
                <div className="relative rounded-3xl p-8 sm:p-12 lg:p-16 bg-gradient-to-tr from-[#FAF6EE] via-white to-[#F5EFE0] dark:from-[#121620] dark:via-[#0E1218] dark:to-[#0A0D14] border border-stone-200/90 dark:border-white/10 shadow-xl overflow-hidden">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#E05638]/10 via-[#C5A059]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                    
                    <div className="space-y-6 flex-1 text-center lg:text-left">
                      {(() => {
                        const isFeaturedPremium = Boolean(featuredBook && (featuredBook.is_premium || (featuredBook as any).is_premium));
                        const featPrice = (featuredBook as any).price || 15000;
                        return (
                          <>
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                              {isFeaturedPremium ? (
                                <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                                  <span>💎</span>
                                  <span>VIP ASAR • {new Intl.NumberFormat('uz-UZ').format(featPrice)} SO'M</span>
                                </span>
                              ) : (
                                <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-[#E05638]/10 text-[#E05638] dark:text-amber-400 border border-[#E05638]/20 flex items-center gap-1">
                                  <Sparkles size={12} />
                                  <span>Bosh Muharrir Tanlovi</span>
                                </span>
                              )}
                              <span className="px-3 py-1 rounded-full text-xs font-mono bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-300">
                                📖 {featuredBook.pages} sahifa {featuredBook.audioDuration ? `• 🎧 ${featuredBook.audioDuration}` : `• ⏱ ~${Math.max(1, Math.round((featuredBook.pages || 100) * 1.5 / 60))} soat`}
                              </span>
                            </div>

                            <div className="space-y-2">
                              <span className="text-xs font-mono text-[#E05638] uppercase font-bold tracking-widest block">
                                {featuredBook.category || 'Mumtoz Meros'}
                              </span>
                              <h1 className="font-serif text-4xl sm:text-6xl font-bold text-stone-950 dark:text-white tracking-tight leading-[1.1]">
                                {featuredBook.title}
                              </h1>
                              <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 font-medium">
                                Muallif: <span className="text-stone-900 dark:text-white font-bold">{featuredBook.authorName}</span>
                              </p>
                            </div>

                            <p className="font-serif italic text-stone-600 dark:text-stone-300 text-base sm:text-lg max-w-xl leading-relaxed border-l-2 border-[#E05638]/40 pl-4">
                              "{featuredBook.featuredQuote}"
                            </p>

                            <p className="text-xs sm:text-sm text-stone-500 max-w-xl leading-relaxed">
                              {featuredBook.description}
                            </p>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                              <button
                                onClick={() => {
                                  if (isFeaturedPremium && !currentUser?.is_premium) {
                                    setPaywallBook(featuredBook);
                                  } else {
                                    handleOpenReader(featuredBook.id);
                                  }
                                }}
                                className="px-8 py-4 rounded-2xl font-bold text-xs font-mono uppercase tracking-wider transition-all active:scale-95 shadow-xl hover:shadow-2xl cursor-pointer flex items-center gap-2 bg-[#E05638] hover:bg-[#C74326] text-white shadow-[#E05638]/20"
                              >
                                {isFeaturedPremium && !currentUser?.is_premium ? <span>💎</span> : <BookOpen size={16} />}
                                <span>{isFeaturedPremium && !currentUser?.is_premium ? `Sotib Olish (Tez Kunda)` : "Mutolaani Boshlash"}</span>
                              </button>

                              <button
                                onClick={() => handlePlayAudio(featuredBook)}
                                className="px-8 py-4 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/20 text-stone-900 dark:text-white font-bold text-xs font-mono uppercase tracking-wider transition-transform active:scale-95 border border-stone-200 dark:border-white/10 cursor-pointer flex items-center gap-2"
                              >
                                <Headphones size={16} className="text-[#C5A059]" />
                                <span>Audio Tinglash</span>
                              </button>

                              <button
                                onClick={() => navigate('discover')}
                                className="px-6 py-4 rounded-2xl text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white font-bold text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                              >
                                <span>Barcha Asarlar</span>
                                <ArrowRight size={14} />
                              </button>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    <div className="relative group cursor-pointer shrink-0" onClick={() => handleOpenReader(featuredBook.id)}>
                      <div className="book-card-3d w-56 sm:w-68 aspect-[2/3] scale-100 group-hover:scale-105 transition-transform duration-500">
                        <div className="book-card-inner relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                          <img 
                            src={featuredBook.coverImage} 
                            alt={featuredBook.title} 
                            className="w-full h-full object-cover" 
                          />
                          <div className="book-spine-hinge" />
                          {Boolean(featuredBook.is_premium || (featuredBook as any).is_premium) && (
                            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-wider shadow-xl z-20 bg-stone-950/85 dark:bg-black/85 backdrop-blur-md text-amber-300 border border-amber-500/40 flex items-center gap-1">
                              <span>💎</span>
                              <span>VIP ASAR</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ── 2. NEGA AYNAN BOOKIFY? (PLATFORMA IMTIYOZLARI & NEGA LOGIN QILISH KERAK) ── */}
              <section className="space-y-8">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-[#E05638]/10 text-[#E05638] uppercase tracking-wider inline-block">
                    ✦ Yangi Avlod Kutubxonasi
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950 dark:text-white tracking-tight">
                    Nega Aynan Bookify?
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 font-medium leading-relaxed">
                    Oddiy elektron kitoblar emas — to'laqonli madaniy ekotizim, professional audio spektakllar va shaxsiy rivojlanish maydoni.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Perk 1 */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 hover:border-[#E05638]/40 hover:shadow-xl transition-all duration-300 space-y-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Library size={24} />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                        Oltin Meros & Mumtoz Fond
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                        Qodiriy, Cho'lpon, Navoiy va jahon adabiyoti durdonalarining asl, tekshirilgan matnlari to'liq jamlanmasi.
                      </p>
                    </div>
                    <div className="text-[11px] font-mono text-[#E05638] font-semibold flex items-center gap-1">
                      <span>✓ 100% Rasmiy va Tekshirilgan</span>
                    </div>
                  </div>

                  {/* Perk 2 */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 hover:border-[#E05638]/40 hover:shadow-xl transition-all duration-300 space-y-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-[#E05638]/10 text-[#E05638] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Headphones size={24} />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                        48 kHz Audio Spektakllar
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                        Sun'iy robot ovozi emas — Afzal Rafiqov va O'zbekiston xalq artistlari ijrosidagi mahoratli jonli audio spektakllar.
                      </p>
                    </div>
                    <div className="text-[11px] font-mono text-[#E05638] font-semibold flex items-center gap-1">
                      <span>✓ Studiyaviy Master Sifat</span>
                    </div>
                  </div>

                  {/* Perk 3 */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 hover:border-[#E05638]/40 hover:shadow-xl transition-all duration-300 space-y-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpen size={24} />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                        Haqiqiy 3D Varaqlash
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                        Ko'zni charchatmaydigan pergament va sepiya qog'ozlari, qulay shriftlar, xatcho'plar va so'nggi sahifani eslab qolish.
                      </p>
                    </div>
                    <div className="text-[11px] font-mono text-[#E05638] font-semibold flex items-center gap-1">
                      <span>✓ Ergonomik Mutolaa</span>
                    </div>
                  </div>

                  {/* Perk 4 */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 hover:border-[#E05638]/40 hover:shadow-xl transition-all duration-300 space-y-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-[#C5A059]/15 text-[#C5A059] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Trophy size={24} />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                        Adabiy Chempionat & Sovg'alar
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                        Har haftalik kitobxonlik musobaqalari, 15 000 000 so'm mukofot jamg'armasi va rasmiy akkreditatsiyalangan sertifikatlar.
                      </p>
                    </div>
                    <div className="text-[11px] font-mono text-[#E05638] font-semibold flex items-center gap-1">
                      <span>✓ 15,000,000 UZS Mukofot</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* ── 3. MAVZULAR & JANRLAR BO'YICHA SAYOHAT ── */}
              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950 dark:text-white">
                      Janrlar & Mavzular Sayohati
                    </h3>
                    <p className="text-xs text-stone-500 font-mono mt-0.5">
                      Qiziqishingizga mos durdona asarni bir teginishda kashf eting
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('discover')}
                    className="text-xs font-mono text-[#E05638] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>To'liq Katalog</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                  {[
                    { title: "Mumtoz Adabiyot", emoji: "📜", count: "40+ asar", color: "from-amber-500/20 to-amber-700/20" },
                    { title: "Jahon Durdonalari", emoji: "🌍", count: "35+ asar", color: "from-rose-500/20 to-red-700/20" },
                    { title: "Tarixiy Romanlar", emoji: "⏳", count: "25+ asar", color: "from-stone-500/20 to-stone-800/20" },
                    { title: "Psixologiya & Rivoj", emoji: "🧠", count: "20+ asar", color: "from-emerald-500/20 to-teal-700/20" },
                    { title: "Audio Spektakllar", emoji: "🎭", count: "15+ asar", color: "from-indigo-500/20 to-purple-700/20" },
                    { title: "Bolalar Adabiyoti", emoji: "🧒", count: "30+ asar", color: "from-sky-500/20 to-blue-700/20" }
                  ].map((genre, idx) => (
                    <div
                      key={idx}
                      onClick={() => navigate('discover')}
                      className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 hover:border-[#E05638]/50 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 group"
                    >
                      <span className="text-3xl sm:text-4xl block group-hover:scale-110 transition-transform">
                        {genre.emoji}
                      </span>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-white group-hover:text-[#E05638] transition-colors">
                          {genre.title}
                        </h4>
                        <span className="text-[10px] font-mono text-stone-400 block mt-0.5">
                          {genre.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── 4. SARA DURDONALAR & AUDIO SPEKTAKLLAR (KITOB KARTALARI) ── */}
              {publishedBooks.length > 0 && (
                <section className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950 dark:text-white">
                        Sara Durdonalar & Audio Spektakllar
                      </h3>
                      <p className="text-xs text-stone-500 font-mono mt-0.5">
                        O'zbek va jahon mumtoz adabiyotining eng sara durdona asarlari
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('discover')}
                      className="text-xs font-mono text-[#E05638] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span>Barchasini Ko'rish ({publishedBooks.length})</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {publishedBooks.map(b => {
                      const isPremium = Boolean(b.is_premium || (b as any).is_premium);
                      const bookPrice = (b as any).price || 0;
                      return (
                        <div
                          key={b.id}
                          className="p-5 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group"
                          style={isPremium ? { borderColor: 'rgba(197, 160, 89, 0.35)' } : {}}
                        >
                          <div className="flex gap-4">
                            <div className="book-card-3d shrink-0">
                              <div 
                                onClick={() => handleOpenReader(b.id)}
                                className="book-card-inner relative w-24 h-34 rounded-xl overflow-hidden shadow-book border border-black/10 cursor-pointer"
                                title="Mutolaani boshlash"
                              >
                                <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover" />
                                <div className="book-spine-hinge" />
                                {isPremium && (
                                  <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-lg text-[9px] font-bold font-mono tracking-wider shadow-md z-10 bg-stone-950/85 dark:bg-black/85 backdrop-blur-md text-amber-300 border border-amber-500/35 flex items-center gap-1">
                                    <span>💎</span>
                                    <span>VIP</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col justify-between flex-1 min-w-0">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-mono font-bold text-[#E05638] uppercase tracking-wider">
                                    {b.category}
                                  </span>
                                  {isPremium && bookPrice > 0 && (
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/25">
                                      {new Intl.NumberFormat('uz-UZ').format(bookPrice)} so'm
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-serif text-base font-bold text-stone-950 dark:text-white truncate group-hover:text-[#E05638] transition-colors">
                                  {b.title}
                                </h4>
                                <span className="text-xs text-stone-500 font-medium block truncate">
                                  {b.authorName}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-[11px] font-mono text-stone-400 pt-2">
                                <span>📖 {b.pages} bet</span>
                                {b.audioDuration ? (
                                  <span className="text-[#E05638] dark:text-amber-400 font-medium">🎧 {b.audioDuration}</span>
                                ) : (
                                  <span>⏱ ~{Math.max(1, Math.round((b.pages || 100) * 1.5 / 60))} soat</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 dark:border-white/5">
                            <button
                              onClick={() => {
                                if (isPremium && !currentUser?.is_premium) {
                                  setPaywallBook(b);
                                } else {
                                  handleOpenReader(b.id);
                                }
                              }}
                              className={`py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                isPremium && !currentUser?.is_premium
                                  ? 'bg-gradient-to-r from-[#E05638] to-[#C74326] hover:brightness-110 text-white font-bold shadow-sm'
                                  : 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-[#E05638] dark:hover:bg-[#E05638] dark:hover:text-white'
                              }`}
                            >
                              {isPremium && !currentUser?.is_premium ? <span>💎</span> : <BookOpen size={14} />}
                              <span>{isPremium && !currentUser?.is_premium ? "Sotib Olish (Tez kunda)" : "Mutolaa"}</span>
                            </button>

                            <button
                              onClick={() => handlePlayAudio(b)}
                              className="py-2.5 rounded-xl bg-[#E05638]/10 text-[#E05638] hover:bg-[#E05638] hover:text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Headphones size={14} />
                              <span>Tinglash</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ── 5. PLATFORMA IMKONIYATLARI SHOWCASE ── */}
              <section className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-stone-900 via-[#181B22] to-black text-white overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#E05638]/15 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                  <div className="space-y-4 lg:col-span-2">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#E05638]/20 text-[#E05638] uppercase tracking-wider inline-block">
                      ✦ Texnologik Mutolaa Tajribasi
                    </span>
                    <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
                      Raqamli Mutolaa Yangi Bosqichda
                    </h3>
                    <p className="text-stone-400 text-sm max-w-xl leading-relaxed">
                      Oddiy PDF fayllarni o'qishdan charchadingizmi? Bookify sizga haqiqiy kitob varaqlash zavqi, professional diktor ovozi va ko'zni toliqtirmaydigan xalqaro standartdagi o'qish interfeysini taqdim etadi.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                        <span className="text-[#E05638] font-bold text-sm block">⚡ Matn & Audio</span>
                        <p className="text-[11px] text-stone-400">Audio eshitib, matndan ko'z uzmasdan birgalikda kuzatib boring.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                        <span className="text-amber-400 font-bold text-sm block">🌙 Ergonomik Fon</span>
                        <p className="text-[11px] text-stone-400">Sepiya, pergament va qora tungi rejimlar ko'zni asraydi.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                        <span className="text-emerald-400 font-bold text-sm block">🔖 Bulutli Xatcho'p</span>
                        <p className="text-[11px] text-stone-400">To'xtagan joyingiz barcha qurilmalarda avtomatik saqlanadi.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                    <BookOpen size={48} className="text-[#E05638] animate-pulse" />
                    <h4 className="font-serif font-bold text-lg">Hozir Bepul Sinab Ko'ring</h4>
                    <p className="text-xs text-stone-400 max-w-xs">
                      Ro'yxatdan o'ting va shaxsiy javoningizni bugunoq to'ldirishni boshlang.
                    </p>
                    <button
                      onClick={() => {
                        if (featuredBook) handleOpenReader(featuredBook.id);
                        else navigate('discover');
                      }}
                      className="mt-2 w-full py-3.5 rounded-xl bg-[#E05638] hover:bg-[#c94529] text-white font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-lg shadow-[#E05638]/25 cursor-pointer"
                    >
                      3D Readerda Ochish ➔
                    </button>
                  </div>
                </div>
              </section>

              {/* ── 6. BUYUK ADIBLAR MEROSI ── */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950 dark:text-white">
                      Buyuk Adiblar Merosi
                    </h3>
                    <p className="text-xs text-stone-500 font-mono mt-0.5">
                      O'zbek adabiyoti klassiklarining hayoti va asarlari xazinasi
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate('author', 'abdulla-qodiriy')}
                    className="text-xs font-mono text-[#E05638] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Barcha Allomalar</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {AUTHORS.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => navigate('author', a.id)}
                      className="p-4 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 hover:border-[#E05638]/50 hover:shadow-xl transition-all duration-300 cursor-pointer text-center space-y-3 group"
                    >
                      <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden ring-2 ring-stone-200 dark:ring-white/10 group-hover:ring-[#E05638] transition-all">
                        <img src={a.portrait} alt={a.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-white group-hover:text-[#E05638] transition-colors">
                          {a.name}
                        </h4>
                        <span className="text-[10px] font-mono text-stone-400 block mt-0.5">
                          {a.lifetime}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── 7. KITOBXONLAR FIKRLARI & TAQRIZLAR ── */}
              {featuredBook && (
                <BookReviewsSection
                  bookId={featuredBook.id}
                  bookTitle={featuredBook.title}
                  currentUser={currentUser}
                />
              )}

              {/* ── 8. A'ZO BO'LISH & RO'YXATDAN O'TISH KUCHLI CHAQIRUVI (CONVERSION BANNER) ── */}
              <section className="relative rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-[#C74326] via-[#E05638] to-[#C5A059] text-white shadow-2xl overflow-hidden text-center sm:text-left">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
                  <div className="space-y-3 max-w-xl">
                    <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-black/20 text-white uppercase tracking-wider inline-block">
                      ✦ Bepul A'zolik
                    </span>
                    <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
                      {currentUser 
                        ? `Mutolaani davom ettiring, ${currentUser.name}!`
                        : "O'zbekistonning Eng Katta Kitobxonlar Jamiyatiga Qo'shiling"
                      }
                    </h3>
                    <p className="text-white/90 text-sm leading-relaxed">
                      {currentUser 
                        ? "Shaxsiy javoningizdagi asarlarni o'qishda davom eting va haftalik chempionatda sovrinli o'rinlarni egallang."
                        : "Ro'yxatdan o'tish mutlaqo bepul. Ilk daqiqalardanoq yuzlab sara asarlar, audio spektakllar va shaxsiy kitob javonidan bahramand bo'ling."
                      }
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
                    {currentUser ? (
                      <button
                        onClick={() => navigate('library')}
                        className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-stone-950 hover:bg-black text-white font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        Mening Javonim ➔
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => navigate('auth')}
                          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-stone-950 hover:bg-black text-white font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          Bepul Ro'yxatdan O'tish ➔
                        </button>
                        <button
                          onClick={() => navigate('discover')}
                          className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs font-mono uppercase tracking-wider transition-all border border-white/25 cursor-pointer"
                        >
                          Katalog
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </section>

              {/* ── 9. GRAND PROFESSIONAL FOOTER ── */}
              <footer className="pt-12 border-t border-stone-200 dark:border-white/10 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {/* Brand Column */}
                  <div className="space-y-4 md:col-span-2">
                    <div className="flex items-center gap-3">
                      <img 
                        src="/icon.png" 
                        alt="Bookify Logo" 
                        className="w-10 h-10 rounded-2xl object-cover shadow-md ring-2 ring-[#C5A059]/20" 
                      />
                      <div>
                        <h4 className="font-serif font-bold text-lg text-stone-950 dark:text-white">
                          Bookify
                        </h4>
                        <span className="text-[10px] font-mono tracking-widest text-[#C5A059] uppercase block font-semibold">
                          Milliy Raqamli Kutubxona
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md leading-relaxed">
                      O'zbek mumtoz va zamonaviy adabiy merosini asrab-avaylash, yuqori sifatli audio spektakllar yaratish va kitobxonlik madaniyatini yuksaltirishga qaratilgan milliy raqamli platforma.
                    </p>
                  </div>

                  {/* Navigation Column */}
                  <div className="space-y-3">
                    <h5 className="font-serif font-bold text-sm text-stone-900 dark:text-white">
                      Bo'limlar
                    </h5>
                    <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400 font-medium">
                      <li>
                        <button onClick={() => navigate('home')} className="hover:text-[#E05638] transition-colors cursor-pointer">
                          Bosh Sahifa
                        </button>
                      </li>
                      <li>
                        <button onClick={() => navigate('discover')} className="hover:text-[#E05638] transition-colors cursor-pointer">
                          Durdona Asarlar Xazinasi
                        </button>
                      </li>
                      <li>
                        <button onClick={() => navigate('author', 'abdulla-qodiriy')} className="hover:text-[#E05638] transition-colors cursor-pointer">
                          Buyuk Allomalar
                        </button>
                      </li>
                      <li>
                        <button onClick={() => navigate('challenge')} className="hover:text-[#E05638] transition-colors cursor-pointer">
                          Adabiy Chempionat 2026
                        </button>
                      </li>
                      <li>
                        <button onClick={() => navigate('library')} className="hover:text-[#E05638] transition-colors cursor-pointer">
                          Mening Shaxsiy Javonim
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Trust & Community Column */}
                  <div className="space-y-3">
                    <h5 className="font-serif font-bold text-sm text-stone-900 dark:text-white">
                      Jamiyat & Xavfsizlik
                    </h5>
                    <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400 font-medium">
                      <li className="flex items-center gap-1.5 text-[#E05638]">
                        <span>✓ 256-bit SSL Shifrlash</span>
                      </li>
                      <li className="flex items-center gap-1.5 text-[#C5A059]">
                        <span>✓ 48 kHz Professional Audio</span>
                      </li>
                      <li className="flex items-center gap-1.5 text-emerald-600">
                        <span>✓ Bepul O'qish Imkoniyati</span>
                      </li>
                      <li>
                        <button onClick={() => navigate('volunteer')} className="hover:text-[#E05638] transition-colors cursor-pointer">
                          🤝 Volontyorlik Dasturi
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400 font-mono">
                  <span>© 2026 Bookify. Barcha huquqlar himoyalangan.</span>
                  <div className="flex items-center gap-4">
                    <span>O'zbekistonda mehr bilan yaratildi 🇺🇿</span>
                  </div>
                </div>
              </footer>

            </div>
          )}


          {/* 2. LIBRARY VIEW */}
          {currentPage === 'library' && (
            <LibraryView
              allBooks={publishedBooks}
              onOpenReader={handleOpenReader}
              onPlayAudio={handlePlayAudio}
              onGoToDiscover={() => navigate('discover')}
            />
          )}

          {/* 3. DISCOVER CATALOG VIEW */}
          {currentPage === 'discover' && (
            <DiscoverCatalog
              books={publishedBooks}
              onOpenReader={handleOpenReader}
              onPlayAudio={handlePlayAudio}
              currentUser={currentUser}
              onBuyBook={handleBuyBook}
            />
          )}

          {/* 3. AUTHOR EXHIBITION VIEW */}
          {currentPage === 'author' && (
            <AuthorDetail
              author={selectedAuthor}
              books={publishedBooks}
              allAuthors={AUTHORS}
              onSelectAuthor={aId => setSelectedAuthorId(aId)}
              onOpenReader={handleOpenReader}
              onPlayAudio={handlePlayAudio}
              onBack={goBack}
            />
          )}

          {/* 4. READER PASSPORT PROFILE */}
          {currentPage === 'profile' && currentUser && (
            <ReaderPassport
              user={currentUser}
              books={booksList}
              onOpenReader={handleOpenReader}
              onLogout={() => {
                clearAuthToken();
                setCurrentUser(null);
                setCurrentPage('auth');
                toast.success("Tizimdan chiqildi!");
              }}
            />
          )}

          {/* 5. FOCUS SCRIPTORIUM */}
          {currentPage === 'time' && (
            <ZenScriptorium />
          )}

          {/* 6. ADABIY CHEMPIONAT LEADERBOARD */}
          {currentPage === 'challenge' && (
            <LeaderboardPodium />
          )}

          {/* 7. KELAJAK & VIZYON */}
          {currentPage === 'vision' && (
            <ComingSoonSection />
          )}

          {/* 8. ADMIN CONTROL PANEL (ONLY FOR VERIFIED ADMIN) */}
          {currentPage === 'admin' && currentUser?.role === 'ADMIN' && (
            <AdminPanel
              onNavigate={navigate}
              books={booksList}
              onRefreshBooks={loadBooksFromBackend}
            />
          )}

          {/* 9. AKADEMIK SERTIFIKAT TEKSHIRUVI (UNIVERSITIES & VERIFICATION) */}
          {currentPage === 'verify' && (
            <VerifyCertificatePage
              initialSerial={verifyCertSerial}
              onNavigateHome={() => navigate('home')}
            />
          )}

          {/* 10. VOLUNTEER COMMUNITY PORTAL */}
          {currentPage === 'volunteer' && (
            <VolunteerPortal
              books={publishedBooks}
              currentUser={currentUser}
              onNavigate={navigate}
              onUserUpdate={(updatedUser) => {
                setCurrentUser(updatedUser);
                setCachedUser(updatedUser);
              }}
            />
          )}

        </main>
      </div>

      {/* ── Global Book Paywall & VIP Subscription Modal ── */}
      {(paywallBook || isVipModalOpen) && (
        <BookPaywallModal
          book={paywallBook ? {
            id: paywallBook.id,
            title: paywallBook.title,
            author: paywallBook.authorName || (paywallBook as any).author || 'Muallif',
            cover_url: paywallBook.coverImage || (paywallBook as any).cover_image,
            price: paywallBook.price || (paywallBook as any).price || 15000,
            is_premium: true,
          } : null}
          initialTab={isVipModalOpen && !paywallBook ? 'vip' : 'book'}
          isAdmin={currentUser?.role === 'ADMIN'}
          onClose={() => {
            setPaywallBook(null);
            setIsVipModalOpen(false);
          }}
          onRequireAuth={() => {
            setPaywallBook(null);
            setIsVipModalOpen(false);
            setCurrentPage('auth');
            toast.error("Iltimos, to'lovni davom ettirish uchun tizimga kiring!");
          }}
          onAccessGranted={() => {
            if (paywallBook) {
              const bId = paywallBook.id;
              setPaywallBook(null);
              setIsVipModalOpen(false);
              setSelectedBookId(bId);
              setCurrentPage('reader');
            } else {
              setIsVipModalOpen(false);
              toast.success("VIP a'zolik faollashtirildi! 👑");
            }
          }}
        />
      )}

      {/* Floating Global Audio Player Bar */}
      {activeAudioTrack && (
        <AudioDock
          track={activeAudioTrack}
          onClose={() => setActiveAudioTrack(null)}
          onOpenReader={(bId) => {
            handleOpenReader(bId);
          }}
        />
      )}

    </div>
  );
}
