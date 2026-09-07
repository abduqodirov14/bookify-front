'use client';
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Award, 
  CheckCircle, 
  ExternalLink, 
  ArrowLeft, 
  Printer, 
  AlertTriangle, 
  BookOpen, 
  Clock, 
  Users, 
  Share2,
  Calendar,
  Building2,
  Check,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { api } from '@/services/api';
import VolunteerCertificateModal, { CertificateData } from './VolunteerCertificateModal';
import { calculateVolunteerPeriod } from '@/utils/dateUtils';
import { toast } from 'react-hot-toast';

interface Props {
  initialSerial?: string;
  onNavigateHome: () => void;
}

export default function VerifyCertificatePage({ initialSerial = '', onNavigateHome }: Props) {
  const [serialInput, setSerialInput] = useState(initialSerial);
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<CertificateData | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (initialSerial.trim()) {
      handleVerify(initialSerial.trim());
    }
  }, [initialSerial]);

  const handleVerify = async (code: string) => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.verifyCertificate(code.trim());
      setVerificationResult(data);
    } catch (err: any) {
      setVerificationResult(null);
      setError(err.message || "Ushbu seriya raqamli sertifikat reyestrda topilmadi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(serialInput);
  };

  const cert = verificationResult?.certificate;

  // Xizmat davrini hisoblash
  const periodCalc = calculateVolunteerPeriod(cert?.service_start || '2025-09-01', cert?.service_end || cert?.issue_date);
  const displayPeriod = cert?.service_period || periodCalc.fullPeriodText;

  const handleCopyVerificationLink = () => {
    const link = cert?.verification_url || window.location.href;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success("Universitet tekshiruv havolasi nusxalandi!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0B0F17] text-stone-900 dark:text-stone-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Back Navigation & Registry Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Asosiy Kutubxonaga Qaytish</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-500/20 font-medium">
            <Building2 size={14} />
            <span>Rasmiy Reyestr • Bookify Digital Library Foundation</span>
          </div>
        </div>

        {/* Heraldic Crest Header */}
        <div className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 shadow-md mb-1">
            <ShieldCheck size={32} />
          </div>
          <div className="text-[11px] font-mono tracking-widest text-amber-600 dark:text-amber-400 uppercase font-semibold">
            O'zbekiston Milliy Adabiyoti va Ovozli Merosini Raqamlashtirish Dasturi
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-stone-950 dark:text-white tracking-tight">
            Akademik Sertifikat Tekshiruvi
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
            O'zbekiston OTMlari rektoratlari (stipendiya, diplom ilovasi), xalqaro ta'lim grantlari (Chevening, Erasmus, DAAD, El-yurt umidi) va ish beruvchilar uchun rasmiy davlat va akademik tekshiruv milliy reyestri.
          </p>
        </div>

        {/* Verification Search Bar */}
        <div className="bg-white dark:bg-[#121620] border border-stone-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="text"
                value={serialInput}
                onChange={(e) => setSerialInput(e.target.value)}
                placeholder="Sertifikat seriya raqami (masalan: BKFY-VOL-2026-8491X)..."
                className="w-full pl-11 pr-4 py-3 bg-stone-50 dark:bg-[#0B0F17] border border-stone-200 dark:border-white/10 rounded-xl text-xs sm:text-sm font-mono text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:border-amber-500 transition-colors uppercase tracking-wider"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !serialInput.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <span>Tekshirilmoqda...</span> : <span>Tekshirish</span>}
            </button>
          </form>
        </div>

        {/* Result: Official Academic Credential Transcript */}
        {verificationResult && cert && (
          <div className="bg-white dark:bg-[#121620] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
            
            {/* Top Status & Fast Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-stone-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span>HAQIQIY & RASMIY TASDIQLANGAN</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Bookify Reyestr Raqami: <strong className="font-mono text-stone-900 dark:text-white font-bold">{cert.serial_number}</strong>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyVerificationLink}
                  className="px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-white/5 hover:bg-stone-200 dark:hover:bg-white/10 text-stone-700 dark:text-stone-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
                  <span>{copiedLink ? "Nusxalandi" : "Havola"}</span>
                </button>

                <button
                  onClick={() => setViewingCertificate(cert)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <FileCheck2 size={15} />
                  <span>Asl Sertifikatni Ko'rish / Yuklab Olish</span>
                </button>
              </div>
            </div>

            {/* Official Credential Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Sohibi */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#0B0F17] border border-stone-200/80 dark:border-white/5 space-y-1">
                <span className="text-stone-500 dark:text-stone-400 text-[11px] block">
                  Sertifikat Sohibi (Volontyor):
                </span>
                <div className="text-base font-serif font-bold text-stone-900 dark:text-white">
                  {cert.recipient_name}
                </div>
                <div className="text-amber-700 dark:text-amber-400 text-xs font-medium">
                  {cert.role_title}
                </div>
              </div>

              {/* Xizmat Davri (Calculated Duration) */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 space-y-1">
                <span className="text-amber-800 dark:text-amber-300 text-[11px] font-semibold flex items-center gap-1.5">
                  <Calendar size={13} />
                  <span>Volontyorlik Davri & Xizmat Muddati:</span>
                </span>
                <div className="text-sm font-bold text-stone-900 dark:text-white">
                  {displayPeriod}
                </div>
                <div className="text-stone-500 dark:text-stone-400 text-[11px]">
                  {periodCalc.academicYearText} • To'liq tasdiqlangan
                </div>
              </div>

              {/* Akkreditatsiya Soati & Bahosi */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#0B0F17] border border-stone-200/80 dark:border-white/5 space-y-1">
                <span className="text-stone-500 dark:text-stone-400 text-[11px] block">
                  Akkreditatsiya Soati & Akademik Bahosi:
                </span>
                <div className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <span>{cert.accredited_hours}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                    {cert.quality_grade}
                  </span>
                </div>
                <div className="text-stone-500 dark:text-stone-400 text-[11px]">
                  OTMlar va xalqaro kredit-modul tizimi (ECTS) uchun tavsiya etiladi
                </div>
              </div>

              {/* Qo'shgan Hissasi */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#0B0F17] border border-stone-200/80 dark:border-white/5 space-y-1">
                <span className="text-stone-500 dark:text-stone-400 text-[11px] block">
                  Qo'shgan Hissasi (Asarlar & Audio):
                </span>
                <div className="text-sm font-bold text-stone-900 dark:text-white">
                  {cert.impact_summary}
                </div>
                <div className="text-stone-500 dark:text-stone-400 text-[11px]">
                  Tinglovchilar qamrovi: {cert.audience_reach}
                </div>
              </div>

              {/* Rasmiy Tavsifnoma / Citation */}
              {cert.custom_citation && (
                <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-500/5 border border-amber-200/80 dark:border-amber-500/20 space-y-1.5 md:col-span-2">
                  <span className="text-amber-800 dark:text-amber-300 text-[11px] font-semibold flex items-center gap-1.5">
                    <Sparkles size={13} />
                    <span>Akademik va Ijodiy Tavsifnoma (Rasmiy Izoh):</span>
                  </span>
                  <blockquote className="font-serif italic text-xs text-stone-800 dark:text-stone-200 leading-relaxed pl-3 border-l-2 border-amber-500/60">
                    "{cert.custom_citation}"
                  </blockquote>
                </div>
              )}

              {/* Berilgan Sana & Mas'ullar */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#0B0F17] border border-stone-200/80 dark:border-white/5 space-y-1 md:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-stone-500 dark:text-stone-400 text-[11px] block">
                      Tasdiqlangan Sana:
                    </span>
                    <div className="text-xs font-semibold text-stone-900 dark:text-white mt-0.5">
                      {cert.issue_date} yilda rasmiylashtirilgan
                    </div>
                  </div>
                  <div>
                    <span className="text-stone-500 dark:text-stone-400 text-[11px] block">
                      Tasdiqlovchi Hay'at A'zolari:
                    </span>
                    <div className="text-xs text-stone-800 dark:text-stone-200 font-medium mt-0.5">
                      <strong>{cert.issued_by_name}</strong> ({cert.issued_by_title})
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      <strong>{cert.editor_name}</strong> ({cert.editor_title})
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Official University Guidance Clause */}
            <div className="p-4 rounded-2xl bg-stone-100/70 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-xs text-stone-700 dark:text-stone-300 space-y-1.5 leading-relaxed">
              <div className="font-semibold text-stone-900 dark:text-white flex items-center gap-1.5">
                <Award size={15} className="text-amber-600 dark:text-amber-400" />
                <span>Universitet rektoratlari va qabul komissiyalari diqqatiga:</span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-400">
                Ushbu rasmiy reyestr hujjati egasi ko'rsatilgan xizmat davrida Bookify madaniy merosni raqamlashtirish loyihasida to'liq ishtirok etib, xizmat soatlarini muvaffaqiyatli bajargan. Mazkur soatlar talabaning ijtimoiy faollik ko'rsatkichlari, OTM stipendiyalari, magistratura va xalqaro ta'lim grantlari arizalarida to'liq tan olinadi.
              </p>
            </div>

          </div>
        )}

        {/* Error / Not found */}
        {error && (
          <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle size={20} />
            </div>
            <h3 className="text-sm font-bold text-rose-700 dark:text-rose-300">
              Sertifikat Topilmadi
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 max-w-md mx-auto">
              {error} Seriya raqamini tekshirib, qaytadan urinib ko'ring.
            </p>
          </div>
        )}

      </div>

      {/* Full Luxury Certificate Modal */}
      {viewingCertificate && (
        <VolunteerCertificateModal
          certificate={viewingCertificate}
          onClose={() => setViewingCertificate(null)}
        />
      )}
    </div>
  );
}
