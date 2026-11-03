import React, { useState, useEffect } from 'react';
import { X, Heart, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { Story } from '../types';

interface StoryViewerModalProps {
  stories: Story[];
  initialStoryIndex: number;
  onClose: () => void;
  onReply: (username: string, message: string) => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  initialStoryIndex,
  onClose,
  onReply
}) => {
  const [currentStoryIdx, setCurrentStoryIdx] = useState(initialStoryIndex);
  const [currentItemIdx, setCurrentItemIdx] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [hasLiked, setHasLiked] = useState(false);
  const [progress, setProgress] = useState(0);

  const currentStory = stories[currentStoryIdx] || stories[0];
  const currentItem = currentStory?.items[currentItemIdx] || currentStory?.items[0];

  // Auto advance timer
  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentStoryIdx, currentItemIdx]);

  const handleNext = () => {
    if (currentItemIdx < currentStory.items.length - 1) {
      setCurrentItemIdx((prev) => prev + 1);
    } else if (currentStoryIdx < stories.length - 1) {
      setCurrentStoryIdx((prev) => prev + 1);
      setCurrentItemIdx(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentItemIdx > 0) {
      setCurrentItemIdx((prev) => prev - 1);
    } else if (currentStoryIdx > 0) {
      setCurrentStoryIdx((prev) => prev - 1);
      setCurrentItemIdx(0);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply(currentStory.username, replyText.trim());
    setReplyText('');
    alert(`Resposta enviada para @${currentStory.username} por mensagem direta!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-in fade-in select-none">
      <div className="relative w-full max-w-sm h-full max-h-[88vh] sm:rounded-2xl overflow-hidden bg-[#071321] flex flex-col shadow-2xl">
        {/* Top Progress Bars */}
        <div className="absolute top-2 left-2 right-2 z-20 flex gap-1">
          {currentStory.items.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100"
                style={{
                  width: i === currentItemIdx ? `${progress}%` : i < currentItemIdx ? '100%' : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* User Header */}
        <div className="absolute top-5 left-3 right-3 z-20 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <img 
              src={currentStory.userAvatar} 
              alt={currentStory.username} 
              className="w-9 h-9 rounded-full object-cover border-2 border-[#F20D18]" 
            />
            <div>
              <p className="text-xs font-bold leading-tight flex items-center gap-1">
                <span>{currentStory.userFullName}</span>
                <span className="text-[11px] text-[#94A3B8] font-normal">@{currentStory.username}</span>
              </p>
              <p className="text-[10px] text-[#CBD5E1]">{currentItem.timestamp}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Story Media */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          <img 
            src={currentItem.mediaUrl} 
            alt="Story" 
            className="w-full h-full object-cover" 
          />
          {/* Navigation touch zones */}
          <div 
            onClick={handlePrev} 
            className="absolute left-0 top-16 bottom-20 w-1/3 cursor-pointer z-10"
            title="Voltar"
          />
          <div 
            onClick={handleNext} 
            className="absolute right-0 top-16 bottom-20 w-2/3 cursor-pointer z-10"
            title="Avançar"
          />

          {/* Caption banner if exists */}
          {currentItem.caption && (
            <div className="absolute bottom-20 left-4 right-4 z-20 bg-black/70 backdrop-blur-md p-3 rounded-xl border border-white/10 text-white text-xs leading-relaxed">
              {currentItem.caption}
            </div>
          )}
        </div>

        {/* Bottom Reaction & Reply bar */}
        <div className="p-3 bg-[#05070B] border-t border-[#171C25] flex items-center gap-2 z-20">
          <form onSubmit={handleSendReply} className="flex-1 flex items-center relative">
            <input 
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Enviar mensagem para @${currentStory.username}...`}
              className="w-full min-h-[40px] pl-3.5 pr-10 rounded-full bg-[#0D121C] border border-[#171C25] text-white text-xs placeholder:text-[#64748B] focus:border-[#F20D18] focus:outline-none"
            />
            {replyText && (
              <button type="submit" className="absolute right-3 text-[#F20D18] hover:scale-110 transition-transform">
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>

          <button 
            onClick={() => setHasLiked(!hasLiked)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-125 ${
              hasLiked ? 'text-[#F20D18]' : 'text-white hover:text-[#F20D18]'
            }`}
          >
            <Heart className={`w-6 h-6 ${hasLiked ? 'fill-[#F20D18]' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
