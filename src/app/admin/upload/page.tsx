"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  UploadCloud, FileText, Image as ImageIcon, CheckCircle2, 
  Loader2, AlertCircle, BookOpen, ExternalLink, Trash2, Sparkles, RefreshCw
} from "lucide-react";
import { api, resolveFileUrl } from "@/services/api";

export default function UploadBookPage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("Badiiy Adabiyot");
  const [description, setDescription] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState(0);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Live books list
  const [publishedBooks, setPublishedBooks] = useState<any[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  const loadBooks = () => {
    setLoadingBooks(true);
    api.getBooks(true)
      .then((data) => {
        if (Array.isArray(data)) {
          setPublishedBooks(data);
        }
      })
      .catch((err) => console.warn("Could not load books:", err))
      .finally(() => setLoadingBooks(false));
  };

  const handleDeleteBook = async (id: string, title: string) => {
    if (!window.confirm(`Haqiqatan ham "${title}" asarini bazadan o'chirmoqchimisiz?`)) return;
    try {
      await api.deleteBook(id);
      setSuccess(`"${title}" muvaffaqiyatli o'chirildi.`);
      loadBooks();
    } catch (err: any) {
      setError(err.message || "Kitobni o'chirishda xatolik");
    }
  };

  const handleClearAllBooks = async () => {
    if (!window.confirm("DIQQAT! Bazadagi BARCHA kitoblar, boblar, sahifalar va audio treklar o'chiriladi va baza 0 holatiga keltiriladi. Rozimisiz?")) return;
    try {
      await api.clearAllBooks();
      setSuccess("Barcha kitoblar bazadan to'liq o'chirildi (baza 0 qilindi).");
      loadBooks();
    } catch (err: any) {
      setError(err.message || "Bazani tozalashda xatolik");
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleBookFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBookFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim() || !author.trim()) {
      setError("Iltimos, kitob nomi va muallifini to'liq kiriting.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("author", author.trim());
      formData.append("category", category);
      formData.append("description", description.trim());
      formData.append("is_premium", isPremium ? "true" : "false");
      formData.append("price", String(price));

      // Cover image
      if (coverFile) {
        formData.append("cover", coverFile);
      }

      // Book file (e.g. EPUB, PDF, TXT)
      if (bookFile) {
        formData.append("file", bookFile);
      } else {
        // Create an automatic digital placeholder text file so backend never fails with 422
        const defaultContent = `1-Bob: ${title.trim()}\n\nMuallif: ${author.trim()}\n\n${description.trim() || "Ushbu asar muvaffaqiyatli chop etildi va Bookify tizimida ro'yxatdan o'tdi."}`;
        const autoFile = new File([defaultContent], `${title.replace(/\s+/g, '_')}.txt`, { type: "text/plain" });
        formData.append("file", autoFile);
      }

      const res = await api.uploadBook(formData);
      setSuccess(`🎉 "${res.title || title}" muvaffaqiyatli yuklandi va bazada saqlandi!`);

      // Reset form
      setTitle("");
      setAuthor("");
      setDescription("");
      setCoverFile(null);
      setBookFile(null);
      setCoverPreview(null);
      setIsPremium(false);
      setPrice(0);

      // Refresh published books list
      loadBooks();
    } catch (err: any) {
      setError(err.message || "Kitobni serverga yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Kitob Yuklash & Chop Etish</h1>
          <p className="text-gray-500 font-medium mt-1">Yangi kitobni serverga yuklash, bazaga yozish va nashr qilish</p>
        </div>
        <button 
          onClick={loadBooks}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm"
        >
          <RefreshCw size={14} className={loadingBooks ? "animate-spin" : ""} />
          <span>Yangilash</span>
        </button>
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

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Kitob Nomi *
            </label>
            <input 
              type="text" 
              required
              placeholder="Masalan: O'tkan Kunlar" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 font-medium placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Muallif *
            </label>
            <input 
              type="text" 
              required
              placeholder="Masalan: Abdulla Qodiriy" 
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 font-medium placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Kategoriya / Janr
            </label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            >
              <option value="Badiiy Adabiyot">Badiiy Adabiyot</option>
              <option value="Tarixiy Asarlar">Tarixiy Asarlar</option>
              <option value="Psixologiya & Rivojlanish">Psixologiya & Rivojlanish</option>
              <option value="Biznes & Moliya">Biznes & Moliya</option>
              <option value="Diniy-Ma'rifiy">Diniy-Ma'rifiy</option>
              <option value="Bolalar Adabiyoti">Bolalar Adabiyoti</option>
            </select>
          </div>

          <div className="flex items-center gap-6 pt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className="w-5 h-5 rounded-lg text-orange-500 focus:ring-orange-500/20"
              />
              <span className="text-sm font-bold text-gray-800">💎 VIP Premium Asar</span>
            </label>

            {isPremium && (
              <div className="flex-1">
                <input 
                  type="number"
                  placeholder="Narxi (so'm)"
                  value={price || ""}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-sm font-bold text-gray-900"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Asar Tavsifi (Qisqacha mazmuni)
          </label>
          <textarea 
            rows={3}
            placeholder="Asar haqida qisqacha ma'lumot kiriting..." 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 font-medium placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none"
          />
        </div>

        {/* File Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Cover Image */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Kitob Muqovasi (Rasm)
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-2xl p-6 cursor-pointer bg-gray-50 hover:bg-gray-100/50 transition-all">
              {coverPreview ? (
                <div className="flex items-center gap-4 w-full">
                  <img src={coverPreview} className="w-16 h-20 object-cover rounded-xl shadow-sm" />
                  <div className="flex-1 truncate">
                    <p className="text-xs font-bold text-gray-900 truncate">{coverFile?.name}</p>
                    <p className="text-[11px] text-gray-400">O'zgartirish uchun bosing</p>
                  </div>
                </div>
              ) : (
                <>
                  <ImageIcon size={32} className="text-gray-400 mb-2" />
                  <span className="text-xs font-bold text-gray-700">Muqova rasmini yuklash</span>
                  <span className="text-[10px] text-gray-400 mt-1">PNG, JPG, WEBP (tavsiya 2:3)</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
            </label>
          </div>

          {/* Book File (EPUB, PDF, DOCX, TXT) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Kitob Matn Fayli (Fayl ixtiyoriy)
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-2xl p-6 cursor-pointer bg-gray-50 hover:bg-gray-100/50 transition-all">
              {bookFile ? (
                <div className="flex items-center gap-3 w-full">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-xs font-bold text-gray-900 truncate">{bookFile.name}</p>
                    <p className="text-[11px] text-gray-400">{(bookFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ) : (
                <>
                  <FileText size={32} className="text-gray-400 mb-2" />
                  <span className="text-xs font-bold text-gray-700">Kitob faylini tanlang</span>
                  <span className="text-[10px] text-gray-400 mt-1">EPUB, PDF, DOCX, TXT, FB2</span>
                </>
              )}
              <input type="file" accept=".epub,.pdf,.docx,.txt,.fb2" onChange={handleBookFileChange} className="hidden" />
            </label>
          </div>

        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gray-900 hover:bg-black text-white font-bold text-base py-4 rounded-2xl shadow-xl shadow-black/10 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Serverga yuklanmoqda va saqlanmoqda...</span>
            </>
          ) : (
            <>
              <UploadCloud size={20} />
              <span>Chop Etish & Bazaga Saqlash</span>
            </>
          )}
        </button>
      </form>

      {/* --- PUBLISHED BOOKS (REAL DATABASE LIST) --- */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Yuklangan va Chop Etilgan Asarlar</h2>
            <p className="text-xs font-medium text-gray-400">AWS PostgreSQL bazasidagi jami kitoblar: {publishedBooks.length} ta</p>
          </div>
          <div className="flex items-center gap-3">
            {publishedBooks.length > 0 && (
              <button
                onClick={handleClearAllBooks}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold border border-red-200 transition-colors"
              >
                <Trash2 size={13} />
                <span>Bazani 0 qilish</span>
              </button>
            )}
            <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
              Jonli Baza
            </span>
          </div>
        </div>

        {loadingBooks ? (
          <div className="py-12 flex justify-center items-center">
            <Loader2 size={32} className="animate-spin text-orange-500" />
          </div>
        ) : publishedBooks.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">Hali hech qanday kitob yuklanmagan. Baza toza (0 ta kitob).</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {publishedBooks.map((b, idx) => (
              <div key={b.id || idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 p-3 rounded-2xl transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-100 shadow-sm shrink-0">
                    <img 
                      src={resolveFileUrl(b.cover_image) || "/images/books/ref2.png"} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 text-sm truncate">{b.title}</h4>
                      {b.is_premium && (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-md shrink-0">
                          💎 VIP
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 font-medium truncate mt-0.5">{b.author || "Muallif"}</p>
                    <span className="text-[10px] text-gray-400">ID: {b.id?.slice(0, 8)}...</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link 
                    href={`/read/${b.id}`}
                    target="_blank"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 rounded-xl text-xs font-bold text-orange-600 transition-colors"
                  >
                    <BookOpen size={14} />
                    <span>Mutolaa</span>
                  </Link>

                  <Link 
                    href={`/book/${b.id}`}
                    target="_blank"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors"
                  >
                    <ExternalLink size={14} />
                    <span>Tafsilot</span>
                  </Link>

                  <button 
                    onClick={() => handleDeleteBook(b.id, b.title)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Trash2 size={14} />
                    <span>O'chirish</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}