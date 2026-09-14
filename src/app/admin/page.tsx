import React from "react";
import { Users, Headphones, UploadCloud, TrendingUp, Activity, DollarSign } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 font-medium mt-1">Tizimning umumiy holati va statistikasi</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Jami Foydalanuvchilar", value: "1,248", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Moderatsiyadagi Audiolar", value: "34", icon: Headphones, color: "text-orange-500", bg: "bg-orange-50" },
          { label: "Jami Kitoblar", value: "156", icon: UploadCloud, color: "text-purple-500", bg: "bg-purple-50" },
          { label: "Faol O'quvchilar", value: "892", icon: Activity, color: "text-green-500", bg: "bg-green-50" },
          { label: "Haftalik O'sish", value: "+12.4%", icon: TrendingUp, color: "text-red-500", bg: "bg-red-50" },
          { label: "Kiritilgan Mablag'", value: "4.2M", icon: DollarSign, color: "text-yellow-500", bg: "bg-yellow-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
              <stat.icon size={26} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{stat.value}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Notice */}
      <div className="bg-gray-900 rounded-[28px] p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2">Yangi Admin Panelga Xush Kelibsiz!</h3>
          <p className="text-gray-400 font-medium max-w-xl">
            Eski tizimdagi barcha funksiyalar (180KB kod) yangi App Router va iOS dizayn uslubiga bosqichma-bosqich o'tkazilmoqda. 
            Hozirda Layout va Dashboard tayyor. Keyingi bosqichda Moderatsiya va Kitob yuklash qismlarini ulaymiz.
          </p>
        </div>
        <div className="relative z-10">
          <button className="px-6 py-3 bg-white text-black font-bold rounded-full shadow-lg active:scale-95 transition-transform">
            Boshlash
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      </div>

    </div>
  );
}