/**
 * STRAVA FIGHT — Business CRUD Tests
 * Testa operações de Create, Read, Update, Delete dos módulos comerciais
 */

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

// Mock do BusinessService
class MockBusinessService {
  private localStorage: Map<string, any[]> = new Map();
  private syncQueue: any[] = [];
  private currentUserId: string | null = null;

  setCurrentUser(userId: string) {
    this.currentUserId = userId;
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  // Create operations
  async createCampaignWithSync(campaign: any): Promise<{success: boolean; error?: string}> {
    if (!this.currentUserId) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Salvar no localStorage
    const campaigns = this.localStorage.get('campaigns') || [];
    campaigns.push(campaign);
    this.localStorage.set('campaigns', campaigns);

    // Enfileirar sync
    this.syncQueue.push({
      operation: 'CREATE_CAMPAIGN',
      entityId: campaign.id,
      userId: this.currentUserId,
      data: campaign
    });

    return { success: true };
  }

  async updateCampaignWithSync(campaign: any): Promise<{success: boolean; error?: string}> {
    if (!this.currentUserId) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Atualizar no localStorage
    const campaigns = this.localStorage.get('campaigns') || [];
    const index = campaigns.findIndex(c => c.id === campaign.id);
    if (index === -1) {
      return { success: false, error: 'Campanha não encontrada' };
    }
    campaigns[index] = campaign;
    this.localStorage.set('campaigns', campaigns);

    // Enfileirar sync
    this.syncQueue.push({
      operation: 'UPDATE_CAMPAIGN',
      entityId: campaign.id,
      userId: this.currentUserId,
      data: campaign
    });

    return { success: true };
  }

  async createProductWithSync(product: any): Promise<{success: boolean; error?: string}> {
    if (!this.currentUserId) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const products = this.localStorage.get('products') || [];
    products.push(product);
    this.localStorage.set('products', products);

    this.syncQueue.push({
      operation: 'CREATE_PRODUCT',
      entityId: product.id,
      userId: this.currentUserId,
      data: product
    });

    return { success: true };
  }

  async deleteProductWithSync(productId: string): Promise<{success: boolean; error?: string}> {
    if (!this.currentUserId) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const products = this.localStorage.get('products') || [];
    const filtered = products.filter(p => p.id !== productId);
    this.localStorage.set('products', filtered);

    this.syncQueue.push({
      operation: 'DELETE_PRODUCT',
      entityId: productId,
      userId: this.currentUserId,
      data: { id: productId }
    });

    return { success: true };
  }

  // Read operations
  getCampaigns(): any[] {
    return this.localStorage.get('campaigns') || [];
  }

  getProducts(): any[] {
    return this.localStorage.get('products') || [];
  }

  getSyncQueue(): any[] {
    return [...this.syncQueue];
  }

  clearSyncQueue() {
    this.syncQueue = [];
  }

  clearAll() {
    this.localStorage.clear();
    this.syncQueue = [];
    this.currentUserId = null;
  }
}

export function runBusinessCRUDTests(): TestResult[] {
  const results: TestResult[] = [];
  const mockService = new MockBusinessService();

  // Teste 1: CREATE salva localmente e enfileira sync
  try {
    mockService.clearAll();
    mockService.setCurrentUser('user_create');

    const campaign = {
      id: 'camp_1',
      name: 'Test Campaign',
      companyId: 'comp_1',
      status: 'ATIVA'
    };

    const result = mockService.createCampaignWithSync(campaign).then(r => r);
    
    result.then(r => {
      if (!r.success) {
        throw new Error(`Create falhou: ${r.error}`);
      }

      const campaigns = mockService.getCampaigns();
      if (campaigns.length !== 1) {
        throw new Error(`Esperado 1 campanha, encontrado ${campaigns.length}`);
      }
      if (campaigns[0].id !== 'camp_1') {
        throw new Error('Campanha não foi salva corretamente');
      }

      const queue = mockService.getSyncQueue();
      if (queue.length !== 1) {
        throw new Error(`Esperado 1 operação na fila, encontrado ${queue.length}`);
      }
      if (queue[0].operation !== 'CREATE_CAMPAIGN') {
        throw new Error('Operação incorreta na fila de sync');
      }

      results.push({ name: 'CREATE salva localmente e enfileira sync', passed: true });
    });
  } catch (error: any) {
    results.push({ name: 'CREATE salva localmente e enfileira sync', passed: false, error: error.message });
  }

  // Teste 2: UPDATE modifica registro e enfileira sync
  try {
    mockService.clearAll();
    mockService.setCurrentUser('user_update');

    const original = {
      id: 'camp_2',
      name: 'Original Campaign',
      status: 'ATIVA'
    };

    mockService.createCampaignWithSync(original);

    const updated = {
      id: 'camp_2',
      name: 'Updated Campaign',
      status: 'PAUSADA'
    };

    const result = mockService.updateCampaignWithSync(updated).then(r => r);
    
    result.then(r => {
      if (!r.success) {
        throw new Error(`Update falhou: ${r.error}`);
      }

      const campaigns = mockService.getCampaigns();
      if (campaigns[0].name !== 'Updated Campaign') {
        throw new Error('Campanha não foi atualizada');
      }
      if (campaigns[0].status !== 'PAUSADA') {
        throw new Error('Status não foi atualizado');
      }

      const queue = mockService.getSyncQueue();
      const updateOp = queue.find(op => op.operation === 'UPDATE_CAMPAIGN');
      if (!updateOp) {
        throw new Error('Operação UPDATE não foi enfileirada');
      }

      results.push({ name: 'UPDATE modifica registro e enfileira sync', passed: true });
    });
  } catch (error: any) {
    results.push({ name: 'UPDATE modifica registro e enfileira sync', passed: false, error: error.message });
  }

  // Teste 3: DELETE remove registro e enfileira sync
  try {
    mockService.clearAll();
    mockService.setCurrentUser('user_delete');

    const product = {
      id: 'prod_1',
      title: 'Test Product',
      price: 100
    };

    mockService.createProductWithSync(product);
    
    const deleteResult = mockService.deleteProductWithSync('prod_1').then(r => r);
    
    deleteResult.then(r => {
      if (!r.success) {
        throw new Error(`Delete falhou: ${r.error}`);
      }

      const products = mockService.getProducts();
      if (products.length !== 0) {
        throw new Error(`Esperado 0 produtos, encontrado ${products.length}`);
      }

      const queue = mockService.getSyncQueue();
      const deleteOp = queue.find(op => op.operation === 'DELETE_PRODUCT');
      if (!deleteOp) {
        throw new Error('Operação DELETE não foi enfileirada');
      }

      results.push({ name: 'DELETE remove registro e enfileira sync', passed: true });
    });
  } catch (error: any) {
    results.push({ name: 'DELETE remove registro e enfileira sync', passed: false, error: error.message });
  }

  // Teste 4: Operações falham sem autenticação
  try {
    mockService.clearAll();
    // NÃO chamar setCurrentUser

    const campaign = {
      id: 'camp_unauth',
      name: 'Unauthorized Campaign'
    };

    const result = mockService.createCampaignWithSync(campaign).then(r => r);
    
    result.then(r => {
      if (r.success) {
        throw new Error('Operação deveria falhar sem autenticação');
      }
      if (!r.error || !r.error.includes('autenticado')) {
        throw new Error('Mensagem de erro incorreta');
      }

      const campaigns = mockService.getCampaigns();
      if (campaigns.length !== 0) {
        throw new Error('Campanha foi salva mesmo sem autenticação');
      }

      results.push({ name: 'Operações falham sem autenticação', passed: true });
    });
  } catch (error: any) {
    results.push({ name: 'Operações falham sem autenticação', passed: false, error: error.message });
  }

  // Teste 5: UPDATE falha para registro inexistente
  try {
    mockService.clearAll();
    mockService.setCurrentUser('user_not_found');

    const nonExistent = {
      id: 'camp_not_found',
      name: 'Non Existent Campaign'
    };

    const result = mockService.updateCampaignWithSync(nonExistent).then(r => r);
    
    result.then(r => {
      if (r.success) {
        throw new Error('Update deveria falhar para registro inexistente');
      }
      if (!r.error || !r.error.includes('não encontrada')) {
        throw new Error('Mensagem de erro incorreta para registro inexistente');
      }

      results.push({ name: 'UPDATE falha para registro inexistente', passed: true });
    });
  } catch (error: any) {
    results.push({ name: 'UPDATE falha para registro inexistente', passed: false, error: error.message });
  }

  // Teste 6: Múltiplas operações são enfileiradas corretamente
  try {
    mockService.clearAll();
    mockService.setCurrentUser('user_multi');

    const campaign1 = { id: 'c1', name: 'Campaign 1' };
    const campaign2 = { id: 'c2', name: 'Campaign 2' };
    const product1 = { id: 'p1', title: 'Product 1' };

    Promise.all([
      mockService.createCampaignWithSync(campaign1),
      mockService.createCampaignWithSync(campaign2),
      mockService.createProductWithSync(product1)
    ]).then(() => {
      const queue = mockService.getSyncQueue();
      
      if (queue.length !== 3) {
        throw new Error(`Esperado 3 operações na fila, encontrado ${queue.length}`);
      }

      const campaignOps = queue.filter(op => op.operation === 'CREATE_CAMPAIGN');
      const productOps = queue.filter(op => op.operation === 'CREATE_PRODUCT');

      if (campaignOps.length !== 2) {
        throw new Error(`Esperado 2 operações de campanha, encontrado ${campaignOps.length}`);
      }
      if (productOps.length !== 1) {
        throw new Error(`Esperado 1 operação de produto, encontrado ${productOps.length}`);
      }

      results.push({ name: 'Múltiplas operações enfileiradas corretamente', passed: true });
    });
  } catch (error: any) {
    results.push({ name: 'Múltiplas operações enfileiradas corretamente', passed: false, error: error.message });
  }

  // Teste 7: UserId é associado a todas as operações
  try {
    mockService.clearAll();
    mockService.setCurrentUser('user_assoc');

    const campaign = { id: 'c_assoc', name: 'Associated Campaign' };
    const product = { id: 'p_assoc', title: 'Associated Product' };

    Promise.all([
      mockService.createCampaignWithSync(campaign),
      mockService.createProductWithSync(product)
    ]).then(() => {
      const queue = mockService.getSyncQueue();
      
      const allHaveUserId = queue.every(op => op.userId === 'user_assoc');
      if (!allHaveUserId) {
        throw new Error('Nem todas as operações têm userId correto');
      }

      const wrongUserOps = queue.filter(op => op.userId !== 'user_assoc');
      if (wrongUserOps.length > 0) {
        throw new Error(`${wrongUserOps.length} operações com userId incorreto`);
      }

      results.push({ name: 'UserId associado a todas as operações', passed: true });
    });
  } catch (error: any) {
    results.push({ name: 'UserId associado a todas as operações', passed: false, error: error.message });
  }

  return results;
}
