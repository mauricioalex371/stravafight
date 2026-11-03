import React from 'react';
import { 
  ShieldCheck, 
  Flame, 
  Users, 
  Clapperboard, 
  CreditCard, 
  Check, 
  HelpCircle, 
  Mail, 
  Sparkles,
  Trophy,
  ArrowRight
} from 'lucide-react';

interface InstitutionalViewProps {
  onGoToSocial: () => void;
  onGoToAcademy: () => void;
}

export const InstitutionalView: React.FC<InstitutionalViewProps> = ({
  onGoToSocial,
  onGoToAcademy
}) => {
  const plans = [
    {
      name: 'Praticante & Atleta',
      price: 'Gratuito',
      period: 'Para sempre',
      highlight: false,
      features: [
        'Acesso completo à rede social de lutas',
        'Publicações de fotos, vídeos e técnicas',
        'SF Reels em alta definição',
        'Chat direto ilimitado com outros atletas',
        'Tatame Streak & Conquistas de Faixa',
        'Inscrição simplificada em eventos'
      ],
      action: 'Começar Agora',
      onClick: onGoToSocial
    },
    {
      name: 'SF Academy Essencial',
      price: 'R$ 89,90',
      period: '/mês por academia',
      highlight: true,
      badge: 'MAIS POPULAR',
      features: [
        'Tudo do plano Atleta',
        'Gestão de até 150 alunos matriculados',
        'Grade de turmas com chamada em 1 toque',
        'Cobrança automática via WhatsApp (wa.me)',
        'Controle financeiro e Livro Caixa',
        'Aulas experimentais e conversão de leads',
        'Backup automático dos dados'
      ],
      action: 'Acessar SF Academy',
      onClick: onGoToAcademy
    },
    {
      name: 'SF Academy Pro Multi-Unidades',
      price: 'R$ 179,90',
      period: '/mês',
      highlight: false,
      features: [
        'Alunos e turmas ilimitados',
        'Múltiplos professores com permissões isoladas',
        'Relatórios avançados de inadimplência e presença',
        'Página oficial da academia verificada na rede',
        'Destaque no mapa Explorar da STRAVA FIGHT',
        'Suporte prioritário via WhatsApp'
      ],
      action: 'Falar com Consultor',
      onClick: () => alert('Entre em contato pelo WhatsApp oficial: (11) 98888-7777')
    }
  ];

  const faqs = [
    {
      q: 'O que é a STRAVA FIGHT?',
      a: 'A STRAVA FIGHT é uma plataforma digital global dedicada exclusivamente às artes marciais e esportes de combate. Une a experiência social completa (estilo Instagram/TikTok voltado para o tatame) com uma poderosa solução de gestão de academias chamada SF Academy.'
    },
    {
      q: 'Como funciona o Tatame Streak?',
      a: 'É a nossa ferramenta de gamificação: cada dia que você registra seu treino, sua sequência diária aumenta, rendendo pontos de experiência (SF XP) e desbloqueando medalhas de tatame que aparecem no seu perfil público.'
    },
    {
      q: 'Como a SF Academy ajuda minha academia?',
      a: 'Com a SF Academy, o mestre controla alunos (incluindo proteção a menores e dados dos responsáveis legais), faz chamadas diárias em 1 toque no celular, envia cobranças de mensalidades pelo WhatsApp e controla o saldo do caixa em tempo real.'
    },
    {
      q: 'Posso migrar meus dados de outro sistema de gestão?',
      a: 'Sim! A SF Academy possui suporte nativo à importação de backups JSON, restaurando alunos, turmas, presenças e histórico financeiro de forma segura e imediata.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 md:pb-12 select-none">
      {/* Hero Presentation */}
      <div className="relative overflow-hidden p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#071321] via-[#0D121C] to-[#05070B] border border-[#F20D18]/30 shadow-2xl text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F20D18]/15 border border-[#F20D18]/40 text-[#F20D18] text-xs font-black tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>A Rede Social Oficial das Artes Marciais</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          STRAVA <span className="text-[#F20D18]">FIGHT</span>
        </h1>

        <p className="text-base sm:text-lg font-serif italic text-[#F20D18] font-bold">
          “Esforço que transforma, luta que evolui.”
        </p>

        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl mx-auto leading-relaxed">
          Sua academia evolui. Seus atletas se conectam. O mundo das lutas cresce junto. 
          Uma comunidade real de praticantes, atletas, mestres e gestores do combate mundial.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onGoToSocial}
            className="min-h-[46px] px-6 rounded-2xl bg-gradient-to-r from-[#F20D18] to-[#D90812] text-white font-black text-xs flex items-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-lg shadow-[#F20D18]/30"
          >
            <span>Explorar Comunidade</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onGoToAcademy}
            className="min-h-[46px] px-6 rounded-2xl bg-[#0D121C] border border-[#171C25] text-white font-bold text-xs flex items-center gap-2 hover:border-[#F20D18] active:scale-95 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-[#F20D18]" />
            <span>Conhecer SF Academy</span>
          </button>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-[#071321]/60 border border-[#171C25] space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#F20D18]/15 text-[#F20D18] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-white">Comunidade Global de Lutas</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Compartilhe fotos, técnicas, treinos e graduações. Conheça parceiros de treino (sparrers) e siga atletas e mestres renomados.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-[#071321]/60 border border-[#171C25] space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#F20D18]/15 text-[#F20D18] flex items-center justify-center">
            <Clapperboard className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-white">SF Reels & Vídeos Verticais</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Uma experiência dinâmica em tela cheia com vídeos de finalizações, nocautes, drills técnicos e bastidores de camp de preparação.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-[#071321]/60 border border-[#171C25] space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#F20D18]/15 text-[#F20D18] flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-white">Gamificação & Tatame Streaks</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Mantenha a chama acesa com sequências diárias de treino, acúmulo de XP de faixa e conquistas que comprovam sua dedicação à arte suave e aos esportes de combate.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-[#071321]/60 border border-[#171C25] space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#F20D18]/15 text-[#F20D18] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-white">SF Academy: Gestão de Tatame</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Gestão profissional de alunos, frequência em 1 toque, cobrança de mensalidades via WhatsApp e fluxo de caixa integrado para professores e academias.
          </p>
        </div>
      </div>

      {/* Commercial Plans */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-black uppercase text-[#F20D18] tracking-wider">Planos Comerciais</span>
          <h2 className="text-xl font-black text-white">Escolha o plano ideal para você ou sua academia</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-3xl border flex flex-col justify-between transition-all ${
                p.highlight
                  ? 'bg-gradient-to-b from-[#071321] to-[#0D121C] border-[#F20D18] shadow-glow-red relative scale-102'
                  : 'bg-[#071321]/60 border-[#171C25]'
              }`}
            >
              {p.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F20D18] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  {p.badge}
                </span>
              )}

              <div>
                <h3 className="text-sm font-black text-white">{p.name}</h3>
                <div className="mt-3 mb-4">
                  <span className="text-2xl font-black text-white">{p.price}</span>
                  <span className="text-xs text-[#94A3B8] font-medium ml-1">{p.period}</span>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-[#171C25] text-xs">
                  {p.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#F20D18] shrink-0 mt-0.5" />
                      <span className="text-[#CBD5E1] leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={p.onClick}
                className={`w-full min-h-[44px] rounded-2xl font-black text-xs mt-6 transition-all active:scale-95 ${
                  p.highlight
                    ? 'bg-[#F20D18] text-white hover:bg-[#d90812] shadow-md shadow-[#F20D18]/30'
                    : 'bg-[#05070B] border border-[#171C25] text-white hover:border-[#F20D18]'
                }`}
              >
                {p.action}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="p-6 rounded-3xl bg-[#071321]/60 border border-[#171C25] space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-5 h-5 text-[#F20D18]" />
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Perguntas Frequentes</h3>
        </div>

        <div className="space-y-3">
          {faqs.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-[#0D121C] border border-[#171C25]/80 space-y-1">
              <h4 className="text-xs font-bold text-white">{item.q}</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
