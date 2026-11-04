/**
 * STRAVA FIGHT — Automated Test Runner Suite
 * Runs core unit & integration tests for security, storage, moderation, and search.
 */

// Mock import.meta.env for Node.js environment
if (typeof import.meta === 'undefined') {
  (global as any).import = { meta: { env: {} } };
}
if (!import.meta.env) {
  (import.meta as any).env = {
    VITE_SUPABASE_URL: 'http://localhost:54321',
    VITE_SUPABASE_ANON_KEY: 'test_mock_key'
  };
}

// Importar apenas os testes que não dependem de import.meta.env
import { runBusinessAuthTests } from '../src/__tests__/businessAuth.test';
import { runBusinessSyncTests } from '../src/__tests__/businessSync.test';
import { runBusinessMigrationTests } from '../src/__tests__/businessMigration.test';
import { runBusinessCRUDTests } from '../src/__tests__/businessCRUD.test';
import { runSecurityTests } from '../src/__tests__/security.test';
import { runModerationTests } from '../src/__tests__/moderation.test';
import { runSearchTests } from '../src/__tests__/search.test';

console.log('🥋 ============================================================');
console.log('🥋 STRAVA FIGHT — SUÍTE DE TESTES SF BUSINESS');
console.log('🥋 ============================================================\n');

const allSuites = [
  { name: '1. SF Business — Autenticação e Ciclo de Vida', runner: runBusinessAuthTests },
  { name: '2. SF Business — Sincronização e Fila', runner: runBusinessSyncTests },
  { name: '3. SF Business — Migração e Backup', runner: runBusinessMigrationTests },
  { name: '4. SF Business — CRUD e Persistência', runner: runBusinessCRUDTests },
  { name: '5. Segurança — XSS, SQL Injection, Rate Limiting', runner: runSecurityTests },
  { name: '6. Moderação — Denúncias, Bloqueios, Ações Admin', runner: runModerationTests },
  { name: '7. Busca — Filtros, Pesquisa de Usuários', runner: runSearchTests }
];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

for (const suite of allSuites) {
  console.log(`\n📋 SUÍTE: ${suite.name}`);
  const results = suite.runner();
  for (const r of results) {
    totalTests++;
    if (r.passed) {
      passedTests++;
      console.log(`  ✅ [PASS] ${r.name}`);
    } else {
      failedTests++;
      console.error(`  ❌ [FAIL] ${r.name}: ${r.error}`);
    }
  }
}

console.log('\n============================================================');
console.log(`📊 RESULTADO FINAL: ${passedTests}/${totalTests} testes aprovados.`);
if (failedTests > 0) {
  console.error(`⚠️ ${failedTests} testes falharam.`);
  process.exit(1);
} else {
  console.log('🎉 TODOS OS TESTES PASSARAM COM SUCESSO! Base segura para produção.\n');
  process.exit(0);
}
