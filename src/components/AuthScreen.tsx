import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Flame, ArrowLeft } from 'lucide-react';

interface AuthScreenProps {
  onLogin: () => void;
  onSignup: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onSignup }) => {
  const [mode, setMode] = useState<'welcome' | 'login' | 'signup'>('welcome');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      onLogin();
    } else if (mode === 'signup') {
      onSignup();
    }
  };

  // Welcome Screen
  if (mode === 'welcome') {
    return (
      <div className="fixed inset-0 z-[9997] bg-gradient-to-br from-[#05070B] via-[#0D0D0D] to-[#1A0505] flex flex-col items-center justify-between p-8 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F20D18] rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#F20D18] rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-md">
          {/* Logo */}
          <div className="mb-12 animate-in zoom-in fade-in duration-700">
            <div className="relative">
              <div className="absolute inset-0 blur-2xl bg-[#F20D18] opacity-40 animate-pulse" />
              <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-[#F20D18] to-[#D90812] shadow-2xl shadow-[#F20D18]/50 flex items-center justify-center">
                <span className="text-6xl font-black text-white">SF</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-16 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100">
            <h1 className="text-4xl font-black text-white mb-3">
              STRAVA <span className="text-[#F20D18]">FIGHT</span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-[#64748B] text-sm font-semibold">
              <Flame className="w-4 h-4 text-[#F20D18]" />
              <span>Supere Seus Limites</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="w-full space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200">
            <button
              onClick={() => setMode('signup')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#F20D18] to-[#FF4A0F] text-white font-black text-base shadow-lg shadow-[#F20D18]/30 active:scale-95 transition-transform"
            >
              Criar Conta
            </button>
            
            <button
              onClick={() => setMode('login')}
              className="w-full py-4 rounded-2xl bg-[#1F2937] text-white font-bold text-base border border-[#374151] active:scale-95 transition-transform"
            >
              Já tenho conta
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-center text-[#475569] text-xs">
          <p>Ao continuar, você concorda com nossos</p>
          <p className="mt-1">
            <button className="text-[#F20D18] font-semibold">Termos de Uso</button>
            {' e '}
            <button className="text-[#F20D18] font-semibold">Política de Privacidade</button>
          </p>
        </div>
      </div>
    );
  }

  // Login/Signup Form
  return (
    <div className="fixed inset-0 z-[9997] bg-[#05070B] flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#05070B]/95 backdrop-blur-lg border-b border-[#1F2937]">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setMode('welcome')}
            className="w-10 h-10 rounded-full bg-[#1F2937] flex items-center justify-center text-white active:scale-90 transition-transform"
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
            <label className="text-sm font-bold text-[#CBD5E1]">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
                className="w-full h-14 pl-12 pr-4 bg-[#0D121C] border border-[#1F2937] rounded-xl text-white placeholder:text-[#475569] focus:border-[#F20D18] focus:ring-2 focus:ring-[#F20D18]/20 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#CBD5E1]">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full h-14 pl-12 pr-12 bg-[#0D121C] border border-[#1F2937] rounded-xl text-white placeholder:text-[#475569] focus:border-[#F20D18] focus:ring-2 focus:ring-[#F20D18]/20 outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (only for signup) */}
          {mode === 'signup' && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#CBD5E1]">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full h-14 pl-12 pr-4 bg-[#0D121C] border border-[#1F2937] rounded-xl text-white placeholder:text-[#475569] focus:border-[#F20D18] focus:ring-2 focus:ring-[#F20D18]/20 outline-none transition-all"
                  required
                />
              </div>
            </div>
          )}

          {/* Forgot Password (only for login) */}
          {mode === 'login' && (
            <div className="text-right">
              <button type="button" className="text-sm font-semibold text-[#F20D18]">
                Esqueci minha senha
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#F20D18] to-[#FF4A0F] text-white font-black text-base shadow-lg shadow-[#F20D18]/30 active:scale-95 transition-transform mt-8"
          >
            {mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </button>

          {/* Switch Mode */}
          <div className="text-center text-sm text-[#94A3B8]">
            {mode === 'login' ? (
              <p>
                Não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-[#F20D18] font-bold"
                >
                  Criar agora
                </button>
              </p>
            ) : (
              <p>
                Já tem conta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[#F20D18] font-bold"
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
