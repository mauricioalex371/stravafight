import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { VisualConfigService } from '../utils/visualConfigService';
import { LoginPageConfig } from '../types/visualConfig';
import { AuthService } from '../services/supabase/authService';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<LoginPageConfig>(
    VisualConfigService.load().pages.login
  );
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleConfigChange = () => {
      setConfig(VisualConfigService.load().pages.login);
    };
    window.addEventListener('visualConfigChanged', handleConfigChange);
    return () => window.removeEventListener('visualConfigChanged', handleConfigChange);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulação - substituir por lógica real
      setTimeout(() => {
        onLogin();
      }, 1000);
    } catch (error) {
      alert('Erro ao fazer login');
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      const result = await AuthService.signInWithOAuth(provider);
      if (!result.success) {
        alert(`Erro ao conectar com ${provider}: ${result.error}`);
      }
    } catch (error) {
      alert('Erro ao realizar login social');
    }
  };

  const bgStyle = config.background.type === 'gradient' && config.background.gradient
    ? { background: `linear-gradient(to bottom, ${config.background.gradient.from}, ${config.background.gradient.to})` }
    : { backgroundColor: config.background.color };

  return (
    <div className="fixed inset-0 flex flex-col overflow-y-auto" style={bgStyle}>
      {/* Header com Voltar */}
      <div className="sticky top-0 z-20 backdrop-blur-lg border-b" style={{ borderColor: '#1A2634' }}>
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/inicio')}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90"
            style={{ backgroundColor: '#1A2634', color: '#FFFFFF' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          {config.title.show && (
            <h2 className="text-lg font-black" style={{ color: config.title.color }}>
              {config.title.text}
            </h2>
          )}
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
          {/* Logo */}
          {config.logo.show && (
            <div className="flex justify-center mb-8">
              <img 
                src={config.logo.url} 
                alt="Logo" 
                style={{ width: `${config.logo.width}px`, height: 'auto' }}
              />
            </div>
          )}

          {/* Social Login Buttons */}
          {config.social.enabled && (
            <>
              <div className="space-y-3">
                {config.social.google.enabled && (
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    className="w-full py-4 px-6 rounded-full bg-white text-[#1F2937] font-bold flex items-center justify-center gap-3 transition-transform active:scale-95"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {config.social.google.text}
                  </button>
                )}

                {config.social.facebook.enabled && (
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('facebook')}
                    className="w-full py-4 px-6 rounded-full bg-[#1877F2] text-white font-bold flex items-center justify-center gap-3 transition-transform active:scale-95"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    {config.social.facebook.text}
                  </button>
                )}

                {config.social.apple.enabled && (
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('apple')}
                    className="w-full py-4 px-6 rounded-full bg-black text-white font-bold flex items-center justify-center gap-3 transition-transform active:scale-95 border-2"
                    style={{ borderColor: '#2D3748' }}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    {config.social.apple.text}
                  </button>
                )}
              </div>

              {/* Divider */}
              <div className="relative py-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: '#1E293B' }}></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 text-sm font-bold uppercase tracking-wider" style={{ color: '#64748B', backgroundColor: config.background.color }}>
                    {config.social.dividerText}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Email Field */}
          {config.fields.email.show && (
            <div className="space-y-2">
              <label className="text-sm font-bold block" style={{ color: config.fields.email.labelColor }}>
                {config.fields.email.label}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#546E7A' }} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={config.fields.email.placeholder}
                  className="w-full h-14 pl-12 pr-4 rounded-xl outline-none transition-all"
                  style={{ 
                    backgroundColor: '#0D1B2A',
                    border: '1px solid #1A2634',
                    color: '#FFFFFF'
                  }}
                  required
                />
              </div>
            </div>
          )}

          {/* Password Field */}
          {config.fields.password.show && (
            <div className="space-y-2">
              <label className="text-sm font-bold block" style={{ color: config.fields.password.labelColor }}>
                {config.fields.password.label}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#546E7A' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={config.fields.password.placeholder}
                  className="w-full h-14 pl-12 pr-12 rounded-xl outline-none transition-all"
                  style={{ 
                    backgroundColor: '#0D1B2A',
                    border: '1px solid #1A2634',
                    color: '#FFFFFF'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#546E7A' }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Forgot Password */}
          {config.links.forgotPassword.show && (
            <div className="text-right">
              <button 
                type="button" 
                className="text-sm font-semibold hover:underline"
                style={{ color: config.links.forgotPassword.color }}
              >
                {config.links.forgotPassword.text}
              </button>
            </div>
          )}

          {/* Submit Button */}
          {config.buttons.submit.show && (
            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold transition-all mt-8"
              style={{
                backgroundColor: config.buttons.submit.bgColor,
                color: config.buttons.submit.textColor,
                borderRadius: `${config.buttons.submit.borderRadius}px`,
                paddingLeft: `${config.buttons.submit.paddingX}px`,
                paddingRight: `${config.buttons.submit.paddingX}px`,
                paddingTop: `${config.buttons.submit.paddingY}px`,
                paddingBottom: `${config.buttons.submit.paddingY}px`,
                fontSize: `${config.buttons.submit.fontSize}px`,
                fontWeight: config.buttons.submit.fontWeight,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'wait' : 'pointer'
              }}
            >
              {loading ? 'Entrando...' : config.buttons.submit.text}
            </button>
          )}

          {/* Signup Link */}
          {config.links.signup.show && (
            <div className="text-center text-sm" style={{ color: '#78909C' }}>
              <p>
                Não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/cadastro')}
                  className="font-bold hover:underline"
                  style={{ color: config.links.signup.color }}
                >
                  {config.links.signup.text}
                </button>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
