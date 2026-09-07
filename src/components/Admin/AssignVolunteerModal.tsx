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
  Headphones,
  FileCheck,
  Users,
  Compass,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

interface Props {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

interface RolePreset {
  id: string;
  title: string;
  desc: string;
  icon: any;
  badge: string;
}

const PRESET_ROLES: RolePreset[] = [
  {
    id: 'narrator',
    title: "Bosh Ovozli Diktor & Madaniy Meros Volontyori",
    desc: "Asarlarni to'liq ovozlashtiruvchi bosh suxandon",
    icon: Mic,
    badge: "OVOZLI DIKTOR"
  },
  {
    id: 'sound_editor',
    title: "Audiobook Muharriri & Sifat Nazoratchisi",
    desc: "Ovoz tozaligi, shovqin va audioboblarni montaj qiluvchi",
    icon: Headphones,
    badge: "AUDIO MUHARRIR"
  },
  {
    id: 'text_editor',
    title: "Nodir Qo'lyozmalar & Matn Korrektori",
    desc: "Klassik asarlarni solishtiruvchi va xatolarni tuzatuvchi",
    icon: FileCheck,
    badge: "MATN KORREKTOR"
  },
  {
    id: 'coordinator',
    title: "Kutubxona & Jamiyat Koordinatori",
    desc: "Volontyorlar jamoasini muvofiqlashtiruvchi yetakchi",
    icon: Users,
    badge: "KOORDINATOR"
  },
  {
    id: 'ambassador',
    title: "Raqamli Madaniyat va Yoshlar Elchisi",
    desc: "Loyiha targ'ibotchisi va yoshlar elchisi",
    icon: Compass,
    badge: "MADANIYAT ELCHISI"
  }
];

export default function AssignVolunteerModal({ user, onClose, onSuccess }: Props) {
  const isAlreadyVolunteer = Boolean(user.is_volunteer || user.role === 'VOLUNTEER' || user.volunteer_code);
  
  const generateRandomCode = () => {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `VOL-${randomDigits}`;
  };

  const [volunteerCode, setVolunteerCode] = useState(user.volunteer_code || generateRandomCode());
  const [volunteerTitle, setVolunteerTitle] = useState(user.volunteer_title || PRESET_ROLES[0].title);
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
      toast.success(`${user.name} ga "${cleanCode}" kodi bilan Volontyorlik maqomi berildi! 🤝🎉`);
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
      toast.success(`${user.name} dan Volontyorlik maqomi olib tashlandi.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Bekor qilishda xatolik yuz berdi");
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#121620] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto text-white">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C5A059] to-[#E05638] text-white flex items-center justify-center shrink-0 shadow-lg ring-2 ring-amber-500/20">
              <Award size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg sm:text-xl text-white">
                  Volontyorlik Maqomi & Shaxsiy Kod
                </h3>
                {isAlreadyVolunteer ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    FAOL VOLONTYOR
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    ODDIY KITOBXON
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 font-mono mt-0.5">
                {user.name} • {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── LIVE VIP CARD PREVIEW (What the user will see) ── */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059] font-bold block flex items-center gap-1.5">
            <Sparkles size={12} className="text-amber-400" />
            <span>Foydalanuvchiga taqdim etiladigan VIP Guvohnoma ko'rinishi (Live Preview):</span>
          </span>

          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1c1813] via-[#2a2219] to-[#120f0c] border border-amber-500/40 p-5 shadow-xl">
            {/* Subtle background ornamentation */}
            <div className="absolute right-0 top-0 w-48 h-48 bg-gradient-to-bl from-amber-500/10 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-[#E05638]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-[#E05638] to-[#C5A059] text-white font-bold flex items-center justify-center text-lg uppercase shadow-md ring-2 ring-amber-500/30 shrink-0">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    (user.name || 'V').charAt(0)
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif font-bold text-base text-white">
                      {user.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40">
                      VIP GUVOXNOMA
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/90 font-medium mt-0.5">
                    {volunteerTitle}
                  </p>
                  <p className="text-[11px] text-stone-400 font-mono">
                    {volunteerHours} akreditatsiyalangan soat
                  </p>
                </div>
              </div>

              {/* Code Plaque in preview */}
              <div className="bg-black/60 border border-amber-500/30 rounded-xl px-4 py-2 text-center sm:text-right shrink-0">
                <span className="text-[9px] font-mono text-amber-400/80 uppercase tracking-widest block font-semibold">
                  Shaxsiy PIN-Kod
                </span>
                <span className="font-mono text-base font-extrabold tracking-widest text-amber-300">
                  {volunteerCode || "VOL-XXXXXX"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Telegram Notice */}
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3 text-xs text-blue-200">
          <Bot size={20} className="shrink-0 text-[#24A1DE] mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-white">
              Telegram Bot (@book1fy_bot) bilan to'g'ridan-to'g'ri integratsiya:
            </p>
            <p className="text-stone-300 leading-relaxed text-[11px]">
              Foydalanuvchi Telegram botimizga ushbu kodni yuborgan zahoti, uning shaxsi tasdiqlanadi va tanlangan kitoblarga audio yozish imkoniyati darhol ochiladi.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Volunteer Code Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-stone-300 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-400" />
                <span>Volontyorlik Maxsus Kodi (PIN):</span>
              </label>
              <button
                type="button"
                onClick={() => setVolunteerCode(generateRandomCode())}
                className="text-[11px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Shuffle size={12} />
                <span>Kodni qayta generatsiya qilish</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={volunteerCode}
                onChange={(e) => setVolunteerCode(e.target.value.toUpperCase())}
                placeholder="VOL-XXXXXX"
                required
                className="flex-1 px-4 py-3 rounded-2xl bg-[#080B0F] border border-white/10 text-base font-mono font-bold tracking-widest text-[#E05638] focus:outline-none focus:border-[#C5A059] transition-colors uppercase"
              />
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                title="Kodni nusxalash"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                <span>{copied ? "Nusxalandi" : "Nusxa"}</span>
              </button>
            </div>
          </div>

          {/* Role / Specialization Preset Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-mono font-bold text-stone-300 block">
              Rasmiy Volontyorlik Yo'nalishi & Unvoni:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_ROLES.map((r) => {
                const Icon = r.icon;
                const isSelected = volunteerTitle === r.title;

                return (
                  <div
                    key={r.id}
                    onClick={() => setVolunteerTitle(r.title)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${
                      isSelected ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-white/10 text-stone-400'
                    }`}>
                      <Icon size={16} />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-semibold truncate ${isSelected ? 'text-amber-300' : 'text-stone-200'}`}>
                          {r.title.split('&')[0]}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-stone-400 shrink-0">
                          {r.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 leading-tight">
                        {r.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <input
              type="text"
              value={volunteerTitle}
              onChange={(e) => setVolunteerTitle(e.target.value)}
              placeholder="Yoki o'zingiz boshqa maxsus unvon yozing..."
              required
              className="w-full px-4 py-2.5 rounded-2xl bg-[#080B0F] border border-white/10 text-xs text-white focus:outline-none focus:border-[#C5A059] transition-colors mt-1"
            />
          </div>

          {/* Volunteer Hours Stepper */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-stone-300 block">
              Hisoblangan / Akreditatsiyalangan Xizmat Soatlari:
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-2xl bg-[#080B0F] border border-white/10 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setVolunteerHours(prev => Math.max(0, prev - 1))}
                  className="px-3 py-2 text-stone-400 hover:text-white hover:bg-white/5 font-mono text-sm cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={volunteerHours}
                  onChange={(e) => setVolunteerHours(parseFloat(e.target.value) || 0)}
                  className="w-20 py-2 text-center bg-transparent font-mono font-bold text-sm text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setVolunteerHours(prev => prev + 1)}
                  className="px-3 py-2 text-stone-400 hover:text-white hover:bg-white/5 font-mono text-sm cursor-pointer"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-stone-400 font-mono flex items-center gap-1">
                <Clock size={13} className="text-amber-400" />
                <span>akademik soat (audio yozish, tahrir va boshqa hissa)</span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            {isAlreadyVolunteer ? (
              <button
                type="button"
                onClick={handleRevoke}
                disabled={isRevoking || isSubmitting}
                className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isRevoking ? <Loader2 size={14} className="animate-spin" /> : <ShieldAlert size={14} />}
                <span>Volontyorlikni Bekor Qilish</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                Bekor Qilish
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-[#E05638] via-[#C5A059] to-[#E05638] hover:opacity-95 text-white text-xs font-mono font-bold transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saqlanmoqda...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Volontyor Maqomini Saqlash</span>
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
