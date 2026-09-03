'use client';
import React, { useState, useRef } from 'react';
import { X, Download, Printer, Edit3, Check, Share2, Award, QrCode } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CertificateProps {
  initialName?: string;
  rank?: number | string;
  achievementTitle?: string;
  certNumber?: string;
  date?: string;
  onClose: () => void;
}

export default function OfficialCertificateModal({
  initialName = "Abduqodirov Dilshodbek",
  rank = 1,
  achievementTitle = "Bahoriy Adabiy Chempionat 2026 • Shoh Kitobxon",
  certNumber = "BKF-2026-0001",
  date = "3-Sentabr, 2026",
  onClose
}: CertificateProps) {
  const [recipientName, setRecipientName] = useState(initialName);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(initialName);
  const certRef = useRef<HTMLDivElement>(null);

  const verificationUrl = `https://bookify-six-alpha.vercel.app/verify/${certNumber.toLowerCase()}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setRecipientName(tempName.trim());
      setIsEditing(false);
      toast.success("Sertifikat egasining ismi yangilandi!");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    toast.success("Tasdiqlash havolasi nusxalandi!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-stone-900 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 my-auto border border-white/10">
        
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/10 text-white">
          <div className="flex items-center gap-2">
            <Award className="text-[#C5A059]" size={20} />
            <span className="text-xs sm:text-sm font-mono font-bold">
              Rasmiy Bookify Sertifikati (freeCodeCamp standarti)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 size={13} />
              <span>Ismni Tahrirlash</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-[#C5A059] hover:bg-[#b08d48] text-stone-950 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Printer size={13} />
              <span>Chop Etish / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
              title="Yopish"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Inline Name Edit Field */}
        {isEditing && (
          <form onSubmit={handleSaveName} className="p-3 bg-stone-800 rounded-2xl flex items-center gap-3 border border-white/10">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Ism va familiyangizni kiriting..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-stone-900 text-white text-xs sm:text-sm font-mono focus:outline-none border border-white/20"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1"
            >
              <Check size={13} />
              <span>Saqlash</span>
            </button>
          </form>
        )}

        {/* ══════════ THE CERTIFICATE CANVAS (freeCodeCamp Standard) ══════════ */}
        <div
          ref={certRef}
          id="printable-certificate"
          className="relative w-full bg-[#FCFCFA] text-[#0A0D14] p-6 sm:p-12 rounded-xl shadow-2xl border-[10px] sm:border-[16px] border-[#0A0E1A] overflow-hidden select-none print:m-0 print:border-[12px] print:shadow-none"
        >
          {/* Inner Thin Double Frame */}
          <div className="border-2 border-[#0A0E1A]/80 p-6 sm:p-10 flex flex-col justify-between min-h-[480px] sm:min-h-[520px] text-center space-y-6 relative bg-white/60">
            
            {/* Top Brand Banner */}
            <div className="space-y-1">
              <div className="inline-flex items-center justify-center gap-1.5 text-2xl sm:text-3xl font-mono font-bold tracking-wider text-[#0A0E1A]">
                <span>bookify</span>
                <span className="text-[#E05638] text-xl">(📚)</span>
              </div>
            </div>

            {/* "This certifies that" */}
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-sans tracking-widest text-stone-500 font-medium">
                This certifies that
              </p>
              <p className="text-[11px] font-mono text-stone-400">
                Ushbu sertifikat tasdiqlaydiki:
              </p>
            </div>

            {/* Recipient Full Name */}
            <div className="py-1">
              <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#0A0E1A] border-b-2 border-[#0A0E1A]/20 pb-2 inline-block max-w-full px-4">
                {recipientName}
              </h1>
            </div>

            {/* Achievement Text */}
            <div className="space-y-2 max-w-2xl mx-auto">
              <p className="text-xs sm:text-sm font-sans text-stone-600">
                successfully completed the
              </p>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0A0E1A]">
                {achievementTitle}
              </h2>
              <p className="text-xs font-mono text-stone-500">
                Bookify Literary Developer Certification on {date}
              </p>
              <p className="text-[11px] font-sans text-stone-400 italic">
                representing approximately 120 hours of classical reading, analysis and tournament mastery
              </p>
            </div>

            {/* Bottom Row: QR Code • Signature • Ribbon Seal */}
            <div className="pt-6 grid grid-cols-3 items-end gap-2 border-t border-stone-200">
              
              {/* 1. Left: Functional QR Code */}
              <div className="flex flex-col items-center sm:items-start text-left space-y-1.5">
                <div className="w-18 h-18 sm:w-20 sm:h-20 p-1 bg-white border-2 border-[#0A0E1A] rounded-lg shadow-sm">
                  <img
                    src={qrCodeUrl}
                    alt="Certificate QR Verification"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[9px] font-mono text-stone-400 hidden sm:block">
                  № {certNumber}
                </span>
              </div>

              {/* 2. Center: Founder & CEO Signature */}
              <div className="flex flex-col items-center justify-center text-center space-y-1">
                {/* Authentic Handwritten Cursive SVG Signature */}
                <div className="relative h-12 flex items-center justify-center">
                  <svg
                    viewBox="0 0 220 60"
                    className="w-36 sm:w-44 h-12 stroke-[#0A0E1A] fill-none"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M 15 35 Q 25 10, 40 25 T 65 35 Q 80 15, 95 30 T 120 20 Q 140 45, 165 15 Q 185 30, 205 22" />
                    <path d="M 30 46 C 55 50, 110 47, 180 49" />
                  </svg>
                </div>

                <div className="border-t border-[#0A0E1A]/50 pt-1 w-36 sm:w-44">
                  <p className="font-serif font-bold text-xs sm:text-sm text-[#0A0E1A]">
                    Abduqodirov Dilshodbek
                  </p>
                  <p className="text-[9px] font-mono text-stone-500">
                    Founder & CEO, Bookify
                  </p>
                </div>
              </div>

              {/* 3. Right: Official Ribbon Rosette Seal */}
              <div className="flex flex-col items-center sm:items-end">
                <div className="relative flex flex-col items-center">
                  {/* Rosette Medal */}
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#0A0E1A] text-[#C5A059] flex flex-col items-center justify-center border-4 border-double border-[#C5A059] shadow-lg relative z-10">
                    <span className="text-base sm:text-lg">👑</span>
                    <span className="text-[7px] font-mono uppercase font-bold tracking-tighter text-white">
                      OFFICIAL
                    </span>
                  </div>

                  {/* Ribbon Tails */}
                  <div className="flex gap-1 -mt-2">
                    <div className="w-3 h-6 bg-[#0A0E1A] rounded-b-sm transform -rotate-12 border-b-2 border-[#C5A059]" />
                    <div className="w-3 h-6 bg-[#0A0E1A] rounded-b-sm transform rotate-12 border-b-2 border-[#C5A059]" />
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Verification Text */}
            <div className="pt-2 text-center">
              <p className="text-[10px] font-mono text-stone-400">
                Verify this certification at:
              </p>
              <button
                onClick={handleCopyLink}
                className="text-[10px] font-mono text-blue-600 hover:underline cursor-pointer break-all"
              >
                {verificationUrl}
              </button>
            </div>

          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2 text-white text-xs font-mono">
          <span className="text-stone-400 hidden sm:inline">
            🔒 Raqamli shifrlangan rasmiy sertifikat
          </span>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Share2 size={13} />
              <span>Ulashish</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#C5A059] hover:bg-[#b08d48] text-stone-950 font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download size={13} />
              <span>Chop Etish / Saqlash</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
