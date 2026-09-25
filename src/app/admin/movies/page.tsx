"use client";

import React, { useState, useEffect } from "react";
import { 
  Film, Sparkles, Play, RefreshCw, CheckCircle2, AlertCircle, 
  Layers, Clock, Volume2, MonitorPlay, ChevronRight, Wand2, ArrowLeft, Loader2
} from "lucide-react";
import { api, resolveFileUrl } from "@/services/api";

const AI_STUDIO_API = "http://127.0.0.1:8008";

export default function AdminMoviesPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [styleGenre, setStyleGenre] = useState("Tarixiy Drama");
  const [targetScenes, setTargetScenes] = useState(4);
  const [voiceType, setVoiceType] = useState("uz-UZ-SardorNeural");
  
  // Generation & Status state
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [renderedFilmUrl, setRenderedFilmUrl] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    api.getBooks().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setBooks(data);
        setSelectedBook(data[0]);
      }
    }).catch(err => {
      console.error("Kitoblarni yuklashda xatolik:", err);
    });
  }, []);

  const handleStartGeneration = async () => {
    if (!selectedBook) return;
    setIsGenerating(true);
    setErrorMsg(null);
    setPublishSuccess(false);
    setRenderedFilmUrl(null);

    const payload = {
      book_id: String(selectedBook.id),
      book_title: selectedBook.title,
      author: selectedBook.author || selectedBook.authorName || "Muallif noma'lum",
      text: selectedBook.description || `${selectedBook.title} — o'zbek va jahon adabiyotining durdona asarlaridan biri bo'lib, chuqur ma'no va hayotiy falsafaga ega.`,
      cover_image_path: selectedBook.cover_image || null,
      target_scenes: targetScenes
    };

    try {
      const res = await fetch(`${AI_STUDIO_API}/api/movies/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Lokal AI Studio serveriga bog'lanishda xatolik yuz berdi. Iltimos, D: diskdagi server ishga tushganini tekshiring.");
      }

      const data = await res.json();
      const jobId = data.job_id;

      // Poll progress every 2 seconds
      const interval = setInterval(async () => {
        try {
          const statusRes = await fetch(`${AI_STUDIO_API}/api/movies/jobs/${jobId}`);
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            setJobStatus(statusData);

            if (statusData.status === "completed") {
              clearInterval(interval);
              setIsGenerating(false);
              const filename = statusData.output_file.split(/[\\/]/).pop();
              setRenderedFilmUrl(`${AI_STUDIO_API}/api/movies/stream/${filename}`);
            } else if (statusData.status === "failed") {
              clearInterval(interval);
              setIsGenerating(false);
              setErrorMsg(statusData.error || "Generatsiya jarayonida xatolik yuz berdi.");
            }
          }
        } catch (e) {
          // Keep polling
        }
      }, 2000);

    } catch (err: any) {
      setIsGenerating(false);
      setErrorMsg(err.message || "Lokal AI serveriga ulanib bo'lmadi (127.0.0.1:8008).");
    }
  };

  const handlePublishToSite = async () => {
    if (!selectedBook || !jobStatus?.output_file) return;

    try {
      const res = await fetch(`${AI_STUDIO_API}/api/movies/publish?book_id=${selectedBook.id}&film_path=${encodeURIComponent(jobStatus.output_file)}`, {
        method: "POST"
      });

      if (res.ok) {
        setPublishSuccess(true);
      } else {
        alert("Saytga chop etishda xatolik yuz berdi.");
      }
    } catch (e) {
      alert("Chop etishda server xatosi.");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Film size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">AI Kino Studiyasi</h1>
              <p className="text-xs text-gray-500 font-semibold">Kitoblar asosida avtomatik qisqa metrajli film va treylerlar yaratish (RTX 16GB)</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            RTX 5060 Ti • D: Disk Faol
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <strong>Xatolik:</strong> {errorMsg}
            <p className="text-xs text-red-500 mt-1">Lokal serverni ishga tushirish uchun: <code>python D:\my start Up\bookify\ai_studio\server.py</code></p>
          </div>
        </div>
      )}

      {/* Main Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Parameters (5 Columns) */}
        <div className="lg:col-span-5 bg-white rounded-[32px] p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-6">
          <h2 className="text-lg font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Wand2 size={18} className="text-orange-500" />
            1. Kino Parametrlari
          </h2>

          {/* Book Select */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Asarni Tanlang</label>
            <select 
              value={selectedBook?.id || ""} 
              onChange={(e) => {
                const b = books.find(item => String(item.id) === e.target.value);
                setSelectedBook(b);
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} ({b.author || "Muallif noma'lum"})
                </option>
              ))}
            </select>
          </div>

          {/* Genre Style */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Vizual Kinematik Uslub</label>
            <div className="grid grid-cols-2 gap-2">
              {["Tarixiy Drama", "Psixologik Noir", "Gollivud Epik", "Klassik Realizm"].map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setStyleGenre(style)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border ${
                    styleGenre === style 
                      ? 'bg-black text-white border-black shadow-xs' 
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Scene Count / Duration */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-gray-700 uppercase tracking-wider">Sahnalar Soni & Davomiylik</span>
              <span className="text-orange-600">{targetScenes} ta sahna (~{targetScenes * 6} soniya)</span>
            </div>
            <input 
              type="range" 
              min="3" 
              max="8" 
              step="1"
              value={targetScenes} 
              onChange={(e) => setTargetScenes(Number(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
              <span>3 ta (Qisqa tizer)</span>
              <span>5 ta (Standart treyler)</span>
              <span>8 ta (Katta lavha)</span>
            </div>
          </div>

          {/* Voice Narration */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Diktor Ovozi</label>
            <select 
              value={voiceType} 
              onChange={(e) => setVoiceType(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="uz-UZ-SardorNeural">Sardor (O'zbekcha Erkak ovoz - Salmoqli, Kinematik)</option>
              <option value="uz-UZ-MadinaNeural">Madina (O'zbekcha Ayol ovoz - Mayin, Adabiy)</option>
            </select>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleStartGeneration}
            disabled={isGenerating}
            className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all active:scale-95 cursor-pointer ${
              isGenerating 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-orange-500 to-[#E05638] text-white shadow-orange-500/30 hover:opacity-95'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Generatsiya Qilinmoqda...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>AI Kinoni Generatsiya Qilish</span>
              </>
            )}
          </button>
        </div>

        {/* Right Preview Player (7 Columns) */}
        <div className="lg:col-span-7 bg-white rounded-[32px] p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <MonitorPlay size={20} className="text-orange-500" />
              2. Film Prevyusi & Natija
            </h2>
            {jobStatus && (
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                {jobStatus.percent}% • {jobStatus.stage}
              </span>
            )}
          </div>

          {/* Progress Bar when generating */}
          {isGenerating && (
            <div className="space-y-2 p-4 bg-orange-50/60 rounded-2xl border border-orange-100">
              <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                <span>{jobStatus?.stage || "Tayyorlanmoqda..."}</span>
                <span className="text-orange-600">{jobStatus?.percent || 10}%</span>
              </div>
              <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-orange-100">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all duration-500"
                  style={{ width: `${jobStatus?.percent || 10}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">
                RTX 5060 Ti videokartangizda kadrlar va ovozlar render qilinmoqda...
              </p>
            </div>
          )}

          {/* Video Player or Empty Screen */}
          <div className="relative aspect-video rounded-2xl bg-black overflow-hidden flex items-center justify-center border border-gray-800 shadow-2xl">
            {renderedFilmUrl ? (
              <video 
                src={renderedFilmUrl} 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-8 space-y-3">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white/40 mx-auto">
                  <Play size={28} className="ml-1" />
                </div>
                <h3 className="text-white font-bold text-base">Hozircha video generatsiya qilinmagan</h3>
                <p className="text-gray-400 text-xs max-w-sm mx-auto">
                  Chap tomondan kitobni tanlab, «AI Kinoni Generatsiya Qilish» tugmasini bosing.
                </p>
              </div>
            )}
          </div>

          {/* Action Row once ready */}
          {renderedFilmUrl && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 px-3.5 py-2 rounded-xl border border-green-200">
                <CheckCircle2 size={16} />
                <span>Film muvaffaqiyatli render qilindi (D:\ diskda)</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handlePublishToSite}
                  disabled={publishSuccess}
                  className={`flex-1 sm:flex-none px-6 py-3 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    publishSuccess 
                      ? 'bg-green-600 text-white shadow-md' 
                      : 'bg-black hover:bg-gray-800 text-white shadow-md'
                  }`}
                >
                  {publishSuccess ? (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Saytga Joylandi! ✓</span>
                    </>
                  ) : (
                    <>
                      <Film size={16} />
                      <span>Saytda Chop Etish</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
