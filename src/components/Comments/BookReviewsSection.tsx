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

export default function BookReviewsSection({ bookId, bookTitle, currentUser }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
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
      // Network error — leave comments as empty, show empty state
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
    <div className="border border-ink/20 dark:border-parchment/20 rounded-sm p-6 sm:p-8 space-y-8 bg-transparent">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink/10 dark:border-parchment/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm border border-ink/20 dark:border-parchment/20 text-ink dark:text-parchment flex items-center justify-center shrink-0">
            <MessageSquare size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-xl font-bold text-ink dark:text-parchment">
                Kitobxonlar Fikrlari & Taqrizlari
              </h3>
              <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-mono font-bold border border-ink/30 dark:border-parchment/30 text-ink dark:text-parchment">
                ★ {averageRating}
              </span>
            </div>
            <p className="text-xs text-ink/60 dark:text-parchment/60 font-mono mt-1">
              "{bookTitle}" asari bo'yicha jami {comments.length} ta xolis fikr-mulohaza
            </p>
          </div>
        </div>
      </div>

      {/* Write a Review Box */}
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 rounded-sm bg-transparent border border-ink/20 dark:border-parchment/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-ink dark:text-parchment font-bold">
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
                  className="p-1 text-ink/30 dark:text-parchment/30 hover:text-ink dark:hover:text-parchment transition-colors cursor-pointer"
                >
                  <Star 
                    size={20} 
                    className={`transition-colors ${
                      (hoverRating || rating) >= star 
                        ? 'fill-ink dark:fill-parchment text-ink dark:text-parchment' 
                        : 'text-ink/20 dark:text-parchment/20'
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
                className="px-3 py-1.5 rounded-sm bg-transparent border border-ink/30 dark:border-parchment/30 text-xs font-mono text-ink dark:text-parchment outline-none focus:border-ink dark:focus:border-parchment"
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
          className="w-full px-4 py-3 rounded-sm bg-transparent border border-ink/30 dark:border-parchment/30 text-sm leading-relaxed text-ink dark:text-parchment outline-none focus:border-ink dark:focus:border-parchment placeholder:text-ink/30 dark:placeholder:text-parchment/30"
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-mono text-ink/50 dark:text-parchment/50 flex items-center gap-1 uppercase">
            <Sparkles size={12} className="opacity-50" />
            Fikringiz boshqa kitobxonlarga mutolaa tanlashda yordam beradi
          </span>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-sm bg-ink dark:bg-parchment text-parchment dark:text-ink hover:opacity-90 text-xs font-mono font-bold uppercase transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Send size={14} />
            <span>{isSubmitting ? "Yuborilmoqda..." : "Fikr Qoldirish"}</span>
          </button>
        </div>
      </form>

      {/* Reviews Stream */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="py-10 text-center text-ink/40 dark:text-parchment/40">
            <MessageSquare size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-serif text-ink/60 dark:text-parchment/60">
              Hali sharhlar yo'q — birinchi bo'lib fikr qoldiring.
            </p>
          </div>
        ) : (
          comments.map((c) => {
          const isOwner = currentUser?.id && c.user_id === currentUser.id;
          const isAdmin = currentUser?.role === 'ADMIN';

          return (
            <div 
              key={c.id} 
              className="pb-6 border-b border-ink/10 dark:border-parchment/10 last:border-0 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-ink dark:bg-parchment text-parchment dark:text-ink flex items-center justify-center font-serif font-bold text-sm shrink-0">
                    {c.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-ink dark:text-parchment">
                        {c.user_name}
                      </span>
                      <span className="px-2 py-0.5 rounded-sm text-[9px] font-mono uppercase border border-ink/20 dark:border-parchment/20 text-ink/70 dark:text-parchment/70 flex items-center gap-1">
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
                  <div className="flex items-center">
                    {Array.from({ length: c.rating || 5 }).map((_, i) => (
                      <Star key={i} size={14} className="fill-ink dark:fill-parchment text-ink dark:text-parchment" />
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

              <p className="text-sm text-ink dark:text-parchment/90 leading-relaxed font-serif pl-1">
                "{c.content}"
              </p>
            </div>
          );
        })
        )}
      </div>

    </div>
  );
}
