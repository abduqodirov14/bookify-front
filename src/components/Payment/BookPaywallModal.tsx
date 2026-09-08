import React, { useState, useEffect } from 'react';
import { api, getAuthToken } from '../../services/api';
import { 
  X, 
  Check, 
  ShieldCheck, 
  BookOpen, 
  Headphones, 
  Bookmark, 
  Crown, 
  ArrowRight, 
  Lock, 
  CreditCard,
  CheckCircle2
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface PaywallBook {
  id: string | number;
  title: string;
  author?: string;
  cover_url?: string;
  price?: number;
  is_premium?: boolean;
}

interface PaywallModalProps {
  book?: PaywallBook | null;
  initialTab?: 'book' | 'vip';
  onClose: () => void;
  onAccessGranted?: () => void;
  isAdmin?: boolean;
  onRequireAuth?: () => void;
}

interface Plan {
  id: 'vip_monthly' | 'vip_yearly';
  label: string;
  price: number;
  period: string;
  badge?: string;
  highlight?: boolean;
  perDay?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatPrice = (uzs: number) =>
  new Intl.NumberFormat('uz-UZ').format(uzs) + " so'm";

// ─── Component ───────────────────────────────────────────────────────────────
export default function BookPaywallModal({ 
  book, 
  initialTab = 'book', 
  onClose, 
  onAccessGranted, 
  isAdmin,
  onRequireAuth 
}: PaywallModalProps) {
  const [tab, setTab] = useState<'book' | 'vip'>(!book || initialTab === 'vip' ? 'vip' : 'book');
  const [selectedVipPlan, setSelectedVipPlan] = useState<'vip_monthly' | 'vip_yearly'>('vip_monthly');
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any>(null);
  const [error, setError] = useState('');

  // Load VIP plans
  useEffect(() => {
    api.getPaymentPlans().then(data => {
      if (data) setPlans(data);
    });
  }, []);

  const vipPlans: Plan[] = plans
    ? [
        {
          id: 'vip_monthly',
          label: '1 Oylik VIP A\'zolik',
          price: plans.vip_monthly?.price ?? 29000,
          period: '/ oy',
          badge: '🔥 Eng Ommabop',
          perDay: '~960 so\'m / kun'
        },
        {
          id: 'vip_yearly',
          label: '1 Yillik VIP (All-Inclusive)',
          price: plans.vip_yearly?.price ?? 249000,
          period: '/ yil',
          badge: '💎 30% Tejamkorlik',
          highlight: true,
          perDay: '~680 so\'m / kun'
        },
      ]
    : [
        { 
          id: 'vip_monthly', 
          label: '1 Oylik VIP A\'zolik', 
          price: 29000, 
          period: '/ oy', 
          badge: '🔥 Eng Ommabop',
          perDay: '~960 so\'m / kun'
        },
        {
          id: 'vip_yearly',
          label: '1 Yillik VIP (All-Inclusive)',
          price: 249000,
          period: '/ yil',
          badge: '💎 30% Tejamkorlik',
          highlight: true,
          perDay: '~680 so\'m / kun'
        },
      ];

  const isLoggedIn = Boolean(
    getAuthToken() ||
    (typeof window !== 'undefined' && (
      localStorage.getItem('fianny_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('bookify_token')
    ))
  );

  const handlePay = async (planType: 'book' | 'vip_monthly' | 'vip_yearly') => {
    setError('');
    const token = getAuthToken() || (typeof window !== 'undefined' 
      ? localStorage.getItem('fianny_token') || localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('bookify_token')
      : null);

    if (!token) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('bookify_pending_pay', JSON.stringify({
            planType,
            bookId: book ? String(book.id) : null
          }));
        } catch {}
      }
      if (onRequireAuth) {
        onRequireAuth();
      } else {
        setError("To'lovni amalga oshirish va xaridingizni hisobingizga biriktirish uchun avval tizimga kiring.");
      }
      return;
    }

    setLoading(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bookify-six-alpha.vercel.app';
      const returnUrl = `${origin}/?payment=success` + (planType === 'book' && book ? `&bookId=${book.id}` : `&plan=${planType}`);
      
      const payload: any = {
        plan_type: planType,
        return_url: returnUrl,
      };
      if (planType === 'book' && book) {
        payload.book_id = String(book.id);
      }

      const result = await api.createPaymentOrder(payload);
      if (result.success && result.pay_url) {
        window.location.href = result.pay_url;
      } else {
        setError(result.message || "To'lov sahifasini ochishda xatolik yuz berdi");
      }
    } catch (e: any) {
      setError(e.message || "To'lov yaratishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const activeVip = vipPlans.find(p => p.id === selectedVipPlan) || vipPlans[0];

  return (
    <div
      className="fixed inset-0 z-[1200] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 40px rgba(224, 86, 56, 0.1)'
        }}
      >
        {/* Luxury top accent gradient line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-[#E05638] to-amber-400" />

        {/* Header bar with close button */}
        <div className="px-6 pt-5 pb-4 relative border-b border-stone-100 dark:border-white/5">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Yopish"
          >
            <X size={18} />
          </button>

          {book ? (
            /* ── Book Mode Header ── */
            <div className="flex items-center gap-4 pr-8">
              <div className="relative shrink-0 w-14 h-20 rounded-xl overflow-hidden shadow-book border border-black/10 dark:border-white/10 bg-stone-100 dark:bg-white/5">
                {book.cover_url ? (
                  <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl bg-gradient-to-br from-amber-500/20 to-[#E05638]/20">
                    📖
                  </div>
                )}
                <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-black/30 to-transparent" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                    <span>💎</span>
                    <span>Premium Asar</span>
                  </span>
                </div>
                <h2 className="font-serif font-bold text-lg sm:text-xl text-stone-950 dark:text-white truncate">
                  {book.title}
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">
                  Muallif: <span className="font-medium text-stone-700 dark:text-stone-300">{book.author || "Klassik Muallif"}</span>
                </p>
              </div>
            </div>
          ) : (
            /* ── VIP Direct Header ── */
            <div className="text-center pt-2 pb-1 pr-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto mb-3 shadow-md">
                <Crown size={24} />
              </div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-stone-950 dark:text-white tracking-tight">
                Bookify VIP Obuna
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
                Barcha pullik sara asarlar, audio spektakllar va eksklyuziv imtiyozlarga cheksiz kirish
              </p>
            </div>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
          
          {/* Admin bypass banner if user is admin */}
          {isAdmin && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">👑</span>
                <div>
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-300">
                    Administrator Imtiyozi
                  </div>
                  <div className="text-[11px] text-amber-800/80 dark:text-amber-400/80 leading-tight">
                    InPay to'lovini sinashingiz yoki darhol bepul mutolaa qilishingiz mumkin
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onAccessGranted) onAccessGranted();
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shrink-0 transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Bepul O'qish</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}

          {/* Tab Switcher (if single book is being purchased) */}
          {book && (
            <div className="flex rounded-2xl p-1 bg-stone-100 dark:bg-white/5 border border-stone-200/80 dark:border-white/5">
              <button
                type="button"
                onClick={() => setTab('book')}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  tab === 'book'
                    ? 'bg-white dark:bg-[#1A202E] text-stone-950 dark:text-white shadow-sm font-bold border border-stone-200/60 dark:border-white/10'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <BookOpen size={15} className={tab === 'book' ? 'text-[#E05638]' : ''} />
                <span>Yagona Asar Xaridi</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('vip')}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  tab === 'vip'
                    ? 'bg-white dark:bg-[#1A202E] text-amber-600 dark:text-amber-400 shadow-sm font-bold border border-stone-200/60 dark:border-white/10'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Crown size={15} className={tab === 'vip' ? 'text-amber-500' : ''} />
                <span>VIP Cheksiz Obuna</span>
              </button>
            </div>
          )}

          {/* ── Tab 1: Single Book Purchase ── */}
          {tab === 'book' && book ? (
            <div className="space-y-4">
              {/* Pricing Plaque */}
              <div className="p-5 rounded-2xl bg-stone-50 dark:bg-white/[0.02] border border-stone-200/80 dark:border-white/10 text-center space-y-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#E05638] dark:text-amber-400">
                  Bir martalik to'lov • Umrbod cheksiz kirish
                </span>
                
                <div className="text-3xl sm:text-4xl font-serif font-black text-stone-950 dark:text-white">
                  {formatPrice(book.price || 15000)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pt-3 border-t border-stone-200/60 dark:border-white/5">
                  {[
                    { icon: BookOpen, text: "3D Readerda to'liq mutolaa" },
                    { icon: Bookmark, text: "Xatcho'p va xotira belgilari" },
                    { icon: Headphones, text: "Audio spektakl (mavjud bo'lsa)" },
                    { icon: ShieldCheck, text: "Umrbod shaxsiy javonda" },
                  ].map((perk, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300">
                      <perk.icon size={14} className="text-[#E05638] dark:text-amber-400 shrink-0" />
                      <span>{perk.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pay Button */}
              <button
                type="button"
                onClick={() => handlePay('book')}
                disabled={loading}
                className="w-full py-4 rounded-2xl font-bold text-sm sm:text-base text-white transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2.5 shadow-lg bg-gradient-to-r from-[#E05638] to-[#C74326] hover:brightness-105 shadow-[#E05638]/20"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-block animate-spin">⏳</span>
                    <span>InPay to'lov sahifasi ochilmoqda...</span>
                  </div>
                ) : !isLoggedIn ? (
                  <div className="flex items-center gap-2">
                    <Lock size={16} />
                    <span>Kirish / Ro'yxatdan O'tish (To'lov Uchun)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} />
                    <span>{formatPrice(book.price || 15000)} • InPay orqali to'lash</span>
                  </div>
                )}
              </button>
            </div>
          ) : (
            /* ── Tab 2: VIP Subscription Plans ── */
            <div className="space-y-4">
              <div className="space-y-3">
                {vipPlans.map(plan => {
                  const isSelected = selectedVipPlan === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedVipPlan(plan.id)}
                      className={`p-4 rounded-2xl transition-all cursor-pointer border flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                          : 'bg-stone-50 dark:bg-white/[0.02] border-stone-200/80 dark:border-white/10 hover:border-amber-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected 
                            ? 'border-amber-500 bg-amber-500 text-stone-950' 
                            : 'border-stone-300 dark:border-white/20'
                        }`}>
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-serif font-bold text-sm sm:text-base text-stone-950 dark:text-white">
                              {plan.label}
                            </span>
                            {plan.badge && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                plan.highlight
                                  ? 'bg-gradient-to-r from-amber-500 to-[#E05638] text-white shadow-xs'
                                  : 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                              }`}>
                                {plan.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                            {plan.perDay} • Barcha kitoblar va audio spektakllar
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-serif font-black text-base sm:text-lg text-amber-600 dark:text-amber-400">
                          {formatPrice(plan.price)}
                        </div>
                        <div className="text-[10px] font-mono text-stone-400">
                          {plan.period}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* VIP Perks */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-white/[0.02] border border-stone-200/80 dark:border-white/5 space-y-2">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
                  VIP A'zolik Imtiyozlari:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600 dark:text-stone-300">
                  {[
                    "👑 Barcha pullik asarlarga cheksiz kirish",
                    "🎧 Barcha audio spektakllar (HQ sifat)",
                    "📜 Rasmiy kitobxonlik sertifikatlari",
                    "🚀 Tezkor server va oflayn yuklash",
                    "🔖 Cheksiz xatcho'plar va qaydlar",
                    "💫 Har hafta yangi chiqadigan sara asarlar"
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* VIP Pay Button */}
              <button
                type="button"
                onClick={() => handlePay(selectedVipPlan)}
                disabled={loading}
                className="w-full py-4 rounded-2xl font-bold text-sm sm:text-base text-stone-950 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2.5 shadow-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 shadow-amber-500/20"
              >
                {loading ? (
                  <div className="flex items-center gap-2 text-stone-900">
                    <span className="inline-block animate-spin">⏳</span>
                    <span>InPay to'lov sahifasi ochilmoqda...</span>
                  </div>
                ) : !isLoggedIn ? (
                  <div className="flex items-center gap-2">
                    <Lock size={16} />
                    <span>Kirish / Ro'yxatdan O'tish (To'lov Uchun)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 font-extrabold">
                    <Crown size={18} />
                    <span>{formatPrice(activeVip.price)} • InPay orqali faollashtirish</span>
                  </div>
                )}
              </button>
            </div>
          )}

          {/* Error Message if any */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs text-center space-y-2">
              <div className="text-red-600 dark:text-red-400 font-semibold">
                ⚠️ {error}
              </div>
              {onRequireAuth && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRequireAuth();
                  }}
                  className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Tizimga Kirish / Ro'yxatdan O'tish ➔
                </button>
              )}
            </div>
          )}

          {/* Payment providers badge */}
          <div className="pt-2 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-[11px] text-stone-400 font-medium">Qo'llab-quvvatlanadi:</span>
              <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[10px] border border-blue-500/20">Click</span>
              <span className="px-2 py-0.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-[10px] border border-teal-500/20">Payme</span>
              <span className="px-2 py-0.5 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 font-bold text-[10px] border border-green-500/20">Paynet</span>
              <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-[10px] border border-purple-500/20">Humo / Uzcard</span>
            </div>
            <p className="text-[11px] text-stone-400 dark:text-stone-500 flex items-center justify-center gap-1">
              <ShieldCheck size={13} className="text-emerald-500 inline" />
              <span>InPay davlat litsenziyali to'lov shlyuzi orqali 100% himoyalangan</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
