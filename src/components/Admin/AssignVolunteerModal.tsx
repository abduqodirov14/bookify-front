import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Award, 
  X, 
  Shuffle, 
  CheckCircle2, 
  ShieldAlert, 
  Loader2, 
  Copy, 
  Check, 
  Sparkles,
  Bot,
  Mic,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

interface Props {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_ROLES = [
  "Bosh Ovozli Diktor & Madaniy Meros Volontyori",
  "Audiobook Muharriri & Sifat Nazoratchisi",
  "Nodir Qo'lyozmalar & Matn Korrektori",
  "Kutubxona & Jamiyat Koordinatori",
  "Raqamli Madaniyat va Yoshlar Elchisi"
];

export default function AssignVolunteerModal({ user, onClose, onSuccess }: Props) {
  const isAlreadyVolunteer = Boolean(user.is_volunteer || user.role === 'VOLUNTEER' || user.volunteer_code);
  
  const generateRandomCode = () => {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `VOL-${randomDigits}`;
  };

  const [volunteerCode, setVolunteerCode] = useState(user.volunteer_code || generateRandomCode());
  const [volunteerTitle, setVolunteerTitle] = useState(user.volunteer_title || PRESET_ROLES[0]);
  const [volunteerHours, setVolunteerHours] = useState<number>(user.volunteer_hours || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (!volunteerCode) return;
    navigator.clipboard.writeText(volunteerCode);
    setCopied(true);
    toast.success("Volontyorlik kodi nusxalandi!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = volunteerCode.trim().toUpperCase();
    if (!cleanCode) {
      toast.error("Iltimos, volontyorlik kodini kiriting!");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.assignVolunteer(user.id, {
        volunteer_code: cleanCode,
        volunteer_title: volunteerTitle.trim(),
        volunteer_hours: Number(volunteerHours) || 0
      });
      toast.success(`${user.name} ga "${cleanCode}" kodi bilan Volontyorlik maqomi berildi! 🤝`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Volontyorlik maqomini saqlashda xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async () => {
    if (!window.confirm(`Haqiqatan ham ${user.name} hisobidan Volontyorlik maqomini bekor qilmoqchimisiz?`)) {
      return;
    }

    setIsRevoking(true);
    try {
      await api.revokeVolunteer(user.id);
      toast.success(`${user.name} dan Volontyorlik maqomi bekor qilindi.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Bekor qilishda xatolik yuz berdi");
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-[#121620] border border-stone-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-stone-100 dark:border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <HeartHandshake size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-stone-950 dark:text-white">
                  Volontyorlik Maqomi va Kodi
                </h3>
                {isAlreadyVolunteer && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    Faol
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {user.name} • {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-white/10 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Telegram Notice */}
        <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-500/20 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
          <Bot size={18} className="shrink-0 text-[#24A1DE] mt-0.5" />
          <p className="leading-relaxed">
            Ushbu kod foydalanuvchining hisobiga biriktiriladi. Foydalanuvchi Telegram botimizda (<b>@book1fy_bot</b>) ushbu kodni yuborsa, unga audio yozish imkoniyati ochiladi.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Volunteer Code Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Volontyorlik Kodi (PIN):
              </label>
              <button
                type="button"
                onClick={() => setVolunteerCode(generateRandomCode())}
                className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Shuffle size={12} />
                <span>Yangi kod generatsiya qilish</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={volunteerCode}
                onChange={(e) => setVolunteerCode(e.target.value.toUpperCase())}
                placeholder="VOL-XXXXXX"
                required
                className="flex-1 px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-sm font-mono font-bold tracking-wider text-[#E05638] focus:outline-none focus:border-[#E05638] uppercase"
              />
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-white/5 hover:bg-stone-200 dark:hover:bg-white/10 border border-stone-200/80 dark:border-white/10 text-stone-600 dark:text-stone-300 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                title="Kodni nusxalash"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? "Nusxalandi" : "Nusxa"}</span>
              </button>
            </div>
          </div>

          {/* Volunteer Title / Specialization */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">
              Volontyorlik Yo'nalishi / Unvoni:
            </label>
            <input
              type="text"
              value={volunteerTitle}
              onChange={(e) => setVolunteerTitle(e.target.value)}
              placeholder="Masalan: Bosh Ovozli Diktor & Madaniy Meros Volontyori"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-[#E05638]"
            />

            {/* Quick title presets */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {PRESET_ROLES.map((pt) => (
                <button
                  type="button"
                  key={pt}
                  onClick={() => setVolunteerTitle(pt)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] transition-colors cursor-pointer border ${
                    volunteerTitle === pt
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 font-semibold'
                      : 'bg-stone-100 dark:bg-white/5 border-stone-200/60 dark:border-white/5 text-stone-500 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  {pt.split('&')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Volunteer Hours */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">
              Hisoblangan Xizmat Soatlari:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min="0"
                value={volunteerHours}
                onChange={(e) => setVolunteerHours(parseFloat(e.target.value) || 0)}
                className="w-28 px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono font-bold text-stone-900 dark:text-white focus:outline-none focus:border-[#E05638]"
              />
              <span className="text-xs text-stone-500">
                soat
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-stone-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
            {isAlreadyVolunteer ? (
              <button
                type="button"
                onClick={handleRevoke}
                disabled={isRevoking || isSubmitting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isRevoking ? <Loader2 size={13} className="animate-spin" /> : <ShieldAlert size={13} />}
                <span>Volontyorlikni Bekor Qilish</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-white/5 hover:bg-stone-200 dark:hover:bg-white/10 text-stone-600 dark:text-stone-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Bekor Qilish
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#E05638] hover:bg-[#c94529] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saqlanmoqda...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>Saqlash</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
