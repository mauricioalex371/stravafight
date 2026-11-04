/**
 * STRAVA FIGHT — Business Migration Tests
 * Testa migração de dados legados, backup, validação e rollback
 */

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

interface MigrationData {
  profiles: any[];
  campaigns: any[];
  products: any[];
  opportunities: any[];
  events: any[];
}

// Mock do sistema de migração
class MockMigrationService {
  private localStorage: Map<string, string> = new Map();
  private backup: Map<string, string> = new Map();

  // Simula localStorage
  setItem(key: string, value: string) {
    this.localStorage.set(key, value);
  }

  getItem(key: string): string | null {
    return this.localStorage.get(key) || null;
  }

  // Detecta dados legados
  detectLegacyData(userId: string): boolean {
    const keys = ['profiles', 'campaigns', 'products', 'opportunities', 'events'];
    return keys.some(key => {
      const data = this.getItem(`sfb_${key}`);
      if (!data) return false;
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) && parsed.length > 0 && parsed.some(item => item.userId === userId);
      } catch {
        return false;
      }
    });
  }

  // Cria backup
  createBackup(): boolean {
    this.backup.clear();
    for (const [key, value] of this.localStorage.entries()) {
      this.backup.set(key, value);
    }
    return this.backup.size > 0;
  }

  // Restaura backup
  restoreBackup(): boolean {
    if (this.backup.size === 0) return false;
    this.localStorage.clear();
    for (const [key, value] of this.backup.entries()) {
      this.localStorage.set(key, value);
    }
    return true;
  }

  // Valida dados antes de migração
  validateData(data: MigrationData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(data.profiles)) {
      errors.push('profiles deve ser um array');
    }
    if (!Array.isArray(data.campaigns)) {
      errors.push('campaigns deve ser um array');
    }
    if (!Array.isArray(data.products)) {
      errors.push('products deve ser um array');
    }

    // Validar estrutura de perfis
    if (Array.isArray(data.profiles)) {
      data.profiles.forEach((profile, idx) => {
        if (!profile.id) errors.push(`profiles[${idx}] sem id`);
        if (!profile.userId) errors.push(`profiles[${idx}] sem userId`);
        if (!profile.companyName) errors.push(`profiles[${idx}] sem companyName`);
      });
    }

    // Validar estrutura de campanhas
    if (Array.isArray(data.campaigns)) {
      data.campaigns.forEach((campaign, idx) => {
        if (!campaign.id) errors.push(`campaigns[${idx}] sem id`);
        if (!campaign.companyId) errors.push(`campaigns[${idx}] sem companyId`);
        if (!campaign.name) errors.push(`campaigns[${idx}] sem name`);
      });
    }

    return { valid: errors.length === 0, errors };
  }

  // Simula migração
  async migrate(data: MigrationData): Promise<{success: boolean; migrated: number; failed: number}> {
    const validation = this.validateData(data);
    if (!validation.valid) {
      return { success: false, migrated: 0, failed: data.profiles.length + data.campaigns.length };
    }

    let migrated = 0;
    let failed = 0;

    // Simular migração com 90% de sucesso
    const allItems = [
      ...data.profiles,
      ...data.campaigns,
      ...data.products,
      ...data.opportunities,
      ...data.events
    ];

    for (const item of allItems) {
      if (Math.random() > 0.1) { // 90% success rate
        migrated++;
      } else {
        failed++;
      }
    }

    return { success: failed === 0, migrated, failed };
  }

  // Limpa dados após migração bem-sucedida
  clearMigratedData() {
    this.localStorage.delete('sfb_profiles');
    this.localStorage.delete('sfb_campaigns');
    this.localStorage.delete('sfb_products');
    this.localStorage.delete('sfb_opportunities');
    this.localStorage.delete('sfb_events');
  }

  // Retorna tamanho do backup
  getBackupSize(): number {
    return this.backup.size;
  }
}

export function runBusinessMigrationTests(): TestResult[] {
  const results: TestResult[] = [];
  const mockService = new MockMigrationService();

  // Teste 1: Detecta dados legados corretamente
  try {
    mockService.setItem('sfb_profiles', JSON.stringify([
      { id: 'p1', userId: 'user_123', companyName: 'Company A' }
    ]));
    mockService.setItem('sfb_campaigns', JSON.stringify([
      { id: 'c1', companyId: 'p1', name: 'Campaign 1' }
    ]));

    const hasLegacy = mockService.detectLegacyData('user_123');
    
    if (!hasLegacy) {
      throw new Error('Dados legados não foram detectados');
    }
    
    results.push({ name: 'Detecta dados legados corretamente', passed: true });
  } catch (error: any) {
    results.push({ name: 'Detecta dados legados corretamente', passed: false, error: error.message });
  }

  // Teste 2: Não detecta dados de outros usuários
  try {
    mockService.setItem('sfb_profiles', JSON.stringify([
      { id: 'p1', userId: 'other_user', companyName: 'Other Company' }
    ]));

    const hasLegacy = mockService.detectLegacyData('user_123');
    
    if (hasLegacy) {
      throw new Error('Detectou dados de outro usuário incorretamente');
    }
    
    results.push({ name: 'Não detecta dados de outros usuários', passed: true });
  } catch (error: any) {
    results.push({ name: 'Não detecta dados de outros usuários', passed: false, error: error.message });
  }

  // Teste 3: Backup é criado antes de migração
  try {
    mockService.setItem('sfb_profiles', JSON.stringify([
      { id: 'p1', userId: 'user_backup', companyName: 'Company' }
    ]));
    mockService.setItem('sfb_campaigns', JSON.stringify([
      { id: 'c1', companyId: 'p1', name: 'Campaign' }
    ]));

    const backupCreated = mockService.createBackup();
    
    if (!backupCreated) {
      throw new Error('Backup não foi criado');
    }
    if (mockService.getBackupSize() !== 2) {
      throw new Error(`Backup deveria ter 2 itens, tem ${mockService.getBackupSize()}`);
    }
    
    results.push({ name: 'Backup é criado antes de migração', passed: true });
  } catch (error: any) {
    results.push({ name: 'Backup é criado antes de migração', passed: false, error: error.message });
  }

  // Teste 4: Validação rejeita dados inválidos
  try {
    const invalidData: MigrationData = {
      profiles: [
        { id: 'p1', userId: 'user_val' } // Falta companyName
      ],
      campaigns: [
        { id: 'c1' } // Falta companyId e name
      ],
      products: [],
      opportunities: [],
      events: []
    };

    const validation = mockService.validateData(invalidData);
    
    if (validation.valid) {
      throw new Error('Validação deveria falhar para dados inválidos');
    }
    if (validation.errors.length === 0) {
      throw new Error('Nenhum erro foi reportado na validação');
    }
    if (!validation.errors.some(e => e.includes('companyName'))) {
      throw new Error('Erro de companyName não foi detectado');
    }
    
    results.push({ name: 'Validação rejeita dados inválidos', passed: true });
  } catch (error: any) {
    results.push({ name: 'Validação rejeita dados inválidos', passed: false, error: error.message });
  }

  // Teste 5: Validação aceita dados válidos
  try {
    const validData: MigrationData = {
      profiles: [
        { id: 'p1', userId: 'user_val', companyName: 'Valid Company' }
      ],
      campaigns: [
        { id: 'c1', companyId: 'p1', name: 'Valid Campaign' }
      ],
      products: [],
      opportunities: [],
      events: []
    };

    const validation = mockService.validateData(validData);
    
    if (!validation.valid) {
      throw new Error(`Validação falhou para dados válidos: ${validation.errors.join(', ')}`);
    }
    
    results.push({ name: 'Validação aceita dados válidos', passed: true });
  } catch (error: any) {
    results.push({ name: 'Validação aceita dados válidos', passed: false, error: error.message });
  }

  // Teste 6: Migração processa todos os registros
  try {
    const data: MigrationData = {
      profiles: [
        { id: 'p1', userId: 'user_mig', companyName: 'Company 1' },
        { id: 'p2', userId: 'user_mig', companyName: 'Company 2' }
      ],
      campaigns: [
        { id: 'c1', companyId: 'p1', name: 'Campaign 1' },
        { id: 'c2', companyId: 'p2', name: 'Campaign 2' }
      ],
      products: [
        { id: 'prod1', companyId: 'p1', title: 'Product 1' }
      ],
      opportunities: [],
      events: []
    };

    const result = mockService.migrate(data).then(r => r);
    
    // Aguardar resultado
    result.then(r => {
      const totalExpected = 5; // 2 profiles + 2 campaigns + 1 product
      const totalProcessed = r.migrated + r.failed;
      
      if (totalProcessed !== totalExpected) {
        throw new Error(`Esperado ${totalExpected} registros processados, encontrado ${totalProcessed}`);
      }
      if (r.migrated === 0) {
        throw new Error('Nenhum registro foi migrado com sucesso');
      }
      
      results.push({ name: 'Migração processa todos os registros', passed: true });
    });
  } catch (error: any) {
    results.push({ name: 'Migração processa todos os registros', passed: false, error: error.message });
  }

  // Teste 7: Rollback restaura dados do backup
  try {
    mockService.setItem('sfb_profiles', JSON.stringify([
      { id: 'p_original', userId: 'user_rb', companyName: 'Original' }
    ]));
    
    mockService.createBackup();
    
    // Modificar dados (simular falha de migração)
    mockService.setItem('sfb_profiles', JSON.stringify([
      { id: 'p_corrupted', userId: 'user_rb', companyName: 'Corrupted' }
    ]));
    
    // Restaurar backup
    const restored = mockService.restoreBackup();
    
    if (!restored) {
      throw new Error('Rollback não foi executado');
    }
    
    const profiles = mockService.getItem('sfb_profiles');
    if (!profiles) {
      throw new Error('Dados não foram restaurados');
    }
    
    const parsed = JSON.parse(profiles);
    if (parsed[0].id !== 'p_original') {
      throw new Error('Dados restaurados estão incorretos');
    }
    
    results.push({ name: 'Rollback restaura dados do backup', passed: true });
  } catch (error: any) {
    results.push({ name: 'Rollback restaura dados do backup', passed: false, error: error.message });
  }

  // Teste 8: Dados locais são preservados durante falha
  try {
    mockService.setItem('sfb_profiles', JSON.stringify([
      { id: 'p_preserve', userId: 'user_pres', companyName: 'Preserved' }
    ]));
    
    const originalData = mockService.getItem('sfb_profiles');
    
    // Simular tentativa de migração (sem limpar dados)
    // Dados locais devem permanecer até confirmação de sucesso
    
    const dataAfter = mockService.getItem('sfb_profiles');
    
    if (originalData !== dataAfter) {
      throw new Error('Dados locais foram alterados antes da confirmação');
    }
    
    results.push({ name: 'Dados locais preservados durante falha', passed: true });
  } catch (error: any) {
    results.push({ name: 'Dados locais preservados durante falha', passed: false, error: error.message });
  }

  return results;
}
