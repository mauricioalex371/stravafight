import React from 'react';
import { 
  Home, 
  Search, 
  Clapperboard, 
  MessageSquare, 
  Users, 
  Trophy, 
  ShieldCheck, 
  User, 
  FileText,
  PlusCircle,
  Flame,
  Sparkles,
  Briefcase
} from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  currentUser: UserProfile;
  unreadMessagesCount: number;
  onOpenCheckIn: () => void;
  onOpenCreatePost: () => void;
  onOpenSfActivity?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onChangeView,
  currentUser,
  unreadMessagesCount,
  onOpenCheckIn,
  onOpenCreatePost,
  onOpenSfActivity
}) => {
  const navItems = [
    { id: 'feed', label: 'Início', icon: Home },
    { id: 'explore', label: 'Explorar', icon: Search },
    { id: 'reels', label: 'SF Reels', icon: Clapperboard },
    { id: 'direct', label: 'Mensagens', icon: MessageSquare, badge: unreadMessagesCount },
    { id: 'business', label: 'SF Business', icon: Briefcase, highlight: true },
    { id: 'academy', label: 'SF Academy', icon: ShieldCheck, highlight: true },
    { id: 'friends', label: 'Amigos & Sparrings', icon: Users },
    { id: 'events', label: 'Eventos & Lutas', icon: Trophy },
    { id: 'profile', label: 'Meu Perfil', icon: User },
    { id: 'institutional', label: 'Sobre & Planos', icon: FileText },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-[#071321]/40 border-r border-[#171C25] min-h-[calc(100vh-61px)] p-4 sticky top-[61px] self-start">
      {/* User Quick Info */}
      <div 
        onClick={() => onChangeView('profile')}
        className="flex items-center gap-3 p-3 rounded-2xl bg-[#0D121C] border border-[#171C25] hover:border-[#F20D18]/40 transition-all cursor-pointer mb-5 shadow-sm"
      >
        <div className="relative">
          <img 
            src={currentUser.avatarUrl} 
            alt={currentUser.fullName}
            className="w-11 h-11 rounded-xl object-cover border border-[#F20D18]/50" 
          />
          <div className="absolute -bottom-1 -right-1 bg-[#F20D18] rounded-full p-0.5" title="Ativo no Tatame">
            <Flame className="w-3 h-3 text-white fill-white" />
          </div>
        </div>
        <div className="truncate flex-1">
          <div className="flex items-center gap-1">
            <h4 className="text-xs font-bold text-white truncate">{currentUser.fullName}</h4>
            {currentUser.isVerified && (
              <span className="w-3.5 h-3.5 rounded-full bg-[#F20D18] text-white flex items-center justify-center text-[9px] font-black shrink-0">✓</span>
            )}
          </div>
          <p className="text-[11px] text-[#F20D18] font-semibold truncate">
            {currentUser.modalities[0]?.belt || 'Lutador'}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-[#94A3B8]">
            <Flame className="w-3 h-3 text-[#F20D18] fill-[#F20D18]" />
            <span className="font-bold text-white">{currentUser.streakDays} dias de streak</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 mb-5">
        {onOpenSfActivity && (
          <button
            onClick={onOpenSfActivity}
            className="w-full min-h-[42px] px-3 rounded-xl bg-gradient-to-r from-[#F20D18] to-[#FF4A0F] text-white font-black text-xs flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-md shadow-[#F20D18]/30"
          >
            <Sparkles className="w-4 h-4" />
            <span>SF Activity • Filtro Oficial</span>
          </button>
        )}

        <button
          onClick={onOpenCheckIn}
          className="w-full min-h-[38px] px-3 rounded-xl bg-[#0D121C] border border-[#171C25] text-white font-bold text-xs flex items-center justify-center gap-2 hover:border-[#F20D18] active:scale-95 transition-all"
        >
          <Flame className="w-4 h-4 text-[#F20D18]" />
          <span>Check-in de Treino</span>
        </button>

        <button
          onClick={onOpenCreatePost}
          className="w-full min-h-[38px] px-3 rounded-xl bg-[#05070B] border border-[#171C25] text-[#94A3B8] hover:text-white font-bold text-xs flex items-center justify-center gap-2 hover:border-white/30 active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4 text-[#94A3B8]" />
          <span>Nova Publicação</span>
        </button>
      </div>

      {/* Navigation links */}
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#F20D18] text-white font-bold shadow-md shadow-[#F20D18]/20'
                  : item.highlight
                  ? 'bg-[#0D121C] border border-[#171C25] text-white hover:border-[#F20D18]/40'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#0D121C]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-[#F20D18]' : 'text-[#94A3B8]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white text-[#F20D18]' : 'bg-[#F20D18] text-white'
                }`}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Institutional Footer */}
      <div className="pt-4 border-t border-[#171C25] mt-auto">
        <p className="text-[10px] text-[#64748B] font-medium leading-relaxed">
          STRAVA FIGHT © 2026. Todos os direitos reservados.
        </p>
        <p className="text-[10px] text-[#F20D18] font-bold mt-0.5">
          “Esforço que transforma, luta que evolui.”
        </p>
      </div>
    </aside>
  );
};
