import React from 'react';
import { 
  Flame, 
  MessageSquare, 
  Bell, 
  ShieldCheck, 
  Plus, 
  Search,
  Sparkles,
  Briefcase,
  Sun,
  Moon
} from 'lucide-react';
import { UserProfile } from '../types';
import { StravaFightLogo } from './StravaFightLogo';
import { PWAInstallButton } from './PWAInstallButton';
import { BusinessSyncBadge } from './BusinessSyncIndicator';

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
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
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
  currentView,
  theme,
  onToggleTheme
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#05070B]/98 backdrop-blur-md border-b border-[#171C25] px-4 py-3 transition-all">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        {/* Logo STRAVA FIGHT (estilo Instagram) */}
        <div 
          onClick={() => onNavigate('feed')}
          className="cursor-pointer select-none"
        >
          <h1 className="text-white text-xl font-black tracking-tight">
            STRAVA FIGHT
          </h1>
        </div>

        {/* Right Actions - Minimalista */}
        <div className="flex items-center gap-4">
          {/* Notifications Icon - Simples */}
          <button
            onClick={onOpenNotifications}
            className="relative text-white hover:text-[#F20D18] transition-colors"
            aria-label="Notificações"
          >
            <Bell className="w-6 h-6" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#F20D18] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Direct Messages - Simples */}
          <button
            onClick={onOpenDirect}
            className="relative text-white hover:text-[#F20D18] transition-colors"
            aria-label="Mensagens"
          >
            <MessageSquare className="w-6 h-6" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#F20D18] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {unreadMessagesCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
