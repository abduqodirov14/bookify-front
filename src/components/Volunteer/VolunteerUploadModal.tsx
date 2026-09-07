"use client";

import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  ShieldCheck, 
  Info,
  BookOpen
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../services/api';
import { BOOK_CATEGORIES } from '../../data/categories';
import { UserProfile } from '../../types';

interface Props {
  currentUser: UserProfile | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VolunteerUploadModal({ currentUser, onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Badiiy adabiyot');
  const [description, setDescription] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect title & author from file name
  const handleFileSelect = (selectedFile: File) => {
    const validExtensions = ['.pdf', '.epub', '.docx', '.txt', '.fb2'];
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(ext)) {
      toast.error(`Faqat quyidagi formatlar qabul qilinadi: ${validExtensions.join(', ')}`);
      return;
    }

    setFile(selectedFile);

    // Auto extract title & author from filename if fields are empty
    let baseName = selectedFile.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' ').trim();
    if (!title) {
      if (baseName.includes(' - ')) {
        const parts = baseName.split(' - ');
        if (!author) setAuthor(parts[0].trim());
        setTitle(parts[1].trim());
      } else {
        setTitle(baseName);
      }
    }
  };

  const handleCoverSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      toast.error("Iltimos, rasm formatidagi fayl tanlang (JPG, PNG, WEBP)");
      return;
    }
    setCoverFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Iltimos, kitob faylini tanlang!");
      return;
    }
    if (!title.trim()) {
      toast.error("Asar nomini kiriting!");
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (coverFile) {
        formData.append('cover', coverFile);
      }
      formData.append('title', title.trim());
      formData.append('author', author.trim() || "O'zbek Adabiyoti");
      formData.append('category', category);
      if (description.trim()) {
        formData.append('description', description.trim());
      }

      // Progress animation
      const progressTimer = setInterval(() => {
        setUploadProgress(prev => (prev < 85 ? prev + 12 : prev));
      }, 400);

      const res = await api.uploadVolunteerBook(formData);
      clearInterval(progressTimer);
      setUploadProgress(100);

      toast.success(res.message || "Kitob qabul qilindi va tahlil qilinmoqda! 🚀");
      onSuccess();
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      toast.error(err.message || "Kitobni yuklashda xatolik yuz berdi");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-200/90 dark:border-white/10 flex items-center justify-between bg-stone-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E05638] to-amber-500 text-white flex items-center justify-center shadow-md">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-950 dark:text-white">
                Yangi Asar Taqdim Etish (Volontyor)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Katta hajmdagi PDF va EPUB kitoblarni cheklovsiz yuklash
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          
          {/* Moderation clause banner */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-amber-800 dark:text-amber-300">
            <ShieldCheck size={18} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div className="text-[11px] leading-relaxed">
              <strong className="font-semibold block mb-0.5">Admin Moderatsiyasi Qoidasi:</strong>
              Siz yuklagan asar sun'iy intellekt konveyeridan o'tib, 3D Reader sahifalariga ajratiladi va <b>«Tekshiruvda (READY)»</b> holatida bo'ladi. Administrator ko'rib chiqib, <b>«Chop Etish (Publish)»</b> tugmasini bosishi bilanoq Bookify kutubxonasida rasman e'lon qilinadi va sizning hisobotingizga qo'shiladi!
            </div>
          </div>

          {/* 1. Main Book File Dropzone */}
          <div className="space-y-1.5">
            <label className="font-medium text-stone-700 dark:text-stone-300 block">
              Elektron Kitob Fayli <span className="text-[#E05638]">*</span>
            </label>
            
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileSelect(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                isDragOver 
                  ? 'border-[#E05638] bg-[#E05638]/5' 
                  : file 
                    ? 'border-emerald-500/60 bg-emerald-500/5' 
                    : 'border-stone-300 dark:border-white/15 hover:border-stone-400 dark:hover:border-white/25 bg-stone-50/50 dark:bg-white/[0.02]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.epub,.docx,.txt,.fb2"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />

              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <FileText size={22} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-stone-900 dark:text-white text-xs">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-stone-500 font-mono">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB • Tanlandi
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 transition-colors ml-2"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#E05638]/10 text-[#E05638] mx-auto flex items-center justify-center">
                    <Upload size={22} />
                  </div>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">
                    Faylni shu yerga tashlang yoki tanlash uchun bosing
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Qabul qilinadigan formatlar: <b>PDF, EPUB, FB2, DOCX, TXT</b> (150 MB gacha cheklovsiz)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 2. Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-medium text-stone-700 dark:text-stone-300 block">
                Asar Nomi <span className="text-[#E05638]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masalan: Yashamoq"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E05638]/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-stone-700 dark:text-stone-300 block">
                Muallif
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Masalan: Yu Xua yoki Abdulla Qodiriy"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E05638]/30"
              />
            </div>
          </div>

          {/* 3. Category & Cover Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-medium text-stone-700 dark:text-stone-300 block">
                Janr / Kategoriya
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E05638]/30"
              >
                {BOOK_CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-white dark:bg-[#121620] text-stone-900 dark:text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-stone-700 dark:text-stone-300 block">
                Muqova Rasmi (Ixtiyoriy)
              </label>
              <div 
                onClick={() => coverInputRef.current?.click()}
                className="flex items-center gap-3 p-2 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 cursor-pointer hover:border-stone-400 transition-colors"
              >
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleCoverSelect(e.target.files[0])}
                  className="hidden"
                />
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover preview" className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-stone-200 dark:bg-white/10 text-stone-500 flex items-center justify-center">
                    <ImageIcon size={16} />
                  </div>
                )}
                <span className="text-xs text-stone-500 dark:text-stone-400 truncate">
                  {coverFile ? coverFile.name : "Rasm tanlash..."}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Description */}
          <div className="space-y-1.5">
            <label className="font-medium text-stone-700 dark:text-stone-300 block">
              Qisqacha Tavsif (Ixtiyoriy)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Asar haqida qisqacha ma'lumot..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E05638]/30 resize-none"
            />
          </div>

          {/* Progress Bar while Uploading */}
          {isUploading && (
            <div className="space-y-2 p-4 rounded-2xl bg-[#E05638]/5 border border-[#E05638]/20 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#E05638] flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Fayl serverga yuklanmoqda...</span>
                </span>
                <span className="font-mono font-bold text-stone-700 dark:text-stone-300">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-white/10 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#E05638] to-amber-500 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-stone-400 text-center">
                Katta hajmdagi fayllar (80-100 MB) yuklanishi 10-30 soniya vaqt olishi mumkin. Sahifani yopmang.
              </p>
            </div>
          )}

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-5 py-2.5 rounded-xl border border-stone-300 dark:border-white/10 hover:bg-stone-100 dark:hover:bg-white/5 text-stone-700 dark:text-stone-300 font-medium transition-colors cursor-pointer"
            >
              Bekor qilish
            </button>

            <button
              type="submit"
              disabled={isUploading || !file}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E05638] to-[#C5A059] hover:from-[#d04b30] hover:to-[#b3904e] text-white font-semibold transition-all shadow-lg shadow-[#E05638]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Yuklanmoqda...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Moderatsiyaga Yuborish</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
