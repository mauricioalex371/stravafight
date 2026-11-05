import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    // Detecta mudanças de tamanho da tela
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Carregamento de 9 segundos (90ms por 1%)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 1;
      });
    }, 90); // 9000ms total

    return () => clearInterval(interval);
  }, [onComplete]);

  // Vídeos diferentes para mobile e desktop
  const videoUrl = isMobile
    ? "https://res.cloudinary.com/wvucafte/video/upload/v1793890648/gemini_generated_video_73b77deb.mp4" // Mobile (vertical)
    : "https://res.cloudinary.com/wvucafte/video/upload/v1793891402/Strava_Fight_app_splash_screen_7ee78a25.mp4"; // Desktop (16:9)

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Video Background - Full Screen */}
      <video
        key={videoUrl} // Force re-render when URL changes
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect fill='%23000000' width='1' height='1'/%3E%3C/svg%3E"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Loading Spinner - Positioned at Bottom */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
        {/* Circular Spinner */}
        <div className="relative w-8 h-8">
          {/* Background Circle */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="3"
            />
            {/* Progress Circle */}
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="87.96"
              strokeDashoffset={87.96 - (87.96 * progress) / 100}
              className="transition-all duration-300 ease-out drop-shadow-lg"
            />
          </svg>
          {/* Percentage Text Inside Circle */}
          <div className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold">
            {progress}
          </div>
        </div>
      </div>
    </div>
  );
};
