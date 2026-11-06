import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ChevronRight } from 'lucide-react';

export const Etapa3Page: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-cover bg-center bg-no-repeat flex flex-col"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(5,7,11,0.7) 0%, rgba(5,7,11,0.95) 100%), url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80')`
      }}
    >
      {/* Skip */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => navigate('/etapa4')}
          className="px-4 py-2 text-sm font-semibold text-white/70 hover:text-white transition-colors"
        >
          Pular
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Icon */}
        <div className="w-24 h-24 rounded-full bg-[#FFA500] shadow-2xl shadow-[#FFA500]/50 flex items-center justify-center mb-12 animate-bounce">
          <Trophy className="w-12 h-12 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-black text-white mb-4 leading-tight">
          Desafios e Conquistas
        </h1>

        {/* Description */}
        <p className="text-base text-white/80 leading-relaxed max-w-sm mb-16">
          Participe de desafios, ganhe XP, desbloqueie badges e evolua seu ranking social nas artes marciais.
        </p>

        {/* Dots */}
        <div className="flex gap-2 mb-12">
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <div className="w-8 h-2 rounded-full bg-[#FFA500]" />
        </div>
      </div>

      {/* Button */}
      <div className="p-6">
        <button
          onClick={() => navigate('/etapa4')}
          className="w-full py-4 rounded-2xl bg-[#FFA500] text-white font-bold text-base shadow-2xl shadow-[#FFA500]/50 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <span>Começar</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
