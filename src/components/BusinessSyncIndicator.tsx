/**
 * SF Business Sync Indicator
 * Indicador visual de sincronização com Supabase
 */

import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { BusinessService } from '../services/businessService';
import type { SyncState } from '../services/businessSyncService';

interface BusinessSyncIndicatorProps {
  compact?: boolean;
  showLabel?: boolean;
}

export const BusinessSyncIndicator: React.FC<BusinessSyncIndicatorProps> = ({
  compact = false,
  showLabel = true
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncState>(BusinessService.getSyncStatus());
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  // Atualizar status a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(BusinessService.getSyncStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    if (isManualSyncing || syncStatus.isSyncing) return;

    setIsManualSyncing(true);
    try {
      await BusinessService.syncNow();
    } catch (error) {
      // Silent sync failure
    } finally {
      setIsManualSyncing(false);
    }
  };

  // Determinar ícone e cor
  const getStatusDisplay = () => {
    if (!syncStatus.isOnline) {
      return {
        icon: CloudOff,
        color: 'text-[#64748B]',
        bg: 'bg-[#64748B]/10',
        label: 'Offline',
        description: 'Sem conexão - dados salvos localmente'
      };
    }

    if (syncStatus.isSyncing || isManualSyncing) {
      return {
        icon: Loader2,
        color: 'text-[#0EA5E9]',
        bg: 'bg-[#0EA5E9]/10',
        label: 'Sincronizando',
        description: 'Enviando dados para Supabase...',
        animate: true
      };
    }

    if (syncStatus.errorCount > 0) {
      return {
        icon: AlertCircle,
        color: 'text-[#F59E0B]',
        bg: 'bg-[#F59E0B]/10',
        label: 'Erros',
        description: `${syncStatus.errorCount} operação(ões) com erro`
      };
    }

    if (syncStatus.pendingCount > 0) {
      return {
        icon: Cloud,
        color: 'text-[#0EA5E9]',
        bg: 'bg-[#0EA5E9]/10',
        label: 'Pendente',
        description: `${syncStatus.pendingCount} operação(ões) aguardando sync`
      };
    }

    return {
      icon: CheckCircle2,
      color: 'text-[#10B981]',
      bg: 'bg-[#10B981]/10',
      label: 'Sincronizado',
      description: 'Todos os dados estão atualizados'
    };
  };

  const status = getStatusDisplay();
  const Icon = status.icon;

  // Versão compacta (apenas ícone)
  if (compact) {
    return (
      <button
        onClick={handleManualSync}
        disabled={!syncStatus.isOnline || syncStatus.isSyncing}
        className={`p-2 rounded-lg ${status.bg} ${status.color} hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
        title={status.description}
      >
        <Icon
          className={`w-4 h-4 ${status.animate ? 'animate-spin' : ''}`}
        />
      </button>
    );
  }

  // Versão completa
  return (
    <div className="flex items-center gap-3 bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2">
      {/* Status Visual */}
      <div className={`p-2 rounded-lg ${status.bg}`}>
        <Icon
          className={`w-4 h-4 ${status.color} ${status.animate ? 'animate-spin' : ''}`}
        />
      </div>

      {/* Info */}
      {showLabel && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">
              {status.label}
            </span>
            {syncStatus.pendingCount > 0 && (
              <span className="text-xs px-2 py-0.5 bg-[#F20D18]/10 text-[#F20D18] rounded-full">
                {syncStatus.pendingCount}
              </span>
            )}
          </div>
          <p className="text-xs text-[#94A3B8] truncate">
            {status.description}
          </p>
        </div>
      )}

      {/* Botão de Sync Manual */}
      {syncStatus.isOnline && !syncStatus.isSyncing && (
        <button
          onClick={handleManualSync}
          disabled={isManualSyncing}
          className="p-2 hover:bg-[#334155] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Sincronizar agora"
        >
          <RefreshCw
            className={`w-4 h-4 text-[#94A3B8] ${isManualSyncing ? 'animate-spin' : ''}`}
          />
        </button>
      )}
    </div>
  );
};

/**
 * Versão Badge compacta para Navbar
 */
export const BusinessSyncBadge: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncState>(BusinessService.getSyncStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(BusinessService.getSyncStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!syncStatus.isOnline) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-[#64748B]/10 rounded-full" title="Modo Offline">
        <CloudOff className="w-3 h-3 text-[#64748B]" />
        <span className="text-xs font-medium text-[#64748B]">Offline</span>
      </div>
    );
  }

  if (syncStatus.isSyncing) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-[#0EA5E9]/10 rounded-full" title="Sincronizando...">
        <Loader2 className="w-3 h-3 text-[#0EA5E9] animate-spin" />
        <span className="text-xs font-medium text-[#0EA5E9]">Sync</span>
      </div>
    );
  }

  if (syncStatus.pendingCount > 0) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-[#F59E0B]/10 rounded-full" title={`${syncStatus.pendingCount} operações pendentes`}>
        <Cloud className="w-3 h-3 text-[#F59E0B]" />
        <span className="text-xs font-medium text-[#F59E0B]">{syncStatus.pendingCount}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-[#10B981]/10 rounded-full" title="Sincronizado">
      <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
    </div>
  );
};
