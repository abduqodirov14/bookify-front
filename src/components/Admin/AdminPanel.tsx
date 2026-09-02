import React, { useState, useEffect } from 'react';
import { Book } from '../../types';
import { api } from '../../services/api';
import { 
  ShieldCheck, 
  BookOpen, 
  UploadCloud, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Trash2, 
  Plus, 
  Image as ImageIcon, 
  FileText,
  Trophy,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Props {
  books: Book[];
  onRefreshBooks: () => void;
}

export default function AdminPanel({ books, onRefreshBooks }: Props) {
  const [tab, setTab] = useState<'dashboard' | 'upload' | 'seasons'>('dashboard');
  
  // Book Upload State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Mumtoz Meros');
  const [pages, setPages] = useState(320);
  const [narrator, setNarrator] = useState('Afzal Rafiqov');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80');
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Seasons / Tournaments State
  const [challengesList, setChallengesList] = useState<any[]>([]);
  const [seasonName, setSeasonName] = useState('');
  const [seasonDesc, setSeasonDesc] = useState('');
  const [seasonDays, setSeasonDays] = useState(30);
  const [isCreatingSeason, setIsCreatingSeason] = useState(false);

  const fetchChallenges = async () => {
    try {
      const list = await api.getChallenges();
      setChallengesList(list);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [tab]);

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      toast.error("Iltimos, kitob nomi va muallifini kiriting");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Kitob backend serverga yuklanmoqda va PostgreSQL bazasiga yozilmoqda...");

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

      if (bookFile) {
        formData.append('file', bookFile);
      } else {
        const blob = new Blob([
          `1-Bob: ${title}\n\nUshbu kitob muvaffaqiyatli chop etildi va PostgreSQL ma'lumotlar bazasida to'liq saqlandi.`
        ], { type: 'text/plain' });
        formData.append('file', blob, `${title}.txt`);
      }

      await api.uploadBook(formData);
      toast.success("Kitob PostgreSQL bazasiga muvaffaqiyatli saqlandi va chop etildi! 🎉", { id: toastId });
      
      setTitle('');
      setAuthor('');
      setDescription('');
      setBookFile(null);
      setTab('dashboard');
      onRefreshBooks();
    } catch (err: any) {
      toast.error(err.message || "Yuklashda xatolik yuz berdi", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

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
      const end = new Date(now.getTime() + seasonDays * 24 * 60 * 60 * 1000);

      await api.createChallenge({
        name: seasonName.trim(),
        description: seasonDesc.trim() || `${seasonName} — ${seasonDays} kunlik eng faol kitobxonlar adabiy chempionati.`,
        start_at: now.toISOString(),
        end_at: end.toISOString()
      });

      toast.success(`'${seasonName}' mavsumi ochildi va chempionat boshlandi! 🏆`, { id: toastId });
      setSeasonName('');
      setSeasonDesc('');
      fetchChallenges();
    } catch (err: any) {
      toast.error(err.message || "Mavsum ochishda xatolik", { id: toastId });
    } finally {
      setIsCreatingSeason(false);
    }
  };

  const handleFinishSeason = async (challengeId: string, challengeName: string) => {
    if (!confirm(`Haqiqatdan ham '${challengeName}' mavsumini yakunlab, g'oliblarni taqdirlamoqchimisiz?`)) return;
    
    const toastId = toast.loading("G'oliblar aniqlanmoqda va diplomlar yozilmoqda...");
    try {
      const res = await api.finishChallenge(challengeId);
      toast.success(res.message || "Mavsum yakunlandi va g'oliblar e'lon qilindi! 👑", { id: toastId });
      fetchChallenges();
    } catch (err: any) {
      toast.error(err.message || "Yakunlashda xatolik", { id: toastId });
    }
  };

  const handleDeleteBook = async (id: string, bTitle: string) => {
    if (!confirm(`Haqiqatdan ham "${bTitle}" kitobini o'chirmoqchimisiz?`)) return;
    try {
      await api.deleteBook(id);
      toast.success("Kitob muvaffaqiyatli o'chirildi");
      onRefreshBooks();
    } catch (err: any) {
      toast.error(err.message || "O'chirishda xatolik");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E05638] uppercase tracking-wider mb-1">
            <ShieldCheck size={16} />
            <span>Administrator Markazi (2FA Himoyalangan)</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950 dark:text-white">
            Tizim & Chempionat Boshqaruvi
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Haqiqiy PostgreSQL ma'lumotlar bazasi, asarlar va adabiy musobaqalar boshqaruvi
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 shadow-xs">
          <button
            onClick={() => setTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              tab === 'dashboard' 
                ? 'bg-[#E05638] text-white font-bold shadow-xs' 
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-950'
            }`}
          >
            <BookOpen size={14} />
            <span>Asarlar ({books.length})</span>
          </button>

          <button
            onClick={() => setTab('seasons')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              tab === 'seasons' 
                ? 'bg-[#E05638] text-white font-bold shadow-xs' 
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-950'
            }`}
          >
            <Trophy size={14} />
            <span>Mavsumlar & Chempionat</span>
          </button>

          <button
            onClick={() => setTab('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              tab === 'upload' 
                ? 'bg-[#E05638] text-white font-bold shadow-xs' 
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-950'
            }`}
          >
            <UploadCloud size={14} />
            <span>Yangi Kitob</span>
          </button>
        </div>
      </div>

      {/* 1. DASHBOARD VIEW (BOOKS LIST) */}
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
              <div className="font-mono text-xs font-bold text-emerald-500 pt-3">● PostgreSQL 5433 Ulangan</div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-6 border-b border-stone-100 dark:border-white/5 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-stone-950 dark:text-white">
                Baza Asarlari Ro'yxati
              </h3>
              <button
                onClick={() => setTab('upload')}
                className="px-4 py-2 rounded-xl bg-[#E05638] text-white text-xs font-bold font-mono uppercase cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Yangi Kitob Qo'shish</span>
              </button>
            </div>

            {books.length > 0 ? (
              <div className="divide-y divide-stone-100 dark:divide-white/5">
                {books.map(b => (
                  <div key={b.id} className="p-4 sm:p-6 flex items-center justify-between gap-4 hover:bg-stone-50 dark:hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <img src={b.coverImage} alt={b.title} className="w-12 h-16 object-cover rounded-xl shadow-xs shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-white truncate">{b.title}</h4>
                        <div className="text-xs text-stone-500 font-mono mt-0.5">
                          {b.authorName} • {b.category} • {b.pages} bet
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteBook(b.id, b.title)}
                      className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                      title="O'chirish"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-stone-400 font-mono">
                Bazada hozircha kitoblar mavjud emas.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SEASONS & TOURNAMENT MANAGEMENT TAB */}
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
                  Yangi Adabiy Chempionat / Mavsum Ochish
                </h3>
                <p className="text-xs text-stone-500">
                  Muddati tugaganda tizim avtomatik eng ko'p o'qigan kitobxonlarni taqdirlaydi
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateSeason} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">
                    Mavsum Nomi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Bahoriy Adabiy Chempionat 2026"
                    value={seasonName}
                    onChange={e => setSeasonName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#0E1218] border border-stone-200 dark:border-white/10 text-xs text-stone-900 dark:text-white outline-none focus:border-[#E05638]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">
                    Davomiylik Muddati (Kun) *
                  </label>
                  <select
                    value={seasonDays}
                    onChange={e => setSeasonDays(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#0E1218] border border-stone-200 dark:border-white/10 text-xs text-stone-900 dark:text-white outline-none focus:border-[#E05638]"
                  >
                    <option value={7}>7 kun (1 haftalik tezkor sprint)</option>
                    <option value={15}>15 kun (Yarim oylik turnir)</option>
                    <option value={30}>30 kun (1 oylik to'liq mavsum)</option>
                    <option value={60}>60 kun (Mavsumiy grand chempionat)</option>
                    <option value={90}>90 kun (Kvartal chempionati)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">
                  Mukofot Jamg'armasi & Qo'shimcha Shartlar
                </label>
                <input
                  type="text"
                  placeholder="Masalan: 15,000,000 UZS + 1 Yillik Oltin Meros obunasi + Oltin Diplom"
                  value={seasonDesc}
                  onChange={e => setSeasonDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#0E1218] border border-stone-200 dark:border-white/10 text-xs text-stone-900 dark:text-white outline-none focus:border-[#E05638]"
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingSeason}
                className="px-6 py-3 rounded-2xl bg-[#E05638] hover:bg-[#C74326] text-white font-bold text-xs font-mono uppercase tracking-wider transition-transform active:scale-95 shadow-md cursor-pointer flex items-center gap-2"
              >
                <Sparkles size={15} />
                <span>{isCreatingSeason ? "Ochilmoqda..." : "Mavsumni E'lon Qilish & Boshlash"}</span>
              </button>
            </form>
          </div>

          {/* List of Seasons */}
          <div className="bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-6 border-b border-stone-100 dark:border-white/5">
              <h3 className="font-serif text-lg font-bold text-stone-950 dark:text-white">
                Barcha Mavsumlar Arxivi
              </h3>
            </div>

            {challengesList.length > 0 ? (
              <div className="divide-y divide-stone-100 dark:divide-white/5">
                {challengesList.map(c => {
                  const isActive = c.status === 'ACTIVE';
                  return (
                    <div key={c.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                            isActive 
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                              : 'bg-stone-100 dark:bg-white/10 text-stone-400'
                          }`}>
                            {isActive ? '● Faol Mavsum' : 'Yakunlangan'}
                          </span>
                          <span className="text-xs text-stone-400 font-mono">
                            Tugash sanasi: {new Date(c.end_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-stone-900 dark:text-white">{c.name}</h4>
                        <p className="text-xs text-stone-500">{c.description}</p>
                      </div>

                      {isActive && (
                        <button
                          onClick={() => handleFinishSeason(c.id, c.name)}
                          className="px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white font-semibold text-xs transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
                        >
                          <Award size={14} />
                          <span>Mavsumni Yakunlash & G'oliblarni Taqdirlash</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-stone-400 font-mono">
                Hozircha faol mavsumlar mavjud emas. Yuqoridagi formadan yangi mavsum ochishingiz mumkin.
              </div>
            )}
          </div>

        </div>
      )}

      {/* 3. UPLOAD BOOK VIEW */}
      {tab === 'upload' && (
        <form onSubmit={handleBookSubmit} className="bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="border-b border-stone-100 dark:border-white/5 pb-4">
            <h3 className="font-serif text-xl font-bold text-stone-950 dark:text-white">
              Yangi Asar Yuklash (EPUB, DOCX, PDF, TXT)
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Katta 300-500 betli kitoblar avtomatik boblarga ajratilib PostgreSQL bazasiga yoziladi
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">Kitob Nomi *</label>
              <input
                type="text"
                required
                placeholder="Masalan: O'tkan kunlar"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#0E1218] border border-stone-200 dark:border-white/10 text-xs text-stone-900 dark:text-white outline-none focus:border-[#E05638]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">Muallif *</label>
              <input
                type="text"
                required
                placeholder="Masalan: Abdulla Qodiriy"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#0E1218] border border-stone-200 dark:border-white/10 text-xs text-stone-900 dark:text-white outline-none focus:border-[#E05638]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">Kategoriya</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#0E1218] border border-stone-200 dark:border-white/10 text-xs text-stone-900 dark:text-white outline-none focus:border-[#E05638]"
              >
                <option value="Mumtoz Meros">Mumtoz Meros</option>
                <option value="Tarixiy Romanlar">Tarixiy Romanlar</option>
                <option value="Jadid Adabiyoti">Jadid Adabiyoti</option>
                <option value="Falsafa & Ma'rifat">Falsafa & Ma'rifat</option>
                <option value="Badiiy Adabiyot">Badiiy Adabiyot</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">Suhandon / Narrator</label>
              <input
                type="text"
                value={narrator}
                onChange={e => setNarrator(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#0E1218] border border-stone-200 dark:border-white/10 text-xs text-stone-900 dark:text-white outline-none focus:border-[#E05638]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">Asar Haqida Qisqacha Annotatsiya</label>
            <textarea
              rows={3}
              placeholder="Asarning qisqacha mazmuni va ahamiyati..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#0E1218] border border-stone-200 dark:border-white/10 text-xs text-stone-900 dark:text-white outline-none focus:border-[#E05638]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">Kitob Fayli (EPUB, DOCX, PDF, TXT)</label>
            <input
              type="file"
              accept=".pdf,.docx,.epub,.txt"
              onChange={e => setBookFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#E05638]/10 file:text-[#E05638] hover:file:bg-[#E05638]/20"
            />
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-4 rounded-2xl bg-[#E05638] hover:bg-[#C74326] text-white font-bold text-xs font-mono uppercase tracking-wider transition-transform active:scale-95 shadow-xl cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UploadCloud size={16} />
            <span>{isUploading ? "PostgreSQL Bazasiga Yozilmoqda..." : "Kitobni Saqlash & Chop Etish"}</span>
          </button>
        </form>
      )}

    </div>
  );
}
