"use client";
import React, { useState } from "react";
import { UploadCloud, FileText, Image as ImageIcon, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/services/api";

export default function UploadBookPage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !author) {
      setError("Iltimos, kitob nomi va muallifini kiriting.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("author", author);
      if (genre) formData.append("genre", genre);
      if (description) formData.append("description", description);
      
      if (coverFile) {
        formData.append("cover_file", coverFile);
      }
      if (bookFile) {
        formData.append("file", bookFile);
      }

      const res = await api.uploadBook(formData);
      setSuccess(`"${res.title}" muvaffaqiyatli yuklandi!`);
      // Reset form
      setTitle(""); setAuthor(""); setGenre(""); setDescription(""); setCoverFile(null); setBookFile(null);
    } catch (err: any) {
      setError(err.message || "Yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Kitob Yuklash</h1>
        <p className="text-gray-500 font-medium mt-1">Yangi kitobni tizimga qo'shish va nashr qilish</p>
      </header>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 border border-red-100">
          <AlertCircle size={20} /> <span className="font-bold">{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-2xl flex items-center gap-3 border border-green-100">
          <CheckCircle size={20} /> <span className="font-bold">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
        
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 text-lg">Asosiy ma'lumotlar</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Kitob nomi</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e)=>setTitle(e.target.value)} 
                  placeholder="Masalan: O'tkan Kunlar" 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Muallif</label>
                  <input 
                    type="text" 
                    value={author} 
                    onChange={(e)=>setAuthor(e.target.value)} 
                    placeholder="Abdulla Qodiriy" 
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Janr</label>
                  <input 
                    type="text" 
                    value={genre} 
                    onChange={(e)=>setGenre(e.target.value)} 
                    placeholder="Roman" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tavsif</label>
                <textarea 
                  rows={4} 
                  value={description} 
                  onChange={(e)=>setDescription(e.target.value)} 
                  placeholder="Kitob haqida qisqacha ma'lumot..." 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <label className="bg-white p-6 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-center justify-center text-center border-dashed border-2 cursor-pointer hover:bg-gray-50 transition-colors relative">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${coverFile ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'}`}>
              {coverFile ? <CheckCircle size={28} /> : <ImageIcon size={28} />}
            </div>
            <span className="font-bold text-gray-900">{coverFile ? coverFile.name : "Muqova yuklash"}</span>
            <span className="text-xs text-gray-400 mt-1">JPG, PNG (Max 2MB)</span>
          </label>

          <label className="bg-white p-6 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-center justify-center text-center border-dashed border-2 cursor-pointer hover:bg-gray-50 transition-colors relative">
            <input type="file" accept=".epub,.pdf" className="hidden" onChange={(e) => setBookFile(e.target.files?.[0] || null)} />
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${bookFile ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'}`}>
              {bookFile ? <CheckCircle size={28} /> : <FileText size={28} />}
            </div>
            <span className="font-bold text-gray-900">{bookFile ? bookFile.name : "Matn (EPUB/PDF)"}</span>
            <span className="text-xs text-gray-400 mt-1">EPUB, PDF (Max 20MB)</span>
          </label>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white py-4 rounded-[20px] font-bold shadow-lg shadow-black/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : <><UploadCloud size={20} /> Bazaga Saqlash</>}
          </button>
        </div>
      </form>
    </div>
  );
}