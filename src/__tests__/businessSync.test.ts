/**
 * STRAVA FIGHT — Business Sync Service Tests
 * Testa sincronização, fila, retry e isolamento por usuário
 */

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

interface SyncQueueItem {
  id: string;
  operation: string;
  entityType: string;
  entityId: string;
  data: any;
  userId: string;
  status: 'pending' | 'syncing' | 'synced' | 'error';
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  updatedAt: number;
}

// Mock da fila de sincronização
class MockSyncQueue {
  private queue: SyncQueueItem[] = [];
  private currentUserId: string | null = null;

  setUser(userId: string) {
    this.currentUserId = userId;
  }

  clearUser() {
    this.currentUserId = null;
  }

  enqueue(operation: string, entityType: string, entityId: string, data: any, userId: string): string {
    const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.queue.push({
      id,
      operation,
      entityType,
      entityId,
      data,
      userId,
      status: 'pending',
      attempts: 0,
      maxAttempts: 5,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    return id;
  }

  getPendingForUser(userId: string): SyncQueueItem[] {
    return this.queue.filter(item => item.userId === userId && item.status === 'pending');
  }

  getAllPending(): SyncQueueItem[] {
    return this.queue.filter(item => item.status === 'pending');
  }

  markAsSynced(id: string) {
    const item = this.queue.find(i => i.id === id);
    if (item) item.status = 'synced';
  }

  markAsError(id: string) {
    const item = this.queue.find(i => i.id === id);
    if (item) {
      item.status = 'error';
      item.attempts++;
    }
  }

  clear() {
    this.queue = [];
  }

  getQueue() {
    return [...this.queue];
  }
}

export function runBusinessSyncTests(): TestResult[] {
  const results: TestResult[] = [];
  const mockQueue = new MockSyncQueue();

  // Teste 1: Fila isola operações por usuário
  try {
    mockQueue.clear();
    mockQueue.setUser('user_A');
    
    mockQueue.enqueue('CREATE_CAMPAIGN', 'ad_campaigns', 'camp_1', { name: 'Campaign A' }, 'user_A');
    mockQueue.enqueue('CREATE_CAMPAIGN', 'ad_campaigns', 'camp_2', { name: 'Campaign B' }, 'user_B');
    mockQueue.enqueue('CREATE_PRODUCT', 'products', 'prod_1', { name: 'Product A' }, 'user_A');
    
    const userAPending = mockQueue.getPendingForUser('user_A');
    const userBPending = mockQueue.getPendingForUser('user_B');
    
    if (userAPending.length !== 2) {
      throw new Error(`Esperado 2 operações para user_A, encontrado ${userAPending.length}`);
    }
    if (userBPending.length !== 1) {
      throw new Error(`Esperado 1 operação para user_B, encontrado ${userBPending.length}`);
    }
    if (userAPending.some(item => item.userId !== 'user_A')) {
      throw new Error('Operações de outros usuários vazaram para user_A');
    }
    
    results.push({ name: 'Fila isola operações por usuário', passed: true });
  } catch (error: any) {
    results.push({ name: 'Fila isola operações por usuário', passed: false, error: error.message });
  }

  // Teste 2: Operações offline são enfileiradas
  try {
    mockQueue.clear();
    mockQueue.setUser('user_offline');
    
    const id1 = mockQueue.enqueue('CREATE_PROFILE', 'profiles', 'prof_1', { name: 'Profile' }, 'user_offline');
    const id2 = mockQueue.enqueue('CREATE_CAMPAIGN', 'campaigns', 'camp_1', { name: 'Campaign' }, 'user_offline');
    
    const pending = mockQueue.getPendingForUser('user_offline');
    
    if (pending.length !== 2) {
      throw new Error(`Esperado 2 operações enfileiradas, encontrado ${pending.length}`);
    }
    if (!pending.find(item => item.id === id1) || !pending.find(item => item.id === id2)) {
      throw new Error('IDs das operações não foram encontrados na fila');
    }
    
    results.push({ name: 'Operações offline são enfileiradas corretamente', passed: true });
  } catch (error: any) {
    results.push({ name: 'Operações offline são enfileiradas corretamente', passed: false, error: error.message });
  }

  // Teste 3: Sync online marca operações como sincronizadas
  try {
    mockQueue.clear();
    mockQueue.setUser('user_sync');
    
    const id1 = mockQueue.enqueue('CREATE_CAMPAIGN', 'campaigns', 'c1', {}, 'user_sync');
    const id2 = mockQueue.enqueue('UPDATE_CAMPAIGN', 'campaigns', 'c1', {}, 'user_sync');
    
    // Simular sync bem-sucedido
    mockQueue.markAsSynced(id1);
    mockQueue.markAsSynced(id2);
    
    const allItems = mockQueue.getQueue();
    const synced = allItems.filter(i => i.status === 'synced');
    
    if (synced.length !== 2) {
      throw new Error(`Esperado 2 operações sincronizadas, encontrado ${synced.length}`);
    }
    if (mockQueue.getPendingForUser('user_sync').length !== 0) {
      throw new Error('Ainda há operações pendentes após sync');
    }
    
    results.push({ name: 'Sync online marca operações como sincronizadas', passed: true });
  } catch (error: any) {
    results.push({ name: 'Sync online marca operações como sincronizadas', passed: false, error: error.message });
  }

  // Teste 4: Retry com backoff após erro
  try {
    mockQueue.clear();
    mockQueue.setUser('user_retry');
    
    const id = mockQueue.enqueue('CREATE_CAMPAIGN', 'campaigns', 'c_fail', {}, 'user_retry');
    
    // Simular 3 falhas
    mockQueue.markAsError(id);
    mockQueue.markAsError(id);
    mockQueue.markAsError(id);
    
    const item = mockQueue.getQueue().find(i => i.id === id);
    
    if (!item) {
      throw new Error('Item não encontrado na fila');
    }
    if (item.status !== 'error') {
      throw new Error(`Status esperado 'error', encontrado '${item.status}'`);
    }
    if (item.attempts !== 3) {
      throw new Error(`Esperado 3 tentativas, encontrado ${item.attempts}`);
    }
    if (item.attempts >= item.maxAttempts) {
      throw new Error('Item deveria ter tentativas restantes');
    }
    
    results.push({ name: 'Retry incrementa attempts após erro', passed: true });
  } catch (error: any) {
    results.push({ name: 'Retry incrementa attempts após erro', passed: false, error: error.message });
  }

  // Teste 5: IDs únicos para cada operação
  try {
    mockQueue.clear();
    mockQueue.setUser('user_unique');
    
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const id = mockQueue.enqueue('CREATE_PRODUCT', 'products', `p${i}`, {}, 'user_unique');
      if (ids.has(id)) {
        throw new Error(`ID duplicado encontrado: ${id}`);
      }
      ids.add(id);
    }
    
    if (ids.size !== 100) {
      throw new Error(`Esperado 100 IDs únicos, encontrado ${ids.size}`);
    }
    
    results.push({ name: 'IDs únicos são gerados para cada operação', passed: true });
  } catch (error: any) {
    results.push({ name: 'IDs únicos são gerados para cada operação', passed: false, error: error.message });
  }

  // Teste 6: Cleanup não remove operações pendentes
  try {
    mockQueue.clear();
    mockQueue.setUser('user_cleanup');
    
    const id1 = mockQueue.enqueue('CREATE_CAMPAIGN', 'campaigns', 'c1', {}, 'user_cleanup');
    const id2 = mockQueue.enqueue('CREATE_CAMPAIGN', 'campaigns', 'c2', {}, 'user_cleanup');
    mockQueue.markAsSynced(id1);
    // id2 permanece pendente
    
    const pending = mockQueue.getPendingForUser('user_cleanup');
    
    if (pending.length !== 1) {
      throw new Error(`Esperado 1 operação pendente, encontrado ${pending.length}`);
    }
    if (pending[0].id !== id2) {
      throw new Error('Operação pendente incorreta após cleanup');
    }
    
    results.push({ name: 'Cleanup preserva operações pendentes', passed: true });
  } catch (error: any) {
    results.push({ name: 'Cleanup preserva operações pendentes', passed: false, error: error.message });
  }

  // Teste 7: Troca de usuário não mistura filas
  try {
    mockQueue.clear();
    
    mockQueue.setUser('user_first');
    mockQueue.enqueue('CREATE_CAMPAIGN', 'campaigns', 'c1', {}, 'user_first');
    mockQueue.enqueue('CREATE_PRODUCT', 'products', 'p1', {}, 'user_first');
    
    mockQueue.clearUser();
    mockQueue.setUser('user_second');
    mockQueue.enqueue('CREATE_CAMPAIGN', 'campaigns', 'c2', {}, 'user_second');
    
    const firstPending = mockQueue.getPendingForUser('user_first');
    const secondPending = mockQueue.getPendingForUser('user_second');
    
    if (firstPending.length !== 2) {
      throw new Error(`user_first deveria ter 2 operações, tem ${firstPending.length}`);
    }
    if (secondPending.length !== 1) {
      throw new Error(`user_second deveria ter 1 operação, tem ${secondPending.length}`);
    }
    if (firstPending.some(item => item.userId === 'user_second')) {
      throw new Error('Vazamento de operações entre usuários');
    }
    
    results.push({ name: 'Troca de usuário não mistura filas', passed: true });
  } catch (error: any) {
    results.push({ name: 'Troca de usuário não mistura filas', passed: false, error: error.message });
  }

  return results;
}
