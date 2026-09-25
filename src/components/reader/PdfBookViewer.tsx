"use client";

/**
 * PdfBookViewer.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * PDF kitobni sahifama-sahifa ko'rsatuvchi komponent (react-pdf asosida).
 *
 * Arxitektura:
 *  - react-pdf → pdf.js orqali butun faylni frontendga emas, faqat KERAKLI
 *    sahifani yuklab render qiladi (lazy load).
 *  - fileUrl Cloudinary HTTPS URL yoki lokal /uploads/... URL bo'lishi mumkin.
 *  - Ikki sahifali spread (chapda va o'ngda) va yagona sahifa rejimi qo'llab-quvvatlanadi.
 *  - "To'liq ko'rinmaydi" muammosi yo'q — react-pdf iframe emas, canvas bilan ishlaydi.
 */

import React, { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, ZoomIn, ZoomOut, Maximize, Minimize, Columns2, Square } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// pdf.js worker — CDN orqali (bundler bilan ziddiyat yo'q)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfBookViewerProps {
  fileUrl: string;        // Cloudinary URL yoki lokal URL
  bookTitle?: string;
  initialPage?: number;
  onPageChange?: (page: number, total: number) => void;
}

export default function PdfBookViewer({
  fileUrl,
  bookTitle,
  initialPage = 1,
  onPageChange,
}: PdfBookViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [scale, setScale] = useState<number>(1.0);
  const [isSpread, setIsSpread] = useState<boolean>(false);  // 2-sahifali rejim
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const onLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setLoadError(null);
    onPageChange?.(currentPage, numPages);
  }, [currentPage, onPageChange]);

  const onLoadError = useCallback((error: Error) => {
    setIsLoading(false);
    setLoadError(`PDF yuklanmadi: ${error.message}`);
  }, []);

  const goTo = (page: number) => {
    const target = Math.max(1, Math.min(page, numPages));
    setCurrentPage(target);
    onPageChange?.(target, numPages);
  };

  const prevPage = () => {
    goTo(currentPage - (isSpread ? 2 : 1));
  };

  const nextPage = () => {
    goTo(currentPage + (isSpread ? 2 : 1));
  };

  const zoomIn  = () => setScale(s => Math.min(s + 0.2, 3.0));
  const zoomOut = () => setScale(s => Math.max(s - 0.2, 0.4));

  const rightPageNumber = isSpread ? currentPage + 1 : null;

  return (
    <div
      className={`flex flex-col bg-[#1a1a1a] rounded-3xl overflow-hidden shadow-2xl transition-all
        ${isFullscreen ? "fixed inset-0 z-50 rounded-none" : "relative"}`}
    >
      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#111] border-b border-white/5 gap-3 flex-wrap">
        {/* Sahifa ko'rsatkichi */}
        <span className="text-xs font-mono text-gray-400 shrink-0">
          {numPages > 0
            ? isSpread && rightPageNumber && rightPageNumber <= numPages
              ? `${currentPage}–${rightPageNumber} / ${numPages} sahifa`
              : `${currentPage} / ${numPages} sahifa`
            : "Yuklanmoqda…"}
        </span>

        {/* Sahifa kirish */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={1}
            max={numPages}
            value={currentPage}
            onChange={e => goTo(Number(e.target.value))}
            className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white text-center focus:outline-none focus:ring-1 focus:ring-white/20"
          />
          <span className="text-gray-500 text-xs">/ {numPages}</span>
        </div>

        {/* Tugmalar */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button onClick={zoomOut} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Kichiklashtirish">
            <ZoomOut size={15} />
          </button>
          <span className="text-[11px] text-gray-500 w-10 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Kattalashtirish">
            <ZoomIn size={15} />
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button
            onClick={() => setIsSpread(v => !v)}
            className={`p-1.5 rounded-lg transition-colors ${isSpread ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-gray-400 hover:text-white"}`}
            title={isSpread ? "Yagona sahifa" : "Ikki sahifali rejim"}
          >
            {isSpread ? <Square size={15} /> : <Columns2 size={15} />}
          </button>
          <button
            onClick={() => setIsFullscreen(v => !v)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title={isFullscreen ? "Chiqish" : "To'liq ekran"}
          >
            {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
          </button>
        </div>
      </div>

      {/* ── PDF Sahifalar ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto bg-[#2a2a2a] flex items-center justify-center p-4 gap-2 min-h-[400px]">
        {loadError ? (
          <div className="flex flex-col items-center gap-3 text-red-400 max-w-xs text-center">
            <AlertCircle size={36} />
            <p className="text-sm font-medium">{loadError}</p>
            <p className="text-xs text-gray-500">
              PDF URL ni tekshiring yoki Cloudinary CORS sozlamalarini ko'ring.
            </p>
          </div>
        ) : (
          <Document
            file={fileUrl}
            onLoadSuccess={onLoadSuccess}
            onLoadError={onLoadError}
            loading={
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <Loader2 size={36} className="animate-spin text-orange-400" />
                <p className="text-sm">PDF yuklanmoqda…</p>
              </div>
            }
            className="flex gap-3 items-start justify-center"
          >
            {/* Chap sahifa */}
            <div className="shadow-2xl rounded-sm overflow-hidden">
              <Page
                pageNumber={currentPage}
                scale={scale}
                loading={
                  <div className="w-[300px] h-[420px] bg-white/5 animate-pulse rounded-sm" />
                }
                renderAnnotationLayer={true}
                renderTextLayer={true}
              />
            </div>

            {/* O'ng sahifa (spread rejimda) */}
            {isSpread && rightPageNumber && rightPageNumber <= numPages && (
              <div className="shadow-2xl rounded-sm overflow-hidden">
                <Page
                  pageNumber={rightPageNumber}
                  scale={scale}
                  loading={
                    <div className="w-[300px] h-[420px] bg-white/5 animate-pulse rounded-sm" />
                  }
                  renderAnnotationLayer={true}
                  renderTextLayer={true}
                />
              </div>
            )}
          </Document>
        )}
      </div>

      {/* ── Navigatsiya ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#111] border-t border-white/5">
        <button
          onClick={prevPage}
          disabled={currentPage <= 1}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={16} />
          <span>Oldingi</span>
        </button>

        {/* Sahifa progress bar */}
        <div className="flex-1 mx-6 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-300"
            style={{ width: numPages > 0 ? `${(currentPage / numPages) * 100}%` : "0%" }}
          />
        </div>

        <button
          onClick={nextPage}
          disabled={currentPage >= numPages}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <span>Keyingi</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
