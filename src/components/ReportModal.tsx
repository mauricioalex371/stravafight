import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ModerationService, ReportReason, ReportTargetType } from '../services/moderationService';
import { RateLimiter } from '../utils/rateLimiter';
import { sanitizeInput } from '../utils/security';

interface ReportModalProps {
  isOpen: boolean;
  targetId: string;
  targetType: ReportTargetType;
  targetAuthorUsername?: string;
  reporterId: string;
  reporterUsername: string;
  onClose: () => void;
  onReportSuccess?: () => void;
}

const REPORT_REASONS: { key: ReportReason; label: string; desc: string }[] = [
  { key: 'SPAM', label: 'Spam ou Golpe Comercial', desc: 'Propaganda abusiva, links maliciosos ou vendas não autorizadas.' },
  { key: 'ASSEDIO', label: 'Assédio ou Comportamento Tóxico', desc: 'Mensagens agressivas, intimidação ou conduta antidesportiva.' },
  { key: 'DISCURSO_ODIO', label: 'Discurso de Ódio ou Preconceito', desc: 'Discriminação por raça, gênero, religião ou orientação.' },
  { key: 'VIOLENCIA_DESMEDIDA', label: 'Violência Fora das Regras do Esporte', desc: 'Brigas de rua, agressão covarde ou atos criminosos.' },
  { key: 'CONTEUDO_INADEQUADO', label: 'Conteúdo Explícito ou Impróprio', desc: 'Nudez, automutilação ou material ilegal.' },
  { key: 'PERFIL_FALSO', label: 'Perfil Falso ou Usurpação', desc: 'Pessoa ou academia fingindo ser outro atleta/instituição.' },
  { key: 'OUTRO', label: 'Outro Motivo', desc: 'Outra violação dos Termos da Comunidade STRAVA FIGHT.' }
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  targetId,
  targetType,
  targetAuthorUsername,
  reporterId,
  reporterUsername,
  onClose,
  onReportSuccess
}) => {
  const [selectedReason, setSelectedReason] = useState<ReportReason>('SPAM');
  const [description, setDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Rate limit check
    const rateCheck = RateLimiter.check('REPORT', reporterId);
    if (!rateCheck.allowed) {
      setErrorMsg(rateCheck.message || 'Muitas denúncias recentes. Tente novamente mais tarde.');
      return;
    }

    try {
      ModerationService.submitReport({
        targetId,
        targetType,
        targetAuthorUsername,
        reporterId,
        reporterUsername,
        reason: selectedReason,
        description: sanitizeInput(description, 500)
      });

      setIsSubmitted(true);
      if (onReportSuccess) {
        setTimeout(() => {
          onReportSuccess();
          onClose();
        }, 1500);
      }
    } catch (err) {
      setErrorMsg('Não foi possível enviar a denúncia. Tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-md bg-[#071321] border border-[#171C25] rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#94A3B8] hover:text-white p-1 rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-6 space-y-3 animate-in zoom-in-95">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
            <h3 className="text-base font-black text-white">Denúncia Enviada</h3>
            <p className="text-xs text-[#94A3B8] max-w-xs mx-auto">
              Obrigado por ajudar a manter o tatame do STRAVA FIGHT seguro e respeitoso. Nossa equipe analisará o conteúdo.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F20D18]/15 border border-[#F20D18]/30 flex items-center justify-center text-[#F20D18]">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Denunciar Conteúdo</h3>
                <p className="text-xs text-[#94A3B8]">
                  {targetType === 'USER' ? `Usuário @${targetAuthorUsername}` : `Publicação de @${targetAuthorUsername || 'usuário'}`}
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              <label className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                Selecione o Motivo
              </label>
              {REPORT_REASONS.map((r) => (
                <button
                  type="button"
                  key={r.key}
                  onClick={() => setSelectedReason(r.key)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                    selectedReason === r.key
                      ? 'bg-[#F20D18]/10 border-[#F20D18] text-white font-bold'
                      : 'bg-[#0D121C] border-[#171C25] text-[#94A3B8] hover:border-white/20'
                  }`}
                >
                  <p className="font-semibold text-white">{r.label}</p>
                  <p className="text-[10px] text-[#64748B] mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider block mb-1">
                Detalhes Adicionais (Opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                placeholder="Explique o que aconteceu para agilizar nossa moderação..."
                className="w-full h-20 bg-[#0D121C] border border-[#171C25] rounded-xl p-3 text-xs text-white placeholder-[#64748B] focus:border-[#F20D18] outline-none resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-[#0D121C] border border-[#171C25] text-xs font-bold text-white hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#F20D18] text-white text-xs font-black shadow-lg shadow-[#F20D18]/30 hover:bg-[#d00a14] active:scale-95 transition-all"
              >
                Confirmar Denúncia
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
