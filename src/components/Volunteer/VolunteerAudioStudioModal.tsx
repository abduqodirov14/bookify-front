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
  Layers,
  ArrowDown,
  Loader2,
  Check
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

  // Teleprompter Reading Experience
  const [fontSize, setFontSize] = useState<number>(18);
  const [isAutoScroll, setIsAutoScroll] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState<number>(1); // 1 = slow, 2 = medium, 3 = fast
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
              content: book.description || "Ushbu asar uchun matn kiritilmagan. O'zingizdagi kitob nusxasidan o'qib, ovoz yozishingiz mumkin."
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
      // If title doesn't contain 'bob', prepend it cleanly
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
    if (isAutoScroll && isRecording && !isPaused) {
      const step = autoScrollSpeed === 1 ? 1 : autoScrollSpeed === 2 ? 2 : 3;
      autoScrollIntervalRef.current = setInterval(() => {
        if (teleprompterBoxRef.current) {
          teleprompterBoxRef.current.scrollTop += step;
        }
      }, 50);
    } else {
      if (autoScrollIntervalRef.current) clearInterval(autoScrollIntervalRef.current);
    }
    return () => {
      if (autoScrollIntervalRef.current) clearInterval(autoScrollIntervalRef.current);
    };
  }, [isAutoScroll, isRecording, isPaused, autoScrollSpeed]);

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

    // Draw Studio Frequency Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let y = height / 4; y < height; y += height / 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Dynamic studio golden/copper spectrum bars
    const barWidth = (width / bufferLength) * 2.1;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const value = dataArray[i] / 255;
      const barHeight = value * height * 0.9;

      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, 'rgba(224, 86, 56, 0.2)');
      gradient.addColorStop(0.5, '#C5A059');
      gradient.addColorStop(0.9, '#E05638');
      gradient.addColorStop(1, '#FF7A59');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, height - barHeight, barWidth - 2, barHeight, [3, 3, 0, 0]);
      ctx.fill();

      // Peak highlight dot
      if (barHeight > 6) {
        ctx.fillStyle = '#FFE5A3';
        ctx.fillRect(x, height - barHeight - 2, barWidth - 2, 2);
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

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

      drawWaveform();
      toast.success("Ovoz yozish boshlandi. Matnni maromida o'qishingiz mumkin.", { icon: '🎙' });

    } catch (err: any) {
      console.error("[Studio Error]", err);
      toast.error("Mikrofonga ulanib bo'lmadi. Iltimos, brauzerda mikrofon ruxsatini yoqing!");
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
      setIsAutoScroll(false);
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

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[1300] bg-black/85 backdrop-blur-lg flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-6xl bg-[#0F1117] border border-stone-800 rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-200 text-stone-200"
        style={{
          boxShadow: '0 30px 80px -15px rgba(0, 0, 0, 0.8), 0 0 60px rgba(197, 160, 89, 0.1)'
        }}
      >
        {/* Top copper-gold hairline */}
        <div className="h-1 w-full bg-gradient-to-r from-[#E05638] via-[#C5A059] to-[#E05638]" />

        {/* ── Studio Header ── */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between gap-4 bg-[#141822]">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#E05638]/20 via-[#C5A059]/15 to-transparent border border-[#C5A059]/30 flex items-center justify-center text-xl shrink-0 shadow-sm text-[#C5A059]">
              🎙
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-serif font-bold text-base sm:text-lg text-white tracking-tight">
                  Bookify Ovoz Yozish Studiyasi
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Studiya Rejimi
                </span>
              </div>
              <p className="text-xs text-stone-400 truncate mt-0.5">
                Asar: <span className="text-white font-medium">«{book.title}»</span> • Diktor: <span className="text-[#C5A059] font-medium">{currentUser?.name || 'Volontyor'}</span>
              </p>
            </div>
          </div>

          {/* On Air Status & Close */}
          <div className="flex items-center gap-3 shrink-0">
            {isRecording ? (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border transition-all ${
                isPaused 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-red-500/20 text-red-400 border-red-500/50 shadow-lg shadow-red-500/20 animate-pulse'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-red-500'}`} />
                <span>{isPaused ? 'PAUZA' : '● ON AIR'}</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-stone-400 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                <span className="w-2 h-2 rounded-full bg-stone-500" />
                <span>Kutish Rejimi</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Yopish"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Main View (Studio vs Success) ── */}
        {isSuccess ? (
          /* ── SUCCESS STATE ── */
          <div className="p-8 sm:p-12 text-center space-y-5 flex-1 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 flex items-center justify-center text-4xl border border-emerald-500/30 shadow-xl shadow-emerald-500/10">
              <CheckCircle2 size={42} className="text-emerald-400" />
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Audio Muvaffaqiyatli Saqlandi!
              </h2>
              <p className="text-sm text-stone-400 leading-relaxed">
                «{book.title}» asarining <strong>{trackTitle}</strong> audio treki AWS serveringizga to'liq joylashtirildi va asar tinglovchilari uchun tayyorlandi.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141822] border border-white/10 text-left w-full max-w-sm space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-stone-400">Yozilgan Bob:</span>
                <span className="font-semibold text-white truncate max-w-[200px]">{uploadedTrackInfo?.title || trackTitle}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-stone-400">Davomiyligi:</span>
                <span className="font-mono text-[#C5A059] font-bold">{formatTime(recordingSeconds)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Qo'shilgan staj:</span>
                <span className="font-bold text-emerald-400">+{Math.max(0.25, Math.round((recordingSeconds / 3600) * 100) / 100)} soat</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setIsSuccess(false);
                  handleReset();
                  setCurrentChapterIndex(prev => Math.min(chapters.length - 1, prev + 1));
                }}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>Keyingi Bobga O'tish</span>
                <ChevronRight size={14} />
              </button>
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#E05638] to-[#C5A059] text-white font-bold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                Studiyadan Chiqish
              </button>
            </div>
          </div>
        ) : (
          /* ── STUDIO GRID ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
            
            {/* ── LEFT: Teleprompter Reading Surface ── */}
            <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 bg-[#0C0E14] overflow-hidden">
              
              {/* Teleprompter Bar */}
              <div className="px-5 py-3 bg-[#131620] border-b border-white/5 flex items-center justify-between gap-3 flex-wrap">
                
                {/* Chapter Dropdown / Stepper */}
                <div className="flex items-center gap-2 min-w-0">
                  <BookOpen size={16} className="text-[#E05638] shrink-0" />
                  
                  {isLoadingChapters ? (
                    <span className="text-xs text-stone-400 flex items-center gap-1.5">
                      <Loader2 size={13} className="animate-spin text-[#C5A059]" />
                      <span>Matn yuklanmoqda...</span>
                    </span>
                  ) : chapters.length > 1 ? (
                    <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-xl border border-white/10">
                      <button
                        onClick={() => setCurrentChapterIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentChapterIndex === 0}
                        className="p-1 rounded text-stone-400 hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Oldingi bob"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      
                      <select
                        value={currentChapterIndex}
                        onChange={(e) => setCurrentChapterIndex(Number(e.target.value))}
                        className="bg-transparent text-xs font-serif font-medium text-stone-200 outline-none cursor-pointer max-w-[180px] sm:max-w-[240px] truncate"
                      >
                        {chapters.map((ch, idx) => (
                          <option key={ch.id} value={idx} className="bg-stone-900 text-white">
                            {ch.title || `${idx + 1}-bob`}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => setCurrentChapterIndex(prev => Math.min(chapters.length - 1, prev + 1))}
                        disabled={currentChapterIndex === chapters.length - 1}
                        className="p-1 rounded text-stone-400 hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Keyingi bob"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-serif font-bold text-stone-200 truncate">
                      {currentChapter.title}
                    </span>
                  )}
                </div>

                {/* Teleprompter Controls (Font & Auto-Scroll) */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Auto-scroll button */}
                  <button
                    onClick={() => setIsAutoScroll(!isAutoScroll)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      isAutoScroll
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-white/5 text-stone-400 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                    title="Matnni avtomatik yuqoriga siljitish"
                  >
                    <ArrowDown size={13} className={isAutoScroll ? 'animate-bounce text-amber-400' : ''} />
                    <span>{isAutoScroll ? 'Avto-siljish: ON' : 'Avto-siljish'}</span>
                  </button>

                  {/* Font Size Adjust */}
                  <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
                    <button
                      onClick={() => setFontSize(prev => Math.max(15, prev - 2))}
                      className="p-0.5 text-xs text-stone-400 hover:text-white cursor-pointer"
                      title="Shriftni kichiklashtirish"
                    >
                      A-
                    </button>
                    <span className="text-[10px] font-mono text-stone-500 px-1">
                      {fontSize}
                    </span>
                    <button
                      onClick={() => setFontSize(prev => Math.min(24, prev + 2))}
                      className="p-0.5 text-xs text-stone-400 hover:text-white cursor-pointer"
                      title="Shriftni kattalashtirish"
                    >
                      A+
                    </button>
                  </div>
                </div>
              </div>

              {/* Scrollable Book Text Area */}
              <div 
                ref={teleprompterBoxRef}
                className="p-6 sm:p-10 overflow-y-auto flex-1 font-serif selection:bg-amber-500/30 selection:text-amber-200"
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: 1.9,
                  scrollBehavior: 'smooth'
                }}
              >
                {isLoadingChapters ? (
                  <div className="py-20 text-center space-y-3">
                    <Loader2 size={28} className="animate-spin text-[#C5A059] mx-auto" />
                    <p className="text-xs text-stone-500 font-sans">Kitob sahifalari va matnlari o'qilmoqda...</p>
                  </div>
                ) : (
                  <div className="max-w-2xl mx-auto space-y-6">
                    <div className="pb-4 border-b border-white/5 space-y-1">
                      <span className="text-[11px] font-mono uppercase tracking-widest text-[#C5A059] block">
                        {book.title} • {currentChapterIndex + 1} / {chapters.length}-bob
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold text-white">
                        {currentChapter.title}
                      </h2>
                    </div>

                    {/* Editorial Rich Text */}
                    <div className="text-stone-300 whitespace-pre-line text-justify tracking-normal">
                      {currentChapter.content ? (
                        currentChapter.content
                      ) : (
                        <p className="text-stone-500 italic">
                          Ushbu bob uchun raqamlashtirilgan matn mavjud emas. Kitobingizning qo'lda bor nusxasidan o'qib ovoz yozishingiz mumkin.
                        </p>
                      )}
                    </div>

                    <div className="pt-8 text-center text-xs text-stone-500 font-sans border-t border-white/5 space-y-1">
                      <div>✦ Bob yakuni. Ovoz yozishni to'xtatish uchun o'ngdagi tugmani bosing.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT: Audio Engineering Console ── */}
            <div className="lg:col-span-5 p-6 sm:p-7 flex flex-col justify-between bg-[#11141C] space-y-6 overflow-y-auto">
              
              {/* Studio Waveform Display with dB scale */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-stone-300 flex items-center gap-2">
                    <Radio size={14} className={isRecording ? 'text-red-400 animate-pulse' : 'text-[#C5A059]'} />
                    <span>Akustik Spektrogramma</span>
                  </span>
                  <span className="font-mono text-[11px] text-stone-400">
                    {isRecording ? `${micDbLevel} dB` : 'Tayyor'}
                  </span>
                </div>

                <div className="relative h-32 rounded-2xl bg-[#090A0E] border border-white/10 overflow-hidden shadow-inner flex items-center justify-center">
                  <canvas 
                    ref={canvasRef} 
                    width={420} 
                    height={128} 
                    className="w-full h-full object-cover"
                  />

                  {!isRecording && !audioBlob && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-500 text-xs space-y-1.5">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-stone-400">
                        <Mic size={20} />
                      </div>
                      <span className="text-[11px] text-stone-400 font-sans">Mikrofon yozishga shay</span>
                    </div>
                  )}

                  {/* Level meter bar at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/50">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 transition-all duration-75"
                      style={{ width: `${isRecording ? micVolumePercent : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Broadcast Digital Timecode */}
              <div className="p-5 rounded-2xl bg-[#141824] border border-white/5 text-center space-y-1 shadow-sm">
                <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block">
                  {isRecording ? "Jonli Yozuv Vaqti" : audioBlob ? "Yozilgan Vaqt" : "Taymer"}
                </span>
                <div className="font-mono font-bold text-4xl sm:text-5xl text-white tracking-wider drop-shadow-md">
                  {formatTime(recordingSeconds)}
                </div>
              </div>

              {/* Track Title Metadata Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-300 block">
                  Audio Bob Nomi:
                </label>
                <input
                  type="text"
                  value={trackTitle}
                  onChange={(e) => setTrackTitle(e.target.value)}
                  placeholder="Masalan: 1-bob: Muqaddima"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#C5A059] transition-colors"
                />
              </div>

              {/* ── RECORDING MASTER CONTROLS ── */}
              <div className="space-y-3 pt-1">
                {!isRecording && !audioBlob && (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="w-full py-4 rounded-2xl font-bold text-sm sm:text-base text-white transition-all active:scale-[0.98] shadow-xl cursor-pointer flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:brightness-110 shadow-red-600/30"
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-white animate-pulse" />
                    <span>Ovoz Yozishni Boshlash 🔴</span>
                  </button>
                )}

                {isRecording && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={pauseRecording}
                      className="py-3.5 rounded-xl font-bold text-xs text-white transition-all active:scale-[0.98] bg-white/10 hover:bg-white/15 border border-white/10 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isPaused ? <Play size={15} /> : <Pause size={15} />}
                      <span>{isPaused ? "Davom ettirish" : "Pauza"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={stopRecording}
                      className="py-3.5 rounded-xl font-bold text-xs text-white transition-all active:scale-[0.98] bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/25 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Square size={15} fill="white" />
                      <span>Yakunlash (Stop) ⏹</span>
                    </button>
                  </div>
                )}

                {/* ── AUDIO REVIEW STATE ── */}
                {audioBlob && !isRecording && (
                  <div className="p-4 rounded-2xl bg-[#141824] border border-white/10 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-emerald-400" />
                        <span>Yozuv Muvaffaqiyatli ({formatTime(recordingSeconds)})</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="text-[11px] text-stone-400 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw size={12} />
                        <span>Qayta yozish</span>
                      </button>
                    </div>

                    {/* Audio Preview Player */}
                    {audioUrl && (
                      <audio 
                        src={audioUrl} 
                        controls 
                        className="w-full h-9 rounded-xl outline-none"
                      />
                    )}

                    {/* AWS Save Button */}
                    <button
                      type="button"
                      onClick={handleUploadToAws}
                      disabled={isUploading}
                      className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 shadow-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:brightness-105 shadow-emerald-600/25"
                    >
                      {isUploading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          <span>AWS Serverga Yuklanmoqda ({uploadProgress}%)...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <UploadCloud size={16} />
                          <span>☁️ AWS Serverga Saqlash</span>
                        </div>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* ── Hardware DSP Toggles (Custom Clean Switches) ── */}
              <div className="pt-3 border-t border-white/5 space-y-2.5 text-xs text-stone-300">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sliders size={14} className="text-[#C5A059]" />
                    <span>Shovqinni tozalash (Noise suppression):</span>
                  </span>
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
                  <span className="flex items-center gap-2">
                    <Volume2 size={14} className="text-[#C5A059]" />
                    <span>Aks-sadoni bartaraf etish (Echo cancel):</span>
                  </span>
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
