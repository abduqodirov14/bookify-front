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
  Disc,
  Clock
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

    // Draw Studio Subtle Background Grids
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let y = height / 4; y < height; y += height / 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Dynamic studio golden/copper spectrum bars
    const barWidth = (width / bufferLength) * 2.2;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const value = dataArray[i] / 255;
      const barHeight = Math.max(3, value * height * 0.92);

      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, 'rgba(224, 86, 56, 0.35)');
      gradient.addColorStop(0.4, '#C5A059');
      gradient.addColorStop(0.85, '#E05638');
      gradient.addColorStop(1, '#FF8A65');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, height - barHeight, barWidth - 1.5, barHeight, [2, 2, 0, 0]);
      ctx.fill();

      // Peak highlight micro dot
      if (barHeight > 8) {
        ctx.fillStyle = '#FFE5A3';
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
      toast.success("Ovoz yozish boshlandi. Teleprompterni maromida o'qishingiz mumkin.", { icon: '🎙' });

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

  // Approximate word count and read duration for teleprompter
  const wordCount = currentChapter.content ? currentChapter.content.split(/\s+/).filter(Boolean).length : 0;
  const estimatedReadingMinutes = Math.max(1, Math.round(wordCount / 140));

  return (
    <div className="fixed inset-0 z-[1300] bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-5 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-6xl bg-[#0D0E13] border border-stone-800/80 rounded-3xl shadow-2xl overflow-hidden h-[94vh] max-h-[890px] flex flex-col text-stone-200"
        style={{
          boxShadow: '0 30px 100px -20px rgba(0, 0, 0, 0.9), 0 0 50px rgba(197, 160, 89, 0.08)'
        }}
      >
        {/* Top copper-gold luxury hairline */}
        <div className="h-[2px] w-full bg-gradient-to-r from-[#E05638] via-[#C5A059] to-[#E05638]" />

        {/* ── Studio Workstation Header Bar ── */}
        <header className="px-5 sm:px-6 py-3.5 border-b border-white/5 flex items-center justify-between gap-4 bg-[#12141C]/90 shrink-0">
          
          {/* Left: Book Cover Miniature & Title & Narrator */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-9 h-12 rounded bg-stone-900 border border-white/10 shadow-md shrink-0 overflow-hidden group">
              {((book as any).cover_image || (book as any).coverImage) ? (
                <img 
                  src={(book as any).cover_image || (book as any).coverImage} 
                  alt={book.title} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-[#C5A059] font-serif font-bold">
                  {book.title.slice(0, 2)}
                </div>
              )}
              {/* Spine highlight */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20 pointer-events-none" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-sm sm:text-base text-white tracking-tight truncate max-w-[220px] sm:max-w-xs md:max-w-md">
                  {book.title}
                </h3>
                <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-white/5 text-stone-400 border border-white/5">
                  {book.authorName || (book as any).author || "Muallif"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5 truncate">
                <span>Ovoz ijrochisi:</span>
                <span className="text-[#C5A059] font-medium truncate">
                  {currentUser?.name || 'Volontyor Diktor'}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Live Studio Cockpit State */}
          <div className="hidden sm:flex items-center">
            {isRecording ? (
              <div className={`flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider border transition-all ${
                isPaused 
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' 
                  : 'bg-red-500/20 text-red-400 border-red-500/40 shadow-lg shadow-red-500/20 animate-pulse'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-red-500'}`} />
                <span>{isPaused ? 'STUDIO PAUZA' : '● BROADCAST ON AIR'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[11px] font-mono text-stone-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                <span className="text-stone-300 font-semibold">STUDIO STANDBY</span>
                <span className="text-stone-500">•</span>
                <span className="text-stone-400">48 kHz OPUS</span>
              </div>
            )}
          </div>

          {/* Right: Studio Close Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-all flex items-center justify-center border border-white/5 hover:border-white/10 cursor-pointer"
              title="Studiyani yopish"
              aria-label="Studiyani yopish"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* ── Main Workstation Stage ── */}
        {isSuccess ? (
          /* ── SUCCESS EMBEDDED CELEBRATION ── */
          <div className="p-8 sm:p-14 text-center flex-1 flex flex-col items-center justify-center space-y-6 animate-in fade-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-[#C5A059]/20 to-teal-500/20 text-emerald-400 flex items-center justify-center text-4xl border border-emerald-500/30 shadow-2xl shadow-emerald-500/10">
              <CheckCircle2 size={44} className="text-emerald-400" />
            </div>

            <div className="space-y-2 max-w-lg">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Audio Muvaffaqiyatli Saqlandi!
              </h2>
              <p className="text-sm text-stone-400 leading-relaxed">
                «{book.title}» asarining <strong>{trackTitle}</strong> treki AWS serveringizga xavfsiz joylashtirildi va asar tinglovchilari uchun tayyorlandi.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#131622] border border-white/10 text-left w-full max-w-md space-y-3 text-xs shadow-xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <span className="text-stone-400">Yozilgan Bob:</span>
                <span className="font-semibold text-white truncate max-w-[220px]">{uploadedTrackInfo?.title || trackTitle}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <span className="text-stone-400">Audio Davomiyligi:</span>
                <span className="font-mono text-[#C5A059] font-bold text-sm">{formatTimecode(recordingSeconds)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-400">Hisoblangan Volontyorlik Staji:</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">
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
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-all cursor-pointer flex items-center gap-2 border border-white/10"
              >
                <span>Keyingi Bobga O'tish</span>
                <ChevronRight size={14} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#E05638] via-[#C5A059] to-[#E05638] text-white font-bold text-xs shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Studiyadan Chiqish
              </button>
            </div>
          </div>
        ) : (
          /* ── DUAL BAY WORKSTATION ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
            
            {/* ── LEFT BAY: The Teleprompter Stage (60% width) ── */}
            <div className="lg:col-span-7 flex flex-col bg-[#0B0C10] border-b lg:border-b-0 lg:border-r border-white/5 overflow-hidden">
              
              {/* Teleprompter Command Bar */}
              <div className="px-4 sm:px-6 py-3 bg-[#11131A] border-b border-white/5 flex items-center justify-between gap-3 shrink-0 flex-wrap">
                
                {/* Chapter Navigator Pill */}
                <div className="flex items-center gap-2 min-w-0">
                  <BookOpen size={15} className="text-[#C5A059] shrink-0" />
                  
                  {isLoadingChapters ? (
                    <span className="text-xs text-stone-400 flex items-center gap-1.5">
                      <Loader2 size={13} className="animate-spin text-[#C5A059]" />
                      <span>Matn yuklanmoqda...</span>
                    </span>
                  ) : chapters.length > 1 ? (
                    <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-xl border border-white/10 shadow-inner">
                      <button
                        type="button"
                        onClick={() => setCurrentChapterIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentChapterIndex === 0}
                        className="p-1 rounded text-stone-400 hover:text-white disabled:opacity-20 cursor-pointer transition-colors"
                        title="Oldingi bob"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      
                      <select
                        value={currentChapterIndex}
                        onChange={(e) => setCurrentChapterIndex(Number(e.target.value))}
                        className="bg-transparent text-xs font-serif font-medium text-stone-200 outline-none cursor-pointer max-w-[170px] sm:max-w-[210px] truncate"
                      >
                        {chapters.map((ch, idx) => (
                          <option key={ch.id} value={idx} className="bg-stone-900 text-white">
                            {ch.number}-bob: {ch.title}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => setCurrentChapterIndex(prev => Math.min(chapters.length - 1, prev + 1))}
                        disabled={currentChapterIndex === chapters.length - 1}
                        className="p-1 rounded text-stone-400 hover:text-white disabled:opacity-20 cursor-pointer transition-colors"
                        title="Keyingi bob"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-serif font-semibold text-stone-200 truncate">
                      {currentChapter.title}
                    </span>
                  )}
                </div>

                {/* Teleprompter Precision Controls: Pacing, Focus Eyeline, Font Size */}
                <div className="flex items-center gap-2 shrink-0">
                  
                  {/* Focus Guide Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowFocusGuide(!showFocusGuide)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer border ${
                      showFocusGuide
                        ? 'bg-[#C5A059]/15 text-[#C5A059] border-[#C5A059]/30 shadow-sm'
                        : 'bg-white/5 text-stone-500 border-white/5 hover:text-stone-300'
                    }`}
                    title="O'qish uchun fokus chizig'ini yoqish/o'chirish"
                  >
                    {showFocusGuide ? <Eye size={13} /> : <EyeOff size={13} />}
                    <span className="hidden sm:inline">Fokus</span>
                  </button>

                  {/* Auto-scroll Speed Segmented Control */}
                  <div className="flex items-center gap-0.5 bg-black/50 p-0.5 rounded-lg border border-white/10 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setAutoScrollSpeed(0)}
                      className={`px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
                        autoScrollSpeed === 0 
                          ? 'bg-stone-800 text-white font-bold shadow-sm' 
                          : 'text-stone-400 hover:text-white'
                      }`}
                      title="Avto-siljishni to'xtatish"
                    >
                      Pauza
                    </button>
                    <button
                      type="button"
                      onClick={() => setAutoScrollSpeed(1)}
                      className={`px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
                        autoScrollSpeed === 1 
                          ? 'bg-[#C5A059] text-black font-bold shadow-sm' 
                          : 'text-stone-400 hover:text-white'
                      }`}
                      title="Sekin tezlik"
                    >
                      1x
                    </button>
                    <button
                      type="button"
                      onClick={() => setAutoScrollSpeed(2)}
                      className={`px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
                        autoScrollSpeed === 2 
                          ? 'bg-[#C5A059] text-black font-bold shadow-sm' 
                          : 'text-stone-400 hover:text-white'
                      }`}
                      title="O'rtacha tezlik"
                    >
                      1.5x
                    </button>
                    <button
                      type="button"
                      onClick={() => setAutoScrollSpeed(3)}
                      className={`px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
                        autoScrollSpeed === 3 
                          ? 'bg-[#E05638] text-white font-bold shadow-sm' 
                          : 'text-stone-400 hover:text-white'
                      }`}
                      title="Tez siljish"
                    >
                      2x
                    </button>
                  </div>

                  {/* Font Size Adjust */}
                  <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-lg border border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setFontSize(prev => Math.max(15, prev - 2))}
                      className="p-0.5 text-stone-400 hover:text-white cursor-pointer"
                      title="Shriftni kichraytirish"
                    >
                      A-
                    </button>
                    <span className="text-[10px] font-mono text-stone-500 px-1 select-none">
                      {fontSize}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFontSize(prev => Math.min(26, prev + 2))}
                      className="p-0.5 text-stone-400 hover:text-white cursor-pointer"
                      title="Shriftni kattalashtirish"
                    >
                      A+
                    </button>
                  </div>

                </div>

              </div>

              {/* Scrollable Editorial Teleprompter Canvas */}
              <div className="relative flex-1 overflow-hidden">
                
                {/* Visual Eyeline Laser / Focus Guide across upper reading zone */}
                {showFocusGuide && (
                  <div className="absolute top-[35%] left-0 right-0 pointer-events-none z-20 flex items-center justify-between px-4 sm:px-8 select-none">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#C5A059] shadow-[0_0_8px_#C5A059] shrink-0" />
                    <div className="flex-1 mx-3 h-[1px] bg-gradient-to-r from-[#C5A059]/40 via-[#C5A059]/70 to-[#C5A059]/40 shadow-[0_0_8px_rgba(197,160,89,0.3)]" />
                    <span className="text-[9px] font-mono tracking-widest uppercase text-[#C5A059]/80 px-2 py-0.5 rounded bg-black/60 border border-[#C5A059]/30">
                      O'qish Chizig'i
                    </span>
                  </div>
                )}

                <div 
                  ref={teleprompterBoxRef}
                  className="h-full overflow-y-auto px-6 sm:px-12 py-10 font-serif selection:bg-[#C5A059]/30 selection:text-[#FFF]"
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: 2.1,
                    scrollBehavior: 'smooth'
                  }}
                >
                  {isLoadingChapters ? (
                    <div className="h-full flex flex-col items-center justify-center py-20 space-y-3">
                      <Loader2 size={32} className="animate-spin text-[#C5A059]" />
                      <p className="text-xs text-stone-400 font-sans tracking-wide">
                        Kitob sahifalari va matnlari o'qilmoqda...
                      </p>
                    </div>
                  ) : (
                    <div className="max-w-2xl mx-auto space-y-6 pb-40">
                      
                      {/* Chapter Title Badge & Metadata */}
                      <div className="pb-6 border-b border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-stone-400 text-xs font-mono">
                          <span className="uppercase tracking-widest text-[#C5A059] text-[11px] font-semibold">
                            {book.title} • {currentChapterIndex + 1} / {chapters.length}-bob
                          </span>
                          <span className="text-stone-500">
                            {wordCount} ta so'z • ~{estimatedReadingMinutes} daqiqa
                          </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                          {currentChapter.title}
                        </h2>
                      </div>

                      {/* Editorial Drop-Cap Text */}
                      <div className="text-[#EAE6DF] whitespace-pre-line text-justify tracking-normal select-text leading-relaxed">
                        {currentChapter.content ? (
                          currentChapter.content
                        ) : (
                          <p className="text-stone-500 italic">
                            Ushbu bob uchun raqamlashtirilgan matn mavjud emas. Kitobingizning qo'lda bor nusxasidan o'qib ovoz yozishingiz mumkin.
                          </p>
                        )}
                      </div>

                      {/* Chapter End Literary Seal */}
                      <div className="pt-12 text-center text-xs text-stone-500 font-sans border-t border-white/5 space-y-1">
                        <div className="text-stone-400 font-mono">
                          ✦ {currentChapter.number}-bob yakunlandi • Ovoz yozuvini to'xtatish uchun o'ngdagi konsoldan foydalaning ✦
                        </div>
                      </div>

                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* ── RIGHT BAY: Master Sound Console & Acoustic Deck (40% width) ── */}
            <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between bg-[#101219] border-t lg:border-t-0 border-white/5 space-y-5 overflow-y-auto">
              
              {/* Top: Unified Acoustic Cockpit (Timecode + Oscilloscope + VU HUD) */}
              <div className="space-y-4">
                
                {/* The Recessed Glass HUD */}
                <div className="relative rounded-2xl bg-[#08090C] border border-white/10 shadow-2xl p-4 overflow-hidden">
                  
                  {/* HUD Header Strip */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 border-b border-white/5 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-stone-600'}`} />
                      <span className="text-stone-300 font-semibold tracking-wider">
                        {isRecording ? "CH-01 • REC MASTER" : "CH-01 • AUDIO MONITOR"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-stone-500">VU PEAK:</span>
                      <span className={
                        micDbLevel > -6 
                          ? 'text-red-400' 
                          : micDbLevel > -18 
                          ? 'text-[#C5A059]' 
                          : 'text-emerald-400'
                      }>
                        {isRecording ? `${micDbLevel} dB` : 'OFF'}
                      </span>
                    </div>
                  </div>

                  {/* High-Precision Digital Timecode Display */}
                  <div className="text-center py-2 relative">
                    <span className="text-[9px] font-mono tracking-widest uppercase text-stone-500 block mb-1">
                      {isRecording ? "Yozilayotgan Vaqt (Time Elapsed)" : audioBlob ? "Trek Davomiyligi" : "Kutish Vaqti"}
                    </span>
                    <div className="font-mono font-bold text-4xl sm:text-5xl tracking-widest text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)] select-none">
                      {formatTimecode(recordingSeconds)}
                    </div>
                  </div>

                  {/* High-Resolution Spectrum Canvas */}
                  <div className="relative h-24 rounded-xl bg-black/60 border border-white/5 overflow-hidden flex items-center justify-center my-2">
                    <canvas 
                      ref={canvasRef} 
                      width={440} 
                      height={96} 
                      className="w-full h-full object-cover"
                    />

                    {!isRecording && !audioBlob && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-500 text-xs space-y-1 bg-black/40 backdrop-blur-[1px]">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-stone-400">
                          <Mic size={16} className="text-[#C5A059]" />
                        </div>
                        <span className="text-[10px] font-mono text-stone-400">
                          Mikrofon tayyor • 48 kHz / 24-bit
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Studio Level Meter (Multi-segment VU bar) */}
                  <div className="pt-2">
                    <div className="flex justify-between text-[9px] font-mono text-stone-500 mb-1 px-1">
                      <span>-48dB</span>
                      <span>-24dB</span>
                      <span>-12dB</span>
                      <span>-6dB</span>
                      <span className="text-red-400 font-bold">0dB</span>
                    </div>
                    <div className="h-2 rounded-full bg-stone-900 border border-white/5 overflow-hidden p-0.5">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-[#C5A059] to-red-500 transition-all duration-75"
                        style={{ width: `${isRecording ? micVolumePercent : 0}%` }}
                      />
                    </div>
                  </div>

                </div>

                {/* Track Channel Identifier (Tape Label Style) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono tracking-wider uppercase text-stone-400 flex items-center justify-between">
                    <span>Trek Identifikatori (Bob Nomi):</span>
                    <span className="text-stone-500">Avto-biriktiriladi</span>
                  </label>
                  <input
                    type="text"
                    value={trackTitle}
                    onChange={(e) => setTrackTitle(e.target.value)}
                    placeholder="1-bob: Kirish qismi"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-xs font-mono text-white placeholder-stone-600 focus:outline-none focus:border-[#C5A059] transition-colors shadow-inner"
                  />
                </div>

              </div>

              {/* ── Middle: Master Tactile Broadcast Record Cockpit ── */}
              <div className="space-y-4 pt-1">
                
                {/* 1. STANDBY: Master Circular Broadcast Button */}
                {!isRecording && !audioBlob && (
                  <div className="flex flex-col items-center justify-center py-2 space-y-3">
                    <button
                      type="button"
                      onClick={startRecording}
                      className="group relative w-24 h-24 rounded-full flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                      style={{
                        background: 'radial-gradient(circle at 30% 30%, #303545, #151822)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.6), inset 0 2px 3px rgba(255,255,255,0.2), inset 0 -3px 5px rgba(0,0,0,0.5)'
                      }}
                      title="Ovoz yozishni boshlash"
                    >
                      {/* Metallic outer bezel */}
                      <div className="absolute inset-1 rounded-full border-2 border-stone-700/80 group-hover:border-[#C5A059]/60 transition-colors" />

                      {/* Glowing ruby inner core */}
                      <div 
                        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all group-hover:scale-105"
                        style={{
                          background: 'radial-gradient(circle at 35% 35%, #EF4444, #991B1B)',
                          boxShadow: '0 0 25px rgba(239, 68, 68, 0.4), inset 0 2px 4px rgba(255,255,255,0.3)'
                        }}
                      >
                        <div className="w-5 h-5 rounded-full bg-white shadow-md animate-pulse" />
                      </div>
                    </button>

                    <div className="text-center space-y-0.5">
                      <span className="font-bold text-xs tracking-wider uppercase text-white block">
                        Ovoz Yozishni Boshlash
                      </span>
                      <span className="text-[10px] font-mono text-stone-400 block">
                        Qizil tugmani bosing • Mikrofon 48kHz
                      </span>
                    </div>
                  </div>
                )}

                {/* 2. RECORDING: Tactile Master Pause & Stop Strip */}
                {isRecording && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={pauseRecording}
                        className="py-3.5 rounded-xl font-mono font-bold text-xs text-white transition-all active:scale-[0.98] bg-white/10 hover:bg-white/15 border border-white/10 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isPaused ? <Play size={16} className="text-emerald-400" /> : <Pause size={16} className="text-amber-400" />}
                        <span>{isPaused ? "Davom Etish" : "Pauza"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={stopRecording}
                        className="py-3.5 rounded-xl font-mono font-bold text-xs text-white transition-all active:scale-[0.98] bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/30 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Square size={16} fill="white" />
                        <span>To'xtatish (Stop)</span>
                      </button>
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] font-mono text-stone-400 flex items-center justify-center gap-1.5">
                        <Radio size={12} className="text-red-400 animate-pulse" />
                        <span>Trek yozilmoqda. Matnni maromida talaffuz qiling.</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. AUDIO REVIEW STATE: Custom Luxury Player & AWS Upload */}
                {audioBlob && !isRecording && (
                  <div className="p-4 rounded-2xl bg-[#090A0E] border border-white/10 space-y-3.5 animate-in fade-in shadow-xl">
                    
                    {/* Header: Verified Recording Status & Retake Button */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-emerald-400" />
                        <span>Yozuv Tayyor ({formatTimecode(recordingSeconds)})</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="text-[11px] font-mono text-stone-400 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Ushbu yozuvni bekor qilib qayta boshlash"
                      >
                        <RotateCcw size={12} />
                        <span>Qayta yozish</span>
                      </button>
                    </div>

                    {/* Hidden Native Audio Element */}
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

                    {/* Bespoke Custom Studio Player Scrubber */}
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
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
                        className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E05638] to-[#C5A059] text-white flex items-center justify-center shrink-0 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                        title={isPlayingPreview ? "Pauza" : "Eshitib ko'rish"}
                      >
                        {isPlayingPreview ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                      </button>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-stone-400">
                          <span className="text-white font-bold">{formatTimecode(Math.floor(playbackCurrentTime))}</span>
                          <span>{formatTimecode(Math.floor(playbackDuration || recordingSeconds))}</span>
                        </div>
                        <div 
                          className="h-1.5 rounded-full bg-stone-800 cursor-pointer overflow-hidden relative"
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
                            className="h-full rounded-full bg-[#C5A059] transition-all"
                            style={{ 
                              width: `${playbackDuration ? (playbackCurrentTime / playbackDuration) * 100 : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* AWS Authoritative Save Button */}
                    <button
                      type="button"
                      onClick={handleUploadToAws}
                      disabled={isUploading}
                      className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 shadow-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:brightness-110 shadow-emerald-600/25"
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
              <div className="pt-3 border-t border-white/5 space-y-2.5 text-xs text-stone-300 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders size={13} className="text-[#C5A059]" />
                    <span className="font-medium text-stone-300">Shovqin filtri (Noise Gate):</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNoiseSuppression(!noiseSuppression)}
                    disabled={isRecording}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      noiseSuppression ? 'bg-[#C5A059]' : 'bg-white/20'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full bg-stone-950 absolute top-0.5 transition-transform ${
                      noiseSuppression ? 'right-0.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 size={13} className="text-[#C5A059]" />
                    <span className="font-medium text-stone-300">Aks-sado to'siq (Echo Cancel):</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEchoCancellation(!echoCancellation)}
                    disabled={isRecording}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      echoCancellation ? 'bg-[#C5A059]' : 'bg-white/20'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full bg-stone-950 absolute top-0.5 transition-transform ${
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
