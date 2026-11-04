/**
 * SF Business Enum Mappers - Mapeamento bidirecional completo
 * LocalStorage ↔ Supabase Database
 * 
 * BLOQUEADOR #7 RESOLVIDO: Todos os 10 objectives do banco mapeados
 */

// ============================================================================
// Campaign Objectives - LocalStorage → Database
// ============================================================================

export const OBJECTIVE_TO_DB: Record<string, string> = {
  // Core objectives (já existentes)
  'CONHECIMENTO_DE_MARCA': 'BRAND_AWARENESS',
  'ALCANCE': 'REACH',
  'TRAFEGO': 'TRAFFIC',
  'ENGAJAMENTO': 'ENGAGEMENT',
  'LEADS': 'LEAD_GENERATION',
  'CONVERSOES': 'CONVERSIONS',
  
  // Missing objectives (BLOQUEADOR #7 - faltavam 6 valores)
  'VENDER_PRODUTO': 'SELL_PRODUCT',
  'PROMOVER_SERVICO': 'PROMOTE_SERVICE',
  'PROMOVER_EVENTO': 'PROMOTE_EVENT',
  'VENDER_INGRESSO': 'SELL_TICKETS',
  'LEADS_ALUNOS': 'STUDENT_LEADS',
  'ASSINATURAS': 'SUBSCRIPTIONS',
  'BUSCAR_PATROCINADORES': 'FIND_SPONSORS',
  'BUSCAR_ATLETAS': 'FIND_ATHLETES',
  'OPORTUNIDADE_EMPREGO': 'JOB_OPPORTUNITY',
} as const;

// ============================================================================
// Campaign Objectives - Database → LocalStorage
// ============================================================================

export const OBJECTIVE_FROM_DB: Record<string, string> = {
  'BRAND_AWARENESS': 'CONHECIMENTO_DE_MARCA',
  'REACH': 'ALCANCE',
  'TRAFFIC': 'TRAFEGO',
  'ENGAGEMENT': 'ENGAJAMENTO',
  'LEAD_GENERATION': 'LEADS',
  'CONVERSIONS': 'CONVERSOES',
  'SELL_PRODUCT': 'VENDER_PRODUTO',
  'PROMOTE_SERVICE': 'PROMOVER_SERVICO',
  'PROMOTE_EVENT': 'PROMOVER_EVENTO',
  'SELL_TICKETS': 'VENDER_INGRESSO',
  'STUDENT_LEADS': 'LEADS_ALUNOS',
  'SUBSCRIPTIONS': 'ASSINATURAS',
  'FIND_SPONSORS': 'BUSCAR_PATROCINADORES',
  'FIND_ATHLETES': 'BUSCAR_ATLETAS',
  'JOB_OPPORTUNITY': 'OPORTUNIDADE_EMPREGO',
} as const;

// ============================================================================
// Campaign Status - LocalStorage → Database
// ============================================================================

export const STATUS_TO_DB: Record<string, string> = {
  'RASCUNHO': 'DRAFT',
  'ATIVA': 'ACTIVE',
  'PAUSADA': 'PAUSED',
  'FINALIZADA': 'COMPLETED',
  'CANCELADA': 'CANCELLED',
  'EM_REVISAO': 'PENDING_APPROVAL',
} as const;

// ============================================================================
// Campaign Status - Database → LocalStorage
// ============================================================================

export const STATUS_FROM_DB: Record<string, string> = {
  'DRAFT': 'RASCUNHO',
  'ACTIVE': 'ATIVA',
  'PAUSED': 'PAUSADA',
  'COMPLETED': 'FINALIZADA',
  'CANCELLED': 'CANCELADA',
  'PENDING_APPROVAL': 'EM_REVISAO',
} as const;

// ============================================================================
// Business Category - LocalStorage → Database
// ============================================================================

export const CATEGORY_TO_DB: Record<string, string> = {
  'MARCA_ESPORTIVA': 'MARCA_ESPORTIVA',
  'LOJA_EQUIPAMENTOS': 'LOJA_EQUIPAMENTOS',
  'ACADEMIA': 'ACADEMIA',
  'ORGANIZADOR_EVENTOS': 'ORGANIZADOR_EVENTOS',
  'PROMOTOR_LUTAS': 'PROMOTOR_LUTAS',
  'ATLETA_PROFISSIONAL': 'ATLETA_PROFISSIONAL',
  'PATROCINADOR': 'PATROCINADOR',
  'PROFESSOR_TREINADOR': 'PROFESSOR_TREINADOR',
  'SERVICO_ESPORTIVO': 'SERVICO_ESPORTIVO',
  'OUTRO': 'OUTRO',
} as const;

// ============================================================================
// Funções Auxiliares com Fallback
// ============================================================================

/**
 * Mapear objective do localStorage para o banco de dados
 * @param local - Valor em português usado no frontend
 * @returns Valor em inglês do banco, ou fallback
 */
export function mapObjectiveToDb(local: string): string {
  const mapped = OBJECTIVE_TO_DB[local];
  
  if (!mapped) {
    console.warn(`[EnumMapper] Objective desconhecido: "${local}". Usando BRAND_AWARENESS como fallback.`);
    return 'BRAND_AWARENESS';
  }
  
  return mapped;
}

/**
 * Mapear objective do banco de dados para o localStorage
 * @param db - Valor em inglês do banco
 * @returns Valor em português do frontend, ou fallback
 */
export function mapObjectiveFromDb(db: string): string {
  const mapped = OBJECTIVE_FROM_DB[db];
  
  if (!mapped) {
    console.warn(`[EnumMapper] Objective DB desconhecido: "${db}". Usando CONHECIMENTO_DE_MARCA como fallback.`);
    return 'CONHECIMENTO_DE_MARCA';
  }
  
  return mapped;
}

/**
 * Mapear status do localStorage para o banco de dados
 * @param local - Status em português
 * @returns Status em inglês do banco, ou fallback
 */
export function mapStatusToDb(local: string): string {
  const mapped = STATUS_TO_DB[local];
  
  if (!mapped) {
    console.warn(`[EnumMapper] Status desconhecido: "${local}". Usando DRAFT como fallback.`);
    return 'DRAFT';
  }
  
  return mapped;
}

/**
 * Mapear status do banco de dados para o localStorage
 * @param db - Status em inglês do banco
 * @returns Status em português do frontend, ou fallback
 */
export function mapStatusFromDb(db: string): string {
  const mapped = STATUS_FROM_DB[db];
  
  if (!mapped) {
    console.warn(`[EnumMapper] Status DB desconhecido: "${db}". Usando RASCUNHO como fallback.`);
    return 'RASCUNHO';
  }
  
  return mapped;
}

/**
 * Validar se objective é válido
 * @param objective - Objetivo a validar
 * @param source - Origem (localStorage ou database)
 * @returns True se válido, False caso contrário
 */
export function isValidObjective(objective: string, source: 'local' | 'db'): boolean {
  if (source === 'local') {
    return objective in OBJECTIVE_TO_DB;
  }
  return objective in OBJECTIVE_FROM_DB;
}

/**
 * Validar se status é válido
 * @param status - Status a validar
 * @param source - Origem (localStorage ou database)
 * @returns True se válido, False caso contrário
 */
export function isValidStatus(status: string, source: 'local' | 'db'): boolean {
  if (source === 'local') {
    return status in STATUS_TO_DB;
  }
  return status in STATUS_FROM_DB;
}

/**
 * Listar todos os objectives válidos (localStorage)
 * @returns Array de objectives em português
 */
export function getAllLocalObjectives(): string[] {
  return Object.keys(OBJECTIVE_TO_DB);
}

/**
 * Listar todos os objectives válidos (database)
 * @returns Array de objectives em inglês
 */
export function getAllDbObjectives(): string[] {
  return Object.keys(OBJECTIVE_FROM_DB);
}

/**
 * Listar todos os status válidos (localStorage)
 * @returns Array de status em português
 */
export function getAllLocalStatuses(): string[] {
  return Object.keys(STATUS_TO_DB);
}

/**
 * Listar todos os status válidos (database)
 * @returns Array de status em inglês
 */
export function getAllDbStatuses(): string[] {
  return Object.keys(STATUS_FROM_DB);
}

// ============================================================================
// Testes Inline (executar em desenvolvimento)
// ============================================================================

if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
  console.log('[EnumMapper] Validando mapeamentos...');
  
  // Testar todos objectives ida e volta
  const objectives = getAllLocalObjectives();
  let errors = 0;
  
  for (const local of objectives) {
    const db = mapObjectiveToDb(local);
    const back = mapObjectiveFromDb(db);
    
    if (back !== local) {
      console.error(`❌ Mapeamento quebrado: ${local} → ${db} → ${back}`);
      errors++;
    }
  }
  
  // Testar todos status ida e volta
  const statuses = getAllLocalStatuses();
  
  for (const local of statuses) {
    const db = mapStatusToDb(local);
    const back = mapStatusFromDb(db);
    
    if (back !== local) {
      console.error(`❌ Mapeamento quebrado: ${local} → ${db} → ${back}`);
      errors++;
    }
  }
  
  if (errors === 0) {
    console.log('✅ Todos os mapeamentos estão corretos!');
    console.log(`✅ ${objectives.length} objectives mapeados`);
    console.log(`✅ ${statuses.length} status mapeados`);
  } else {
    console.error(`❌ ${errors} erros de mapeamento encontrados!`);
  }
}
