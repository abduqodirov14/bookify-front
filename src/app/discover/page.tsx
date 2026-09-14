"use client";

import React from "react";
import { Search, Compass, TrendingUp, Sparkles } from "lucide-react";

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-32">
      <header className="px-6 pt-12 pb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-6">Kashf etish</h1>
        
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Kitoblar, mualliflar, janrlar..." 
            className="w-full h-14 pl-12 pr-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium text-gray-900 placeholder:text-gray-400 transition-all"
          />
        </div>
      </header>

      <main className="px-6 space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-orange-500" />
            <h2 className="text-lg font-bold text-gray-900">Trenddagi qidiruvlar</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {["O'tkan Kunlar", "Psixologiya", "Biznes", "Shaxsiy rivojlanish", "Tarixiy roman"].map((tag, i) => (
              <button key={i} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:border-orange-500 hover:text-orange-500 transition-colors">
                {tag}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={20} className="text-purple-500" />
            <h2 className="text-lg font-bold text-gray-900">Tavsiya etilgan janrlar</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "Jahon adabiyoti", color: "from-blue-500 to-indigo-500" },
              { name: "O'zbek klassikasi", color: "from-orange-400 to-red-500" },
              { name: "Zamonaviy", color: "from-emerald-400 to-teal-500" },
              { name: "Ilmiy-fantastika", color: "from-purple-500 to-pink-500" }
            ].map((genre, i) => (
              <div key={i} className={`h-24 rounded-[20px] bg-gradient-to-br ${genre.color} p-4 text-white flex items-end shadow-md cursor-pointer hover:scale-95 transition-transform`}>
                <span className="font-bold text-sm">{genre.name}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}