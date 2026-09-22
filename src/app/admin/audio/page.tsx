"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Play, Pause, Trash2, Headphones, Clock, RefreshCw, 
  Upload, Music, AlertCircle, CheckCircle2, Loader2, BookOpen, ExternalLink 
} from "lucide-react";
import { api, resolveAudioUrl } from "@/services/api";

export default function AudioModerationPage() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Playing state
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Upload modal
  const [books, setBooks] = useState<any[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [trackTitle, setTrackTitle] = useState("");
  const [trackNumber, setTrackNumber] = useState<number | "">("");
  const [narrator, setNarrator] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadTracks = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getAdminAudioTracks();
      setTracks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Audio treklarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const loadBooks = async () => {
    try {
      const bList = await api.getBooks(true);
      setBooks(Array.isArray(bList) ? bList : []);
      if (bList.length > 0 && !selectedBookId) {
        setSelectedBookId(bList[0].id);
      }
    } catch {}
  };

  useEffect(() => {
    loadTracks();
    loadBooks();
  }, []);

  const togglePlay = (track: any) => {
    if (playingTrackId === track.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingTrackId(null);
    } else {
      setPlayingTrackId(track.id);
      if (audioRef.current) {
        audioRef.current.src = resolveAudioUrl(track.audio_url || track.audioUrl);
        audioRef.current.play().catch(e => console.warn("Playback failed:", e));
      }
    }
  };

  const handleDeleteTrack = async (track: any) => {
    if (!window.confirm(`Haqiqatan ham "${track.title}" trekini o'chirmoqchimisiz?`)) return;
    try {
      await api.deleteAdminAudioTrack(track.book_id || track.bookId, track.id);
      if (playingTrackId === track.id) {
        if (audioRef.current) audioRef.current.pause();
        setPlayingTrackId(null);
      }
      setSuccess(`"${track.title}" muvaffaqiyatli o'chirildi.`);
      loadTracks();
    } catch (err: any) {
      setError(err.message || "Trekni o'chirishda xatolik");
    }
  };

  const handleUploadTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId) {
      setError("Iltimos, kitobni tanlang");
      return;
    }
    if (!audioFile) {
      setError("Iltimos, audio faylni tanlang");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", audioFile);
      if (trackTitle) formData.append("title", trackTitle.trim());
      if (trackNumber) formData.append("track_number", String(trackNumber));
      if (narrator) formData.append("narrator", narrator.trim());

      const token = localStorage.getItem("fianny_token") || localStorage.getItem("bookify_token");
      const res = await fetch(`https://3-68-191-39.sslip.io/api/v1/admin/books/${selectedBookId}/audio-tracks/upload`, {
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Audio faylni yuklashda xatolik");
      }

      setSuccess(`"${trackTitle || audioFile.name}" muvaffaqiyatli yuklandi!`);
      setIsUploadModalOpen(false);
      setAudioFile(null);
      setTrackTitle("");
      setTrackNumber("");
      loadTracks();
    } catch (err: any) {
      setError(err.message || "Yuklashda xatolik");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* Hidden Audio Player Element */}
      <audio 
        ref={audioRef} 
        onEnded={() => setPlayingTrackId(null)} 
        onError={() => setPlayingTrackId(null)}
      />

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Audio Moderatsiya & Boshqaruv</h1>
          <p className="text-gray-500 font-medium mt-1">Platformadagi barcha audio kitoblar, boblar va ovozli yozuvlar nazorati</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#E05638] hover:bg-[#D04C2E] text-white rounded-2xl text-xs font-bold shadow-md shadow-[#E05638]/20 transition-all cursor-pointer"
          >
            <Upload size={14} />
            <span>Audio Trek Qo'shish</span>
          </button>

          <button 
            onClick={loadTracks}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Yangilash</span>
          </button>
        </div>
      </header>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-sm">
          <AlertCircle size={20} className="shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-sm animate-fade-in">
          <CheckCircle2 size={20} className="shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Track List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 size={36} className="animate-spin text-[#E05638]" />
          <p className="text-sm font-medium text-gray-400">Audio treklar yuklanmoqda...</p>
        </div>
      ) : tracks.length === 0 ? (
        <div className="bg-white rounded-[32px] p-12 text-center border border-gray-100 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#E05638] flex items-center justify-center mx-auto">
            <Music size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Hozircha audio treklar mavjud emas</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Platformaga kitoblar uchun audio yozuvlar yuklanganda, ular shu yerda real vaqtda ko'rinadi va tekshirish uchun tinglash mumkin bo'ladi.
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#E05638] text-white rounded-2xl text-xs font-bold shadow-md shadow-[#E05638]/20 hover:opacity-90 transition-all cursor-pointer"
          >
            <Upload size={14} />
            <span>Ilk Audio Trekni Yuklash</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {tracks.map((track) => {
            const isThisPlaying = playingTrackId === track.id;
            return (
              <div 
                key={track.id} 
                className="bg-white p-5 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:border-gray-200"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <button 
                    onClick={() => togglePlay(track)}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      isThisPlaying 
                        ? "bg-[#E05638] text-white shadow-lg shadow-[#E05638]/30 scale-105" 
                        : "bg-orange-50 text-[#E05638] hover:bg-orange-100"
                    }`}
                  >
                    {isThisPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-base truncate">
                        {track.title || "Nomsiz trek"}
                      </h3>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[11px] font-bold">
                        {track.track_number ? `${track.track_number}-trek` : "Asosiy"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-medium text-gray-500 mt-1 flex-wrap">
                      <span className="font-bold text-gray-700 flex items-center gap-1">
                        <BookOpen size={13} className="text-[#E05638]" />
                        {track.book_title || "Kitob"}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="flex items-center gap-1">
                        <Headphones size={13} />
                        {track.narrator || "Notiq"}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        {track.created_at || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-0 border-gray-50 pt-4 md:pt-0 shrink-0">
                  <Link
                    href={`/book/${track.book_id || track.bookId}`}
                    target="_blank"
                    className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    <ExternalLink size={14} />
                    <span>Kitob</span>
                  </Link>

                  <button 
                    onClick={() => handleDeleteTrack(track)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>O'chirish</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[32px] max-w-lg w-full p-8 shadow-2xl space-y-6 animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Yangi Audio Trek Yuklash</h3>
                <p className="text-xs text-gray-400">Kitob uchun yangi audio bob yoki to'liq audio faylni qo'shish</p>
              </div>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadTrack} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Kitobni tanlang *
                </label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3.5 text-sm font-semibold text-gray-900 outline-none focus:bg-white focus:border-[#E05638]"
                >
                  {books.length === 0 ? (
                    <option value="">Kitoblar mavjud emas</option>
                  ) : (
                    books.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} ({b.author || "Muallif"})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Trek Nomi / Bob
                  </label>
                  <input
                    type="text"
                    placeholder="Masalan: 1-bob: Kirish"
                    value={trackTitle}
                    onChange={(e) => setTrackTitle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3.5 text-sm font-semibold text-gray-900 outline-none focus:bg-white focus:border-[#E05638]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Trek Raqami
                  </label>
                  <input
                    type="number"
                    placeholder="1, 2, 3..."
                    value={trackNumber}
                    onChange={(e) => setTrackNumber(e.target.value ? Number(e.target.value) : "")}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3.5 text-sm font-semibold text-gray-900 outline-none focus:bg-white focus:border-[#E05638]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Ovoz beruvchi (Notiq)
                </label>
                <input
                  type="text"
                  placeholder="Masalan: Afzal Rafiqov yoki O'zingiz"
                  value={narrator}
                  onChange={(e) => setNarrator(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3.5 text-sm font-semibold text-gray-900 outline-none focus:bg-white focus:border-[#E05638]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Audio Fayl *
                </label>
                <input
                  type="file"
                  required
                  accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg,.opus"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setAudioFile(e.target.files[0]);
                      if (!trackTitle) {
                        setTrackTitle(e.target.files[0].name.replace(/\.[a-zA-Z0-9]+$/, ''));
                      }
                    }
                  }}
                  className="w-full text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-[#E05638] hover:file:bg-orange-100 cursor-pointer"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-5 py-3 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={uploading || !audioFile || !selectedBookId}
                  className="flex items-center gap-2 px-6 py-3 bg-[#E05638] hover:bg-[#D04C2E] text-white rounded-2xl text-xs font-bold shadow-md shadow-[#E05638]/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Yuklanmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Yuklash & Saqlash</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}