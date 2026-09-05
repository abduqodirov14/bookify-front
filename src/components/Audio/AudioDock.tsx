import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  X,
  BookOpen,
  SkipBack,
  SkipForward,
  Moon,
  ChevronDown
} from 'lucide-react';
import { AudioTrack, BookAudioTrack } from '../../types';
import { resolveAudioUrl } from '../../services/api';
import { toast } from 'react-hot-toast';

interface Props {
  track: AudioTrack | null;
  onClose: () => void;
  onOpenReader: (bookId: string) => void;
}

export default function AudioDock({ track, onClose, onOpenReader }: Props) {
  // Always-mounted audio element — never conditional
  const audioRef = useRef<HTMLAudioElement>(null);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerSecondsLeft, setSleepTimerSecondsLeft] = useState<number | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);

  // Available tracks sorted by track_number ascending (1 → 2 → 3 …)
  const tracksList: BookAudioTrack[] = useMemo(() => {
    const list = track?.trackList && track.trackList.length > 0 ? [...track.trackList] : [];
    return list.sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0));
  }, [track]);

  // Active sub-track
  const currentSubTrack = useMemo(() => {
    return tracksList.length > 0 && currentIndex < tracksList.length
      ? tracksList[currentIndex]
      : null;
  }, [tracksList, currentIndex]);

  // Audio URL for current track/sub-track
  const activeAudioSrc = useMemo(() => {
    if (currentSubTrack?.audioUrl) return resolveAudioUrl(currentSubTrack.audioUrl);
    if (track?.audioUrl) return resolveAudioUrl(track.audioUrl);
    return '';
  }, [currentSubTrack, track]);

  // When track prop changes — reset index and start playing
  useEffect(() => {
    if (!track) return;
    setCurrentIndex(track.currentTrackIndex ?? 0);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false); // will be set to true once audio loads below
  }, [track?.bookId]); // only when book changes, not on every re-render

  // When audio source changes — load and play
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeAudioSrc) return;

    setIsLoadingAudio(true);
    setCurrentTime(0);
    setDuration(0);

    audio.src = activeAudioSrc;
    audio.load();

    // Auto-play only if we were already playing or this is the first load
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false)); // Autoplay blocked by browser — user must press play
    }
  }, [activeAudioSrc]);

  // Keep speed in sync
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  // Sleep Timer countdown
  useEffect(() => {
    if (sleepTimerSecondsLeft === null) return;
    if (sleepTimerSecondsLeft <= 0) {
      audioRef.current?.pause();
      setIsPlaying(false);
      setSleepTimerMinutes(null);
      setSleepTimerSecondsLeft(null);
      toast("Uxlash taymeri yakunlandi. Audio to'xtatildi 🌙", { icon: '😴' });
      return;
    }
    const interval = setInterval(() => {
      setSleepTimerSecondsLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [sleepTimerSecondsLeft]);

  // ── Controls ──────────────────────────────────────────────────

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  const handleRewind15 = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
  };

  const handleForward15 = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(audioRef.current.duration || Infinity, audioRef.current.currentTime + 15);
  };

  const handlePrevTrack = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  };

  const handleNextTrack = () => {
    if (currentIndex + 1 < tracksList.length) setCurrentIndex(i => i + 1);
  };

  const handleAudioEnded = () => {
    if (currentIndex + 1 < tracksList.length) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      toast.success(`Keyingi qism: ${tracksList[next].title}`, { icon: '🎧', duration: 3000 });
    } else {
      setIsPlaying(false);
      toast.success('Barcha qismlar yakunlandi! 👏');
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const next = !isMuted;
    audioRef.current.muted = next;
    setIsMuted(next);
  };

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      if (val > 0 && isMuted) {
        audioRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  // Seek bar — click anywhere on progress bar
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const dur = audio.duration;
    if (!dur || isNaN(dur)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * dur;
    setCurrentTime(ratio * dur);
  };

  const cycleSleepTimer = () => {
    const options = [null, 15, 30, 45, 60] as (number | null)[];
    const nextVal = options[(options.indexOf(sleepTimerMinutes) + 1) % options.length];
    setSleepTimerMinutes(nextVal);
    if (nextVal !== null) {
      setSleepTimerSecondsLeft(nextVal * 60);
      toast.success(`Uxlash taymeri: ${nextVal} daqiqa`, { icon: '🌙' });
    } else {
      setSleepTimerSecondsLeft(null);
      toast("Taymer o'chirildi", { icon: '⏰' });
    }
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const displayTitle = track?.title || 'Kitob audio';
  const displayChapter = currentSubTrack?.title || track?.chapterTitle || `Qism ${currentIndex + 1}`;
  const displayNarrator = currentSubTrack?.narrator || track?.narrator || 'Afzal Rafiqov';

  if (!track) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-3xl animate-in slide-in-from-bottom-6 duration-300 select-none">

      {/* Always-mounted audio element — ref is always valid */}
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
            setIsLoadingAudio(false);
          }
        }}
        onWaiting={() => setIsLoadingAudio(true)}
        onCanPlay={() => setIsLoadingAudio(false)}
        onPlaying={() => { setIsLoadingAudio(false); setIsPlaying(true); }}
        onPause={() => setIsPlaying(false)}
        onEnded={handleAudioEnded}
      />

      {/* ── Main Dock ── */}
      <div className="relative bg-white/95 dark:bg-[#121620]/95 backdrop-blur-xl border border-stone-200/90 dark:border-white/10 rounded-2xl shadow-2xl p-3.5 transition-all">

        {/* Seekable progress bar — top edge */}
        <div
          onClick={handleSeek}
          className="absolute -top-1.5 left-3 right-3 h-2 bg-stone-200 dark:bg-white/10 rounded-full cursor-pointer overflow-hidden group shadow-inner"
          title="Vaqtni siljitish"
        >
          <div
            className="h-full bg-[#E05638] rounded-full transition-all group-hover:bg-[#C74326]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">

          {/* Left: Cover + Info + Part switcher */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-11 h-14 rounded-md overflow-hidden shrink-0 shadow-sm border border-black/10 bg-stone-900">
              <img
                src={track.coverImage}
                alt={track.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                }}
              />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-serif font-bold text-stone-900 dark:text-white truncate">
                  {displayTitle}
                </h4>

                {tracksList.length > 1 && (
                  <div className="relative inline-flex items-center shrink-0">
                    <select
                      value={currentIndex}
                      onChange={(e) => setCurrentIndex(Number(e.target.value))}
                      className="appearance-none pl-2 pr-5 py-0.5 rounded-md bg-[#E05638]/10 text-[#E05638] dark:text-amber-400 font-mono text-[10px] font-bold border border-[#E05638]/30 cursor-pointer focus:outline-none"
                    >
                      {tracksList.map((t, idx) => (
                        <option key={t.id || idx} value={idx} className="bg-white dark:bg-[#121620] text-stone-900 dark:text-white">
                          Qism {idx + 1}: {t.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={10} className="absolute right-1.5 pointer-events-none text-[#E05638] dark:text-amber-400" />
                  </div>
                )}
              </div>

              <span className="text-[11px] text-[#E05638] dark:text-amber-400 font-mono truncate font-semibold">
                {displayChapter}
              </span>

              <div className="flex items-center gap-1.5 text-[10px] text-stone-400 truncate">
                <span>{displayNarrator}</span>
                {duration > 0 && (
                  <>
                    <span>•</span>
                    <span className="font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Center: Playback controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">

            {tracksList.length > 1 && (
              <button
                onClick={handlePrevTrack}
                disabled={currentIndex === 0}
                className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Oldingi qism"
              >
                <SkipBack size={16} />
              </button>
            )}

            <button
              onClick={handleRewind15}
              className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="15 soniya orqaga"
            >
              <RotateCcw size={15} />
            </button>

            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-[#E05638] hover:bg-[#C74326] text-white flex items-center justify-center shadow-md hover:shadow-lg transition-transform active:scale-95 cursor-pointer"
              title={isPlaying ? 'Pauza' : 'Tinglash'}
            >
              {isLoadingAudio ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause size={17} />
              ) : (
                <Play size={17} className="ml-0.5" />
              )}
            </button>

            <button
              onClick={handleForward15}
              className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="15 soniya oldinga"
            >
              <RotateCw size={15} />
            </button>

            {tracksList.length > 1 && (
              <button
                onClick={handleNextTrack}
                disabled={currentIndex >= tracksList.length - 1}
                className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Keyingi qism"
              >
                <SkipForward size={16} />
              </button>
            )}

            <button
              onClick={cycleSpeed}
              className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-white/20 transition-colors cursor-pointer"
              title="Ijro tezligi"
            >
              {speed}x
            </button>
          </div>

          {/* Right: Sleep timer + Volume + Reader + Close */}
          <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-stone-200 dark:border-white/10">

            {/* Sleep timer */}
            <button
              onClick={cycleSleepTimer}
              className={`p-2 rounded-xl transition-colors cursor-pointer relative ${
                sleepTimerMinutes !== null
                  ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400'
                  : 'bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/20 text-stone-600 dark:text-stone-300'
              }`}
              title={sleepTimerMinutes ? `Taymer: ${Math.ceil((sleepTimerSecondsLeft || 0) / 60)} daqiqa qoldi` : 'Uxlash taymeri'}
            >
              <Moon size={14} />
              {sleepTimerMinutes !== null && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-950 font-mono text-[8px] font-bold px-1 rounded-full">
                  {Math.ceil((sleepTimerSecondsLeft || 0) / 60)}m
                </span>
              )}
            </button>

            {/* Volume */}
            <div
              className="relative hidden sm:flex items-center"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button
                onClick={toggleMute}
                className="p-2 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/20 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
                title={isMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
              >
                {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>

              {showVolumeSlider && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-white dark:bg-[#121620] border border-stone-200 dark:border-white/10 rounded-xl shadow-xl flex items-center gap-1.5 animate-in fade-in duration-150">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-16 accent-[#E05638] cursor-pointer h-1 bg-stone-200 dark:bg-white/20 rounded-full"
                  />
                  <span className="text-[9px] font-mono text-stone-400 w-6">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Open Reader */}
            <button
              onClick={() => onOpenReader(track.bookId)}
              className="p-2 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-[#E05638] hover:text-white text-stone-700 dark:text-stone-300 transition-colors cursor-pointer hidden md:flex"
              title="Kitob matnini ochish"
            >
              <BookOpen size={14} />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Pleyerni yopish"
            >
              <X size={15} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
