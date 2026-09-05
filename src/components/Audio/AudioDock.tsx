import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Multi-track & playback state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerSecondsLeft, setSleepTimerSecondsLeft] = useState<number | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);

  // Available tracks — sorted by track_number ascending (1, 2, 3, ...)
  const tracksList: BookAudioTrack[] = useMemo(() => {
    const list = track?.trackList && track.trackList.length > 0 ? [...track.trackList] : [];
    return list.sort((a, b) => (a.track_number ?? 0) - (b.track_number ?? 0));
  }, [track]);

  // Initialize track on prop change
  useEffect(() => {
    if (!track) return;
    setCurrentIndex(track.currentTrackIndex || 0);
    setIsPlaying(true);
    setCurrentTime(0);
  }, [track]);

  // Sleep Timer Countdown Worker
  useEffect(() => {
    if (sleepTimerSecondsLeft === null) return;
    if (sleepTimerSecondsLeft <= 0) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
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

  // Cycle Sleep Timer: Off -> 15m -> 30m -> 45m -> 60m -> Off
  const cycleSleepTimer = () => {
    const options = [null, 15, 30, 45, 60];
    const currentIdx = options.indexOf(sleepTimerMinutes);
    const nextVal = options[(currentIdx + 1) % options.length];
    setSleepTimerMinutes(nextVal);
    if (nextVal !== null) {
      setSleepTimerSecondsLeft(nextVal * 60);
      toast.success(`Uxlash taymeri: ${nextVal} daqiqa o'rnatildi`, { icon: '🌙' });
    } else {
      setSleepTimerSecondsLeft(null);
      toast("Uxlash taymeri o'chirildi", { icon: '⏰' });
    }
  };

  // Active sub-track
  const currentSubTrack: BookAudioTrack | null = useMemo(() => {
    if (tracksList.length > 0 && currentIndex < tracksList.length) {
      return tracksList[currentIndex];
    }
    return null;
  }, [tracksList, currentIndex]);

  // Active audio URL
  const activeAudioSrc = useMemo(() => {
    if (currentSubTrack?.audioUrl) {
      return resolveAudioUrl(currentSubTrack.audioUrl);
    }
    if (track?.audioUrl) {
      return resolveAudioUrl(track.audioUrl);
    }
    return '';
  }, [currentSubTrack, track]);

  // Metadata strings
  const displayTitle = track?.title || 'Kitob audio spektakli';
  const displayChapter = currentSubTrack?.title || track?.chapterTitle || `Qism ${currentIndex + 1}`;
  const displayNarrator = currentSubTrack?.narrator || 'Afzal Rafiqov';

  // Toggle Play/Pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Speed cycle: 1.0x -> 1.25x -> 1.5x -> 2.0x
  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    setSpeed(next);
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
    }
  };

  // Skip 15s
  const handleRewind15 = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
  };

  const handleForward15 = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(duration || Infinity, audioRef.current.currentTime + 15);
  };

  // Prev / Next track
  const handlePrevTrack = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsPlaying(true);
    }
  };

  const handleNextTrack = () => {
    if (tracksList.length > 0 && currentIndex + 1 < tracksList.length) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(true);
    }
  };

  // Continuous Autoplay
  const handleAudioEnded = () => {
    if (tracksList.length > 0 && currentIndex + 1 < tracksList.length) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setIsPlaying(true);
      const nextTrack = tracksList[nextIndex];
      toast.success(`Keyingi qism boshlandi: ${nextTrack.title}`, { icon: '🎧', duration: 3000 });
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
      toast.success("Barcha qismlar yakunlandi! 👏");
    }
  };

  // Volume toggle
  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.muted = false;
      setIsMuted(false);
    } else {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
      if (newVol > 0 && isMuted) {
        audioRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  // Seek bar
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = clickRatio * duration;
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  useEffect(() => {
    if (audioRef.current && activeAudioSrc) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [activeAudioSrc]);

  if (!track) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-3xl animate-in slide-in-from-bottom-6 duration-300 select-none">
      
      {/* Hidden HTML5 Audio Element for Real Streaming */}
      {activeAudioSrc && (
        <audio
          ref={audioRef}
          src={activeAudioSrc}
          preload="metadata"
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setDuration(audioRef.current.duration);
              setIsLoadingAudio(false);
            }
          }}
          onWaiting={() => setIsLoadingAudio(true)}
          onPlaying={() => {
            setIsLoadingAudio(false);
            setIsPlaying(true);
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={handleAudioEnded}
        />
      )}

      {/* ── MAIN SLEEK FLOATING PLAYER DOCK ── */}
      <div className="relative bg-white/95 dark:bg-[#121620]/95 backdrop-blur-xl border border-stone-200/90 dark:border-white/10 rounded-2xl shadow-2xl p-3.5 transition-all">
        
        {/* Seekable Progress Bar at the top edge */}
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
          
          {/* Left: Book Cover & Info + Inline Part Switcher */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-11 h-14 rounded-md overflow-hidden shrink-0 shadow-sm border border-black/10 bg-stone-900">
              <img 
                src={track.coverImage} 
                alt={track.title} 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                }}
              />
              <div className="book-spine-hinge" />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-serif font-bold text-stone-900 dark:text-white truncate">
                  {displayTitle}
                </h4>

                {/* Inline Part Selector Dropdown if multiple tracks */}
                {tracksList.length > 1 && (
                  <div className="relative inline-flex items-center shrink-0">
                    <select
                      value={currentIndex}
                      onChange={(e) => {
                        setCurrentIndex(Number(e.target.value));
                        setIsPlaying(true);
                      }}
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

          {/* Center: Playback Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Previous Track */}
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

            {/* 15s Rewind */}
            <button 
              onClick={handleRewind15}
              className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="15 soniya orqaga"
            >
              <RotateCcw size={15} />
            </button>

            {/* Play/Pause Button */}
            <button 
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-[#E05638] hover:bg-[#C74326] text-white flex items-center justify-center shadow-md hover:shadow-lg transition-transform active:scale-95 cursor-pointer relative"
              title={isPlaying ? "Pauza" : "Tinglash"}
            >
              {isLoadingAudio ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause size={17} />
              ) : (
                <Play size={17} className="ml-0.5" />
              )}
            </button>

            {/* 15s Forward */}
            <button 
              onClick={handleForward15}
              className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="15 soniya oldinga"
            >
              <RotateCw size={15} />
            </button>

            {/* Next Track */}
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

            {/* Playback Speed */}
            <button
              onClick={cycleSpeed}
              className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-white/20 transition-colors cursor-pointer"
              title="Ijro tezligi"
            >
              {speed}x
            </button>
          </div>

          {/* Right Actions: Volume Control & Sleep Timer & Reader & Close */}
          <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-stone-200 dark:border-white/10">
            
            {/* Sleep Timer (Uxlash taymeri) */}
            <button
              onClick={cycleSleepTimer}
              className={`p-2 rounded-xl transition-colors cursor-pointer relative ${
                sleepTimerMinutes !== null
                  ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400'
                  : 'bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/20 text-stone-600 dark:text-stone-300'
              }`}
              title={sleepTimerMinutes ? `Taymer: ${Math.ceil((sleepTimerSecondsLeft || 0) / 60)} daqiqa qoldi` : "Uxlash taymeri"}
            >
              <Moon size={14} />
              {sleepTimerMinutes !== null && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-950 font-mono text-[8px] font-bold px-1 rounded-full">
                  {Math.ceil((sleepTimerSecondsLeft || 0) / 60)}m
                </span>
              )}
            </button>

            {/* Volume Control with hover slider */}
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

            {/* Open in Reader */}
            <button
              onClick={() => onOpenReader(track.bookId)}
              className="p-2 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-[#E05638] hover:text-white text-stone-700 dark:text-stone-300 transition-colors cursor-pointer hidden md:flex"
              title="Kitob matnini ochish (Reader)"
            >
              <BookOpen size={14} />
            </button>

            {/* Close Button */}
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
