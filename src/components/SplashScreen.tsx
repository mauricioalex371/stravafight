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

      {/* 3D Animated Loader - Positioned at Bottom */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-4">
        {/* 3D Loader */}
        <span className="loader drop-shadow-2xl"></span>
      </div>
    </div>
  );
};
