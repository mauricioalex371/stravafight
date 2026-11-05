import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Carregamento de 7 segundos (70ms por 1%)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 1;
      });
    }, 70); // 7000ms total

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Video Background - Full Screen */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect fill='%23000000' width='1' height='1'/%3E%3C/svg%3E"
      >
        <source src="https://res.cloudinary.com/wvucafte/video/upload/v1793890648/gemini_generated_video_73b77deb.mp4" type="video/mp4" />
      </video>

      {/* Loading Bar Container - Positioned at Bottom */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 w-64">
        {/* Loading Bar */}
        <div className="w-full h-2 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden relative shadow-2xl">
          <div 
            className="h-full bg-gradient-to-r from-white via-blue-200 to-white rounded-full transition-all duration-300 ease-out shadow-lg"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading Text */}
        <div className="mt-4 text-white text-sm font-semibold tracking-wider uppercase text-center drop-shadow-lg">
          {progress}%
        </div>
      </div>
    </div>
  );
};
