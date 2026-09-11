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
  ChevronDown,
  Headphones
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
  const [showPlaylist, setShowPlaylist] = useState<boolean>(false);

  const tracksList: BookAudioTrack[] = useMemo(() => {
    const list = track?.trackList && track.trackList.length > 0 ? [...track.trackList] : [];
    return list.sort((a, b) => {
      const numA = (a.trackNumber ?? (a as any).track_number ?? 1);
      const numB = (b.trackNumber ?? (b as any).track_number ?? 1);
      return numA - numB;
    });
  }, [track]);

  const currentSubTrack = useMemo(() => {
    return tracksList.length > 0 && currentIndex < tracksList.length
      ? tracksList[currentIndex]
      : null;
  }, [tracksList, currentIndex]);

  const activeAudioSrc = useMemo(() => {
    const raw = currentSubTrack?.audioUrl || 
                (currentSubTrack as any)?.audio_url || 
                track?.audioUrl || 
                (track as any)?.audio_url;
    if (raw) return resolveAudioUrl(raw);
    return '';
  }, [currentSubTrack, track]);

  useEffect(() => {
    if (!track) return;
    setCurrentIndex(track.currentTrackIndex ?? 0);
    setCurrentTime(0);
    setDuration(0);
  }, [track?.bookId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!activeAudioSrc) {
      audio.removeAttribute('src');
      setIsLoadingAudio(false);
      setIsPlaying(false);
      return;
    }

    setIsLoadingAudio(true);
    setCurrentTime(0);
    setDuration(0);

    audio.src = activeAudioSrc;
    audio.load();

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsLoadingAudio(false);
        })
        .catch((err) => {
          console.error("Audio playback error:", err);
          setIsPlaying(false);
          setIsLoadingAudio(false);
        });
    }
  }, [activeAudioSrc]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = speed;
      audio.volume = volume;
      audio.muted = isMuted;
    }
  }, [speed, volume, isMuted]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sleepTimerSecondsLeft !== null && sleepTimerSecondsLeft > 0) {
      interval = setInterval(() => {
        setSleepTimerSecondsLeft(prev => prev! - 1);
      }, 1000);
    } else if (sleepTimerSecondsLeft === 0) {
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
      setSleepTimerMinutes(null);
      setSleepTimerSecondsLeft(null);
      toast("Taymer bo'yicha audio to'xtatildi", { icon: '??' });
    }
    return () => clearInterval(interval);
  }, [sleepTimerSecondsLeft]);

  const setSleepTimer = (minutes: number | null) => {
    setSleepTimerMinutes(minutes);
    setSleepTimerSecondsLeft(minutes ? minutes * 60 : null);
    if (minutes) {
      toast.success(`${minutes} daqiqadan so'ng audio to'xtaydi`);
    } else {
      toast("Uyqu taymeri bekor qilindi");
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (duration === 0 && audioRef.current.duration) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoadingAudio(false);
    }
  };

  const handleError = () => {
    setIsLoadingAudio(false);
    setIsPlaying(false);
    toast.error("Audio yuklanmadi. Boshqa qismni tanlang.");
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !activeAudioSrc) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => toast.error("Ijroda xatolik"));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (val > 0) setIsMuted(false);
  };

  const skip = (amount: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        Math.max(audioRef.current.currentTime + amount, 0),
        duration
      );
    }
  };

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(speed);
    setSpeed(speeds[(currentIndex + 1) % speeds.length]);
  };

  const handleNextTrack = () => {
    if (currentIndex < tracksList.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handlePrevTrack = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!track) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-parchment dark:bg-ink border-t border-black/10 dark:border-white/10 flex flex-col transition-colors">
      
      {/* Audio Element Hidden */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleNextTrack}
        onError={handleError}
        preload="metadata"
      />

      {/* Flat Progress Bar */}
      <div className="h-1 bg-black/5 dark:bg-white/5 relative group cursor-pointer w-full">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div 
          className="h-full bg-ink dark:bg-parchment transition-all duration-100"
          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
        />
      </div>

      <div className="px-4 py-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Track Info */}
        <div className="flex items-center gap-4 w-full sm:w-auto sm:flex-1">
          <div className="relative w-12 h-12 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 shrink-0">
            {track.coverImage ? (
              <img src={track.coverImage} alt={track.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Headphones size={16} className="text-ink/40 dark:text-parchment/40" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-serif font-bold text-[13px] text-ink dark:text-parchment truncate leading-tight">
              {currentSubTrack ? currentSubTrack.title : track.title}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-mono text-ink/60 dark:text-parchment/60 uppercase tracking-widest truncate">
                {(track as any).authorName || "Noma'lum muallif"}
              </span>
              <span className="text-[10px] text-ink/30 dark:text-parchment/30">•</span>
              <span className="text-[10px] font-mono text-ink/50 dark:text-parchment/50">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 sm:flex-1 w-full sm:w-auto">
          <button onClick={handlePrevTrack} disabled={currentIndex === 0} className="p-2 text-ink/50 dark:text-parchment/50 hover:text-ink dark:hover:text-parchment disabled:opacity-30 transition-colors">
            <SkipBack size={16} />
          </button>
          
          <button onClick={() => skip(-15)} className="p-2 text-ink/60 dark:text-parchment/60 hover:text-ink dark:hover:text-parchment transition-colors relative group">
            <RotateCcw size={18} />
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">15s</span>
          </button>

          <button 
            onClick={togglePlay}
            disabled={isLoadingAudio}
            className="w-12 h-12 flex items-center justify-center bg-ink dark:bg-parchment text-parchment dark:text-ink hover:opacity-90 transition-opacity rounded-sm disabled:opacity-50"
          >
            {isLoadingAudio ? (
              <div className="w-4 h-4 border-2 border-parchment border-t-transparent dark:border-ink dark:border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" className="ml-1" />
            )}
          </button>

          <button onClick={() => skip(15)} className="p-2 text-ink/60 dark:text-parchment/60 hover:text-ink dark:hover:text-parchment transition-colors relative group">
            <RotateCw size={18} />
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">15s</span>
          </button>

          <button onClick={handleNextTrack} disabled={currentIndex === tracksList.length - 1} className="p-2 text-ink/50 dark:text-parchment/50 hover:text-ink dark:hover:text-parchment disabled:opacity-30 transition-colors">
            <SkipForward size={16} />
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="hidden sm:flex items-center justify-end gap-3 flex-1">
          
          <button 
            onClick={cycleSpeed}
            className="px-2 py-1 border border-black/10 dark:border-white/10 text-[10px] font-mono font-bold text-ink/70 dark:text-parchment/70 hover:bg-black/5 dark:hover:bg-white/5 transition-colors w-10 text-center"
          >
            {speed}x
          </button>

          <div className="relative" onMouseEnter={() => setShowVolumeSlider(true)} onMouseLeave={() => setShowVolumeSlider(false)}>
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className="p-2 text-ink/60 dark:text-parchment/60 hover:text-ink dark:hover:text-parchment transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            {showVolumeSlider && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-8 h-24 bg-parchment dark:bg-ink border border-black/10 dark:border-white/10 flex items-center justify-center p-2">
                <input
                  type="range"
                  min="0" max="1" step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="h-20 -rotate-90 origin-center accent-ink dark:accent-parchment cursor-ns-resize"
                  style={{ width: '80px' }}
                />
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1"></div>

          <button 
            onClick={() => onOpenReader(track.bookId)}
            className="p-2 text-ink/60 dark:text-parchment/60 hover:text-ink dark:hover:text-parchment transition-colors flex items-center gap-1.5"
            title="Kitob matnini ochish"
          >
            <BookOpen size={16} />
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest hidden lg:block">O'qish</span>
          </button>

          <button 
            onClick={onClose}
            className="p-2 text-ink/40 dark:text-parchment/40 hover:text-ember transition-colors"
            title="Pleyerni yopish"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
