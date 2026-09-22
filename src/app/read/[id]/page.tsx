"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Clock, Play, X, ChevronLeft, ChevronRight, 
  BookOpen, ZoomIn, ZoomOut, Loader2, Sparkles, AlertCircle, Headphones
} from "lucide-react";
import { api, resolveFileUrl } from "@/services/api";

export default function ReadBookPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [book, setBook] = useState<any>(null);
  const [pages, setPages] = useState<Array<{ page_number: number; text: string; image_path?: string }>>([]);
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(17); // px
  const [isZenModalOpen, setIsZenModalOpen] = useState(false);
  const [zenTime, setZenTime] = useState(30);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/Paper Slide - Sound Effect.mp3");
  }, []);

  const playFlipSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    // 1. Fetch book metadata
    api.getBookById(id)
      .then((bData) => {
        setBook(bData);
      })
      .catch((err) => {
        console.warn("Could not load book metadata:", err);
      });

    // 2. Fetch real pages
    api.getBookPages(id)
      .then((pageList) => {
        if (Array.isArray(pageList) && pageList.length > 0) {
          const sorted = pageList.sort((a, b) => (a.page_number || 0) - (b.page_number || 0));
          setPages(sorted);
          setLoading(false);
          return;
        }

        // Fallback: try reader endpoint (chapters & sentences)
        return api.getBookReader(id).then((readerData) => {
          if (readerData?.chapters && readerData.chapters.length > 0) {
            const synthesizedPages: any[] = [];
            let pNum = 1;
            for (const ch of readerData.chapters) {
              const chTitle = ch.title || `${ch.index}-bob`;
              const textContent = ch.sentences && ch.sentences.length > 0
                ? ch.sentences.map((s: any) => s.text).join(" ")
                : (ch.content || "");

              // Split text into pages of ~250 words
              const paras = textContent.split(/\n\s*\n/).filter(Boolean);
              if (paras.length === 0) paras.push(textContent || "Ushbu bob matni.");

              synthesizedPages.push({
                page_number: pNum++,
                text: `${chTitle}\n\n${paras.join("\n\n")}`,
              });
            }
            setPages(synthesizedPages);
          } else {
            // Default placeholder if book was just created without file
            setPages([
              {
                page_number: 1,
                text: `1-Bob: Kirish\n\nUshbu asar Bookify raqamli kutubxonasiga muvaffaqiyatli yuklandi va mutolaaga tayyor holatda turibdi.\n\nKitob mutolaasi tafakkurni yuksaltiruvchi va inson qalbini munavvar qiluvchi eng ulug' mashg'ulotdir.`
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
            text: "Ushbu asar mutolaaga tayyorlanmoqda."
          }
        ]);
        setLoading(false);
      });
  }, [id]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        nextPage();
      } else if (e.key === "ArrowLeft") {
        prevPage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, pages.length]);

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      playFlipSound();
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      playFlipSound();
      setCurrentPage((prev) => prev - 1);
    }
  };

  const activePage = pages[currentPage] || null;

  // Format paragraphs cleanly so words NEVER collide or garble
  const renderFormattedParagraphs = (rawText: string) => {
    if (!rawText) return null;
    const paras = rawText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    if (paras.length === 0) {
      return <p className="mb-4 leading-relaxed">{rawText}</p>;
    }
    return paras.map((para, pIdx) => {
      // Check if it's a heading
      const isHeading = para.length < 80 && /^(bob|fasl|chapter|\d+[\.\-]|muqaddima|xotima)/i.test(para);
      if (isHeading) {
        return (
          <h3 key={pIdx} className="text-xl font-bold font-sans text-gray-900 mt-6 mb-4 text-center tracking-tight">
            {para}
          </h3>
        );
      }
      return (
        <p 
          key={pIdx} 
          className="mb-5 text-gray-800 leading-[2.1] indent-8 text-justify font-serif tracking-normal selection:bg-orange-200"
        >
          {para}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#EAE8E3] flex flex-col items-center justify-between select-none relative overflow-hidden">
      
      {/* Top Floating Controls Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push(`/book/${id}`)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-stone-100 rounded-xl text-xs font-bold text-gray-700 border border-stone-200 transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Asarga qaytish</span>
          </button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-gray-900 truncate">
              {book?.title || "Kitob Mutolaasi"}
            </h1>
            <p className="text-[11px] text-gray-500 font-medium truncate">
              {book?.author || "Muallif"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Font Size Adjusters */}
          <div className="hidden sm:flex items-center bg-white border border-stone-200 rounded-xl px-1.5 py-1 shadow-2xs">
            <button 
              onClick={() => setFontSize((f) => Math.max(14, f - 1))}
              className="px-2 py-1 text-xs font-bold text-gray-600 hover:text-black cursor-pointer"
              title="Kichraytirish"
            >
              A-
            </button>
            <span className="text-[11px] text-gray-400 font-mono px-1">{fontSize}</span>
            <button 
              onClick={() => setFontSize((f) => Math.min(26, f + 1))}
              className="px-2 py-1 text-xs font-bold text-gray-600 hover:text-black cursor-pointer"
              title="Kattalashtirish"
            >
              A+
            </button>
          </div>

          <button
            onClick={() => setIsZenModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-100 rounded-xl text-xs font-bold text-gray-700 border border-stone-200 transition-colors cursor-pointer shadow-2xs"
          >
            <Clock size={15} className="text-[#E05638]" />
            <span className="hidden sm:inline">Zen</span>
          </button>
        </div>
      </header>

      {/* Main Reading Stage */}
      <main className="flex-1 w-full max-w-4xl pt-24 pb-28 px-4 sm:px-6 flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-32">
            <Loader2 size={40} className="animate-spin text-[#E05638]" />
            <p className="text-sm font-medium text-gray-500">Asar sahifalari tayyorlanmoqda...</p>
          </div>
        ) : (
          <div 
            className="relative w-full min-h-[680px] bg-[#FAF8F5] rounded-[28px] shadow-[0_15px_45px_rgb(0,0,0,0.08)] border border-stone-300/60 p-6 sm:p-12 md:p-16 transition-all"
            style={{ fontSize: `${fontSize}px` }}
          >
            {/* Subtle paper spine crease on left edge */}
            <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/5 to-transparent rounded-l-[28px] pointer-events-none"></div>

            {/* Content Area */}
            {activePage ? (
              <div className="space-y-4 animate-fade-in">
                {activePage.image_path ? (
                  /* Scanned PDF Page Image */
                  <div className="w-full flex items-center justify-center">
                    <img 
                      src={resolveFileUrl(activePage.image_path)} 
                      alt={`Sahifa ${activePage.page_number}`}
                      className="max-h-[75vh] w-auto object-contain rounded-xl shadow-xs" 
                    />
                  </div>
                ) : (
                  /* Clean Literary Text with Paragraph Spacing */
                  <div>
                    {renderFormattedParagraphs(activePage.text)}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400 font-sans text-sm">
                Sahifa topilmadi.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation Toolbar */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border border-stone-300/80 rounded-full px-5 py-2.5 shadow-xl flex items-center gap-4 sm:gap-6">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="w-10 h-10 rounded-full bg-white hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-white text-gray-800 border border-stone-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
          title="Oldingi sahifa (Chapga strelka)"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="text-center">
          <div className="text-xs font-bold font-sans text-gray-900 tracking-wider">
            {pages.length > 0 ? `${currentPage + 1} / ${pages.length}` : "0 / 0"}
          </div>
          <span className="text-[10px] font-sans text-gray-400">sahifa</span>
        </div>

        <button
          onClick={nextPage}
          disabled={currentPage >= pages.length - 1}
          className="w-10 h-10 rounded-full bg-white hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-white text-gray-800 border border-stone-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
          title="Keyingi sahifa (O'ngga strelka yoki probel)"
        >
          <ChevronRight size={20} />
        </button>
      </footer>

      {/* ZEN MUTOLAA MODAL */}
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
              Chalg'ituvchi narsalarni unuting va faqat mutolaa sehri bilan qoling.
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