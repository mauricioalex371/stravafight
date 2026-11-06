import React from 'react';
import { InicioPageConfig } from '../../types/visualConfig';

interface InicioPreviewProps {
  config: InicioPageConfig;
  scale?: number;
}

export const InicioPreview: React.FC<InicioPreviewProps> = ({ config, scale = 0.5 }) => {
  const getBackgroundStyle = () => {
    const { background } = config;
    
    if (background.type === 'solid') {
      return { backgroundColor: background.color };
    }
    
    if (background.type === 'gradient' && background.gradient) {
      return {
        background: `linear-gradient(${background.gradient.direction}, ${background.gradient.from}, ${background.gradient.to})`
      };
    }
    
    return {};
  };

  return (
    <div 
      className="relative overflow-hidden"
      style={{
        width: '375px',
        height: '667px',
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        ...getBackgroundStyle()
      }}
    >
      {/* Background Video */}
      {config.background.type === 'video' && config.background.videoUrl && (
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            style={{ opacity: config.background.videoOpacity || 0.3 }}
          >
            <source src={config.background.videoUrl} type="video/mp4" />
          </video>
        </div>
      )}

      {/* Content */}
      <div 
        className="relative z-10 flex flex-col items-center justify-center h-full"
        style={{ 
          padding: `${config.spacing.padding}px`,
          gap: `${config.spacing.gap}px`
        }}
      >
        {/* Logo */}
        <div 
          style={{ 
            width: '100%',
            display: 'flex',
            justifyContent: config.logo.position 
          }}
        >
          <img 
            src={config.logo.url} 
            alt="Logo" 
            style={{ width: `${config.logo.width}px`, height: 'auto' }}
          />
        </div>

        {/* Title */}
        {config.title.show && (
          <h1 
            className="text-center"
            style={{
              color: config.title.color,
              fontSize: `${config.title.fontSize}px`,
              fontWeight: config.title.fontWeight,
              margin: 0
            }}
          >
            {config.title.text}
          </h1>
        )}

        {/* Subtitle */}
        {config.subtitle.show && (
          <p 
            className="text-center"
            style={{
              color: config.subtitle.color,
              fontSize: `${config.subtitle.fontSize}px`,
              margin: 0
            }}
          >
            {config.subtitle.text}
          </p>
        )}

        {/* Buttons */}
        <div className="w-full space-y-4 mt-8">
          {config.buttons.signup.show && (
            <button
              className="w-full font-bold pointer-events-none"
              style={{
                backgroundColor: config.buttons.signup.bgColor,
                color: config.buttons.signup.textColor,
                borderRadius: `${config.buttons.signup.borderRadius}px`,
                paddingLeft: `${config.buttons.signup.paddingX}px`,
                paddingRight: `${config.buttons.signup.paddingX}px`,
                paddingTop: `${config.buttons.signup.paddingY}px`,
                paddingBottom: `${config.buttons.signup.paddingY}px`,
                fontSize: `${config.buttons.signup.fontSize}px`,
                fontWeight: config.buttons.signup.fontWeight,
                border: 'none'
              }}
            >
              {config.buttons.signup.text}
            </button>
          )}

          {config.buttons.login.show && (
            <button
              className="w-full font-bold pointer-events-none"
              style={{
                backgroundColor: config.buttons.login.bgColor,
                color: config.buttons.login.textColor,
                borderRadius: `${config.buttons.login.borderRadius}px`,
                paddingLeft: `${config.buttons.login.paddingX}px`,
                paddingRight: `${config.buttons.login.paddingX}px`,
                paddingTop: `${config.buttons.login.paddingY}px`,
                paddingBottom: `${config.buttons.login.paddingY}px`,
                fontSize: `${config.buttons.login.fontSize}px`,
                fontWeight: config.buttons.login.fontWeight,
                border: 'none'
              }}
            >
              {config.buttons.login.text}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
