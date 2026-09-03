'use client';

import React, { useState, useEffect } from 'react';
import { Page, Book, Author, AudioTrack, UserProfile } from '../types';
import { AUTHORS } from '../data/authors';
import { api, getAuthToken, clearAuthToken } from '../services/api';

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

import { BookOpen, Headphones, ArrowRight, Quote, Search, X, Trophy, UploadCloud } from 'lucide-react';
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

  // Check existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const me = await api.getMe();
          if (me) {
            setCurrentUser({
              id: me.id,
              name: me.name || me.email.split('@')[0],
              email: me.email,
              role: me.role === 'ADMIN' ? 'ADMIN' : 'USER',
              avatarUrl: me.avatar_url || me.avatarUrl || '',
              dailyGoalMinutes: 40,
              todayMinutes: 40,
              readingStreakDays: 1,
              totalHours: me.total_hours || 0,
              finishedBooksCount: me.finished_books_count || 0,
              is2FAEnabled: me.is_2fa_enabled ?? (me.role === 'ADMIN')
            });
          }
        } catch (e) {
          clearAuthToken();
        }
      }
    };
    initAuth();
  }, []);

  // Fetch real books from FastAPI backend
  const loadBooksFromBackend = async () => {
    setIsLoadingBooks(true);
    try {
      const data = await api.getBooks();
      const formatted: Book[] = await Promise.all(data.map(async (b: any) => {
        let chaptersData: any[] = [];
        try {
          const detail = await api.getBookReader(b.id);
          if (detail && detail.chapters && detail.chapters.length > 0) {
            chaptersData = detail.chapters.map((ch: any) => ({
              id: String(ch.id),
              number: ch.index,
              title: ch.title,
              content: ch.sentences && ch.sentences.length > 0
                ? ch.sentences.map((s: any) => s.text).join('\n\n')
                : `${b.title} asarining ${ch.title} bobi.`
            }));
          }
        } catch {
          // fallback
        }

        if (chaptersData.length === 0) {
          chaptersData = [
            {
              id: `c1-${b.id}`,
              number: 1,
              title: `1-Bob: ${b.title}`,
              content: b.description || `${b.title} asari mutolaaga tayyor.`
            }
          ];
        }

        return {
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
          audioDuration: b.audio_duration || '12 soat 00 daqiqa',
          rating: 5.0,
          reviewsCount: 1,
          narrator: b.narrator || 'Afzal Rafiqov',
          featuredQuote: "Moziyga qaytib ish ko'rmak xayrlidir...",
          chapters: chaptersData
        };
      }));
      setBooksList(formatted);
      if (formatted.length > 0 && !selectedBookId) {
        setSelectedBookId(formatted[0].id);
      }
    } catch (e) {
      console.error("Backend books fetch error:", e);
    } finally {
      setIsLoadingBooks(false);
    }
  };

  useEffect(() => {
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

      if (view) {
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
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (typeof window !== 'undefined') {
      let url = '/';
      if (page !== 'home') {
        const p = new URLSearchParams();
        p.set('view', page);
        if (page === 'author' && (param || selectedAuthorId)) p.set('author', param || selectedAuthorId);
        if ((page === 'reader' || page === 'book') && (param || selectedBookId)) p.set('book', param || selectedBookId);
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

  const handleOpenReader = (bookId: string) => {
    if (!currentUser) {
      setPendingBookToOpen(bookId);
      toast.error("Mutolaani boshlash uchun iltimos, avval tizimga kiring!");
      setCurrentPage('auth');
      return;
    }
    setSelectedBookId(bookId);
    setCurrentPage('reader');
  };

  const handlePlayAudio = (book: Book) => {
    if (!currentUser) {
      toast.error("Audio spektaklni tinglash uchun iltimos, avval tizimga kiring!");
      setCurrentPage('auth');
      return;
    }
    playAudio(book);
  };

  const playAudio = (book: Book) => {
    setActiveAudioTrack({
      bookId: book.id,
      title: book.title,
      author: book.authorName,
      coverImage: book.coverImage,
      chapterTitle: book.chapters[0]?.title || "1-Bob",
      duration: book.audioDuration,
      isPlaying: true,
      currentTime: 0,
      playbackRate: 1.0
    });
    toast.success(`"${book.title}" audio spektakli tinglanmoqda`, { icon: '🎧' });
  };

  const selectedBook = booksList.find(b => b.id === selectedBookId) || booksList[0];
  const selectedAuthor = AUTHORS.find(a => a.id === selectedAuthorId) || AUTHORS[0];
  const featuredBook = booksList[0];

  // Full Screen Reader View
  if (currentPage === 'reader' && selectedBook) {
    return (
      <BookSpread
        book={selectedBook}
        onBack={goBack}
      />
    );
  }

  // Auth View
  if (currentPage === 'auth') {
    return (
      <AuthModal
        onSuccess={(user) => {
          setCurrentUser({
            id: user.id || "u-1",
            name: user.name || user.email?.split('@')[0] || "Kitobxon",
            email: user.email,
            role: user.role === 'ADMIN' ? 'ADMIN' : 'USER',
            avatarUrl: user.avatar_url || user.avatarUrl || '',
            dailyGoalMinutes: 40,
            todayMinutes: 40,
            readingStreakDays: 1,
            totalHours: user.total_hours || 0,
            finishedBooksCount: user.finished_books_count || 0,
            is2FAEnabled: user.is_2fa_enabled ?? (user.role === 'ADMIN')
          });
          if (pendingBookToOpen) {
            const bId = pendingBookToOpen;
            setPendingBookToOpen(null);
            setSelectedBookId(bId);
            setCurrentPage('reader');
          } else {
            setCurrentPage(user.role === 'ADMIN' ? 'admin' : 'home');
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
            setSelectedBookId(bookId);
            navigate('reader');
          }}
          onNavigatePage={(p) => navigate(p)}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 transition-colors pb-24 sm:pb-8">
          
          {/* 1. HOME VIEW */}
          {currentPage === 'home' && (
            <div className="max-w-7xl mx-auto space-y-16 pb-28 animate-in fade-in duration-300">
              
              {/* ── Spotlight Hero Showcase or Clean Empty State ── */}
              {featuredBook ? (
                <div className="relative rounded-3xl p-8 sm:p-12 lg:p-16 bg-gradient-to-tr from-[#FAF6EE] via-white to-[#F5EFE0] dark:from-[#121620] dark:via-[#0E1218] dark:to-[#0A0D14] border border-stone-200/90 dark:border-white/10 shadow-xs overflow-hidden">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#E05638]/10 via-[#C5A059]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                    
                    <div className="space-y-6 flex-1 text-center lg:text-left">
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#E05638]/10 text-[#E05638] dark:text-amber-400 border border-[#E05638]/20">
                          ✦ Bosh Muharrir Tanlovi
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-mono bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-300">
                          {featuredBook.pages} sahifa • {featuredBook.audioDuration}
                        </span>
                      </div>

                      <h1 className="font-serif text-4xl sm:text-6xl font-bold text-stone-950 dark:text-white tracking-tight leading-[1.1]">
                        {featuredBook.title}
                      </h1>

                      <p className="font-serif italic text-stone-600 dark:text-stone-300 text-base sm:text-lg max-w-xl leading-relaxed">
                        "{featuredBook.featuredQuote}"
                      </p>

                      <p className="text-xs sm:text-sm text-stone-500 max-w-xl leading-relaxed">
                        {featuredBook.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                        <button
                          onClick={() => handleOpenReader(featuredBook.id)}
                          className="px-8 py-4 rounded-2xl bg-[#E05638] hover:bg-[#C74326] text-white font-bold text-xs font-mono uppercase tracking-wider transition-transform active:scale-95 shadow-xl hover:shadow-2xl cursor-pointer flex items-center gap-2"
                        >
                          <BookOpen size={16} />
                          <span>Mutolaani Boshlash</span>
                        </button>

                        <button
                          onClick={() => handlePlayAudio(featuredBook)}
                          className="px-8 py-4 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/20 text-stone-900 dark:text-white font-bold text-xs font-mono uppercase tracking-wider transition-transform active:scale-95 border border-stone-200 dark:border-white/10 cursor-pointer flex items-center gap-2"
                        >
                          <Headphones size={16} className="text-[#C5A059]" />
                          <span>Audio Tinglash</span>
                        </button>
                      </div>
                    </div>

                    <div className="relative group cursor-pointer" onClick={() => handleOpenReader(featuredBook.id)}>
                      <div className="book-card-3d w-56 sm:w-68 aspect-[2/3] scale-100 group-hover:scale-105 transition-transform duration-500">
                        <div className="book-card-inner relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                          <img 
                            src={featuredBook.coverImage} 
                            alt={featuredBook.title} 
                            className="w-full h-full object-cover" 
                          />
                          <div className="book-spine-hinge" />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="p-16 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 text-center space-y-4">
                  <UploadCloud size={48} className="mx-auto text-stone-400" />
                  <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">Bazada Asarlar Mavjud Emas</h3>
                  <p className="text-xs font-mono text-stone-500">Yangi asar qo'shish uchun admin panelga o'ting.</p>
                </div>
              )}

              {/* ── Buyuk Adiblar Merosi ── */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-stone-950 dark:text-white">
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
              </div>

              {/* ── Durdona Asarlar & Audio Spektakllar ── */}
              {booksList.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-stone-950 dark:text-white">
                        Durdona Asarlar & Audio Spektakllar
                      </h3>
                      <p className="text-xs text-stone-500 font-mono mt-0.5">
                        PostgreSQL bazasiga yuklangan real badiiy kitoblar
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {booksList.map(b => (
                      <div
                        key={b.id}
                        className="p-5 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group"
                      >
                        <div className="flex gap-4">
                          <div className="book-card-3d shrink-0">
                            <div className="book-card-inner relative w-24 h-34 rounded-xl overflow-hidden shadow-book border border-black/10">
                              <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover" />
                              <div className="book-spine-hinge" />
                            </div>
                          </div>

                          <div className="flex flex-col justify-between flex-1 min-w-0">
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono font-bold text-[#E05638] uppercase tracking-wider">
                                {b.category}
                              </span>
                              <h4 className="font-serif text-base font-bold text-stone-950 dark:text-white truncate group-hover:text-[#E05638] transition-colors">
                                {b.title}
                              </h4>
                              <span className="text-xs text-stone-500 font-medium block truncate">
                                {b.authorName}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-[11px] font-mono text-stone-400 pt-2">
                              <span>📖 {b.pages} bet</span>
                              <span>🎧 {b.audioDuration}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 dark:border-white/5">
                          <button
                            onClick={() => handleOpenReader(b.id)}
                            className="py-2.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold text-xs transition-colors cursor-pointer hover:bg-[#E05638] dark:hover:bg-[#E05638] dark:hover:text-white flex items-center justify-center gap-1.5"
                          >
                            <BookOpen size={14} />
                            <span>Mutolaa</span>
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
                    ))}
                  </div>
                </div>
              )}

              {/* ── Kitobxonlar Fikrlari & Taqrizlar ── */}
              {featuredBook && (
                <BookReviewsSection
                  bookId={featuredBook.id}
                  bookTitle={featuredBook.title}
                  currentUser={currentUser}
                />
              )}

              {/* End of Home feed */}

            </div>
          )}

          {/* 2. LIBRARY VIEW */}
          {currentPage === 'library' && (
            <LibraryView
              allBooks={booksList}
              onOpenReader={handleOpenReader}
              onPlayAudio={handlePlayAudio}
              onGoToDiscover={() => navigate('discover')}
            />
          )}

          {/* 3. DISCOVER CATALOG VIEW */}
          {currentPage === 'discover' && (
            <DiscoverCatalog
              books={booksList}
              onOpenReader={handleOpenReader}
              onPlayAudio={handlePlayAudio}
            />
          )}

          {/* 3. AUTHOR EXHIBITION VIEW */}
          {currentPage === 'author' && (
            <AuthorDetail
              author={selectedAuthor}
              books={booksList}
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

          {/* 8. ADMIN CONTROL PANEL (PROTECTED: ONLY FOR ADMIN) */}
          {currentPage === 'admin' && (
            currentUser?.role === 'ADMIN' ? (
              <AdminPanel
                onNavigate={navigate}
                books={booksList}
                onRefreshBooks={loadBooksFromBackend}
              />
            ) : (
              <div className="p-8 sm:p-14 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 text-center space-y-4 max-w-md mx-auto my-16 shadow-xs">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-3xl font-bold">
                  🔒
                </div>
                <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                  Ruxsat Berilmagan (403)
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Ushbu boshqaruv paneli faqat platforma administratori uchun himoyalangan. Tizimga administrator hisobingiz orqali kiring.
                </p>
                <button
                  onClick={() => setCurrentPage('auth')}
                  className="px-6 py-3 rounded-xl bg-[#E05638] hover:bg-[#c94529] text-white text-xs font-mono font-bold uppercase transition-all shadow-md cursor-pointer inline-block"
                >
                  Tizimga Kirish
                </button>
              </div>
            )
          )}

        </main>
      </div>

      {/* Floating Global Audio Player Bar */}
      {activeAudioTrack && (
        <AudioDock
          track={activeAudioTrack}
          onClose={() => setActiveAudioTrack(null)}
          onOpenReader={(bId) => {
            setSelectedBookId(bId);
            navigate('reader');
          }}
        />
      )}

    </div>
  );
}
