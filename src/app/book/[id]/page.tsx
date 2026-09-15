"use client";
import { useParams } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, BookOpen, Headphones, Star, Share2, Heart, Clock, 
  MoreHorizontal, MessageSquare, Send, X, Copy, 
  BookmarkPlus, Flag, User, Smartphone, ChevronDown, 
  Play, Pause, SkipBack, SkipForward, ListMusic, Gauge, Moon, Loader2
} from "lucide-react";
import { BOOKS } from "@/data/books";
import { api, resolveFileUrl, resolveAudioUrl } from "@/services/api";

export default function BookDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);
  const [playerState, setPlayerState] = useState<'closed' | 'mini' | 'full'>('closed');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isZenModalOpen, setIsZenModalOpen] = useState(false);
  const [isMundarijaOpen, setIsMundarijaOpen] = useState(false);
  const [zenTime, setZenTime] = useState(30);

  // Audio Engine States
  const [liveBook, setLiveBook] = useState<any>(null);
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!id) return;
    api.getBookById(id)
      .then(b => {
        setLiveBook(b);
        return api.getBookAudioTracks(id).then(tracks => {
          if (Array.isArray(tracks) && tracks.length > 0) {
            setAudioTracks(tracks);
          }
        }).catch(() => {});
      })
      .catch(() => {
        api.getBooks().then(books => {
          const found = books.find((b: any) => b.id === id);
          if (found) {
            setLiveBook(found);
            api.getBookAudioTracks(found.id).then(tracks => {
              if (Array.isArray(tracks) && tracks.length > 0) setAudioTracks(tracks);
            }).catch(() => {});
          }
        }).catch(() => {});
      });
  }, [id]);

  const fallbackBook = BOOKS.find(b => b.id === id) || BOOKS[0];
  const book = liveBook ? {
    ...fallbackBook,
    ...liveBook,
    authorName: liveBook.author || fallbackBook.authorName,
    title: liveBook.title || fallbackBook.title,
    description: liveBook.description || fallbackBook.description,
  } : fallbackBook;

  const coverImage = liveBook?.cover_image 
    ? resolveFileUrl(liveBook.cover_image) 
    : (book.id === "1" ? "/images/books/ref2.png" : (book.id === "2" ? "/images/books/ref3.png" : book.coverImage || "/images/books/ref2.png"));

  const currentTrack = audioTracks[currentTrackIndex] || null;
  const currentAudioSrc = currentTrack ? resolveAudioUrl(currentTrack.audio_url || currentTrack.audioUrl) : "";

  // Handle Play/Pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn("Playback error:", err);
      });
    }
  };

  const handleStartAudio = (index: number = 0) => {
    setCurrentTrackIndex(index);
    setPlayerState('full');
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }, 200);
  };

  const handleNextTrack = () => {
    if (currentTrackIndex < audioTracks.length - 1) {
      setCurrentTrackIndex(prev => prev + 1);
      setTimeout(() => {
        audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
      }, 150);
    }
  };

  const handlePrevTrack = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(prev => prev - 1);
      setTimeout(() => {
        audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
      }, 150);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pos * duration;
    setCurrentTime(pos * duration);
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: `Bookify orqali "${book.title}" asarini o'qing!`,
          url: window.location.href,
        });
      } catch (err) {
        setIsShareModalOpen(true);
      }
    } else {
      setIsShareModalOpen(true);
    }
  };

  const toggleLike = async () => {
    setIsLiked(!isLiked);
    try {
      if (!isLiked) {
        await api.addToLibrary(book.id);
      } else {
        await api.removeFromLibrary(book.id);
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans pb-32 relative">
      
      {/* Hidden Native Audio Element */}
      <audio 
        ref={audioRef}
        src={currentAudioSrc}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={handleNextTrack}
      />

      {/* --- AUDIO PLAYER (MINI & FULL) --- */}
      
      {/* FULL SCREEN PLAYER */}
      <div 
        className={`fixed inset-0 z-[200] bg-[#F5F5F7] flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${playerState === 'full' ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-300/30 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between p-6 pt-10">
           <button onClick={() => setPlayerState('mini')} className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-200/50 rounded-full transition-colors cursor-pointer active:scale-95">
             <ChevronDown size={32} />
           </button>
           <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] bg-white/50 px-4 py-1.5 rounded-full">Audio Mutolaa</div>
           <button onClick={() => setIsMundarijaOpen(true)} className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-200/50 rounded-full transition-colors cursor-pointer">
             <ListMusic size={24} />
           </button>
        </div>

        {/* Album Art & Controls */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 max-w-md mx-auto w-full gap-8">
           <div className={`w-[240px] sm:w-[300px] aspect-[4/5] rounded-[32px] overflow-hidden shadow-[0_30px_60px_rgb(0,0,0,0.15)] ring-1 ring-black/5 transition-transform duration-700 ease-out ${isPlaying ? 'scale-100' : 'scale-95'}`}>
             <img src={coverImage} alt={book.title} className="w-full h-full object-cover" />
           </div>

           {/* Title & Track Name */}
           <div className="text-center w-full px-2">
             <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight truncate">
               {currentTrack ? currentTrack.title : book.title}
             </h2>
             <p className="text-sm text-gray-500 font-semibold mt-1 truncate">
               {currentTrack?.narrator ? `${currentTrack.narrator} (Ijrochi)` : book.authorName}
             </p>
             {audioTracks.length > 0 && (
               <span className="inline-block mt-2 px-3 py-0.5 bg-orange-50 text-orange-600 rounded-full text-[11px] font-bold">
                 {currentTrackIndex + 1} / {audioTracks.length}-qism
               </span>
             )}
           </div>

           {/* Progress Bar */}
           <div className="w-full pt-2">
             <div onClick={handleSeek} className="group w-full h-3 bg-gray-200/80 rounded-full overflow-hidden relative cursor-pointer flex items-center">
               <div 
                 className="absolute top-0 left-0 h-full bg-orange-500 rounded-full transition-all"
                 style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
               ></div>
             </div>
             <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 mt-2 tracking-wider">
               <span>{formatTime(currentTime)}</span>
               <span>{formatTime(duration)}</span>
             </div>
           </div>

           {/* Playback Controls */}
           <div className="flex items-center justify-center gap-8 w-full px-4">
             <button 
               onClick={handlePrevTrack} 
               disabled={currentTrackIndex === 0}
               className="text-gray-400 hover:text-gray-800 transition-colors active:scale-90 disabled:opacity-30"
             >
               <SkipBack size={32} fill="currentColor" />
             </button>
             <button 
               onClick={togglePlay}
               className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
             >
               {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
             </button>
             <button 
               onClick={handleNextTrack} 
               disabled={currentTrackIndex >= audioTracks.length - 1}
               className="text-gray-400 hover:text-gray-800 transition-colors active:scale-90 disabled:opacity-30"
             >
               <SkipForward size={32} fill="currentColor" />
             </button>
           </div>
        </div>

        {/* Bottom Tools */}
        <div className="relative z-10 flex items-center justify-around py-6 px-6 bg-white/40 border-t border-gray-100 backdrop-blur-xl mt-4">
           <button onClick={() => setIsMundarijaOpen(true)} className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-orange-500 transition-colors">
             <ListMusic size={22} />
             <span className="text-[10px] font-bold uppercase tracking-wider">Mundarija ({audioTracks.length})</span>
           </button>
           <button onClick={cycleSpeed} className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-orange-500 transition-colors">
             <Gauge size={22} />
             <span className="text-[10px] font-bold uppercase tracking-wider">{playbackSpeed}x</span>
           </button>
           <button onClick={() => setIsZenModalOpen(true)} className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-orange-500 transition-colors">
             <Moon size={22} />
             <span className="text-[10px] font-bold uppercase tracking-wider">Uyqu ({zenTime}m)</span>
           </button>
        </div>
      </div>

      {/* MINI PLAYER */}
      <div 
        onClick={() => setPlayerState('full')}
        className={`fixed z-[150] bottom-0 left-0 w-full bg-white/90 backdrop-blur-2xl border-t border-black/5 p-3 sm:px-6 flex items-center justify-between transition-transform duration-500 cursor-pointer shadow-[0_-10px_40px_rgb(0,0,0,0.08)] ${playerState === 'mini' ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-200">
          <div 
            className="h-full bg-orange-500 transition-all"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          ></div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          <div className={`w-12 h-12 rounded-lg overflow-hidden shadow-sm shrink-0 ${isPlaying ? 'animate-[spin_8s_linear_infinite] rounded-full' : ''}`}>
            <img src={coverImage} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 truncate">
            <div className="text-sm font-bold text-gray-900 truncate">
              {currentTrack ? currentTrack.title : book.title}
            </div>
            <div className="text-[11px] font-medium text-gray-500 truncate">{book.authorName}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 pl-4 shrink-0">
          <button 
            onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-900 hover:bg-gray-200 active:scale-95 transition-all"
          >
             {isPlaying ? <Pause fill="currentColor" size={18} /> : <Play fill="currentColor" size={18} className="ml-1" />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setPlayerState('closed'); setIsPlaying(false); audioRef.current?.pause(); }} 
            className="text-gray-400 hover:text-gray-700 p-2"
          >
             <X size={20} />
          </button>
        </div>
      </div>

      {/* --- MUNDARIJA (TRACKS MODAL) --- */}
      {isMundarijaOpen && (
        <div className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMundarijaOpen(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] max-h-[80vh] flex flex-col overflow-hidden shadow-2xl z-10">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Audio Mundarija</h3>
                <p className="text-xs text-gray-400 font-medium">Jami: {audioTracks.length} ta audio trek</p>
              </div>
              <button onClick={() => setIsMundarijaOpen(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-50">
              {audioTracks.length === 0 ? (
                <div className="p-8 text-center text-gray-400 font-medium">Bu asar uchun hozircha audio treklar yuklanmagan.</div>
              ) : audioTracks.map((t, idx) => (
                <button 
                  key={t.id || idx}
                  onClick={() => { handleStartAudio(idx); setIsMundarijaOpen(false); }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-colors ${idx === currentTrackIndex ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50 text-gray-800'}`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-sm truncate">{t.title}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-400 ml-4 shrink-0">
                    {t.duration_seconds ? formatTime(t.duration_seconds) : ""}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- MODALS --- */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsShareModalOpen(false)}></div>
          <div className="relative bg-white/90 backdrop-blur-2xl w-full max-w-sm rounded-[32px] p-6 shadow-[0_20px_40px_rgb(0,0,0,0.1)] transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Ulashish</h3>
              <button onClick={() => setIsShareModalOpen(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <button className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 active:scale-95 transition-transform"><Send size={20} /></div>
                <span className="text-[10px] font-bold text-gray-600">Telegram</span>
              </button>
              <button className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-gradient-to-tr from-pink-500 to-orange-400 rounded-2xl flex items-center justify-center text-white shadow-md shadow-pink-500/20 active:scale-95 transition-transform"><Smartphone size={20} /></div>
                <span className="text-[10px] font-bold text-gray-600">Instagram</span>
              </button>
              <button className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-600/20 active:scale-95 transition-transform"><Smartphone size={20} /></div>
                <span className="text-[10px] font-bold text-gray-600">Facebook</span>
              </button>
              <button onClick={handleCopyLink} className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 ${isCopied ? 'bg-green-500' : 'bg-gray-200 text-gray-700'} rounded-2xl flex items-center justify-center text-white shadow-md active:scale-95 transition-all`}>
                  <Copy size={20} />
                </div>
                <span className="text-[10px] font-bold text-gray-600">{isCopied ? 'Nusxa olindi' : 'Nusxa olish'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Content */}
      <div className="relative">
        <div 
          className="absolute top-0 left-0 right-0 h-[450px] bg-cover bg-center filter opacity-40 mix-blend-multiply pointer-events-none"
          style={{ backgroundImage: `url(${coverImage})` }}
        >
          <div className="absolute inset-0 bg-[#F5F5F7]/80 backdrop-blur-[80px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F5F5F7]/50 to-[#F5F5F7]"></div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="relative z-20 pt-6 px-6 max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="w-10 h-10 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 transition-colors shadow-sm cursor-pointer">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleLike}
            className={`w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer ${isLiked ? 'bg-red-50 text-red-500' : 'bg-white/40 hover:bg-white/60 text-gray-800'}`}
          >
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={handleNativeShare}
            className="w-10 h-10 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 transition-colors shadow-sm cursor-pointer"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Book Info Container */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-12 pt-12 sm:pt-24 pb-8">
        
        {/* Book Cover */}
        <div className="w-[200px] sm:w-[260px] aspect-[2/3] shrink-0 rounded-[20px] shadow-[0_20px_50px_rgb(0,0,0,0.15)] ring-1 ring-black/5 overflow-hidden">
          <img src={coverImage} alt={book.title} className="w-full h-full object-cover" />
        </div>

        {/* Book Metadata */}
        <div className="flex-1 text-center sm:text-left pt-2 sm:pt-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/60 backdrop-blur-md text-gray-800 font-bold text-[11px] uppercase tracking-wider rounded-full mb-4 shadow-sm border border-white/20">
            {book.is_premium ? "💎 VIP Asar" : "Ommabop Asar"}
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight mb-2 leading-tight">
            {book.title}
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 font-semibold mb-6">
            {book.authorName}
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 text-xs sm:text-sm font-medium text-gray-600 mb-8 flex-wrap">
            <div className="flex items-center gap-1">
              <Star size={16} className="fill-orange-500 text-orange-500" />
              <span className="font-bold text-gray-900">4.9</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300"></div>
            <div>{audioTracks.length > 0 ? `${audioTracks.length} ta Audio trek` : "Matnli mutolaa"}</div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href={`/read/${id}`} className="w-full sm:w-auto px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full shadow-lg shadow-orange-500/30 transition-transform active:scale-95 flex items-center justify-center gap-2">
              <BookOpen size={20} />
              Mutolaa qilish
            </Link>
            {audioTracks.length > 0 && (
              <button 
                onClick={() => handleStartAudio(0)}
                className="w-full sm:w-auto px-10 py-4 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-full shadow-sm shadow-black/5 transition-transform active:scale-95 border border-gray-100 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Headphones size={20} className="text-orange-500" />
                Audio tinglash ({audioTracks.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="max-w-5xl mx-auto px-6 mt-8">
        <div className="bg-white rounded-[32px] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-4">Asar haqida</h2>
          <p className="text-gray-600 leading-relaxed font-medium text-base sm:text-lg">
            {book.description || "Ushbu asar o'zbek va jahon adabiyotining sara durdonalaridan biri hisoblanadi."}
          </p>
        </div>
      </div>

    </div>
  );
}