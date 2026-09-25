"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Film, Play, BookOpen, Clock, X, Volume2, Sparkles, ChevronRight } from "lucide-react";

export interface MovieItem {
  id: string;
  bookId: string;
  title: string;
  author: string;
  duration: string;
  poster: string;
  videoUrl: string;
  genre: string;
  synopsis: string;
}

const SAMPLE_MOVIES: MovieItem[] = [
  {
    id: "real-diffusion-movie",
    bookId: "1",
    title: "Molxona (Real AI Diffusion)",
    author: "Jorj Oruell",
    duration: "Real Generativ Video (Sora Style)",
    poster: "/images/books/ref2.png",
    videoUrl: "/uploads/movies/real_sora_style_test.mp4",
    genre: "Generativ AI Video Diffusion",
    synopsis: "RTX 5060 Ti da to'g'ridan-to'g'ri render qilingan haqiqiy video difuziya (statik rasm emas, haqiqiy harakatli kino)."
  },
  {
    id: "otkan-kunlar-movie",
    bookId: "otkan-kunlar",
    title: "O'tkan Kunlar",
    author: "Abdulla Qodiriy",
    duration: "3 daqiqa 20 soniya",
    poster: "/images/books/ref1.png",
    videoUrl: "/uploads/movies/book_otkan-kunlar_movie.mp4",
    genre: "Tarixiy Milliy Drama",
    synopsis: "XIX asr Toshkenti: Otabek va Kumushning fojiali muhabbati, milliy urf-odatlar va qadimiy davr ruhiyati."
  },
  {
    id: "jinoyat-va-jazo-movie",
    bookId: "jinoyat-va-jazo",
    title: "Jinoyat va Jazo",
    author: "Fyodor Dostoyevskiy",
    duration: "3 daqiqa 10 soniya",
    poster: "https://covers.openlibrary.org/b/isbn/9780140449136-L.jpg",
    videoUrl: "/uploads/movies/book_jinoyat-va-jazo_movie.mp4",
    genre: "Psixologik Triller",
    synopsis: "Raskolnikovning vijdon azobi, Peterburgning tumanli ko'chalari va inson ruhiyatining tubsiz qa'ri."
  }
];

export default function BookMoviesSection() {
  const [activeMovie, setActiveMovie] = useState<MovieItem | null>(null);

  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-6 px-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center">
              <Film size={18} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Kinolar & Ekranlashtirishlar
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
            Sara asarlar asosida tayyorlangan kinematik qisqa metrajli filmlar va lavhalar
          </p>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SAMPLE_MOVIES.map((movie) => (
          <div 
            key={movie.id}
            className="group relative bg-white rounded-[28px] overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
          >
            {/* Poster with Play Overlay */}
            <div className="relative aspect-[16/10] bg-black overflow-hidden">
              <img 
                src={movie.poster} 
                alt={movie.title}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>

              {/* Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white text-[10px] font-bold">
                <Film size={11} className="text-orange-400" />
                <span>Kinematik Lavha</span>
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white text-[10px] font-bold">
                <Clock size={11} />
                <span>{movie.duration}</span>
              </div>

              {/* Center Play Button */}
              <button 
                onClick={() => setActiveMovie(movie)}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white/90 text-orange-600 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-white transition-all cursor-pointer"
                title="Kinoni tomosha qilish"
              >
                <Play size={24} className="ml-1 fill-orange-600" />
              </button>

              {/* Title on Poster Bottom */}
              <div className="absolute bottom-3 left-4 right-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-400 block mb-0.5">
                  {movie.genre}
                </span>
                <h3 className="text-lg font-black text-white leading-tight">
                  {movie.title}
                </h3>
                <span className="text-xs text-gray-300 font-medium">
                  {movie.author} asari asosida
                </span>
              </div>
            </div>

            {/* Description & Action */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                {movie.synopsis}
              </p>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setActiveMovie(movie)}
                  className="text-xs font-bold text-gray-900 hover:text-orange-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play size={14} className="text-orange-500" />
                  <span>Kinoni ko'rish</span>
                </button>

                <Link
                  href={`/read/${movie.bookId}`}
                  className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-full text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <BookOpen size={13} />
                  <span>Kitobini o'qish</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal Player */}
      {activeMovie && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setActiveMovie(null)}
        >
          <div 
            className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/10 text-white bg-zinc-950">
              <div className="flex items-center gap-3">
                <Film size={20} className="text-orange-500" />
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base leading-tight">{activeMovie.title} — Qisqa Metrajli Film</h3>
                  <span className="text-xs text-gray-400">{activeMovie.author} • {activeMovie.duration}</span>
                </div>
              </div>

              <button 
                onClick={() => setActiveMovie(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Video Player */}
            <div className="aspect-video bg-black flex items-center justify-center">
              <video 
                src={activeMovie.videoUrl} 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
              />
            </div>

            {/* Modal Footer with Book CTA */}
            <div className="p-4 sm:p-5 bg-zinc-950 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-400 max-w-xl text-center sm:text-left">
                Ushbu film asar syujeti va qahramonlarining ruhiy holatini ochib beruvchi kinematik lavhadir.
              </p>

              <Link
                href={`/read/${activeMovie.bookId}`}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-[#E05638] hover:opacity-95 text-white rounded-full font-bold text-xs shadow-lg shadow-orange-500/25 flex items-center gap-2 whitespace-nowrap"
              >
                <BookOpen size={16} />
                <span>Asarni To'liq Mutolaa Qilish 📖</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
