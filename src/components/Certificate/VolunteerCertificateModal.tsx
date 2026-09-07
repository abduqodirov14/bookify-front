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
  custom_citation?: string;
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
  const [impact, setImpact] = useState(certificate.impact_summary || "O'tkan kunlar (12 ta bob), Qiyomat (10 ta bob) — Jami 22 ta audiobob");
  const [serialNumber, setSerialNumber] = useState(certificate.serial_number || "BKFY-VOL-2026-8491X");
  const [issueDate, setIssueDate] = useState(certificate.issue_date || new Date().toISOString().split('T')[0]);
  const [citation, setCitation] = useState(
    certificate.custom_citation ||
    `in formal academic recognition of outstanding dedication, cultural leadership, and exemplary artistic service as an accredited ${roleTitle}. Through professional narration and text preservation of ${impact}, the recipient has substantially enriched the national digital repository.`
  );

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
      <div className="relative w-full max-w-5xl bg-stone-900 rounded-3xl p-3 sm:p-5 shadow-2xl space-y-3 sm:space-y-4 my-auto border border-amber-500/20 text-stone-100 max-h-[96vh] flex flex-col justify-between">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="print:hidden flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-stone-800 text-stone-200">
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
          className="relative w-full aspect-[1.414/1] bg-[#FDFBF7] text-[#1C2833] rounded-sm p-4 sm:p-6 md:p-8 shadow-2xl flex flex-col justify-between overflow-hidden select-none print:m-0 print:border-none print:shadow-none print:w-[100vw] print:h-[100vh]"
        >
          {/* Subtle Background Geometric Watermark */}
          <div className="absolute inset-0 opacity-[0.035] pointer-events-none flex items-center justify-center">
            <svg className="w-[600px] h-[600px]" viewBox="0 0 200 200" fill="currentColor">
              <path d="M100 0 C120 40, 160 80, 200 100 C160 120, 120 160, 100 200 C80 160, 40 120, 0 100 C40 80, 80 40, 100 0 Z"/>
            </svg>
          </div>

          {/* Luxury Guilloché Multi-Layered Borders */}
          <div className="absolute inset-2 sm:inset-3 border-2 border-[#D4AF37] pointer-events-none"></div>
          <div className="absolute inset-2.5 sm:inset-3.5 border border-[#B38728]/35 pointer-events-none"></div>
          <div className="absolute inset-3.5 sm:inset-4.5 border-[2px] sm:border-[2.5px] border-[#1C2833] pointer-events-none"></div>
          <div className="absolute inset-4.5 sm:inset-5.5 border border-[#D4AF37]/50 pointer-events-none"></div>

          {/* SVG Ornate Gold Corner Filigrees - Subtly framed in corners */}
          <svg className="absolute top-2 left-2 w-8 h-8 text-[#B38728] pointer-events-none opacity-35" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 5 L95 5 M5 5 L5 95 M15 15 L85 15 M15 15 L15 85 M25 25 L75 25 M25 25 L25 75"/>
            <circle cx="50" cy="50" r="18" strokeDasharray="2 2"/>
            <path d="M5 5 Q50 5 50 50 Q5 50 5 5 Z" fill="#D4AF37" fillOpacity="0.15"/>
          </svg>
          <svg className="absolute top-2 right-2 w-8 h-8 text-[#B38728] pointer-events-none opacity-35 rotate-90" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 5 L95 5 M5 5 L5 95 M15 15 L85 15 M15 15 L15 85 M25 25 L75 25 M25 25 L25 75"/>
            <circle cx="50" cy="50" r="18" strokeDasharray="2 2"/>
            <path d="M5 5 Q50 5 50 50 Q5 50 5 5 Z" fill="#D4AF37" fillOpacity="0.15"/>
          </svg>
          <svg className="absolute bottom-2 left-2 w-8 h-8 text-[#B38728] pointer-events-none opacity-35 -rotate-90" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 5 L95 5 M5 5 L5 95 M15 15 L85 15 M15 15 L15 85 M25 25 L75 25 M25 25 L25 75"/>
            <circle cx="50" cy="50" r="18" strokeDasharray="2 2"/>
            <path d="M5 5 Q50 5 50 50 Q5 50 5 5 Z" fill="#D4AF37" fillOpacity="0.15"/>
          </svg>
          <svg className="absolute bottom-2 right-2 w-8 h-8 text-[#B38728] pointer-events-none opacity-35 rotate-180" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 5 L95 5 M5 5 L5 95 M15 15 L85 15 M15 15 L15 85 M25 25 L75 25 M25 25 L25 75"/>
            <circle cx="50" cy="50" r="18" strokeDasharray="2 2"/>
            <path d="M5 5 Q50 5 50 50 Q5 50 5 5 Z" fill="#D4AF37" fillOpacity="0.15"/>
          </svg>

          {/* 1. HEADER: Emblem & Academic Typography */}
          <div className="relative z-10 text-center pt-0.5 sm:pt-1">
            
            {/* Heraldic Crest */}
            <div className="inline-flex items-center justify-center mb-0.5">
              <svg className="w-9 h-9 sm:w-11 sm:h-11 text-[#996515]" viewBox="0 0 64 64" fill="currentColor">
                <path d="M32 4 C30 12, 18 16, 12 28 C6 40, 14 54, 32 60 C50 54, 58 40, 52 28 C46 16, 34 12, 32 4 Z" fill="none" stroke="#B38728" strokeWidth="2"/>
                <path d="M32 20 C28 24, 20 25, 16 28 L16 48 C20 46, 28 45, 32 48 C36 45, 44 46, 48 48 L48 28 C44 25, 36 24, 32 20 Z" fill="#1C2833"/>
                <path d="M32 20 L32 48" stroke="#FDFBF7" strokeWidth="1.5"/>
                <polygon points="32,10 34,15 39,15 35,18 37,23 32,20 27,23 29,18 25,15 30,15" fill="#D4AF37"/>
              </svg>
            </div>

            {/* Institution Brand */}
            <div className="font-serif text-[9px] sm:text-[10px] md:text-xs font-bold tracking-[0.22em] text-[#5D6D7E] uppercase">
              Bookify Digital Library Foundation & Cultural Initiative
            </div>
            <div className="text-[7.5px] sm:text-[8.5px] tracking-[0.14em] text-[#85929E] uppercase font-semibold">
              O'zbekiston Milliy Adabiyoti va Ovozli Merosini Raqamlashtirish Dasturi
            </div>

            {/* Main Certificate Title */}
            <div className="mt-1 sm:mt-1.5">
              <h2 className="font-serif text-lg sm:text-2xl md:text-3xl font-bold tracking-[0.16em] text-[#1C2833] uppercase">
                Certificate of Merit
              </h2>
              <div className="text-[9.5px] sm:text-[11px] font-serif font-semibold tracking-[0.26em] text-[#996515] uppercase mt-0.5">
                & Distinguished Voluntary Service
              </div>
              <div className="flex items-center justify-center gap-2.5 my-1">
                <span className="h-[1px] w-16 sm:w-28 bg-gradient-to-r from-transparent via-[#D4AF37] to-[#B38728]"></span>
                <span className="w-1.5 h-1.5 rotate-45 border border-[#B38728] bg-[#D4AF37]"></span>
                <span className="h-[1px] w-16 sm:w-28 bg-gradient-to-l from-transparent via-[#D4AF37] to-[#B38728]"></span>
              </div>
            </div>
          </div>

          {/* 2. BODY: Conferred statement & Recipient Name */}
          <div className="relative z-10 text-center my-auto px-4 sm:px-6">
            <p className="font-serif italic text-[11px] sm:text-xs md:text-sm text-[#5D6D7E]">
              This prestigious credential is formally conferred upon
            </p>

            {/* Recipient Full Name */}
            <div className="my-1 sm:my-1.5">
              <h1 className="font-serif text-xl sm:text-3xl md:text-4xl font-bold tracking-[0.06em] text-[#1C2833] border-b-2 border-[#D4AF37]/50 inline-block px-4 sm:px-8 pb-0.5">
                {recipientName.toUpperCase()}
              </h1>
            </div>

            {/* Academic & Creative Citation */}
            <p className="text-[9.5px] sm:text-[11px] md:text-xs leading-relaxed text-[#34495E] max-w-3xl mx-auto font-sans mt-0.5">
              {citation}
            </p>

            {/* Single-Row Balanced Institutional Transcript Bar */}
            <div className="grid grid-cols-12 divide-x divide-[#D4AF37]/35 bg-[#F4F1EA]/85 border border-[#D4AF37]/45 rounded-lg max-w-3xl sm:max-w-4xl mx-auto mt-2 sm:mt-2.5 shadow-xs overflow-hidden">
              <div className="col-span-2 p-1 sm:p-1.5 text-center">
                <div className="text-[6.5px] sm:text-[7.5px] uppercase tracking-wider text-[#7F8C8D] font-bold font-mono">Xizmat Davri</div>
                <div className="text-[8.5px] sm:text-[10px] font-bold text-[#1C2833] font-serif truncate" title={servicePeriod}>
                  {servicePeriod.includes('(') ? servicePeriod.split('(')[1].replace(')', '') : '1 yil'}
                </div>
              </div>

              <div className="col-span-2 p-1 sm:p-1.5 text-center">
                <div className="text-[6.5px] sm:text-[7.5px] uppercase tracking-wider text-[#7F8C8D] font-bold font-mono">Akkreditatsiya</div>
                <div className="text-[8.5px] sm:text-[10px] font-bold text-[#1C2833] font-serif truncate" title={hours}>
                  {hours}
                </div>
              </div>

              <div className="col-span-4 p-1 sm:p-1.5 text-center px-1.5">
                <div className="text-[6.5px] sm:text-[7.5px] uppercase tracking-wider text-[#7F8C8D] font-bold font-mono">Bajarilgan Ish</div>
                <div className="text-[8px] sm:text-[9.5px] font-bold text-[#1C2833] font-serif truncate" title={impact}>
                  {impact}
                </div>
              </div>

              <div className="col-span-2 p-1 sm:p-1.5 text-center">
                <div className="text-[6.5px] sm:text-[7.5px] uppercase tracking-wider text-[#7F8C8D] font-bold font-mono">Tinglovchilar</div>
                <div className="text-[8.5px] sm:text-[10px] font-bold text-[#1C2833] font-serif truncate">
                  {certificate.audience_reach || "12,500+"}
                </div>
              </div>

              <div className="col-span-2 p-1 sm:p-1.5 text-center bg-[#EBF5FB]/60">
                <div className="text-[6.5px] sm:text-[7.5px] uppercase tracking-wider text-[#2980B9] font-bold font-mono">Akademik Baho</div>
                <div className="text-[8.5px] sm:text-[10px] font-bold text-[#27AE60] font-serif truncate">
                  {certificate.quality_grade || "Grade A+"}
                </div>
              </div>
            </div>
          </div>

          {/* 3. FOOTER: Signatures, 3D Rosette Seal, and QR Verification */}
          <div className="relative z-10 grid grid-cols-3 items-end px-6 sm:px-10 pb-2 sm:pb-3 pt-2 border-t border-[#D4AF37]/35 mt-1">
            
            {/* Left: Founder Signature */}
            <div className="text-left">
              <div className="font-serif italic text-lg sm:text-xl text-[#1C2833] leading-none mb-0.5 rotate-[-2deg]">
                Dilshodbek A.
              </div>
              <div className="w-28 sm:w-36 h-[1px] bg-[#1C2833]/60 mb-0.5"></div>
              <div className="font-serif text-[8.5px] sm:text-[9.5px] font-bold text-[#1C2833] uppercase leading-tight">
                {certificate.issued_by_name || "Dilshodbek Abduqodirov"}
              </div>
              <div className="text-[7px] sm:text-[8px] text-[#7F8C8D] leading-tight">
                Bosh Loyiha Rahbari & Asoschi<br />
                <span className="font-serif italic text-[#996515]">Executive Director, Bookify Foundation</span>
              </div>
            </div>

            {/* Center: 3D Official Gold Rosette Seal */}
            <div className="flex flex-col items-center justify-center -mb-0.5">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                {/* Ribbons tucked safely inside */}
                <div className="absolute -bottom-1.5 w-3.5 sm:w-4 h-5 sm:h-6 bg-[#1A365D] rotate-[-12deg] shadow-md" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}></div>
                <div className="absolute -bottom-1.5 w-3.5 sm:w-4 h-5 sm:h-6 bg-[#2B6CB0] rotate-[12deg] shadow-md" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}></div>
                
                {/* 3D Rosette Seal */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#996515] via-[#F3E5AB] to-[#AA771C] p-0.5 shadow-[0_4px_12px_rgba(0,0,0,0.18)] flex items-center justify-center">
                  <div className="w-full h-full rounded-full border border-dashed border-[#804A00] flex flex-col items-center justify-center text-center p-0.5 bg-gradient-to-br from-[#E6CA65] via-[#D4AF37] to-[#996515] text-[#3E2723]">
                    <span className="text-[8px] sm:text-[10px]">★</span>
                    <span className="font-serif text-[5.5px] sm:text-[6.5px] font-black uppercase tracking-wider leading-none">
                      OFFICIAL SEAL<br />OF EXCELLENCE
                    </span>
                    <span className="text-[4.5px] sm:text-[5px] tracking-widest uppercase font-mono font-bold mt-0.5">
                      ★ 2026 ★
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Lead Editor Signature & Real Verification QR */}
            <div className="flex flex-col items-end text-right">
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="text-right">
                  <div className="text-[6.5px] sm:text-[7px] uppercase font-bold text-[#7F8C8D]">Tekshiruv QR:</div>
                  <div className="font-mono text-[7.5px] sm:text-[8.5px] font-bold text-[#1C2833]">{serialNumber}</div>
                  <div className="text-[6px] text-[#996515] font-mono">bookify.uz/verify</div>
                </div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white p-0.5 border border-[#D4AF37] shadow-xs rounded">
                  <img src={qrCodeUrl} alt="QR" className="w-full h-full object-contain" />
                </div>
              </div>

              <div className="w-28 sm:w-36 h-[1px] bg-[#1C2833]/60 mb-0.5"></div>
              <div className="font-serif text-[8.5px] sm:text-[9.5px] font-bold text-[#1C2833] uppercase leading-tight">
                {certificate.editor_name || "Prof. Azamat Qosimov"}
              </div>
              <div className="text-[7px] sm:text-[8px] text-[#7F8C8D] leading-tight">
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
