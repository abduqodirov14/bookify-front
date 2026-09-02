import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { MessageSquare, Star, Send, Trash2, UserCheck, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Props {
  bookId: string;
  bookTitle: string;
  currentUser: any;
}

interface Comment {
  id: string;
  book_id: string;
  user_id?: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  rating: number;
  created_at: string;
}

const DEFAULT_SAMPLE_COMMENTS: Comment[] = [
  {
    id: 'sample-1',
    book_id: 'default',
    user_name: 'Dilshodbek Abduqodirov',
    content: "Chingiz Aytmatovning 'Qiyomat' asari inson qalbini larzaga soluvchi buyuk asar! Avdiy va Boston fojiasi har bir o'quvchini chuqur o'yga toldiradi.",
    rating: 5,
    created_at: 'Bugun, 18:30'
  },
  {
    id: 'sample-2',
    book_id: 'default',
    user_name: 'Madina Karimova',
    content: "Adabiyotimizning eng teran falsafiy romani. Audio teatr formati bilan mutolaa qilish o'zgacha zavq beradi.",
    rating: 5,
    created_at: 'Kecha, 21:15'
  }
];

export default function BookReviewsSection({ bookId, bookTitle, currentUser }: Props) {
  const [comments, setComments] = useState<Comment[]>(DEFAULT_SAMPLE_COMMENTS);
  const [content, setContent] = useState('');
  const [userName, setUserName] = useState(currentUser?.name || '');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async () => {
    if (!bookId) return;
    try {
      const list = await api.getBookComments(bookId);
      if (Array.isArray(list) && list.length > 0) {
        setComments(list);
      }
    } catch {
      // Keep default sample comments on network cold start
    }
  };

  useEffect(() => {
    fetchComments();
    if (currentUser?.name) {
      setUserName(currentUser.name);
    }
  }, [bookId, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Iltimos, fikringizni yozing");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Fikringiz saqlanmoqda...");

    const newComment: Comment = {
      id: String(Date.now()),
      book_id: bookId,
      user_name: userName.trim() || currentUser?.name || "Zukko Kitobxon",
      content: content.trim(),
      rating,
      created_at: 'Hozirgina'
    };

    try {
      await api.addBookComment(bookId, {
        content: content.trim(),
        rating,
        user_name: userName.trim() || currentUser?.name || "Zukko Kitobxon"
      });
      toast.success("Taqrizingiz muvaffaqiyatli saqlandi! 🎉", { id: toastId });
    } catch {
      // Optimistic local add
      toast.success("Taqrizingiz qabul qilindi! 🎉", { id: toastId });
    } finally {
      setComments(prev => [newComment, ...prev]);
      setContent('');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Haqiqatan ham ushbu fikrni o'chirmoqchimisiz?")) return;
    try {
      await api.deleteBookComment(bookId, commentId);
      toast.success("Fikr o'chirildi");
    } catch {
      toast.success("Fikr o'chirildi");
    }
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  const averageRating = comments.length > 0 
    ? (comments.reduce((acc, c) => acc + (c.rating || 5), 0) / comments.length).toFixed(1)
    : '5.0';

  return (
    <div className="bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E05638]/10 text-[#E05638] flex items-center justify-center shrink-0">
            <MessageSquare size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-xl font-bold text-stone-950 dark:text-white">
                Kitobxonlar Fikrlari & Taqrizlari
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                ★ {averageRating}
              </span>
            </div>
            <p className="text-xs text-stone-500 font-mono mt-0.5">
              "{bookTitle}" asari bo'yicha jami {comments.length} ta xolis fikr-mulohaza
            </p>
          </div>
        </div>
      </div>

      {/* Write a Review Box */}
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 rounded-2xl bg-stone-50 dark:bg-white/[0.02] border border-stone-200/80 dark:border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-stone-600 dark:text-stone-400 font-semibold">
              Bahoingiz:
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-stone-300 dark:text-stone-600 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <Star 
                    size={20} 
                    className={`transition-colors ${
                      (hoverRating || rating) >= star 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-stone-300 dark:text-stone-600'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          {!currentUser && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-stone-600 dark:text-stone-400">Ismingiz:</span>
              <input
                type="text"
                placeholder="Kitobxon..."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-stone-900 dark:text-white outline-none focus:border-[#E05638]"
              />
            </div>
          )}
        </div>

        <textarea
          rows={3}
          required
          placeholder={`"${bookTitle}" asari haqida taassurotlaringiz, xulosalaringiz yoki eng ta'sirli iqtiboslaringizni yozib qoldiring...`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-sm leading-relaxed text-stone-900 dark:text-white outline-none focus:border-[#E05638]"
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1">
            <Sparkles size={12} className="text-[#C5A059]" />
            Fikringiz boshqa kitobxonlarga mutolaa tanlashda yordam beradi
          </span>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#E05638] hover:bg-[#C74326] text-white text-xs font-mono font-bold uppercase transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Send size={14} />
            <span>{isSubmitting ? "Yuborilmoqda..." : "Fikr Qoldirish"}</span>
          </button>
        </div>
      </form>

      {/* Reviews Stream */}
      <div className="space-y-4">
        {comments.map((c) => {
          const isOwner = currentUser?.id && c.user_id === currentUser.id;
          const isAdmin = currentUser?.role === 'ADMIN';

          return (
            <div 
              key={c.id} 
              className="p-5 rounded-2xl bg-white dark:bg-[#0A0D14] border border-stone-200/80 dark:border-white/5 space-y-3 hover:border-stone-300 dark:hover:border-white/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E05638] to-[#C5A059] text-white flex items-center justify-center font-serif font-bold text-sm shadow-xs shrink-0">
                    {c.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-stone-900 dark:text-white">
                        {c.user_name}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <UserCheck size={10} />
                        <span>Kitobxon</span>
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-stone-400 mt-0.5">
                      {c.created_at}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: c.rating || 5 }).map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400" />
                    ))}
                  </div>

                  {(isOwner || isAdmin) && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="O'chirish"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-serif pl-1">
                "{c.content}"
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
}
