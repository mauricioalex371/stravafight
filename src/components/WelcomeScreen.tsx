import React from 'react';
import { Check, MessageCircle, Shield, Zap } from 'lucide-react';

interface WelcomeScreenProps {
  userName: string;
  onComplete: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ userName, onComplete }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#05070B] via-[#0D1B2A] to-[#1A2634] flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#F20D18] rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF4A0F] rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-[#F20D18] to-[#FF4A0F] rounded-full flex items-center justify-center shadow-2xl shadow-[#F20D18]/50 animate-in zoom-in duration-500">
              <Check className="w-12 h-12 text-white" strokeWidth={3} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#F20D18] to-[#FF4A0F] rounded-full blur-xl opacity-50 animate-pulse" />
          </div>
        </div>

        {/* Welcome Message */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-black text-white leading-tight">
            Bem-vindo ao<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F20D18] to-[#FF4A0F]">
              STRAVA FIGHT
            </span>
          </h1>
          <p className="text-base text-[#94A3B8] font-medium">
            Olá, <span className="text-white font-bold">{userName}</span>! 👋
          </p>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Sua conta foi criada com sucesso.<br/>
            Você já pode começar a treinar e evoluir!
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3">
          <FeatureItem
            icon={Zap}
            title="Pronto para começar"
            description="Registre seus treinos e acompanhe sua evolução"
          />
          <FeatureItem
            icon={Shield}
            title="Sua conta está segura"
            description="Dados protegidos e privacidade garantida"
          />
          <FeatureItem
            icon={MessageCircle}
            title="Suporte 24 horas"
            description="Precisa de ajuda? Nosso time está sempre disponível"
            highlight
          />
        </div>

        {/* CTA Button */}
        <button
          onClick={onComplete}
          className="w-full py-4 px-6 bg-gradient-to-r from-[#F20D18] to-[#FF4A0F] text-white text-base font-bold rounded-2xl shadow-2xl shadow-[#F20D18]/50 hover:scale-105 active:scale-95 transition-transform duration-200"
        >
          Começar Agora
        </button>

        {/* Help Link */}
        <div className="text-center">
          <p className="text-xs text-[#64748B]">
            Dúvidas?{' '}
            <button className="text-[#F20D18] font-semibold hover:underline">
              Acesse nosso suporte
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

interface FeatureItemProps {
  icon: React.FC<any>;
  title: string;
  description: string;
  highlight?: boolean;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon: Icon, title, description, highlight }) => (
  <div className={`flex items-start gap-4 p-4 rounded-2xl transition-all ${
    highlight 
      ? 'bg-gradient-to-r from-[#F20D18]/10 to-[#FF4A0F]/10 border border-[#F20D18]/20' 
      : 'bg-[#0D1B2A]/50'
  }`}>
    <div className={`flex-none w-10 h-10 rounded-xl flex items-center justify-center ${
      highlight 
        ? 'bg-gradient-to-br from-[#F20D18] to-[#FF4A0F] shadow-lg shadow-[#F20D18]/50' 
        : 'bg-[#1A2634]'
    }`}>
      <Icon className={`w-5 h-5 ${highlight ? 'text-white' : 'text-[#94A3B8]'}`} />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className={`text-sm font-bold ${highlight ? 'text-white' : 'text-[#CBD5E1]'} mb-1`}>
        {title}
      </h3>
      <p className="text-xs text-[#64748B] leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);
