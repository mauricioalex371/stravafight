import React, { useState, useRef, useEffect } from 'react';
import { X, Heart, Send } from 'lucide-react';
import { Post, PostComment, UserProfile } from '../types';
import { generateUUID } from '../utils/formatters';

interface CommentsModalProps {
  post: Post;
  currentUser: UserProfile;
  onClose: () => void;
  onAddComment: (postId: string, comment: PostComment) => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  post,
  currentUser,
  onClose,
  onAddComment
}) => {
  const [commentText, setCommentText] = useState('');
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: PostComment = {
      id: generateUUID(),
      postId: post.id,
      authorUsername: currentUser.username,
      authorName: currentUser.fullName,
      authorAvatar: currentUser.avatarUrl,
      text: commentText.trim(),
      createdAt: 'agora',
      likesCount: 0
    };

    onAddComment(post.id, newComment);
    setCommentText('');
  };

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;
    if (diff > 0) { // Only allow dragging down
      setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragY > 150) { // Threshold to close
      onClose();
    } else {
      setDragY(0); // Snap back
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        ref={sheetRef}
        className="w-full max-w-lg bg-[#0D121C] border-t border-[#171C25] rounded-t-3xl shadow-2xl h-[80vh] max-h-[700px] flex flex-col transition-transform duration-200 ease-out"
        style={{ 
          transform: `translateY(${dragY}px)`,
          touchAction: 'none'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-[#475569] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-[#171C25]">
          <h3 className="text-sm font-black text-white">Comentários ({post.comments.length})</h3>
          <button 
            onClick={onClose} 
            className="text-[#94A3B8] hover:text-white p-1.5 rounded-lg hover:bg-[#171C25] transition-colors active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>        {/* Post snippet */}
        <div className="py-3 border-b border-[#171C25] flex items-start gap-3">
          <img 
            src={post.authorAvatar} 
            alt={post.authorName} 
            className="w-9 h-9 rounded-full object-cover border border-[#F20D18]" 
          />
          <div className="flex-1 text-xs">
            <span className="font-bold text-white mr-1.5">{post.authorUsername}</span>
            <span className="text-[#CBD5E1] leading-relaxed">{post.caption}</span>
            <p className="text-[10px] text-[#64748B] mt-1">{post.authorBelt} • {post.authorModality}</p>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 no-scrollbar">
          {post.comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#94A3B8]">
              <p className="text-xs font-bold text-white mb-1">Nenhum comentário ainda</p>
              <p className="text-[11px]">Seja o primeiro guerreiro a comentar neste treino!</p>
            </div>
          ) : (
            post.comments.map((comment) => (
              <div key={comment.id} className="flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <img 
                    src={comment.authorAvatar} 
                    alt={comment.authorName} 
                    className="w-8 h-8 rounded-full object-cover border border-[#171C25] shrink-0" 
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white">{comment.authorUsername}</span>
                      <span className="text-[10px] text-[#64748B]">{comment.createdAt}</span>
                    </div>
                    <p className="text-[#E2E8F0] mt-0.5 leading-relaxed">{comment.text}</p>
                  </div>
                </div>
                <button className="text-[#64748B] hover:text-[#F20D18] pt-1">
                  <Heart className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Comment input form */}
        <form onSubmit={handleSend} className="pt-3 border-t border-[#171C25] flex items-center gap-2">
          <img 
            src={currentUser.avatarUrl} 
            alt="Você" 
            className="w-8 h-8 rounded-full object-cover border border-[#F20D18]" 
          />
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Adicione um comentário para o guerreiro..."
            className="flex-1 min-h-[40px] px-3.5 rounded-full bg-[#05070B] border border-[#171C25] text-white text-xs placeholder:text-[#64748B] focus:border-[#F20D18] focus:outline-none"
          />
          <button 
            type="submit" 
            disabled={!commentText.trim()}
            className="w-9 h-9 rounded-full bg-[#F20D18] disabled:opacity-40 text-white flex items-center justify-center hover:opacity-90 transition-opacity shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
