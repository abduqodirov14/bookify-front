'use client';
import React, { useState } from 'react';
import { Globe, Headphones, BookOpen, Compass, Bell, Check } from 'lucide-react';

const REJALAR = [
  {
    icon: Globe,
    title: "Jahon Adabiyoti Tarjimalari",
    desc: "Shekspir, Remark, Tolstoy, Gyote va boshqa mashhur jahon adiblarining nodir asarlarini o'zbek tilidagi sara tarjimalarda jamlash.",
    badge: "Yaqin Oylarda",
    accentColor: "#0284C7",
    bg: "rgba(2, 132, 199, 0.08)",
    border: "rgba(2, 132, 199, 0.25)",
    points: ["O'zbekcha tarjimalar", "Klassik asarlar", "Asl muallif uslubi"]
  },
  {
    icon: Headphones,
    title: "Aktyorlik Audio Spektakllari",
    desc: "Asarlardagi voqealar, qahramonlar fe'l-atvori va ichki kechinmalarini mahoratli teatr aktyorlari ovozida, sokin musiqalar bilan eshitish.",
    badge: "Yozib olinmoqda",
    accentColor: "#7C3AED",
    bg: "rgba(124, 58, 237, 0.08)",
    border: "rgba(124, 58, 237, 0.25)",
    points: ["Professional suxandonlar", "Sokin fon musiqasi", "Fonda tinglash"]
  },
  {
    icon: BookOpen,
    title: "Qadimiy So'zlar va Lug'at Sharhi",
    desc: "Tarixiy va mumtoz asarlarda uchraydigan eskirgan so'zlar, iboralar hamda tarixiy voqealarni matn ustiga bosib bir zumda tushunib olish.",
    badge: "Tayyorlanmoqda",
    accentColor: "#C5A059",
    bg: "rgba(197, 160, 89, 0.08)",
    border: "rgba(197, 160, 89, 0.25)",
    points: ["Interaktiv lug'at", "Tarixiy izohlar", "Matn ichida tushuntirish"]
  },
  {
    icon: Compass,
    title: "Tarixiy Asarlar Bo'yicha 3D Xaritalar",
    desc: "Kitoblardagi qadamjolar — Samarqand, Toshkent, Buxoro yoki Marg'ilonda sodir bo'lgan voqealarni interaktiv 3D makonda ko'rish.",
    badge: "Rejada",
    accentColor: "#E05638",
    bg: "rgba(224, 86, 56, 0.08)",
    border: "rgba(224, 86, 56, 0.25)",
    points: ["3D xarita", "Tarixiy manzillar", "Interaktiv marshrut"]
  }
];

export default function ComingSoonSection() {
  const [subscribed, setSubscribed] = useState<{ [key: number]: boolean }>({});

  const toggleSubscribe = (idx: number) => {
    setSubscribed(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-2 sm:py-6 px-2 sm:px-4">
      
      {/* Human-written, clean editorial header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 dark:text-white tracking-tight">
          Rejadagi Yangi Imkoniyatlar
        </h2>

        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed font-sans">
          Kitobxonlikni yanada qulay va maroqli qilish maqsadida platformamizga bosqichma-bosqich qo'shilishi rejalashtirilgan yangi xususiyatlar.
        </p>
      </div>

      {/* Responsive 2-Column Grid (avoids horizontal squishing) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REJALAR.map((item, idx) => {
          const Icon = item.icon;
          const isDone = !!subscribed[idx];

          return (
            <div
              key={idx}
              className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-4">
                {/* Header row: Icon & Status Badge */}
                <div className="flex items-center justify-between gap-3">
                  <div 
                    className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ background: item.bg, color: item.accentColor }}
                  >
                    <Icon size={22} />
                  </div>

                  <span 
                    className="text-[11px] font-mono font-semibold px-3 py-1 rounded-full border"
                    style={{ background: item.bg, color: item.accentColor, borderColor: item.border }}
                  >
                    {item.badge}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-1.5">
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-white group-hover:text-[#E05638] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* Highlights Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.points.map((p, pIdx) => (
                    <span 
                      key={pIdx}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-white/5 text-[11px] font-sans text-stone-600 dark:text-stone-300 border border-stone-200/60 dark:border-white/5"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-stone-100 dark:border-white/5">
                <button
                  onClick={() => toggleSubscribe(idx)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-stone-50 hover:bg-stone-100 dark:bg-white/5 dark:hover:bg-white/10 text-stone-700 dark:text-stone-200 border border-stone-200/80 dark:border-white/10'
                  }`}
                >
                  {isDone ? (
                    <>
                      <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
                      <span>Xabardor qilinadi</span>
                    </>
                  ) : (
                    <>
                      <Bell size={14} style={{ color: item.accentColor }} />
                      <span>Yangiliklardan xabardor bo'lish</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
