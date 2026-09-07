'use client';
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Award, CheckCircle, ExternalLink, ArrowLeft, Printer, AlertTriangle, BookOpen, Clock, Users, Star } from 'lucide-react';
import { api } from '@/services/api';
import VolunteerCertificateModal, { CertificateData } from './VolunteerCertificateModal';

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
      setError(err.message || "Ushbu seriya raqamli sertifikat bazada topilmadi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(serialInput);
  };

  const cert = verificationResult?.certificate;

  return (
    <div className="min-h-screen bg-[#080B0F] text-stone-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-xs font-mono text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Asosiy Kutubxonaga Qaytish</span>
          </button>

          <div className="flex items-center gap-2 text-[11px] font-mono text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            <Award size={14} />
            <span>Rasmiy Reyestr • Bookify Foundation</span>
          </div>
        </div>

        {/* Header Title */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 shadow-xl shadow-amber-500/10 mb-1">
            <ShieldCheck size={36} />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold font-serif text-white tracking-tight">
            Akademik Sertifikat Tekshiruvi
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 max-w-xl mx-auto font-sans leading-relaxed">
            O'zbekiston OTMlari, xalqaro ta'lim grantlari va ish beruvchilar uchun Bookify rasmiy volontyorlik va mutolaa sertifikatlarini tekshirish milliy portali.
          </p>
        </div>

        {/* Verification Search Bar */}
        <div className="bg-stone-900/80 border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
              <input
                type="text"
                value={serialInput}
                onChange={(e) => setSerialInput(e.target.value)}
                placeholder="Sertifikat seriya raqami (masalan: BKFY-VOL-2026-8491X)..."
                className="w-full pl-11 pr-4 py-3.5 bg-stone-950 border border-white/10 rounded-xl text-xs sm:text-sm font-mono text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500 transition-colors uppercase tracking-wider"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !serialInput.trim()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm font-mono transition-all shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <span>Tekshirilmoqda...</span> : <span>Tekshirish</span>}
            </button>
          </form>
        </div>

        {/* Result: Verified Card */}
        {verificationResult && cert && (
          <div className="bg-stone-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in">
            
            {/* Status Pill */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <CheckCircle size={22} />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    Haqiqiy & Rasmiy Tasdiqlangan
                  </div>
                  <div className="text-[11px] text-stone-400">
                    Bookify Reyestr Raqami: <strong className="font-mono text-white">{cert.serial_number}</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setViewingCertificate(cert)}
                className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2b] text-stone-950 font-bold text-xs font-mono flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Printer size={14} />
                <span>To'liq Sertifikatni Ko'rish / Chop Etish</span>
              </button>
            </div>

            {/* Credential Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              
              <div className="p-4 rounded-xl bg-stone-950 border border-white/5 space-y-1">
                <span className="text-stone-500 text-[10px] uppercase">Egasi (Sertifikat Egasi):</span>
                <div className="text-base font-bold text-white font-serif">{cert.recipient_name}</div>
                <div className="text-amber-400 text-[11px]">{cert.role_title}</div>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-white/5 space-y-1">
                <span className="text-stone-500 text-[10px] uppercase">Akkreditatsiya Soati & Bahosi:</span>
                <div className="text-base font-bold text-white font-serif">{cert.accredited_hours}</div>
                <div className="text-emerald-400 text-[11px] font-bold">{cert.quality_grade}</div>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-white/5 space-y-1">
                <span className="text-stone-500 text-[10px] uppercase">Qo'shgan Hissasi (Asarlar & Audio):</span>
                <div className="text-stone-200 text-xs font-semibold">{cert.impact_summary}</div>
                <div className="text-stone-400 text-[10.5px]">Qamrov: {cert.audience_reach}</div>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-white/5 space-y-1">
                <span className="text-stone-500 text-[10px] uppercase">Berilgan Sana & Tasdiqlovchi:</span>
                <div className="text-stone-200 text-xs">{cert.issue_date} yilda tasdiqlangan</div>
                <div className="text-stone-400 text-[10.5px]">{cert.issued_by_name} ({cert.issued_by_title})</div>
              </div>

            </div>

            {/* University Citation Note */}
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-stone-300 space-y-1 font-sans leading-relaxed">
              <strong className="text-amber-400 font-mono">Universitet va qabul komissiyasi diqqatiga:</strong> Ushbu hujjat egasi Bookify madaniy merosni raqamlashtirish loyihasida tasdiqlangan xizmat soatlarini muvaffaqiyatli yakunlagan. Uning xizmatlari O'zbekiston Respublikasi adabiyot va ovozli merosini saqlashga yo'naltirilgan.
            </div>

          </div>
        )}

        {/* Error / Not found message */}
        {error && (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle size={20} />
            </div>
            <h3 className="text-sm font-bold text-rose-300 font-mono">Sertifikat Topilmadi</h3>
            <p className="text-xs text-stone-400 max-w-md mx-auto">
              {error} Seriya raqamini tekshirib, qaytadan urinib ko'ring.
            </p>
          </div>
        )}

      </div>

      {/* Full Luxury Certificate Modal Viewer */}
      {viewingCertificate && (
        <VolunteerCertificateModal
          certificate={viewingCertificate}
          onClose={() => setViewingCertificate(null)}
        />
      )}
    </div>
  );
}
