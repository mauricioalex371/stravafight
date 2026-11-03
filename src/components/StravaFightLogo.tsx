import React, { useState } from 'react';

interface StravaFightLogoProps {
  className?: string;
  variant?: 'full' | 'horizontal' | 'mark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Official STRAVA FIGHT Logo Component
 * Uses the official brand asset uploaded by the user (/assets/aistudio/LOGO_47d32ee0.jpg)
 * The previously selected text spans and extra polygon have been removed per user command.
 */
export const StravaFightLogo: React.FC<StravaFightLogoProps> = ({
  className = '',
  size = 'md'
}) => {
  const [imgError, setImgError] = useState(false);

  // Height sizing
  const heightClasses = {
    sm: 'h-8',
    md: 'h-10 sm:h-11',
    lg: 'h-14 sm:h-16',
    xl: 'h-24 sm:h-28'
  };

  if (!imgError) {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 select-none ${heightClasses[size]} ${className}`}>
        <img 
          src="/assets/aistudio/LOGO_47d32ee0.jpg" 
          alt="STRAVA FIGHT" 
          onError={() => setImgError(true)}
          className="h-full w-auto max-h-full rounded-xl object-contain filter drop-shadow-[0_2px_10px_rgba(242,13,24,0.3)] hover:scale-105 transition-transform"
        />
      </div>
    );
  }

  // Fallback SVG with deleted polygon and deleted text spans removed
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 select-none ${heightClasses[size]} ${className}`}>
      <svg 
        viewBox="0 0 450 320" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto filter drop-shadow-[0_2px_10px_rgba(242,13,24,0.35)]"
      >
        {/* Red S */}
        <path 
          d="M135 60 L305 60 L290 100 L168 100 L148 145 L268 145 L236 218 L68 218 L88 178 L212 178 L230 138 L112 138 L135 60 Z" 
          fill="#F20D18" 
        />
        {/* Top White Accent Spur */}
        <polygon points="304,58 324,58 310,76" fill="#FFFFFF" />
        {/* White F */}
        <polygon points="318,72 445,72 414,118 305,118" fill="#FFFFFF" />
        <polygon points="318,72 272,175 212,305 260,208 305,118" fill="#FFFFFF" />
      </svg>
    </div>
  );
};

