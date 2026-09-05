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
  ListMusic, 
  Music, 
  Disc, 
  ChevronUp, 
  ChevronDown, 
  Check,
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Multi-track state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showPlaylist, setShowPlaylist] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);

  // Available tracks
  const tracksList: BookAudioTrack[] = useMemo(() => {
    return track?.trackList && track.trackList.length > 0 ? track.trackList : [];
  }, [track]);

  // When track prop changes, initialize
  useEffect(() => {
    if (!track) return;
    setCurrentIndex(track.currentTrackIndex || 0);
    setIsPlaying(true);
    setCurrentTime(0);
  }, [track]);

  // Active track information
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

  // Track & Chapter Title
  const displayTitle = track?.title || 'Kitob audio spektakli';
  const displayChapter = currentSubTrack?.title || track?.chapterTitle || `Qism ${currentIndex + 1}`;
  const displayNarrator = currentSubTrack?.narrator || 'Afzal Rafiqov';

  // Handle Play/Pause toggle
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {
        // Autoplay may be restricted
      });
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

  // Skip 15s backward
  const handleRewind15 = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
  };

  // Skip 15s forward
  const handleForward15 = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(duration || Infinity, audioRef.current.currentTime + 15);
  };

  // Previous Track
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

  // Next Track
  const handleNextTrack = () => {
    if (tracksList.length > 0 && currentIndex + 1 < tracksList.length) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(true);
    }
  };

  // Seamless Continuous Autoplay on Track Ended ("bitta kitob uzulmasin aytishi")
  const handleAudioEnded = () => {
    if (tracksList.length > 0 && currentIndex + 1 < tracksList.length) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setIsPlaying(true);
      const nextTrack = tracksList[nextIndex];
      toast.success(`Keyingi qism boshlandi: ${nextTrack.title}`, {
        icon: '🎧',
        duration: 3000
      });
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
      toast.success("Barcha audio qismlar yakunlandi! 👏");
    }
  };

  // Seek bar click
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = clickRatio * duration;
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  // Format seconds -> mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  // React to track change and auto-play
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-3xl animate-in slide-in-from-bottom-6 duration-300">
      
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

      {/* ── PLAYLIST / TREKLAR DRAWER (POPUP LIST) ── */}
      {showPlaylist && (
        <div className="mb-3 w-full bg-stone-900/95 dark:bg-[#0D1117]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 text-white animate-in slide-in-from-bottom-3 duration-200">
          
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#E05638]/20 text-[#E05638] flex items-center justify-center">
                <Disc size={15} />
              </div>
              <div>
                <h4 className="text-xs font-serif font-bold text-white">
                  Audio Qismlar & Mundarija
                </h4>
                <p className="text-[10px] font-mono text-stone-400">
                  {tracksList.length > 0 
                    ? `${tracksList.length} ta trek • Uzluksiz avto-ijro yoqilgan` 
                    : "Yagona trek mavjud"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPlaylist(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Tracks List */}
          <div className="mt-3 max-h-56 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {tracksList.length > 0 ? (
              tracksList.map((t, idx) => {
                const isActive = idx === currentIndex;
                const sizeMb = t.fileSizeBytes ? (t.fileSizeBytes / (1024 * 1024)).toFixed(1) : null;
                return (
                  <div
                    key={t.id || idx}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsPlaying(true);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-[#E05638]/20 border border-[#E05638]/40 text-white shadow-sm' 
                        : 'hover:bg-white/5 text-stone-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-[10px] font-mono font-bold w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-[#E05638] text-white' : 'bg-white/10 text-stone-400'
                      }`}>
                        {t.trackNumber || idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-medium truncate ${isActive ? 'text-amber-400 font-bold' : 'text-stone-200'}`}>
                            {t.title}
                          </p>
                          {isActive && (
                            <div className="flex items-center gap-0.5 h-3">
                              {[30, 90, 60].map((h, i) => (
                                <span
                                  key={i}
                                  className="w-0.5 bg-amber-400 rounded-full animate-pulse"
                                  style={{ height: `${h}%` }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-stone-400 truncate">
                          {t.narrator || displayNarrator} {sizeMb && `• ${sizeMb} MB`}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 pl-2">
                      {isActive ? (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E05638]/30 text-amber-300 border border-[#E05638]/40">
                          Ijroda
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-stone-500 hover:text-white">
                          Tinglash →
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs font-mono text-stone-400">
                Ushbu kitob uchun faqat bitta asosiy audio trek mavjud.
              </div>
            )}
          </div>

        </div>
      )}

      {/* ── MAIN FLOATING PLAYER DOCK ── */}
      <div className="relative bg-white/95 dark:bg-[#121620]/95 backdrop-blur-xl border border-stone-200/90 dark:border-white/10 rounded-2xl shadow-2xl p-3.5 transition-all">
        
        {/* Seekable Progress Bar */}
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
          
          {/* Left: Book Cover & Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-11 h-15 rounded-md overflow-hidden shrink-0 shadow-sm border border-black/10 bg-stone-900">
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
              <h4 className="text-xs font-serif font-bold text-stone-900 dark:text-white truncate">
                {displayTitle}
              </h4>
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
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Previous Track (Multi-track) */}
            {tracksList.length > 1 && (
              <button 
                onClick={handlePrevTrack}
                disabled={currentIndex === 0}
                className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Oldingi trek"
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

            {/* Next Track (Multi-track) */}
            {tracksList.length > 1 && (
              <button 
                onClick={handleNextTrack}
                disabled={currentIndex >= tracksList.length - 1}
                className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Keyingi trek"
              >
                <SkipForward size={16} />
              </button>
            )}

            {/* Speed Selector */}
            <button
              onClick={cycleSpeed}
              className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-white/20 transition-colors cursor-pointer"
              title="Tezlik"
            >
              {speed}x
            </button>
          </div>

          {/* Right Actions: Playlist Drawer Toggle & Reader & Close */}
          <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-stone-200 dark:border-white/10">
            
            {/* Playlist Drawer Button */}
            <button
              onClick={() => setShowPlaylist(!showPlaylist)}
              className={`p-2 rounded-xl transition-colors cursor-pointer relative ${
                showPlaylist 
                  ? 'bg-[#E05638] text-white' 
                  : 'bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/20 text-stone-700 dark:text-stone-300'
              }`}
              title="Treklar ro'yxati (Mundarija)"
            >
              <ListMusic size={15} />
              {tracksList.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-950 font-mono text-[9px] font-bold px-1 rounded-full">
                  {tracksList.length}
                </span>
              )}
            </button>

            {/* Open in Reader */}
            <button
              onClick={() => onOpenReader(track.bookId)}
              className="p-2 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-[#E05638] hover:text-white text-stone-700 dark:text-stone-300 transition-colors cursor-pointer hidden sm:flex"
              title="Kitob matnini ochish (Reader)"
            >
              <BookOpen size={15} />
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
