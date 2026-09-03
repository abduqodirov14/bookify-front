import React, { useState, useEffect } from 'react';
import { Book } from '../../types';
import { api } from '../../services/api';
import { 
  ShieldCheck, 
  BookOpen, 
  UploadCloud, 
  Trash2, 
  Plus, 
  FileText,
  Trophy,
  Sparkles,
  Edit2,
  X,
  Check,
  Eye,
  RefreshCw,
  MessageSquare,
  Star,
  UserCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Props {
  books: Book[];
  onRefreshBooks: () => void;
  onNavigate?: (page: any, param?: string) => void;
}

const COVER_PRESETS = [
  { name: 'Mumtoz Jigarrang', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80' },
  { name: 'Klassik Kitob', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80' },
  { name: 'Oltin Sahifa', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80' },
  { name: 'Tungi Moviy', url: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=600&q=80' },
  { name: 'Badiiy Zangori', url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80' }
];

export default function AdminPanel({ books, onRefreshBooks, onNavigate }: Props) {
  const [tab, setTab] = useState<'dashboard' | 'upload' | 'seasons' | 'comments'>('dashboard');
  
  // Book Upload State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Falsafiy Roman');
  const [pages, setPages] = useState(460);
  const [narrator, setNarrator] = useState('Afzal Rafiqov');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80');
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [uploadTextMode, setUploadTextMode] = useState<'file' | 'text'>('file');
  const [directTextContent, setDirectTextContent] = useState('');

  // Edit Book State
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPages, setEditPages] = useState(300);
  const [editNarrator, setEditNarrator] = useState('');
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Seasons / Tournaments State
  const [challengesList, setChallengesList] = useState<any[]>([]);
  const [seasonName, setSeasonName] = useState('');
  const [seasonDesc, setSeasonDesc] = useState('');
  const [seasonDays, setSeasonDays] = useState(30);
  const [isCreatingSeason, setIsCreatingSeason] = useState(false);

  // Comments Moderation State
  const [adminComments, setAdminComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const fetchChallenges = async () => {
    try {
      const list = await api.getChallenges();
      setChallengesList(list);
    } catch {
      // silent
    }
  };

  const fetchAdminComments = async () => {
    setIsLoadingComments(true);
    try {
      const list = await api.getAllAdminComments();
      setAdminComments(list);
    } catch {
      // silent
    } finally {
      setIsLoadingComments(false);
    }
  };

  useEffect(() => {
    if (tab === 'seasons') {
      fetchChallenges();
    } else if (tab === 'comments') {
      fetchAdminComments();
    }
  }, [tab]);

  // Open Edit Modal
  const handleOpenEdit = (b: Book) => {
    setEditingBook(b);
    setEditTitle(b.title);
    setEditAuthor(b.authorName);
    setEditCategory(b.category || 'Mumtoz Meros');
    setEditPages(b.pages || 350);
    setEditNarrator(b.narrator || 'Afzal Rafiqov');
    setEditCoverUrl(b.coverImage || '');
    setEditDescription(b.description || '');
  };

  // Save Book Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    if (!editTitle.trim() || !editAuthor.trim()) {
      toast.error("Kitob nomi va muallifini kiriting");
      return;
    }

    setIsSavingEdit(true);
    const toastId = toast.loading("O'zgarishlar saqlanmoqda...");

    try {
      await api.updateBook(editingBook.id, {
        title: editTitle.trim(),
        author: editAuthor.trim(),
        author_name: editAuthor.trim(),
        category: editCategory,
        pages: editPages,
        narrator: editNarrator,
        cover_image: editCoverUrl,
        description: editDescription
      });

      toast.success("Kitob ma'lumotlari muvaffaqiyatli yangilandi! 🎉", { id: toastId });
      setEditingBook(null);
      onRefreshBooks();
    } catch (err: any) {
      toast.error(err.message || "Tahrirlashda xatolik yuz berdi", { id: toastId });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Book
  const handleDeleteBook = async (bookId: string, bookTitle: string) => {
    if (!confirm(`Haqiqatan ham "${bookTitle}" kitobini butunlay o'chirmoqchimisiz?`)) {
      return;
    }

    const toastId = toast.loading("Kitob bazadan o'chirilmoqda...");
    try {
      await api.deleteBook(bookId);
      toast.success(`"${bookTitle}" bazadan muvaffaqiyatli o'chirildi`, { id: toastId });
      onRefreshBooks();
    } catch (err: any) {
      toast.error(err.message || "O'chirishda xatolik yuz berdi", { id: toastId });
    }
  };

  // Delete Comment from Admin
  const handleDeleteComment = async (bookId: string, commentId: string) => {
    if (!confirm("Ushbu fikrni o'chirmoqchimisiz?")) return;
    try {
      await api.deleteBookComment(bookId, commentId);
      toast.success("Fikr bazadan o'chirildi");
      fetchAdminComments();
    } catch (err: any) {
      toast.error(err.message || "O'chirishda xatolik");
    }
  };

  // Upload Book
  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      toast.error("Iltimos, kitob nomi va muallifini kiriting");
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);
    setUploadStage("Fayl va ma'lumotlar serverga uzatilmoqda...");

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('author', author.trim());
      formData.append('author_name', author.trim());
      formData.append('category', category);
      formData.append('pages', String(pages));
      formData.append('narrator', narrator);
      formData.append('description', description || `${title} — yangi yuklangan sara durdona asar.`);
      formData.append('cover_image_val', coverUrl);
      formData.append('cover_image_url', coverUrl);

      if (uploadTextMode === 'text' && directTextContent.trim()) {
        const blob = new Blob([directTextContent.trim()], { type: 'text/plain' });
        formData.append('file', blob, `${title}.txt`);
      } else if (bookFile) {
        formData.append('file', bookFile);
      } else {
        const blob = new Blob([
          `1-Bob: ${title}\n\nUshbu kitob muvaffaqiyatli chop etildi va ma'lumotlar bazasida to'liq saqlandi.`
        ], { type: 'text/plain' });
        formData.append('file', blob, `${title}.txt`);
      }

      setUploadProgress(20);
      setUploadStage("Fayl qabul qilinmoqda (HTTP 202 Accepted)...");

      const res = await api.uploadBook(formData);
      const bookId = res?.book_id;

      if (bookId) {
        setUploadProgress(35);
        setUploadStage("Asinxron konveyer ishga tushirildi...");

        let isDone = false;
        let attempts = 0;
        while (!isDone && attempts < 120) {
          await new Promise(r => setTimeout(r, 1200));
          attempts++;
          const status = await api.getBookStatus(bookId);
          if (status) {
            setUploadProgress(Math.max(35, status.progress || 35));
            if (status.step_name) {
              const pagesInfo = status.total_pages > 0 ? ` • ${status.pages_processed}/${status.total_pages} bet` : '';
              setUploadStage(`${status.step_name}${pagesInfo}`);
            }
            if (status.status === 'COMPLETED' || status.status === 'PUBLISHED' || (status.progress && status.progress >= 100)) {
              isDone = true;
            } else if (status.status === 'FAILED') {
              throw new Error(status.error_message || "Kitobni qayta ishlashda xatolik");
            }
          }
        }
      }

      setUploadProgress(100);
      setUploadStage("Kitob muvaffaqiyatli saqlandi va javonga joylandi! 🎉");
      await new Promise(r => setTimeout(r, 600));

      toast.success("Kitob muvaffaqiyatli saqlandi va chop etildi! 🎉");
      
      setTitle('');
      setAuthor('');
      setDescription('');
      setBookFile(null);
      setDirectTextContent('');
      setUploadProgress(0);
      setIsUploading(false);
      setTab('dashboard');
      onRefreshBooks();
    } catch (err: any) {
      toast.error(err.message || "Kitob yuklashda xatolik yuz berdi");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Create Challenge
  const handleCreateSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seasonName.trim()) {
      toast.error("Iltimos, mavsum nomini kiriting");
      return;
    }

    setIsCreatingSeason(true);
    const toastId = toast.loading("Yangi mavsum ochilmoqda...");

    try {
      const now = new Date();
      const end = new Date();
      end.setDate(now.getDate() + (seasonDays || 30));

      await api.createChallenge({
        name: seasonName.trim(),
        description: seasonDesc.trim() || `${seasonName} — barcha kitobxonlar o'rtasida adabiy bellashuv.`,
        start_at: now.toISOString(),
        end_at: end.toISOString()
      });

      toast.success("Yangi adabiy mavsum muvaffaqiyatli ochildi! 🏆", { id: toastId });
      setSeasonName('');
      setSeasonDesc('');
      fetchChallenges();
    } catch (err: any) {
      toast.error(err.message || "Mavsum yaratishda xatolik", { id: toastId });
    } finally {
      setIsCreatingSeason(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/90 dark:border-white/10 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E05638] uppercase tracking-wider">
              <ShieldCheck size={16} />
              <span>Administrator Markazi • To'liq Boshqaruv</span>
            </div>
            
            <a
              href="/BOOKIFY_INVESTOR_PITCH_DECK_2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-full bg-[#C5A059]/15 hover:bg-[#C5A059]/25 border border-[#C5A059]/30 text-[#C5A059] text-[11px] font-mono font-bold transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Investor Pitch Deck PDFni ochish yoki yuklab olish"
            >
              <FileText size={13} />
              <span>Pitch Deck (PDF)</span>
            </a>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950 dark:text-white tracking-tight">
            Bookify Boshqaruv Paneli
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-stone-100 dark:bg-white/5 p-1 rounded-2xl border border-stone-200/80 dark:border-white/10">
          <button
            onClick={() => setTab('dashboard')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              tab === 'dashboard' 
                ? 'bg-[#E05638] text-white font-bold shadow-xs' 
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-950'
            }`}
          >
            <BookOpen size={14} />
            <span>Asarlar ({books.length})</span>
          </button>

          <button
            onClick={() => setTab('comments')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              tab === 'comments' 
                ? 'bg-[#E05638] text-white font-bold shadow-xs' 
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-950'
            }`}
          >
            <MessageSquare size={14} />
            <span>Taqrizlar & Fikrlar</span>
          </button>

          <button
            onClick={() => setTab('upload')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              tab === 'upload' 
                ? 'bg-[#E05638] text-white font-bold shadow-xs' 
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-950'
            }`}
          >
            <UploadCloud size={14} />
            <span>Yangi Kitob</span>
          </button>

          <button
            onClick={() => setTab('seasons')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              tab === 'seasons' 
                ? 'bg-[#E05638] text-white font-bold shadow-xs' 
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-950'
            }`}
          >
            <Trophy size={14} />
            <span>Mavsumlar</span>
          </button>
        </div>
      </div>

      {/* ── 1. DASHBOARD VIEW (BOOKS LIST WITH FULL CRUD) ── */}
      {tab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 space-y-2 shadow-xs">
              <span className="text-xs font-mono text-stone-400 uppercase">Jami Asarlar</span>
              <div className="font-serif text-3xl font-bold text-stone-950 dark:text-white">{books.length} ta</div>
            </div>
            <div className="p-6 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 space-y-2 shadow-xs">
              <span className="text-xs font-mono text-stone-400 uppercase">Faol Mavsumlar</span>
              <div className="font-serif text-3xl font-bold text-[#E05638]">
                {challengesList.filter(c => c.status === 'ACTIVE').length} ta
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 space-y-2 shadow-xs">
              <span className="text-xs font-mono text-stone-400 uppercase">Baza Holati</span>
              <div className="font-mono text-xs font-bold text-emerald-500 pt-3">● PostgreSQL 5432 / Cloud Ulangan</div>
            </div>
          </div>

          {/* Books Management Table */}
          <div className="bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-6 border-b border-stone-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-950 dark:text-white">
                  Kutubxona Asarlari Ro'yxati
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Asarlarni tahrirlash, muqova rasmini yangilash yoki asarlar qo'shish
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onRefreshBooks}
                  className="p-2.5 rounded-xl bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-white/20 transition-colors cursor-pointer"
                  title="Qayta yuklash"
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  onClick={() => setTab('upload')}
                  className="px-4 py-2 rounded-xl bg-[#E05638] text-white text-xs font-bold font-mono uppercase cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Plus size={14} />
                  <span>Yangi Kitob Qo'shish</span>
                </button>
              </div>
            </div>

            {books.length > 0 ? (
              <div className="divide-y divide-stone-100 dark:divide-white/5">
                {books.map(b => (
                  <div key={b.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50 dark:hover:bg-white/[0.02] transition-colors">
                    
                    {/* Book Info with Real Cover Thumbnail */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-20 rounded-xl overflow-hidden shadow-md bg-stone-900 shrink-0 border border-black/10 relative group">
                        <img 
                          src={b.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'} 
                          alt={b.title} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                        />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-base text-stone-900 dark:text-white truncate">
                            {b.title}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E05638]/10 text-[#E05638] border border-[#E05638]/20 shrink-0">
                            {b.category || 'Mumtoz Meros'}
                          </span>
                        </div>
                        <div className="text-xs text-stone-500 font-mono">
                          Muallif: <strong className="text-stone-800 dark:text-stone-300">{b.authorName}</strong> • {b.pages} bet • {b.narrator || 'Ovozli'}
                        </div>
                        <p className="text-xs text-stone-400 line-clamp-1 max-w-xl">
                          {b.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Cluster (View, Edit, Delete) */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {onNavigate && (
                        <button
                          onClick={() => onNavigate('reader', b.id)}
                          className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/20 text-stone-800 dark:text-stone-200 text-xs font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                          title="Mutolaa qilish"
                        >
                          <Eye size={14} />
                          <span>Ko'rish</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="px-3 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                        title="Tahrirlash"
                      >
                        <Edit2 size={14} />
                        <span>Tahrirlash</span>
                      </button>

                      <button
                        onClick={() => handleDeleteBook(b.id, b.title)}
                        className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                        title="O'chirish"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-white/5 text-stone-400 flex items-center justify-center mx-auto">
                  <BookOpen size={24} />
                </div>
                <div className="text-sm font-serif text-stone-500">
                  Hozircha kitoblar yuklanmagan.
                </div>
                <button
                  onClick={() => setTab('upload')}
                  className="px-5 py-2.5 rounded-xl bg-[#E05638] text-white text-xs font-mono font-bold uppercase cursor-pointer"
                >
                  Yangi Kitob Qo'shish
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 2. COMMENTS MODERATION TAB (WHO WROTE WHAT & WHEN) ── */}
      {tab === 'comments' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-6 border-b border-stone-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-950 dark:text-white flex items-center gap-2">
                  <MessageSquare size={18} className="text-[#E05638]" />
                  <span>Barcha Kitobxonlar Taqrizlari & Fikrlari</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Platformadagi barcha fikr-mulohazalar xronologiyasi (Kim, qachon va nima yozganligi)
                </p>
              </div>
              <button
                onClick={fetchAdminComments}
                className="p-2.5 rounded-xl bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-white/20 transition-colors cursor-pointer"
                title="Qayta yuklash"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {adminComments.length > 0 ? (
              <div className="divide-y divide-stone-100 dark:divide-white/5">
                {adminComments.map((c) => (
                  <div key={c.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-stone-50 dark:hover:bg-white/[0.02] transition-colors">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-serif font-bold text-sm text-stone-950 dark:text-white">
                          {c.user_name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-300">
                          Asar: <strong className="text-stone-900 dark:text-white">{c.book_title}</strong>
                        </span>
                        <span className="text-xs text-amber-500 flex items-center">
                          {Array.from({ length: c.rating || 5 }).map((_, i) => (
                            <Star key={i} size={12} className="fill-amber-400" />
                          ))}
                        </span>
                        <span className="text-[11px] font-mono text-stone-400 ml-auto sm:ml-0">
                          ⏱️ {c.created_at}
                        </span>
                      </div>
                      <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-serif bg-stone-50 dark:bg-white/[0.02] p-3 rounded-xl border border-stone-200/50 dark:border-white/5">
                        "{c.content}"
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteComment(c.book_id, c.id)}
                      className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer shrink-0 self-end sm:self-start"
                      title="O'chirish"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center text-xs text-stone-400 font-mono">
                Hozircha hech qanday fikr-mulohaza qoldirilmagan.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 3. EDIT BOOK MODAL WITH LIVE COVER THUMBNAIL PREVIEW ── */}
      {editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E05638]/10 text-[#E05638] flex items-center justify-center">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-950 dark:text-white">
                    Kitobni Tahrirlash
                  </h3>
                  <span className="text-xs font-mono text-stone-400">{editingBook.title}</span>
                </div>
              </div>
              <button
                onClick={() => setEditingBook(null)}
                className="p-2 rounded-xl bg-stone-100 dark:bg-white/10 text-stone-500 hover:text-stone-900 dark:hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-5">
              
              {/* Cover Live Preview & URL */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-28 rounded-xl overflow-hidden shadow-md bg-stone-900 shrink-0 border border-black/10">
                  <img 
                    src={editCoverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'} 
                    alt="Cover Preview" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                </div>
                <div className="space-y-2 flex-1 w-full">
                  <label className="text-xs font-mono text-stone-700 dark:text-stone-300 font-bold block">
                    Muqova Rasmi URL (Thumbnail):
                  </label>
                  <input
                    type="url"
                    value={editCoverUrl}
                    onChange={(e) => setEditCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-stone-900 dark:text-white focus:outline-none focus:border-[#E05638]"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono text-stone-400">Namunalar:</span>
                    {COVER_PRESETS.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setEditCoverUrl(p.url)}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-stone-200 dark:bg-white/10 hover:bg-[#E05638] hover:text-white transition-colors cursor-pointer"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Title & Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-stone-700 dark:text-stone-300 font-bold block">
                    Kitob Nomi:
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-sm font-serif font-bold text-stone-900 dark:text-white focus:outline-none focus:border-[#E05638]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-stone-700 dark:text-stone-300 font-bold block">
                    Muallif:
                  </label>
                  <input
                    type="text"
                    required
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-sm font-serif font-bold text-stone-900 dark:text-white focus:outline-none focus:border-[#E05638]"
                  />
                </div>
              </div>

              {/* Category, Pages, Narrator */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-stone-700 dark:text-stone-300 font-bold block">
                    Kategoriya:
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-stone-900 dark:text-white focus:outline-none focus:border-[#E05638]"
                  >
                    <option value="Falsafiy Roman">Falsafiy Roman</option>
                    <option value="Mumtoz Meros">Mumtoz Meros</option>
                    <option value="Jadid Merosi">Jadid Merosi</option>
                    <option value="Tarixiy Asar">Tarixiy Asar</option>
                    <option value="Jahon Adabiyoti">Jahon Adabiyoti</option>
                    <option value="Badiiy Nasr">Badiiy Nasr</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-stone-700 dark:text-stone-300 font-bold block">
                    Sahifalar:
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editPages}
                    onChange={(e) => setEditPages(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-stone-900 dark:text-white focus:outline-none focus:border-[#E05638]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-stone-700 dark:text-stone-300 font-bold block">
                    Ovozlovchi:
                  </label>
                  <input
                    type="text"
                    value={editNarrator}
                    onChange={(e) => setEditNarrator(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-stone-900 dark:text-white focus:outline-none focus:border-[#E05638]"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-700 dark:text-stone-300 font-bold block">
                  Asar Haqida (Tavsif):
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs leading-relaxed text-stone-900 dark:text-white focus:outline-none focus:border-[#E05638]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-6 py-2.5 rounded-xl bg-[#E05638] hover:bg-[#C74326] text-white text-xs font-mono font-bold uppercase transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>{isSavingEdit ? "Saqlanmoqda..." : "O'zgarishlarni Saqlash"}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ── 4. UPLOAD NEW BOOK TAB WITH LIVE THUMBNAIL PREVIEW ── */}
      {tab === 'upload' && (
        <div className="bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E05638]/10 text-[#E05638] flex items-center justify-center">
              <UploadCloud size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-950 dark:text-white">
                Yangi Durdona Asar Yuklash
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                Asar fayli avtomatik matnga ajratiladi va PostgreSQL bazasiga to'liq yoziladi
              </p>
            </div>
          </div>

          <form onSubmit={handleBookSubmit} className="space-y-6">
            
            {/* Live Cover Thumbnail Preview with File Upload & Presets */}
            <div className="p-5 rounded-2xl bg-stone-50 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-24 h-34 rounded-2xl overflow-hidden shadow-lg bg-stone-900 shrink-0 border border-black/10 relative">
                <img 
                  src={coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'} 
                  alt="Live Cover Preview" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white font-bold">
                  Ko'rinish
                </div>
              </div>
              <div className="space-y-3 flex-1 w-full">
                <label className="text-xs font-mono text-stone-700 dark:text-stone-300 font-bold block">
                  Kitob Muqova Rasmi:
                </label>

                {/* File Upload for Cover Image */}
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-stone-500 block">
                    📁 Qurilmangizdan rasm faylini tanlash (JPG, PNG, WEBP):
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (reader.result) {
                            setCoverUrl(reader.result as string);
                            toast.success("Muqova rasmi yuklandi!");
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs text-stone-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#E05638]/10 file:text-[#E05638] hover:file:bg-[#E05638]/20 cursor-pointer"
                  />
                </div>

                {/* URL Input */}
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-stone-500 block">
                    🔗 Yoki rasm havolasini (URL) kiriting:
                  </span>
                  <input
                    type="url"
                    value={coverUrl.startsWith('data:') ? '' : coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-stone-900 dark:text-white focus:outline-none focus:border-[#E05638]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-mono text-stone-400">Namunalar:</span>
                  {COVER_PRESETS.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCoverUrl(p.url)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-stone-200 dark:bg-white/10 hover:bg-[#E05638] hover:text-white transition-colors cursor-pointer"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Title & Author */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-700 dark:text-stone-300 font-bold block">
                  Kitob Nomi: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Qiyomat"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-sm font-serif font-bold text-stone-900 dark:text-white focus:outline-none focus:border-[#E05638]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-700 dark:text-stone-300 font-bold block">
                  Muallif: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Chingiz Aytmatov"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-sm font-serif font-bold text-stone-900 dark:text-white focus:outline-none focus:border-[#E05638]"
                />
              </div>
            </div>

            {/* Category & Pages & Narrator */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-700 dark:text-stone-300 font-bold block">
                  Kategoriya:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-stone-900 dark:text-white focus:outline-none focus:border-[#E05638]"
                >
                  <option value="Falsafiy Roman">Falsafiy Roman</option>
                  <option value="Mumtoz Meros">Mumtoz Meros</option>
                  <option value="Jadid Merosi">Jadid Merosi</option>
                  <option value="Tarixiy Asar">Tarixiy Asar</option>
                  <option value="Jahon Adabiyoti">Jahon Adabiyoti</option>
                  <option value="Badiiy Nasr">Badiiy Nasr</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-700 dark:text-stone-300 font-bold block">
                  Taxminiy Sahifalar:
                </label>
                <input
                  type="number"
                  min={1}
                  value={pages}
                  onChange={(e) => setPages(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-stone-900 dark:text-white focus:outline-none focus:border-[#E05638]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-700 dark:text-stone-300 font-bold block">
                  Audio Suhandon:
                </label>
                <input
                  type="text"
                  placeholder="Afzal Rafiqov"
                  value={narrator}
                  onChange={(e) => setNarrator(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-stone-900 dark:text-white focus:outline-none focus:border-[#E05638]"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-stone-700 dark:text-stone-300 font-bold block">
                Asar haqida qisqacha tavsif:
              </label>
              <textarea
                rows={3}
                placeholder="Ushbu asar insoniyat va tabiat o'rtasidagi munosabatlarni teran tasvirlaydi..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs leading-relaxed text-stone-900 dark:text-white focus:outline-none focus:border-[#E05638]"
              />
            </div>

            {/* File Upload Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-stone-700 dark:text-stone-300 font-bold block">
                Kitob Matni / Qo'lyozmasi (PDF, EPUB, DOCX yoki TXT):
              </label>
              <div className="border-2 border-dashed border-stone-300 dark:border-white/20 rounded-2xl p-6 text-center hover:border-[#E05638] transition-colors bg-stone-50/50 dark:bg-white/[0.02]">
                <input
                  type="file"
                  id="book-file"
                  accept=".pdf,.epub,.docx,.txt"
                  onChange={(e) => setBookFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="book-file" className="cursor-pointer space-y-2 block">
                  <div className="w-12 h-12 rounded-2xl bg-[#E05638]/10 text-[#E05638] flex items-center justify-center mx-auto">
                    <FileText size={24} />
                  </div>
                  <div className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200">
                    {bookFile ? bookFile.name : "Faylni tanlash uchun bosing yoki bu yerga tashlang"}
                  </div>
                  <div className="text-[10px] font-mono text-stone-400">
                    Agar fayl tanlanmasa, standart durdona boblar bilan yaratiladi
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setTab('dashboard')}
                className="px-6 py-3 rounded-2xl text-xs font-mono font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-8 py-3.5 rounded-2xl bg-[#E05638] hover:bg-[#C74326] text-white font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-xl active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Sparkles size={16} />
                <span>{isUploading ? "Yuklanmoqda..." : "Kitobni Saqlash & Chop Etish"}</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ── 5. SEASONS & TOURNAMENT MANAGEMENT TAB ── */}
      {tab === 'seasons' && (
        <div className="space-y-8 animate-in fade-in">
          
          {/* Create Season Form */}
          <div className="bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E05638]/10 text-[#E05638] flex items-center justify-center">
                <Trophy size={20} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-950 dark:text-white">
                  Yangi Adabiy Mavsum Ochish
                </h3>
                <p className="text-xs text-stone-500 font-mono">
                  Ishtirokchilar mutolaa qilgan vaqti va sahifalar soni bo'yicha chempionatda raqobatlashadi
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateSeason} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-mono text-stone-700 dark:text-stone-300 font-bold block">
                    Mavsum Nomi:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Kuzgi Adabiy Chempionat 2026"
                    value={seasonName}
                    onChange={(e) => setSeasonName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-stone-900 dark:text-white focus:outline-none focus:border-[#E05638]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-stone-700 dark:text-stone-300 font-bold block">
                    Davomiyligi (kun):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={seasonDays}
                    onChange={(e) => setSeasonDays(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-stone-900 dark:text-white focus:outline-none focus:border-[#E05638]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-700 dark:text-stone-300 font-bold block">
                  Mavsum Tavsifi & Sovrin Jamg'armasi:
                </label>
                <input
                  type="text"
                  placeholder="15,000,000 UZS sovrin jamg'armasi va Oltin Meros diplomlari..."
                  value={seasonDesc}
                  onChange={(e) => setSeasonDesc(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-stone-900 dark:text-white focus:outline-none focus:border-[#E05638]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isCreatingSeason}
                  className="px-6 py-3 rounded-2xl bg-[#E05638] hover:bg-[#C74326] text-white font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Trophy size={14} />
                  <span>{isCreatingSeason ? "Ochilmoqda..." : "Mavsumni E'lon Qilish"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Challenges List */}
          <div className="bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-6 border-b border-stone-100 dark:border-white/5">
              <h3 className="font-serif text-lg font-bold text-stone-950 dark:text-white">
                Barcha Mavsumlar
              </h3>
            </div>
            {challengesList.length > 0 ? (
              <div className="divide-y divide-stone-100 dark:divide-white/5">
                {challengesList.map(ch => (
                  <div key={ch.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-base text-stone-900 dark:text-white">{ch.name}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          ch.status === 'ACTIVE' 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                            : 'bg-stone-500/10 text-stone-500'
                        }`}>
                          {ch.status}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1">{ch.description}</p>
                    </div>

                    {ch.status === 'ACTIVE' && (
                      <button
                        onClick={async () => {
                          if (confirm(`"${ch.name}" mavsumini rasman yakunlab, g'oliblarni taqdirlaysizmi?`)) {
                            await api.finishChallenge(ch.id);
                            toast.success("Mavsum yakunlandi va g'oliblar e'lon qilindi! 🏆");
                            fetchChallenges();
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold uppercase cursor-pointer"
                      >
                        Mavsumni Yakunlash & G'oliblarni E'lon Qilish
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-stone-400 font-mono">
                Hozircha hech qanday mavsum mavjud emas.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
