"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Clock, Play, X, ChevronLeft, ChevronRight, 
  BookOpen, ZoomIn, ZoomOut, Loader2, Maximize, Minimize,
  Columns2, Square, Sparkles
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
  const [fontSize, setFontSize] = useState(17); // Optimal reading size that fits page without scrolling
  const [bookSize, setBookSize] = useState<"standard" | "large" | "full">("large"); // Default to big immersive book
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

  // 2 ta pageni hisoblab sanash: 3-4 yoki 5-6 emas, 2 ta pageni qo'shib (2, 4, 6, 8...) sanaydi
  const getCurrentPageNumber = () => {
    if (totalPages === 0) return 0;
    if (isMobile || !isSpreadMode || !rightPage) {
      return leftPage?.page_number || (currentSpreadIndex + 1);
    }
    // 2-sahifali ko'rinishda o'ng sahifa raqamini olamiz (2, 4, 6...)
    const rightNum = rightPage?.page_number || (currentSpreadIndex + 2);
    return Math.min(rightNum, totalPages);
  };

  // Bottom Pill Badge Text (2 ta pageni hisoblab bitta aniq raqam bilan ko'rsatish)
  const getBadgeText = () => {
    if (totalPages === 0) return "0 / 0 sahifa";
    const currentNum = getCurrentPageNumber();
    return `${currentNum} / ${totalPages} sahifa`;
  };

  // Render text content cleanly formatted with classical book typography (NO SCROLLBAR)
  const renderTextContent = (rawText: string | null | undefined, pageNum: number) => {
    if (!rawText) return null;

    // Filter out isolated page number lines that were extracted from PDF headers/footers
    const cleanedLines = rawText
      .split('\n')
      .filter(line => !/^\s*\d+\s*$/.test(line))
      .join('\n');

    const paras = cleanedLines
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => Boolean(p) && !/^\d+$/.test(p));

    // If it's the title page (page 1) and looks like book intro:
    if (pageNum === 1 && paras.length <= 4) {
      return (
        <div className="h-full w-full flex flex-col justify-between py-10 md:py-16 px-6 sm:px-12 md:px-16 text-center font-serif select-text overflow-hidden">
          <div className="text-lg sm:text-xl md:text-2xl font-medium text-gray-800 tracking-wider">
            {book?.author || "Muallif"}
          </div>
          <div className="space-y-4 my-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-widest text-gray-900 leading-tight">
              {book?.title || "Asar Nomi"}
            </h1>
            <p className="text-sm sm:text-base italic text-gray-600 font-sans">
              Elektron nashr
            </p>
          </div>
          <div className="text-xs text-gray-500 font-sans space-y-1">
            <p className="font-semibold tracking-wide">Bookify Raqamli Kutubxonasi</p>
            <p>{book?.published_year || 2025}</p>
          </div>
        </div>
      );
    }

    return (
      <div 
        className="h-full w-full flex flex-col justify-between overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-6 sm:px-10 md:px-14 lg:px-16 py-6 md:py-8 font-serif text-gray-950 select-text"
        style={{ fontSize: `${fontSize}px`, lineHeight: 1.7 }}
      >
        <div className="flex-1 overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {paras.map((para, idx) => {
            const isHeading = para.length < 80 && /^(bob|fasl|chapter|\d+[\.\-]|boshlashdan|muqaddima|xotima)/i.test(para);
            if (isHeading) {
              return (
                <h2 key={idx} className="text-center font-bold text-xl sm:text-2xl my-3 text-gray-950 font-sans tracking-wide">
                  {para}
                </h2>
              );
            }
            return (
              <p key={idx} className="mb-3 text-justify indent-6 sm:indent-10 text-gray-900 font-serif leading-[1.7]">
                {para}
              </p>
            );
          })}
        </div>
      </div>
    );
  };

  // Determine container width based on size mode (kattaroq format)
  const getContainerMaxWidth = () => {
    if (bookSize === "full") return "w-full max-w-[98vw] 2xl:max-w-[1900px]";
    if (bookSize === "large") return "w-full max-w-[96vw] xl:max-w-[1650px] 2xl:max-w-[1800px]";
    return "w-full max-w-6xl";
  };

  const getContainerHeight = () => {
    if (bookSize === "full") return "min-h-[760px] md:min-h-[840px] lg:h-[88vh]";
    if (bookSize === "large") return "min-h-[700px] md:min-h-[780px] lg:h-[85vh]";
    return "min-h-[620px] md:min-h-[700px] lg:h-[80vh]";
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

          {/* Book Scale / Size Buttons */}
          <div className="flex items-center bg-white border border-stone-300 rounded-xl p-0.5 shadow-2xs">
            <button
              onClick={() => setBookSize((s) => s === "full" ? "large" : "standard")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${bookSize === "standard" ? "bg-stone-200 text-gray-900" : "text-gray-600 hover:text-black"}`}
              title="Kichikroq o'lcham"
            >
              <ZoomOut size={15} />
            </button>
            <span className="text-[11px] text-gray-600 font-bold px-1.5">
              {bookSize === "full" ? "150%" : (bookSize === "large" ? "125%" : "100%")}
            </span>
            <button
              onClick={() => setBookSize((s) => s === "standard" ? "large" : "full")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${bookSize === "full" ? "bg-[#E05638] text-white" : "text-gray-600 hover:text-black"}`}
              title="Kattalashtirish (Keng ekran)"
            >
              <ZoomIn size={15} />
            </button>
          </div>

          {/* Font Size Adjusters (for text pages) */}
          <div className="hidden sm:flex items-center bg-white border border-stone-300 rounded-xl px-1.5 py-0.5 shadow-2xs">
            <button 
              onClick={() => setFontSize((f) => Math.max(14, f - 2))}
              className="px-1.5 py-1 text-xs font-bold text-gray-600 hover:text-black cursor-pointer"
              title="Shriftni kichraytirish"
            >
              A-
            </button>
            <span className="text-[11px] text-gray-500 font-mono px-1 font-bold">{fontSize}</span>
            <button 
              onClick={() => setFontSize((f) => Math.min(34, f + 2))}
              className="px-1.5 py-1 text-xs font-bold text-gray-600 hover:text-black cursor-pointer"
              title="Shriftni kattalashtirish"
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

      {/* ─── Main Two-Page Spread Book Stage (Image 2 Design - Kattalashtirilgan) ─── */}
      <main className="flex-1 w-full flex items-center justify-center pt-14 pb-16 px-1 sm:px-4 md:px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-3 py-36">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center shadow-xs">
              <Loader2 size={24} className="animate-spin text-orange-500" />
            </div>
            <p className="text-xs font-semibold text-gray-500 tracking-wider">Sahifalar yuklanmoqda...</p>
          </div>
        ) : (
          <div className={`relative flex flex-col items-center my-auto transition-all duration-300 ${getContainerMaxWidth()}`}>

            
            {/* ─── The Realistic Open Book Spread ─────────────────────── */}
            <div 
              ref={bookContainerRef}
              className={`relative w-full bg-[#FAF9F6] border-[2px] border-[#202020] shadow-[0_25px_70px_-10px_rgba(0,0,0,0.4)] transition-all duration-300 ${
                (!isMobile && isSpreadMode)
                  ? `grid grid-cols-2 ${getContainerHeight()}`
                  : `flex flex-col max-w-3xl mx-auto ${getContainerHeight()}`
              }`}
            >
              {/* ─── Center Spine Crease & Notch (Image 2 signature element) ─ */}
              {(!isMobile && isSpreadMode) && (
                <>
                  {/* Top center spine notch | */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2.5px] h-4 bg-[#202020] z-30" />
                  
                  {/* Vertical spine divider line */}
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1.5px] bg-[#202020]/25 z-20 pointer-events-none" />

                  {/* Left page right spine shadow */}
                  <div className="absolute top-0 bottom-0 left-0 right-1/2 pointer-events-none z-10 flex justify-end">
                    <div className="w-12 sm:w-20 md:w-28 h-full bg-gradient-to-l from-black/15 via-black/5 to-transparent" />
                  </div>

                  {/* Right page left spine shadow */}
                  <div className="absolute top-0 bottom-0 left-1/2 right-0 pointer-events-none z-10 flex justify-start">
                    <div className="w-12 sm:w-20 md:w-28 h-full bg-gradient-to-r from-black/15 via-black/5 to-transparent" />
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
                <div className="flex-1 w-full h-full flex items-stretch justify-center overflow-hidden">
                  {leftPage?.image_path ? (
                    <div className="p-3 sm:p-6 md:p-8 flex items-center justify-center w-full h-full">
                      <img
                        src={resolveFileUrl(leftPage.image_path)}
                        alt={`Sahifa ${leftPage.page_number}`}
                        className="max-h-full max-w-full object-contain pointer-events-none select-none transition-transform"
                        loading="eager"
                      />
                    </div>
                  ) : (
                    renderTextContent(leftPage?.text, leftPage?.page_number || 1)
                  )}
                </div>

                {/* Subtle Hover Chevron on left page */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/5 group-hover:bg-black/10 flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xs">
                  <ChevronLeft size={22} />
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
                  <div className="flex-1 w-full h-full flex items-stretch justify-center overflow-hidden">
                    {rightPage ? (
                      rightPage.image_path ? (
                        <div className="p-3 sm:p-6 md:p-8 flex items-center justify-center w-full h-full">
                          <img
                            src={resolveFileUrl(rightPage.image_path)}
                            alt={`Sahifa ${rightPage.page_number}`}
                            className="max-h-full max-w-full object-contain pointer-events-none select-none transition-transform"
                            loading="eager"
                          />
                        </div>
                      ) : (
                        renderTextContent(rightPage.text, rightPage.page_number)
                      )
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center text-gray-300 font-serif italic text-base">
                        Asar yakuni
                      </div>
                    )}
                  </div>

                  {/* Subtle Hover Chevron on right page */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/5 group-hover:bg-black/10 flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xs">
                    <ChevronRight size={22} />
                  </div>
                </div>
              )}

              {/* ─── Bottom Centered Pill Badge (Exact Image 2 Style - Kattalashtirilgan) ─── */}
              <div className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 z-30">
                <div className="bg-[#2E2E2E] text-white px-4 py-1.5 rounded-full text-xs font-sans font-semibold tracking-wide shadow-lg border border-stone-700/60 whitespace-nowrap">
                  {getBadgeText()}
                </div>
              </div>

            </div>

            {/* ─── External Navigation Controls Under Book ───────────── */}
            <div className="w-full flex items-center justify-center gap-6 mt-6 px-4 max-w-lg">
              <button
                onClick={prevPage}
                disabled={currentSpreadIndex === 0}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-white text-gray-900 text-xs font-bold border border-stone-300 shadow-xs cursor-pointer transition-all active:scale-95"
              >
                <ChevronLeft size={18} />
                <span>Oldingi sahifa</span>
              </button>

              <button
                onClick={nextPage}
                disabled={currentSpreadIndex + step >= totalPages}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-white text-gray-900 text-xs font-bold border border-stone-300 shadow-xs cursor-pointer transition-all active:scale-95"
              >
                <span>Keyingi sahifa</span>
                <ChevronRight size={18} />
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