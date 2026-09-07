import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

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
  id: string;
  label: string;
  price: number;
  period?: string;
  badge?: string;
  highlight?: boolean;
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
          label: '1 Oylik VIP',
          price: plans.vip_monthly?.price ?? 29000,
          period: '/ oy',
          badge: '🔥 Mashhur',
        },
        {
          id: 'vip_yearly',
          label: '1 Yillik VIP',
          price: plans.vip_yearly?.price ?? 249000,
          period: '/ yil',
          badge: '💎 Tejamkor',
          highlight: true,
        },
      ]
    : [
        { id: 'vip_monthly', label: '1 Oylik VIP', price: 29000, period: '/ oy', badge: '🔥 Mashhur' },
        {
          id: 'vip_yearly',
          label: '1 Yillik VIP',
          price: 249000,
          period: '/ yil',
          badge: '💎 Tejamkor',
          highlight: true,
        },
      ];

  const handlePay = async (planType: 'book' | 'vip_monthly' | 'vip_yearly') => {
    setError('');
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('bookify_token')
      : null;

    if (!token) {
      setError("To'lovni amalga oshirish va xaridingizni saqlash uchun avval tizimga kiring.");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        plan_type: planType,
        return_url: typeof window !== 'undefined' ? `${window.location.origin}/?payment=success` : undefined,
      };
      if (planType === 'book' && book) {
        payload.book_id = String(book.id);
      }

      const result = await api.createPaymentOrder(payload);
      if (result.success && result.pay_url) {
        window.location.href = result.pay_url;
      } else {
        setError(result.message || "To'lov sahifasini ochishda xatolik");
      }
    } catch (e: any) {
      setError(e.message || "To'lov yaratishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[1200] flex items-center justify-center p-4"
        style={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(0,0,0,0.7)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Modal */}
        <div
          className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          {/* Top shimmer line */}
          <div
            style={{
              height: 3,
              background: 'linear-gradient(90deg, #f7971e, #ffd200, #f7971e)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s linear infinite',
            }}
          />

          {/* Header */}
          <div className="px-6 pt-6 pb-4 text-center relative">
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              aria-label="Yopish"
            >
              ✕
            </button>

            {/* Crown + Book cover / VIP Badge */}
            <div className="relative inline-block mb-3">
              {book ? (
                <div
                  className="w-20 h-20 rounded-2xl overflow-hidden mx-auto shadow-xl"
                  style={{ boxShadow: '0 0 30px rgba(247,151,30,0.4)' }}
                >
                  {book.cover_url ? (
                    <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-4xl"
                      style={{ background: 'linear-gradient(135deg, #f7971e, #ffd200)' }}
                    >
                      📚
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-xl text-4xl"
                  style={{ 
                    background: 'linear-gradient(135deg, #f7971e, #ffd200)',
                    boxShadow: '0 0 35px rgba(247,151,30,0.5)'
                  }}
                >
                  👑
                </div>
              )}
              {/* Crown overlay if book exists */}
              {book && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl"
                  style={{ filter: 'drop-shadow(0 0 8px #ffd200)' }}
                >
                  👑
                </div>
              )}
            </div>

            <h2 className="text-white font-bold text-xl leading-tight">
              {book ? book.title : "Bookify VIP Obuna"}
            </h2>
            <p className="text-white/60 text-xs sm:text-sm mt-1">
              {book ? (book.author || "Pullik Sara Asar") : "Barcha nodir kitoblar, audio spektakllar va AI maslahatchi"}
            </p>

            <div
              className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'linear-gradient(135deg, #f7971e33, #ffd20033)', color: '#ffd200', border: '1px solid #ffd20040' }}
            >
              💎 {book ? "Premium Kontent" : "Eksklyuziv Imtiyozlar"}
            </div>
          </div>

          {/* Admin bypass banner if user is admin */}
          {isAdmin && (
            <div className="mx-6 mb-3 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-center space-y-2">
              <div className="text-xs text-amber-300 font-bold flex items-center justify-center gap-1.5">
                <span>👑 Administrator Rejimi</span>
              </div>
              <p className="text-[11px] text-white/70">
                Siz sayt adminsiz — InPay to'lovini sinashingiz yoki bepul ochishingiz mumkin.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (onAccessGranted) onAccessGranted();
                }}
                className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/20 cursor-pointer"
              >
                Kitobni Admin sifatida ochish ➔
              </button>
            </div>
          )}

          {/* Tabs (only shown if a specific book is being purchased) */}
          {book && (
            <div className="px-6 pb-2">
              <div
                className="flex rounded-2xl p-1"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <button
                  onClick={() => setTab('book')}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                  style={
                    tab === 'book'
                      ? { background: 'linear-gradient(135deg, #f7971e, #ffd200)', color: '#000' }
                      : { color: 'rgba(255,255,255,0.5)' }
                  }
                >
                  📖 Bu Asar Xaridi
                </button>
                <button
                  onClick={() => setTab('vip')}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                  style={
                    tab === 'vip'
                      ? { background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff' }
                      : { color: 'rgba(255,255,255,0.5)' }
                  }
                >
                  👑 VIP Obuna
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-4">
            {tab === 'book' && book ? (
              /* ── Single Book Purchase ── */
              <div>
                <p className="text-white/70 text-sm text-center mb-4">
                  Faqat shu kitobni bir martalik to'lov bilan umrbod oching
                </p>

                <div
                  className="rounded-2xl p-5 text-center mb-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(247,151,30,0.15), rgba(255,210,0,0.08))',
                    border: '1px solid rgba(247,151,30,0.3)',
                  }}
                >
                  <div className="text-3xl font-black text-white mb-1">
                    {formatPrice(book.price || 15000)}
                  </div>
                  <div className="text-white/50 text-xs">bir martalik to'lov • abadiy kirish</div>

                  {/* Perks */}
                  <div className="mt-4 space-y-2 text-left">
                    {['📖 Butun kitobni 3D readerda o\'qish', '🔖 Sahifa belgisi qo\'yish', '🎧 Audio spektakllar (mavjud bo\'lsa)', '🔁 Istalgan vaqt cheksiz qayta kirish'].map(perk => (
                      <div key={perk} className="flex items-center gap-2 text-sm text-white/80">
                        <span className="text-green-400">✓</span>
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handlePay('book')}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-bold text-base text-black transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  style={{ background: loading ? '#999' : 'linear-gradient(135deg, #f7971e, #ffd200)', boxShadow: loading ? 'none' : '0 8px 24px rgba(247,151,30,0.4)' }}
                >
                  {loading ? '⏳ To\'lov sahifasi ochilmoqda...' : `💳 ${formatPrice(book.price || 15000)} • InPay orqali to'lash`}
                </button>
              </div>
            ) : (
              /* ── VIP Plans ── */
              <div>
                <p className="text-white/70 text-sm text-center mb-4">
                  Barcha pullik kitoblar va audio spektakllarga cheksiz kirish 👑
                </p>

                <div className="space-y-3 mb-4">
                  {vipPlans.map(plan => (
                    <button
                      key={plan.id}
                      onClick={() => handlePay(plan.id as any)}
                      disabled={loading}
                      className="w-full rounded-2xl p-4 text-left transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                      style={
                        plan.highlight
                          ? {
                              background: 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(236,72,153,0.15))',
                              border: '1.5px solid rgba(168,85,247,0.5)',
                            }
                          : {
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.12)',
                            }
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-bold text-sm">{plan.label}</span>
                            {plan.badge && (
                              <span
                                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                style={
                                  plan.highlight
                                    ? { background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff' }
                                    : { background: 'rgba(247,151,30,0.2)', color: '#f7971e' }
                                }
                              >
                                {plan.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-white/50 text-xs">
                            {plan.id === 'vip_monthly' ? '30 kun, barcha kitoblar' : '365 kun, 30% tejamkorlik'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className="font-black text-lg"
                            style={{ color: plan.highlight ? '#c084fc' : '#ffd200' }}
                          >
                            {formatPrice(plan.price)}
                          </div>
                          <div className="text-white/40 text-xs">{plan.period}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* VIP Perks */}
                <div
                  className="rounded-xl p-3 mb-4"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
                    {["👑 Barcha premium kitoblar", "🎧 Barcha audio spektakllar", "🚀 Tezkor yuklanish", "🔖 Cheksiz xatchoʻp", "📜 Sertifikatlar", "💫 Yangi kitoblar birinchi"].map(f => (
                      <div key={f} className="flex items-center gap-1.5">
                        <span className="text-green-400 text-base">✓</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Error & Auth CTA */}
            {error && (
              <div
                className="mt-3 p-3 rounded-2xl text-xs text-center space-y-2"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                <div className="text-red-300">⚠️ {error}</div>
                {onRequireAuth && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRequireAuth();
                    }}
                    className="w-full py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-all cursor-pointer border border-white/20"
                  >
                    Tizimga Kirish / Ro'yxatdan O'tish ➔
                  </button>
                )}
              </div>
            )}

            {/* Footer note */}
            <p className="text-center text-white/40 text-xs mt-4">
              🔒 To'lov InPay orqali xavfsiz amalga oshiriladi (Click, Payme, Humo, Uzcard)
            </p>
          </div>

          {/* Shimmer animation */}
          <style>{`
            @keyframes shimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}</style>
        </div>
      </div>
    </>
  );
}
