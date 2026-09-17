"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock, Search, List, Play, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import { BOOKS } from "@/data/books";

const FlipBook = dynamic(() => import("@/components/FlipBook"), { ssr: false });

export default function ReadBookPage() {
  const params = useParams();
  const id = params.id as string;
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isZenModalOpen, setIsZenModalOpen] = useState(false);
  const [zenTime, setZenTime] = useState(30);
  const [pageNum, setPageNum] = useState(0);

  const book = BOOKS.find(b => b.id === id) || BOOKS[0];
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/Paper Slide - Sound Effect.mp3");
  }, []);

  const playFlipSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
  };

  const pages = [
    (
      <div key="1" className="p-8 sm:p-12 md:p-16 h-full relative">
        <p className="mb-4 indent-10 text-justify">
          Ayzek Azimovning yana bir qirrasi borki, bu jihat “Koinot oqimlari” fantastik romanida yaqqol ko'zga tashlanadi. U bir xalqning ikkinchi xalq ustiga bostirib kelib, uni yoppasiga qulga aylantirib ishlatib, ushbu mehnat natijasidan faqat o'zi “non va yog'”ga ega bo'lishini keskin qoralaydi. Bunday mustamlakachilik oxir-oqibatda halokatga olib kelishini, harbiy jihatdan ojizroq mamlakat aholisi ham baxtli va to'kin hayotga haqli ekanligini qayd etadi, ko'rsatadi.
        </p>
        <p className="mb-4 indent-10 text-justify">
          Yozuvchining O'zbekiston deb atalmish yurtga kelgan-kelmaganligini bilmayman, ammo u aytilgan romanda ayrim holatlarni tasvirlar ekan, yaqin o'tmishimizdagi paxta maydonlaridagi majburiy og'ir mehnat va u yerda ishlatiladigan kimyoviy dorilar tufayli elburundan qarib, yuzlari quyoshning o'tkir tig'li nurlari ostida qorayib, ajinli bo'lib qolgan, tanasi qiltiriq, umri qisqa “fidokorona mehnat qilayotgan azamat dehqon”larni ko'rgan degan ishonch uyg'onadi.
        </p>
        <p className="mb-4 indent-10 text-justify">
          Asarda faqat Florina sayyorasidagina (bu nomni inglizchadan “gullab-yashnagan o'lka” deb o'girish mumkin) o'sadigan paxtaning oliy navi “kirt” tufayli, u juda qimmatbaho, butun Galaktikada katta talabga ega ekanligi uchun kuchli harbiy qudratga ega Sark planetasi ushbu olamni bosib oladi. Va Florina aholisini yoppasiga, faqat paxta plantatsiyalarida “fidokorona mehnat qilayotgan azamat kirtkorlar”ga aylantiradi. Natijada xalqning aksar qismi g'irt omi bo'lib qolgan.
        </p>
      </div>
    ),
    (
      <div key="2" className="p-8 sm:p-12 md:p-16 h-full relative">
        <p className="mb-4 indent-10 text-justify">
          Ana shunday sharoitda, koinotda kezib yuruvchi tadqiqotchilarning biri bu sayyoraning halokatga mahkum ekanligini aniqlaydi. Bu fojia yaqin bir necha yil ichida ro'y berishi mumkin, degan xulosaga keladi. Hattoki Florinaning tez orada halokatga mahkum ekanligi ham mustabidlarni “azamat kirtkor”larni falokatli portlashdan qutqarish ishlariga undamaydi. Ularga nima bo'lsa ham faqat oliy navli paxt – kirt kerak! Kirt – ular uchun non va yog'! Huzur-halovatli hayot! O'zga yurt aholisi o'lsa o'laversin...
        </p>
        <p className="mb-4 indent-10 text-justify">
          Ayzek Azimov “Koinot oqimlari” romani orqali o'z vaqtida juda dolzarb mavzuni ko'targan, yurtimizning ojiz ijodkorlari bitolmagan hayotni tasvirlagan va real hayotdagi muammolarni aks ettirgan.
        </p>
        <p className="mb-4 indent-10 text-justify">
          Shu joyda buyuk shoirimiz Cho'lponning to'rt qator she'ri yodimga tushdi:
        </p>
        <div className="pl-16 italic text-gray-700 leading-relaxed font-medium mb-8">
          Siz deysizki, men ko'klarni o'ylayman,<br/>
          Yer betiga sira nazar solmayman?<br/>
          Yanglishasiz, men ko'klarga berkingan<br/>
          Yer qizidan xayolimni olmayman.
        </div>
      </div>
    ),
    (
      <div key="3" className="p-8 sm:p-12 md:p-16 h-full relative">
        <p className="mb-4 indent-10 text-justify">
          Ayrimlar fantastik adabiyotni yengil-yelpi janr deb faraz qiladilar. Chunki ular bu janrdagi haqiqiy namunalar bilan tanish emas. Bundaylarning qo'liga dunyoqarashi tor, katta miqyosda fikr-mulohaza qila olmaydigan havaskorlarning mashqlari tushgan bo'lsa ehtimol. Yoki ularning o'zlari bu janrni keng ko'lamda mushohada qila olmaydilar. Fantastikaning asl mohiyatini tushunolmaydilar. Holbuki, Ayzek Azimov ta'kidlaganidek: “Fantast yozuvchi, fantastik asarlar o'quvchilari va fantastika odamlar taraqqiyotiga xizmat qiladi”.
        </p>
        <p className="mb-4 indent-10 text-justify">
          Siz qo'lingizdagi kitobni mutolaa qilish orqali jahon fantastik adabiyotining eng yaxshi namunalaridan biri bilan tanishasiz. Undan ulkan ijobiy quvvat va astronomik bilim olasiz. Va, ishonamanki, bundan so'ng faqat yaxshi fantastik asarlar o'qishga kirishib ketasiz.
        </p>
      </div>
    ),
    (
      <div key="4" className="p-8 sm:p-12 md:p-16 h-full relative">
        <div className="text-right mt-10 mb-16 font-bold text-gray-800">
          <p>Xudoyberdi To'xtaboyev,</p>
          <p className="italic font-normal text-sm text-gray-600">O'zbekiston xalq yozuvchisi</p>
        </div>

        <div className="text-center mt-12">
          <h2 className="text-2xl font-extrabold mb-4 font-sans tracking-wide">Muqaddima</h2>
          <h3 className="text-xl font-bold mb-8 font-sans">Bir yil ilgari</h3>
        </div>

        <p className="mb-4 indent-10 text-justify">
          Rikoshet... Yana bir rikoshet...
        </p>
        <p className="mb-4 indent-10 text-justify">
          Yozuvchi qahramoni orqali hayot qanday ekanligini ko'rsatmoqchi bo'lgan. U orzu qilgan hayot go'zal, ammo voqelik qanchalar shafqatsiz. Bu dunyoda yashash uchun qandaydir maqsad, intilish kerak.
        </p>
      </div>
    )
  ];

  return (
    <div className="min-h-screen h-screen overflow-hidden flex flex-col font-serif bg-[#D9D9D9] relative">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Reader Area */}
      <main className="flex-1 w-full pt-24 pb-12 px-4 sm:px-12 relative z-10 flex items-center justify-center">
        
        {/* THE BOOK CONTAINER - ADDED MX-AUTO, OVERFLOW-HIDDEN, EXACT PADDING */}
        <div 
          className="relative w-full max-w-[1700px] h-[90vh] mx-auto rounded-xl shadow-[0_20px_50px_rgb(0,0,0,0.2)] bg-[#FAFAFA] text-[#111] border-[10px] sm:border-[14px] border-[#4A4A4A] overflow-hidden cursor-pointer"
          style={{ fontSize: '15px', lineHeight: '2.1' }}
        >
          {/* MIDDLE SPINE SHADOW */}
          <div className="absolute top-0 bottom-0 left-1/2 w-20 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/15 to-transparent pointer-events-none z-20"></div>
          <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-black/20 pointer-events-none z-20"></div>

          {/* FLIPBOOK WRAPPER - REMOVED FLEX CENTER TO FIX ALIGNMENT */}
          <div className="absolute inset-0 w-full h-full z-10 block">
            <FlipBook 
              pages={pages}
              onFlip={(newPageIndex: number) => {
                setPageNum(newPageIndex);
              }}
              onChangeState={(state: string) => {
                if (state === "flipping") {
                  playFlipSound();
                }
              }}
            />
          </div>

          {/* Floating Bottom Progress Badge */}
          <div className="absolute bottom-[14px] left-1/2 -translate-x-1/2 z-40 pointer-events-none">
            <div className="bg-[#4A4A4A] text-white text-[11px] font-bold font-sans px-6 py-1.5 rounded-full shadow-md tracking-wider">
              {pageNum + 5} / 156 sahifa
            </div>
          </div>

        </div>
      </main>

      {/* ZEN MUTOLAA MODAL */}
      {isZenModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer" onClick={() => setIsZenModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[32px] p-6 shadow-[0_20px_40px_rgb(0,0,0,0.2)] transform transition-all text-center z-[310]">
            <button onClick={() => setIsZenModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-300 hover:text-gray-900 transition-colors cursor-pointer">
              <X size={16} />
            </button>
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-100"><Clock size={32} strokeWidth={2} /></div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Zen Mutolaa</h3>
            <p className="text-sm font-medium text-gray-500 mb-8 px-4 leading-relaxed">Ijtimoiy tarmoqlar va chalg'ituvchi narsalardan uzoqlashib, diqqatni faqat kitobga qarating.</p>
            <div className="grid grid-cols-4 gap-2 mb-8">
              {[15, 30, 45, 60].map((mins) => (
                <button key={mins} onClick={() => setZenTime(mins)} className={`py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer hover:scale-105 active:scale-95 ${zenTime === mins ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{mins}</button>
              ))}
            </div>
            <button onClick={() => setIsZenModalOpen(false)} className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-[20px] shadow-xl shadow-black/20 transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
              <Play size={20} fill="currentColor" /> {zenTime} daqiqaga boshlash
            </button>
          </div>
        </div>
      )}

    </div>
  );
}