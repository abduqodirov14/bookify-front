'use client';
import React, { useState } from 'react';

const BOOKIFY_FEATURES = [
  {
    icon: '🌍',
    titleUz: 'AI Universal Tarjima',
    titleEn: 'AI Universal Translation',
    descUz: "Istalgan kitobni o'zbek tilida o'qing — ingliz, yapon, koreys, ispan va 50+ tildan. AI muallifning ovozi va uslubini aynan saqlaydi.",
    badgeUz: '2027 yilda',
    badgeYear: 'Q1 2027',
    accentColor: '#06B6D4',
    glow: 'rgba(6, 182, 212, 0.18)',
    border: 'rgba(6, 182, 212, 0.38)',
    bg: 'rgba(6, 182, 212, 0.10)',
    waitlistBase: 2400,
    detail: "50+ til  •  Mualliflik huquqiga mos  •  Sifatli o'zbekcha matn",
  },
  {
    icon: '🔊',
    titleUz: 'Tabiiy AI Audioknobalar',
    titleEn: 'Natural AI Audiobooks',
    descUz: "Robot emas. Hissiyotli, to'xtamli, personajlar ovozi bilan haqiqiy kinematografik o'qish — Gollivud darajasida.",
    badgeUz: 'Beta Tez Kunda',
    badgeYear: 'Q3 2026',
    accentColor: '#8B5CF6',
    glow: 'rgba(139, 92, 246, 0.18)',
    border: 'rgba(139, 92, 246, 0.38)',
    bg: 'rgba(139, 92, 246, 0.10)',
    waitlistBase: 1800,
    detail: "Natural intonatsiya  •  Dialog ohanglari  •  Hissiy ifoda",
  },
  {
    icon: '🧠',
    titleUz: "AI O'qish Assistenti",
    titleEn: 'AI Reading Assistant',
    descUz: "Kitob haqida istalgan savol bering. Tushuntirishlar, belgilar xaritasi, syujet qisqacha — soniyalar ichida.",
    badgeUz: 'Ishlab Chiqilmoqda',
    badgeYear: '2026',
    accentColor: '#F5C842',
    glow: 'rgba(245, 200, 66, 0.18)',
    border: 'rgba(245, 200, 66, 0.38)',
    bg: 'rgba(245, 200, 66, 0.10)',
    waitlistBase: 3100,
    detail: "Belgilar tahlili  •  Mavzu chuqurlashtirish  •  GPT-4 darajasida",
  },
  {
    icon: '🥽',
    titleUz: "VR Imerssiv O'qish",
    titleEn: 'VR Immersive Experience',
    descUz: "Faqat o'qimang — ichiga kiring. Kitob dunyosini virtual haqiqatda boshdan kechiring. Hogvarts yoki Qiyomat dunyosiga qadam basing.",
    badgeUz: '2027 Istiqbol',
    badgeYear: '2027+',
    accentColor: '#F43F5E',
    glow: 'rgba(244, 63, 94, 0.18)',
    border: 'rgba(244, 63, 94, 0.38)',
    bg: 'rgba(244, 63, 94, 0.10)',
    waitlistBase: 4200,
    detail: "Meta Quest  •  Apple Vision Pro  •  Immersiv 3D sahnalar",
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
      {/* Rotating gradient border on hover */}
      <div
        className="absolute inset-[-1px] rounded-[22px] pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `conic-gradient(from 0deg, transparent 0%, ${feature.accentColor} 20%, transparent 40%)`,
          animation: isHovered ? 'cssSpin 2.5s linear infinite' : 'none',
        }}
      />

      {/* Card Body */}
      <div
        className="relative rounded-[20px] p-6 sm:p-7 h-full flex flex-col gap-4 overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: `1px solid ${isHovered ? feature.border : 'rgba(255,255,255,0.07)'}`,
          boxShadow: isHovered
            ? `0 24px 64px rgba(0,0,0,0.55), 0 0 48px ${feature.glow}`
            : '0 8px 32px rgba(0,0,0,0.4)',
          transform: isHovered ? 'translateY(-8px) scale(1.01)' : 'translateY(0) scale(1)',
          opacity: isHovered ? 1 : 0.82,
          filter: isHovered ? 'saturate(1)' : 'saturate(0.6)',
          transition: 'all 0.45s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Inner ambient glow */}
        <div
          className="absolute inset-0 rounded-[20px] pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% -10%, ${feature.accentColor}22, transparent 65%)`,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        />

        {/* Pulse blob */}
        <div
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${feature.accentColor}14, transparent 70%)`,
            animation: 'cssBlob 4s ease-in-out infinite alternate',
          }}
        />

        {/* Badge row */}
        <div className="relative flex items-center justify-between z-10">
          <span
            className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
            style={{
              background: feature.bg,
              color: feature.accentColor,
              border: `1px solid ${feature.border}`,
            }}
          >
            {feature.badgeUz}
          </span>
          <span className="text-[10px] text-white/25 font-mono tracking-wider">
            {feature.badgeYear}
          </span>
        </div>

        {/* Floating icon */}
        <div
          className="relative text-5xl w-16 h-16 flex items-center justify-center z-10"
          style={{ animation: 'cssFloat 4s ease-in-out infinite' }}
        >
          <span style={{ filter: isHovered ? 'drop-shadow(0 0 12px ' + feature.accentColor + ')' : 'none', transition: 'filter 0.4s ease' }}>
            {feature.icon}
          </span>
        </div>

        {/* Titles */}
        <div className="relative z-10">
          <h3 className="text-[19px] sm:text-[21px] font-bold text-white mb-1 leading-snug">
            {feature.titleUz}
          </h3>
          <p className="text-[11px] text-white/30 font-mono tracking-widest uppercase">
            {feature.titleEn}
          </p>
        </div>

        {/* Description */}
        <p className="relative text-[13px] sm:text-[14px] text-white/55 leading-relaxed flex-1 z-10">
          {feature.descUz}
        </p>

        {/* Tech detail chip */}
        <div
          className="relative z-10 text-[11px] font-mono px-3 py-2 rounded-lg"
          style={{ background: feature.bg, color: feature.accentColor }}
        >
          {feature.detail}
        </div>

        {/* Waitlist count */}
        <p className="relative text-[11px] text-white/30 z-10">
          🔔 {count.toLocaleString()}+ kishi ro'yxatga kirdi
        </p>

        {/* CTA button */}
        <div className="relative z-10">
          {!isSubscribed ? (
            <button
              onClick={handleNotify}
              className="w-full py-2.5 rounded-xl text-sm font-bold tracking-wide active:scale-95 cursor-pointer"
              style={{
                background: isHovered ? feature.accentColor : 'transparent',
                border: `1px solid ${feature.border}`,
                color: isHovered ? (feature.accentColor === '#F5C842' ? '#000' : '#fff') : feature.accentColor,
                transition: 'all 0.3s ease',
              }}
            >
              🔔 Xabar Ber — Birinchi Bo'l
            </button>
          ) : (
            <div
              className="w-full py-2.5 rounded-xl text-sm font-bold text-center"
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
          className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap shadow-2xl z-50 animate-bounce"
          style={{
            background: feature.accentColor,
            color: feature.accentColor === '#F5C842' ? '#000' : '#fff',
          }}
        >
          🎉 Birinchilar orasida! Tez orada xabar beramiz.
        </div>
      )}
    </div>
  );
}

export default function ComingSoonSection() {
  return (
    <section
      className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden"
      style={{
        background: '#0A0D14',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}
    >
      {/* Global ambient blob */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: '700px',
          height: '500px',
          background:
            'radial-gradient(ellipse at center, rgba(139,92,246,0.07) 0%, rgba(6,182,212,0.04) 40%, transparent 70%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto">

        {/* ── Section Header ── */}
        <div className="text-center mb-14 sm:mb-20">
          {/* Live dev indicator */}
          <div className="inline-flex items-center gap-2.5 mb-6 px-4 py-2 rounded-full border border-white/10 text-white/50 text-xs backdrop-blur-sm">
            <span
              className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"
              style={{ animation: 'cssBlob 1.8s ease-in-out infinite' }}
            />
            <span className="font-mono uppercase tracking-widest">
              Faol Ishlab Chiqilmoqda
            </span>
          </div>

          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-5 leading-tight">
            O'qishning{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #F5C842 0%, #F43F5E 50%, #8B5CF6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Kelajagi
            </span>
          </h2>

          <p className="text-white/45 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Bu imkoniyatlar hozir ishlab chiqilmoqda — birinchi bo'lib biling va{' '}
            <strong className="text-white/70">erta kirish imkoniyatini</strong> qo'lga kiriting.
          </p>

          {/* Vision journey pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
            {[
              { label: "📖 O'qish", color: '#E05638', now: true },
              { label: '→' },
              { label: '🔊 Tinglash', color: '#8B5CF6' },
              { label: '→' },
              { label: '🌍 Tarjima', color: '#06B6D4' },
              { label: '→' },
              { label: '🧠 Tushunish', color: '#F5C842' },
              { label: '→' },
              { label: '🥽 Kechirish', color: '#F43F5E' },
            ].map((item: any, i) => (
              item.label === '→' ? (
                <span key={i} className="text-white/20 text-base">→</span>
              ) : (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full font-bold"
                  style={{
                    background: `${item.color}${item.now ? '25' : '12'}`,
                    color: `${item.color}${item.now ? 'ff' : 'aa'}`,
                    border: `1px solid ${item.color}35`,
                  }}
                >
                  {item.label}
                  {item.now && <span className="ml-1.5 text-[9px] opacity-60">(Hozir)</span>}
                </span>
              )
            ))}
          </div>
        </div>

        {/* ── Feature Cards Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6">
          {BOOKIFY_FEATURES.map((feature, index) => (
            <FeatureCard key={feature.titleEn} feature={feature} index={index} />
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-white/20 text-xs font-mono mt-12 leading-relaxed">
          Barcha kelajak imkoniyatlar premium a'zolar uchun chegirmali erta kirish bilan taqdim etiladi
          <br />
          <span className="text-white/30 font-bold">Bookify Vision — 2026 → 2027</span>
        </p>
      </div>

      <style>{`
        @keyframes cssSpin { to { transform: rotate(360deg); } }
        @keyframes cssFloat {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-9px) rotate(1deg); }
        }
        @keyframes cssBlob {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>
    </section>
  );
}
