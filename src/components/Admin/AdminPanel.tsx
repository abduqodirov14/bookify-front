import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Book, BookAudioTrack } from '../../types';
import { api, resolveAudioUrl } from '../../services/api';
import { BOOK_CATEGORIES, CATEGORY_GROUPS } from '../../data/categories';
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
  UserCheck,
  CheckCircle2,
  Music,
  Disc,
  Play,
  Pause,
  ListMusic,
  Volume2,
  AlertCircle,
  Loader2,
  ArrowUpCircle,
  Clock,
  Upload,
  ArrowRight,
  Headphones,
  Search,
  Tag,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Filter,
  Users,
  User,
  KeyRound,
  Lock,
  UserX,
  Mail,
  Calendar,
  EyeOff,
  Award,
  HeartHandshake,
  Mic
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import VolunteerCertificateModal, { CertificateData } from '../Certificate/VolunteerCertificateModal';
import AssignVolunteerModal from './AssignVolunteerModal';
import { calculateVolunteerPeriod } from '../../utils/dateUtils';

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
  const [tab, setTab] = useState<'dashboard' | 'users' | 'audio_moderation' | 'upload' | 'seasons' | 'comments'>('dashboard');
  
  // Registered Users State
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'VOLUNTEER' | 'USER' | 'ADMIN'>('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BANNED'>('ALL');

  // Audio Moderation Queue State
  const [pendingAudioTracks, setPendingAudioTracks] = useState<any[]>([]);
  const [isLoadingModerationTracks, setIsLoadingModerationTracks] = useState(false);
  const [audioModerationFilter, setAudioModerationFilter] = useState<'PENDING' | 'APPROVED' | 'ALL'>('PENDING');
  const [playingTrackUrl, setPlayingTrackUrl] = useState<string | null>(null);
  const [actionTrackId, setActionTrackId] = useState<string | null>(null);
  const moderationAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Volunteer Modal State
  const [volunteerModalUser, setVolunteerModalUser] = useState<any>(null);

  // Password Reset Modal State
  const [resetModalUser, setResetModalUser] = useState<any>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  // Book Upload State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Badiiy adabiyot');
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
  const [editIsPremium, setEditIsPremium] = useState(false);
  const [editPrice, setEditPrice] = useState(0);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [publishingBookId, setPublishingBookId] = useState<string | null>(null);

  // Audio Tracks Management inside Edit Modal
  const [bookAudioTracks, setBookAudioTracks] = useState<BookAudioTrack[]>([]);
  const [isLoadingAudioTracks, setIsLoadingAudioTracks] = useState(false);
  const [audioUploadQueue, setAudioUploadQueue] = useState<Array<{
    id: string;
    file: File;
    name: string;
    sizeMb: string;
    status: 'queued' | 'uploading' | 'done' | 'error';
    progress: number;
    errorMsg?: string;
  }>>([]);
  const [isUploadingAudioQueue, setIsUploadingAudioQueue] = useState(false);
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  // Live pipeline progress for PROCESSING books  { [bookId]: { progress, step_name, pages_processed, total_pages } }
  const [processingStatuses, setProcessingStatuses] = useState<Record<string, any>>({});

  // Category & Search Filters for Dashboard
  const [selectedCategory, setSelectedCategory] = useState<string>('Barchasi');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PUBLISHED' | 'READY' | 'PROCESSING' | 'NEEDS_RETRY'>('ALL');
  const [isCategoryExpanded, setIsCategoryExpanded] = useState<boolean>(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState<string>('');

  // Category counts across all books
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of books) {
      const cat = (b.category || '').trim();
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    }
    return counts;
  }, [books]);

  // Categories filtered by the category search input
  const visibleCategories = useMemo(() => {
    if (!categorySearchQuery.trim()) return BOOK_CATEGORIES;
    const q = categorySearchQuery.toLowerCase().trim();
    return BOOK_CATEGORIES.filter(c => c.toLowerCase().includes(q));
  }, [categorySearchQuery]);

  // Books filtered by category, status, and search query
  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      // Category match
      let catMatch = true;
      if (selectedCategory !== 'Barchasi') {
        const bCat = (b.category || '').toLowerCase();
        const sCat = selectedCategory.toLowerCase();
        catMatch = bCat === sCat || bCat.includes(sCat) || sCat.includes(bCat);
      }

      // Status match
      const statusMatch = selectedStatus === 'ALL' || b.status === selectedStatus;

      // Search match
      const q = searchQuery.toLowerCase().trim();
      const searchMatch = !q || 
        (b.title && b.title.toLowerCase().includes(q)) || 
        (b.authorName && b.authorName.toLowerCase().includes(q)) ||
        (b.category && b.category.toLowerCase().includes(q)) ||
        (b.narrator && b.narrator.toLowerCase().includes(q));

      return catMatch && statusMatch && searchMatch;
    });
  }, [books, selectedCategory, selectedStatus, searchQuery]);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handlePublishBook = async (bookId: string, bookTitle: string) => {
    setPublishingBookId(bookId);
    try {
      await api.publishBook(bookId);
      toast.success(`"${bookTitle}" kitobi ommaga muvaffaqiyatli chop etildi! 🎉`);
      onRefreshBooks();
    } catch (e: any) {
      toast.error(e.message || "Kitobni chop etishda xatolik");
    } finally {
      setPublishingBookId(null);
    }
  };

  const handleRetryBook = async (bookId: string, bookTitle: string) => {
    try {
      await api.retryBookPipeline(bookId);
      toast.success(`"${bookTitle}" kitobini qayta ishlash boshlandi! 🔄`);
      onRefreshBooks();
    } catch (e: any) {
      toast.error(e.message || "Qayta urinishda xatolik");
    }
  };

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

  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await onRefreshBooks();
      toast.success("Asarlar ro'yxati yangilandi! 🔄", { duration: 2000 });
    } finally {
      setTimeout(() => setIsManualRefreshing(false), 600);
    }
  };

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const data = await api.getAdminUsers();
      setAdminUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.warn("Failed to fetch admin users:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const fetchAudioModeration = useCallback(async () => {
    setIsLoadingModerationTracks(true);
    try {
      const data = await api.getAudioModerationQueue(audioModerationFilter);
      setPendingAudioTracks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed to fetch audio moderation queue:", err);
    } finally {
      setIsLoadingModerationTracks(false);
    }
  }, [audioModerationFilter]);

  const handleApproveAudio = async (trackId: string, trackTitle: string) => {
    setActionTrackId(trackId);
    try {
      const res = await api.approveAudioTrack(trackId);
      toast.success(res.message || `«${trackTitle}» tasdiqlandi va chop etildi! 🎉`);
      setPendingAudioTracks(prev => prev.filter(t => t.id !== trackId));
      onRefreshBooks();
    } catch (err: any) {
      toast.error(err.message || "Xatolik yuz berdi");
    } finally {
      setActionTrackId(null);
    }
  };

  const handleRejectAudio = async (trackId: string, trackTitle: string) => {
    if (!confirm(`Haqiqatan ham «${trackTitle}» audio trekini rad etmoqchimisiz?`)) return;
    setActionTrackId(trackId);
    try {
      await api.rejectAudioTrack(trackId);
      toast.success(`«${trackTitle}» rad etildi va o'chirildi`);
      setPendingAudioTracks(prev => prev.filter(t => t.id !== trackId));
      if (playingTrackUrl?.includes(trackId) && moderationAudioRef.current) {
        moderationAudioRef.current.pause();
        setPlayingTrackUrl(null);
      }
    } catch (err: any) {
      toast.error(err.message || "Xatolik yuz berdi");
    } finally {
      setActionTrackId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
    onRefreshBooks();
    fetchAudioModeration();
  }, [fetchUsers, onRefreshBooks, fetchAudioModeration]);

  useEffect(() => {
    if (tab === 'dashboard') {
      onRefreshBooks();
    } else if (tab === 'seasons') {
      fetchChallenges();
    } else if (tab === 'comments') {
      fetchAdminComments();
    } else if (tab === 'users') {
      fetchUsers();
    } else if (tab === 'audio_moderation') {
      fetchAudioModeration();
    }
  }, [tab, fetchUsers, onRefreshBooks, fetchAudioModeration]);

  // Periodic background check so newly uploaded books (e.g. from volunteers) appear live
  useEffect(() => {
    const interval = setInterval(() => {
      onRefreshBooks();
    }, 12000);
    return () => clearInterval(interval);
  }, [onRefreshBooks]);

  const isNewUser = useCallback((user: any) => {
    if (!user?.created_at) return false;
    try {
      const created = new Date(user.created_at).getTime();
      const now = Date.now();
      return (now - created) < 48 * 3600 * 1000;
    } catch {
      return false;
    }
  }, []);

  const formatUserDate = useCallback((dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('uz-UZ', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }, []);

  const filteredUsers = useMemo(() => {
    return adminUsers.filter(u => {
      const q = userSearchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        (u.name && u.name.toLowerCase().includes(q)) || 
        (u.email && u.email.toLowerCase().includes(q));
      
      const matchRole = userRoleFilter === 'ALL' || 
        (userRoleFilter === 'VOLUNTEER' 
          ? (u.role === 'VOLUNTEER' || u.is_volunteer || Boolean(u.volunteer_code)) 
          : u.role === userRoleFilter);
      const matchStatus = userStatusFilter === 'ALL' || (u.status || 'ACTIVE') === userStatusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [adminUsers, userSearchQuery, userRoleFilter, userStatusFilter]);

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser || !newPasswordInput.trim()) return;
    if (newPasswordInput.trim().length < 6) {
      toast.error("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }

    if (!window.confirm(`Haqiqatan ham ${resetModalUser.name} (${resetModalUser.email}) hisobi uchun yangi parol o'rnatmoqchimisiz?`)) {
      return;
    }

    setIsResettingPassword(true);
    try {
      await api.resetUserPassword(resetModalUser.id, newPasswordInput.trim());
      toast.success(`${resetModalUser.name} uchun yangi parol o'rnatildi! ✅`);
      setResetModalUser(null);
      setNewPasswordInput('');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Parolni o'zgartirishda xatolik yuz berdi");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleToggleUserStatus = async (user: any) => {
    if (user.is_admin || user.email?.toLowerCase() === 'abduqodirovdilshodbek317@gmail.com') {
      toast.error("Bosh administrator hisobini bloklash mumkin emas!");
      return;
    }
    setTogglingUserId(user.id);
    const isCurrentlyBanned = user.status === 'BANNED';
    try {
      await api.toggleUserStatus(user.id, !isCurrentlyBanned);
      toast.success(isCurrentlyBanned ? `${user.name} hisobi faollashtirildi! 🟢` : `${user.name} hisobi bloklandi! 🔴`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Statusni o'zgartirishda xatolik");
    } finally {
      setTogglingUserId(null);
    }
  };

  // ── Volunteer Certificate Generation State & Handlers ──
  const [certModalUser, setCertModalUser] = useState<any | null>(null);
  const [certRole, setCertRole] = useState('Bosh Ovozli Diktor & Madaniy Meros Volontyori');
  const [certHours, setCertHours] = useState('64 Akredited Hours (4 oy)');
  const [certImpact, setCertImpact] = useState("4 ta To'liq Kitob (48 ta audiobob)");
  const [certReach, setCertReach] = useState('12,500+ Kitobxonlar');
  const [certGrade, setCertGrade] = useState('Grade A+ (Distinguished)');
  const [certServicePeriod, setCertServicePeriod] = useState('2025-yil sentyabr — 2026-yil sentyabr (1 yil to\'liq faoliyat)');
  const [certCitation, setCertCitation] = useState('O\'zbek mumtoz va jahon adabiyoti durdonalaridan "O\'tkan kunlar" va "Qiyomat" asarlarini professional darajada ovozlashtirish, 22 ta audiobobni sifatli tayyorlash va Bookify milliy audio fondiga qo\'shishdagi namunali xizmatlari uchun.');
  const [certSelectedBooks, setCertSelectedBooks] = useState<string[]>(["O'tkan kunlar", "Qiyomat"]);
  const [isIssuingCert, setIsIssuingCert] = useState(false);
  const [previewCertData, setPreviewCertData] = useState<CertificateData | null>(null);

  const handleIssueCertificateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certModalUser) return;

    setIsIssuingCert(true);
    try {
      const res = await api.issueCertificate({
        user_id: certModalUser.id,
        recipient_name: certModalUser.name,
        role_title: certRole,
        accredited_hours: certHours,
        impact_summary: certImpact,
        audience_reach: certReach,
        quality_grade: certGrade,
        service_period: certServicePeriod,
        custom_citation: certCitation || undefined
      });

      toast.success(`${certModalUser.name} uchun rasmiy sertifikat berildi! 🎓✨`);
      const createdCert = res?.certificate;
      setCertModalUser(null);
      if (createdCert) {
        setPreviewCertData({
          ...createdCert,
          issued_by_name: "Dilshodbek Abduqodirov",
          editor_name: "Prof. Azamat Qosimov"
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Sertifikat berishda xatolik yuz berdi");
    } finally {
      setIsIssuingCert(false);
    }
  };

  // ── Auto-poll live progress for PROCESSING books every 2 seconds ──
  const pollProcessingBooks = useCallback(async () => {
    const processingBooks = books.filter(b => b.status === 'PROCESSING');
    if (processingBooks.length === 0) {
      setProcessingStatuses({});
      return;
    }
    const updates: Record<string, any> = {};
    await Promise.all(
      processingBooks.map(async (b) => {
        try {
          const st = await api.getBookStatus(b.id);
          if (st) updates[b.id] = st;
        } catch { /* silent */ }
      })
    );
    setProcessingStatuses(prev => ({ ...prev, ...updates }));
    // If any book just became READY/COMPLETED, refresh the books list
    const anyDone = Object.values(updates).some(
      s => s.status === 'COMPLETED' || s.book_status === 'READY' || s.book_status === 'NEEDS_RETRY'
    );
    if (anyDone) onRefreshBooks();
  }, [books, onRefreshBooks]);

  useEffect(() => {
    const hasProcessing = books.some(b => b.status === 'PROCESSING');
    if (hasProcessing) {
      pollProcessingBooks(); // immediate first poll
      pollingRef.current = setInterval(pollProcessingBooks, 2000);
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [books, pollProcessingBooks]);

  // Open Edit Modal & Load Audio Tracks
  const handleOpenEdit = (b: Book) => {
    setEditingBook(b);
    setEditTitle(b.title);
    setEditAuthor(b.authorName);
    setEditCategory(b.category || 'Mumtoz Meros');
    setEditPages(b.pages || 350);
    setEditNarrator(b.narrator || 'Afzal Rafiqov');
    setEditCoverUrl(b.coverImage || '');
    setEditDescription(b.description || '');
    setEditIsPremium(!!(b as any).is_premium);
    setEditPrice((b as any).price || 0);
    setAudioUploadQueue([]);
    setPreviewTrackId(null);
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    fetchAudioTracks(b.id);
  };

  const fetchAudioTracks = async (bookId: string) => {
    setIsLoadingAudioTracks(true);
    try {
      const tracks = await api.getBookAudioTracks(bookId);
      setBookAudioTracks(tracks || []);
    } catch {
      setBookAudioTracks([]);
    } finally {
      setIsLoadingAudioTracks(false);
    }
  };

  const handleAudioFilesPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems = Array.from(files).map((file, i) => ({
      id: `${Date.now()}_${i}_${Math.random().toString(36).slice(2, 7)}`,
      file,
      name: file.name,
      sizeMb: (file.size / (1024 * 1024)).toFixed(1),
      status: 'queued' as const,
      progress: 0
    }));

    // Natural sort: e.g. 07. Qiyomat, 08. Qiyomat, 21. Qiyomat
    newItems.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    setAudioUploadQueue(prev => [...prev, ...newItems]);
    e.target.value = '';
  };

  const handleStartSequentialAudioUpload = async () => {
    if (!editingBook || isUploadingAudioQueue) return;
    const pending = audioUploadQueue.filter(item => item.status !== 'done');
    if (pending.length === 0) {
      toast.error("Yuklash uchun yangi audio fayllar yo'q");
      return;
    }

    setIsUploadingAudioQueue(true);
    let successCount = 0;

    for (let i = 0; i < audioUploadQueue.length; i++) {
      const item = audioUploadQueue[i];
      if (item.status === 'done') continue;

      // Mark as uploading
      setAudioUploadQueue(prev => prev.map((q, idx) => idx === i ? { ...q, status: 'uploading', progress: 0 } : q));

      try {
        await api.uploadAudioTrack(
          editingBook.id,
          item.file,
          undefined, // backend auto extracts track number
          undefined, // backend auto extracts title
          editNarrator || 'Afzal Rafiqov',
          (percent) => {
            setAudioUploadQueue(prev => prev.map((q, idx) => idx === i ? { ...q, progress: percent } : q));
          }
        );

        setAudioUploadQueue(prev => prev.map((q, idx) => idx === i ? { ...q, status: 'done', progress: 100 } : q));
        successCount++;
      } catch (err: any) {
        setAudioUploadQueue(prev => prev.map((q, idx) => idx === i ? { ...q, status: 'error', errorMsg: err.message || 'Xatolik' } : q));
      }
    }

    setIsUploadingAudioQueue(false);
    toast.success(`${successCount} ta audio trek Telegram kabi ketma-ketlikda yuklandi! 🎧`);
    await fetchAudioTracks(editingBook.id);
    onRefreshBooks();
  };

  const handleDeleteAudioTrack = async (trackId: string, trackTitle: string) => {
    if (!editingBook) return;
    if (!confirm(`"${trackTitle}" audio trekini o'chirmoqchimisiz?`)) return;
    try {
      await api.deleteAudioTrack(editingBook.id, trackId);
      toast.success(`"${trackTitle}" treki o'chirildi`);
      if (previewTrackId === trackId && previewAudioRef.current) {
        previewAudioRef.current.pause();
        setPreviewTrackId(null);
      }
      await fetchAudioTracks(editingBook.id);
      onRefreshBooks();
    } catch (err: any) {
      toast.error(err.message || "Trekni o'chirishda xatolik");
    }
  };

  const handleTogglePreviewTrack = (track: BookAudioTrack) => {
    if (previewTrackId === track.id) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setPreviewTrackId(null);
    } else {
      setPreviewTrackId(track.id);
      if (previewAudioRef.current) {
        previewAudioRef.current.src = resolveAudioUrl(track.audioUrl);
        previewAudioRef.current.play().catch(() => {});
      }
    }
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
        description: editDescription,
        is_premium: editIsPremium,
        price: editIsPremium ? editPrice : 0
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

      // Handle cover image safely: if base64 data URL, convert to Blob file
      if (coverUrl.startsWith('data:image/')) {
        try {
          const arr = coverUrl.split(',');
          const mimeMatch = arr[0].match(/:(.*?);/);
          const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const coverBlob = new Blob([u8arr], { type: mime });
          const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
          formData.append('cover', coverBlob, `cover_${Date.now()}.${ext}`);
        } catch {
          formData.append('cover_image_url', coverUrl);
          formData.append('cover_image_val', coverUrl);
        }
      } else {
        formData.append('cover_image_url', coverUrl);
        formData.append('cover_image_val', coverUrl);
      }

      // Safe clean filename for multipart Content-Disposition (ASCII only, no quotes, no apostrophes)
      const safeBaseName = title.trim().replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').slice(0, 40) || 'book_content';

      if (uploadTextMode === 'text' && directTextContent.trim()) {
        const blob = new Blob([directTextContent.trim()], { type: 'text/plain;charset=utf-8' });
        formData.append('file', blob, `${safeBaseName}.txt`);
      } else if (bookFile) {
        const rawExt = bookFile.name.includes('.') ? bookFile.name.substring(bookFile.name.lastIndexOf('.')).toLowerCase() : '.pdf';
        const cleanFile = `${safeBaseName}${rawExt}`;
        formData.append('file', bookFile, cleanFile);
      } else {
        const blob = new Blob([
          `1-Bob: ${title}\n\nUshbu kitob muvaffaqiyatli chop etildi va ma'lumotlar bazasida to'liq saqlandi.`
        ], { type: 'text/plain;charset=utf-8' });
        formData.append('file', blob, `${safeBaseName}.txt`);
      }

      setUploadProgress(20);
      setUploadStage("Fayl qabul qilinmoqda (HTTP 202 Accepted)...");

      const res = await api.uploadBook(formData);
      const bookId = res?.book_id;

      if (bookId) {
        setUploadProgress(35);
        setUploadStage("Asinxron konveyer ishga tushirildi...");

        // Terminal statuses that stop polling
        const DONE_STATUSES = ['COMPLETED', 'PUBLISHED', 'READY', 'NEEDS_RETRY', 'FAILED'];
        let isDone = false;
        let attempts = 0;
        let finalBookStatus = '';

        while (!isDone && attempts < 120) {
          await new Promise(r => setTimeout(r, 1500));
          attempts++;
          try {
            const status = await api.getBookStatus(bookId);
            if (status) {
              // Map pipeline progress to UI progress bar (35 → 99)
              const rawProgress = status.progress || 35;
              setUploadProgress(Math.min(99, Math.max(35, rawProgress)));
              if (status.step_name) {
                const pagesInfo = status.total_pages > 0 
                  ? ` • ${status.pages_processed || 0}/${status.total_pages} bet` 
                  : '';
                setUploadStage(`${status.step_name}${pagesInfo}`);
              }
              // Check book-level status (not just job status)
              const bookStatusRes = await api.getBookStatus(bookId);
              finalBookStatus = bookStatusRes?.book_status || status.status;
              
              if (DONE_STATUSES.includes(status.status) || status.progress >= 100) {
                isDone = true;
              }
            }
          } catch {
            // Ignore transient polling errors, keep retrying
          }
        }
      }

      setUploadProgress(100);
      setUploadStage("Kitob muvaffaqiyatli qabul qilindi va konveyerdan o'tkazildi! ✅");
      await new Promise(r => setTimeout(r, 800));

      toast.success("Kitob READY holatida — Admin panelidagi ro'yxatdan Chop Etishingiz mumkin! 📚");
      
      setTitle('');
      setAuthor('');
      setDescription('');
      setBookFile(null);
      setDirectTextContent('');
      setUploadProgress(0);
      setIsUploading(false);
      setTab('dashboard');   // ← Dashboard'da kitoblar ro'yxati (READY + [Chop Etish] tugmasi ko'rinadi)
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
      await api.createChallenge({
        name: seasonName.trim(),
        description: seasonDesc.trim() || `${seasonName} — barcha kitobxonlar o'rtasida adabiy bellashuv.`,
        days_duration: seasonDays || 30
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-ink dark:text-parchment uppercase tracking-wider">
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
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-parchment tracking-tight">
            Bookify Boshqaruv Paneli
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/5 dark:bg-white/5 p-1 rounded-sm border border-stone-200/80 dark:border-white/10">
          <button
            onClick={() => setTab('dashboard')}
            className={`px-3 sm:px-4 py-2 rounded-sm text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              tab === 'dashboard' 
                ? 'bg-ink dark:bg-parchment text-parchment dark:text-ink font-bold shadow-sm' 
                : 'text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 hover:text-ink'
            }`}
          >
            <BookOpen size={14} />
            <span>Asarlar ({books.length})</span>
          </button>

          <button
            onClick={() => setTab('users')}
            className={`px-3 sm:px-4 py-2 rounded-sm text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              tab === 'users' 
                ? 'bg-ink dark:bg-parchment text-parchment dark:text-ink font-bold shadow-sm' 
                : 'text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 hover:text-ink'
            }`}
          >
            <Users size={14} />
            <span>Kitobxonlar ({adminUsers.length})</span>
          </button>

          <button
            onClick={() => setTab('audio_moderation')}
            className={`px-3 sm:px-4 py-2 rounded-sm text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              tab === 'audio_moderation' 
                ? 'bg-ink dark:bg-parchment text-parchment dark:text-ink font-bold shadow-sm' 
                : 'text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 hover:text-ink'
            }`}
          >
            <Mic size={14} />
            <span>Audio Moderatsiya</span>
            {pendingAudioTracks.filter(t => t.status === 'PENDING').length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-ink ml-1">
                {pendingAudioTracks.filter(t => t.status === 'PENDING').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab('comments')}
            className={`px-3 sm:px-4 py-2 rounded-sm text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              tab === 'comments' 
                ? 'bg-ink dark:bg-parchment text-parchment dark:text-ink font-bold shadow-sm' 
                : 'text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 hover:text-ink'
            }`}
          >
            <MessageSquare size={14} />
            <span>Taqrizlar & Fikrlar</span>
          </button>

          <button
            onClick={() => setTab('upload')}
            className={`px-3 sm:px-4 py-2 rounded-sm text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              tab === 'upload' 
                ? 'bg-ink dark:bg-parchment text-parchment dark:text-ink font-bold shadow-sm' 
                : 'text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 hover:text-ink'
            }`}
          >
            <UploadCloud size={14} />
            <span>Yangi Kitob</span>
          </button>

          <button
            onClick={() => setTab('seasons')}
            className={`px-3 sm:px-4 py-2 rounded-sm text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              tab === 'seasons' 
                ? 'bg-ink dark:bg-parchment text-parchment dark:text-ink font-bold shadow-sm' 
                : 'text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 hover:text-ink'
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-sm bg-parchment dark:bg-ink border border-black/10 dark:border-white/10 space-y-2 shadow-sm">
              <span className="text-xs font-mono text-ink/60 dark:text-parchment/60 uppercase">Jami Asarlar</span>
              <div className="font-serif text-3xl font-bold text-ink dark:text-parchment">{books.length} ta</div>
            </div>

            <button
              onClick={() => setTab('users')}
              className="p-6 rounded-sm bg-parchment dark:bg-ink border border-black/10 dark:border-white/10 space-y-2 shadow-sm text-left hover:border-ink dark:border-parchment/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-ink/60 dark:text-parchment/60 uppercase group-hover:text-ink dark:text-parchment transition-colors">Kitobxonlar</span>
                {adminUsers.filter(isNewUser).length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/5 dark:bg-white/5 text-emerald-500 border border-emerald-500/20">
                    +{adminUsers.filter(isNewUser).length} yangi
                  </span>
                )}
              </div>
              <div className="font-serif text-3xl font-bold text-ink dark:text-parchment flex items-center justify-between">
                <span>{adminUsers.length} nafar</span>
                <Users size={20} className="text-ink/60 dark:text-parchment/60 group-hover:text-ink dark:text-parchment transition-colors" />
              </div>
            </button>

            <div className="p-6 rounded-sm bg-parchment dark:bg-ink border border-black/10 dark:border-white/10 space-y-2 shadow-sm">
              <span className="text-xs font-mono text-ink/60 dark:text-parchment/60 uppercase">Faol Mavsumlar</span>
              <div className="font-serif text-3xl font-bold text-ink dark:text-parchment">
                {challengesList.filter(c => c.status === 'ACTIVE').length} ta
              </div>
            </div>

            <div className="p-6 rounded-sm bg-parchment dark:bg-ink border border-black/10 dark:border-white/10 space-y-2 shadow-sm">
              <span className="text-xs font-mono text-ink/60 dark:text-parchment/60 uppercase">Baza Holati</span>
              <div className="font-mono text-xs font-bold text-emerald-500 pt-3">● PostgreSQL 5432 / Cloud Ulangan</div>
            </div>
          </div>

          {/* ── RECENT REGISTERED USERS WIDGET (DASHBOARD PREVIEW) ── */}
          {adminUsers.length > 0 && (
            <div className="p-5 sm:p-6 rounded-sm bg-parchment dark:bg-ink border border-black/10 dark:border-white/10 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 dark:border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-sm bg-ink dark:bg-parchment/10 text-ink dark:text-parchment flex items-center justify-center">
                    <Users size={16} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-ink dark:text-parchment">
                      Ro'yxatdan O'tgan Kitobxonlar ({adminUsers.length} nafar)
                    </h3>
                    <p className="text-xs text-ink/60 dark:text-parchment/60">So'nggi qo'shilgan kitobxonlar va ularning hisoblari</p>
                  </div>
                </div>
                <button
                  onClick={() => setTab('users')}
                  className="text-xs font-mono font-bold text-ink dark:text-parchment hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <span>Barcha {adminUsers.length} kitobxonni ko'rish & boshqarish</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {adminUsers.slice(0, 4).map(u => (
                  <div 
                    key={u.id}
                    className="p-3.5 rounded-sm bg-black/5 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 flex items-center gap-3 hover:border-ink dark:border-parchment/30 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-ink dark:bg-parchment  text-parchment dark:text-ink font-bold flex items-center justify-center text-sm shrink-0 uppercase shadow-sm">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt={u.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        (u.name || u.email || 'U').charAt(0)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-serif font-bold text-xs text-ink dark:text-parchment truncate">
                          {u.name || "Nomsiz kitobxon"}
                        </span>
                        {isNewUser(u) && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                            Yangi
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 truncate">
                        {u.email}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                          u.is_admin || u.role === 'ADMIN'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                            : 'bg-black/5 dark:bg-white/5 text-blue-600 dark:text-blue-400'
                        }`}>
                          {u.is_admin || u.role === 'ADMIN' ? 'ADMIN' : 'KITOBXON'}
                        </span>
                        <span className="text-[10px] font-mono text-ink/60 dark:text-parchment/60">
                          {formatUserDate(u.created_at).split(',')[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── READY BOOKS ALERT BANNER ── */}
          {books.filter(b => b.status === 'READY').length > 0 && (
            <div className="p-5 rounded-sm bg-ink dark:bg-parchment from-emerald-500/20 via-teal-500/15 to-emerald-500/20 border-2 border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-sm bg-emerald-600 text-parchment dark:text-ink flex items-center justify-center shrink-0 shadow-md animate-bounce">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                    <span>Chop etishga tayyor asarlar mavjud!</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-emerald-600 text-parchment dark:text-ink font-mono font-bold">
                      {books.filter(b => b.status === 'READY').length} ta asar
                    </span>
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                    Ushbu asarlar konveyerdan to'liq o'tgan va tasdiqlangan. Ommaga e'lon qilish uchun quyidagi ro'yxatdan yashil <strong>[🚀 Chop Etish (Publish)]</strong> tugmasini bosing.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStatus('READY')}
                className="px-4 py-2 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-parchment dark:text-ink text-xs font-mono font-bold transition-all shadow-sm cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <span>Faqat Tayyor Asarlarni Ko'rish</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* ── LUXURY 40-CATEGORY & SEARCH FILTER BAR (HUMAN-MADE DESIGN) ── */}
          <div className="p-5 sm:p-6 rounded-sm bg-parchment dark:bg-ink border border-black/10 dark:border-white/10 space-y-4 shadow-sm">
            
            {/* Row 1: Search & Status Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              
              {/* Search Bar */}
              <div className="relative flex-1 max-w-xl">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/60 dark:text-parchment/60 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Asar nomi, muallif yoki janr bo'yicha tezkor qidiruv..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-sm bg-black/5 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 text-xs font-mono text-ink dark:text-parchment placeholder:text-ink/60 dark:text-parchment/60 focus:outline-none focus:border-ink dark:border-parchment transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/60 dark:text-parchment/60 hover:text-ink/60 dark:text-parchment/60 dark:hover:text-stone-200 p-0.5 cursor-pointer"
                    title="Tozalash"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Status Segmented Pills */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-sm bg-black/5 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 shrink-0">
                {[
                  { id: 'ALL', label: 'Barcha Holatlar' },
                  { id: 'PUBLISHED', label: 'Nashr qilingan' },
                  { id: 'READY', label: 'Tayyor (READY)' },
                  { id: 'PROCESSING', label: 'Konveyerda' }
                ].map(st => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStatus(st.id as any)}
                    className={`px-3 py-1.5 rounded-sm text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      selectedStatus === st.id
                        ? 'bg-ink dark:bg-parchment text-parchment dark:text-ink shadow-sm'
                        : 'text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 hover:text-ink dark:hover:text-parchment dark:text-ink'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Category Header with Count, Search & Expand/Collapse Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag size={15} className="text-ink dark:text-parchment" />
                <span className="text-xs font-serif font-bold text-ink dark:text-parchment">
                  Janrlar & Kategoriyalar
                </span>
                <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[10px] font-mono font-bold text-ink/60 dark:text-parchment/60">
                  40 ta janr
                </span>
                {selectedCategory !== 'Barchasi' && (
                  <button
                    onClick={() => setSelectedCategory('Barchasi')}
                    className="text-[11px] font-mono text-ink dark:text-parchment hover:underline cursor-pointer ml-1 inline-flex items-center gap-1"
                  >
                    <span>Filtr: <strong>{selectedCategory}</strong></span>
                    <span>✕</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Janr izlash */}
                <div className="relative">
                  <input
                    type="text"
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    placeholder="Janrni topish..."
                    className="w-36 sm:w-44 px-3 py-1.5 rounded-sm bg-black/5 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 text-[11px] font-mono text-ink dark:text-stone-200 placeholder:text-ink/60 dark:text-parchment/60 focus:outline-none focus:border-ink dark:border-parchment"
                  />
                  {categorySearchQuery && (
                    <button
                      onClick={() => setCategorySearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-ink/60 dark:text-parchment/60 hover:text-ink/60 dark:text-parchment/60 p-0.5"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Expand / Collapse All 40 Categories Toggle */}
                <button
                  type="button"
                  onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
                  className="px-3 py-1.5 rounded-sm bg-black/5 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-700 dark:text-ink/60 dark:text-parchment/60 text-[11px] font-mono font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <span>{isCategoryExpanded ? "Yig'ish" : "Barchasini ko'rsatish (40)"}</span>
                  {isCategoryExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>
            </div>

            {/* Row 3: 40 Categories Chips Bar */}
            <div className={`transition-all duration-300 ${
              isCategoryExpanded 
                ? "flex flex-wrap gap-2 pt-1" 
                : "flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700"
            }`}>
              {/* Barchasi Chip */}
              <button
                type="button"
                onClick={() => setSelectedCategory('Barchasi')}
                className={`px-3.5 py-1.5 rounded-sm text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === 'Barchasi'
                    ? 'bg-ink dark:bg-parchment text-parchment dark:text-ink shadow-sm ring-2 ring-[#E05638]/20 font-bold'
                    : 'bg-black/5 dark:bg-white/5 text-stone-700 dark:text-ink/60 dark:text-parchment/60 hover:bg-stone-200 dark:hover:bg-white/10 border border-stone-200/60 dark:border-white/5'
                }`}
              >
                <span>Barchasi</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  selectedCategory === 'Barchasi' ? 'bg-black/20 text-parchment dark:text-ink' : 'bg-stone-200 dark:bg-white/10 text-ink/60 dark:text-parchment/60'
                }`}>
                  {books.length}
                </span>
              </button>

              {/* 40 Categories Chips */}
              {visibleCategories.map(cat => {
                const count = categoryCounts[cat] || 0;
                const isSelected = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(isSelected ? 'Barchasi' : cat)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-mono transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-ink dark:bg-parchment text-parchment dark:text-ink shadow-sm ring-2 ring-[#E05638]/20 font-bold'
                        : count > 0
                        ? 'bg-black/5 dark:bg-white/5 text-amber-900 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 font-semibold'
                        : 'bg-black/5 dark:bg-white/5 text-stone-700 dark:text-ink/60 dark:text-parchment/60 hover:bg-stone-200 dark:hover:bg-white/10 border border-stone-200/60 dark:border-white/5'
                    }`}
                  >
                    <span>{cat}</span>
                    {count > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isSelected ? 'bg-black/20 text-parchment dark:text-ink' : 'bg-ink dark:bg-parchment text-parchment dark:text-ink'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Match Status Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-mono text-ink/60 dark:text-parchment/60 pt-1 border-t border-black/5 dark:border-white/5">
              <span>
                Tanlangan filtr: <strong className="text-stone-700 dark:text-stone-200">{selectedCategory}</strong>
                {selectedStatus !== 'ALL' && <span> • Holat: <strong className="text-stone-700 dark:text-stone-200">{selectedStatus}</strong></span>}
                {searchQuery && <span> • Qidiruv: "<strong className="text-ink dark:text-parchment">{searchQuery}</strong>"</span>}
              </span>
              <span>
                Mos keldi: <strong className="text-ink dark:text-parchment font-bold">{filteredBooks.length}</strong> / {books.length} ta asar
              </span>
            </div>

          </div>

          {/* Books Management Table */}
          <div className="bg-parchment dark:bg-ink border border-black/10 dark:border-white/10 rounded-sm overflow-hidden shadow-sm">
            <div className="p-6 border-b border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-ink dark:text-parchment">
                  Kutubxona Asarlari Ro'yxati
                </h3>
                <p className="text-xs text-ink/60 dark:text-parchment/60 mt-0.5">
                  Jami {books.length} ta asar • Ko'rsatilmoqda: {filteredBooks.length} ta asar
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleManualRefresh}
                  disabled={isManualRefreshing}
                  className="px-3 py-2 rounded-sm bg-black/5 dark:bg-white/10 text-stone-700 dark:text-ink/60 dark:text-parchment/60 hover:bg-stone-200 dark:hover:bg-white/20 transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Qayta yuklash (Serverdan yangilash)"
                >
                  <RefreshCw size={14} className={isManualRefreshing ? 'animate-spin text-emerald-600' : ''} />
                  <span className="text-[11px] font-mono hidden sm:inline">Yangilash</span>
                </button>
                <button
                  onClick={() => setTab('upload')}
                  className="px-4 py-2 rounded-sm bg-ink dark:bg-parchment text-parchment dark:text-ink text-xs font-bold font-mono uppercase cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Plus size={14} />
                  <span>Yangi Kitob Qo'shish</span>
                </button>
              </div>
            </div>

            {filteredBooks.length > 0 ? (
              <div className="divide-y divide-stone-100 dark:divide-white/5">
                {filteredBooks.map(b => (
                  <div key={b.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors">
                    
                    {/* Book Info with Real Cover Thumbnail */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-20 rounded-sm overflow-hidden shadow-md shrink-0 border border-black/10 relative group flex-shrink-0" style={{ background: b.spineColor || '#16213E' }}>
                        {b.coverImage ? (
                          <img
                            src={b.coverImage}
                            alt={b.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-base text-ink dark:text-parchment truncate">
                            {b.title}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-ink dark:bg-parchment/10 text-ink dark:text-parchment border border-ink dark:border-parchment/20 shrink-0">
                            {b.category || 'Mumtoz Meros'}
                          </span>
                          {b.status === 'READY' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/5 dark:bg-white/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                              TAYYOR (READY)
                            </span>
                          )}
                          {b.status === 'PROCESSING' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 shrink-0 animate-pulse">
                              KONVEYERDA...
                            </span>
                          )}
                          {b.status === 'NEEDS_RETRY' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/5 dark:bg-white/5 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                              QAYTA URINISH
                            </span>
                          )}
                          {(b as any).is_premium && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                              💎 PREMIUM {(b as any).price ? `• ${new Intl.NumberFormat('uz-UZ').format((b as any).price)} so'm` : ''}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-ink/60 dark:text-parchment/60 font-mono">
                          Muallif: <strong className="text-ink dark:text-ink/60 dark:text-parchment/60">{b.authorName}</strong> • {b.pages} bet • {b.narrator || 'Ovozli'}
                        </div>
                        <p className="text-xs text-ink/60 dark:text-parchment/60 line-clamp-1 max-w-xl">
                          {b.description}
                        </p>
                        {/* ── Live Pipeline Progress Bar for PROCESSING books ── */}
                        {b.status === 'PROCESSING' && (() => {
                          const ps = processingStatuses[b.id];
                          const pct = ps?.progress || 0;
                          const stepName = ps?.step_name || 'Konveyer ishga tushirilmoqda...';
                          const pagesDone = ps?.pages_processed || 0;
                          const totalPgs = ps?.total_pages || 0;
                          return (
                            <div className="mt-2 space-y-1 max-w-sm">
                              <div className="flex items-center justify-between text-[10px] font-mono text-ink/60 dark:text-parchment/60">
                                <span className="truncate max-w-[220px]">{stepName}</span>
                                <span className="shrink-0 ml-2 font-bold text-sky-500">
                                  {totalPgs > 0 ? `${pagesDone}/${totalPgs} bet` : `${pct}%`}
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-sky-500 transition-all duration-500"
                                  style={{ width: `${Math.max(5, pct)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Action Cluster (View, Publish, Retry, Edit, Delete) */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap sm:flex-nowrap">
                      {b.status === 'READY' && (
                        <button
                          onClick={() => handlePublishBook(b.id, b.title)}
                          disabled={publishingBookId === b.id}
                          className="px-4 py-2 rounded-sm bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-parchment dark:text-ink text-xs font-mono font-bold transition-all shadow-md hover:shadow-emerald-500/30 cursor-pointer flex items-center gap-2 shrink-0 border border-emerald-400/50 ring-2 ring-emerald-500/40 animate-pulse"
                          title="Ommaga rasman chop etish"
                        >
                          <CheckCircle2 size={16} />
                          <span>{publishingBookId === b.id ? "Chop etilmoqda..." : "🚀 Chop Etish (Publish)"}</span>
                        </button>
                      )}
                      {b.status === 'NEEDS_RETRY' && (
                        <button
                          onClick={() => handleRetryBook(b.id, b.title)}
                          className="px-3 py-2 rounded-sm bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-parchment dark:text-ink text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 border border-amber-500/30"
                          title="Konveyerni qayta ishga tushirish"
                        >
                          <RefreshCw size={14} />
                          <span>Qayta Urinish</span>
                        </button>
                      )}
                      {onNavigate && (
                        <button
                          onClick={() => onNavigate('reader', b.id)}
                          className="px-3 py-2 rounded-sm bg-black/5 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/20 text-ink dark:text-stone-200 text-xs font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                          title="Mutolaa qilish"
                        >
                          <Eye size={14} />
                          <span>Ko'rish</span>
                        </button>
                      )}

                      {/* Quick 1-Click VIP / Free Toggle */}
                      <button
                        onClick={async () => {
                          const newIsPrem = !(b as any).is_premium;
                          const defaultPrice = newIsPrem ? 15000 : 0;
                          const tId = toast.loading(newIsPrem ? "Pullik (VIP) qilinmoqda..." : "Bepul qilinmoqda...");
                          try {
                            await api.updateBook(b.id, {
                              is_premium: newIsPrem,
                              price: defaultPrice
                            });
                            toast.success(newIsPrem ? `"${b.title}" pullik (15 000 so'm) qilindi! 💎` : `"${b.title}" bepul qilindi! 🎁`, { id: tId });
                            onRefreshBooks();
                          } catch (e: any) {
                            toast.error(e.message || "Xatolik yuz berdi", { id: tId });
                          }
                        }}
                        className={`px-3 py-2 rounded-sm text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                          (b as any).is_premium
                            ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-black border border-amber-500/40'
                            : 'bg-black/5 dark:bg-white/10 text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 hover:bg-stone-200 dark:hover:bg-white/20'
                        }`}
                        title={(b as any).is_premium ? "Bepul qilish" : "Pullik (VIP) qilish"}
                      >
                        <span>{(b as any).is_premium ? "💎 VIP" : "🎁 Bepul"}</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="px-3 py-2 rounded-sm bg-black/5 dark:bg-white/5 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-parchment dark:text-ink text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                        title="Tahrirlash"
                      >
                        <Edit2 size={14} />
                        <span>Tahrirlash</span>
                      </button>

                      <button
                        onClick={() => handleDeleteBook(b.id, b.title)}
                        className="p-2 rounded-sm bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-parchment dark:text-ink transition-colors cursor-pointer"
                        title="O'chirish"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 sm:p-16 text-center space-y-4">
                <div className="w-14 h-14 rounded-sm bg-ink dark:bg-parchment/10 text-ink dark:text-parchment flex items-center justify-center mx-auto shadow-2xs">
                  <Tag size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-base text-ink dark:text-parchment">
                    {selectedCategory !== 'Barchasi' || selectedStatus !== 'ALL' || searchQuery
                      ? "Tanlangan filtrlar bo'yicha asarlar topilmadi"
                      : "Hozircha kutubxonada asarlar yuklanmagan"}
                  </h4>
                  <p className="text-xs text-ink/60 dark:text-parchment/60 font-mono max-w-md mx-auto leading-relaxed">
                    {selectedCategory !== 'Barchasi'
                      ? `"${selectedCategory}" janrida hozircha asar kiritilmagan. Yangi asar qo'shishingiz yoki filtrlarni tozalashingiz mumkin.`
                      : searchQuery
                      ? `"${searchQuery}" so'rovi bo'yicha birorta ham asar topilmadi.`
                      : "Yangi adabiy durdonalarni yuklash uchun quyidagi tugmani bosing."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {(selectedCategory !== 'Barchasi' || selectedStatus !== 'ALL' || searchQuery) && (
                    <button
                      onClick={() => { setSelectedCategory('Barchasi'); setSearchQuery(''); setSelectedStatus('ALL'); }}
                      className="px-4 py-2 rounded-sm bg-black/5 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/20 text-stone-700 dark:text-ink/60 dark:text-parchment/60 text-xs font-mono font-bold transition-colors cursor-pointer"
                    >
                      Filtrlarni tozalash ✕
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (selectedCategory !== 'Barchasi') setCategory(selectedCategory);
                      setTab('upload');
                    }}
                    className="px-5 py-2.5 rounded-sm bg-ink dark:bg-parchment text-parchment dark:text-ink text-xs font-mono font-bold uppercase shadow-sm hover:bg-[#c9452a] transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Yangi Kitob Qo'shish</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      
      {/* ── AUDIO MODERATION TAB ── */}
      {tab === 'audio_moderation' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header & Filter Card */}
          <div className="p-6 rounded-sm bg-parchment dark:bg-ink border border-black/10 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-ink dark:text-parchment">
                  Volontyorlar Audio Moderatsiyasi
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60">
                Volontyorlar tomonidan Studiyada yozilgan audioboblarni eshitib ko'rish, sifatini tekshirish va bir klik bilan saytda chop etish maydoni.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              {/* Filter */}
              <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-sm border border-stone-200/80 dark:border-white/10 text-xs">
                <button
                  onClick={() => setAudioModerationFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-sm font-semibold transition-colors cursor-pointer ${
                    audioModerationFilter === 'PENDING'
                      ? 'bg-ink dark:bg-parchment text-parchment dark:text-ink shadow-sm'
                      : 'text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 hover:text-ink'
                  }`}
                >
                  Kutilayotgan ({pendingAudioTracks.filter(t => t.status === 'PENDING').length})
                </button>
                <button
                  onClick={() => setAudioModerationFilter('APPROVED')}
                  className={`px-3 py-1.5 rounded-sm font-semibold transition-colors cursor-pointer ${
                    audioModerationFilter === 'APPROVED'
                      ? 'bg-emerald-600 text-parchment dark:text-ink shadow-sm'
                      : 'text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 hover:text-ink'
                  }`}
                >
                  Tasdiqlanganlar
                </button>
                <button
                  onClick={() => setAudioModerationFilter('ALL')}
                  className={`px-3 py-1.5 rounded-sm font-semibold transition-colors cursor-pointer ${
                    audioModerationFilter === 'ALL'
                      ? 'bg-stone-800 text-parchment dark:text-ink shadow-sm'
                      : 'text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 hover:text-ink'
                  }`}
                >
                  Barchasi
                </button>
              </div>

              <button
                onClick={fetchAudioModeration}
                disabled={isLoadingModerationTracks}
                className="p-2.5 rounded-sm bg-black/5 dark:bg-white/5 hover:bg-stone-200 dark:hover:bg-white/10 text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 transition-colors cursor-pointer border border-stone-200/80 dark:border-white/10"
                title="Yangilash"
              >
                <RefreshCw size={15} className={isLoadingModerationTracks ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Hidden Global Moderation Audio Element */}
          <audio
            ref={moderationAudioRef}
            src={playingTrackUrl ? resolveAudioUrl(playingTrackUrl) : undefined}
            onEnded={() => setPlayingTrackUrl(null)}
            className="hidden"
          />

          {/* Tracks List */}
          {isLoadingModerationTracks ? (
            <div className="p-16 text-center space-y-3 bg-parchment dark:bg-ink rounded-sm border border-black/10 dark:border-white/10">
              <Loader2 size={32} className="animate-spin text-ink dark:text-parchment mx-auto" />
              <p className="text-xs text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 font-medium">
                Moderatsiyadagi audio yozuvlar yuklanmoqda...
              </p>
            </div>
          ) : pendingAudioTracks.length === 0 ? (
            <div className="p-16 text-center space-y-3 bg-parchment dark:bg-ink rounded-sm border border-black/10 dark:border-white/10">
              <div className="w-16 h-16 rounded-sm bg-black/5 dark:bg-white/5 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="font-serif font-bold text-lg text-ink dark:text-parchment">
                Barcha Audio Yozuvlar Ko'rib Chiqilgan!
              </h3>
              <p className="text-xs text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 max-w-md mx-auto">
                Hozircha moderatsiyada kutilayotgan yangi audio treklar yo'q. Volontyorlar Studiyada ovoz yozganda bu yerda avtomatik paydo bo'ladi.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingAudioTracks.map(track => {
                const isPlaying = playingTrackUrl === track.audio_url;
                const durMin = Math.floor((track.duration_seconds || 0) / 60);
                const durSec = Math.floor((track.duration_seconds || 0) % 60);
                const durFormatted = `${durMin.toString().padStart(2, '0')}:${durSec.toString().padStart(2, '0')}`;
                const isActing = actionTrackId === track.id;

                return (
                  <div 
                    key={track.id}
                    className="p-5 sm:p-6 rounded-sm bg-parchment dark:bg-ink border border-black/10 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:border-ink dark:border-parchment/40"
                  >
                    {/* Left: Book thumbnail + Track Info */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      {/* Book Cover Miniature */}
                      <div className="w-12 h-16 rounded-sm bg-black/5 dark:bg-stone-800 border border-stone-200/80 dark:border-white/10 shrink-0 overflow-hidden shadow-sm relative">
                        {track.book_cover ? (
                          <img src={track.book_cover} alt={track.book_title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-serif font-bold text-ink dark:text-parchment">
                            📖
                          </div>
                        )}
                        <div className="book-spine-hinge" />
                      </div>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60">
                            Asar: <strong className="text-ink dark:text-parchment font-serif">{track.book_title}</strong>
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                            track.status === 'APPROVED'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25'
                              : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25'
                          }`}>
                            {track.status === 'APPROVED' ? '✅ Chop Etilgan' : '⏳ Moderatsiyada'}
                          </span>
                        </div>

                        <h3 className="font-serif font-bold text-base sm:text-lg text-ink dark:text-parchment truncate">
                          {track.title}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 flex-wrap">
                          <span className="flex items-center gap-1 text-ink dark:text-parchment font-medium">
                            <HeartHandshake size={13} />
                            <span>Diktor: {track.volunteer_name || track.narrator}</span>
                          </span>
                          <span>•</span>
                          <span className="font-mono">Davomiyligi: <strong>{durFormatted}</strong></span>
                          <span>•</span>
                          <span className="text-ink/60 dark:text-parchment/60">Hajmi: {((track.file_size_bytes || 0) / (1024 * 1024)).toFixed(1)} MB</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Audio Player & Action Buttons */}
                    <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap justify-end pt-3 md:pt-0 border-t md:border-t-0 border-black/5 dark:border-white/5">
                      
                      {/* Play / Listen Button */}
                      <button
                        onClick={() => {
                          if (!moderationAudioRef.current) return;
                          if (isPlaying) {
                            moderationAudioRef.current.pause();
                            setPlayingTrackUrl(null);
                          } else {
                            setPlayingTrackUrl(track.audio_url);
                            setTimeout(() => {
                              moderationAudioRef.current?.play().catch(() => {});
                            }, 50);
                          }
                        }}
                        className={`px-4 py-2.5 rounded-sm text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                          isPlaying
                            ? 'bg-ink dark:bg-parchment text-parchment dark:text-ink shadow-md'
                            : 'bg-black/5 dark:bg-white/10 text-ink dark:text-parchment hover:bg-stone-200 dark:hover:bg-white/15'
                        }`}
                      >
                        {isPlaying ? <Pause size={15} /> : <Play size={15} className="text-ink dark:text-parchment" />}
                        <span>{isPlaying ? "To'xtatish" : "Eshitib Ko'rish"}</span>
                      </button>

                      {/* Approve Button (if pending) */}
                      {track.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleApproveAudio(track.id, track.title)}
                          disabled={isActing}
                          className="px-4 py-2.5 rounded-sm bg-ink dark:bg-parchment  hover:brightness-105 text-parchment dark:text-ink text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isActing ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={15} />
                          )}
                          <span>Tasdiqlash & Chop Etish</span>
                        </button>
                      )}

                      {/* Reject Button */}
                      <button
                        onClick={() => handleRejectAudio(track.id, track.title)}
                        disabled={isActing}
                        className="px-3.5 py-2.5 rounded-sm bg-black/5 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 text-xs font-semibold transition-all border border-stone-200/80 dark:border-white/10 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                        title="Rad etish va o'chirish"
                      >
                        <Trash2 size={14} />
                        <span>Rad Etish</span>
                      </button>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}


      {/* ── 2. COMMENTS MODERATION TAB (WHO WROTE WHAT & WHEN) ── */}
      {tab === 'comments' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-parchment dark:bg-ink border border-black/10 dark:border-white/10 rounded-sm overflow-hidden shadow-sm">
            <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-ink dark:text-parchment flex items-center gap-2">
                  <MessageSquare size={18} className="text-ink dark:text-parchment" />
                  <span>Barcha Kitobxonlar Taqrizlari & Fikrlari</span>
                </h3>
                <p className="text-xs text-ink/60 dark:text-parchment/60 mt-0.5">
                  Platformadagi barcha fikr-mulohazalar xronologiyasi (Kim, qachon va nima yozganligi)
                </p>
              </div>
              <button
                onClick={fetchAdminComments}
                className="p-2.5 rounded-sm bg-black/5 dark:bg-white/10 text-stone-700 dark:text-ink/60 dark:text-parchment/60 hover:bg-stone-200 dark:hover:bg-white/20 transition-colors cursor-pointer"
                title="Qayta yuklash"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {adminComments.length > 0 ? (
              <div className="divide-y divide-stone-100 dark:divide-white/5">
                {adminComments.map((c) => (
                  <div key={c.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-serif font-bold text-sm text-ink dark:text-parchment">
                          {c.user_name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/5 dark:bg-white/10 text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60">
                          Asar: <strong className="text-ink dark:text-parchment">{c.book_title}</strong>
                        </span>
                        <span className="text-xs text-amber-500 flex items-center">
                          {Array.from({ length: c.rating || 5 }).map((_, i) => (
                            <Star key={i} size={12} className="fill-amber-400" />
                          ))}
                        </span>
                        <span className="text-[11px] font-mono text-ink/60 dark:text-parchment/60 ml-auto sm:ml-0">
                          ⏱️ {c.created_at}
                        </span>
                      </div>
                      <p className="text-sm text-stone-700 dark:text-ink/60 dark:text-parchment/60 leading-relaxed font-serif bg-black/5 dark:bg-white/[0.02] p-3 rounded-sm border border-stone-200/50 dark:border-white/5">
                        "{c.content}"
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteComment(c.book_id, c.id)}
                      className="p-2.5 rounded-sm bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-parchment dark:text-ink transition-colors cursor-pointer shrink-0 self-end sm:self-start"
                      title="O'chirish"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center text-xs text-ink/60 dark:text-parchment/60 font-mono">
                Hozircha hech qanday fikr-mulohaza qoldirilmagan.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 3. EDIT BOOK MODAL WITH LIVE COVER THUMBNAIL PREVIEW ── */}
      {editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-parchment dark:bg-ink border border-black/10 dark:border-white/10 rounded-sm p-6 sm:p-8 max-w-2xl w-full shadow-sm space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-sm bg-ink dark:bg-parchment/10 text-ink dark:text-parchment flex items-center justify-center">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-ink dark:text-parchment">
                    Kitobni Tahrirlash
                  </h3>
                  <span className="text-xs font-mono text-ink/60 dark:text-parchment/60">{editingBook.title}</span>
                </div>
              </div>
              <button
                onClick={() => setEditingBook(null)}
                className="p-2 rounded-sm bg-black/5 dark:bg-white/10 text-ink/60 dark:text-parchment/60 hover:text-ink dark:hover:text-parchment dark:text-ink cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-5">
              
              {/* Cover Live Preview & URL */}
              <div className="p-4 rounded-sm bg-black/5 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-28 rounded-sm overflow-hidden shadow-md bg-stone-900 shrink-0 border border-black/10">
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
                  <label className="text-xs font-mono text-stone-700 dark:text-ink/60 dark:text-parchment/60 font-bold block">
                    Muqova Rasmi URL (Thumbnail):
                  </label>
                  <input
                    type="url"
                    value={editCoverUrl}
                    onChange={(e) => setEditCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-sm bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-ink dark:text-parchment focus:outline-none focus:border-ink dark:border-parchment"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono text-ink/60 dark:text-parchment/60">Namunalar:</span>
                    {COVER_PRESETS.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setEditCoverUrl(p.url)}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-stone-200 dark:bg-white/10 hover:bg-ink dark:bg-parchment hover:text-parchment dark:text-ink transition-colors cursor-pointer"
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
                  <label className="text-xs font-mono text-stone-700 dark:text-ink/60 dark:text-parchment/60 font-bold block">
                    Kitob Nomi:
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-sm bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-sm font-serif font-bold text-ink dark:text-parchment focus:outline-none focus:border-ink dark:border-parchment"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-stone-700 dark:text-ink/60 dark:text-parchment/60 font-bold block">
                    Muallif:
                  </label>
                  <input
                    type="text"
                    required
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-sm bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-sm font-serif font-bold text-ink dark:text-parchment focus:outline-none focus:border-ink dark:border-parchment"
                  />
                </div>
              </div>

              {/* Category, Pages, Narrator */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-stone-700 dark:text-ink/60 dark:text-parchment/60 font-bold block">
                    Kategoriya:
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-sm bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-ink dark:text-parchment focus:outline-none focus:border-ink dark:border-parchment"
                  >
                    {CATEGORY_GROUPS.map(group => (
                      <optgroup key={group.name} label={`${group.icon} ${group.name}`}>
                        {group.items.map(item => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-stone-700 dark:text-ink/60 dark:text-parchment/60 font-bold block">
                    Sahifalar:
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editPages}
                    onChange={(e) => setEditPages(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-sm bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-ink dark:text-parchment focus:outline-none focus:border-ink dark:border-parchment"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-stone-700 dark:text-ink/60 dark:text-parchment/60 font-bold block">
                    Ovozlovchi:
                  </label>
                  <input
                    type="text"
                    value={editNarrator}
                    onChange={(e) => setEditNarrator(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-sm bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-ink dark:text-parchment focus:outline-none focus:border-ink dark:border-parchment"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-700 dark:text-ink/60 dark:text-parchment/60 font-bold block">
                  Asar Haqida (Tavsif):
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs leading-relaxed text-ink dark:text-parchment focus:outline-none focus:border-ink dark:border-parchment"
                />
              </div>

              {/* ── AUDIO SPEKTAKL & TREKLAR (TELEGRAM-STYLE BULK QUEUE) ── */}
              <div className="pt-5 border-t border-black/5 dark:border-white/5 space-y-4">
                
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-sm bg-black/5 dark:bg-white/5 text-amber-500 flex items-center justify-center">
                      <Headphones size={17} />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-ink dark:text-parchment">
                        Audio Spektakl & Treklar Boshqaruvi
                      </h4>
                      <p className="text-[11px] font-mono text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60">
                        {bookAudioTracks.length > 0 
                          ? `Bazada ${bookAudioTracks.length} ta audio qism mavjud` 
                          : "Kitobga yangi audio qismlarni biriktirish"}
                      </p>
                    </div>
                  </div>

                  {/* Hidden Preview Audio Player */}
                  <audio 
                    ref={previewAudioRef} 
                    onEnded={() => setPreviewTrackId(null)} 
                    onError={() => setPreviewTrackId(null)} 
                  />
                </div>

                {/* Bulk File Picker Box */}
                <div className="p-4 rounded-sm bg-amber-50/60 dark:bg-amber-500/5 border border-amber-200/80 dark:border-amber-500/20 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-serif font-bold text-amber-950 dark:text-amber-200 block">
                        📂 Ko'p qismli audiolarni biryo'la tanlash (Ctrl + A)
                      </span>
                      <p className="text-[11px] font-mono text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 mt-0.5">
                        Fayllarni barchasini birdan tanlang. Telegram kabi ketma-ket, serverni to'xtatmasdan yuklaydi.
                      </p>
                    </div>

                    <label className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sm bg-amber-500 hover:bg-amber-600 text-ink font-mono text-xs font-bold cursor-pointer transition-all shadow-sm active:scale-95 shrink-0">
                      <Upload size={14} />
                      <span>Fayllarni tanlash (Ctrl+A)</span>
                      <input
                        type="file"
                        multiple
                        accept="audio/*,.mp3,.m4a,.wav,.aac"
                        onChange={handleAudioFilesPicked}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Telegram-style Sequential Queue */}
                  {audioUploadQueue.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-amber-500/20 space-y-3">
                      
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-ink dark:text-stone-200">
                          Navbat: {audioUploadQueue.length} ta fayl ({audioUploadQueue.reduce((acc, q) => acc + parseFloat(q.sizeMb || '0'), 0).toFixed(1)} MB)
                        </span>

                        <div className="flex items-center gap-2">
                          {!isUploadingAudioQueue && (
                            <button
                              type="button"
                              onClick={() => setAudioUploadQueue([])}
                              className="text-[11px] text-ink/60 dark:text-parchment/60 hover:text-rose-500 transition-colors cursor-pointer"
                            >
                              Navbatni tozalash
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={isUploadingAudioQueue}
                            onClick={handleStartSequentialAudioUpload}
                            className="px-3.5 py-1.5 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-parchment dark:text-ink font-mono text-[11px] font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                          >
                            {isUploadingAudioQueue ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Yuklanmoqda...</span>
                              </>
                            ) : (
                              <>
                                <ArrowUpCircle size={13} />
                                <span>Telegram kabi yuklashni boshlash</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Queue List Cards */}
                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                        {audioUploadQueue.map((item, idx) => (
                          <div 
                            key={item.id}
                            className={`p-2.5 rounded-sm border text-xs font-mono transition-all ${
                              item.status === 'uploading'
                                ? 'bg-amber-100/70 dark:bg-amber-500/20 border-amber-400/60 dark:border-amber-400/40'
                                : item.status === 'done'
                                ? 'bg-emerald-50 dark:bg-black/5 dark:bg-white/5 border-emerald-300 dark:border-emerald-500/30 text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60'
                                : item.status === 'error'
                                ? 'bg-rose-50 dark:bg-black/5 dark:bg-white/5 border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-300'
                                : 'bg-white/80 dark:bg-[#080B0F]/80 border-stone-200 dark:border-white/10 text-stone-700 dark:text-ink/60 dark:text-parchment/60'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-5 h-5 rounded-md bg-stone-200 dark:bg-white/10 flex items-center justify-center text-[10px] shrink-0 font-bold">
                                  {idx + 1}
                                </span>
                                <span className="font-semibold truncate max-w-[220px] sm:max-w-xs">{item.name}</span>
                                <span className="text-[10px] text-ink/60 dark:text-parchment/60 shrink-0">({item.sizeMb} MB)</span>
                              </div>

                              <div className="shrink-0 flex items-center gap-1.5">
                                {item.status === 'queued' && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-200 dark:bg-white/10 text-ink/60 dark:text-parchment/60">
                                    ⏳ Navbatda
                                  </span>
                                )}
                                {item.status === 'uploading' && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500 text-ink font-bold animate-pulse">
                                    ⚡ {item.progress}%
                                  </span>
                                )}
                                {item.status === 'done' && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                    <CheckCircle2 size={11} />
                                    Yuklandi
                                  </span>
                                )}
                                {item.status === 'error' && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold" title={item.errorMsg}>
                                    ❌ Xatolik
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Progress bar inside uploading card */}
                            {item.status === 'uploading' && (
                              <div className="w-full bg-amber-200 dark:bg-amber-950/60 rounded-full h-1.5 mt-2 overflow-hidden">
                                <div 
                                  className="bg-amber-500 h-full rounded-full transition-all duration-150"
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                    </div>
                  )}

                </div>

                {/* Existing Tracks List from DB */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60">
                    <span>Mavjud audio treklar ro'yxati:</span>
                    {isLoadingAudioTracks && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-500">
                        <Loader2 size={11} className="animate-spin" />
                        Yuklanmoqda...
                      </span>
                    )}
                  </div>

                  {bookAudioTracks.length === 0 && !isLoadingAudioTracks ? (
                    <div className="py-4 text-center border border-dashed border-stone-200 dark:border-white/10 rounded-sm text-xs font-mono text-ink/60 dark:text-parchment/60">
                      Ushbu kitob uchun hali treklar mavjud emas. Yuqoridagi tugma orqali audio fayllarni yuklang.
                    </div>
                  ) : (
                    <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                      {bookAudioTracks.map((tr) => {
                        const isPreviewing = previewTrackId === tr.id;
                        const sizeMb = tr.fileSizeBytes ? (tr.fileSizeBytes / (1024 * 1024)).toFixed(1) : null;
                        return (
                          <div
                            key={tr.id}
                            className={`flex items-center justify-between p-2.5 rounded-sm border text-xs font-mono transition-all ${
                              isPreviewing
                                ? 'bg-ink dark:bg-parchment/10 border-ink dark:border-parchment/40 text-ink dark:text-parchment'
                                : 'bg-black/5 dark:bg-white/5 border-stone-200/80 dark:border-white/10 text-ink dark:text-stone-200'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-6 h-6 rounded-md bg-stone-200 dark:bg-white/10 flex items-center justify-center font-bold text-[10px] shrink-0">
                                #{tr.trackNumber}
                              </span>
                              <div className="min-w-0">
                                <p className="font-semibold truncate">{tr.title}</p>
                                <p className="text-[10px] text-ink/60 dark:text-parchment/60 truncate">
                                  {tr.narrator || editNarrator} {sizeMb && `• ${sizeMb} MB`}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* Audio Preview Play/Pause */}
                              <button
                                type="button"
                                onClick={() => handleTogglePreviewTrack(tr)}
                                className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
                                  isPreviewing
                                    ? 'bg-ink dark:bg-parchment text-parchment dark:text-ink'
                                    : 'bg-stone-200 dark:bg-white/10 text-stone-700 dark:text-ink/60 dark:text-parchment/60 hover:bg-stone-300 dark:hover:bg-white/20'
                                }`}
                                title={isPreviewing ? "To'xtatish" : "Eshitib ko'rish"}
                              >
                                {isPreviewing ? <Pause size={13} /> : <Play size={13} />}
                              </button>

                              {/* Delete Track */}
                              <button
                                type="button"
                                onClick={() => handleDeleteAudioTrack(tr.id, tr.title)}
                                className="p-1.5 rounded-sm bg-black/5 dark:bg-white/5 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-parchment dark:text-ink transition-colors cursor-pointer"
                                title="Trekni o'chirish"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* ── Premium Settings ───────────────────────────── */}
              <div
                className="rounded-sm p-4 mt-2"
                style={{
                  background: editIsPremium
                    ? 'linear-gradient(135deg, rgba(247,151,30,0.12), rgba(255,210,0,0.06))'
                    : 'rgba(255,255,255,0.03)',
                  border: editIsPremium ? '1px solid rgba(247,151,30,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Toggle row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💎</span>
                    <div>
                      <p className="text-sm font-bold text-ink dark:text-parchment">Premium Kontent</p>
                      <p className="text-xs text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60">Faqat to'lov amalga oshirilgandan so'ng o'qiladi</p>
                    </div>
                  </div>
                  {/* Custom Toggle */}
                  <button
                    type="button"
                    onClick={() => setEditIsPremium(v => !v)}
                    className="relative w-12 h-6 rounded-full transition-all duration-300 shrink-0 cursor-pointer"
                    style={{
                      background: editIsPremium
                        ? 'linear-gradient(135deg, #C5A059, #E05638)'
                        : 'rgba(0,0,0,0.15)',
                      border: editIsPremium ? 'none' : '1px solid rgba(0,0,0,0.2)',
                    }}
                  >
                    <span
                      className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300"
                      style={{ transform: editIsPremium ? 'translateX(24px)' : 'translateX(0)' }}
                    />
                  </button>
                </div>

                {/* Price input (shown when premium) */}
                {editIsPremium && (
                  <div className="mt-3 pt-3 border-t border-amber-200/20">
                    <label className="block text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1.5">
                      💰 Kitob narxi (so'm)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={1000}
                        step={500}
                        value={editPrice}
                        onChange={e => setEditPrice(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-sm bg-white/10 dark:bg-black/20 border border-amber-300/30 text-ink dark:text-parchment text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400/50 placeholder-stone-400"
                        placeholder="Masalan: 15000"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink/60 dark:text-parchment/60 dark:text-amber-500 font-semibold">
                        UZS
                      </span>
                    </div>
                    {editPrice > 0 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        = {new Intl.NumberFormat('uz-UZ').format(editPrice)} so'm
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  className="px-5 py-2.5 rounded-sm text-xs font-mono font-bold text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-6 py-2.5 rounded-sm bg-ink dark:bg-parchment hover:bg-[#C74326] text-parchment dark:text-ink text-xs font-mono font-bold uppercase transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
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
        <div className="bg-parchment dark:bg-ink border border-black/10 dark:border-white/10 rounded-sm p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-ink dark:bg-parchment/10 text-ink dark:text-parchment flex items-center justify-center">
              <UploadCloud size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-ink dark:text-parchment">
                Yangi Durdona Asar Yuklash
              </h3>
              <p className="text-xs text-ink/60 dark:text-parchment/60 font-mono">
                Asar fayli avtomatik matnga ajratiladi va PostgreSQL bazasiga to'liq yoziladi
              </p>
            </div>
          </div>

          <form onSubmit={handleBookSubmit} className="space-y-6">
            
            {/* Live Cover Thumbnail Preview with File Upload & Presets */}
            <div className="p-5 rounded-sm bg-black/5 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-24 h-34 rounded-sm overflow-hidden shadow-sm bg-stone-900 shrink-0 border border-black/10 relative">
                <img 
                  src={coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'} 
                  alt="Live Cover Preview" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-parchment dark:text-ink font-bold">
                  Ko'rinish
                </div>
              </div>
              <div className="space-y-3 flex-1 w-full">
                <label className="text-xs font-mono text-stone-700 dark:text-ink/60 dark:text-parchment/60 font-bold block">
                  Kitob Muqova Rasmi:
                </label>

                {/* File Upload for Cover Image */}
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-ink/60 dark:text-parchment/60 block">
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
                    className="w-full text-xs text-ink/60 dark:text-parchment/60 file:mr-3 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-ink dark:bg-parchment/10 file:text-ink dark:text-parchment hover:file:bg-ink dark:bg-parchment/20 cursor-pointer"
                  />
                </div>

                {/* URL Input */}
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-ink/60 dark:text-parchment/60 block">
                    🔗 Yoki rasm havolasini (URL) kiriting:
                  </span>
                  <input
                    type="url"
                    value={coverUrl.startsWith('data:') ? '' : coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3.5 py-2 rounded-sm bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-ink dark:text-parchment focus:outline-none focus:border-ink dark:border-parchment"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-mono text-ink/60 dark:text-parchment/60">Namunalar:</span>
                  {COVER_PRESETS.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCoverUrl(p.url)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-stone-200 dark:bg-white/10 hover:bg-ink dark:bg-parchment hover:text-parchment dark:text-ink transition-colors cursor-pointer"
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
                <label className="text-xs font-mono text-stone-700 dark:text-ink/60 dark:text-parchment/60 font-bold block">
                  Kitob Nomi: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Qiyomat"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-sm font-serif font-bold text-ink dark:text-parchment focus:outline-none focus:border-ink dark:border-parchment"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-700 dark:text-ink/60 dark:text-parchment/60 font-bold block">
                  Muallif: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Chingiz Aytmatov"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-sm font-serif font-bold text-ink dark:text-parchment focus:outline-none focus:border-ink dark:border-parchment"
                />
              </div>
            </div>

            {/* Category & Pages & Narrator */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-700 dark:text-ink/60 dark:text-parchment/60 font-bold block">
                  Kategoriya:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-ink dark:text-parchment focus:outline-none focus:border-ink dark:border-parchment"
                >
                  {CATEGORY_GROUPS.map(group => (
                    <optgroup key={group.name} label={`${group.icon} ${group.name}`}>
                      {group.items.map(item => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-700 dark:text-ink/60 dark:text-parchment/60 font-bold block">
                  Taxminiy Sahifalar:
                </label>
                <input
                  type="number"
                  min={1}
                  value={pages}
                  onChange={(e) => setPages(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-sm bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-ink dark:text-parchment focus:outline-none focus:border-ink dark:border-parchment"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-700 dark:text-ink/60 dark:text-parchment/60 font-bold block">
                  Audio Suhandon:
                </label>
                <input
                  type="text"
                  placeholder="Afzal Rafiqov"
                  value={narrator}
                  onChange={(e) => setNarrator(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-ink dark:text-parchment focus:outline-none focus:border-ink dark:border-parchment"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-stone-700 dark:text-ink/60 dark:text-parchment/60 font-bold block">
                Asar haqida qisqacha tavsif:
              </label>
              <textarea
                rows={3}
                placeholder="Ushbu asar insoniyat va tabiat o'rtasidagi munosabatlarni teran tasvirlaydi..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-sm bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs leading-relaxed text-ink dark:text-parchment focus:outline-none focus:border-ink dark:border-parchment"
              />
            </div>

            {/* File Upload Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-stone-700 dark:text-ink/60 dark:text-parchment/60 font-bold block">
                Kitob Matni / Qo'lyozmasi (PDF, EPUB, DOCX yoki TXT):
              </label>
              <div className="border-2 border-dashed border-stone-300 dark:border-white/20 rounded-sm p-6 text-center hover:border-ink dark:border-parchment transition-colors bg-black/5/50 dark:bg-white/[0.02]">
                <input
                  type="file"
                  id="book-file"
                  accept=".pdf,.epub,.docx,.txt"
                  onChange={(e) => setBookFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="book-file" className="cursor-pointer space-y-2 block">
                  <div className="w-12 h-12 rounded-sm bg-ink dark:bg-parchment/10 text-ink dark:text-parchment flex items-center justify-center mx-auto">
                    <FileText size={24} />
                  </div>
                  <div className="text-xs font-mono font-bold text-ink dark:text-stone-200">
                    {bookFile ? bookFile.name : "Faylni tanlash uchun bosing yoki bu yerga tashlang"}
                  </div>
                  <div className="text-[10px] font-mono text-ink/60 dark:text-parchment/60">
                    Agar fayl tanlanmasa, standart durdona boblar bilan yaratiladi
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
              <button
                type="button"
                onClick={() => setTab('dashboard')}
                className="px-6 py-3 rounded-sm text-xs font-mono font-bold text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-8 py-3.5 rounded-sm bg-ink dark:bg-parchment hover:bg-[#C74326] text-parchment dark:text-ink font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-2"
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
          <div className="bg-parchment dark:bg-ink border border-black/10 dark:border-white/10 rounded-sm p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-ink dark:bg-parchment/10 text-ink dark:text-parchment flex items-center justify-center">
                <Trophy size={20} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-ink dark:text-parchment">
                  Yangi Adabiy Mavsum Ochish
                </h3>
                <p className="text-xs text-ink/60 dark:text-parchment/60 font-mono">
                  Ishtirokchilar mutolaa qilgan vaqti va sahifalar soni bo'yicha chempionatda raqobatlashadi
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateSeason} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-mono text-stone-700 dark:text-ink/60 dark:text-parchment/60 font-bold block">
                    Mavsum Nomi:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Kuzgi Adabiy Chempionat 2026"
                    value={seasonName}
                    onChange={(e) => setSeasonName(e.target.value)}
                    className="w-full px-4 py-3 rounded-sm bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-ink dark:text-parchment focus:outline-none focus:border-ink dark:border-parchment"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-stone-700 dark:text-ink/60 dark:text-parchment/60 font-bold block">
                    Davomiyligi (kun):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={seasonDays}
                    onChange={(e) => setSeasonDays(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-sm bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-ink dark:text-parchment focus:outline-none focus:border-ink dark:border-parchment"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-700 dark:text-ink/60 dark:text-parchment/60 font-bold block">
                  Mavsum Tavsifi & Sovrin Jamg'armasi:
                </label>
                <input
                  type="text"
                  placeholder="15,000,000 UZS sovrin jamg'armasi va Oltin Meros diplomlari..."
                  value={seasonDesc}
                  onChange={(e) => setSeasonDesc(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm bg-white dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-ink dark:text-parchment focus:outline-none focus:border-ink dark:border-parchment"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isCreatingSeason}
                  className="px-6 py-3 rounded-sm bg-ink dark:bg-parchment hover:bg-[#C74326] text-parchment dark:text-ink font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Trophy size={14} />
                  <span>{isCreatingSeason ? "Ochilmoqda..." : "Mavsumni E'lon Qilish"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Challenges List */}
          <div className="bg-parchment dark:bg-ink border border-black/10 dark:border-white/10 rounded-sm overflow-hidden shadow-sm">
            <div className="p-6 border-b border-black/5 dark:border-white/5">
              <h3 className="font-serif text-lg font-bold text-ink dark:text-parchment">
                Barcha Mavsumlar
              </h3>
            </div>
            {challengesList.length > 0 ? (
              <div className="divide-y divide-stone-100 dark:divide-white/5">
                {challengesList.map(ch => (
                  <div key={ch.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-base text-ink dark:text-parchment">{ch.name}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          ch.status === 'ACTIVE' 
                            ? 'bg-black/5 dark:bg-white/5 text-emerald-500 border border-emerald-500/20' 
                            : 'bg-black/50/10 text-ink/60 dark:text-parchment/60'
                        }`}>
                          {ch.status}
                        </span>
                      </div>
                      <p className="text-xs text-ink/60 dark:text-parchment/60 mt-1">{ch.description}</p>
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
                        className="px-4 py-2 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-parchment dark:text-ink text-xs font-mono font-bold uppercase cursor-pointer"
                      >
                        Mavsumni Yakunlash & G'oliblarni E'lon Qilish
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-ink/60 dark:text-parchment/60 font-mono">
                Hozircha hech qanday mavsum mavjud emas.
              </div>
            )}
          </div>

        </div>
      )}

      {/* ── 5. REGISTERED USERS MANAGEMENT VIEW ── */}
      {tab === 'users' && (
        <div className="space-y-6">
          
          {/* Top KPI Cards for Users */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-sm bg-parchment dark:bg-ink border border-black/10 dark:border-white/10 space-y-2 shadow-sm">
              <span className="text-xs font-mono text-ink/60 dark:text-parchment/60 uppercase">Jami Ro'yxatdan O'tganlar</span>
              <div className="font-serif text-3xl font-bold text-ink dark:text-parchment flex items-center justify-between">
                <span>{adminUsers.length} nafar</span>
                <Users size={22} className="text-ink dark:text-parchment" />
              </div>
            </div>

            <div className="p-6 rounded-sm bg-parchment dark:bg-ink border border-black/10 dark:border-white/10 space-y-2 shadow-sm">
              <span className="text-xs font-mono text-ink/60 dark:text-parchment/60 uppercase">Yangi Kitobxonlar (48s)</span>
              <div className="font-serif text-3xl font-bold text-emerald-500 flex items-center justify-between">
                <span>{adminUsers.filter(isNewUser).length} nafar</span>
                <Sparkles size={22} className="text-emerald-500" />
              </div>
            </div>

            <div className="p-6 rounded-sm bg-parchment dark:bg-ink border border-black/10 dark:border-white/10 space-y-2 shadow-sm">
              <span className="text-xs font-mono text-ink/60 dark:text-parchment/60 uppercase">Faol Hisoblar</span>
              <div className="font-serif text-3xl font-bold text-blue-500 flex items-center justify-between">
                <span>{adminUsers.filter(u => (u.status || 'ACTIVE') === 'ACTIVE').length} nafar</span>
                <UserCheck size={22} className="text-blue-500" />
              </div>
            </div>

            <div className="p-6 rounded-sm bg-parchment dark:bg-ink border border-black/10 dark:border-white/10 space-y-2 shadow-sm">
              <span className="text-xs font-mono text-ink/60 dark:text-parchment/60 uppercase">Administratorlar</span>
              <div className="font-serif text-3xl font-bold text-purple-500 flex items-center justify-between">
                <span>{adminUsers.filter(u => u.is_admin || u.role === 'ADMIN').length} nafar</span>
                <ShieldCheck size={22} className="text-purple-500" />
              </div>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="p-5 sm:p-6 rounded-sm bg-parchment dark:bg-ink border border-black/10 dark:border-white/10 space-y-4 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* Search Box */}
              <div className="relative flex-1 max-w-lg">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/60 dark:text-parchment/60 pointer-events-none" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Ism, familiya yoki email orqali qidirish..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-sm bg-black/5 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 text-xs font-mono text-ink dark:text-parchment placeholder:text-ink/60 dark:text-parchment/60 focus:outline-none focus:border-ink dark:border-parchment transition-colors"
                />
                {userSearchQuery && (
                  <button
                    onClick={() => setUserSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/60 dark:text-parchment/60 hover:text-ink/60 dark:text-parchment/60 dark:hover:text-stone-200 p-0.5 cursor-pointer"
                    title="Tozalash"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filters & Refresh */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Role Filter */}
                <div className="flex items-center gap-1 p-1 rounded-sm bg-black/5 dark:bg-white/5 border border-stone-200/80 dark:border-white/10">
                  {(['ALL', 'VOLUNTEER', 'USER', 'ADMIN'] as const).map(role => (
                    <button
                      key={role}
                      onClick={() => setUserRoleFilter(role)}
                      className={`px-3 py-1.5 rounded-sm text-[11px] font-mono font-bold transition-all cursor-pointer ${
                        userRoleFilter === role
                          ? 'bg-ink dark:bg-parchment text-parchment dark:text-ink shadow-sm'
                          : 'text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 hover:text-ink dark:hover:text-parchment dark:text-ink'
                      }`}
                    >
                      {role === 'ALL' ? 'Barcha Rollar' : role === 'VOLUNTEER' ? 'Volontyorlar' : role === 'ADMIN' ? 'Adminlar' : 'Kitobxonlar'}
                    </button>
                  ))}
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1 p-1 rounded-sm bg-black/5 dark:bg-white/5 border border-stone-200/80 dark:border-white/10">
                  {(['ALL', 'ACTIVE', 'BANNED'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setUserStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-sm text-[11px] font-mono font-bold transition-all cursor-pointer ${
                        userStatusFilter === st
                          ? 'bg-ink dark:bg-parchment text-parchment dark:text-ink shadow-sm'
                          : 'text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 hover:text-ink dark:hover:text-parchment dark:text-ink'
                      }`}
                    >
                      {st === 'ALL' ? 'Barchasi' : st === 'ACTIVE' ? 'Faollar' : 'Bloklanganlar'}
                    </button>
                  ))}
                </div>

                {/* Refresh Button */}
                <button
                  onClick={fetchUsers}
                  disabled={isLoadingUsers}
                  className="p-2.5 rounded-sm bg-black/5 dark:bg-white/5 hover:bg-stone-200 dark:hover:bg-white/10 text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 transition-colors cursor-pointer border border-stone-200/80 dark:border-white/10"
                  title="Ro'yxatni yangilash"
                >
                  <RefreshCw size={15} className={isLoadingUsers ? "animate-spin text-ink dark:text-parchment" : ""} />
                </button>
              </div>

            </div>
          </div>

          {/* Users Table */}
          <div className="bg-parchment dark:bg-ink border border-black/10 dark:border-white/10 rounded-sm overflow-hidden shadow-sm">
            <div className="p-6 border-b border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif text-lg font-bold text-ink dark:text-parchment flex items-center gap-2">
                  <span>Ro'yxatdan O'tgan Kitobxonlar</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs bg-black/5 dark:bg-white/10 text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 font-mono">
                    {filteredUsers.length} / {adminUsers.length}
                  </span>
                </h3>
                <p className="text-xs text-ink/60 dark:text-parchment/60 mt-0.5">
                  Foydalanuvchilar hisoblari, rollari, xavfsizlik sozlamalari va parollarni boshqarish
                </p>
              </div>
            </div>

            {isLoadingUsers ? (
              <div className="p-12 text-center space-y-3">
                <Loader2 size={32} className="animate-spin text-ink dark:text-parchment mx-auto" />
                <p className="text-xs font-mono text-ink/60 dark:text-parchment/60">Kitobxonlar ro'yxati yuklanmoqda...</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/5 dark:border-white/5 bg-black/5/50 dark:bg-white/[0.02] text-[11px] font-mono uppercase tracking-wider text-ink/60 dark:text-parchment/60">
                      <th className="py-3.5 px-6 font-bold">Foydalanuvchi</th>
                      <th className="py-3.5 px-6 font-bold">Rol</th>
                      <th className="py-3.5 px-6 font-bold">Holat</th>
                      <th className="py-3.5 px-6 font-bold">Xavfsizlik (2FA)</th>
                      <th className="py-3.5 px-6 font-bold">Qo'shilgan Sana</th>
                      <th className="py-3.5 px-6 font-bold text-right">Boshqaruv</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-white/5 text-xs font-mono">
                    {filteredUsers.map((u) => {
                      const isSuperAdmin = u.is_admin || u.email?.toLowerCase() === 'abduqodirovdilshodbek317@gmail.com';
                      const isBanned = u.status === 'BANNED';
                      const isToggling = togglingUserId === u.id;

                      return (
                        <tr key={u.id} className="hover:bg-black/5/70 dark:hover:bg-white/[0.02] transition-colors">
                          
                          {/* User Name & Email */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-ink dark:bg-parchment  text-parchment dark:text-ink font-bold flex items-center justify-center text-sm shrink-0 uppercase shadow-sm">
                                {u.avatar_url ? (
                                  <img src={u.avatar_url} alt={u.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  (u.name || u.email || 'U').charAt(0)
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-serif font-bold text-sm text-ink dark:text-parchment truncate">
                                    {u.name || "Nomsiz foydalanuvchi"}
                                  </span>
                                  {isNewUser(u) && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                      YANGI
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-ink/60 dark:text-parchment/60 flex items-center gap-1 mt-0.5">
                                  <Mail size={12} className="shrink-0 text-ink/60 dark:text-parchment/60" />
                                  <span className="truncate">{u.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-4 px-6">
                            {isSuperAdmin || u.role === 'ADMIN' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                                <ShieldCheck size={13} />
                                <span>ADMIN</span>
                              </span>
                            ) : (u.role === 'VOLUNTEER' || u.is_volunteer || u.volunteer_code) ? (
                              <div className="flex flex-col gap-1 items-start">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                  <Award size={13} />
                                  <span>VOLONTYOR</span>
                                </span>
                                {u.volunteer_code && (
                                  <span className="font-mono text-[10px] font-semibold text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-md border border-stone-200/60 dark:border-white/10">
                                    {u.volunteer_code}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                                <BookOpen size={13} />
                                <span>KITOBXON</span>
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6">
                            {isBanned ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                <span>BLOKLANGAN</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>FAOL</span>
                              </span>
                            )}
                          </td>

                          {/* 2FA Status */}
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                              <CheckCircle2 size={14} />
                              <span>Himoyalangan (OTP)</span>
                            </span>
                          </td>

                          {/* Registration Date */}
                          <td className="py-4 px-6 text-ink/60 dark:text-parchment/60">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} className="text-ink/60 dark:text-parchment/60 shrink-0" />
                              <span>{formatUserDate(u.created_at)}</span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Assign Volunteer Button */}
                              <button
                                onClick={() => setVolunteerModalUser(u)}
                                className="px-3 py-1.5 rounded-sm bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                title="Volontyorlik kodi va maqomini belgilash"
                              >
                                <HeartHandshake size={13} />
                                <span className="hidden sm:inline">Volontyor</span>
                              </button>

                              {/* Issue Certificate Button */}
                              <button
                                onClick={() => {
                                  setCertModalUser(u);
                                  const defaultPeriod = calculateVolunteerPeriod(u.volunteer_since || u.created_at, new Date()).fullPeriodText;
                                  setCertServicePeriod(defaultPeriod);
                                  setCertRole(u.volunteer_title || 'Bosh Ovozli Diktor & Madaniy Meros Volontyori');
                                  setCertHours(u.volunteer_hours ? `${u.volunteer_hours} Akredited Hours` : '64 Akredited Hours (4 oy)');
                                  const initialBooks = ["O'tkan kunlar", "Qiyomat"];
                                  setCertSelectedBooks(initialBooks);
                                  setCertImpact("O'tkan kunlar (12 ta bob), Qiyomat (10 ta bob) — Jami 22 ta audiobob");
                                  setCertCitation(`O'zbek mumtoz va jahon adabiyoti durdonalaridan "O'tkan kunlar" va "Qiyomat" asarlarini professional darajada ovozlashtirish, 22 ta audiobobni sifatli tayyorlash va Bookify milliy audio fondiga qo'shishdagi namunali xizmatlari uchun.`);
                                  setCertReach('12,500+ Kitobxonlar');
                                  setCertGrade('Grade A+ (Distinguished)');
                                }}
                                className="px-3 py-1.5 rounded-sm bg-black/5 dark:bg-white/5 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                title="Volontyorlik sertifikati berish"
                              >
                                <Award size={13} />
                                <span className="hidden sm:inline">Sertifikat</span>
                              </button>

                              {/* Reset Password Button */}
                              <button
                                onClick={() => {
                                  setResetModalUser(u);
                                  setNewPasswordInput('');
                                  setShowResetPassword(false);
                                }}
                                className="px-3 py-1.5 rounded-sm bg-black/5 dark:bg-white/5 hover:bg-ink dark:bg-parchment/10 hover:text-ink dark:text-parchment border border-stone-200/80 dark:border-white/10 text-stone-700 dark:text-ink/60 dark:text-parchment/60 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                title="Foydalanuvchi parolini o'zgartirish"
                              >
                                <KeyRound size={13} />
                                <span className="hidden sm:inline">Parol</span>
                              </button>

                              {/* Toggle Ban/Active */}
                              {!isSuperAdmin && (
                                <button
                                  onClick={() => handleToggleUserStatus(u)}
                                  disabled={isToggling}
                                  className={`px-3 py-1.5 rounded-sm border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                    isBanned
                                      ? 'bg-black/5 dark:bg-white/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                      : 'bg-black/5 dark:bg-white/5 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                                  }`}
                                  title={isBanned ? "Hisobni faollashtirish" : "Hisobni bloklash"}
                                >
                                  {isToggling ? (
                                    <Loader2 size={13} className="animate-spin" />
                                  ) : isBanned ? (
                                    <>
                                      <UserCheck size={13} />
                                      <span className="hidden sm:inline">Faollashtirish</span>
                                    </>
                                  ) : (
                                    <>
                                      <Lock size={13} />
                                      <span className="hidden sm:inline">Bloklash</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center space-y-3">
                <Users size={36} className="text-ink/60 dark:text-parchment/60 mx-auto opacity-50" />
                <h4 className="font-serif font-bold text-base text-ink dark:text-parchment">
                  Hech qanday kitobxon topilmadi
                </h4>
                <p className="text-xs text-ink/60 dark:text-parchment/60 max-w-sm mx-auto">
                  Qidiruv so'rovi yoki tanlangan filtrlarni o'zgartirib ko'ring.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ── PASSWORD RESET MODAL ── */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-parchment dark:bg-ink border border-stone-200 dark:border-white/10 rounded-sm p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-black/5 dark:border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-ink dark:bg-parchment/10 text-ink dark:text-parchment flex items-center justify-center shrink-0">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-ink dark:text-parchment">
                    Parolni Yangilash
                  </h3>
                  <p className="text-xs text-ink/60 dark:text-parchment/60 font-mono">
                    {resetModalUser.name} ({resetModalUser.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setResetModalUser(null);
                  setNewPasswordInput('');
                }}
                className="p-1.5 rounded-sm hover:bg-black/5 dark:hover:bg-white/10 text-ink/60 dark:text-parchment/60 hover:text-ink/60 dark:text-parchment/60 dark:hover:text-stone-200 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-stone-700 dark:text-ink/60 dark:text-parchment/60 block">
                  Yangi Parol (kamida 6 ta belgi):
                </label>
                <div className="relative">
                  <input
                    type={showResetPassword ? "text" : "password"}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Yangi parolni o'zingiz yozing..."
                    autoComplete="new-password"
                    name="admin_custom_manual_password"
                    data-lpignore="true"
                    required
                    minLength={6}
                    className="w-full pl-4 pr-11 py-3 rounded-sm bg-black/5 dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-ink dark:text-parchment focus:outline-none focus:border-ink dark:border-parchment transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/60 dark:text-parchment/60 hover:text-ink/60 dark:text-parchment/60 dark:hover:text-stone-200 p-1 cursor-pointer"
                  >
                    {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-ink/60 dark:text-parchment/60">
                    Ushbu foydalanuvchi keyingi kirishida yangi paroldan foydalanadi.
                  </p>
                  <p className="text-[10.5px] text-amber-600 dark:text-amber-400 bg-black/5 dark:bg-white/5 p-2 rounded-sm border border-amber-500/20">
                    💡 <strong>Eslatma:</strong> Google hisobi orqali kiruvchi foydalanuvchilar har doim "Google hisobi orqali kirish" tugmasi orqali parolsiz ham tizimga bemalol kira olishadi.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setResetModalUser(null);
                    setNewPasswordInput('');
                  }}
                  className="px-4 py-2.5 rounded-sm text-xs font-mono text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Bekor Qilish
                </button>
                <button
                  type="submit"
                  disabled={isResettingPassword || newPasswordInput.trim().length < 6}
                  className="px-5 py-2.5 rounded-sm bg-ink dark:bg-parchment hover:bg-[#C74326] disabled:opacity-50 text-parchment dark:text-ink text-xs font-mono font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  {isResettingPassword ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saqlanmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Yangi Parolni Saqlash</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ── VOLUNTEER CERTIFICATE ISSUE MODAL ── */}
      {certModalUser && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-parchment dark:bg-ink border border-amber-500/30 rounded-sm p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-black/5 dark:border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-black/5 dark:bg-white/5 text-amber-500 flex items-center justify-center shrink-0">
                  <Award size={22} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-ink dark:text-parchment">
                    Rasmiy Volontyorlik Sertifikati Berish
                  </h3>
                  <p className="text-xs text-ink/60 dark:text-parchment/60 font-mono">
                    {certModalUser.name} ({certModalUser.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCertModalUser(null)}
                className="p-1 rounded-sm text-ink/60 dark:text-parchment/60 hover:text-ink/60 dark:text-parchment/60 dark:hover:text-stone-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleIssueCertificateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-stone-700 dark:text-ink/60 dark:text-parchment/60 block">
                  Faoliyat Roli (Yo'nalishi):
                </label>
                <select
                  value={certRole}
                  onChange={(e) => setCertRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-sm bg-black/5 dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-ink dark:text-parchment focus:outline-none focus:border-amber-500"
                >
                  <option value="Bosh Ovozli Diktor & Madaniy Meros Volontyori">Bosh Ovozli Diktor & Madaniy Meros Volontyori</option>
                  <option value="Adabiyot Muharriri & Matn Korrektori">Adabiyot Muharriri & Matn Korrektori</option>
                  <option value="Bosh Audio Spektakl Ijrochisi">Bosh Audio Spektakl Ijrochisi</option>
                  <option value="Raqamli Kutubxona Arxivi Koordinatori">Raqamli Kutubxona Arxivi Koordinatori</option>
                  <option value="Sara Asarlar Tarjimoni & Volontyor">Sara Asarlar Tarjimoni & Volontyor</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-stone-700 dark:text-ink/60 dark:text-parchment/60 block">
                    Akkreditatsiya Soati:
                  </label>
                  <input
                    type="text"
                    value={certHours}
                    onChange={(e) => setCertHours(e.target.value)}
                    placeholder="Masalan: 64 Akredited Hours (4 oy)"
                    className="w-full px-3.5 py-2.5 rounded-sm bg-black/5 dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-ink dark:text-parchment focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-stone-700 dark:text-ink/60 dark:text-parchment/60 block">
                    Sifat Bahosi (Darajasi):
                  </label>
                  <select
                    value={certGrade}
                    onChange={(e) => setCertGrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-black/5 dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-ink dark:text-parchment focus:outline-none focus:border-amber-500"
                  >
                    <option value="Grade A+ (Distinguished)">Grade A+ (Distinguished)</option>
                    <option value="Grade A (Excellent)">Grade A (Excellent)</option>
                    <option value="Grade B+ (Merit)">Grade B+ (Merit)</option>
                  </select>
                </div>
              </div>

                            <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-stone-700 dark:text-ink/60 dark:text-parchment/60 block">
                  Xizmat Davri & Muddati (Universitet va Grantlar uchun):
                </label>
                <input
                  type="text"
                  value={certServicePeriod}
                  onChange={(e) => setCertServicePeriod(e.target.value)}
                  placeholder="Masalan: 2025-yil sentyabr — 2026-yil sentyabr (1 yil to'liq faoliyat)"
                  className="w-full px-3.5 py-2.5 rounded-sm bg-black/5 dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-ink dark:text-parchment focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Real Book Selection Chips */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-stone-700 dark:text-ink/60 dark:text-parchment/60 block">
                    Volontyor Qatnashgan / Ovoz Bergan Asarlar (Katalogdan tanlang):
                  </label>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
                    {certSelectedBooks.length} ta asar tanlandi
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-sm bg-black/5 dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 max-h-32 overflow-y-auto">
                  {books.map(b => {
                    const isSel = certSelectedBooks.includes(b.title);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          let nextBooks: string[];
                          if (isSel) {
                            nextBooks = certSelectedBooks.filter(t => t !== b.title);
                          } else {
                            nextBooks = [...certSelectedBooks, b.title];
                          }
                          setCertSelectedBooks(nextBooks);
                          if (nextBooks.length > 0) {
                            const estBobs = nextBooks.length * 10 + 2;
                            const estHours = nextBooks.length * 24 + 16;
                            setCertImpact(`${nextBooks.join(', ')} — Jami ${estBobs} ta audiobob`);
                            setCertHours(`${estHours} Akredited Hours (${Math.min(12, Math.ceil(nextBooks.length * 2))} oy)`);
                            setCertCitation(`O'zbek va jahon adabiyotining nodir asarlari: ${nextBooks.map(t => `"${t}"`).join(', ')} kitoblarini professional darajada ovozlashtirish, ${estBobs} ta audiobobni sifatli tayyorlash va milliy kutubxona fondini boyitishdagi namunali xizmati uchun.`);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-sm text-xs font-mono transition-all cursor-pointer flex items-center gap-1 ${
                          isSel 
                            ? 'bg-amber-500 text-ink font-bold shadow-sm' 
                            : 'bg-stone-200/70 dark:bg-white/5 text-stone-700 dark:text-ink/60 dark:text-parchment/60 hover:bg-stone-300 dark:hover:bg-white/10'
                        }`}
                      >
                        <span>{isSel ? '✓' : '+'}</span>
                        <span>{b.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-stone-700 dark:text-ink/60 dark:text-parchment/60 block">
                  Ovozlashtirilgan Asarlar / Hissa Xulosasi:
                </label>
                <input
                  type="text"
                  value={certImpact}
                  onChange={(e) => setCertImpact(e.target.value)}
                  placeholder="Masalan: O'tkan kunlar (12 ta bob), Qiyomat (10 ta bob) — Jami 22 ta audiobob"
                  className="w-full px-3.5 py-2.5 rounded-sm bg-black/5 dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-ink dark:text-parchment focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-stone-700 dark:text-ink/60 dark:text-parchment/60 block">
                  Rasmiy Akademik Tavsifnoma (Sertifikat Iqtibosi):
                </label>
                <textarea
                  rows={2}
                  value={certCitation}
                  onChange={(e) => setCertCitation(e.target.value)}
                  placeholder="Volontyor bajargan aniq vazifalar bo'yicha rasmiy tavsif..."
                  className="w-full px-3.5 py-2 rounded-sm bg-black/5 dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-ink dark:text-parchment focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-stone-700 dark:text-ink/60 dark:text-parchment/60 block">
                  Tinglovchilar Qamrovi:
                </label>
                <input
                  type="text"
                  value={certReach}
                  onChange={(e) => setCertReach(e.target.value)}
                  placeholder="Masalan: 12,500+ Kitobxonlar"
                  className="w-full px-3.5 py-2.5 rounded-sm bg-black/5 dark:bg-[#080B0F] border border-stone-200 dark:border-white/10 text-xs font-mono text-ink dark:text-parchment focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 rounded-sm bg-black/5 dark:bg-white/5 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300">
                🎓 Ushbu sertifikat berilgach, Bookify rasmiy reyestrida noyob seriya raqami va QR-kod bilan saqlanadi hamda universitetlar tomonidan onlayn tekshirilishi mumkin bo'ladi.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setCertModalUser(null)}
                  className="px-4 py-2.5 rounded-sm text-xs font-mono text-ink/60 dark:text-parchment/60 dark:text-ink/60 dark:text-parchment/60 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Bekor Qilish
                </button>
                <button
                  type="submit"
                  disabled={isIssuingCert}
                  className="px-5 py-2.5 rounded-sm bg-ink dark:bg-parchment  hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-ink text-xs font-mono font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  {isIssuingCert ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Generatsiya qilinmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Award size={14} />
                      <span>Generatsiya Qilish & Berish</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ── ASSIGN VOLUNTEER & CODE MODAL ── */}
      {volunteerModalUser && (
        <AssignVolunteerModal
          user={volunteerModalUser}
          onClose={() => setVolunteerModalUser(null)}
          onSuccess={() => {
            fetchUsers();
          }}
        />
      )}

      {/* ── FULL LUXURY VOLUNTEER CERTIFICATE PREVIEW MODAL ── */}
      {previewCertData && (
        <VolunteerCertificateModal
          certificate={previewCertData}
          onClose={() => setPreviewCertData(null)}
        />
      )}

    </div>
  );
}
