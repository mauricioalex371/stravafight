import React, { useState } from 'react';
import { Flame, Users, Trophy, Swords, ChevronRight } from 'lucide-react';
import { Analytics } from '../utils/analytics';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Flame,
    title: 'Registre Seus Treinos',
    description: 'Treinos diários com SF Activity e acompanhe sua evolução no tatame.',
    gradient: 'from-[#F20D18] to-[#FF4A0F]',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&auto=format&fit=crop&q=80'
  },
  {
    icon: Users,
    title: 'Conecte-se com Lutadores',
    description: 'Siga atletas, compartilhe técnicas, troque experiências e construa sua rede no mundo das lutas.',
    gradient: 'from-[#FF4A0F] to-[#F97316]',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80'
  },
  {
    icon: Trophy,
    title: 'Desafios e Conquistas',
    description: 'Participe de desafios, ganhe XP, desbloqueie badges e evolua seu ranking social nas artes marciais.',
    gradient: 'from-[#F97316] to-[#FBBF24]',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80'
  }
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Track onboarding start
  React.useEffect(() => {
    Analytics.trackOnboardingStart();
  }, []);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      Analytics.trackOnboardingComplete();
      onComplete();
    }
  };

  const handleSkip = () => {
    Analytics.trackOnboardingSkip();
    onComplete();
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="fixed inset-0 z-[9998] bg-[#05070B] flex flex-col overflow-hidden">
      {/* Skip Button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={handleSkip}
          className="px-4 py-2 text-sm font-bold text-[#94A3B8] hover:text-white transition-colors"
        >
          Pular
        </button>
      </div>

      {/* Image Background */}
      <div className="relative h-[55%] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#05070B]" />
        <img
          key={currentSlide}
          src={slide.image}
          alt={slide.title}
          className="w-full h-full object-cover animate-in fade-in zoom-in duration-700"
        />
        
        {/* Icon Badge */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${slide.gradient} shadow-2xl flex items-center justify-center animate-in zoom-in duration-500`}>
            <Icon className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 flex flex-col">
        <div className="flex-1 flex flex-col items-center text-center">
          <h2 
            key={`title-${currentSlide}`}
            className="text-3xl font-black text-white mb-4 animate-in slide-in-from-bottom-4 fade-in duration-500"
          >
            {slide.title}
          </h2>
          <p 
            key={`desc-${currentSlide}`}
            className="text-[#94A3B8] text-base leading-relaxed max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100"
          >
            {slide.description}
          </p>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-[#F20D18]'
                  : 'w-2 bg-[#1F2937]'
              }`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#F20D18] to-[#FF4A0F] text-white font-black text-base shadow-lg shadow-[#F20D18]/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <span>{isLastSlide ? 'Começar' : 'Próximo'}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
