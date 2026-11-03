import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Check, 
  X, 
  Search, 
  MapPin, 
  Flame, 
  MessageSquare,
  ShieldCheck,
  UserCheck,
  Swords
} from 'lucide-react';
import { FriendRequest, UserProfile } from '../types';

interface FriendsViewProps {
  currentUser: UserProfile;
  friendRequests: FriendRequest[];
  onAcceptRequest: (reqId: string) => void;
  onRejectRequest: (reqId: string) => void;
  onOpenDirectChat: (username: string) => void;
  onNavigateUser: (username: string) => void;
  onChallengeFriend?: (username: string) => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  currentUser,
  friendRequests,
  onAcceptRequest,
  onRejectRequest,
  onOpenDirectChat,
  onNavigateUser,
  onChallengeFriend
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'suggestions'>('friends');
  const [search, setSearch] = useState('');

  // Sample existing friends
  const myFriends = [
    {
      id: 'f1',
      name: 'Mestre Uarlei Silva',
      username: 'mestre.uarlei',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      modality: 'Jiu-Jitsu & MMA',
      belt: 'Faixa Preta 3º Dan',
      academy: 'UBF Team Parque Indiano',
      streak: 42
    },
    {
      id: 'f2',
      name: 'Amanda Souza',
      username: 'amanda_bjj',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      modality: 'Jiu-Jitsu',
      belt: 'Faixa Roxa',
      academy: 'UBF Team',
      streak: 14
    },
    {
      id: 'f3',
      name: 'Carlos Gracie Silva',
      username: 'carlos_mma',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      modality: 'MMA',
      belt: 'Faixa Preta',
      academy: 'Gracie Barra',
      streak: 21
    }
  ];

  // Suggestions for sparring / training partners
  const suggestions = [
    {
      id: 's1',
      name: 'Beatriz Lima',
      username: 'beatriz_thai',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      modality: 'Muay Thai',
      belt: 'Kruang Vermelho',
      city: 'São Paulo - SP',
      mutuals: 6
    },
    {
      id: 's2',
      name: 'Diego Santos',
      username: 'diego_wrestler',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
      modality: 'Wrestling & No-Gi',
      belt: 'Atleta Nacional',
      city: 'São Paulo - SP',
      mutuals: 12
    }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20 md:pb-12 select-none">
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-base font-black text-white">Amigos & Parceiros de Treino</h2>
          <p className="text-xs text-[#94A3B8]">Conecte-se com lutadores e monte seus sparrers</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#071321] p-1 rounded-2xl border border-[#171C25]">
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 min-h-[38px] rounded-xl text-xs font-bold transition-all ${
            activeTab === 'friends' ? 'bg-[#F20D18] text-white shadow-md' : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          Meus Amigos ({myFriends.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 min-h-[38px] rounded-xl text-xs font-bold transition-all relative ${
            activeTab === 'requests' ? 'bg-[#F20D18] text-white shadow-md' : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          Solicitações
          {friendRequests.length > 0 && (
            <span className="ml-1.5 bg-white text-[#F20D18] text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {friendRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`flex-1 min-h-[38px] rounded-xl text-xs font-bold transition-all ${
            activeTab === 'suggestions' ? 'bg-[#F20D18] text-white shadow-md' : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          Sugestões
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
        <input 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar lutador por nome, faixa ou academia..."
          className="w-full min-h-[42px] pl-10 pr-4 rounded-xl bg-[#0D121C] border border-[#171C25] text-white text-xs placeholder:text-[#64748B] focus:border-[#F20D18] focus:outline-none"
        />
      </div>

      {/* Tab: Friends */}
      {activeTab === 'friends' && (
        <div className="space-y-2.5">
          {myFriends.map((f) => (
            <div key={f.id} className="p-3.5 rounded-2xl bg-[#071321]/60 border border-[#171C25] flex items-center justify-between gap-3">
              <div 
                onClick={() => onNavigateUser(f.username)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <img src={f.avatar} alt={f.name} className="w-12 h-12 rounded-full object-cover border border-[#F20D18]" />
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{f.name}</h4>
                  <p className="text-[10px] text-[#F20D18] font-bold">{f.belt} • {f.modality}</p>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5">{f.academy}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#F20D18] bg-[#F20D18]/10 px-2 py-1 rounded-lg">
                  <Flame className="w-3.5 h-3.5 fill-[#F20D18]" />
                  <span>{f.streak}d</span>
                </div>
                {onChallengeFriend && (
                  <button
                    onClick={() => onChallengeFriend(f.username)}
                    className="min-h-[36px] px-2.5 rounded-xl bg-[#171C25] border border-[#F20D18]/30 text-white hover:border-[#F20D18] text-xs font-bold flex items-center gap-1 transition-all"
                    title="Desafio de Sparring"
                  >
                    <Swords className="w-3.5 h-3.5 text-[#F20D18]" />
                    <span className="hidden sm:inline">Desafiar</span>
                  </button>
                )}
                <button
                  onClick={() => onOpenDirectChat(f.username)}
                  className="w-9 h-9 rounded-xl bg-[#05070B] border border-[#171C25] text-white hover:border-[#F20D18] flex items-center justify-center transition-all"
                  title="Enviar mensagem"
                >
                  <MessageSquare className="w-4 h-4 text-[#F20D18]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-2.5">
          {friendRequests.length === 0 ? (
            <div className="p-8 text-center text-[#94A3B8] bg-[#071321]/40 border border-[#171C25] rounded-3xl">
              <UserCheck className="w-8 h-8 mx-auto mb-2 text-[#94A3B8]" />
              <p className="text-xs font-bold text-white">Nenhuma solicitação pendente</p>
            </div>
          ) : (
            friendRequests.map((req) => (
              <div key={req.id} className="p-3.5 rounded-2xl bg-[#071321]/60 border border-[#171C25] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={req.senderAvatar} alt={req.senderName} className="w-12 h-12 rounded-full object-cover border border-[#171C25]" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{req.senderName}</h4>
                    <p className="text-[10px] text-[#F20D18] font-bold">{req.senderBelt} • {req.senderModality}</p>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5">{req.mutualFriendsCount} amigos em comum</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onAcceptRequest(req.id)}
                    className="min-h-[36px] px-3.5 rounded-xl bg-[#F20D18] text-white font-bold text-xs flex items-center gap-1 hover:bg-[#d90812] active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aceitar</span>
                  </button>
                  <button
                    onClick={() => onRejectRequest(req.id)}
                    className="w-9 h-9 rounded-xl bg-[#05070B] border border-[#171C25] text-[#94A3B8] hover:text-white flex items-center justify-center"
                    title="Recusar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Suggestions */}
      {activeTab === 'suggestions' && (
        <div className="space-y-2.5">
          {suggestions.map((sug) => (
            <div key={sug.id} className="p-3.5 rounded-2xl bg-[#071321]/60 border border-[#171C25] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img src={sug.avatar} alt={sug.name} className="w-12 h-12 rounded-full object-cover border border-[#171C25]" />
                <div>
                  <h4 className="text-xs font-bold text-white">{sug.name}</h4>
                  <p className="text-[10px] text-[#F20D18] font-bold">{sug.belt} • {sug.modality}</p>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5">{sug.city} • {sug.mutuals} amigos em comum</p>
                </div>
              </div>

              <button
                onClick={() => alert(`Solicitação enviada para ${sug.name}!`)}
                className="min-h-[36px] px-3.5 rounded-xl bg-[#0D121C] border border-[#171C25] text-white font-bold text-xs flex items-center gap-1.5 hover:border-[#F20D18] active:scale-95 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#F20D18]" />
                <span>Conectar</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
