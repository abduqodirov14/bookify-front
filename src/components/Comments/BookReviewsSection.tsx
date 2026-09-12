import React, { useState } from 'react';
import { Star, MessageSquare, Send, UserCheck, Trash2 } from 'lucide-react';
import { UserProfile } from '../../types';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  rating: number;
  created_at: string;
}

interface Props {
  bookId: string;
  bookTitle: string;
  currentUser: UserProfile | null;
}

export default function BookReviewsSection({ bookId, bookTitle, currentUser }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [userName, setUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        book_id: bookId,
        content: content,
        rating: rating,
        user_name: currentUser?.name || userName || 'Kitobxon'
      };
      
      const res = await api.post('/books/comments', payload);
      setComments([res.data, ...comments]);
      setContent('');
      toast.success("Fikr saqlandi!");
    } catch {
      toast.error("Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await api.delete('/books/comments/' + commentId);
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
    <div className="bg-white dark:bg-black p-4 sm:p-8 rounded-[32px] font-sans border border-gray-100 dark:border-white/5">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Sharhlar
        </h3>
        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-bold text-gray-900 dark:text-white">
          ★ {averageRating}
        </span>
      </div>

      {/* Write a Review Box */}
      <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-900 p-5 sm:p-6 rounded-[24px] mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95"
              >
                <Star 
                  size={24} 
                  className={(hoverRating || rating) >= star ? 'fill-orange-500 text-orange-500' : 'fill-gray-300 text-gray-300 dark:fill-gray-700 dark:text-gray-700'} 
                />
              </button>
            ))}
          </div>

          {!currentUser && (
            <input
              type="text"
              placeholder="Ismingiz"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="px-4 py-2 rounded-full bg-white dark:bg-gray-800 border-none text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          )}
        </div>

        <textarea
          rows={3}
          required
          placeholder="Kitob haqida o'z fikringizni yozing..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-5 py-4 rounded-[20px] bg-white dark:bg-gray-800 border-none text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/50 resize-none placeholder:text-gray-400"
        />

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-transform active:scale-95 cursor-pointer shadow-lg shadow-orange-500/30 flex items-center gap-2"
          >
            <Send size={16} />
            <span>{isSubmitting ? "Yuborilmoqda..." : "Yuborish"}</span>
          </button>
        </div>
      </form>

      {/* Reviews Stream */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="py-12 text-center">
            <MessageSquare size={40} className="mx-auto mb-4 text-gray-300 dark:text-gray-700" />
            <p className="text-base font-medium text-gray-500 dark:text-gray-400">
              Hozircha sharhlar yo'q
            </p>
          </div>
        ) : (
          comments.map((c) => {
          const isOwner = currentUser?.id && c.user_id === currentUser.id;
          const isAdmin = currentUser?.role === 'ADMIN';

          return (
            <div 
              key={c.id} 
              className="p-5 sm:p-6 rounded-[24px] bg-gray-50 dark:bg-gray-900 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-sm">
                    {c.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        {c.user_name}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-gray-500 mt-0.5">
                      {c.created_at}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < (c.rating || 5) ? "fill-orange-500 text-orange-500" : "fill-gray-300 text-gray-300 dark:fill-gray-700 dark:text-gray-700"} />
                    ))}
                  </div>
                  {(isOwner || isAdmin) && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed pl-1 pt-2">
                {c.content}
              </p>
            </div>
          );
        })
        )}
      </div>

    </div>
  );
}