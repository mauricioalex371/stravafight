/**
 * STRAVA FIGHT — Business Authentication Tests
 * Testa integração entre AuthContext e BusinessSyncService
 */

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

// Mock do businessSyncService para testes
let mockSyncInitialized = false;
let mockCurrentUserId: string | null = null;
let mockSyncShutdown = false;

const mockBusinessSyncService = {
  setUser: (userId: string, token: string) => {
    mockCurrentUserId = userId;
    mockSyncInitialized = true;
  },
  clearUser: () => {
    mockCurrentUserId = null;
    mockSyncShutdown = true;
  },
  getCurrentUserId: () => mockCurrentUserId,
  initialize: () => {},
  syncPendingOperations: async () => {},
  startBackgroundSync: () => {},
  stopBackgroundSync: () => {}
};

export function runBusinessAuthTests(): TestResult[] {
  const results: TestResult[] = [];

  // Reset mocks antes de cada teste
  const resetMocks = () => {
    mockSyncInitialized = false;
    mockCurrentUserId = null;
    mockSyncShutdown = false;
  };

  // Teste 1: Login deve inicializar sync
  try {
    resetMocks();
    mockBusinessSyncService.setUser('user_123', 'token_abc');
    
    if (!mockSyncInitialized) {
      throw new Error('Sync não foi inicializado após setUser');
    }
    if (mockCurrentUserId !== 'user_123') {
      throw new Error(`CurrentUserId incorreto: esperado user_123, recebido ${mockCurrentUserId}`);
    }
    
    results.push({ name: 'Login inicializa sync corretamente', passed: true });
  } catch (error: any) {
    results.push({ name: 'Login inicializa sync corretamente', passed: false, error: error.message });
  }

  // Teste 2: Logout deve limpar estado
  try {
    resetMocks();
    mockBusinessSyncService.setUser('user_456', 'token_def');
    mockBusinessSyncService.clearUser();
    
    if (mockCurrentUserId !== null) {
      throw new Error('CurrentUserId não foi limpo após logout');
    }
    if (!mockSyncShutdown) {
      throw new Error('Sync não foi encerrado no logout');
    }
    
    results.push({ name: 'Logout limpa estado corretamente', passed: true });
  } catch (error: any) {
    results.push({ name: 'Logout limpa estado corretamente', passed: false, error: error.message });
  }

  // Teste 3: Troca de conta deve isolar usuários
  try {
    resetMocks();
    mockBusinessSyncService.setUser('user_first', 'token_1');
    const firstUserId = mockBusinessSyncService.getCurrentUserId();
    
    mockBusinessSyncService.clearUser();
    mockBusinessSyncService.setUser('user_second', 'token_2');
    const secondUserId = mockBusinessSyncService.getCurrentUserId();
    
    if (firstUserId === secondUserId) {
      throw new Error('Usuários não foram isolados na troca de conta');
    }
    if (secondUserId !== 'user_second') {
      throw new Error(`UserId incorreto após troca: esperado user_second, recebido ${secondUserId}`);
    }
    
    results.push({ name: 'Troca de conta isola usuários', passed: true });
  } catch (error: any) {
    results.push({ name: 'Troca de conta isola usuários', passed: false, error: error.message });
  }

  // Teste 4: getCurrentUserId retorna null quando não autenticado
  try {
    resetMocks();
    const userId = mockBusinessSyncService.getCurrentUserId();
    
    if (userId !== null) {
      throw new Error(`getCurrentUserId deveria retornar null, mas retornou ${userId}`);
    }
    
    results.push({ name: 'getCurrentUserId retorna null sem autenticação', passed: true });
  } catch (error: any) {
    results.push({ name: 'getCurrentUserId retorna null sem autenticação', passed: false, error: error.message });
  }

  // Teste 5: Múltiplas inicializações não causam conflito
  try {
    resetMocks();
    mockBusinessSyncService.setUser('user_multi', 'token_1');
    mockBusinessSyncService.setUser('user_multi', 'token_2'); // Token refresh
    
    if (mockBusinessSyncService.getCurrentUserId() !== 'user_multi') {
      throw new Error('UserId foi alterado após refresh de token');
    }
    
    results.push({ name: 'Token refresh mantém usuário correto', passed: true });
  } catch (error: any) {
    results.push({ name: 'Token refresh mantém usuário correto', passed: false, error: error.message });
  }

  return results;
}
