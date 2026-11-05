import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Search, 
  PlusSquare, 
  Clapperboard, 
  User, 
  Flame,
  Bell
} from 'lucide-react';
import { UserProfile } from '../types';
import { NotificationsService } from '../services/supabase';

interface BottomNavProps {
  currentView: string;
  onChangeView: (view: string) => void;
  currentUser: UserProfile;
  onOpenCreateMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onChangeView,
  currentUser,
  onOpenCreateMenu
}) => {
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count
  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchUnreadCount = async () => {
      try {
        const count = await NotificationsService.getUnreadCount(currentUser.id);
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();

    // Setup realtime subscription for new notifications
    const cleanupFn = NotificationsService.subscribeToNotifications(
      currentUser.id,
      () => {
        fetchUnreadCount(); // Refresh count when new notification arrives
      }
    );

    return () => {
      if (cleanupFn) cleanupFn();
    };
  }, [currentUser?.id]);
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#05070B] border-t border-[#171C25] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around max-w-md mx-auto px-1 py-2">
        {/* 1. Início */}
        <button
          onClick={() => onChangeView('feed')}
          className={`flex items-center justify-center w-12 h-12 transition-colors ${
            currentView === 'feed' ? 'text-white' : 'text-[#94A3B8]'
          }`}
          aria-label="Início"
        >
          <Home className={`w-7 h-7 ${currentView === 'feed' ? 'fill-white' : ''}`} />
        </button>

        {/* 2. Explorar */}
        <button
          onClick={() => onChangeView('explore')}
          className={`flex items-center justify-center w-12 h-12 transition-colors ${
            currentView === 'explore' ? 'text-white' : 'text-[#94A3B8]'
          }`}
          aria-label="Explorar"
        >
          <Search className={`w-7 h-7 ${currentView === 'explore' ? 'stroke-[2.5px]' : ''}`} />
        </button>

        {/* 3. Criar */}
        <button
          onClick={onOpenCreateMenu}
          className="flex items-center justify-center w-12 h-12 text-white transition-colors"
          aria-label="Criar"
        >
          <PlusSquare className="w-7 h-7" />
        </button>

        {/* 4. Reels */}
        <button
          onClick={() => onChangeView('reels')}
          className={`flex items-center justify-center w-12 h-12 transition-colors ${
            currentView === 'reels' ? 'text-white' : 'text-[#94A3B8]'
          }`}
          aria-label="Reels"
        >
          <Clapperboard className={`w-7 h-7 ${currentView === 'reels' ? 'fill-white' : ''}`} />
        </button>

        {/* 5. Perfil */}
        <button
          onClick={() => onChangeView('profile')}
          className="flex items-center justify-center w-12 h-12"
          aria-label="Perfil"
        >
          <div className={`w-7 h-7 rounded-full overflow-hidden border-2 ${
            currentView === 'profile' ? 'border-white' : 'border-[#94A3B8]'
          }`}>
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.username} 
              className="w-full h-full object-cover" 
            />
          </div>
        </button>
      </div>
    </nav>
  );
};
