/**
 * SF Business Sync Service
 * Sincronização robusta entre localStorage e Supabase
 * Suporta offline, retry, idempotência e recuperação
 */

import { supabase } from '../lib/supabase';

// ============================================================================
// TIPOS
// ============================================================================

export type SyncOperation = 
  | 'CREATE_PROFILE'
  | 'UPDATE_PROFILE'
  | 'CREATE_CAMPAIGN'
  | 'UPDATE_CAMPAIGN'
  | 'DELETE_CAMPAIGN'
  | 'CREATE_PRODUCT'
  | 'UPDATE_PRODUCT'
  | 'DELETE_PRODUCT'
  | 'LOG_AD_EVENT';

export type SyncStatus = 
  | 'pending'     // Aguardando sincronização
  | 'syncing'     // Em processo de sincronização
  | 'synced'      // Sincronizado com sucesso
  | 'error'       // Erro na sincronização
  | 'conflict';   // Conflito detectado

export interface SyncQueueItem {
  id: string;
  operation: SyncOperation;
  entityType: string;
  entityId: string;
  data: any;
  userId: string;
  status: SyncStatus;
  attempts: number;
  maxAttempts: number;
  lastAttempt?: number;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  errorCount: number;
  lastSync?: number;
}

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const SYNC_CONFIG = {
  QUEUE_KEY: 'sfb_sync_queue',
  STATE_KEY: 'sfb_sync_state',
  MAX_ATTEMPTS: 5,
  RETRY_DELAY_BASE: 2000, // 2 segundos
  RETRY_BACKOFF_MULTIPLIER: 2,
  MAX_RETRY_DELAY: 60000, // 1 minuto
  BATCH_SIZE: 10,
  SYNC_INTERVAL: 30000, // 30 segundos quando online
};

// ============================================================================
// CLASSE PRINCIPAL
// ============================================================================

class BusinessSyncService {
  private queue: SyncQueueItem[] = [];
  private state: SyncState;
  private syncInterval?: NodeJS.Timeout;
  private isInitialized = false;
  private currentUserId: string | null = null;
  private accessToken: string | null = null;

  constructor() {
    this.state = {
      isOnline: navigator.onLine,
      isSyncing: false,
      pendingCount: 0,
      errorCount: 0,
    };
  }

  // ==========================================================================
  // INICIALIZAÇÃO
  // ==========================================================================

  /**
   * Configura usuário e token para sincronização
   * Deve ser chamado após login
   */
  setUser(userId: string, accessToken: string): void {
    this.currentUserId = userId;
    this.accessToken = accessToken;
    console.log('[SyncService] Usuário configurado', { userId });
  }

  /**
   * Remove usuário e token
   * Deve ser chamado no logout
   */
  clearUser(): void {
    this.currentUserId = null;
    this.accessToken = null;
    console.log('[SyncService] Usuário removido');
  }

  /**
   * Retorna userId atual
   */
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Carregar fila persistente
    this.loadQueue();

    // Carregar estado
    this.loadState();

    // Monitorar conexão
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Iniciar sincronização automática se online
    if (this.state.isOnline) {
      this.startAutoSync();
    }

    this.isInitialized = true;
    console.log('[SyncService] Inicializado', {
      pending: this.state.pendingCount,
      errors: this.state.errorCount,
    });
  }

  // ==========================================================================
  // ADICIONAR OPERAÇÃO À FILA
  // ==========================================================================

  async enqueue(
    operation: SyncOperation,
    entityType: string,
    entityId: string,
    data: any,
    userId: string
  ): Promise<string> {
    const item: SyncQueueItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      operation,
      entityType,
      entityId,
      data,
      userId,
      status: 'pending',
      attempts: 0,
      maxAttempts: SYNC_CONFIG.MAX_ATTEMPTS,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.queue.push(item);
    this.saveQueue();
    this.updateState();

    console.log('[SyncService] Operação enfileirada', {
      id: item.id,
      operation,
      entityType,
    });

    // Tentar sincronizar imediatamente se online
    if (this.state.isOnline && !this.state.isSyncing) {
      this.syncPending();
    }

    return item.id;
  }

  // ==========================================================================
  // SINCRONIZAÇÃO
  // ==========================================================================

  async syncPending(): Promise<void> {
    if (this.state.isSyncing) {
      console.log('[SyncService] Sincronização já em andamento');
      return;
    }

    if (!this.state.isOnline) {
      console.log('[SyncService] Offline, aguardando conexão');
      return;
    }

    if (!this.currentUserId) {
      console.log('[SyncService] Usuário não configurado, abortando sync');
      return;
    }

    // Filtrar apenas operações do usuário atual
    const pendingItems = this.queue.filter(
      (item) => 
        item.userId === this.currentUserId &&
        (item.status === 'pending' || item.status === 'error')
    );

    if (pendingItems.length === 0) {
      console.log('[SyncService] Nenhuma operação pendente para o usuário atual');
      return;
    }

    this.state.isSyncing = true;
    this.saveState();

    console.log('[SyncService] Iniciando sincronização', {
      userId: this.currentUserId,
      total: pendingItems.length,
    });

    // Processar em lotes
    const batches = this.chunkArray(pendingItems, SYNC_CONFIG.BATCH_SIZE);

    for (const batch of batches) {
      await Promise.all(
        batch.map((item) => this.syncItem(item))
      );
    }

    this.state.isSyncing = false;
    this.state.lastSync = Date.now();
    this.saveState();

    console.log('[SyncService] Sincronização concluída', {
      synced: this.queue.filter((i) => i.userId === this.currentUserId && i.status === 'synced').length,
      errors: this.queue.filter((i) => i.userId === this.currentUserId && i.status === 'error').length,
      pending: this.queue.filter((i) => i.userId === this.currentUserId && i.status === 'pending').length,
    });

    // Limpar itens sincronizados antigos (>24h)
    this.cleanupSyncedItems();
  }

  private async syncItem(item: SyncQueueItem): Promise<void> {
    // Verificar se deve tentar novamente (backoff exponencial)
    if (item.lastAttempt) {
      const timeSinceLastAttempt = Date.now() - item.lastAttempt;
      const retryDelay = Math.min(
        SYNC_CONFIG.RETRY_DELAY_BASE *
          Math.pow(SYNC_CONFIG.RETRY_BACKOFF_MULTIPLIER, item.attempts - 1),
        SYNC_CONFIG.MAX_RETRY_DELAY
      );

      if (timeSinceLastAttempt < retryDelay) {
        console.log('[SyncService] Aguardando backoff', {
          id: item.id,
          attemptsLeft: item.maxAttempts - item.attempts,
        });
        return;
      }
    }

    // Atualizar status
    item.status = 'syncing';
    item.attempts += 1;
    item.lastAttempt = Date.now();
    item.updatedAt = Date.now();
    this.saveQueue();

    try {
      // Executar operação específica
      await this.executeOperation(item);

      // Sucesso
      item.status = 'synced';
      item.error = undefined;
      item.updatedAt = Date.now();
      this.saveQueue();

      console.log('[SyncService] Item sincronizado', {
        id: item.id,
        operation: item.operation,
      });
    } catch (error: any) {
      console.error('[SyncService] Erro ao sincronizar item', {
        id: item.id,
        operation: item.operation,
        attempts: item.attempts,
        error: error.message,
      });

      // Verificar se deve tentar novamente
      if (item.attempts >= item.maxAttempts) {
        item.status = 'error';
        item.error = `Falhou após ${item.attempts} tentativas: ${error.message}`;
      } else {
        item.status = 'pending';
        item.error = error.message;
      }

      item.updatedAt = Date.now();
      this.saveQueue();
    }

    this.updateState();
  }

  // ==========================================================================
  // EXECUTAR OPERAÇÕES ESPECÍFICAS
  // ==========================================================================

  private async executeOperation(item: SyncQueueItem): Promise<void> {
    // Verificar autenticação
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    if (user.id !== item.userId) {
      throw new Error('Operação pertence a outro usuário');
    }

    switch (item.operation) {
      case 'CREATE_PROFILE':
        await this.createProfile(item);
        break;

      case 'UPDATE_PROFILE':
        await this.updateProfile(item);
        break;

      case 'CREATE_CAMPAIGN':
        await this.createCampaign(item);
        break;

      case 'UPDATE_CAMPAIGN':
        await this.updateCampaign(item);
        break;

      case 'DELETE_CAMPAIGN':
        await this.deleteCampaign(item);
        break;

      case 'CREATE_PRODUCT':
        await this.createProduct(item);
        break;

      case 'UPDATE_PRODUCT':
        await this.updateProduct(item);
        break;

      case 'DELETE_PRODUCT':
        await this.deleteProduct(item);
        break;

      case 'LOG_AD_EVENT':
        await this.logAdEvent(item);
        break;

      default:
        throw new Error(`Operação desconhecida: ${item.operation}`);
    }
  }

  private async createProfile(item: SyncQueueItem): Promise<void> {
    const { error } = await supabase.from('commercial_profiles').upsert(
      {
        id: item.entityId,
        user_id: item.userId,
        ...item.data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) throw error;
  }

  private async updateProfile(item: SyncQueueItem): Promise<void> {
    const { error } = await supabase
      .from('commercial_profiles')
      .update({
        ...item.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.entityId)
      .eq('user_id', item.userId);

    if (error) throw error;
  }

  private async createCampaign(item: SyncQueueItem): Promise<void> {
    const { error } = await supabase.from('ad_campaigns').upsert(
      {
        id: item.entityId,
        ...item.data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) throw error;
  }

  private async updateCampaign(item: SyncQueueItem): Promise<void> {
    const { error } = await supabase
      .from('ad_campaigns')
      .update({
        ...item.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.entityId);

    if (error) throw error;
  }

  private async deleteCampaign(item: SyncQueueItem): Promise<void> {
    const { error } = await supabase
      .from('ad_campaigns')
      .delete()
      .eq('id', item.entityId);

    if (error) throw error;
  }

  private async createProduct(item: SyncQueueItem): Promise<void> {
    const { error } = await supabase.from('commercial_products').upsert(
      {
        id: item.entityId,
        ...item.data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) throw error;
  }

  private async updateProduct(item: SyncQueueItem): Promise<void> {
    const { error } = await supabase
      .from('commercial_products')
      .update({
        ...item.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.entityId);

    if (error) throw error;
  }

  private async deleteProduct(item: SyncQueueItem): Promise<void> {
    const { error } = await supabase
      .from('commercial_products')
      .delete()
      .eq('id', item.entityId);

    if (error) throw error;
  }

  private async logAdEvent(item: SyncQueueItem): Promise<void> {
    // Usar RPC para garantir rate limiting server-side
    const { error } = await supabase.from('ad_events').insert({
      ad_id: item.data.ad_id,
      event_type: item.data.event_type,
      user_id: item.userId,
      timestamp: item.data.timestamp || new Date().toISOString(),
    });

    if (error) throw error;
  }

  // ==========================================================================
  // PERSISTÊNCIA
  // ==========================================================================

  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(SYNC_CONFIG.QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log('[SyncService] Fila carregada', { items: this.queue.length });
      }
    } catch (error) {
      console.error('[SyncService] Erro ao carregar fila', error);
      this.queue = [];
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem(SYNC_CONFIG.QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[SyncService] Erro ao salvar fila', error);
    }
  }

  private loadState(): void {
    try {
      const stored = localStorage.getItem(SYNC_CONFIG.STATE_KEY);
      if (stored) {
        this.state = { ...this.state, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('[SyncService] Erro ao carregar estado', error);
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem(SYNC_CONFIG.STATE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.error('[SyncService] Erro ao salvar estado', error);
    }
  }

  private updateState(): void {
    // Filtrar apenas operações do usuário atual se houver um usuário configurado
    const userFilter = this.currentUserId 
      ? (i: SyncQueueItem) => i.userId === this.currentUserId
      : () => true;

    this.state.pendingCount = this.queue.filter(
      (i) => userFilter(i) && (i.status === 'pending' || i.status === 'error')
    ).length;
    this.state.errorCount = this.queue.filter(
      (i) => userFilter(i) && i.status === 'error'
    ).length;
    this.saveState();
  }

  // ==========================================================================
  // CONEXÃO
  // ==========================================================================

  private handleOnline(): void {
    console.log('[SyncService] Conexão restaurada');
    this.state.isOnline = true;
    this.saveState();
    this.startAutoSync();
    this.syncPending();
  }

  private handleOffline(): void {
    console.log('[SyncService] Conexão perdida');
    this.state.isOnline = false;
    this.saveState();
    this.stopAutoSync();
  }

  private startAutoSync(): void {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      if (this.state.isOnline && !this.state.isSyncing) {
        this.syncPending();
      }
    }, SYNC_CONFIG.SYNC_INTERVAL);

    console.log('[SyncService] Auto-sync iniciado');
  }

  private stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
      console.log('[SyncService] Auto-sync parado');
    }
  }

  // ==========================================================================
  // UTILITÁRIOS
  // ==========================================================================

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private cleanupSyncedItems(): void {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const before = this.queue.length;

    this.queue = this.queue.filter(
      (item) =>
        item.status !== 'synced' || item.updatedAt > oneDayAgo
    );

    const removed = before - this.queue.length;
    if (removed > 0) {
      console.log('[SyncService] Itens sincronizados removidos', { count: removed });
      this.saveQueue();
      this.updateState();
    }
  }

  // ==========================================================================
  // API PÚBLICA
  // ==========================================================================

  getState(): SyncState {
    return { ...this.state };
  }

  getQueue(): SyncQueueItem[] {
    return [...this.queue];
  }

  getPendingCount(): number {
    return this.state.pendingCount;
  }

  getErrorCount(): number {
    return this.state.errorCount;
  }

  async forceSyncNow(): Promise<void> {
    console.log('[SyncService] Sincronização forçada pelo usuário');
    await this.syncPending();
  }

  clearErrors(): void {
    this.queue = this.queue.filter((item) => item.status !== 'error');
    this.saveQueue();
    this.updateState();
    console.log('[SyncService] Erros limpos');
  }

  async retryErrors(): Promise<void> {
    this.queue.forEach((item) => {
      if (item.status === 'error') {
        item.status = 'pending';
        item.attempts = 0;
        item.error = undefined;
      }
    });
    this.saveQueue();
    this.updateState();

    console.log('[SyncService] Erros resetados para retry');
    await this.syncPending();
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

export const businessSyncService = new BusinessSyncService();

// Auto-inicializar quando módulo é importado
if (typeof window !== 'undefined') {
  businessSyncService.initialize().catch((error) => {
    console.error('[SyncService] Erro na inicialização', error);
  });
}
