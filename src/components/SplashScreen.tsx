import React, { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simular carregamento
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-[#0A0A0A] via-[#0D0D0D] to-[#1A0A0A] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-[#F20D18] to-transparent transform -skew-y-12" />
        <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-tl from-[#F20D18] to-transparent transform skew-y-12" />
      </div>

      {/* Logo Container */}
      <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700">
        {/* SF Logo */}
        <div className="relative mb-8">
          <div className="absolute inset-0 blur-2xl bg-[#F20D18] opacity-50 animate-pulse" />
          <div className="relative flex items-center justify-center w-40 h-40 rounded-3xl bg-gradient-to-br from-[#F20D18] to-[#D90812] shadow-2xl shadow-[#F20D18]/50">
            <div className="text-8xl font-black text-white tracking-tighter drop-shadow-2xl">
              SF
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <div className="flex flex-col items-center gap-2 mb-12">
          <h1 className="text-4xl font-black text-white tracking-wider drop-shadow-lg">
            STRAVA <span className="text-[#F20D18]">FIGHT</span>
          </h1>
          <div className="flex items-center gap-2 text-[#94A3B8] text-sm font-bold tracking-[0.3em] uppercase">
            <Flame className="w-4 h-4 text-[#F20D18] animate-pulse" />
            <span>Supere Seus Limites</span>
            <Flame className="w-4 h-4 text-[#F20D18] animate-pulse" />
          </div>
        </div>

        {/* Loading Bar */}
        <div className="w-64 h-1.5 bg-[#1F2937] rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-gradient-to-r from-[#F20D18] to-[#FF4A0F] rounded-full transition-all duration-300 ease-out shadow-lg shadow-[#F20D18]/50"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading Text */}
        <div className="mt-6 text-[#64748B] text-xs font-semibold tracking-wider uppercase">
          Carregando tatame... {progress}%
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#F20D18] rounded-full animate-ping opacity-20" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-[#F20D18] rounded-full animate-ping opacity-20" style={{ animationDelay: '1s', animationDuration: '3s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-[#F20D18] rounded-full animate-ping opacity-20" style={{ animationDelay: '2s', animationDuration: '3s' }} />
      </div>
    </div>
  );
};
