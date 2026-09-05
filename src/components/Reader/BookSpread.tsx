import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Settings2, 
  Bookmark as BookmarkIcon, 
  Share2, 
  Sun, 
  Moon, 
  BookOpen, 
  Sparkles,
  Volume2,
  Maximize2,
  Minimize2,
  List,
  Columns,
  Rows,
  Highlighter,
  X,
  Play,
  Pause,
  Quote
} from 'lucide-react';
import { Book, ReaderTheme, ReaderFont } from '../../types';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

interface Props {
  book: Book;
  onBack: () => void;
}

export default function BookSpread({ book, onBack }: Props) {
  // Reading States
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [currentPageSpread, setCurrentPageSpread] = useState(0);
  const [readingMode, setReadingMode] = useState<'spread' | 'vertical'>('spread');
  const [theme, setTheme] = useState<ReaderTheme>('sepia');
  const [font, setFont] = useState<ReaderFont>('literata');
  const [fontSize, setFontSize] = useState<number>(18);
  const [lineHeight, setLineHeight] = useState<number>(1.8);
  const [showControls, setShowControls] = useState(true);
  const [showToc, setShowToc] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [selectedText, setSelectedText] = useState<{ text: string; x: number; y: number } | null>(null);
  const [dbPages, setDbPages] = useState<any[]>([]);

  // Fetch real physical pages if available in database
  useEffect(() => {
    let isMounted = true;
    api.getBookPages(book.id).then(pages => {
      if (isMounted && Array.isArray(pages) && pages.length > 0) {
        setDbPages(pages);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [book.id]);

  const containerRef = useRef<HTMLDivElement>(null);
  const chapter = book.chapters[currentChapterIdx] || book.chapters[0];

  const paragraphs = useMemo(() => {
    return chapter.content.split('\n\n').filter(p => p.trim().length > 0);
  }, [chapter]);

  interface PageItem {
    pageNumber: number;
    text: string[];
    imagePath?: string | null;
  }

  interface SpreadGroup {
    left: PageItem;
    right?: PageItem | null;
  }

  // Authentic book pagination:
  // If book has real book_pages from database, paginate across all authentic pages!
  // Otherwise, use word-density typography pagination (~130 words per page).
  const spreads = useMemo<SpreadGroup[]>(() => {
    if (dbPages.length > 0) {
      const hasAnyContent = dbPages.some(p => (p.text && p.text.trim().length > 0) || p.image_path);
      if (hasAnyContent) {
        const result: SpreadGroup[] = [];
        for (let i = 0; i < dbPages.length; i += 2) {
          const pLeft = dbPages[i];
          const pRight = dbPages[i + 1];
          const leftText = pLeft?.text?.trim() 
            ? pLeft.text.split('\n\n').filter(Boolean) 
            : (paragraphs.length > 0 ? paragraphs.slice(0, 2) : [chapter.content || `${book.title} — ${pLeft?.page_number || 1}-sahifa.`]);
          const rightText = pRight?.text?.trim() 
            ? pRight.text.split('\n\n').filter(Boolean) 
            : [];
          result.push({
            left: {
              pageNumber: pLeft?.page_number || (i + 1),
              text: leftText,
              imagePath: pLeft?.image_path || null
            },
            right: pRight ? {
              pageNumber: pRight.page_number || (i + 2),
              text: rightText,
              imagePath: pRight.image_path || null
            } : null
          });
        }
        return result.length > 0 ? result : [{
          left: { pageNumber: 1, text: paragraphs, imagePath: null },
          right: null
        }];
      }
    }

    const rawParagraphs = paragraphs;
    if (rawParagraphs.length === 0) {
      return [{
        left: { pageNumber: 1, text: ["Sahifa bo'sh."], imagePath: null },
        right: null
      }];
    }

    const pages: string[][] = [];
    let currentPage: string[] = [];
    let currentWords = 0;
    const WORDS_PER_PAGE = 130;

    for (const p of rawParagraphs) {
      const pWords = p.split(/\s+/).filter(Boolean).length;
      if (currentWords + pWords > WORDS_PER_PAGE && currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [p];
        currentWords = pWords;
      } else {
        currentPage.push(p);
        currentWords += pWords;
      }
    }
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    const result: SpreadGroup[] = [];
    for (let i = 0; i < pages.length; i += 2) {
      result.push({
        left: {
          pageNumber: i + 1,
          text: pages[i],
          imagePath: null
        },
        right: pages[i + 1] ? {
          pageNumber: i + 2,
          text: pages[i + 1],
          imagePath: null
        } : null
      });
    }
    return result.length > 0 ? result : [{
      left: { pageNumber: 1, text: rawParagraphs, imagePath: null },
      right: null
    }];
  }, [chapter, dbPages, paragraphs, book.title]);

  const totalSpreads = Math.max(1, spreads.length);
  const currentSpread = spreads[currentPageSpread] || spreads[0] || {
    left: { pageNumber: 1, text: [] },
    right: null
  };
  const leftPage = currentSpread.left;
  const rightPage = currentSpread.right;
  const leftPageParagraphs = leftPage.text;
  const rightPageParagraphs = rightPage?.text || [];

  // Approximate remaining minutes
  const remainingMinutes = Math.max(1, Math.ceil((totalSpreads - currentPageSpread) * 1.5));

  const nextPage = () => {
    if (currentPageSpread < totalSpreads - 1) {
      setCurrentPageSpread(prev => prev + 1);
    } else if (currentChapterIdx < book.chapters.length - 1) {
      setCurrentChapterIdx(prev => prev + 1);
      setCurrentPageSpread(0);
      toast.success(`${currentChapterIdx + 2}-Bobga o'tildi!`, { icon: '📖' });
    }
  };

  const prevPage = () => {
    if (currentPageSpread > 0) {
      setCurrentPageSpread(prev => prev - 1);
    } else if (currentChapterIdx > 0) {
      setCurrentChapterIdx(prev => prev - 1);
      setCurrentPageSpread(0);
    }
  };

  // Real progress sync with backend database + Continuous Active Reading Heartbeat for Leaderboard
  const lastSyncedPercent = React.useRef<number>(-1);
  const lastUserInteraction = React.useRef<number>(Date.now());

  // Track user activity (mouse, touch, scroll, keyboard)
  useEffect(() => {
    const markActive = () => {
      lastUserInteraction.current = Date.now();
    };
    window.addEventListener('mousemove', markActive, { passive: true });
    window.addEventListener('scroll', markActive, { passive: true });
    window.addEventListener('touchstart', markActive, { passive: true });
    window.addEventListener('keydown', markActive, { passive: true });
    return () => {
      window.removeEventListener('mousemove', markActive);
      window.removeEventListener('scroll', markActive);
      window.removeEventListener('touchstart', markActive);
      window.removeEventListener('keydown', markActive);
    };
  }, []);

  // 1. Sync on page turn
  useEffect(() => {
    const totalPages = Math.max(1, totalSpreads * 2);
    const curPage = (currentPageSpread * 2) + 1;
    const percent = Math.min(100, Math.round((curPage / totalPages) * 100));

    if (lastSyncedPercent.current === percent) return;

    const timer = setTimeout(() => {
      lastSyncedPercent.current = percent;
      api.updateProgress(book.id, percent, book.chapters[currentChapterIdx]?.id, 0);
    }, 800);

    return () => clearTimeout(timer);
  }, [currentPageSpread, currentChapterIdx, book.id, totalSpreads]);

  // 2. Continuous Active Reading Heartbeat (Every 30 seconds: logs reading time & awards Leaderboard points)
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden) return; // Tab is in background

      // Allow up to 5 minutes of stillness while reading a single long page or listening to audio
      const idleSeconds = (Date.now() - lastUserInteraction.current) / 1000;
      const isReadingActive = idleSeconds < 300 || isAudioPlaying;

      if (isReadingActive) {
        const totalPages = Math.max(1, totalSpreads * 2);
        const curPage = (currentPageSpread * 2) + 1;
        const percent = Math.min(100, Math.round((curPage / totalPages) * 100));
        
        // Send 30 seconds of verified reading time to backend
        api.updateProgress(book.id, percent, book.chapters[currentChapterIdx]?.id, 30);
      }
    }, 30000); // Pulse every 30 seconds

    return () => clearInterval(interval);
  }, [book.id, currentPageSpread, currentChapterIdx, totalSpreads, isAudioPlaying]);

  // Fullscreen API toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Keyboard navigation & Esc listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextPage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevPage();
      } else if (e.key === 'Escape') {
        setShowToc(false);
        setShowSettings(false);
        setSelectedText(null);
      } else if (e.key.toLowerCase() === 't') {
        setShowToc(prev => !prev);
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageSpread, currentChapterIdx, totalSpreads]);

  // Audio sentence karaoke sync simulator
  useEffect(() => {
    let interval: any = null;
    if (isAudioPlaying) {
      interval = setInterval(() => {
        setActiveSentenceIdx(prev => {
          if (prev === null) return 0;
          if (prev >= 6) {
            nextPage();
            return 0;
          }
          return prev + 1;
        });
      }, 4000);
    } else {
      setActiveSentenceIdx(null);
    }
    return () => clearInterval(interval);
  }, [isAudioPlaying, currentPageSpread]);

  // Text selection handler for contextual highlight menu
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 3) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText({
        text: selection.toString().trim(),
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    } else {
      setSelectedText(null);
    }
  };

  // Theme styles token dictionary
  const themeStyles = {
    white: {
      bg: '#FAFAF9',
      pageBg: '#FFFFFF',
      text: '#18181B',
      textSec: '#71717A',
      border: '#E7E5E4',
      crease: 'rgba(0,0,0,0.06)',
      accent: '#E05638',
      hudBg: 'rgba(0, 0, 0, 0.85)',
      hudText: '#FFFFFF'
    },
    sepia: {
      bg: '#F5EEDB',
      pageBg: '#FAF4E1',
      text: '#4A331E',
      textSec: '#8C6A48',
      border: '#E8DCB8',
      crease: 'rgba(92,68,30,0.12)',
      accent: '#C5A059',
      hudBg: 'rgba(35, 25, 15, 0.90)',
      hudText: '#F5EEDB'
    },
    parchment: {
      bg: '#EDE2CC',
      pageBg: '#F5EBD4',
      text: '#342516',
      textSec: '#7A644D',
      border: '#DECFAC',
      crease: 'rgba(70,50,20,0.15)',
      accent: '#7F602B',
      hudBg: 'rgba(40, 30, 20, 0.90)',
      hudText: '#F5EBD4'
    },
    dark: {
      bg: '#0A0D14',
      pageBg: '#121620',
      text: '#E2E8F0',
      textSec: '#94A3B8',
      border: 'rgba(255,255,255,0.08)',
      crease: 'rgba(0,0,0,0.6)',
      accent: '#C5A059',
      hudBg: 'rgba(18, 22, 32, 0.95)',
      hudText: '#FFFFFF'
    }
  }[theme];

  const fontClass = {
    literata: 'font-serif',
    georgia: 'font-serif',
    merriweather: 'font-serif',
    sans: 'font-sans'
  }[font];

  return (
    <div 
      ref={containerRef}
      onMouseUp={handleMouseUp}
      className="min-h-screen flex flex-col transition-colors duration-300 relative select-text overflow-hidden"
      style={{ backgroundColor: themeStyles.bg }}
    >
      
      {/* ── Top Distraction-Free Header (Smooth Hide/Show, Never Covers Book Words!) ── */}
      <header 
        className={`px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between border-b transition-all duration-300 z-30 gap-3 shrink-0 ${
          showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
        style={{ borderColor: themeStyles.border, backgroundColor: themeStyles.bg }}
      >
        {/* Left: Back to library + Book Title */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl transition-colors cursor-pointer hover:opacity-80 flex items-center gap-2 text-xs font-mono font-bold"
            style={{ color: themeStyles.text }}
            title="Kutubxonaga qaytish"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Chiqish</span>
          </button>
          
          <div className="flex flex-col">
            <span className="text-xs font-serif font-bold truncate max-w-[130px] sm:max-w-[200px]" style={{ color: themeStyles.text }}>
              {book.title}
            </span>
            <span className="text-[10px] font-mono opacity-60 truncate max-w-[130px] sm:max-w-[200px]" style={{ color: themeStyles.text }}>
              {chapter.title}
            </span>
          </div>
        </div>

        {/* Center: Page Scrubber Rail & Progress Pill (Moved to Header so it never covers words!) */}
        <div 
          className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 rounded-full border shadow-xs select-none"
          style={{ backgroundColor: themeStyles.pageBg, borderColor: themeStyles.border }}
        >
          <button 
            onClick={prevPage}
            disabled={currentPageSpread === 0 && currentChapterIdx === 0}
            className="p-1 rounded-md hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            style={{ color: themeStyles.text }}
            title="Oldingi sahifa (←)"
          >
            <ChevronLeft size={15} />
          </button>

          <input 
            type="range"
            min="0"
            max={Math.max(0, totalSpreads - 1)}
            value={currentPageSpread}
            onChange={(e) => setCurrentPageSpread(Number(e.target.value))}
            className="w-20 sm:w-28 md:w-36 lg:w-44 accent-[#E05638] cursor-pointer h-1.5 bg-black/20 dark:bg-white/20 rounded-full"
            title="Sahifani siljitish"
          />

          <button 
            onClick={nextPage}
            disabled={currentPageSpread >= totalSpreads - 1 && currentChapterIdx >= book.chapters.length - 1}
            className="p-1 rounded-md hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            style={{ color: themeStyles.text }}
            title="Keyingi sahifa (→)"
          >
            <ChevronRight size={15} />
          </button>

          <span className="opacity-30 font-mono text-xs">•</span>

          <span className="text-xs font-mono font-bold whitespace-nowrap" style={{ color: themeStyles.text }}>
            {dbPages.length > 0 
              ? `Sahifa ${currentPageSpread * 2 + 1}${dbPages[currentPageSpread * 2 + 1] ? `-${currentPageSpread * 2 + 2}` : ''} / ${dbPages.length}`
              : `${currentPageSpread + 1} / ${totalSpreads} sahifa`
            }
          </span>

          <span className="opacity-30 font-mono text-xs hidden lg:inline">•</span>

          <span className="text-[11px] font-mono opacity-70 whitespace-nowrap hidden lg:inline" style={{ color: themeStyles.text }}>
            ~{remainingMinutes} daq qoldi
          </span>
        </div>

        {/* Right: Controls & Reading Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Audio Reading Toggle */}
          <button
            onClick={() => {
              setIsAudioPlaying(!isAudioPlaying);
              toast.success(isAudioPlaying ? "Audio to'xtatildi" : "Sinxron ovozli mutolaa faollashdi!", { icon: '🎧' });
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isAudioPlaying 
                ? 'bg-[#E05638] text-white shadow-md animate-pulse' 
                : 'bg-black/10 dark:bg-white/10 hover:bg-[#E05638] hover:text-white'
            }`}
            style={{ color: isAudioPlaying ? '#FFF' : themeStyles.text }}
            title="Ovozli o'qish"
          >
            {isAudioPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span className="hidden md:inline">{isAudioPlaying ? "Ovozli O'qish" : "Tinglash"}</span>
          </button>

          {/* Reading Mode Toggle (Spread vs Vertical) */}
          <button
            onClick={() => setReadingMode(readingMode === 'spread' ? 'vertical' : 'spread')}
            className="p-2 rounded-xl transition-colors cursor-pointer hover:opacity-80 flex items-center gap-1"
            style={{ color: themeStyles.text }}
            title={readingMode === 'spread' ? "Vertikal o'qish rejimiga o'tish" : "2-Varaqli Yoyilmaga o'tish"}
          >
            {readingMode === 'spread' ? <Rows size={17} /> : <Columns size={17} />}
            <span className="hidden xl:inline text-xs font-mono">
              {readingMode === 'spread' ? "Vertikal" : "Yoyilma"}
            </span>
          </button>

          {/* Table of Contents Drawer Toggle */}
          <button
            onClick={() => setShowToc(true)}
            className="p-2 rounded-xl transition-colors cursor-pointer hover:opacity-80 flex items-center gap-1"
            style={{ color: themeStyles.text }}
            title="Mundarija (T)"
          >
            <List size={17} />
            <span className="hidden xl:inline text-xs font-mono">Mundarija</span>
          </button>

          {/* Typography Settings Drawer Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-xl transition-colors cursor-pointer hover:opacity-80 flex items-center gap-1"
            style={{ color: themeStyles.text }}
            title="Matn sozlamalari & Mavzular"
          >
            <Settings2 size={17} />
            <span className="hidden xl:inline text-xs font-mono">Shrift</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl transition-colors cursor-pointer hover:opacity-80"
            style={{ color: themeStyles.text }}
            title="To'liq ekran (F)"
          >
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
        </div>
      </header>

      {/* ── Contextual Text Selection Floating Menu ── */}
      {selectedText && (
        <div 
          className="fixed z-50 rounded-2xl shadow-2xl p-1.5 flex items-center gap-1 backdrop-blur-xl border border-white/20 animate-in zoom-in-95 text-white"
          style={{ 
            left: `${Math.min(window.innerWidth - 220, Math.max(20, selectedText.x - 100))}px`,
            top: `${Math.max(20, selectedText.y - 50)}px`,
            backgroundColor: 'rgba(18, 22, 32, 0.95)'
          }}
        >
          <button 
            onClick={() => {
              toast.success("Iqtibos saqlandi!", { icon: '✨' });
              setSelectedText(null);
            }}
            className="px-2.5 py-1 text-xs font-mono font-bold hover:bg-white/10 rounded-lg flex items-center gap-1 cursor-pointer"
          >
            <Highlighter size={12} className="text-amber-400" />
            <span>Belgilash</span>
          </button>

          <button 
            onClick={() => {
              toast.success(`"${selectedText.text.slice(0, 30)}..." ovozda o'qilmoqda`, { icon: '🗣️' });
              setSelectedText(null);
            }}
            className="px-2.5 py-1 text-xs font-mono font-bold hover:bg-white/10 rounded-lg flex items-center gap-1 cursor-pointer"
          >
            <Volume2 size={12} className="text-[#E05638]" />
            <span>O'qib berish</span>
          </button>
        </div>
      )}

      {/* ── Main Reader Viewport (Dual Mode: 2-Page Spread vs Continuous Vertical) ── */}
      <main 
        onClick={(e) => {
          // Toggle HUD on click center
          const rect = e.currentTarget.getBoundingClientRect();
          const clickXRatio = (e.clientX - rect.left) / rect.width;
          if (clickXRatio > 0.25 && clickXRatio < 0.75) {
            setShowControls(!showControls);
          }
        }}
        className="flex-1 flex items-center justify-center p-1 sm:p-3 md:p-4 overflow-hidden relative"
      >
        
        {readingMode === 'spread' ? (
          /* Mode A: Widescreen Grand 2-Page Physical Spread (Matching exact user screenshot) */
          <div className="relative w-full max-w-[97vw] 2xl:max-w-[1600px] flex items-center justify-center my-auto">
            <div 
              className="w-full h-[85vh] 2xl:h-[87vh] rounded-2xl md:rounded-3xl border-[6px] sm:border-[8px] border-[#383330] dark:border-[#221F1D] shadow-[0_25px_65px_rgba(0,0,0,0.45)] relative flex flex-col md:flex-row overflow-hidden transition-all duration-300"
              style={{ backgroundColor: themeStyles.pageBg, borderColor: '#383330' }}
            >
              {/* Center Spine Crease (Realistic Book Fold) */}
              <div 
                className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-10 sm:w-14 pointer-events-none z-20"
                style={{
                  background: 'linear-gradient(to right, rgba(0,0,0,0.13) 0%, rgba(0,0,0,0.04) 30%, rgba(0,0,0,0.01) 50%, rgba(0,0,0,0.04) 70%, rgba(0,0,0,0.13) 100%)',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)'
                }}
              />

              {/* Left Page (Click left zone to turn prev) */}
              <div 
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  if ((e.clientX - rect.left) / rect.width < 0.5) prevPage();
                }}
                className="flex-1 p-6 sm:p-10 md:p-12 lg:p-14 flex flex-col justify-between overflow-y-auto border-b md:border-b-0 md:border-r select-none relative"
                style={{ borderColor: themeStyles.border }}
              >
                {leftPage.imagePath ? (
                  <div className="w-full h-full flex items-center justify-center p-1 overflow-hidden my-auto">
                    <img 
                      src={leftPage.imagePath.startsWith('http') ? leftPage.imagePath : `https://bookify-vz6r.onrender.com${leftPage.imagePath}`} 
                      alt={`Sahifa ${leftPage.pageNumber}`} 
                      className="max-h-full max-w-full object-contain rounded-md shadow-xs select-none" 
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentPageSpread === 0 && (
                      <div className="pb-4 border-b border-black/10 dark:border-white/10">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#E05638] font-bold">
                          {book.title}
                        </span>
                        <h2 className="font-serif text-xl sm:text-2xl font-bold mt-1" style={{ color: themeStyles.text }}>
                          {chapter.title}
                        </h2>
                      </div>
                    )}

                    <div 
                      className={`${fontClass} leading-relaxed text-justify transition-all`}
                      style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight, color: themeStyles.text }}
                    >
                      {leftPageParagraphs.map((p, idx) => (
                        <p 
                          key={idx} 
                          className={`mb-4 text-indent-8 transition-colors p-1 rounded-md ${
                            activeSentenceIdx === idx ? 'bg-[#E05638]/15 ring-2 ring-[#E05638]/40' : ''
                          }`}
                        >
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t text-[11px] font-mono opacity-50 shrink-0 mt-2" style={{ borderColor: themeStyles.border, color: themeStyles.text }}>
                  <span>Sahifa {leftPage.pageNumber}</span>
                  <span>{book.authorName}</span>
                </div>
              </div>

              {/* Right Page (Click right zone to turn next) */}
              <div 
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  if ((e.clientX - rect.left) / rect.width > 0.5) nextPage();
                }}
                className="hidden md:flex flex-1 p-6 sm:p-10 md:p-12 lg:p-14 flex-col justify-between overflow-y-auto select-none relative"
              >
                {rightPage ? (
                  rightPage.imagePath ? (
                    <div className="w-full h-full flex items-center justify-center p-1 overflow-hidden my-auto">
                      <img 
                        src={rightPage.imagePath.startsWith('http') ? rightPage.imagePath : `https://bookify-vz6r.onrender.com${rightPage.imagePath}`} 
                        alt={`Sahifa ${rightPage.pageNumber}`} 
                        className="max-h-full max-w-full object-contain rounded-md shadow-xs select-none" 
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div 
                        className={`${fontClass} leading-relaxed text-justify transition-all`}
                        style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight, color: themeStyles.text }}
                      >
                        {rightPageParagraphs.length > 0 ? (
                          rightPageParagraphs.map((p, idx) => (
                            <p 
                              key={idx} 
                              className={`mb-4 text-indent-8 transition-colors p-1 rounded-md ${
                                activeSentenceIdx === (idx + 2) ? 'bg-[#E05638]/15 ring-2 ring-[#E05638]/40' : ''
                              }`}
                            >
                              {p}
                            </p>
                          ))
                        ) : (
                          <div className="py-20 text-center space-y-4 opacity-70">
                            <Sparkles size={24} className="mx-auto text-[#E05638]" />
                            <p className="font-serif italic text-sm">
                              "{book.featuredQuote}"
                            </p>
                            <span className="text-xs font-mono block">— {book.title}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="py-20 text-center space-y-4 opacity-70">
                    <Sparkles size={24} className="mx-auto text-[#E05638]" />
                    <p className="font-serif italic text-sm">
                      "{book.featuredQuote}"
                    </p>
                    <span className="text-xs font-mono block">— {book.title}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t text-[11px] font-mono opacity-50 shrink-0 mt-2" style={{ borderColor: themeStyles.border, color: themeStyles.text }}>
                  <span>{chapter.title}</span>
                  <span>Sahifa {rightPage ? rightPage.pageNumber : leftPage.pageNumber + 1}</span>
                </div>
              </div>

            </div>

            {/* Exact Bottom Capsule Indicator from screenshot */}
            <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 z-30 px-4 py-1 rounded-full bg-[#262626] border border-white/10 text-white/95 text-xs font-mono font-medium shadow-xl pointer-events-none select-none tracking-wider">
              {dbPages.length > 0 
                ? `${leftPage.pageNumber} / ${dbPages.length} sahifa`
                : `${currentPageSpread + 1} / ${totalSpreads} sahifa`
              }
            </div>
          </div>
        ) : (
          /* Mode B: Continuous Vertical Reading Scroll */
          <div 
            className="w-full max-w-3xl h-[85vh] 2xl:h-[87vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 sm:p-12 transition-all"
            style={{ backgroundColor: themeStyles.pageBg, borderColor: themeStyles.border }}
          >
            <div className="pb-8 mb-8 border-b border-black/10 dark:border-white/10">
              <span className="text-xs font-mono uppercase tracking-widest text-[#E05638] font-bold">
                {book.title}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold mt-1" style={{ color: themeStyles.text }}>
                {chapter.title}
              </h2>
            </div>

            <div 
              className={`${fontClass} leading-relaxed text-justify space-y-6`}
              style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight, color: themeStyles.text }}
            >
              {paragraphs.map((p, idx) => (
                <p key={idx} className="text-indent-8">{p}</p>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ── Side Page Turn Chevrons (Positioned in the outer margins, completely outside the book text!) ── */}
      {readingMode === 'spread' && (
        <>
          <button
            onClick={prevPage}
            disabled={currentPageSpread === 0 && currentChapterIdx === 0}
            className={`fixed left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full shadow-xl border border-black/10 dark:border-white/10 backdrop-blur-md transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer hover:scale-110 active:scale-95 ${
              showControls ? 'opacity-80 hover:opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            style={{ backgroundColor: themeStyles.pageBg, color: themeStyles.text }}
            title="Oldingi sahifa (←)"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            onClick={nextPage}
            disabled={currentPageSpread >= totalSpreads - 1 && currentChapterIdx >= book.chapters.length - 1}
            className={`fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full shadow-xl border border-black/10 dark:border-white/10 backdrop-blur-md transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer hover:scale-110 active:scale-95 ${
              showControls ? 'opacity-80 hover:opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            style={{ backgroundColor: themeStyles.pageBg, color: themeStyles.text }}
            title="Keyingi sahifa (→)"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* ── Table of Contents (Mundarija) Slide-in Drawer ── */}
      {showToc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-start">
          <aside 
            className="w-84 max-w-[85vw] h-full shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-left duration-300"
            style={{ backgroundColor: themeStyles.pageBg, color: themeStyles.text }}
          >
            <div className="space-y-6 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
                <div className="flex items-center gap-2 font-serif font-bold text-base">
                  <List size={18} className="text-[#E05638]" />
                  <span>Asar Mundarijasi</span>
                </div>
                <button onClick={() => setShowToc(false)} className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-1">
                {book.chapters.map((ch, idx) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setCurrentChapterIdx(idx);
                      setCurrentPageSpread(0);
                      setShowToc(false);
                      toast.success(`"${ch.title}" ochildi!`);
                    }}
                    className={`w-full text-left p-3 rounded-2xl text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                      currentChapterIdx === idx 
                        ? 'bg-[#E05638] text-white font-bold shadow-md' 
                        : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <span className="truncate">{ch.title}</span>
                    <span className="text-[10px] font-mono opacity-60">Bob {idx + 1}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-black/10 dark:border-white/10 text-center text-xs font-mono opacity-50">
              {book.title} • {book.authorName}
            </div>
          </aside>
          <div className="flex-1" onClick={() => setShowToc(false)} />
        </div>
      )}

      {/* ── Typography & Themes Popover Modal ── */}
      {showSettings && (
        <div 
          className="fixed bottom-28 right-6 z-50 w-80 p-5 rounded-3xl shadow-2xl border backdrop-blur-2xl transition-all space-y-4 animate-in zoom-in-95"
          style={{ backgroundColor: themeStyles.pageBg, borderColor: themeStyles.border, color: themeStyles.text }}
        >
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: themeStyles.border }}>
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Matn & Mavzu</span>
            <button onClick={() => setShowSettings(false)} className="text-xs opacity-60 hover:opacity-100">✕</button>
          </div>

          {/* Theme Selector */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium opacity-70">Sahifa Fon Mavzusi</span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'white', label: 'Oq', bg: '#FFFFFF', border: '#E2E8F0' },
                { id: 'sepia', label: 'Sepiya', bg: '#FBF0D9', border: '#D9C8A9' },
                { id: 'parchment', label: 'Pergament', bg: '#F5EBD4', border: '#C5B58D' },
                { id: 'dark', label: 'Obsidiyan', bg: '#121620', border: '#334155' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as ReaderTheme)}
                  className={`py-2 rounded-xl text-[10px] font-bold transition-transform cursor-pointer border ${
                    theme === t.id ? 'ring-2 ring-[#E05638] scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: t.bg, borderColor: t.border, color: t.id === 'dark' ? '#FFF' : '#000' }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Selector */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium opacity-70">Shrift Turi</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'literata', label: 'Literata Serif' },
                { id: 'georgia', label: 'Georgia Serif' },
                { id: 'merriweather', label: 'Merriweather' },
                { id: 'sans', label: 'Jakarta Sans' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFont(f.id as ReaderFont)}
                  className={`p-2 rounded-xl text-xs text-left transition-colors cursor-pointer border ${
                    font === f.id ? 'border-[#E05638] font-bold bg-[#E05638]/10' : 'opacity-70 border-transparent hover:opacity-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: themeStyles.border }}>
            <div className="flex items-center justify-between text-xs">
              <span className="opacity-70">Shrift Kattaligi</span>
              <span className="font-mono font-bold">{fontSize}px</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setFontSize(Math.max(14, fontSize - 1))} className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold">A-</button>
              <input type="range" min="14" max="28" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="flex-1 accent-[#E05638]" />
              <button onClick={() => setFontSize(Math.min(28, fontSize + 1))} className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold">A+</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
