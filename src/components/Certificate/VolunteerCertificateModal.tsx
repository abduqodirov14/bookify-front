'use client';
import React, { useState, useRef } from 'react';
import { X, Printer, Share2, Award, Check, QrCode, ShieldCheck, Download, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

export interface CertificateData {
  id?: string;
  serial_number?: string;
  recipient_name: string;
  role_title?: string;
  accredited_hours?: string;
  impact_summary?: string;
  audience_reach?: string;
  quality_grade?: string;
  service_period?: string;
  issue_date?: string;
  verification_url?: string;
  issued_by_name?: string;
  issued_by_title?: string;
  editor_name?: string;
  editor_title?: string;
}

interface Props {
  certificate: CertificateData;
  onClose: () => void;
}

export default function VolunteerCertificateModal({ certificate, onClose }: Props) {
  const [recipientName, setRecipientName] = useState(certificate.recipient_name || "DILSHODBEK ABDUQODIROV");
  const [roleTitle, setRoleTitle] = useState(certificate.role_title || "Bosh Ovozli Diktor & Madaniy Meros Volontyori");
  const [hours, setHours] = useState(certificate.accredited_hours || "64 Akredited Hours (4 oy)");
  const [servicePeriod, setServicePeriod] = useState(certificate.service_period || "2025-yil sentyabr — 2026-yil sentyabr (1 yil to'liq faoliyat)");
  const [impact, setImpact] = useState(certificate.impact_summary || "4 ta To'liq Kitob (48 ta audiobob)");
  const [serialNumber, setSerialNumber] = useState(certificate.serial_number || "BKFY-VOL-2026-8491X");
  const [issueDate, setIssueDate] = useState(certificate.issue_date || new Date().toISOString().split('T')[0]);

  const certRef = useRef<HTMLDivElement>(null);
  const verificationUrl = certificate.verification_url || `https://bookify-six-alpha.vercel.app/verify/${serialNumber}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(verificationUrl)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    toast.success("Universitet tekshiruv havolasi nusxalandi! 📋");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      
      {/* Container */}
      <div className="relative w-full max-w-5xl bg-stone-900 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 my-auto border border-amber-500/20 text-stone-100">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="print:hidden flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800 text-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 shadow-md">
              <Award size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  Rasmiy Volontyorlik Sertifikati
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                  <ShieldCheck size={11} /> 100% Universitet Standarti
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                O'zbekiston OTMlari, chet el grantlari, magistratura va CV uchun akkreditatsiyalangan format
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-700"
            >
              <Share2 size={13} />
              <span className="hidden sm:inline">Havola</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-lg hover:shadow-amber-500/25 cursor-pointer"
            >
              <Printer size={14} />
              <span>Chop Etish / PDF Saqlash</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer"
              title="Yopish"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* GRAND CERTIFICATE CANVAS (A4 Landscape Proportions)                   */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <div
          ref={certRef}
          id="printable-volunteer-cert"
          className="relative w-full aspect-[1.414/1] bg-[#FDFBF7] text-[#1C2833] rounded-sm p-6 sm:p-10 md:p-12 shadow-2xl flex flex-col justify-between overflow-hidden select-none print:m-0 print:border-none print:shadow-none print:w-[100vw] print:h-[100vh]"
        >
          {/* Subtle Background Geometric Watermark */}
          <div className="absolute inset-0 opacity-[0.035] pointer-events-none flex items-center justify-center">
            <svg className="w-[650px] h-[650px]" viewBox="0 0 200 200" fill="currentColor">
              <path d="M100 0 C120 40, 160 80, 200 100 C160 120, 120 160, 100 200 C80 160, 40 120, 0 100 C40 80, 80 40, 100 0 Z"/>
            </svg>
          </div>

          {/* Luxury Guilloché Multi-Layered Borders */}
          <div className="absolute inset-3 md:inset-4 border-2 border-[#D4AF37] pointer-events-none"></div>
          <div className="absolute inset-4 md:inset-5 border border-[#B38728]/35 pointer-events-none"></div>
          <div className="absolute inset-5 md:inset-6 border-[3px] md:border-[4px] border-[#1C2833] pointer-events-none"></div>
          <div className="absolute inset-6 md:inset-7 border border-[#D4AF37]/60 pointer-events-none"></div>

          {/* SVG Ornate Gold Corner Filigrees */}
          <svg className="absolute top-7 left-7 w-16 h-16 text-[#B38728] pointer-events-none opacity-80" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M5 5 L95 5 M5 5 L5 95 M15 15 L85 15 M15 15 L15 85 M25 25 L75 25 M25 25 L25 75"/>
            <circle cx="50" cy="50" r="18" stroke-dasharray="2 2"/>
            <path d="M5 5 Q50 5 50 50 Q5 50 5 5 Z" fill="#D4AF37" fill-opacity="0.15"/>
          </svg>
          <svg className="absolute top-7 right-7 w-16 h-16 text-[#B38728] pointer-events-none opacity-80 rotate-90" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M5 5 L95 5 M5 5 L5 95 M15 15 L85 15 M15 15 L15 85 M25 25 L75 25 M25 25 L25 75"/>
            <circle cx="50" cy="50" r="18" stroke-dasharray="2 2"/>
            <path d="M5 5 Q50 5 50 50 Q5 50 5 5 Z" fill="#D4AF37" fill-opacity="0.15"/>
          </svg>
          <svg className="absolute bottom-7 left-7 w-16 h-16 text-[#B38728] pointer-events-none opacity-80 -rotate-90" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M5 5 L95 5 M5 5 L5 95 M15 15 L85 15 M15 15 L15 85 M25 25 L75 25 M25 25 L25 75"/>
            <circle cx="50" cy="50" r="18" stroke-dasharray="2 2"/>
            <path d="M5 5 Q50 5 50 50 Q5 50 5 5 Z" fill="#D4AF37" fill-opacity="0.15"/>
          </svg>
          <svg className="absolute bottom-7 right-7 w-16 h-16 text-[#B38728] pointer-events-none opacity-80 rotate-180" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M5 5 L95 5 M5 5 L5 95 M15 15 L15 85 M25 25 L75 25 M25 25 L25 75"/>
            <circle cx="50" cy="50" r="18" stroke-dasharray="2 2"/>
            <path d="M5 5 Q50 5 50 50 Q5 50 5 5 Z" fill="#D4AF37" fill-opacity="0.15"/>
          </svg>

          {/* 1. HEADER: Emblem & Academic Typography */}
          <div className="relative z-10 text-center pt-1 sm:pt-2">
            
            {/* Heraldic Crest */}
            <div className="inline-flex items-center justify-center mb-1">
              <svg className="w-12 h-12 md:w-14 md:h-14 text-[#996515]" viewBox="0 0 64 64" fill="currentColor">
                <path d="M32 4 C30 12, 18 16, 12 28 C6 40, 14 54, 32 60 C50 54, 58 40, 52 28 C46 16, 34 12, 32 4 Z" fill="none" stroke="#B38728" strokeWidth="2"/>
                <path d="M32 20 C28 24, 20 25, 16 28 L16 48 C20 46, 28 45, 32 48 C36 45, 44 46, 48 48 L48 28 C44 25, 36 24, 32 20 Z" fill="#1C2833"/>
                <path d="M32 20 L32 48" stroke="#FDFBF7" strokeWidth="1.5"/>
                <polygon points="32,10 34,15 39,15 35,18 37,23 32,20 27,23 29,18 25,15 30,15" fill="#D4AF37"/>
              </svg>
            </div>

            {/* Institution Brand */}
            <div className="font-serif text-[10px] md:text-xs font-bold tracking-[0.25em] text-[#5D6D7E] uppercase">
              Bookify Digital Library Foundation & Cultural Initiative
            </div>
            <div className="text-[8.5px] md:text-[9.5px] tracking-[0.15em] text-[#85929E] uppercase font-semibold">
              O'zbekiston Milliy Adabiyoti va Ovozli Merosini Raqamlashtirish Dasturi
            </div>

            {/* Main Certificate Title */}
            <div className="mt-2 md:mt-3">
              <h2 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-[0.18em] text-[#1C2833] uppercase">
                Certificate of Merit
              </h2>
              <div className="text-[11px] sm:text-xs md:text-sm font-serif font-semibold tracking-[0.3em] text-[#996515] uppercase mt-0.5">
                & Distinguished Voluntary Service
              </div>
              <div className="flex items-center justify-center gap-3 my-1.5 md:my-2">
                <span className="h-[1px] w-20 md:w-36 bg-gradient-to-r from-transparent via-[#D4AF37] to-[#B38728]"></span>
                <span className="w-2 h-2 rotate-45 border border-[#B38728] bg-[#D4AF37]"></span>
                <span className="h-[1px] w-20 md:w-36 bg-gradient-to-l from-transparent via-[#D4AF37] to-[#B38728]"></span>
              </div>
            </div>
          </div>

          {/* 2. BODY: Conferred statement & Recipient Name */}
          <div className="relative z-10 text-center my-auto px-4 md:px-8">
            <p className="font-serif italic text-xs sm:text-sm md:text-base text-[#5D6D7E]">
              This prestigious credential is formally conferred upon
            </p>

            {/* Recipient Full Name */}
            <div className="my-1.5 md:my-2.5">
              <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold tracking-[0.06em] text-[#1C2833] border-b-2 border-[#D4AF37]/50 inline-block px-6 md:px-10 pb-1">
                {recipientName.toUpperCase()}
              </h1>
            </div>

            {/* Bilingual Citation */}
            <p className="text-[10px] sm:text-xs md:text-[12px] leading-relaxed text-[#34495E] max-w-3xl mx-auto font-sans mt-1">
              in formal academic recognition of outstanding dedication, cultural leadership, and exemplary artistic service as an accredited <strong className="text-[#1C2833] font-bold">{roleTitle}</strong>. Through professional narration and text preservation, the recipient has substantially enriched the national digital repository.
            </p>

            {/* Accreditation Badges for University Admissions */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mt-3">
                              <div className="px-2.5 py-1 rounded bg-[#F4F1EA] border border-[#D4AF37]/40 text-center">
                <div className="text-[8px] uppercase tracking-wider text-[#7F8C8D] font-bold">Xizmat Davri</div>
                <div className="text-[11px] font-bold text-[#1C2833] font-serif">{servicePeriod}</div>
              </div>
              <div className="px-2.5 py-1 rounded bg-[#F4F1EA] border border-[#D4AF37]/40 text-center">
                <div className="text-[8px] uppercase tracking-wider text-[#7F8C8D] font-bold">Akkreditatsiya Soati</div>
                <div className="text-[11px] font-bold text-[#1C2833] font-serif">{hours}</div>
              </div>
              <div className="px-2.5 py-1 rounded bg-[#F4F1EA] border border-[#D4AF37]/40 text-center">
                <div className="text-[8px] uppercase tracking-wider text-[#7F8C8D] font-bold">Ovozlashtirilgan Asarlar</div>
                <div className="text-[11px] font-bold text-[#1C2833] font-serif">{impact}</div>
              </div>
              <div className="px-2.5 py-1 rounded bg-[#F4F1EA] border border-[#D4AF37]/40 text-center">
                <div className="text-[8px] uppercase tracking-wider text-[#7F8C8D] font-bold">Tinglovchilar Qamrovi</div>
                <div className="text-[11px] font-bold text-[#1C2833] font-serif">{certificate.audience_reach || "12,500+ Kitobxonlar"}</div>
              </div>
              <div className="px-2.5 py-1 rounded bg-[#F4F1EA] border border-[#D4AF37]/40 text-center">
                <div className="text-[8px] uppercase tracking-wider text-[#7F8C8D] font-bold">Sifat Darajasi</div>
                <div className="text-[11px] font-bold text-[#27AE60] font-serif">{certificate.quality_grade || "Grade A+ (Distinguished)"}</div>
              </div>
            </div>
          </div>

          {/* 3. FOOTER: Signatures, 3D Rosette Seal, and QR Verification */}
          <div className="relative z-10 grid grid-cols-3 items-end pt-3 md:pt-5 border-t border-[#D4AF37]/35">
            
            {/* Left: Founder Signature */}
            <div className="text-left pl-1">
              <div className="font-serif italic text-2xl sm:text-3xl text-[#1C2833] leading-none mb-1 rotate-[-2deg]">
                Dilshodbek A.
              </div>
              <div className="w-32 sm:w-44 h-[1px] bg-[#1C2833]/60 mb-1"></div>
              <div className="font-serif text-[9.5px] sm:text-[10.5px] font-bold text-[#1C2833] uppercase">
                {certificate.issued_by_name || "Dilshodbek Abduqodirov"}
              </div>
              <div className="text-[8px] sm:text-[9px] text-[#7F8C8D]">
                Bosh Loyiha Rahbari & Asoschi<br />
                <span className="font-serif italic text-[#996515]">Executive Director, Bookify Foundation</span>
              </div>
            </div>

            {/* Center: 3D Official Gold Rosette Seal with Blue Ribbons */}
            <div className="flex flex-col items-center justify-center -mb-2">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
                {/* Ribbons */}
                <div className="absolute -bottom-3 w-5 h-8 bg-[#1A365D] rotate-[-12deg] shadow-md" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}></div>
                <div className="absolute -bottom-3 w-5 h-8 bg-[#2B6CB0] rotate-[12deg] shadow-md" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}></div>
                
                {/* 3D Rosette Seal */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#996515] via-[#F3E5AB] to-[#AA771C] p-1 shadow-[0_8px_16px_rgba(0,0,0,0.25)] flex items-center justify-center">
                  <div className="w-full h-full rounded-full border-2 border-dashed border-[#804A00] flex flex-col items-center justify-center text-center p-1 bg-gradient-to-br from-[#E6CA65] via-[#D4AF37] to-[#996515] text-[#3E2723]">
                    <span className="text-[10px] sm:text-xs">★</span>
                    <span className="font-serif text-[6.5px] sm:text-[7.5px] font-black uppercase tracking-wider leading-tight">
                      OFFICIAL SEAL<br />OF EXCELLENCE
                    </span>
                    <span className="text-[5.5px] tracking-widest uppercase font-mono font-bold mt-0.5">
                      ★ 2026 ★
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Lead Editor Signature & Real Verification QR */}
            <div className="flex flex-col items-end text-right pr-1">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="text-right">
                  <div className="text-[7.5px] sm:text-[8px] uppercase font-bold text-[#7F8C8D]">Tekshiruv QR:</div>
                  <div className="font-mono text-[8.5px] sm:text-[9.5px] font-bold text-[#1C2833]">{serialNumber}</div>
                  <div className="text-[7px] text-[#996515] font-mono">bookify.uz/verify</div>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white p-0.5 border border-[#D4AF37] shadow-sm rounded">
                  <img src={qrCodeUrl} alt="QR" className="w-full h-full object-contain" />
                </div>
              </div>

              <div className="w-32 sm:w-44 h-[1px] bg-[#1C2833]/60 mb-1"></div>
              <div className="font-serif text-[9.5px] sm:text-[10.5px] font-bold text-[#1C2833] uppercase">
                {certificate.editor_name || "Prof. Azamat Qosimov"}
              </div>
              <div className="text-[8px] sm:text-[9px] text-[#7F8C8D]">
                Bosh Adabiyot Muharriri<br />
                <span className="font-serif italic text-[#996515]">Chief Editorial Board & Verification Lead</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
