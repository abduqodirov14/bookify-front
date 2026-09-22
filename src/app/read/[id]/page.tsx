"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Clock, Play, X, ChevronLeft, ChevronRight, 
  BookOpen, ZoomIn, ZoomOut, Loader2, Maximize, Minimize,
  Columns2, Square
} from "lucide-react";
import { api, resolveFileUrl } from "@/services/api";

interface PageItem {
  page_number: number;
  text?: string | null;
  image_path?: string | null;
}

export default function ReadBookPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [book, setBook] = useState<any>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  // In two-page spread: currentSpreadIndex tracks the left page (0-indexed: 0 means pages 1 & 2)
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSpreadMode, setIsSpreadMode] = useState(true); // true = 2 pages, false = 1 page
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(17);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isZenModalOpen, setIsZenModalOpen] = useState(false);
  const [zenTime, setZenTime] = useState(30);

  const bookContainerRef = useRef<HTMLDivElement | null>(null);

  // Detect Mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsSpreadMode(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load Book and Pages
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    api.getBookById(id)
      .then((bData) => setBook(bData))
      .catch((err) => console.warn("Could not load book:", err));

    api.getBookPages(id)
      .then((pageList) => {
        if (Array.isArray(pageList) && pageList.length > 0) {
          const sorted = pageList.sort((a, b) => (a.page_number || 0) - (b.page_number || 0));
          setPages(sorted);
          setLoading(false);
          return;
        }

        // Fallback: try reader endpoint
        return api.getBookReader(id).then((readerData) => {
          if (readerData?.pages && readerData.pages.length > 0) {
            setPages(readerData.pages);
          } else if (readerData?.chapters && readerData.chapters.length > 0) {
            const synthPages: PageItem[] = [];
            let pNum = 1;
            for (const ch of readerData.chapters) {
              const chTitle = ch.title || `${ch.index}-bob`;
              const textContent = ch.sentences && ch.sentences.length > 0
                ? ch.sentences.map((s: any) => s.text).join(" ")
                : (ch.content || "");

              const paras = textContent.split(/\n\s*\n/).filter(Boolean);
              if (paras.length === 0) paras.push(textContent || "Ushbu bob matni.");

              synthPages.push({
                page_number: pNum++,
                text: `${chTitle}\n\n${paras.join("\n\n")}`,
                image_path: null
              });
            }
            setPages(synthPages);
          } else {
            setPages([
              {
                page_number: 1,
                text: `1-Bob: Kirish\n\nUshbu asar Bookify raqamli kutubxonasiga muvaffaqiyatli yuklandi va mutolaaga tayyor holatda turibdi.`,
                image_path: null
              }
            ]);
          }
          setLoading(false);
        });
      })
      .catch((err) => {
        console.warn("Could not load pages:", err);
        setPages([
          {
            page_number: 1,
            text: "Ushbu asar mutolaaga tayyorlanmoqda.",
            image_path: null
          }
        ]);
        setLoading(false);
      });
  }, [id]);

  // Page Step Size: in spread mode step by 2, in single mode step by 1
  const step = (!isMobile && isSpreadMode) ? 2 : 1;
  const totalPages = pages.length;

  const nextPage = useCallback(() => {
    setCurrentSpreadIndex((prev) => {
      const next = prev + step;
      if (next < totalPages) {
        return next;
      }
      return prev;
    });
  }, [step, totalPages]);

  const prevPage = useCallback(() => {
    setCurrentSpreadIndex((prev) => {
      const p = prev - step;
      if (p >= 0) {
        return p;
      }
      return 0;
    });
  }, [step]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        nextPage();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prevPage();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextPage, prevPage]);

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Determine current active pages for spread
  const leftPage = pages[currentSpreadIndex] || null;
  const rightPage = (!isMobile && isSpreadMode) ? (pages[currentSpreadIndex + 1] || null) : null;

  // Bottom Pill Badge Text (Matching Image 2: "1 / 11 sahifa" or "2-3 / 11 sahifa")
  const getBadgeText = () => {
    if (totalPages === 0) return "0 / 0 sahifa";
    if (isMobile || !isSpreadMode || !rightPage) {
      return `${(leftPage?.page_number || currentSpreadIndex + 1)} / ${totalPages} sahifa`;
    }
    const p1 = leftPage?.page_number || currentSpreadIndex + 1;
    const p2 = rightPage?.page_number || currentSpreadIndex + 2;
    if (currentSpreadIndex === 0) {
      // If at start, show "1 / total sahifa" just like Image 2
      return `1 / ${totalPages} sahifa`;
    }
    return `${p1}-${p2} / ${totalPages} sahifa`;
  };

  // Render text content cleanly formatted matching classical typesetting
  const renderTextContent = (rawText: string | null | undefined, pageNum: number) => {
    if (!rawText) return null;
    const paras = rawText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

    // If it's the title page (page 1) and looks like book intro:
    if (pageNum === 1 && paras.length <= 4) {
      return (
        <div className="h-full flex flex-col justify-between py-10 px-6 sm:px-12 text-center font-serif">
          <div className="text-base sm:text-lg font-medium text-gray-800 tracking-wide">
            {book?.author || "Muallif"}
          </div>
          <div className="space-y-4 my-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-wider text-gray-900 leading-tight">
              {book?.title || "Asar Nomi"}
            </h1>
            <p className="text-xs sm:text-sm italic text-gray-600 font-sans">
              Elektron nashr
            </p>
          </div>
          <div className="text-xs text-gray-500 font-sans space-y-1">
            <p>Bookify Raqamli Kutubxonasi</p>
            <p>{book?.published_year || 2025}</p>
          </div>
        </div>
      );
    }

    return (
      <div 
        className="h-full overflow-y-auto px-6 sm:px-10 py-8 font-serif leading-[1.9] text-gray-900 select-text"
        style={{ fontSize: `${fontSize}px` }}
      >
        {paras.map((para, idx) => {
          const isHeading = para.length < 80 && /^(bob|fasl|chapter|\d+[\.\-]|boshlashdan|muqaddima|xotima)/i.test(para);
          if (isHeading) {
            return (
              <h2 key={idx} className="text-center font-bold text-lg sm:text-xl my-6 text-gray-950 font-sans tracking-wide">
                {para}
              </h2>
            );
          }
          return (
            <p key={idx} className="mb-4 text-justify indent-6 text-gray-800">
              {para}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#D9D7D2] flex flex-col items-center justify-between select-none relative overflow-x-hidden font-sans">
      
      {/* ─── Top Floating Controls Bar ────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-300 px-4 sm:px-8 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push(`/book/${id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-100 rounded-xl text-xs font-bold text-gray-700 border border-stone-300 transition-colors cursor-pointer shadow-2xs"
            title="Asarga qaytish"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Asarga qaytish</span>
          </button>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
              {book?.title || "Kitob Mutolaasi"}
            </h1>
            <p className="text-[10px] text-gray-500 font-medium truncate">
              {book?.author || "Muallif"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Spread Mode Toggle (Desktop only) */}
          {!isMobile && (
            <button
              onClick={() => setIsSpreadMode(!isSpreadMode)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-stone-100 rounded-xl text-xs font-semibold text-gray-700 border border-stone-300 cursor-pointer shadow-2xs"
              title={isSpreadMode ? "Bitta sahifali ko'rinish" : "Ikki sahifali yoyilma"}
            >
              {isSpreadMode ? <Columns2 size={15} className="text-[#E05638]" /> : <Square size={15} />}
              <span className="hidden lg:inline text-[11px]">{isSpreadMode ? "2 Sahifali" : "1 Sahifali"}</span>
            </button>
          )}

          {/* Font Size Adjusters (for text pages) */}
          <div className="hidden sm:flex items-center bg-white border border-stone-300 rounded-xl px-1.5 py-0.5 shadow-2xs">
            <button 
              onClick={() => setFontSize((f) => Math.max(13, f - 1))}
              className="px-1.5 py-1 text-xs font-bold text-gray-600 hover:text-black cursor-pointer"
              title="Kichraytirish"
            >
              A-
            </button>
            <span className="text-[11px] text-gray-400 font-mono px-1">{fontSize}</span>
            <button 
              onClick={() => setFontSize((f) => Math.min(24, f + 1))}
              className="px-1.5 py-1 text-xs font-bold text-gray-600 hover:text-black cursor-pointer"
              title="Kattalashtirish"
            >
              A+
            </button>
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white hover:bg-stone-100 rounded-xl border border-stone-300 text-gray-700 cursor-pointer shadow-2xs"
            title={isFullscreen ? "To'liq ekrandan chiqish" : "To'liq ekran"}
          >
            {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
          </button>

          {/* Zen Mode */}
          <button
            onClick={() => setIsZenModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-stone-100 rounded-xl text-xs font-bold text-gray-700 border border-stone-300 cursor-pointer shadow-2xs"
          >
            <Clock size={14} className="text-[#E05638]" />
            <span className="hidden sm:inline">Zen</span>
          </button>
        </div>
      </header>

      {/* ─── Main Two-Page Spread Book Stage (Image 2 Design) ──────── */}
      <main className="flex-1 w-full flex items-center justify-center pt-16 pb-20 px-2 sm:px-6 md:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-32">
            <Loader2 size={40} className="animate-spin text-[#E05638]" />
            <p className="text-sm font-medium text-gray-600">Kitob sahifalari ochilmoqda...</p>
          </div>
        ) : (
          <div className="relative w-full max-w-6xl flex flex-col items-center my-auto">
            
            {/* ─── The Realistic Open Book Spread ─────────────────────── */}
            <div 
              ref={bookContainerRef}
              className={`relative w-full bg-[#FAF9F6] border-[1.5px] border-[#202020] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.35)] transition-all ${
                (!isMobile && isSpreadMode)
                  ? "grid grid-cols-2 min-h-[580px] md:min-h-[660px] lg:h-[740px]"
                  : "flex flex-col min-h-[540px] max-w-xl mx-auto"
              }`}
            >
              {/* ─── Center Spine Crease & Notch (Image 2 signature element) ─ */}
              {(!isMobile && isSpreadMode) && (
                <>
                  {/* Top center spine notch | */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-3.5 bg-[#202020] z-30" />
                  
                  {/* Vertical spine divider line */}
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-[#202020]/20 z-20 pointer-events-none" />

                  {/* Left page right spine shadow */}
                  <div className="absolute top-0 bottom-0 left-0 right-1/2 pointer-events-none z-10 flex justify-end">
                    <div className="w-10 sm:w-16 h-full bg-gradient-to-l from-black/14 via-black/4 to-transparent" />
                  </div>

                  {/* Right page left spine shadow */}
                  <div className="absolute top-0 bottom-0 left-1/2 right-0 pointer-events-none z-10 flex justify-start">
                    <div className="w-10 sm:w-16 h-full bg-gradient-to-r from-black/14 via-black/4 to-transparent" />
                  </div>
                </>
              )}

              {/* ─── Left Page ────────────────────────────────────────── */}
              <div 
                onClick={prevPage}
                className="relative h-full w-full flex flex-col justify-between overflow-hidden cursor-pointer group bg-[#FCFBF9]"
                title="Oldingi sahifaga o'tish"
              >
                {/* Content */}
                <div className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
                  {leftPage?.image_path ? (
                    <img
                      src={resolveFileUrl(leftPage.image_path)}
                      alt={`Sahifa ${leftPage.page_number}`}
                      className="max-h-full max-w-full object-contain pointer-events-none select-none"
                      loading="eager"
                    />
                  ) : (
                    renderTextContent(leftPage?.text, leftPage?.page_number || 1)
                  )}
                </div>

                {/* Subtle Hover Chevron on left page */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/5 group-hover:bg-black/10 flex items-center justify-center text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <ChevronLeft size={18} />
                </div>
              </div>

              {/* ─── Right Page (Spread Mode) ─────────────────────────── */}
              {(!isMobile && isSpreadMode) && (
                <div 
                  onClick={nextPage}
                  className="relative h-full w-full flex flex-col justify-between overflow-hidden cursor-pointer group bg-[#FCFBF9] border-l border-stone-200"
                  title="Keyingi sahifaga o'tish"
                >
                  {/* Content */}
                  <div className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
                    {rightPage ? (
                      rightPage.image_path ? (
                        <img
                          src={resolveFileUrl(rightPage.image_path)}
                          alt={`Sahifa ${rightPage.page_number}`}
                          className="max-h-full max-w-full object-contain pointer-events-none select-none"
                          loading="eager"
                        />
                      ) : (
                        renderTextContent(rightPage.text, rightPage.page_number)
                      )
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-300 font-serif italic text-sm">
                        Asar yakuni
                      </div>
                    )}
                  </div>

                  {/* Subtle Hover Chevron on right page */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/5 group-hover:bg-black/10 flex items-center justify-center text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <ChevronRight size={18} />
                  </div>
                </div>
              )}

              {/* ─── Bottom Centered Pill Badge (Exact Image 2 Style) ─── */}
              <div className="absolute bottom-[-13px] left-1/2 -translate-x-1/2 z-30">
                <div className="bg-[#303030] text-white px-3.5 py-1 rounded-full text-[11px] font-sans font-medium tracking-wide shadow-md border border-stone-700/50 whitespace-nowrap">
                  {getBadgeText()}
                </div>
              </div>

            </div>

            {/* ─── External Navigation Controls Under Book ───────────── */}
            <div className="w-full flex items-center justify-between mt-6 px-4 max-w-md">
              <button
                onClick={prevPage}
                disabled={currentSpreadIndex === 0}
                className="flex items-center gap-1 px-4 py-2 rounded-full bg-white hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-white text-gray-800 text-xs font-bold border border-stone-300 shadow-xs cursor-pointer transition-all active:scale-95"
              >
                <ChevronLeft size={16} />
                <span>Oldingi</span>
              </button>

              <span className="text-xs text-gray-600 font-medium">
                {currentSpreadIndex + 1} / {totalPages}
              </span>

              <button
                onClick={nextPage}
                disabled={currentSpreadIndex + step >= totalPages}
                className="flex items-center gap-1 px-4 py-2 rounded-full bg-white hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-white text-gray-800 text-xs font-bold border border-stone-300 shadow-xs cursor-pointer transition-all active:scale-95"
              >
                <span>Keyingi</span>
                <ChevronRight size={16} />
              </button>
            </div>

          </div>
        )}
      </main>

      {/* ─── Zen Mutolaa Modal ──────────────────────────────────────── */}
      {isZenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-sans">
          <div className="relative bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl text-center space-y-4">
            <button 
              onClick={() => setIsZenModalOpen(false)} 
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 cursor-pointer"
            >
              ✕
            </button>
            <div className="w-14 h-14 bg-orange-50 text-[#E05638] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <Clock size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Zen Mutolaa</h3>
            <p className="text-xs text-gray-500 leading-relaxed px-2">
              Chalg'ituvchi narsalarni unuting va faqat kitob mutolaasi bilan qoling.
            </p>
            <div className="grid grid-cols-4 gap-2 pt-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setZenTime(mins)}
                  className={`py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    zenTime === mins
                      ? "bg-[#E05638] text-white shadow-md shadow-[#E05638]/20 scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsZenModalOpen(false)}
              className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Play size={16} fill="currentColor" />
              <span>{zenTime} daqiqaga boshlash</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}