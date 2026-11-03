import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  Share2, 
  Volume2, 
  VolumeX, 
  ChevronUp, 
  ChevronDown, 
  Music,
  Check,
  UserPlus
} from 'lucide-react';
import { Reel } from '../types';

interface ReelsViewProps {
  reels: Reel[];
  onToggleLike: (reelId: string) => void;
  onToggleSave: (reelId: string) => void;
  onOpenComments: (reel: Reel) => void;
  onOpenShare: (reel: Reel) => void;
  onFollowAuthor: (authorId: string) => void;
  onNavigateUser: (username: string) => void;
}

export const ReelsView: React.FC<ReelsViewProps> = ({
  reels,
  onToggleLike,
  onToggleSave,
  onOpenComments,
  onOpenShare,
  onFollowAuthor,
  onNavigateUser
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const currentReel = reels[currentIndex] || reels[0];

  const handleNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="max-w-md mx-auto h-[calc(100vh-130px)] sm:h-[82vh] relative select-none flex items-center justify-center pb-20 md:pb-0">
      {/* Main Reel Container */}
      <div className="relative w-full h-full bg-black sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
        {/* Background Media (Reel Video / Image simulation) */}
        <div 
          onDoubleClick={() => onToggleLike(currentReel.id)}
          className="absolute inset-0 bg-black flex items-center justify-center cursor-pointer"
        >
          <img 
            src={currentReel.videoUrl} 
            alt={currentReel.caption} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
        </div>

        {/* Top Sound and Reels label */}
        <div className="relative z-20 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm tracking-wider text-[#F20D18]">SF REELS</span>
            <span className="text-[10px] bg-black/50 px-2 py-0.5 rounded text-[#CBD5E1]">
              {currentIndex + 1} de {reels.length}
            </span>
          </div>

          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="w-9 h-9 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Bottom Details (Author, Bio, Audio) & Right Side Actions */}
        <div className="relative z-20 p-4 flex items-end justify-between gap-4">
          {/* Left Info */}
          <div className="flex-1 space-y-2 text-white">
            {/* Author */}
            <div className="flex items-center gap-2.5">
              <img 
                src={currentReel.authorAvatar} 
                alt={currentReel.authorName} 
                onClick={() => onNavigateUser(currentReel.authorUsername)}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#F20D18] cursor-pointer" 
              />
              <div>
                <div className="flex items-center gap-1.5 leading-tight">
                  <span 
                    onClick={() => onNavigateUser(currentReel.authorUsername)}
                    className="font-bold text-xs cursor-pointer hover:underline"
                  >
                    @{currentReel.authorUsername}
                  </span>
                  {currentReel.isAuthorVerified && (
                    <span className="w-3.5 h-3.5 rounded-full bg-[#F20D18] text-white flex items-center justify-center text-[8px] font-black">✓</span>
                  )}
                </div>
                <p className="text-[10px] text-[#CBD5E1]">{currentReel.authorBelt} • {currentReel.authorModality}</p>
              </div>

              {/* Follow Button */}
              <button
                onClick={() => onFollowAuthor(currentReel.authorId)}
                className={`ml-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  currentReel.isFollowingAuthor
                    ? 'bg-white/20 text-white'
                    : 'bg-[#F20D18] text-white hover:bg-[#d90812]'
                }`}
              >
                {currentReel.isFollowingAuthor ? 'Seguindo' : 'Seguir'}
              </button>
            </div>

            {/* Caption */}
            <p className="text-xs text-[#F1F5F9] leading-relaxed line-clamp-2">
              {currentReel.caption}
            </p>

            {/* Audio Track */}
            <div className="flex items-center gap-2 text-[11px] text-[#94A3B8]">
              <Music className="w-3 h-3 text-[#F20D18] animate-spin" />
              <span className="truncate">{currentReel.audioTrack}</span>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex flex-col items-center gap-4 text-white pb-2">
            {/* Like */}
            <button 
              onClick={() => onToggleLike(currentReel.id)}
              className="flex flex-col items-center gap-1 group active:scale-125 transition-transform"
            >
              <div className={`w-10 h-10 rounded-full bg-black/50 flex items-center justify-center ${
                currentReel.hasLiked ? 'text-[#F20D18]' : 'text-white'
              }`}>
                <Heart className={`w-6 h-6 ${currentReel.hasLiked ? 'fill-[#F20D18]' : ''}`} />
              </div>
              <span className="text-[10px] font-bold">{currentReel.likesCount}</span>
            </button>

            {/* Comment */}
            <button 
              onClick={() => onOpenComments(currentReel)}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold">{currentReel.commentsCount}</span>
            </button>

            {/* Share */}
            <button 
              onClick={() => onOpenShare(currentReel)}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white">
                <Send className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold">{currentReel.sharesCount}</span>
            </button>

            {/* Save */}
            <button 
              onClick={() => onToggleSave(currentReel.id)}
              className="flex flex-col items-center gap-1 group"
            >
              <div className={`w-10 h-10 rounded-full bg-black/50 flex items-center justify-center ${
                currentReel.hasSaved ? 'text-[#F20D18]' : 'text-white'
              }`}>
                <Bookmark className={`w-5 h-5 ${currentReel.hasSaved ? 'fill-[#F20D18]' : ''}`} />
              </div>
              <span className="text-[10px] font-bold">Salvar</span>
            </button>
          </div>
        </div>

        {/* Up / Down Navigation Controls */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-30">
          <button 
            onClick={handlePrev}
            className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
            title="Vídeo anterior"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button 
            onClick={handleNext}
            className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
            title="Próximo vídeo"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
