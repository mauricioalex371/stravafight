import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { Analytics } from '../utils/analytics';

interface AuthScreenProps {
  onLogin: () => void;
  onSignup: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onSignup }) => {
  const [mode, setMode] = useState<'welcome' | 'login' | 'signup'>('welcome');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isVerified) {
      alert('Por favor, complete a verificação anti-bot primeiro.');
      return;
    }

    if (mode === 'login') {
      Analytics.trackLogin('email');
      onLogin();
    } else if (mode === 'signup') {
      onSignup();
    }
  };

  const handleVerification = () => {
    setIsVerifying(true);
    // Simula verificação de 2 segundos
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
    }, 2000);
  };

  // Welcome Screen
  if (mode === 'welcome') {
    return (
      <div className="fixed inset-0 z-[9997] bg-gradient-to-br from-[#0A1929] via-[#0D1B2A] to-[#0F1E2E] flex flex-col items-center justify-between p-8 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#1976D2] rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#42A5F5] rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-md">
          {/* Logo Image */}
          <div className="mb-8 animate-in zoom-in fade-in duration-700">
            <div className="relative">
              <div className="absolute inset-0 blur-2xl bg-[#1976D2] opacity-30 animate-pulse" />
              <img 
                src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80"
                alt="STRAVA FIGHT Logo"
                className="relative w-56 h-auto drop-shadow-2xl"
                style={{ filter: 'drop-shadow(0 0 30px rgba(25, 118, 210, 0.5))' }}
              />
            </div>
          </div>

          {/* Tagline */}
          <div className="text-center mb-16 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100">
            <div className="flex items-center justify-center gap-2 text-[#90CAF9] text-base font-semibold">
              <span className="text-2xl">🌍</span>
              <span>Uma comunidade sem fronteiras</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="w-full space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200">
            <button
              onClick={() => setMode('signup')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#1976D2] to-[#1565C0] text-white font-black text-base shadow-lg shadow-[#1976D2]/30 active:scale-95 transition-transform"
            >
              Criar Conta
            </button>
            
            <button
              onClick={() => setMode('login')}
              className="w-full py-4 rounded-2xl bg-[#1A2634] text-white font-bold text-base border border-[#263849] active:scale-95 transition-transform"
            >
              Já tenho conta
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-center text-[#546E7A] text-xs">
          <p>Ao continuar, você concorda com nossos</p>
          <p className="mt-1">
            <button className="text-[#42A5F5] font-semibold">Termos de Uso</button>
            {' e '}
            <button className="text-[#42A5F5] font-semibold">Política de Privacidade</button>
          </p>
        </div>
      </div>
    );
  }

  // Login/Signup Form
  return (
    <div className="fixed inset-0 z-[9997] bg-[#0A1929] flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0A1929]/95 backdrop-blur-lg border-b border-[#1A2634]">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setMode('welcome')}
            className="w-10 h-10 rounded-full bg-[#1A2634] flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-black text-white">
            {mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </h2>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 p-6">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#90CAF9]">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#546E7A]" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
                className="w-full h-14 pl-12 pr-4 bg-[#0D1B2A] border border-[#1A2634] rounded-xl text-white placeholder:text-[#546E7A] focus:border-[#1976D2] focus:ring-2 focus:ring-[#1976D2]/20 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#90CAF9]">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#546E7A]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full h-14 pl-12 pr-12 bg-[#0D1B2A] border border-[#1A2634] rounded-xl text-white placeholder:text-[#546E7A] focus:border-[#1976D2] focus:ring-2 focus:ring-[#1976D2]/20 outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#546E7A] hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (only for signup) */}
          {mode === 'signup' && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#90CAF9]">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#546E7A]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full h-14 pl-12 pr-4 bg-[#0D1B2A] border border-[#1A2634] rounded-xl text-white placeholder:text-[#546E7A] focus:border-[#1976D2] focus:ring-2 focus:ring-[#1976D2]/20 outline-none transition-all"
                  required
                />
              </div>
            </div>
          )}

          {/* Anti-Bot Verification */}
          <div className="pt-4">
            <div className="p-4 bg-[#0D1B2A] border border-[#1A2634] rounded-xl">
              {!isVerified ? (
                <button
                  type="button"
                  onClick={handleVerification}
                  disabled={isVerifying}
                  className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
                    isVerifying
                      ? 'bg-[#1A2634] text-[#546E7A] cursor-wait'
                      : 'bg-[#1976D2] text-white hover:bg-[#1565C0] active:scale-95'
                  }`}
                >
                  {isVerifying ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verificando...</span>
                    </div>
                  ) : (
                    '☑️ Não sou um robô - Clique para verificar'
                  )}
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 text-green-400 font-bold text-sm">
                  <CheckCircle className="w-5 h-5" />
                  <span>Verificado ✓</span>
                </div>
              )}
            </div>
          </div>

          {/* Forgot Password (only for login) */}
          {mode === 'login' && (
            <div className="text-right">
              <button type="button" className="text-sm font-semibold text-[#42A5F5]">
                Esqueci minha senha
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isVerified}
            className={`w-full py-4 rounded-2xl font-black text-base shadow-lg transition-all mt-8 ${
              isVerified
                ? 'bg-gradient-to-r from-[#1976D2] to-[#1565C0] text-white shadow-[#1976D2]/30 active:scale-95'
                : 'bg-[#1A2634] text-[#546E7A] cursor-not-allowed'
            }`}
          >
            {mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </button>

          {/* Switch Mode */}
          <div className="text-center text-sm text-[#78909C]">
            {mode === 'login' ? (
              <p>
                Não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setIsVerified(false);
                  }}
                  className="text-[#42A5F5] font-bold"
                >
                  Criar agora
                </button>
              </p>
            ) : (
              <p>
                Já tem conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setIsVerified(false);
                  }}
                  className="text-[#42A5F5] font-bold"
                >
                  Entrar
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
