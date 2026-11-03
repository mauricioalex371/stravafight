/**
 * STRAVA FIGHT — Automated Test Runner Suite
 * Runs core unit & integration tests for security, storage, moderation, and search.
 */

import { runSecurityTests } from '../src/__tests__/security.test';
import { runModerationTests } from '../src/__tests__/moderation.test';
import { runSearchTests } from '../src/__tests__/search.test';

console.log('🥋 ============================================================');
console.log('🥋 STRAVA FIGHT — SUÍTE DE TESTES AUTOMATIZADOS (ETAPA 2)');
console.log('🥋 ============================================================\n');

const allSuites = [
  { name: '1. Segurança, Anti-XSS e Rate Limiting', runner: runSecurityTests },
  { name: '2. Moderação, Denúncias e Bloqueio de Usuários', runner: runModerationTests },
  { name: '3. Busca Unificada e Descoberta Multi-Entidades', runner: runSearchTests }
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
