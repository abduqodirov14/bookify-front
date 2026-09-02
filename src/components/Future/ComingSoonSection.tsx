'use client';
import React, { useState } from 'react';

const BOOKIFY_FEATURES = [
  {
    icon: '🌍',
    titleUz: 'AI Universal Tarjima',
    titleEn: 'AI Universal Translation',
    descUz: "Istalgan kitobni o'zbek tilida o'qing — ingliz, yapon, koreys, ispan va 50+ tildan. AI muallifning ovozi va badiiy uslubini aynan saqlaydi.",
    badgeUz: '2027 yilda',
    badgeYear: 'Q1 2027',
    accentColor: '#06B6D4',
    glow: 'rgba(6, 182, 212, 0.15)',
    border: 'rgba(6, 182, 212, 0.35)',
    bg: 'rgba(6, 182, 212, 0.08)',
    waitlistBase: 2400,
    detail: "50+ til • Mualliflik huquqiga mos • Sifatli o'zbekcha matn",
  },
  {
    icon: '🔊',
    titleUz: 'Tabiiy AI Audiokitoblar',
    titleEn: 'Natural AI Audiobooks',
    descUz: "Robot emas. Hissiyotli, to'xtamli, personajlar ovozi bilan haqiqiy kinematografik o'qish — Gollivud darajasida.",
    badgeUz: 'Beta Tez Kunda',
    badgeYear: 'Q3 2026',
    accentColor: '#8B5CF6',
    glow: 'rgba(139, 92, 246, 0.15)',
    border: 'rgba(139, 92, 246, 0.35)',
    bg: 'rgba(139, 92, 246, 0.08)',
    waitlistBase: 1800,
    detail: "Natural intonatsiya • Dialog ohanglari • Hissiy ifoda",
  },
  {
    icon: '🧠',
    titleUz: "AI O'qish Assistenti",
    titleEn: 'AI Reading Assistant',
    descUz: "Kitob haqida istalgan savol bering. Tushuntirishlar, belgilar xaritasi, syujet qisqacha — soniyalar ichida.",
    badgeUz: 'Ishlab Chiqilmoqda',
    badgeYear: '2026',
    accentColor: '#F5C842',
    glow: 'rgba(245, 200, 66, 0.15)',
    border: 'rgba(245, 200, 66, 0.35)',
    bg: 'rgba(245, 200, 66, 0.08)',
    waitlistBase: 3100,
    detail: "Belgilar tahlili • Mavzu chuqurlashtirish • GPT-4 darajasida",
  },
  {
    icon: '🥽',
    titleUz: "VR Imerssiv O'qish",
    titleEn: 'VR Immersive Experience',
    descUz: "Faqat o'qimang — ichiga kiring. Kitob dunyosini virtual haqiqatda boshdan kechiring. Hogvarts yoki Qiyomat olamiga qadam basing.",
    badgeUz: '2027 Istiqbol',
    badgeYear: '2027+',
    accentColor: '#F43F5E',
    glow: 'rgba(244, 63, 94, 0.15)',
    border: 'rgba(244, 63, 94, 0.35)',
    bg: 'rgba(244, 63, 94, 0.08)',
    waitlistBase: 4200,
    detail: "Meta Quest • Apple Vision Pro • Immersiv 3D sahnalar",
  },
];

function FeatureCard({ feature, index }: { feature: typeof BOOKIFY_FEATURES[0]; index: number }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const count = feature.waitlistBase + index * 37;

  const handleNotify = () => {
    setIsSubscribed(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Body */}
      <div
        className={`relative rounded-3xl p-6 sm:p-7 h-full flex flex-col gap-4 overflow-hidden transition-all duration-300 ${
          isHovered
            ? 'shadow-2xl -translate-y-2'
            : 'shadow-xs translate-y-0'
        } bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10`}
        style={{
          borderColor: isHovered ? feature.accentColor : undefined,
        }}
      >
        {/* Badge row */}
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full font-mono"
            style={{
              background: feature.bg,
              color: feature.accentColor,
              border: `1px solid ${feature.border}`,
            }}
          >
            {feature.badgeUz}
          </span>
          <span className="text-[10px] text-stone-400 font-mono tracking-wider">
            {feature.badgeYear}
          </span>
        </div>

        {/* Icon */}
        <div className="text-4xl w-14 h-14 rounded-2xl flex items-center justify-center bg-stone-50 dark:bg-white/5 border border-stone-100 dark:border-white/5">
          {feature.icon}
        </div>

        {/* Titles */}
        <div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-white mb-0.5 leading-snug">
            {feature.titleUz}
          </h3>
          <p className="text-[10px] text-stone-400 font-mono tracking-widest uppercase">
            {feature.titleEn}
          </p>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed flex-1">
          {feature.descUz}
        </p>

        {/* Tech detail chip */}
        <div
          className="text-[11px] font-mono px-3 py-2 rounded-xl"
          style={{ background: feature.bg, color: feature.accentColor }}
        >
          {feature.detail}
        </div>

        {/* Waitlist count */}
        <p className="text-[11px] font-mono text-stone-400">
          🔔 {count.toLocaleString()}+ kitobxon kutmoqda
        </p>

        {/* CTA button */}
        <div>
          {!isSubscribed ? (
            <button
              onClick={handleNotify}
              className="w-full py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider active:scale-95 cursor-pointer transition-all shadow-xs"
              style={{
                background: isHovered ? feature.accentColor : 'transparent',
                border: `1px solid ${feature.accentColor}`,
                color: isHovered ? '#000' : feature.accentColor,
              }}
            >
              🔔 Xabar Berish
            </button>
          ) : (
            <div
              className="w-full py-2.5 rounded-xl text-xs font-mono font-bold text-center"
              style={{
                background: feature.bg,
                color: feature.accentColor,
                border: `1px solid ${feature.border}`,
              }}
            >
              🎉 Siz ro'yxatdasiz!
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-mono font-bold whitespace-nowrap shadow-xl z-50 text-white bg-stone-900 dark:bg-white dark:text-stone-900"
        >
          🎉 Siz birinchilar ro'yxatiga qo'shildingiz!
        </div>
      )}
    </div>
  );
}

export default function ComingSoonSection() {
  return (
    <div className="space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E05638]/10 text-[#E05638] text-xs font-mono font-bold uppercase tracking-wider border border-[#E05638]/20">
          <span className="w-2 h-2 rounded-full bg-[#E05638] animate-pulse" />
          <span>Bookify Kelajak Viziyasi</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950 dark:text-white">
          O'qishning Kelajak Imkoniyatlari
        </h2>

        <p className="text-sm text-stone-500 leading-relaxed">
          Bookify loyihasining uzoq muddatli yo'l xaritasi (Roadmap). Biz dunyo adabiyotini har bir kitobxonga uning tilida yetkazish ustida ishlamoqdamiz.
        </p>

        {/* Vision Journey Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono pt-2">
          {[
            { label: "📖 O'qish (Live)", color: '#E05638' },
            { label: '→' },
            { label: '🔊 Audio-Teatr', color: '#8B5CF6' },
            { label: '→' },
            { label: '🌍 AI Tarjima', color: '#06B6D4' },
            { label: '→' },
            { label: '🧠 AI Yordamchi', color: '#F5C842' },
            { label: '→' },
            { label: '🥽 VR Olam', color: '#F43F5E' },
          ].map((item: any, i) => (
            item.label === '→' ? (
              <span key={i} className="text-stone-300 dark:text-stone-700 text-sm">→</span>
            ) : (
              <span
                key={i}
                className="px-3 py-1 rounded-full font-bold"
                style={{
                  background: `${item.color}15`,
                  color: item.color,
                  border: `1px solid ${item.color}30`,
                }}
              >
                {item.label}
              </span>
            )
          ))}
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {BOOKIFY_FEATURES.map((feature, index) => (
          <FeatureCard key={feature.titleEn} feature={feature} index={index} />
        ))}
      </div>

      {/* Pitch Deck Banner Box */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-stone-900 to-stone-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl border border-stone-800">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-serif text-xl font-bold">
            Rasmiy Startup Investor Pitch Deck (2026)
          </h3>
          <p className="text-xs text-stone-400 font-mono">
            Bozor tahlili, biznes model, TAM ($1.8B) va to'liq yo'l xaritasini PDF yoki online ko'rish
          </p>
        </div>
        <a
          href="/pitch-deck.html"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-2xl bg-[#E05638] hover:bg-[#C74326] text-white text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95 whitespace-nowrap"
        >
          📄 Pitch Deckni Ochish (PDF) →
        </a>
      </div>

    </div>
  );
}
