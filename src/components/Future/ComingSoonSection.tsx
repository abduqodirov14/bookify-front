'use client';
import React, { useState } from 'react';

const LITERARY_VISIONS = [
  {
    icon: '🌍',
    titleUz: 'Jahon Dostonlari Tarjimasi',
    titleEn: 'World Masterpieces in Uzbek',
    descUz: "Gomer, Shekspir, Tolstoy, Yasunari Kavabata va Gabriel Markes asarlarini muallifning asl badiiy uslubi va ohangini saqlagan holda sof o'zbek tilida mutolaa qilish imkoniyati.",
    badgeUz: '2027 yilda',
    badgeYear: 'Adabiy Meros',
    accentColor: '#06B6D4',
    glow: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.3)',
    bg: 'rgba(6, 182, 212, 0.06)',
    waitlistBase: 2400,
    detail: "50+ jahon adabiyoti tillari • Litsenziyalangan durdonalar",
  },
  {
    icon: '🎭',
    titleUz: 'Aktyorlik Audio-Teatri',
    titleEn: 'Cinematic Audio Drama & Voice',
    descUz: "Qahramonlar fe'l-atvori, dialoglar va ichki kechinmalarni milliy sahna aktyorligi intonatsiyasi bilan jonlantiruvchi kinematografik qiroat.",
    badgeUz: 'Tez Kunda',
    badgeYear: 'Audio Qiroat',
    accentColor: '#8B5CF6',
    glow: 'rgba(139, 92, 246, 0.12)',
    border: 'rgba(139, 92, 246, 0.3)',
    bg: 'rgba(139, 92, 246, 0.06)',
    waitlistBase: 1800,
    detail: "Jonli intonatsiya • Qahramonlar ruhiyati • Sokin fon musiqasi",
  },
  {
    icon: '📜',
    titleUz: 'Alloma Hamrohi & Tafsir',
    titleEn: 'Literary Companion & Heritage Insight',
    descUz: "Asarlardagi qadimiy iboralar, falsafiy timsollar va tarixiy voqealarni bir zumda sharhlab beruvchi ma'rifiy yo'l ko'rsatuvchi.",
    badgeUz: 'Ishlab Chiqilmoqda',
    badgeYear: "Ma'naviyat",
    accentColor: '#C5A059',
    glow: 'rgba(197, 160, 89, 0.12)',
    border: 'rgba(197, 160, 89, 0.3)',
    bg: 'rgba(197, 160, 89, 0.06)',
    waitlistBase: 3100,
    detail: "Mumtoz lug'at tahlili • Tarixiy sharhlar • Chuqur tushunish",
  },
  {
    icon: '🏛️',
    titleUz: 'Asar Olamiga Fazoviy Sayohat',
    titleEn: 'Immersive Literary Storyscape',
    descUz: "Kitobdagi muhit — Samarqand registoni, Bog'i Eram yoki Chingiz Aytmatovning Sarisari dashtlari ichiga virtual kirib borish tajribasi.",
    badgeUz: 'Kelajak Istiqboli',
    badgeYear: 'Fazoviy Mutolaa',
    accentColor: '#E05638',
    glow: 'rgba(224, 86, 56, 0.12)',
    border: 'rgba(224, 86, 56, 0.3)',
    bg: 'rgba(224, 86, 56, 0.06)',
    waitlistBase: 4200,
    detail: "3D Fazoviy Muhit • Apple Vision Pro & Meta Quest mosligi",
  },
];

function FeatureCard({ feature, index }: { feature: typeof LITERARY_VISIONS[0]; index: number }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const count = feature.waitlistBase + index * 41;

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
            ? 'shadow-2xl -translate-y-2 border-[#C5A059]'
            : 'shadow-xs translate-y-0'
        } bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10`}
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
          <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-950 dark:text-white mb-0.5 leading-snug">
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
          🔔 {count.toLocaleString()}+ kitobxon qiziqish bildirdi
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
                color: isHovered ? '#fff' : feature.accentColor,
              }}
            >
              🔔 Qiziqish Bildirish
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
          🎉 Qiziqishingiz qabul qilindi!
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C5A059]/10 text-[#C5A059] text-xs font-mono font-bold uppercase tracking-wider border border-[#C5A059]/20">
          <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
          <span>Bookify Adabiy Istiqboli</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950 dark:text-white">
          Mutolaa Madaniyatining Yangi Ufqlar
        </h2>

        <p className="text-sm text-stone-500 leading-relaxed font-serif">
          Bizning uzoq muddatli maqsadimiz — kitobni shunchaki o'qiladigan matndan inson kirib boradigan, chuqur his qiladigan va o'z tilida anglaydigan boy ma'naviy tajribaga aylantirishdir.
        </p>

        {/* Vision Journey Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono pt-2">
          {[
            { label: "📖 Mutolaa (Jonli)", color: '#E05638' },
            { label: '→' },
            { label: '🎭 Audio-Teatr', color: '#8B5CF6' },
            { label: '→' },
            { label: '🌍 Jahon Adabiyoti', color: '#06B6D4' },
            { label: '→' },
            { label: '📜 Alloma Tafsiri', color: '#C5A059' },
            { label: '→' },
            { label: '🏛️ Fazoviy Olam', color: '#E05638' },
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
        {LITERARY_VISIONS.map((feature, index) => (
          <FeatureCard key={feature.titleEn} feature={feature} index={index} />
        ))}
      </div>

    </div>
  );
}
