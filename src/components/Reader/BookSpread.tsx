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

  // Authentic book pagination:
  // If book has real book_pages from database, paginate across all authentic pages!
  // Otherwise, use word-density typography pagination (~130 words per page).
  const spreads = useMemo(() => {
    if (dbPages.length > 0) {
      const hasAnyText = dbPages.some(p => p.text && p.text.trim().length > 0);
      if (hasAnyText) {
        const result: { left: string[]; right: string[] }[] = [];
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
            left: leftText,
            right: rightText
          });
        }
        return result.length > 0 ? result : [{ left: paragraphs, right: [] }];
      }
    }

    const rawParagraphs = paragraphs;
    if (rawParagraphs.length === 0) {
      return [{ left: ["Sahifa bo'sh."], right: [] }];
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

    const result: { left: string[]; right: string[] }[] = [];
    for (let i = 0; i < pages.length; i += 2) {
      result.push({
        left: pages[i],
        right: pages[i + 1] || []
      });
    }
    return result.length > 0 ? result : [{ left: rawParagraphs, right: [] }];
  }, [chapter, dbPages, paragraphs]);

  const totalSpreads = Math.max(1, spreads.length);
  const currentSpread = spreads[currentPageSpread] || spreads[0] || { left: [], right: [] };
  const leftPageParagraphs = currentSpread.left;
  const rightPageParagraphs = currentSpread.right;

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

  // Real progress sync with backend database (debounced to avoid request flooding)
  const lastSyncedPercent = React.useRef<number>(-1);
  useEffect(() => {
    const totalPages = Math.max(1, totalSpreads * 2);
    const curPage = (currentPageSpread * 2) + 1;
    const percent = Math.min(100, Math.round((curPage / totalPages) * 100));

    if (lastSyncedPercent.current === percent) return;

    const timer = setTimeout(() => {
      lastSyncedPercent.current = percent;
      api.updateProgress(book.id, percent, book.chapters[currentChapterIdx]?.id);
    }, 800);

    return () => clearTimeout(timer);
  }, [currentPageSpread, currentChapterIdx, book.id, totalSpreads]);

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
      
      {/* ── Top Distraction-Free Header (Smooth Hide/Show) ── */}
      <header 
        className={`h-16 px-6 flex items-center justify-between border-b transition-all duration-300 z-30 ${
          showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
        style={{ borderColor: themeStyles.border, backgroundColor: themeStyles.bg }}
      >
        <div className="flex items-center gap-3">
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
            <span className="text-xs font-serif font-bold truncate max-w-[200px] sm:max-w-md" style={{ color: themeStyles.text }}>
              {book.title}
            </span>
            <span className="text-[10px] font-mono opacity-60 truncate" style={{ color: themeStyles.text }}>
              {book.authorName} • {chapter.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Reading Toggle */}
          <button
            onClick={() => {
              setIsAudioPlaying(!isAudioPlaying);
              toast.success(isAudioPlaying ? "Audio to'xtatildi" : "Sinxron ovozli mutolaa faollashdi!", { icon: '🎧' });
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isAudioPlaying 
                ? 'bg-[#E05638] text-white shadow-md animate-pulse' 
                : 'bg-black/10 dark:bg-white/10 hover:bg-[#E05638] hover:text-white'
            }`}
            style={{ color: isAudioPlaying ? '#FFF' : themeStyles.text }}
          >
            {isAudioPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isAudioPlaying ? "Ovozli O'qish" : "Tinglash"}</span>
          </button>

          {/* Table of Contents Drawer Toggle */}
          <button
            onClick={() => setShowToc(true)}
            className="p-2 rounded-xl transition-colors cursor-pointer hover:opacity-80"
            style={{ color: themeStyles.text }}
            title="Mundarija (T)"
          >
            <List size={18} />
          </button>

          {/* Typography Settings Drawer Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-xl transition-colors cursor-pointer hover:opacity-80"
            style={{ color: themeStyles.text }}
            title="Matn sozlamalari"
          >
            <Settings2 size={18} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl transition-colors cursor-pointer hover:opacity-80"
            style={{ color: themeStyles.text }}
            title="To'liq ekran (F)"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
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
        className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-10 overflow-hidden relative"
      >
        
        {readingMode === 'spread' ? (
          /* Mode A: 2-Page Physical Spread */
          <div 
            className="w-full max-w-5xl h-[78vh] rounded-3xl shadow-book-deep relative flex flex-col md:flex-row overflow-hidden border transition-all duration-300"
            style={{ backgroundColor: themeStyles.pageBg, borderColor: themeStyles.border }}
          >
            {/* Center Spine Crease */}
            <div className="hidden md:block book-spread-center-crease" />

            {/* Left Page (Click left zone to turn prev) */}
            <div 
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                if ((e.clientX - rect.left) / rect.width < 0.5) prevPage();
              }}
              className="flex-1 p-8 sm:p-12 flex flex-col justify-between overflow-y-auto border-b md:border-b-0 md:border-r select-none relative"
              style={{ borderColor: themeStyles.border }}
            >
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

              <div className="flex items-center justify-between pt-4 border-t text-[11px] font-mono opacity-50" style={{ borderColor: themeStyles.border, color: themeStyles.text }}>
                <span>Sahifa {currentPageSpread * 2 + 1}</span>
                <span>{book.authorName}</span>
              </div>
            </div>

            {/* Right Page (Click right zone to turn next) */}
            <div 
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                if ((e.clientX - rect.left) / rect.width > 0.5) nextPage();
              }}
              className="hidden md:flex flex-1 p-8 sm:p-12 flex-col justify-between overflow-y-auto select-none relative"
            >
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

              <div className="flex items-center justify-between pt-4 border-t text-[11px] font-mono opacity-50" style={{ borderColor: themeStyles.border, color: themeStyles.text }}>
                <span>{chapter.title}</span>
                <span>Sahifa {currentPageSpread * 2 + 2}</span>
              </div>
            </div>

          </div>
        ) : (
          /* Mode B: Continuous Vertical Reading Scroll */
          <div 
            className="w-full max-w-3xl h-[82vh] overflow-y-auto p-8 sm:p-16 rounded-3xl shadow-lg border transition-all"
            style={{ backgroundColor: themeStyles.pageBg, borderColor: themeStyles.border }}
          >
            <div className="pb-8 border-b mb-8 border-black/10 dark:border-white/10">
              <span className="text-xs font-mono uppercase tracking-widest text-[#E05638] font-bold">
                {book.title}
              </span>
              <h2 className="font-serif text-3xl font-bold mt-2" style={{ color: themeStyles.text }}>
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

      {/* ── Floating Glassmorphic Bottom Navigation HUD Pill (Mutolaa & Play Books style) ── */}
      <footer 
        className={`fixed inset-x-0 bottom-6 z-40 flex flex-col items-center gap-2 px-4 transition-all duration-300 ${
          showControls ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'
        }`}
      >
        
        {/* Floating Page Progress Pill */}
        <div 
          className="flex items-center gap-3 rounded-full px-5 py-1.5 text-xs shadow-xl backdrop-blur-xl border border-white/10"
          style={{ backgroundColor: themeStyles.hudBg, color: themeStyles.hudText }}
        >
          <span className="font-medium truncate max-w-[140px]">{chapter.title}</span>
          <span className="opacity-30">•</span>
          <span className="font-mono">
            {dbPages.length > 0 
              ? `Sahifa ${currentPageSpread * 2 + 1}${dbPages[currentPageSpread * 2 + 1] ? `-${currentPageSpread * 2 + 2}` : ''} / ${dbPages.length}`
              : `${currentPageSpread + 1} / ${totalSpreads} sahifa`
            }
          </span>
          <span className="opacity-30">•</span>
          <span className="opacity-80 font-mono">~{remainingMinutes} daqiqa qoldi</span>
        </div>

        {/* Floating Control Toolbar Pill */}
        <div 
          className="flex flex-col items-center gap-2 rounded-3xl p-3 shadow-2xl backdrop-blur-xl border border-white/10 w-full max-w-xl"
          style={{ backgroundColor: themeStyles.hudBg, color: themeStyles.hudText }}
        >
          {/* Interactive Scrub Rail Slider */}
          <div className="w-full px-3 flex items-center gap-3">
            <button 
              onClick={prevPage}
              disabled={currentPageSpread === 0 && currentChapterIdx === 0}
              className="p-1 text-white/70 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            <input 
              type="range"
              min="0"
              max={Math.max(0, totalSpreads - 1)}
              value={currentPageSpread}
              onChange={(e) => setCurrentPageSpread(Number(e.target.value))}
              className="flex-1 accent-[#E05638] cursor-pointer h-1 bg-white/20 rounded-full"
            />

            <button 
              onClick={nextPage}
              disabled={currentPageSpread >= totalSpreads - 1 && currentChapterIdx >= book.chapters.length - 1}
              className="p-1 text-white/70 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Quick HUD Action Buttons */}
          <div className="flex items-center justify-between w-full px-3 pt-1 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowToc(true)}
                className="p-2 rounded-xl hover:bg-white/10 flex items-center gap-1.5 cursor-pointer"
                title="Mundarija"
              >
                <List size={15} />
                <span className="hidden sm:inline">Mundarija</span>
              </button>

              <button 
                onClick={() => setReadingMode(readingMode === 'spread' ? 'vertical' : 'spread')}
                className="p-2 rounded-xl hover:bg-white/10 flex items-center gap-1.5 cursor-pointer"
                title="Rejimni almashtirish"
              >
                {readingMode === 'spread' ? <Rows size={15} /> : <Columns size={15} />}
                <span className="hidden sm:inline">{readingMode === 'spread' ? "Vertikal o'qish" : "2-Varaqli Yoyilma"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-xl hover:bg-white/10 flex items-center gap-1.5 cursor-pointer"
                title="Shrift & Mavzu"
              >
                <Settings2 size={15} />
                <span className="hidden sm:inline">Shrift</span>
              </button>

              <button 
                onClick={toggleFullscreen}
                className="p-2 rounded-xl hover:bg-white/10 cursor-pointer"
                title="To'liq ekran"
              >
                {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
            </div>
          </div>

        </div>

      </footer>

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
