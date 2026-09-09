import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Mic, 
  Square, 
  Play, 
  Pause, 
  RotateCcw, 
  UploadCloud, 
  BookOpen, 
  CheckCircle2, 
  Volume2, 
  Radio, 
  ChevronRight, 
  ChevronLeft, 
  Sliders, 
  Sparkles,
  ArrowDown,
  Loader2,
  Check,
  Eye,
  EyeOff,
  Activity,
  HeartHandshake
} from 'lucide-react';
import { Book, UserProfile } from '../../types';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

interface Props {
  book: Book;
  currentUser: UserProfile | null;
  onClose: () => void;
  onSuccessUpload?: () => void;
}

interface ProcessedChapter {
  id: string;
  number: number;
  title: string;
  content: string;
}

export default function VolunteerAudioStudioModal({
  book,
  currentUser,
  onClose,
  onSuccessUpload
}: Props) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [chapters, setChapters] = useState<ProcessedChapter[]>([]);
  const [isLoadingChapters, setIsLoadingChapters] = useState(true);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploadedTrackInfo, setUploadedTrackInfo] = useState<any>(null);

  // Sound Engine & Hardware Settings
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [micDbLevel, setMicDbLevel] = useState(-60); // in dB
  const [micVolumePercent, setMicVolumePercent] = useState(0);

  // Custom Audio Review Player State
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [playbackCurrentTime, setPlaybackCurrentTime] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  // Teleprompter Reading Experience
  const [fontSize, setFontSize] = useState<number>(18);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState<number>(0); // 0 = off, 1 = slow, 2 = medium, 3 = fast
  const [showFocusGuide, setShowFocusGuide] = useState(true);
  const [trackTitle, setTrackTitle] = useState('');

  // ── Refs ───────────────────────────────────────────────────────────────────
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const autoScrollIntervalRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const teleprompterBoxRef = useRef<HTMLDivElement | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // ── 1. Fetch Real Chapters and Content from Backend ───────────────────────
  useEffect(() => {
    let isMounted = true;
    setIsLoadingChapters(true);

    async function loadBookData() {
      try {
        const readerData = await api.getBookReader(book.id);
        if (!isMounted) return;

        if (readerData && readerData.chapters && readerData.chapters.length > 0) {
          const mapped: ProcessedChapter[] = readerData.chapters.map((ch: any, idx: number) => {
            let fullText = '';
            if (ch.sentences && Array.isArray(ch.sentences) && ch.sentences.length > 0) {
              fullText = ch.sentences.map((s: any) => s.text).join(' ');
            } else if (ch.content) {
              fullText = ch.content;
            }

            const cleanTitle = (ch.title || '').trim() || `${idx + 1}-bob`;

            return {
              id: ch.id || `ch-${idx}`,
              number: ch.number || ch.index || idx + 1,
              title: cleanTitle,
              content: fullText
            };
          });
          setChapters(mapped);
        } else if (book.chapters && book.chapters.length > 0) {
          setChapters(book.chapters.map((c, i) => ({
            id: c.id || `ch-${i}`,
            number: c.number || i + 1,
            title: c.title || `${i + 1}-bob`,
            content: c.content || ''
          })));
        } else {
          // Fallback if book has no OCR pages yet
          setChapters([
            {
              id: 'ch-default',
              number: 1,
              title: `${book.title} (Muqaddima)`,
              content: book.description || "Ushbu asar uchun raqamlashtirilgan matn kiritilmagan. O'zingizdagi kitob nusxasidan o'qib, bemalol ovoz yozishingiz mumkin."
            }
          ]);
        }
      } catch (err) {
        console.error("[Audio Studio] Failed to load chapters:", err);
      } finally {
        if (isMounted) setIsLoadingChapters(false);
      }
    }

    loadBookData();

    return () => {
      isMounted = false;
    };
  }, [book.id, book.title, book.description, book.chapters]);

  // Current chapter
  const currentChapter = chapters[currentChapterIndex] || chapters[0] || {
    id: 'ch-fallback',
    number: 1,
    title: book.title,
    content: book.description || ''
  };

  // Sync track title with clean chapter name (avoid duplicate '1-bob: 1-Bob:')
  useEffect(() => {
    if (currentChapter) {
      let title = currentChapter.title.trim();
      if (!title.toLowerCase().includes('bob') && !title.toLowerCase().includes('muqaddima')) {
        title = `${currentChapter.number}-bob: ${title}`;
      }
      setTrackTitle(title);
    }
  }, [currentChapter, currentChapterIndex]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupAudioStream();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (autoScrollIntervalRef.current) clearInterval(autoScrollIntervalRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // ── 2. Auto-scroll logic for Teleprompter ──────────────────────────────────
  useEffect(() => {
    if (autoScrollSpeed > 0 && isRecording && !isPaused) {
      const step = autoScrollSpeed === 1 ? 1 : autoScrollSpeed === 2 ? 1.5 : 2.5;
      const intervalMs = autoScrollSpeed === 1 ? 55 : autoScrollSpeed === 2 ? 40 : 30;

      autoScrollIntervalRef.current = setInterval(() => {
        if (teleprompterBoxRef.current) {
          teleprompterBoxRef.current.scrollTop += step;
        }
      }, intervalMs);
    } else {
      if (autoScrollIntervalRef.current) clearInterval(autoScrollIntervalRef.current);
    }
    return () => {
      if (autoScrollIntervalRef.current) clearInterval(autoScrollIntervalRef.current);
    };
  }, [autoScrollSpeed, isRecording, isPaused]);

  // ── 3. High-Fidelity 60 FPS Canvas Oscilloscope & VU Spectrum ──────────────
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Calculate RMS for decibel meter
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const avg = sum / bufferLength;
    const percent = Math.min(100, Math.round((avg / 255) * 100));
    setMicVolumePercent(percent);

    // Approximate dB (-60dB to 0dB)
    const db = percent > 0 ? Math.round(20 * Math.log10(percent / 100)) : -60;
    setMicDbLevel(Math.max(-60, db));

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Subtle background grid
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.08)';
    ctx.lineWidth = 1;
    for (let y = height / 4; y < height; y += height / 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Bookify signature Terracotta & Gold spectrum bars
    const barWidth = (width / bufferLength) * 2.2;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const value = dataArray[i] / 255;
      const barHeight = Math.max(3, value * height * 0.92);

      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, 'rgba(224, 86, 56, 0.25)'); // Terracotta base
      gradient.addColorStop(0.4, '#C5A059');               // Antique Gold
      gradient.addColorStop(0.85, '#E05638');              // Primary Terracotta
      gradient.addColorStop(1, '#C74326');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, height - barHeight, barWidth - 1.5, barHeight, [2, 2, 0, 0]);
      ctx.fill();

      // Peak highlight micro dot
      if (barHeight > 8) {
        ctx.fillStyle = '#C5A059';
        ctx.fillRect(x, height - barHeight - 1, barWidth - 1.5, 1.5);
      }

      x += barWidth;
    }

    if (isRecording && !isPaused) {
      animationFrameRef.current = requestAnimationFrame(drawWaveform);
    }
  }, [isRecording, isPaused]);

  // ── 4. Recording Controls ──────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      cleanupAudioStream();
      audioChunksRef.current = [];
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingSeconds(0);

      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation,
          noiseSuppression,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx({ sampleRate: 48000 });
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.78;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
        else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) mimeType = 'audio/ogg;codecs=opus';
        else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
        else mimeType = '';
      }

      const recorder = mimeType 
        ? new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 128000 })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(audioChunksRef.current, { 
          type: recorder.mimeType || 'audio/webm' 
        });
        setAudioBlob(finalBlob);
        const url = URL.createObjectURL(finalBlob);
        setAudioUrl(url);
      };

      recorder.start(500);
      setIsRecording(true);
      setIsPaused(false);
      if (autoScrollSpeed === 0) {
        setAutoScrollSpeed(1);
      }

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

      drawWaveform();
      toast.success("Ovoz yozish boshlandi. Matnni maromida o'qishingiz mumkin.", { icon: '🎙' });

    } catch (err: any) {
      console.error("[Studio Error]", err);
      toast.error("Mikrofonga ulanib bo'lmadi. Iltimos, brauzeringizda mikrofon ruxsatini yoqing!");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        timerIntervalRef.current = setInterval(() => {
          setRecordingSeconds(prev => prev + 1);
        }, 1000);
        drawWaveform();
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setAutoScrollSpeed(0);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      cleanupAudioStream();
      toast.success("Audio muvaffaqiyatli yozib olindi!", { icon: '✨' });
    }
  };

  const cleanupAudioStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const handleReset = () => {
    cleanupAudioStream();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingSeconds(0);
    setIsRecording(false);
    setIsPaused(false);
    setMicVolumePercent(0);
    setMicDbLevel(-60);
    setIsPlayingPreview(false);
    setPlaybackCurrentTime(0);
  };

  // ── 5. Save to AWS EC2 Backend ────────────────────────────────────────────
  const handleUploadToAws = async () => {
    if (!audioBlob) {
      toast.error("Avval audio yozib oling!");
      return;
    }

    setIsUploading(true);
    setUploadProgress(25);

    try {
      const progressTimer = setInterval(() => {
        setUploadProgress(prev => (prev < 90 ? prev + 12 : prev));
      }, 250);

      const result = await api.uploadVolunteerAudio(book.id, audioBlob, {
        chapterId: currentChapter.id,
        trackTitle: trackTitle,
        durationSeconds: recordingSeconds
      });

      clearInterval(progressTimer);
      setUploadProgress(100);

      setIsSuccess(true);
      setUploadedTrackInfo(result);
      toast.success("Audio yozuv AWS serveringizga to'liq saqlandi! 🎉");
      
      if (onSuccessUpload) onSuccessUpload();

    } catch (err: any) {
      toast.error(err.message || "Audioni serverga yuklashda xatolik yuz berdi");
    } finally {
      setIsUploading(false);
    }
  };

  // Format seconds to high-end broadcast timecode MM:SS or HH:MM:SS
  const formatTimecode = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const bookCover = (book as any).cover_image || (book as any).coverImage || '';
  const bookAuthor = book.authorName || (book as any).author || "O'zbek Adabiyoti";
  const wordCount = currentChapter.content ? currentChapter.content.split(/\s+/).filter(Boolean).length : 0;
  const estimatedReadingMinutes = Math.max(1, Math.round(wordCount / 140));

  return (
    <div className="fixed inset-0 z-[1300] bg-black/65 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-6xl bg-white dark:bg-[#121620] border border-stone-200/90 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden h-[94vh] max-h-[880px] flex flex-col text-stone-900 dark:text-stone-100 transition-colors"
      >
        {/* Top Bookify Signature Terracotta & Gold Hairline */}
        <div className="h-1 w-full bg-gradient-to-r from-[#E05638] via-[#C5A059] to-[#E05638] shrink-0" />

        {/* ── Studio Header Bar (Bookify Native Design) ── */}
        <header className="px-5 sm:px-6 py-3.5 border-b border-stone-200/80 dark:border-white/10 flex items-center justify-between gap-4 bg-stone-50/70 dark:bg-white/[0.02] shrink-0">
          
          {/* Left: Book Cover Miniature & Title & Narrator */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-9 h-12 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200/90 dark:border-white/10 shadow-xs shrink-0 overflow-hidden">
              {bookCover ? (
                <img 
                  src={bookCover} 
                  alt={book.title} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-[#E05638] font-serif font-bold bg-[#E05638]/10">
                  {book.title.slice(0, 2)}
                </div>
              )}
              {/* Spine highlight */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/30 pointer-events-none" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-sm sm:text-base text-stone-950 dark:text-white tracking-tight truncate max-w-[220px] sm:max-w-xs md:max-w-md">
                  {book.title}
                </h3>
                <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-stone-200/60 dark:bg-white/10 text-stone-700 dark:text-stone-300">
                  {bookAuthor}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                <span>Ovoz ijrochisi:</span>
                <span className="text-[#E05638] dark:text-[#C5A059] font-medium truncate">
                  {currentUser?.name || 'Volontyor Diktor'}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Live Studio State Indicator */}
          <div className="hidden sm:flex items-center">
            {isRecording ? (
              <div className={`flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider border transition-all ${
                isPaused 
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' 
                  : 'bg-[#E05638]/15 text-[#E05638] border-[#E05638]/35 shadow-xs animate-pulse'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-[#E05638]'}`} />
                <span>{isPaused ? 'STUDIO PAUZA' : '● BROADCAST ON AIR'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 text-[11px] font-mono text-stone-600 dark:text-stone-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-stone-700 dark:text-stone-300 font-semibold">STUDIYA TAYYOR</span>
                <span className="text-stone-400">•</span>
                <span>48 kHz OPUS</span>
              </div>
            )}
          </div>

          {/* Right: Close Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Studiyani yopish"
              aria-label="Studiyani yopish"
            >
              <X size={19} />
            </button>
          </div>
        </header>

        {/* ── Main Workstation Stage ── */}
        {isSuccess ? (
          /* ── SUCCESS STATE (Harmonized with Bookify Celebrations) ── */
          <div className="p-8 sm:p-14 text-center flex-1 flex flex-col items-center justify-center space-y-6 animate-in fade-in">
            <div className="w-20 h-20 rounded-3xl bg-[#E05638]/15 dark:bg-[#E05638]/20 text-[#E05638] flex items-center justify-center text-4xl border border-[#E05638]/30 shadow-lg">
              <CheckCircle2 size={44} className="text-[#E05638]" />
            </div>

            <div className="space-y-2 max-w-lg">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950 dark:text-white tracking-tight">
                Audio Muvaffaqiyatli Saqlandi!
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                «{book.title}» asarining <strong>{trackTitle}</strong> treki AWS serveringizga xavfsiz joylashtirildi va asar tinglovchilari uchun tayyorlandi.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-50 dark:bg-white/[0.03] border border-stone-200/90 dark:border-white/10 text-left w-full max-w-md space-y-3 text-xs shadow-xs">
              <div className="flex justify-between items-center border-b border-stone-200/60 dark:border-white/5 pb-2.5">
                <span className="text-stone-500 dark:text-stone-400">Yozilgan Bob:</span>
                <span className="font-semibold text-stone-900 dark:text-white truncate max-w-[220px]">{uploadedTrackInfo?.title || trackTitle}</span>
              </div>
              <div className="flex justify-between items-center border-b border-stone-200/60 dark:border-white/5 pb-2.5">
                <span className="text-stone-500 dark:text-stone-400">Audio Davomiyligi:</span>
                <span className="font-mono text-[#E05638] dark:text-[#C5A059] font-bold text-sm">{formatTimecode(recordingSeconds)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500 dark:text-stone-400">Hisoblangan Volontyorlik Staji:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                  +{Math.max(0.25, Math.round((recordingSeconds / 3600) * 100) / 100)} soat
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  handleReset();
                  setCurrentChapterIndex(prev => Math.min(chapters.length - 1, prev + 1));
                }}
                className="px-6 py-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/15 text-stone-800 dark:text-white font-semibold text-xs transition-all cursor-pointer flex items-center gap-2 border border-stone-200 dark:border-white/10"
              >
                <span>Keyingi Bobga O'tish</span>
                <ChevronRight size={14} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#E05638] to-amber-500 hover:from-[#d04b30] hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-[#E05638]/20 transition-all cursor-pointer"
              >
                Studiyadan Chiqish
              </button>
            </div>
          </div>
        ) : (
          /* ── DUAL BAY WORKSTATION ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
            
            {/* ── LEFT BAY: The Teleprompter (Authentic Bookify Reading Surface) ── */}
            <div className="lg:col-span-7 flex flex-col bg-[#FAF6EE] dark:bg-[#0E1218] border-b lg:border-b-0 lg:border-r border-stone-200/90 dark:border-white/10 overflow-hidden transition-colors">
              
              {/* Teleprompter Command Bar */}
              <div className="px-4 sm:px-6 py-2.5 bg-[#F5EFE0] dark:bg-[#141824] border-b border-stone-200/90 dark:border-white/10 flex items-center justify-between gap-3 shrink-0 flex-wrap">
                
                {/* Chapter Navigator */}
                <div className="flex items-center gap-2 min-w-0">
                  <BookOpen size={15} className="text-[#E05638] shrink-0" />
                  
                  {isLoadingChapters ? (
                    <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                      <Loader2 size={13} className="animate-spin text-[#E05638]" />
                      <span>Matn yuklanmoqda...</span>
                    </span>
                  ) : chapters.length > 1 ? (
                    <div className="flex items-center gap-1 bg-white dark:bg-black/40 px-2 py-1 rounded-xl border border-stone-200/90 dark:border-white/10 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setCurrentChapterIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentChapterIndex === 0}
                        className="p-1 rounded text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white disabled:opacity-20 cursor-pointer transition-colors"
                        title="Oldingi bob"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      
                      <select
                        value={currentChapterIndex}
                        onChange={(e) => setCurrentChapterIndex(Number(e.target.value))}
                        className="bg-transparent text-xs font-serif font-medium text-stone-800 dark:text-stone-200 outline-none cursor-pointer max-w-[170px] sm:max-w-[210px] truncate"
                      >
                        {chapters.map((ch, idx) => (
                          <option key={ch.id} value={idx} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">
                            {ch.number}-bob: {ch.title}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => setCurrentChapterIndex(prev => Math.min(chapters.length - 1, prev + 1))}
                        disabled={currentChapterIndex === chapters.length - 1}
                        className="p-1 rounded text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white disabled:opacity-20 cursor-pointer transition-colors"
                        title="Keyingi bob"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-serif font-semibold text-stone-800 dark:text-stone-200 truncate">
                      {currentChapter.title}
                    </span>
                  )}
                </div>

                {/* Teleprompter Precision Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  
                  {/* Focus Eyeline Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowFocusGuide(!showFocusGuide)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                      showFocusGuide
                        ? 'bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-500/35 shadow-2xs'
                        : 'bg-white dark:bg-white/5 text-stone-500 border-stone-200/90 dark:border-white/10 hover:text-stone-800 dark:hover:text-stone-200'
                    }`}
                    title="O'qish uchun fokus chizig'ini yoqish/o'chirish"
                  >
                    {showFocusGuide ? <Eye size={13} className="text-[#E05638]" /> : <EyeOff size={13} />}
                    <span className="hidden sm:inline">Fokus</span>
                  </button>

                  {/* Auto-scroll Speed Segmented Control */}
                  <div className="flex items-center gap-0.5 bg-white dark:bg-black/40 p-0.5 rounded-xl border border-stone-200/90 dark:border-white/10 text-xs shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setAutoScrollSpeed(0)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                        autoScrollSpeed === 0 
                          ? 'bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-white font-bold' 
                          : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                      }`}
                      title="Avto-siljishni to'xtatish"
                    >
                      Pauza
                    </button>
                    <button
                      type="button"
                      onClick={() => setAutoScrollSpeed(1)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                        autoScrollSpeed === 1 
                          ? 'bg-[#E05638] text-white font-bold shadow-2xs' 
                          : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                      }`}
                      title="Sekin tezlik"
                    >
                      1x
                    </button>
                    <button
                      type="button"
                      onClick={() => setAutoScrollSpeed(2)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                        autoScrollSpeed === 2 
                          ? 'bg-[#E05638] text-white font-bold shadow-2xs' 
                          : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                      }`}
                      title="O'rtacha tezlik"
                    >
                      1.5x
                    </button>
                    <button
                      type="button"
                      onClick={() => setAutoScrollSpeed(3)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                        autoScrollSpeed === 3 
                          ? 'bg-[#C74326] text-white font-bold shadow-2xs' 
                          : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                      }`}
                      title="Tez siljish"
                    >
                      2x
                    </button>
                  </div>

                  {/* Font Size Adjust */}
                  <div className="flex items-center gap-1 bg-white dark:bg-black/40 px-2 py-1 rounded-xl border border-stone-200/90 dark:border-white/10 text-xs shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setFontSize(prev => Math.max(15, prev - 2))}
                      className="p-0.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white cursor-pointer"
                      title="Shriftni kichraytirish"
                    >
                      A-
                    </button>
                    <span className="text-[10px] font-mono text-stone-400 px-1 select-none">
                      {fontSize}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFontSize(prev => Math.min(26, prev + 2))}
                      className="p-0.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white cursor-pointer"
                      title="Shriftni kattalashtirish"
                    >
                      A+
                    </button>
                  </div>

                </div>

              </div>

              {/* Scrollable Reading Surface */}
              <div className="relative flex-1 overflow-hidden">
                
                {/* Visual Reading Eyeline Guide */}
                {showFocusGuide && (
                  <div className="absolute top-[35%] left-0 right-0 pointer-events-none z-20 flex items-center justify-between px-4 sm:px-8 select-none">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E05638] shadow-sm shrink-0" />
                    <div className="flex-1 mx-3 h-[2px] bg-gradient-to-r from-[#E05638]/30 via-[#E05638]/70 to-[#E05638]/30" />
                    <span className="text-[9px] font-mono tracking-wider uppercase text-white bg-[#E05638] px-2 py-0.5 rounded-full shadow-xs">
                      O'qish Chizig'i
                    </span>
                  </div>
                )}

                <div 
                  ref={teleprompterBoxRef}
                  className="h-full overflow-y-auto px-6 sm:px-12 py-10 font-serif selection:bg-[#E05638]/20 selection:text-[#E05638]"
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: 2.1,
                    scrollBehavior: 'smooth'
                  }}
                >
                  {isLoadingChapters ? (
                    <div className="h-full flex flex-col items-center justify-center py-20 space-y-3">
                      <Loader2 size={32} className="animate-spin text-[#E05638]" />
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-sans tracking-wide">
                        Kitob sahifalari va matnlari o'qilmoqda...
                      </p>
                    </div>
                  ) : (
                    <div className="max-w-2xl mx-auto space-y-6 pb-40">
                      
                      {/* Chapter Title Badge */}
                      <div className="pb-6 border-b border-stone-300/60 dark:border-white/10 space-y-1.5">
                        <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs font-mono">
                          <span className="uppercase tracking-widest text-[#E05638] dark:text-[#C5A059] text-[11px] font-semibold">
                            {book.title} • {currentChapterIndex + 1} / {chapters.length}-bob
                          </span>
                          <span>
                            {wordCount} ta so'z • ~{estimatedReadingMinutes} daqiqa
                          </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white tracking-tight">
                          {currentChapter.title}
                        </h2>
                      </div>

                      {/* Editorial Paragraphs with Drop-Cap */}
                      <div className="text-stone-800 dark:text-[#EAE6DF] whitespace-pre-line text-justify tracking-normal select-text leading-relaxed">
                        {currentChapter.content ? (
                          currentChapter.content
                        ) : (
                          <p className="text-stone-500 italic">
                            Ushbu bob uchun raqamlashtirilgan matn mavjud emas. Kitobingizning qo'lda bor nusxasidan o'qib ovoz yozishingiz mumkin.
                          </p>
                        )}
                      </div>

                      {/* Literary End of Chapter Seal */}
                      <div className="pt-12 text-center text-xs text-stone-500 dark:text-stone-400 font-sans border-t border-stone-300/60 dark:border-white/10 space-y-1">
                        <div className="font-mono">
                          ✦ {currentChapter.number}-bob yakunlandi • Ovoz yozuvini to'xtatish uchun o'ngdagi konsoldan foydalaning ✦
                        </div>
                      </div>

                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* ── RIGHT BAY: Master Sound Console (Theme-Harmonized) ── */}
            <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between bg-stone-50 dark:bg-[#121620] border-t lg:border-t-0 lg:border-l border-stone-200/90 dark:border-white/10 space-y-5 overflow-y-auto transition-colors">
              
              {/* Top: Unified Acoustic Monitor Deck */}
              <div className="space-y-4">
                
                {/* Acoustic Monitor Card */}
                <div className="rounded-2xl bg-white dark:bg-black/40 border border-stone-200/90 dark:border-white/10 shadow-xs p-4 overflow-hidden">
                  
                  {/* Monitor Header */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-stone-400 border-b border-stone-100 dark:border-white/5 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-[#E05638] animate-ping' : 'bg-emerald-500'}`} />
                      <span className="font-semibold text-stone-700 dark:text-stone-300 tracking-wider">
                        {isRecording ? "CH-01 • REC MASTER" : "CH-01 • AUDIO MONITOR"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-stone-400">VU PEAK:</span>
                      <span className={
                        micDbLevel > -6 
                          ? 'text-[#E05638]' 
                          : micDbLevel > -18 
                          ? 'text-amber-600 dark:text-amber-400' 
                          : 'text-emerald-600 dark:text-emerald-400'
                      }>
                        {isRecording ? `${micDbLevel} dB` : 'OFF'}
                      </span>
                    </div>
                  </div>

                  {/* Timecode Readout */}
                  <div className="text-center py-2 relative">
                    <span className="text-[9px] font-mono tracking-widest uppercase text-stone-400 dark:text-stone-500 block mb-1">
                      {isRecording ? "Yozilayotgan Vaqt" : audioBlob ? "Trek Davomiyligi" : "Kutish Rejimi"}
                    </span>
                    <div className="font-mono font-bold text-4xl sm:text-5xl tracking-widest text-stone-900 dark:text-white select-none">
                      {formatTimecode(recordingSeconds)}
                    </div>
                  </div>

                  {/* Audio Waveform / Spectrogram Canvas */}
                  <div className="relative h-24 rounded-xl bg-stone-100 dark:bg-black/60 border border-stone-200/80 dark:border-white/5 overflow-hidden flex items-center justify-center my-2">
                    <canvas 
                      ref={canvasRef} 
                      width={440} 
                      height={96} 
                      className="w-full h-full object-cover"
                    />

                    {!isRecording && !audioBlob && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-500 text-xs space-y-1 bg-stone-100/70 dark:bg-black/40 backdrop-blur-[1px]">
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-[#E05638] shadow-xs">
                          <Mic size={16} />
                        </div>
                        <span className="text-[10px] font-mono text-stone-600 dark:text-stone-400 font-medium">
                          Mikrofon tayyor • 48 kHz / 24-bit
                        </span>
                      </div>
                    )}
                  </div>

                  {/* VU Level Bar */}
                  <div className="pt-2">
                    <div className="flex justify-between text-[9px] font-mono text-stone-400 dark:text-stone-500 mb-1 px-1">
                      <span>-48dB</span>
                      <span>-24dB</span>
                      <span>-12dB</span>
                      <span>-6dB</span>
                      <span className="text-[#E05638] font-bold">0dB</span>
                    </div>
                    <div className="h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden p-0.5">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-[#E05638] transition-all duration-75"
                        style={{ width: `${isRecording ? micVolumePercent : 0}%` }}
                      />
                    </div>
                  </div>

                </div>

                {/* Track Channel Identifier (Metadata) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                    <span>Trek Identifikatori (Bob Nomi):</span>
                    <span className="text-[10px] text-stone-400 font-normal">Avto-biriktiriladi</span>
                  </label>
                  <input
                    type="text"
                    value={trackTitle}
                    onChange={(e) => setTrackTitle(e.target.value)}
                    placeholder="1-bob: Kirish qismi"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-black/40 border border-stone-200/90 dark:border-white/10 text-xs font-medium text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-[#E05638] focus:ring-1 focus:ring-[#E05638]/20 transition-all shadow-xs"
                  />
                </div>

              </div>

              {/* ── Middle: Master Tactile Broadcast Controls ── */}
              <div className="space-y-4 pt-1">
                
                {/* 1. STANDBY: Bookify Master Record Button */}
                {!isRecording && !audioBlob && (
                  <div className="flex flex-col items-center justify-center py-2 space-y-3">
                    <button
                      type="button"
                      onClick={startRecording}
                      className="group relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                      style={{
                        background: 'radial-gradient(circle at 35% 35%, #F4F1EA, #E2DDD3)',
                        boxShadow: '0 8px 25px rgba(224, 86, 56, 0.25), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -3px 4px rgba(0,0,0,0.1)'
                      }}
                      title="Ovoz yozishni boshlash"
                    >
                      {/* Outer Ring */}
                      <div className="absolute inset-1 rounded-full border border-stone-300 dark:border-stone-700 group-hover:border-[#E05638]/50 transition-colors" />

                      {/* Inner Terracotta/Coral Core */}
                      <div 
                        className="w-13 h-13 sm:w-15 sm:h-15 rounded-full flex items-center justify-center shadow-md transition-all group-hover:scale-105"
                        style={{
                          background: 'linear-gradient(135deg, #E05638 0%, #C74326 100%)',
                          boxShadow: '0 4px 15px rgba(224, 86, 56, 0.4), inset 0 2px 3px rgba(255,255,255,0.3)'
                        }}
                      >
                        <Mic size={22} className="text-white" />
                      </div>
                    </button>

                    <div className="text-center space-y-0.5">
                      <span className="font-bold text-xs uppercase tracking-wider text-stone-900 dark:text-white block">
                        Ovoz Yozishni Boshlash
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium block">
                        Tugmani bosing • Mikrofon 48kHz
                      </span>
                    </div>
                  </div>
                )}

                {/* 2. RECORDING: Master Pause & Stop Strip */}
                {isRecording && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={pauseRecording}
                        className="py-3.5 rounded-xl font-mono font-bold text-xs text-stone-800 dark:text-white transition-all active:scale-[0.98] bg-stone-200/70 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/15 border border-stone-300/80 dark:border-white/10 cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                      >
                        {isPaused ? <Play size={16} className="text-emerald-600 dark:text-emerald-400" /> : <Pause size={16} className="text-amber-600 dark:text-amber-400" />}
                        <span>{isPaused ? "Davom Etish" : "Pauza"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={stopRecording}
                        className="py-3.5 rounded-xl font-mono font-bold text-xs text-white transition-all active:scale-[0.98] bg-gradient-to-r from-[#E05638] to-[#C74326] hover:brightness-105 shadow-md shadow-[#E05638]/25 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Square size={16} fill="white" />
                        <span>To'xtatish (Stop)</span>
                      </button>
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1.5">
                        <Radio size={12} className="text-[#E05638] animate-pulse" />
                        <span>Trek yozilmoqda. Matnni maromida talaffuz qiling.</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. AUDIO REVIEW STATE: Custom Player & AWS Upload */}
                {audioBlob && !isRecording && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-black/40 border border-stone-200/90 dark:border-white/10 space-y-3.5 animate-in fade-in shadow-xs">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
                        <span>Yozuv Tayyor ({formatTimecode(recordingSeconds)})</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="text-[11px] font-medium text-stone-500 hover:text-[#E05638] transition-colors flex items-center gap-1 cursor-pointer"
                        title="Bekor qilib qayta boshlash"
                      >
                        <RotateCcw size={12} />
                        <span>Qayta yozish</span>
                      </button>
                    </div>

                    {/* Hidden Audio Element */}
                    {audioUrl && (
                      <audio 
                        ref={audioPlayerRef} 
                        src={audioUrl}
                        onTimeUpdate={() => {
                          if (audioPlayerRef.current) {
                            setPlaybackCurrentTime(audioPlayerRef.current.currentTime);
                          }
                        }}
                        onLoadedMetadata={() => {
                          if (audioPlayerRef.current) {
                            setPlaybackDuration(audioPlayerRef.current.duration);
                          }
                        }}
                        onEnded={() => setIsPlayingPreview(false)}
                        className="hidden"
                      />
                    )}

                    {/* Custom Player Controls */}
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/80 dark:border-white/5 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (!audioPlayerRef.current) return;
                          if (isPlayingPreview) {
                            audioPlayerRef.current.pause();
                            setIsPlayingPreview(false);
                          } else {
                            audioPlayerRef.current.play();
                            setIsPlayingPreview(true);
                          }
                        }}
                        className="w-9 h-9 rounded-full bg-gradient-to-r from-[#E05638] to-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                        title={isPlayingPreview ? "Pauza" : "Eshitib ko'rish"}
                      >
                        {isPlayingPreview ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                      </button>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-stone-500 dark:text-stone-400">
                          <span className="font-bold text-stone-800 dark:text-stone-200">{formatTimecode(Math.floor(playbackCurrentTime))}</span>
                          <span>{formatTimecode(Math.floor(playbackDuration || recordingSeconds))}</span>
                        </div>
                        <div 
                          className="h-1.5 rounded-full bg-stone-200 dark:bg-stone-800 cursor-pointer overflow-hidden relative"
                          onClick={(e) => {
                            if (!audioPlayerRef.current) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pos = (e.clientX - rect.left) / rect.width;
                            const targetTime = pos * (playbackDuration || recordingSeconds);
                            audioPlayerRef.current.currentTime = targetTime;
                            setPlaybackCurrentTime(targetTime);
                          }}
                        >
                          <div 
                            className="h-full rounded-full bg-[#E05638] transition-all"
                            style={{ 
                              width: `${playbackDuration ? (playbackCurrentTime / playbackDuration) * 100 : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* AWS Save Button */}
                    <button
                      type="button"
                      onClick={handleUploadToAws}
                      disabled={isUploading}
                      className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:brightness-105"
                    >
                      {isUploading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin text-white" />
                          <span>AWS Serverga Saqlanmoqda ({uploadProgress}%)...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <UploadCloud size={16} />
                          <span>☁️ AWS Serverga Saqlash va Loyihaga Qo'shish</span>
                        </div>
                      )}
                    </button>

                  </div>
                )}

              </div>

              {/* ── Bottom: Studio Hardware DSP Toggles ── */}
              <div className="pt-3 border-t border-stone-200/80 dark:border-white/10 space-y-2.5 text-xs text-stone-700 dark:text-stone-300 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders size={13} className="text-[#E05638]" />
                    <span className="font-medium">Shovqin filtri (Noise Gate):</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNoiseSuppression(!noiseSuppression)}
                    disabled={isRecording}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      noiseSuppression ? 'bg-[#E05638]' : 'bg-stone-300 dark:bg-stone-700'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      noiseSuppression ? 'right-0.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 size={13} className="text-[#E05638]" />
                    <span className="font-medium">Aks-sado to'siq (Echo Cancel):</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEchoCancellation(!echoCancellation)}
                    disabled={isRecording}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      echoCancellation ? 'bg-[#E05638]' : 'bg-stone-300 dark:bg-stone-700'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      echoCancellation ? 'right-0.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
