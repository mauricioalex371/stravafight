import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Carregamento de 5 segundos (500ms por 10%)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 1;
      });
    }, 50); // 5000ms total

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-[#0A1929] via-[#0D1B2A] to-[#0F1E2E] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-[#1976D2] to-transparent transform -skew-y-12" />
        <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-tl from-[#1976D2] to-transparent transform skew-y-12" />
      </div>

      {/* Logo Container */}
      <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700">
        {/* SF Logo com STRAVA FIGHT */}
        <div className="relative mb-8">
          <div className="absolute inset-0 blur-3xl bg-[#1976D2] opacity-40 animate-pulse" />
          <div className="relative flex flex-col items-center">
            {/* Logo Image */}
            <img 
              src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80"
              alt="STRAVA FIGHT Logo"
              className="w-64 h-auto drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 0 30px rgba(25, 118, 210, 0.6))' }}
            />
          </div>
        </div>

        {/* Tagline */}
        <div className="flex items-center gap-2 text-[#90CAF9] text-base font-bold tracking-wide mb-12">
          <span className="text-2xl">🌍</span>
          <span>Uma comunidade sem fronteiras</span>
        </div>

        {/* Loading Bar */}
        <div className="w-64 h-1.5 bg-[#1A2634] rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-gradient-to-r from-[#1976D2] to-[#42A5F5] rounded-full transition-all duration-300 ease-out shadow-lg shadow-[#1976D2]/50"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading Text */}
        <div className="mt-6 text-[#546E7A] text-xs font-semibold tracking-wider uppercase">
          Carregando... {progress}%
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#1976D2] rounded-full animate-ping opacity-20" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-[#42A5F5] rounded-full animate-ping opacity-20" style={{ animationDelay: '1s', animationDuration: '3s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-[#1976D2] rounded-full animate-ping opacity-20" style={{ animationDelay: '2s', animationDuration: '3s' }} />
      </div>
    </div>
  );
};
