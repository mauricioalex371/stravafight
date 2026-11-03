import React from 'react';
import { 
  Home, 
  Search, 
  PlusSquare, 
  Clapperboard, 
  User, 
  Flame 
} from 'lucide-react';
import { UserProfile } from '../types';

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
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#05070B]/95 backdrop-blur-lg border-t border-[#171C25] pb-[env(safe-area-inset-bottom)] shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto px-2 py-1">
        {/* 1. Feed / Início */}
        <button
          onClick={() => onChangeView('feed')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[50px] py-1 transition-all active:scale-90 ${
            currentView === 'feed' ? 'text-[#F20D18]' : 'text-[#94A3B8] hover:text-white'
          }`}
          aria-label="Início"
        >
          <Home className={`w-5 h-5 transition-transform ${currentView === 'feed' ? 'scale-110 stroke-[2.5]' : ''}`} />
          <span className={`text-[10px] mt-1 font-medium ${currentView === 'feed' ? 'font-bold text-white' : ''}`}>
            Início
          </span>
        </button>

        {/* 2. Explorar */}
        <button
          onClick={() => onChangeView('explore')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[50px] py-1 transition-all active:scale-90 ${
            currentView === 'explore' ? 'text-[#F20D18]' : 'text-[#94A3B8] hover:text-white'
          }`}
          aria-label="Explorar"
        >
          <Search className={`w-5 h-5 transition-transform ${currentView === 'explore' ? 'scale-110 stroke-[2.5]' : ''}`} />
          <span className={`text-[10px] mt-1 font-medium ${currentView === 'explore' ? 'font-bold text-white' : ''}`}>
            Explorar
          </span>
        </button>

        {/* 3. Criar (+) / Check-in */}
        <button
          onClick={onOpenCreateMenu}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[50px] py-1 text-white group active:scale-90 transition-all"
          aria-label="Criar"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F20D18] to-[#FF4A0F] flex items-center justify-center shadow-md shadow-[#F20D18]/30 group-hover:scale-105 transition-transform">
            <PlusSquare className="w-5 h-5 text-white" />
          </div>
        </button>

        {/* 4. SF Reels */}
        <button
          onClick={() => onChangeView('reels')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[50px] py-1 transition-all active:scale-90 ${
            currentView === 'reels' ? 'text-[#F20D18]' : 'text-[#94A3B8] hover:text-white'
          }`}
          aria-label="SF Reels"
        >
          <Clapperboard className={`w-5 h-5 transition-transform ${currentView === 'reels' ? 'scale-110 stroke-[2.5]' : ''}`} />
          <span className={`text-[10px] mt-1 font-medium ${currentView === 'reels' ? 'font-bold text-white' : ''}`}>
            Reels
          </span>
        </button>

        {/* 5. Perfil */}
        <button
          onClick={() => onChangeView('profile')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[50px] py-1 transition-all active:scale-90 ${
            currentView === 'profile' ? 'text-[#F20D18]' : 'text-[#94A3B8] hover:text-white'
          }`}
          aria-label="Perfil"
        >
          <div className={`w-6 h-6 rounded-full overflow-hidden border-2 transition-all ${
            currentView === 'profile' ? 'border-[#F20D18] scale-110' : 'border-transparent'
          }`}>
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.username} 
              className="w-full h-full object-cover" 
            />
          </div>
          <span className={`text-[10px] mt-0.5 font-medium ${currentView === 'profile' ? 'font-bold text-white' : ''}`}>
            Perfil
          </span>
        </button>
      </div>
    </nav>
  );
};
