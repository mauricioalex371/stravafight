import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  Share2, 
  Volume2, 
  VolumeX, 
  Music,
  UserPlus,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Reel, AdCampaign, UserProfile } from '../types';
import { BusinessService } from '../services/businessService';

interface ReelsViewProps {
  reels: Reel[];
  currentUser: UserProfile;
  onToggleLike: (reelId: string) => void;
  onToggleSave: (reelId: string) => void;
  onOpenComments: (reel: Reel) => void;
  onOpenShare: (reel: Reel) => void;
  onFollowAuthor: (authorId: string) => void;
  onNavigateUser: (username: string) => void;
}

export const ReelsView: React.FC<ReelsViewProps> = ({
  reels,
  currentUser,
  onToggleLike,
  onToggleSave,
  onOpenComments,
  onOpenShare,
  onFollowAuthor,
  onNavigateUser
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  
  // Get active REELS campaigns and track impressions
  const activeAds = useMemo(() => BusinessService.getActiveCampaignsForPlacement('REELS'), []);
  const impressionsRecorded = useRef<Set<string>>(new Set());
  
  // Build mixed content array: reels + ads intercalated every 4 reels
  const mixedContent = useMemo(() => {
    const mixed: Array<{ type: 'reel' | 'ad'; data: Reel | AdCampaign }> = [];
    reels.forEach((reel, idx) => {
      mixed.push({ type: 'reel', data: reel });
      // Insert ad after every 4th reel if available
      if ((idx + 1) % 4 === 0 && activeAds.length > 0) {
        const adIndex = Math.floor((idx + 1) / 4) - 1;
        const ad = activeAds[adIndex % activeAds.length];
        if (ad) {
          mixed.push({ type: 'ad', data: ad });
        }
      }
    });
    return mixed;
  }, [reels, activeAds]);

  // Scroll snap behavior
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const viewportHeight = window.innerHeight;
      const newIndex = Math.round(scrollTop / viewportHeight);
      
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < mixedContent.length) {
        setCurrentIndex(newIndex);
        
        // Record ad impression when scrolling to an ad
        const item = mixedContent[newIndex];
        if (item.type === 'ad') {
          const adId = (item.data as AdCampaign).id;
          if (!impressionsRecorded.current.has(adId)) {
            BusinessService.recordAdImpression(adId, currentUser.id, 'REELS');
            impressionsRecorded.current.add(adId);
          }
        }
        
        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(5);
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentIndex, mixedContent.length, currentUser.id, mixedContent]);
  
  // Handler for ad clicks
  const handleAdClick = (campaign: AdCampaign) => {
    BusinessService.recordAdClick(campaign.id, currentUser.id, 'REELS');
    if (campaign.destinationUrl) {
      window.open(campaign.destinationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Handle double tap to like
  const handleDoubleTap = (reelId: string) => {
    const reel = reels.find(r => r.id === reelId);
    if (reel && !reel.hasLiked) {
      onToggleLike(reelId);
      setIsLikeAnimating(true);
      setTimeout(() => setIsLikeAnimating(false), 1000);
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  };

  const currentReel = reels[currentIndex] || reels[0];

  return (
    <div 
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide pb-20 md:pb-0"
      style={{ 
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {mixedContent.map((item, index) => {
        const isReel = item.type === 'reel';
        const reel = isReel ? (item.data as Reel) : null;
        const ad = !isReel ? (item.data as AdCampaign) : null;

        // Render Ad Reel
        if (ad) {
          return (
            <div
              key={`ad-${ad.id}`}
              className="h-screen snap-start snap-always relative flex items-center justify-center bg-black"
            >
              {/* Ad Background */}
              <div 
                onClick={() => handleAdClick(ad)}
                className="absolute inset-0 bg-black flex items-center justify-center cursor-pointer select-none"
              >
                <img 
                  src={ad.mediaUrl} 
                  alt={ad.title} 
                  className="w-full h-full object-cover"
                  loading={Math.abs(index - currentIndex) <= 1 ? 'eager' : 'lazy'}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90" />
                
                {/* Sponsored Badge */}
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#F20D18]/50 text-white flex items-center gap-2 text-xs font-black shadow-lg z-30">
                  <Sparkles className="w-3.5 h-3.5 text-[#F20D18]" />
                  <span>PATROCINADO</span>
                </div>
              </div>

              {/* Ad Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 z-20 p-4 space-y-3 text-white">
                {/* Company Info */}
                <div className="flex items-center gap-3">
                  <img 
                    src={ad.companyLogo} 
                    alt={ad.companyName} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#F20D18]" 
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{ad.companyName}</h4>
                    <p className="text-xs text-gray-300">{ad.category}</p>
                  </div>
                </div>

                {/* Ad Title & Description */}
                <div>
                  <h3 className="font-black text-base leading-tight">{ad.title}</h3>
                  <p className="text-sm text-gray-200 mt-1 line-clamp-2">{ad.description}</p>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleAdClick(ad)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F20D18] to-[#D90812] text-white text-sm font-black shadow-lg shadow-[#F20D18]/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>{ad.ctaLabel || 'Saiba Mais'}</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        }

        // Render Organic Reel
        if (!reel) return null;
        
        return (
        <div
          key={reel.id}
          className="h-screen snap-start snap-always relative flex items-center justify-center bg-black"
        >
          {/* Background Media (Reel Video / Image) */}
          <div 
            onDoubleClick={() => handleDoubleTap(reel.id)}
            className="absolute inset-0 bg-black flex items-center justify-center cursor-pointer select-none"
          >
            <img 
              src={reel.videoUrl} 
              alt={reel.caption} 
              className="w-full h-full object-cover"
              loading={Math.abs(index - currentIndex) <= 1 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
            
            {/* Double Tap Like Animation */}
            {isLikeAnimating && index === currentIndex && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                <Heart 
                  className="w-32 h-32 text-white fill-white animate-ping opacity-80"
                  style={{ animationDuration: '0.6s' }}
                />
              </div>
            )}
          </div>

          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-wider">SF REELS</span>
              <span className="text-[10px] bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
                {index + 1} de {mixedContent.length}
              </span>
            </div>

            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-all active:scale-90"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Bottom Content */}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-4 flex items-end justify-between gap-4">
            {/* Left: Author Info */}
            <div className="flex-1 space-y-3 text-white pb-2">
              {/* Author */}
              <div className="flex items-center gap-2.5">
                <img 
                  src={reel.authorAvatar} 
                  alt={reel.authorName} 
                  onClick={() => onNavigateUser(reel.authorUsername)}
                  className="w-11 h-11 rounded-full object-cover border-2 border-white cursor-pointer active:scale-95 transition-transform" 
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 leading-tight">
                    <span 
                      onClick={() => onNavigateUser(reel.authorUsername)}
                      className="font-bold text-sm cursor-pointer hover:underline"
                    >
                      @{reel.authorUsername}
                    </span>
                    {reel.isAuthorVerified && (
                      <span className="w-4 h-4 rounded-full bg-[#F20D18] text-white flex items-center justify-center text-[9px] font-black">✓</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-200">{reel.authorBelt} • {reel.authorModality}</p>
                </div>

                {/* Follow Button */}
                {!reel.isFollowingAuthor && (
                  <button
                    onClick={() => onFollowAuthor(reel.authorId)}
                    className="px-4 py-1.5 rounded-full bg-[#F20D18] text-white text-xs font-bold hover:bg-[#d90812] active:scale-95 transition-all"
                  >
                    Seguir
                  </button>
                )}
              </div>

              {/* Caption */}
              <p className="text-sm text-white leading-relaxed line-clamp-2 pr-4">
                {reel.caption}
              </p>

              {/* Audio Track */}
              <div className="flex items-center gap-2 text-xs text-gray-200">
                <Music className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                <span className="truncate">{reel.audioTrack}</span>
              </div>
            </div>

            {/* Right: Action Bar */}
            <div className="flex flex-col items-center gap-5 text-white pb-2">
              {/* Like */}
              <button 
                onClick={() => {
                  onToggleLike(reel.id);
                  if (navigator.vibrate) navigator.vibrate(10);
                }}
                className="flex flex-col items-center gap-1 group active:scale-125 transition-transform"
              >
                <div className={`w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center ${
                  reel.hasLiked ? 'bg-[#F20D18]/20' : 'bg-black/50'
                }`}>
                  <Heart className={`w-7 h-7 transition-all ${
                    reel.hasLiked ? 'fill-[#F20D18] text-[#F20D18] scale-110' : 'text-white'
                  }`} />
                </div>
                <span className="text-xs font-bold drop-shadow-lg">{reel.likesCount}</span>
              </button>

              {/* Comment */}
              <button 
                onClick={() => onOpenComments(reel)}
                className="flex flex-col items-center gap-1 group active:scale-110 transition-transform"
              >
                <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold drop-shadow-lg">{reel.commentsCount}</span>
              </button>

              {/* Share */}
              <button 
                onClick={() => onOpenShare(reel)}
                className="flex flex-col items-center gap-1 group active:scale-110 transition-transform"
              >
                <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white">
                  <Send className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold drop-shadow-lg">{reel.sharesCount}</span>
              </button>

              {/* Save */}
              <button 
                onClick={() => {
                  onToggleSave(reel.id);
                  if (navigator.vibrate) navigator.vibrate(10);
                }}
                className="flex flex-col items-center gap-1 group active:scale-110 transition-transform"
              >
                <div className={`w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center ${
                  reel.hasSaved ? 'bg-[#F20D18]/20' : 'bg-black/50'
                }`}>
                  <Bookmark className={`w-5 h-5 transition-all ${
                    reel.hasSaved ? 'fill-[#F20D18] text-[#F20D18]' : 'text-white'
                  }`} />
                </div>
              </button>
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
};
