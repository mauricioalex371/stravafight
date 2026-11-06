import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VisualConfigService } from '../utils/visualConfigService';
import { InicioPageConfig } from '../types/visualConfig';

export const InicioPage: React.FC = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<InicioPageConfig>(
    VisualConfigService.load().pages.inicio
  );

  useEffect(() => {
    const handleConfigChange = () => {
      setConfig(VisualConfigService.load().pages.inicio);
    };

    window.addEventListener('visualConfigChanged', handleConfigChange);
    return () => window.removeEventListener('visualConfigChanged', handleConfigChange);
  }, []);

  if (!config.enabled) {
    navigate('/login');
    return null;
  }

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
      className="fixed inset-0 flex flex-col items-center justify-between overflow-hidden"
      style={getBackgroundStyle()}
    >
      {/* Background Video (se habilitado) */}
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
        className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-md"
        style={{ 
          padding: `${config.spacing.padding}px`,
          gap: `${config.spacing.gap}px`
        }}
      >
        {/* Logo */}
        <div 
          className="mb-8 animate-in zoom-in fade-in duration-700"
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
            className="drop-shadow-2xl"
          />
        </div>

        {/* Title */}
        {config.title.show && (
          <h1 
            className="text-center animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100"
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
            className="text-center animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200"
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
        <div className="w-full space-y-4 mt-8 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300">
          {config.buttons.signup.show && (
            <button
              onClick={() => navigate('/cadastro')}
              className="w-full transition-transform active:scale-95 font-bold"
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
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {config.buttons.signup.text}
            </button>
          )}

          {config.buttons.login.show && (
            <button
              onClick={() => navigate('/login')}
              className="w-full transition-transform active:scale-95 font-bold"
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
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {config.buttons.login.text}
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center text-xs p-4" style={{ color: '#64748B' }}>
        <p>Ao continuar, você concorda com nossos</p>
        <p className="mt-1">
          <button className="font-semibold hover:underline" style={{ color: '#42A5F5' }}>
            Termos de Uso
          </button>
          {' e '}
          <button className="font-semibold hover:underline" style={{ color: '#42A5F5' }}>
            Política de Privacidade
          </button>
        </p>
      </div>
    </div>
  );
};
