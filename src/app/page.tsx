'use client';

import React, { useState, useEffect } from 'react';
import { Page, Book, Author, AudioTrack, UserProfile } from '../types';
import { AUTHORS } from '../data/authors';
import { BOOKS } from '../data/books';
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
  const [booksList, setBooksList] = useState<Book[]>(BOOKS);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [pendingBookToOpen, setPendingBookToOpen] = useState<string | null>(null);
  const [verifyCertSerial, setVerifyCertSerial] = useState<string>('');
  const [authInitialized, setAuthInitialized] = useState(false);
  const [paywallBook, setPaywallBook] = useState<Book | null>(null);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [activeHomeShelf, setActiveHomeShelf] = useState<'all' | 'audio' | 'uzbek' | 'world' | 'vip'>('all');

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
          authorId: b.author ? b.author.toLowerCase().replace(/\s+/g, '-').replace(/['`]/g, '') : 'unknown',
          authorName: b.author || b.author_name || '',
          category: b.category || 'Tarjima Adabiyot',
          coverImage: b.cover_image || '',
          spineColor: '#16213E',
          description: b.description || '',
          publishedYear: b.year || 0,
          pages: b.pages || 0,
          audioDuration: b.audio_duration || '',
          rating: 0,
          reviewsCount: 0,
          narrator: b.narrator || undefined,
          featuredQuote: b.featured_quote || '',
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

        toast.success("To'lovingiz muvaffaqiyatli qabul qilindi! VIP obuna faollashtirildi! рџЋ‰", {
          duration: 6000,
          icon: 'рџ‘‘'
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

      // 4. Otherwise, book is locked вЂ” open luxury paywall modal
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
      toast.success(`"${book.title}" audio spektakli tinglanmoqda`, { icon: 'рџЋ§' });
    } else {
      toast("Ushbu asar uchun hozircha audio trek yuklanmagan. Boshqaruv panelidan yangi audio yuklashingiz mumkin.", { icon: 'в„№пёЏ', duration: 4500 });
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
      
      {/* в”Ђв”Ђ Left Fixed Sidebar (Desktop + Mobile Drawer) в”Ђв”Ђ */}
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

      {/* в”Ђв”Ђ Center / Right Main Canvas в”Ђв”Ђ */}
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
          
          {/* 1. HOME VIEW - EDITORIAL / MINIMALIST REDESIGN */}
          {currentPage === 'home' && (
            <div className="max-w-6xl mx-auto space-y-24 pb-32 animate-in fade-in duration-500">
              
              {/* --- HERO / SPOTLIGHT (Editorial Style) --- */}
              {featuredBook && (
                <section className="relative pt-10 pb-16 sm:pt-20 sm:pb-24 border-b border-black/10 dark:border-white/10">
                  <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    <div className="flex-1 space-y-8 text-center lg:text-left">
                      <div className="flex items-center justify-center lg:justify-start gap-3">
                        <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-ink/50 dark:text-parchment/50 border border-black/10 dark:border-white/10 px-3 py-1 rounded-sm">
                          {featuredBook.is_premium ? 'VIP Asar' : 'Hafta Tanlovi'}
                        </span>
                        <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.1em] text-ink/40 dark:text-parchment/40">
                          {featuredBook.category}
                        </span>
                      </div>
                      
                      <h1 className="font-serif text-5xl sm:text-7xl lg:text-[5.5rem] font-bold tracking-tight text-ink dark:text-parchment leading-[1.05]">
                        {featuredBook.title}
                      </h1>
                      
                      <p className="text-lg sm:text-xl text-ink/70 dark:text-parchment/70 max-w-2xl font-serif italic mx-auto lg:mx-0 leading-relaxed">
                        "{featuredBook.featuredQuote || featuredBook.description.slice(0, 120) + '...'}"
                      </p>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                        <button 
                          onClick={() => handleOpenReader(featuredBook.id)} 
                          className="w-full sm:w-auto px-10 py-4 bg-ink dark:bg-parchment text-parchment dark:text-ink text-[11px] font-bold uppercase tracking-[0.15em] hover:opacity-90 transition-opacity cursor-pointer"
                        >
                          Mutolaani boshlash
                        </button>
                        {featuredBook.audioDuration && (
                          <button 
                            onClick={() => handlePlayAudio(featuredBook)} 
                            className="w-full sm:w-auto px-10 py-4 border border-black/10 dark:border-white/10 text-ink dark:text-parchment text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-3 cursor-pointer"
                          >
                            <Headphones size={16} /> Audio tinglash
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="w-64 sm:w-80 lg:w-[400px] shrink-0 mx-auto lg:mx-0">
                      <div className="aspect-[2/3] border border-black/10 dark:border-white/10 shadow-book bg-black/5 dark:bg-white/5 overflow-hidden">
                        {featuredBook.coverImage ? (
                          <img src={featuredBook.coverImage} alt={featuredBook.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full book-cover-placeholder" style={{ backgroundColor: featuredBook.spineColor }}>
                            <div className="bcp-title">{featuredBook.title}</div>
                            <div className="bcp-line"></div>
                            <div className="bcp-author">{featuredBook.authorName}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* --- SHELF 1: NEW & TRENDING --- */}
              <section className="space-y-10">
                 <div className="flex items-end justify-between border-b border-black/10 dark:border-white/10 pb-4">
                    <h2 className="font-serif text-3xl font-bold text-ink dark:text-parchment tracking-tight">Katalog</h2>
                    <button onClick={() => navigate('discover')} className="text-[11px] font-mono uppercase tracking-[0.15em] text-ink/50 dark:text-parchment/50 hover:text-ink dark:hover:text-parchment transition-colors cursor-pointer">
                      Barchasi &rarr;
                    </button>
                 </div>
                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-12">
                   {publishedBooks.slice(0, 5).map(b => (
                     <div key={b.id} onClick={() => handleOpenReader(b.id)} className="group cursor-pointer">
                       <div className="aspect-[2/3] border border-black/10 dark:border-white/10 shadow-sm overflow-hidden mb-4 bg-black/5 dark:bg-white/5">
                         {b.coverImage ? (
                           <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" />
                         ) : (
                           <div className="w-full h-full book-cover-placeholder" style={{ backgroundColor: b.spineColor }}>
                              <div className="bcp-title">{b.title}</div>
                              <div className="bcp-line"></div>
                              <div className="bcp-author">{b.authorName}</div>
                           </div>
                         )}
                       </div>
                       <h3 className="font-serif font-bold text-sm leading-snug group-hover:text-ember transition-colors line-clamp-2">{b.title}</h3>
                       <p className="font-mono text-[10px] text-ink/50 dark:text-parchment/50 uppercase mt-2 tracking-wider">{b.authorName}</p>
                     </div>
                   ))}
                 </div>
              </section>

              {/* --- AUTHORS GALLERY --- */}
              <section className="space-y-10">
                 <div className="flex items-end justify-between border-b border-black/10 dark:border-white/10 pb-4">
                    <h2 className="font-serif text-3xl font-bold text-ink dark:text-parchment tracking-tight">Allomalar</h2>
                    <button onClick={() => navigate('author')} className="text-[11px] font-mono uppercase tracking-[0.15em] text-ink/50 dark:text-parchment/50 hover:text-ink dark:hover:text-parchment transition-colors cursor-pointer">
                      Tanishish &rarr;
                    </button>
                 </div>
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                   {AUTHORS.slice(0, 4).map(a => (
                     <div key={a.id} onClick={() => { setSelectedAuthorId(a.id); navigate('author'); }} className="group cursor-pointer text-center space-y-4">
                       <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border border-black/10 dark:border-white/10 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 ease-out bg-black/5 dark:bg-white/5">
                         <img src={a.portrait} alt={a.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                       </div>
                       <div>
                         <h4 className="font-serif font-bold text-base group-hover:text-ember transition-colors">{a.name}</h4>
                         <span className="text-[10px] font-mono text-ink/50 dark:text-parchment/50 tracking-wider block mt-1">{a.lifetime}</span>
                       </div>
                     </div>
                   ))}
                 </div>
              </section>

              {/* --- ADABIY CHEMPIONAT (Minimalist Podium) --- */}
              <section className="border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] p-8 sm:p-16 text-center">
                <div className="max-w-3xl mx-auto space-y-8">
                  <div className="inline-flex items-center gap-3">
                    <Trophy size={14} className="text-ink/40 dark:text-parchment/40" />
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50 dark:text-parchment/50">Adabiy Chempionat</span>
                  </div>
                  
                  <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight">Jonli Reyting</h2>
                  
                  <p className="text-base sm:text-lg font-serif italic text-ink/60 dark:text-parchment/60 pb-4">
                    "Kitob o'qish musobaqa emas, lekin birgalikda o'qish вЂ” katta ilhom."
                  </p>
                  
                  {/* Strict Minimalist Podium */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end pt-4 max-w-2xl mx-auto">
                    {/* 2nd Place */}
                    <div className="p-4 sm:p-6 border-t border-black/10 dark:border-white/10 bg-parchment dark:bg-ink">
                      <div className="text-xl sm:text-2xl mb-3 grayscale opacity-60">рџҐ€</div>
                      <div className="font-serif font-bold text-xs sm:text-sm truncate">Sardorbek O.</div>
                      <div className="font-mono text-[10px] text-ink/50 mt-1">720 daq</div>
                    </div>
                    
                    {/* 1st Place */}
                    <div className="p-5 sm:p-8 border border-ink dark:border-parchment bg-parchment dark:bg-ink shadow-sm -translate-y-4 relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-ink dark:bg-parchment text-parchment dark:text-ink text-[9px] font-mono font-bold uppercase tracking-widest whitespace-nowrap">
                        Hafta G'olibi
                      </div>
                      <div className="text-2xl sm:text-3xl mb-3 mt-1">рџҐ‡</div>
                      <div className="font-serif font-bold text-sm sm:text-base truncate">Kamola R.</div>
                      <div className="font-mono text-[11px] font-bold mt-1">840 daq</div>
                    </div>
                    
                    {/* 3rd Place */}
                    <div className="p-4 sm:p-6 border-t border-black/10 dark:border-white/10 bg-parchment dark:bg-ink">
                      <div className="text-xl sm:text-2xl mb-3 grayscale opacity-40">рџҐ‰</div>
                      <div className="font-serif font-bold text-xs sm:text-sm truncate">Dilnoza T.</div>
                      <div className="font-mono text-[10px] text-ink/50 mt-1">680 daq</div>
                    </div>
                  </div>
                  
                  <div className="pt-8">
                    <button 
                      onClick={() => navigate('challenge')} 
                      className="px-8 py-3 border border-black/10 dark:border-white/10 text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      To'liq reytingni ko'rish
                    </button>
                  </div>
                </div>
              </section>

              {/* --- REVIEWS --- */}
              {featuredBook && (
                <div className="border-t border-black/10 dark:border-white/10 pt-16">
                  <BookReviewsSection
                    bookId={featuredBook.id}
                    bookTitle={featuredBook.title}
                    currentUser={currentUser}
                  />
                </div>
              )}

              {/* Minimal Footer */}
              <footer className="pt-20 pb-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-black/10 dark:border-white/10">
                <div className="flex items-center gap-2 grayscale opacity-50">
                   <div className="w-5 h-5 bg-ink dark:bg-parchment rounded-sm flex items-center justify-center">
                     <span className="font-serif font-bold text-parchment dark:text-ink text-xs leading-none pt-0.5">B</span>
                   </div>
                   <span className="font-serif font-bold text-sm">Bookify</span>
                </div>
                <div className="text-[10px] font-mono text-ink/40 dark:text-parchment/40 uppercase tracking-widest text-center sm:text-right">
                  В© 2026. Xalqaro kutubxona loyihasi.<br/>
                  <span className="lowercase">v2.0.0 вЂ” Minimalist Edition</span>
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

      {/* в”Ђв”Ђ Global Book Paywall & VIP Subscription Modal в”Ђв”Ђ */}
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
              toast.success("VIP a'zolik faollashtirildi! рџ‘‘");
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
