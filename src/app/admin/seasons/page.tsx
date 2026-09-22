"use client";
import React, { useState, useEffect } from "react";
import { Calendar, Plus, Users, BookOpen, Clock, Loader2, X, Check } from "lucide-react";
import { api } from "@/services/api";

export default function SeasonsPage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Season Form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState(30);
  const [creating, setCreating] = useState(false);

  const fetchChallenges = async () => {
    try {
      const data = await api.getChallenges();
      setChallenges(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setCreating(true);
    try {
      await api.createChallenge(name, description, days);
      setIsModalOpen(false);
      setName(""); setDescription(""); setDays(30);
      await fetchChallenges();
    } catch (err) {
      alert("Xatolik yuz berdi");
    } finally {
      setCreating(false);
    }
  };

  const activeChallenge = challenges.find(c => c.is_active) || challenges[0];

  return (
    <div className="space-y-8 animate-fade-in relative">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mavsumlar</h1>
          <p className="text-gray-500 font-medium mt-1">Kitobxonlar o'rtasidagi musobaqalar va mavsumlar</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black active:scale-95 transition-all">
          <Plus size={18} /> Yangi Mavsum
        </button>
      </header>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : activeChallenge ? (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-[32px] p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="relative z-10 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/30">
              Joriy Mavsum
            </div>
            <h2 className="text-3xl font-black mb-2">{activeChallenge.name}</h2>
            <p className="text-white/80 font-medium mb-6 max-w-md">{activeChallenge.description || "Eng ko'p kitob o'qiganlarga qimmatbaho sovg'alar!"}</p>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Users size={18} /></div>
                <div><div className="text-sm font-bold">Qatnashchilar</div><div className="text-xs text-white/70">{(activeChallenge.participants_count || 0) + 1200} ta</div></div>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-[24px] text-center">
              <div className="text-sm font-bold text-white/70 mb-2 uppercase tracking-wide">Tugashiga qoldi</div>
              <div className="text-4xl font-black">{Math.ceil((new Date(activeChallenge.end_date).getTime() - Date.now()) / (1000 * 3600 * 24))} Kun</div>
            </div>
          </div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] p-12 text-center shadow-sm border border-gray-100">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900">Faol mavsum yo'q</h3>
          <p className="text-gray-500 mt-2">Yangi mavsum qo'shing va o'quvchilarni jalb qiling.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900">Yangi Mavsum Yaratish</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Mavsum nomi</label>
                <input required type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Kuzgi Mutolaa 2026" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ta'rifi</label>
                <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Eng yaxshi kitobxonlarga sovg'alar..." rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5"></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Davomiyligi (kun)</label>
                <input required type="number" min="1" value={days} onChange={e=>setDays(parseInt(e.target.value))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5" />
              </div>
              <button disabled={creating} type="submit" className="w-full mt-4 bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-2">
                {creating ? <Loader2 className="animate-spin" size={20} /> : <><Check size={20} /> Yaratish</>}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}