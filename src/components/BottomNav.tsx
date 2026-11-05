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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#05070B] border-t border-[#1F2937] pb-safe">
      <div className="flex items-center justify-around px-1 h-12">
        {/* 1. Início */}
        <button
          onClick={() => onChangeView('feed')}
          className={`flex items-center justify-center w-14 h-12 transition-colors ${
            currentView === 'feed' ? 'text-white' : 'text-[#71717A]'
          }`}
          aria-label="Início"
        >
          <Home className={`w-6 h-6 ${currentView === 'feed' ? 'fill-white' : ''}`} />
        </button>

        {/* 2. Explorar */}
        <button
          onClick={() => onChangeView('explore')}
          className={`flex items-center justify-center w-14 h-12 transition-colors ${
            currentView === 'explore' ? 'text-white' : 'text-[#71717A]'
          }`}
          aria-label="Explorar"
        >
          <Search className={`w-6 h-6 ${currentView === 'explore' ? 'stroke-[2.5px]' : ''}`} />
        </button>

        {/* 3. Criar */}
        <button
          onClick={onOpenCreateMenu}
          className="flex items-center justify-center w-14 h-12 text-white transition-colors"
          aria-label="Criar"
        >
          <PlusSquare className="w-6 h-6" />
        </button>

        {/* 4. Reels */}
        <button
          onClick={() => onChangeView('reels')}
          className={`flex items-center justify-center w-14 h-12 transition-colors ${
            currentView === 'reels' ? 'text-white' : 'text-[#71717A]'
          }`}
          aria-label="Reels"
        >
          <Clapperboard className={`w-6 h-6 ${currentView === 'reels' ? 'fill-white' : ''}`} />
        </button>

        {/* 5. Perfil */}
        <button
          onClick={() => onChangeView('profile')}
          className="flex items-center justify-center w-14 h-12"
          aria-label="Perfil"
        >
          <div className={`w-6 h-6 rounded-full overflow-hidden border-2 ${
            currentView === 'profile' ? 'border-white' : 'border-[#71717A]'
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
