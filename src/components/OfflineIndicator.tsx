import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-2xl bg-[#F20D18] px-4 py-2 text-xs font-bold text-white shadow-xl shadow-[#F20D18]/30 border border-white/20 animate-bounce">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Modo Offline — Exibindo dados locais do tatame.</span>
    </div>
  );
};
