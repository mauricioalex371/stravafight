/**
 * SF Business Migration Modal
 * Detecta dados legados e migra localStorage → Supabase
 */

import React, { useState, useEffect } from 'react';
import { X, Database, AlertCircle, CheckCircle2, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { BusinessService } from '../services/businessService';
import { businessMigrationService, type MigrationResult } from '../services/businessMigrationService';

interface BusinessMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  accessToken: string;
}

type MigrationStep = 'detect' | 'confirm' | 'migrating' | 'complete' | 'error';

export const BusinessMigrationModal: React.FC<BusinessMigrationModalProps> = ({
  isOpen,
  onClose,
  userId,
  accessToken
}) => {
  const [step, setStep] = useState<MigrationStep>('detect');
  const [hasLegacyData, setHasLegacyData] = useState(false);
  const [migrationReport, setMigrationReport] = useState<MigrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(true);

  // Detectar dados legados ao abrir o modal
  useEffect(() => {
    if (isOpen && step === 'detect') {
      detectLegacyData();
    }
  }, [isOpen, userId]);

  const detectLegacyData = async () => {
    setIsDetecting(true);
    try {
      const hasData = await BusinessService.hasLegacyBusinessData();
      setHasLegacyData(hasData);

      if (hasData) {
        setStep('confirm');
      } else {
        setStep('complete');
        setMigrationReport({
          status: 'completed',
          totalItems: 0,
          migratedItems: 0,
          skippedItems: 0,
          failedItems: 0,
          errors: [],
          startedAt: Date.now(),
          completedAt: Date.now()
        });
      }
    } catch (err) {
      setError(String(err));
      setStep('error');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleStartMigration = async () => {
    setStep('migrating');
    setError(null);

    try {
      const report = await BusinessService.migrateBusinessData();
      setMigrationReport(report);

      if (report.failedItems > 0) {
        setError(`Migração concluída com ${report.failedItems} erro(s)`);
        setStep('error');
      } else {
        setStep('complete');
      }
    } catch (err) {
      setError(String(err));
      setStep('error');
    }
  };

  const handleRollback = async () => {
    try {
      await BusinessService.rollbackMigration();
      setStep('detect');
      detectLegacyData();
    } catch (err) {
      setError(String(err));
    }
  };

  const handleRetry = () => {
    setStep('detect');
    setError(null);
    detectLegacyData();
  };

  const handleClose = () => {
    if (step === 'migrating') {
      // Não permitir fechar durante migração
      return;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl max-w-2xl w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#334155]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F20D18]/10 rounded-lg">
              <Database className="w-5 h-5 text-[#F20D18]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Migração SF Business</h2>
              <p className="text-sm text-[#94A3B8]">
                {step === 'detect' && 'Detectando dados legados...'}
                {step === 'confirm' && 'Dados locais encontrados'}
                {step === 'migrating' && 'Migrando para Supabase...'}
                {step === 'complete' && 'Migração concluída'}
                {step === 'error' && 'Erro na migração'}
              </p>
            </div>
          </div>
          {step !== 'migrating' && (
            <button
              onClick={handleClose}
              className="p-2 hover:bg-[#334155] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[#94A3B8]" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* DETECT */}
          {step === 'detect' && isDetecting && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-[#F20D18] animate-spin mb-4" />
              <p className="text-[#94A3B8]">Analisando dados locais...</p>
            </div>
          )}

          {/* CONFIRM */}
          {step === 'confirm' && hasLegacyData && (
            <div className="space-y-6">
              <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">
                      Dados Comerciais Detectados
                    </h3>
                    <p className="text-sm text-[#94A3B8] mb-4">
                      Encontramos dados do SF Business armazenados localmente. Para sincronizar
                      com o Supabase e acessar de qualquer dispositivo, precisamos migrar esses dados.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Perfis Comerciais:</span>
                        <span className="font-semibold text-white">
                          {BusinessService.getProfiles().filter(p => p.userId === userId).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Campanhas:</span>
                        <span className="font-semibold text-white">
                          {BusinessService.getCampaigns().length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Produtos:</span>
                        <span className="font-semibold text-white">
                          {BusinessService.getProducts().length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Oportunidades:</span>
                        <span className="font-semibold text-white">
                          {BusinessService.getOpportunities().length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Eventos Comerciais:</span>
                        <span className="font-semibold text-white">
                          {BusinessService.getCommercialEvents().length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0C4A6E]/20 border border-[#0EA5E9]/30 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#0EA5E9]" />
                  O que vai acontecer?
                </h4>
                <ul className="space-y-2 text-sm text-[#94A3B8]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#0EA5E9] mt-1">•</span>
                    <span>Backup automático dos dados locais será criado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#0EA5E9] mt-1">•</span>
                    <span>Dados serão enviados para o Supabase com validação</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#0EA5E9] mt-1">•</span>
                    <span>Sincronização automática será ativada</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#0EA5E9] mt-1">•</span>
                    <span>Dados locais serão preservados até confirmar sucesso</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 bg-[#334155] hover:bg-[#475569] text-white rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleStartMigration}
                  className="flex-1 px-4 py-3 bg-[#F20D18] hover:bg-[#DC0A14] text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Database className="w-4 h-4" />
                  Iniciar Migração
                </button>
              </div>
            </div>
          )}

          {/* MIGRATING */}
          {step === 'migrating' && (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-16 h-16 text-[#F20D18] animate-spin mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">Migrando dados...</h3>
                <p className="text-sm text-[#94A3B8] text-center max-w-md">
                  Aguarde enquanto transferimos seus dados para o Supabase. Este processo pode
                  levar alguns segundos.
                </p>
              </div>

              {migrationReport && (
                <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Progresso:</span>
                    <span className="font-semibold text-white">
                      {migrationReport.migratedItems} / {migrationReport.totalItems}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* COMPLETE */}
          {step === 'complete' && migrationReport && (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-[#10B981]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Migração Concluída!</h3>
                <p className="text-sm text-[#94A3B8] text-center max-w-md">
                  Seus dados foram migrados com sucesso para o Supabase e agora estão
                  sincronizados na nuvem.
                </p>
              </div>

              <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-white">Resumo da Migração</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-[#10B981]">
                      {migrationReport.migratedItems}
                    </div>
                    <div className="text-xs text-[#64748B]">Sucesso</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#F59E0B]">
                      {migrationReport.skippedItems}
                    </div>
                    <div className="text-xs text-[#64748B]">Ignorados</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#EF4444]">
                      {migrationReport.failedItems}
                    </div>
                    <div className="text-xs text-[#64748B]">Falhas</div>
                  </div>
                </div>

                {migrationReport.startedAt && migrationReport.completedAt && (
                  <div className="pt-3 border-t border-[#334155] text-sm text-[#94A3B8]">
                    <div className="flex justify-between">
                      <span>Tempo de migração:</span>
                      <span className="font-semibold text-white">
                        {((migrationReport.completedAt - migrationReport.startedAt) / 1000).toFixed(1)}s
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleClose}
                className="w-full px-4 py-3 bg-[#F20D18] hover:bg-[#DC0A14] text-white rounded-lg font-semibold transition-colors"
              >
                Concluir
              </button>
            </div>
          )}

          {/* ERROR */}
          {step === 'error' && (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 bg-[#EF4444]/10 rounded-full flex items-center justify-center mb-6">
                  <AlertTriangle className="w-10 h-10 text-[#EF4444]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Erro na Migração</h3>
                <p className="text-sm text-[#94A3B8] text-center max-w-md">
                  {error || 'Ocorreu um erro durante a migração dos dados.'}
                </p>
              </div>

              {migrationReport && migrationReport.errors.length > 0 && (
                <div className="bg-[#0F172A] border border-[#EF4444]/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Detalhes dos Erros:</h4>
                  <div className="space-y-1 text-xs text-[#94A3B8] max-h-32 overflow-y-auto">
                    {migrationReport.errors.map((err: string, idx: number) => (
                      <div key={idx} className="py-1">• {err}</div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleRollback}
                  className="flex-1 px-4 py-3 bg-[#334155] hover:bg-[#475569] text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Desfazer
                </button>
                <button
                  onClick={handleRetry}
                  className="flex-1 px-4 py-3 bg-[#F20D18] hover:bg-[#DC0A14] text-white rounded-lg font-semibold transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
