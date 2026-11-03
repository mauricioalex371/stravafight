import React, { useState, useEffect } from 'react';
import { 
  ExternalLink, 
  MoreHorizontal, 
  Heart, 
  Share2, 
  Bookmark, 
  AlertTriangle, 
  EyeOff, 
  CheckCircle2, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { AdCampaign, UserProfile } from '../types';
import { BusinessService } from '../services/businessService';

interface SponsoredPostCardProps {
  campaign: AdCampaign;
  currentUser: UserProfile;
  onNavigateBusiness?: (companyId: string) => void;
  onOpenShare?: (campaign: AdCampaign) => void;
}

export const SponsoredPostCard: React.FC<SponsoredPostCardProps> = ({
  campaign,
  currentUser,
  onNavigateBusiness,
  onOpenShare
}) => {
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(campaign.likesCount || 0);
  const [hasSaved, setHasSaved] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Conteúdo enganoso ou inadequado');
  const [reportSent, setReportSent] = useState(false);

  // Record real deduplicated impression once on mount
  useEffect(() => {
    BusinessService.recordAdImpression(campaign.id, currentUser.id, 'FEED');
  }, [campaign.id, currentUser.id]);

  const handleCtaClick = () => {
    BusinessService.recordAdClick(campaign.id, currentUser.id, 'FEED');
    if (campaign.destinationUrl) {
      window.open(campaign.destinationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleToggleLike = () => {
    const next = !hasLiked;
    setHasLiked(next);
    setLikesCount((prev) => (next ? prev + 1 : Math.max(0, prev - 1)));
  };

  const handleToggleSave = () => {
    setHasSaved((prev) => !prev);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    BusinessService.submitReport({
      targetId: campaign.id,
      targetType: 'CAMPAIGN',
      targetTitle: campaign.title,
      reportedBy: currentUser.username,
      reason: reportReason,
      details: `Denúncia registrada pelo usuário @${currentUser.username}`
    });
    setReportSent(true);
    setTimeout(() => {
      setIsReportModalOpen(false);
      setIsHidden(true);
    }, 1500);
  };

  if (isHidden) {
    return (
      <div className="bg-[#071321]/40 border border-[#171C25] rounded-3xl p-4 text-center text-xs text-[#94A3B8]">
        <span>Anúncio ocultado das suas preferências.</span>
      </div>
    );
  }

  return (
    <article className="bg-gradient-to-b from-[#0A121E] to-[#071321] border-2 border-[#F20D18]/30 rounded-3xl overflow-hidden shadow-xl shadow-[#05070B]/50 hover:border-[#F20D18]/60 transition-all">
      {/* Header */}
      <div className="p-3.5 flex items-center justify-between">
        <div 
          onClick={() => onNavigateBusiness && onNavigateBusiness(campaign.companyId)}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="relative">
            <img 
              src={campaign.companyLogo} 
              alt={campaign.companyName} 
              className="w-10 h-10 rounded-full object-cover border-2 border-[#F20D18] group-hover:scale-105 transition-transform" 
            />
            <span className="absolute -bottom-1 -right-1 bg-[#F20D18] text-white p-0.5 rounded-full ring-2 ring-[#05070B]">
              <Sparkles className="w-2.5 h-2.5" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="font-bold text-white text-xs group-hover:text-[#F20D18] transition-colors">
                {campaign.companyName}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#F20D18] fill-[#F20D18]/20" />
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <span className="px-1.5 py-0.2 rounded-md bg-[#F20D18]/15 border border-[#F20D18]/40 text-[#F20D18] text-[9px] font-black uppercase tracking-wider">
                PATROCINADO
              </span>
              <span className="text-[10px] text-[#94A3B8]">
                {campaign.category}
              </span>
            </div>
          </div>
        </div>

        {/* Action Menu */}
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Opções do anúncio"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-8 z-20 w-48 bg-[#0D121C] border border-[#171C25] rounded-2xl p-1.5 shadow-2xl text-xs space-y-1 animate-in fade-in slide-in-from-top-2">
              <button
                onClick={() => {
                  setIsHidden(true);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#CBD5E1] hover:bg-white/5 text-left transition-colors"
              >
                <EyeOff className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>Ocultar anúncio</span>
              </button>

              <button
                onClick={() => {
                  setIsReportModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#EF4444] hover:bg-[#EF4444]/10 text-left transition-colors font-medium"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Denunciar anúncio</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Creative Media */}
      <div 
        onClick={handleCtaClick}
        className="relative bg-black aspect-square sm:aspect-[16/10] overflow-hidden cursor-pointer group"
      >
        <img 
          src={campaign.mediaUrl} 
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
        />
        
        {/* Subtle Brand Watermark Badge */}
        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 text-white flex items-center gap-1.5 text-[10px] font-bold shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#F20D18] animate-pulse" />
          <span>SF BUSINESS • PARCEIRO OFICIAL</span>
        </div>
      </div>

      {/* CTA Bar */}
      <div className="p-4 bg-[#0A121E]/95 border-t border-[#171C25] flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h4 className="font-extrabold text-white text-sm leading-snug hover:text-[#F20D18] transition-colors cursor-pointer" onClick={handleCtaClick}>
              {campaign.title}
            </h4>
            <p className="text-[#94A3B8] text-xs mt-1 leading-relaxed">
              {campaign.description}
            </p>
          </div>

          <button
            onClick={handleCtaClick}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#F20D18] to-[#D90812] text-white text-xs font-black shadow-lg shadow-[#F20D18]/30 hover:brightness-110 active:scale-95 transition-all"
          >
            <span>{campaign.ctaLabel || 'Saiba Mais'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Social Metrics Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-[#171C25]/80 text-[#94A3B8] text-xs">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleToggleLike}
              className={`flex items-center gap-1.5 transition-colors ${hasLiked ? 'text-[#F20D18]' : 'hover:text-white'}`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-[#F20D18]' : ''}`} />
              <span className="font-bold">{likesCount}</span>
            </button>

            <button 
              onClick={() => onOpenShare && onOpenShare(campaign)}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Compartilhar</span>
            </button>
          </div>

          <button 
            onClick={handleToggleSave}
            className={`transition-colors ${hasSaved ? 'text-[#F20D18]' : 'hover:text-white'}`}
            title="Salvar anúncio"
          >
            <Bookmark className={`w-4 h-4 ${hasSaved ? 'fill-[#F20D18]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0D121C] border border-[#171C25] rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-[#EF4444]">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-bold text-white text-sm">Denunciar Publicação Comercial</h3>
            </div>

            {reportSent ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs text-center font-bold">
                ✓ Denúncia enviada para a equipe de moderação. Obrigado por manter a comunidade segura.
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-3">
                <p className="text-xs text-[#94A3B8]">
                  Selecione o motivo da denúncia deste anúncio da empresa <strong>{campaign.companyName}</strong>:
                </p>

                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-[#05070B] border border-[#171C25] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#F20D18]"
                >
                  <option value="Conteúdo enganoso ou falso">Conteúdo enganoso ou falso</option>
                  <option value="Produto proibido ou perigoso">Produto proibido ou perigoso</option>
                  <option value="Golpe financeiro ou fraude">Golpe financeiro ou fraude</option>
                  <option value="Violação de direitos autorais ou marca">Violação de direitos autorais ou marca</option>
                  <option value="Spam ou anúncio repetitivo">Spam ou anúncio excessivo</option>
                  <option value="Outro motivo">Outro motivo</option>
                </select>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl text-xs text-[#94A3B8] hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[#EF4444] text-white text-xs font-bold hover:bg-[#DC2626]"
                  >
                    Confirmar Denúncia
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </article>
  );
};
