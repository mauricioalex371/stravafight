import React from 'react';
import { 
  Flame, 
  MessageSquare, 
  Bell, 
  ShieldCheck, 
  Plus, 
  Search,
  Sparkles,
  Briefcase
} from 'lucide-react';
import { UserProfile } from '../types';
import { StravaFightLogo } from './StravaFightLogo';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {

  currentUser: UserProfile;
  unreadMessagesCount: number;
  unreadNotificationsCount: number;
  onOpenDirect: () => void;
  onOpenNotifications: () => void;
  onOpenAcademy: () => void;
  onOpenCheckIn: () => void;
  onOpenCreatePost: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  unreadMessagesCount,
  unreadNotificationsCount,
  onOpenDirect,
  onOpenNotifications,
  onOpenAcademy,
  onOpenCheckIn,
  onOpenCreatePost,
  onNavigate,
  currentView
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#05070B]/95 backdrop-blur-md border-b border-[#171C25] px-3.5 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Official Brand Logo */}
        <div 
          onClick={() => onNavigate('feed')}
          className="flex items-center cursor-pointer select-none group"
        >
          <StravaFightLogo variant="horizontal" size="md" className="group-hover:scale-105 transition-transform" />
        </div>

        {/* Center / Search shortcut on desktop */}
        <div 
          onClick={() => onNavigate('explore')}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0D121C] border border-[#171C25] text-[#94A3B8] text-xs w-64 cursor-pointer hover:border-[#F20D18]/50 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span>Buscar atletas, academias...</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* PWA Install Action */}
          <PWAInstallButton />

          {/* Tatame Streak Badge */}
          <button
            onClick={onOpenCheckIn}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#171C25]/80 border border-[#F20D18]/40 text-white text-xs font-bold hover:bg-[#F20D18]/15 transition-all active:scale-95 shadow-sm"
            title="Seu Tatame Streak diário! Clique para registrar treino"
          >
            <Flame className="w-4 h-4 text-[#F20D18] fill-[#F20D18] animate-pulse" />
            <span className="text-[#F20D18] font-black">{currentUser.streakDays}</span>
            <span className="text-[11px] text-[#CBD5E1] hidden xs:inline">dias</span>
          </button>

          {/* Quick Check-in Button */}
          <button
            onClick={onOpenCheckIn}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#F20D18] to-[#D90812] text-white text-xs font-bold hover:opacity-95 active:scale-95 transition-all shadow-md shadow-[#F20D18]/25"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Check-in Treino</span>
          </button>

          {/* SF Business Quick Switch */}
          <button
            onClick={() => onNavigate('business')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
              currentView === 'business'
                ? 'bg-[#F20D18] border-[#F20D18] text-white shadow-md shadow-[#F20D18]/25'
                : 'bg-[#0D121C] border-[#171C25] text-[#94A3B8] hover:text-white hover:border-[#F20D18]/40'
            }`}
            title="Acessar SF Business - Central de Anúncios, Patrocínios e Oportunidades"
          >
            <Briefcase className="w-4 h-4 text-[#F20D18]" />
            <span className="hidden sm:inline">SF Business</span>
          </button>

          {/* SF Academy Quick Switch */}
          <button
            onClick={onOpenAcademy}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
              currentView === 'academy'
                ? 'bg-[#F20D18] border-[#F20D18] text-white'
                : 'bg-[#0D121C] border-[#171C25] text-[#94A3B8] hover:text-white hover:border-[#F20D18]/40'
            }`}
            title="Acessar SF Academy - Gestão de Alunos, Turmas e Finanças"
          >
            <ShieldCheck className="w-4 h-4 text-[#F20D18]" />
            <span className="hidden sm:inline">SF Academy</span>
          </button>

          {/* Direct Messages Icon */}
          <button
            onClick={onOpenDirect}
            className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              currentView === 'direct'
                ? 'bg-[#F20D18] text-white'
                : 'bg-[#0D121C] border border-[#171C25] text-[#CBD5E1] hover:text-white hover:border-[#F20D18]'
            }`}
            title="Mensagens Diretas"
            aria-label="Mensagens"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#F20D18] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-[16px] text-center border-2 border-[#05070B] animate-pulse">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          {/* Notifications Icon */}
          <button
            onClick={onOpenNotifications}
            className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              currentView === 'notifications'
                ? 'bg-[#F20D18] text-white'
                : 'bg-[#0D121C] border border-[#171C25] text-[#CBD5E1] hover:text-white hover:border-[#F20D18]'
            }`}
            title="Notificações"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#F20D18] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-[16px] text-center border-2 border-[#05070B]">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
