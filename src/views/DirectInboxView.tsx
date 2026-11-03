import React, { useState } from 'react';
import { 
  Search, 
  Edit3, 
  Phone, 
  Video, 
  Info, 
  ChevronLeft, 
  Send, 
  Image, 
  Smile, 
  MoreVertical,
  CheckCheck
} from 'lucide-react';
import { DirectConversation, ChatMessage, UserProfile } from '../types';
import { generateUUID } from '../utils/formatters';

interface DirectInboxViewProps {
  currentUser: UserProfile;
  conversations: DirectConversation[];
  activeConversationId?: string;
  onSelectConversation: (convId: string) => void;
  messages: ChatMessage[];
  onSendMessage: (convId: string, text: string) => void;
  onBackToInbox: () => void;
}

export const DirectInboxView: React.FC<DirectInboxViewProps> = ({
  currentUser,
  conversations,
  activeConversationId,
  onSelectConversation,
  messages,
  onSendMessage,
  onBackToInbox
}) => {
  const [activeTab, setActiveTab] = useState<'primary' | 'general' | 'requests'>('primary');
  const [search, setSearch] = useState('');
  const [inputText, setInputText] = useState('');

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  const filteredConversations = conversations.filter((c) => {
    const matchesTab = c.tab === activeTab;
    const matchesSearch = 
      c.otherUser.name.toLowerCase().includes(search.toLowerCase()) ||
      c.otherUser.username.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.text.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversationId) return;
    onSendMessage(activeConversationId, inputText.trim());
    setInputText('');
  };

  // If a conversation is selected, show Chat view (Matching img3)
  if (activeConv) {
    return (
      <div className="max-w-2xl mx-auto h-[calc(100vh-130px)] sm:h-[82vh] bg-[#071321] border border-[#171C25] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* Chat Header (Matching img3) */}
        <div className="p-3.5 bg-[#05070B] border-b border-[#171C25] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBackToInbox}
              className="flex items-center gap-1 text-[#CBD5E1] hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-xs font-bold text-[#F20D18]">Voltar</span>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img 
                  src={activeConv.otherUser.avatar} 
                  alt={activeConv.otherUser.name}
                  className="w-9 h-9 rounded-full object-cover border border-[#F20D18]" 
                />
                {activeConv.otherUser.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-[#05070B]" />
                )}
              </div>
              <div>
                <h3 className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                  <span>{activeConv.otherUser.name}</span>
                </h3>
                <p className="text-[10px] text-[#94A3B8]">
                  {activeConv.otherUser.lastActive || activeConv.otherUser.modality}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#CBD5E1]">
            <button className="w-8 h-8 rounded-full hover:bg-[#171C25] flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-full hover:bg-[#171C25] flex items-center justify-center">
              <Video className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-full hover:bg-[#171C25] flex items-center justify-center">
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages List (Matching img3) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#05070B]/40 no-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#94A3B8] text-xs">
              <p>Inicie a conversa sobre treinos e artes marciais!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === currentUser.id;
              return (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    isMine 
                      ? 'bg-[#171C25] text-white border border-[#F20D18]/30 rounded-tr-none' 
                      : 'bg-[#0D121C] text-[#E2E8F0] border border-[#171C25] rounded-tl-none'
                  }`}>
                    {/* Post snippet share if exists */}
                    {msg.postSnippet && (
                      <div className="mb-2 p-2 rounded-xl bg-black/50 border border-white/10">
                        <p className="text-[10px] text-[#F20D18] font-bold">Publicação de @{msg.postSnippet.author}</p>
                        <p className="text-[11px] text-[#CBD5E1] truncate mt-0.5">{msg.postSnippet.caption}</p>
                      </div>
                    )}

                    <p>{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-[#94A3B8]">
                      <span>{msg.timestamp}</span>
                      {isMine && <CheckCheck className="w-3 h-3 text-[#10B981]" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-[#05070B] border-t border-[#171C25] flex items-center gap-2">
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Mensagem..."
            className="flex-1 min-h-[42px] px-4 rounded-full bg-[#0D121C] border border-[#171C25] text-white text-xs placeholder:text-[#64748B] focus:border-[#F20D18] focus:outline-none"
          />
          <button 
            type="submit" 
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-full bg-[#F20D18] disabled:opacity-40 text-white flex items-center justify-center hover:opacity-95 transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  // Inbox Screen (Matching img4)
  return (
    <div className="max-w-xl mx-auto space-y-4 pb-20 md:pb-12 select-none">
      {/* Inbox Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-1.5">
            <span>{currentUser.username}</span>
            <span className="text-[10px] bg-[#F20D18]/15 text-[#F20D18] font-bold px-1.5 py-0.5 rounded">
              Direct
            </span>
          </h2>
          <p className="text-[11px] text-[#94A3B8]">Conversas e recados do tatame</p>
        </div>

        <button className="w-9 h-9 rounded-xl bg-[#0D121C] border border-[#171C25] text-white flex items-center justify-center hover:border-[#F20D18]">
          <Edit3 className="w-4 h-4 text-[#F20D18]" />
        </button>
      </div>

      {/* Tabs (Principal, Geral, Solicitações - matching img4) */}
      <div className="flex border-b border-[#171C25]">
        {[
          { key: 'primary' as const, label: 'Principal' },
          { key: 'general' as const, label: 'Geral' },
          { key: 'requests' as const, label: 'Solicitações (1)' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all ${
              activeTab === tab.key
                ? 'border-[#F20D18] text-white'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
        <input 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar mensagens ou lutadores..."
          className="w-full min-h-[42px] pl-10 pr-4 rounded-xl bg-[#0D121C] border border-[#171C25] text-white text-xs placeholder:text-[#64748B] focus:border-[#F20D18] focus:outline-none"
        />
      </div>

      {/* User Note bubble ("Sua nota" - matching img4) */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#071321]/60 border border-[#171C25]">
        <div className="relative">
          <img 
            src={currentUser.avatarUrl} 
            alt={currentUser.fullName}
            className="w-12 h-12 rounded-full object-cover border-2 border-[#F20D18]" 
          />
          <div className="absolute -top-3 -right-2 bg-[#171C25] border border-[#F20D18]/50 text-white text-[9px] px-2 py-0.5 rounded-full shadow-md font-bold whitespace-nowrap">
            Foco no treino! 🔥
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-white">Sua nota de status</p>
          <p className="text-[11px] text-[#94A3B8]">Compartilhe um pensamento ou meta com seus amigos</p>
        </div>
      </div>

      {/* Conversations List (Matching img4) */}
      <div className="space-y-1">
        {filteredConversations.length === 0 ? (
          <div className="text-center p-8 bg-[#0D121C] border border-[#171C25] rounded-3xl text-[#94A3B8]">
            <p className="text-xs font-bold text-white mb-1">Nenhuma conversa nesta aba</p>
            <p className="text-[11px]">Inicie uma nova conversa pelo botão de mensagem no perfil de qualquer atleta.</p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#071321]/40 border border-[#171C25]/60 hover:bg-[#071321] hover:border-[#F20D18]/40 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img 
                    src={conv.otherUser.avatar} 
                    alt={conv.otherUser.name} 
                    className="w-12 h-12 rounded-full object-cover border border-[#171C25]" 
                  />
                  {conv.otherUser.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10B981] ring-2 ring-[#05070B]" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white truncate">{conv.otherUser.name}</h4>
                    {conv.otherUser.belt && (
                      <span className="text-[9px] text-[#F20D18] font-bold shrink-0">{conv.otherUser.belt}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                    {conv.lastMessage.text}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
                <span className="text-[10px] text-[#64748B] font-medium">{conv.lastMessage.timestamp}</span>
                {conv.unreadCount > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F20D18] ring-2 ring-[#05070B] animate-pulse" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
