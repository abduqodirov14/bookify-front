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
  Sliders, 
  CheckCircle2, 
  Volume2, 
  Radio, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Type,
  Maximize2,
  Minimize2,
  AlertCircle
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

export default function VolunteerAudioStudioModal({
  book,
  currentUser,
  onClose,
  onSuccessUpload
}: Props) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0); // in seconds
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploadedTrackInfo, setUploadedTrackInfo] = useState<any>(null);

  // Audio settings
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [micLevel, setMicLevel] = useState(0);

  // Teleprompter
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [fontSize, setFontSize] = useState<number>(18); // px
  const [trackTitle, setTrackTitle] = useState('');

  // ── Refs ───────────────────────────────────────────────────────────────────
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const teleprompterRef = useRef<HTMLDivElement | null>(null);

  const chapters = book.chapters && book.chapters.length > 0 
    ? book.chapters 
    : [
        {
          id: 'ch-1',
          number: 1,
          title: book.title,
          content: book.description || "Ushbu asar uchun matn kiritilmagan. O'zingizdagi kitob nusxasidan o'qib, ovoz yozishingiz mumkin."
        }
      ];

  const currentChapter = chapters[currentChapterIndex] || chapters[0];

  // Set default track title
  useEffect(() => {
    if (currentChapter) {
      setTrackTitle(`${currentChapter.number || currentChapterIndex + 1}-bob: ${currentChapter.title || 'Asar qismi'}`);
    }
  }, [currentChapter, currentChapterIndex]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupAudioStream();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // ── Canvas Waveform Visualizer (60 FPS Native Web Audio Engine) ───────────
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Calculate current RMS mic level
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const avg = sum / bufferLength;
    setMicLevel(Math.min(100, Math.round((avg / 255) * 100)));

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Dynamic studio frequency bars
    const barWidth = (width / bufferLength) * 2.2;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * height * 0.85;

      // Studio gold-to-terracotta gradient
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, 'rgba(224, 86, 56, 0.2)');
      gradient.addColorStop(0.5, '#C5A059');
      gradient.addColorStop(1, '#E05638');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, height - barHeight, barWidth - 1.5, barHeight, [3, 3, 0, 0]);
      ctx.fill();

      x += barWidth;
    }

    if (isRecording && !isPaused) {
      animationFrameRef.current = requestAnimationFrame(drawWaveform);
    }
  }, [isRecording, isPaused]);

  // ── Start Audio Engine ────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      cleanupAudioStream();
      audioChunksRef.current = [];
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);

      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: echoCancellation,
          noiseSuppression: noiseSuppression,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Initialize Web Audio Context (C++ WebAudio Engine)
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx({ sampleRate: 48000 });
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Preferred MIME types with native C++ Opus encoder
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

      // Start recording with 500ms time slice for memory safety
      recorder.start(500);
      setIsRecording(true);
      setIsPaused(false);

      // Start live timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Start Visualizer
      drawWaveform();
      toast.success("Ovoz yozish boshlandi! O'qishni boshlashingiz mumkin.", { icon: '🎙' });

    } catch (err: any) {
      console.error("[Audio Studio Error]", err);
      toast.error("Mikrofonga ruxsat berilmadi yoki mikrofon topilmadi!");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        timerIntervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
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
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      cleanupAudioStream();
      toast.success("Ovoz muvaffaqiyatli yozildi! Eshitib ko'rishingiz mumkin.", { icon: '✨' });
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
    setRecordingTime(0);
    setIsRecording(false);
    setIsPaused(false);
  };

  // ── Upload to AWS EC2 Backend ─────────────────────────────────────────────
  const handleUploadToAws = async () => {
    if (!audioBlob) {
      toast.error("Avval audio yozib oling!");
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      const progressTimer = setInterval(() => {
        setUploadProgress(prev => (prev < 85 ? prev + 15 : prev));
      }, 300);

      const result = await api.uploadVolunteerAudio(book.id, audioBlob, {
        chapterId: currentChapter.id,
        trackTitle: trackTitle,
        durationSeconds: recordingTime
      });

      clearInterval(progressTimer);
      setUploadProgress(100);

      setIsSuccess(true);
      setUploadedTrackInfo(result);
      toast.success("Asar audiosi AWS serveringizga muvaffaqiyatli saqlandi! 🎉");
      
      if (onSuccessUpload) onSuccessUpload();

    } catch (err: any) {
      toast.error(err.message || "Audioni serverga yuklashda xatolik yuz berdi");
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[1300] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl bg-stone-950 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-200 text-stone-200"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 50px rgba(197, 160, 89, 0.12)'
        }}
      >
        {/* Luxury top accent gradient line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#E05638] via-[#C5A059] to-[#E05638]" />

        {/* ── Studio Header ── */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4 bg-stone-900/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E05638]/20 to-[#C5A059]/20 border border-white/10 flex items-center justify-center text-xl shrink-0">
              🎙
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base sm:text-lg text-white truncate">
                  Bookify Ovoz Yozish Studiyasi
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  C++ Web Audio 48kHz
                </span>
              </div>
              <p className="text-xs text-stone-400 truncate">
                Asar: <span className="text-white font-medium">«{book.title}»</span> • Diktor: <span className="text-[#C5A059]">{currentUser?.name || 'Volontyor'}</span>
              </p>
            </div>
          </div>

          {/* On Air Indicator & Close */}
          <div className="flex items-center gap-3 shrink-0">
            {isRecording && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border transition-all ${
                isPaused 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-red-500/20 text-red-400 border-red-500/50 shadow-lg shadow-red-500/20 animate-pulse'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-red-500'}`} />
                <span>{isPaused ? 'PAUZA' : '● ON AIR'}</span>
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

        {/* ── Success Modal View ── */}
        {isSuccess ? (
          <div className="p-8 sm:p-12 text-center space-y-5 flex-1 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-4xl border border-emerald-500/30 shadow-xl shadow-emerald-500/10 animate-bounce">
              🎉
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Audio Yozuv Qabul Qilindi!
              </h2>
              <p className="text-sm text-stone-400 leading-relaxed">
                «{book.title}» asari uchun yozgan ovozingiz AWS EC2 serverimizga muvaffaqiyatli saqlandi va kitobga qo'shildi.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left w-full max-w-sm space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400">Audio nomi:</span>
                <span className="font-semibold text-white truncate max-w-[180px]">{uploadedTrackInfo?.title || trackTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Davomiyligi:</span>
                <span className="font-mono text-[#C5A059]">{formatTime(recordingTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Volontyorlik hisobingiz:</span>
                <span className="font-bold text-emerald-400">+{Math.max(0.25, Math.round(recordingTime / 3600 * 100) / 100)} soat staj</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setIsSuccess(false);
                  handleReset();
                }}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Keyingi Bobni Yozish
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
          /* ── Main Studio Grid ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
            
            {/* ── LEFT: Interactive Teleprompter (Book Text View) ── */}
            <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-white/10 bg-stone-900/40 overflow-hidden">
              
              {/* Teleprompter Toolbar */}
              <div className="px-4 py-2.5 bg-black/40 border-b border-white/5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <BookOpen size={15} className="text-[#E05638] shrink-0" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-300">
                    Teleprompter (Kitob Matni)
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Chapter Selector */}
                  {chapters.length > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentChapterIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentChapterIndex === 0}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 cursor-pointer text-xs"
                        title="Oldingi bob"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="text-[11px] font-mono text-stone-400 px-1">
                        {currentChapterIndex + 1}/{chapters.length}
                      </span>
                      <button
                        onClick={() => setCurrentChapterIndex(prev => Math.min(chapters.length - 1, prev + 1))}
                        disabled={currentChapterIndex === chapters.length - 1}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 cursor-pointer text-xs"
                        title="Keyingi bob"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}

                  {/* Font Size Adjust */}
                  <div className="flex items-center gap-1 border-l border-white/10 pl-2">
                    <button
                      onClick={() => setFontSize(prev => Math.max(14, prev - 2))}
                      className="p-1 text-xs text-stone-400 hover:text-white rounded bg-white/5 hover:bg-white/10 cursor-pointer"
                      title="Shriftni kichraytirish"
                    >
                      A-
                    </button>
                    <span className="text-[10px] font-mono text-stone-400 w-5 text-center">
                      {fontSize}
                    </span>
                    <button
                      onClick={() => setFontSize(prev => Math.min(26, prev + 2))}
                      className="p-1 text-xs text-stone-400 hover:text-white rounded bg-white/5 hover:bg-white/10 cursor-pointer"
                      title="Shriftni kattalashtirish"
                    >
                      A+
                    </button>
                  </div>
                </div>
              </div>

              {/* Scrollable Teleprompter Content */}
              <div 
                ref={teleprompterRef}
                className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-4 font-serif selection:bg-amber-500/30 selection:text-amber-200"
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: 1.8,
                  scrollBehavior: 'smooth'
                }}
              >
                <div className="pb-3 border-b border-white/10">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                    {book.title}
                  </div>
                  <h1 className="font-bold text-xl sm:text-2xl text-white">
                    {currentChapter.title || `${currentChapter.number}-bob`}
                  </h1>
                </div>

                <div className="text-stone-300 leading-relaxed whitespace-pre-line">
                  {currentChapter.content || (
                    <p className="text-stone-400 italic">
                      Ushbu bob uchun matn kiritilmagan. Kitob nusxangizdan o'qib, ovoz yozishingiz mumkin.
                    </p>
                  )}
                </div>

                <div className="pt-8 text-center text-xs text-stone-500 font-sans border-t border-white/5">
                  ✦ Bob yakunlandi. Ovoz yozishni yakunlash uchun o'ngdagi «Stop» tugmasini bosing.
                </div>
              </div>
            </div>

            {/* ── RIGHT: Audio Recording Studio Console ── */}
            <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between bg-black/60 space-y-5 overflow-y-auto">
              
              {/* Studio VU Meter / Visualizer */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-stone-400 flex items-center gap-1.5">
                    <Radio size={14} className={isRecording ? 'text-red-400 animate-pulse' : 'text-stone-500'} />
                    <span>Real-time Spektrogramma</span>
                  </span>
                  <span className="font-mono text-[11px] text-stone-500">
                    Sezgirlik: {micLevel}%
                  </span>
                </div>

                <div className="relative h-28 rounded-2xl bg-stone-900/90 border border-white/10 overflow-hidden shadow-inner flex items-center justify-center">
                  <canvas 
                    ref={canvasRef} 
                    width={400} 
                    height={112} 
                    className="w-full h-full object-cover"
                  />

                  {!isRecording && !audioBlob && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-500 text-xs space-y-1">
                      <Mic size={24} className="opacity-40" />
                      <span>Mikrofon kutish rejimida</span>
                    </div>
                  )}

                  {/* Level bar at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 transition-all duration-75"
                      style={{ width: `${isRecording ? micLevel : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Digital Timecode Display */}
              <div className="text-center p-4 rounded-2xl bg-stone-900/60 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400">
                  {isRecording ? "Yozuv Davomiyligi" : audioBlob ? "Yozilgan Davomiylik" : "Vaqt Hisoblagich"}
                </span>
                <div className="font-mono font-black text-4xl sm:text-5xl tracking-tight text-white drop-shadow-md">
                  {formatTime(recordingTime)}
                </div>
              </div>

              {/* Chapter / Track Title Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-stone-400">
                  Bob / Trek Sarlavhasi (Ixtiyoriy):
                </label>
                <input
                  type="text"
                  value={trackTitle}
                  onChange={(e) => setTrackTitle(e.target.value)}
                  placeholder="Masalan: 1-bob (Kirish)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900/80 border border-white/10 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              {/* ── Audio Studio Action Buttons ── */}
              <div className="space-y-3 pt-1">
                {!isRecording && !audioBlob && (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="w-full py-4 rounded-2xl font-bold text-sm sm:text-base text-white transition-all active:scale-[0.98] shadow-xl cursor-pointer flex items-center justify-center gap-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:brightness-110 shadow-red-600/30"
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-white animate-ping" />
                    <span>Ovoz Yozishni Boshlash 🔴</span>
                  </button>
                )}

                {isRecording && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={pauseRecording}
                      className="py-3.5 rounded-xl font-bold text-xs text-white transition-all active:scale-[0.98] bg-white/10 hover:bg-white/20 border border-white/10 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isPaused ? <Play size={16} /> : <Pause size={16} />}
                      <span>{isPaused ? "Davom ettirish" : "Pauza"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={stopRecording}
                      className="py-3.5 rounded-xl font-bold text-xs text-white transition-all active:scale-[0.98] bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/25 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Square size={16} fill="white" />
                      <span>To'xtatish (Stop) ⏹</span>
                    </button>
                  </div>
                )}

                {/* ── Audio Recorded Review State ── */}
                {audioBlob && !isRecording && (
                  <div className="p-4 rounded-2xl bg-stone-900 border border-white/10 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-emerald-400" />
                        <span>Yozuv Tayyor ({formatTime(recordingTime)})</span>
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

                    {/* Preview Player */}
                    {audioUrl && (
                      <audio 
                        ref={previewAudioRef}
                        src={audioUrl} 
                        controls 
                        className="w-full h-9 rounded-xl outline-none"
                      />
                    )}

                    {/* Upload Button */}
                    <button
                      type="button"
                      onClick={handleUploadToAws}
                      disabled={isUploading}
                      className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 shadow-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:brightness-105 shadow-emerald-600/25"
                    >
                      {isUploading ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-block animate-spin">⏳</span>
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

              {/* ── Micro Hardware Settings (Noise & Echo) ── */}
              <div className="pt-2 border-t border-white/5 space-y-2 text-[11px] text-stone-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sliders size={13} className="text-[#C5A059]" />
                    <span>Shovqinni bostirish (Noise suppression):</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={noiseSuppression}
                    onChange={(e) => setNoiseSuppression(e.target.checked)}
                    disabled={isRecording}
                    className="accent-[#C5A059] cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Volume2 size={13} className="text-[#C5A059]" />
                    <span>Aks-sadoni tozalash (Echo cancellation):</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={echoCancellation}
                    onChange={(e) => setEchoCancellation(e.target.checked)}
                    disabled={isRecording}
                    className="accent-[#C5A059] cursor-pointer"
                  />
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
