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
            {/* Logo Real SF */}
            <div className="w-72 h-auto">
              {/* Logo externa - vou adicionar via public */}
              <div className="flex flex-col items-center gap-4">
                {/* SF Icon */}
                <div className="relative w-48 h-32 flex items-center justify-center">
                  <svg viewBox="0 0 400 200" className="w-full h-full drop-shadow-2xl">
                    {/* S vermelho */}
                    <path d="M10 40 L90 40 L90 70 L50 70 L50 90 L90 90 L90 120 L10 120 L10 90 L50 90 L50 70 L10 70 Z" fill="#FF0000"/>
                    {/* F branco */}
                    <path d="M100 40 L150 40 L130 80 L150 80 L150 90 L130 90 L100 120 Z" fill="#FFFFFF"/>
                    <polygon points="150,40 180,40 200,80 190,80" fill="#FFFFFF"/>
                    <path d="M200 40 L240 40 L240 70 L210 70 L210 90 L230 90 L230 100 L210 100 L210 120 L200 120 Z" fill="#FFFFFF"/>
                  </svg>
                </div>
                {/* STRAVA FIGHT texto */}
                <div className="flex items-center gap-2 text-4xl font-black tracking-wider">
                  <span className="text-white">STRAVA</span>
                  <span className="text-[#FF0000]">FIGHT</span>
                </div>
              </div>
            </div>
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
