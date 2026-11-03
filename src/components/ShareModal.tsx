import React, { useState } from 'react';
import { X, Send, Link, Check } from 'lucide-react';
import { Post, DirectConversation } from '../types';

interface ShareModalProps {
  post: Post;
  conversations: DirectConversation[];
  onClose: () => void;
  onSendToConversation: (convId: string, post: Post) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  post,
  conversations,
  onClose,
  onSendToConversation
}) => {
  const [copied, setCopied] = useState(false);
  const [sentConvIds, setSentConvIds] = useState<string[]>([]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://stravafight.com/p/${post.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = (convId: string) => {
    onSendToConversation(convId, post);
    setSentConvIds((prev) => [...prev, convId]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-sm bg-[#0D121C] border border-[#171C25] rounded-3xl p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#171C25] mb-3">
          <h3 className="text-sm font-black text-white">Compartilhar Publicação</h3>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Copy link button */}
        <button
          onClick={handleCopyLink}
          className="w-full min-h-[44px] px-3.5 rounded-2xl bg-[#05070B] border border-[#171C25] text-white text-xs font-bold flex items-center justify-between hover:border-[#F20D18] transition-all mb-4"
        >
          <div className="flex items-center gap-2.5">
            <Link className="w-4 h-4 text-[#F20D18]" />
            <span>{copied ? 'Link Copiado!' : 'Copiar link da publicação'}</span>
          </div>
          {copied && <Check className="w-4 h-4 text-[#10B981]" />}
        </button>

        <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
          Enviar por Mensagem Direta
        </p>

        {/* Conversations List */}
        <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
          {conversations.map((conv) => {
            const isSent = sentConvIds.includes(conv.id);
            return (
              <div 
                key={conv.id}
                className="flex items-center justify-between p-2 rounded-2xl hover:bg-[#171C25]/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <img 
                    src={conv.otherUser.avatar} 
                    alt={conv.otherUser.name} 
                    className="w-10 h-10 rounded-full object-cover border border-[#171C25]" 
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{conv.otherUser.name}</h4>
                    <p className="text-[10px] text-[#94A3B8]">@{conv.otherUser.username}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleSend(conv.id)}
                  disabled={isSent}
                  className={`min-h-[32px] px-3.5 rounded-full text-xs font-bold transition-all ${
                    isSent 
                      ? 'bg-[#171C25] text-[#94A3B8]' 
                      : 'bg-[#F20D18] text-white hover:bg-[#d90812] active:scale-95'
                  }`}
                >
                  {isSent ? 'Enviado' : 'Enviar'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
