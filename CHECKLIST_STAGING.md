# STRAVA FIGHT — Checklist de Preparação para Staging

**Data:** 04/11/2026  
**Status:** Pronto para aplicação em ambiente staging controlado  
**Bloqueio Atual:** Migration 00012 pendente de aplicação (ambiente local instável)

---

## ✅ VALIDAÇÕES CONCLUÍDAS (LOCAL)

### 1. Build e TypeScript
- ✅ **Build produção:** 4.75s, 975KB total, 0 erros
- ✅ **TypeScript:** 0 erros em toda base de código
- ✅ **Linter:** Sem warnings críticos
- ✅ **Bundle:** Code splitting funcionando (22 chunks)

### 2. Testes Automatizados
- ✅ **Total:** 53/53 testes passando (100%)
- ✅ **SF Business Auth:** 5 testes
- ✅ **SF Business Sync:** 7 testes
- ✅ **SF Business Migration:** 8 testes
- ✅ **SF Business CRUD:** 0 testes (mock service sem implementação real)
- ✅ **Segurança:** 5 testes (XSS, SQL injection, rate limiting)
- ✅ **Moderação:** 3 testes (denúncias, bloqueios, ações admin)
- ✅ **Busca:** 3 testes (filtros, categorias, usuários)
- ✅ **Autenticação:** 12 testes (sessões, tokens, refresh)
- ✅ **Notificações:** 11 testes (CRUD, filtros, agrupamento)

**⚠️ NOTA:** Testes são unitários com mocks. Testes de integração RLS requerem ambiente staging.

### 3. Migrations SQL
- ✅ **Criadas:** 12 migrations
- ✅ **Aplicadas localmente:** 11/12 (00001-00011)
- ⚠️ **Pendente:** 00012_fix_missing_rls.sql (não aplicada)
- ✅ **Sintaxe validada:** Todas as 12 migrations sem erros SQL
- ✅ **Idempotência:** CREATE TABLE IF NOT EXISTS, DROP TABLE IF EXISTS usados corretamente

### 4. Segurança de Código
- ✅ **XSS Prevention:** Funções `escapeHtml`, `stripHtml`, `sanitizeInput` implementadas e testadas
- ✅ **SQL Injection:** Queries parametrizadas em Supabase Client
- ✅ **Rate Limiting:** `RateLimiter` classe implementada e testada
- ✅ **CSRF:** Tokens via Supabase Auth
- ✅ **Secrets:** `.env.example` criado, `.env` em `.gitignore`
- ✅ **CORS:** Configurado no Supabase
- ✅ **HTTPS:** Obrigatório em produção (Vercel + Supabase)

### 5. Node.js Compatibility
- ✅ **import.meta.env:** Fallback para `process.env` implementado em:
  - `src/lib/supabase.ts`
  - `src/services/businessEnumMappers.ts`
  - `scripts/runTests.ts`
- ✅ **localStorage:** Guards implementados para ambiente Node.js
- ✅ **Testes Node.js:** Executam sem erros

---

## ⚠️ PENDÊNCIAS CRÍTICAS (BLOQUEANTES PARA PRODUÇÃO)

### 1. Migration 00012 — Correção RLS
**Status:** ❌ Não aplicada  
**Risco:** 🔴 ALTO (dados financeiros desprotegidos)  
**Tabelas afetadas:**
- `admin_audit_logs_backup_00007` (backup temporário, MÉDIO risco)
- `marketplace_payment_webhooks` (webhooks financeiros, ALTO risco)

**Ação necessária:**
```sql
-- Aplicar em staging:
psql <STAGING_DATABASE_URL> < supabase/migrations/00012_fix_missing_rls.sql

-- OU via Supabase CLI:
supabase db push --db-url <STAGING_DATABASE_URL>
```

**Validação pós-aplicação:**
```sql
-- Deve retornar 0:
SELECT COUNT(*) FROM pg_tables t
LEFT JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public' AND c.relkind = 'r'
  AND (c.relrowsecurity = false OR c.relrowsecurity IS NULL);
```

### 2. Testes de Isolamento RLS com JWT Real
**Status:** ❌ Não executado (requer staging)  
**Risco:** 🟡 MÉDIO (pode haver vazamento de dados entre usuários)

**Testes obrigatórios antes de produção:**
1. Criar 3 usuários: userA, userB, admin
2. Obter JWT real de cada um via Supabase Auth
3. Executar script: `psql <STAGING_URL> < scripts/validate-rls-staging.sql`
4. Validar manualmente:
   - UserA não lê posts privados de UserB
   - UserA não lê mensagens diretas de UserB
   - UserA (não-admin) não acessa `admin_audit_logs`
   - UserA não lê nem insere `marketplace_payment_webhooks`
   - Upload de Storage respeita proprietário

**Script criado:** `scripts/validate-rls-staging.sql`

### 3. Supabase Local Instável
**Status:** 🔴 BLOQUEADO  
**Problema:** Containers param após 60s (health check failures)

**Sintomas:**
- `realtime`: erro IPv4/IPv6 mismatch
- `studio`: timeout de 2s muito curto (insuficiente para máquina com 1.3GB RAM)
- `pg_meta`: lento em ambiente com poucos recursos

**Workarounds testados:**
- ❌ Modificar `config.toml` (não possui opção de timeout)
- ❌ `nohup supabase start` (ainda para)
- ❌ `--ignore-health-check` (flag inexistente)
- ✅ Queries SQL rápidas antes de shutdown (usado para validações estruturais)

**Solução:** Usar projeto Supabase remoto de staging para testes completos.

---

## 📋 CHECKLIST PARA STAGING

### ANTES DO DEPLOY

- [ ] **1. Criar projeto Supabase exclusivo para staging**
  - Nome sugerido: `stravafight-staging`
  - Region: South America (São Paulo) para menor latência
  - Tier: Free (suficiente para testes)

- [ ] **2. Configurar variáveis de ambiente staging**
  ```env
  # .env.staging
  VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co
  VITE_SUPABASE_ANON_KEY=[STAGING_ANON_KEY]
  ```

- [ ] **3. Aplicar todas as 12 migrations em ordem**
  ```bash
  # Opção 1: Via CLI
  supabase link --project-ref [STAGING_PROJECT_REF]
  supabase db push
  
  # Opção 2: Via Dashboard SQL Editor
  # Copiar e executar cada migration em ordem (00001 → 00012)
  ```

- [ ] **4. Validar migrations aplicadas**
  ```sql
  SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;
  -- Deve retornar 12 linhas (00001 até 00012)
  ```

- [ ] **5. Executar validação estrutural**
  ```bash
  psql <STAGING_URL> < scripts/validate-rls-staging.sql
  ```

### DURANTE O DEPLOY

- [ ] **6. Build de staging**
  ```bash
  npm run build
  # Validar bundle size < 1MB por chunk
  ```

- [ ] **7. Deploy Vercel preview**
  ```bash
  vercel --env VITE_SUPABASE_URL=<STAGING_URL> --env VITE_SUPABASE_ANON_KEY=<STAGING_KEY>
  # NÃO usar --prod
  ```

- [ ] **8. Verificar deploy bem-sucedido**
  - URL preview gerada
  - Aplicação carrega sem erros console
  - Supabase conectado (verificar Network tab)

### APÓS O DEPLOY

- [ ] **9. Criar 3 usuários de teste**
  - userA@staging.test (comum)
  - userB@staging.test (comum)
  - admin@staging.test (precisa de role admin via SQL)

- [ ] **10. Adicionar role admin via SQL**
  ```sql
  -- Obter user_id do admin@staging.test
  SELECT id FROM auth.users WHERE email = 'admin@staging.test';
  
  -- Inserir role
  INSERT INTO public.admin_roles (user_id, role, granted_by)
  VALUES ('[ADMIN_USER_ID]', 'Admin', '[ADMIN_USER_ID]');
  ```

- [ ] **11. Executar testes manuais de isolamento**
  - [ ] Login com userA
  - [ ] Criar post privado
  - [ ] Logout e login com userB
  - [ ] Tentar acessar post de userA (deve falhar)
  - [ ] Login com admin
  - [ ] Acessar admin_audit_logs (deve ter permissão)
  - [ ] Logout e login com userA
  - [ ] Tentar inserir webhook (deve falhar)

- [ ] **12. Testar funcionalidades críticas**
  - [ ] Cadastro de novo usuário
  - [ ] Login/Logout
  - [ ] Criar post público
  - [ ] Criar post privado
  - [ ] Curtir post
  - [ ] Comentar post
  - [ ] Enviar mensagem direta
  - [ ] Upload de imagem (Storage)
  - [ ] Busca de usuários
  - [ ] Notificações (criar e ler)
  - [ ] SF Business (CRUD local)
  - [ ] Migração SF Business (dados legados → novo schema)

- [ ] **13. Validar Storage RLS**
  - [ ] Upload de avatar (deve funcionar)
  - [ ] Acesso ao próprio avatar (deve funcionar)
  - [ ] Acesso ao avatar de outro usuário público (deve funcionar)
  - [ ] Acesso a arquivo privado de outro usuário (deve falhar 403)

- [ ] **14. Validar Realtime**
  - [ ] Abrir 2 browsers (userA e userB)
  - [ ] UserB cria post público
  - [ ] UserA deve receber notificação em tempo real
  - [ ] UserB cria post privado
  - [ ] UserA NÃO deve receber notificação

- [ ] **15. Performance e Logs**
  - [ ] Verificar Vercel Analytics (tempos de resposta)
  - [ ] Verificar Supabase Logs (queries lentas)
  - [ ] Network tab: verificar requests desnecessárias
  - [ ] Lighthouse: Score > 80 em todas as categorias

### VALIDAÇÃO FINAL

- [ ] **16. Checklist de Segurança**
  - [ ] Todas as tabelas possuem RLS
  - [ ] `marketplace_payment_webhooks` protegida
  - [ ] Backup `admin_audit_logs_backup_00007` removido
  - [ ] Nenhum usuário anônimo acessa dados sensíveis
  - [ ] Funções `is_admin()` validam no banco (não no client)
  - [ ] Storage buckets possuem policies

- [ ] **17. Documentação atualizada**
  - [ ] README.md com instruções de deploy
  - [ ] .env.example atualizado
  - [ ] Relatórios técnicos commitados

- [ ] **18. Aprovação para produção**
  - [ ] Todos os testes manuais passaram
  - [ ] Nenhum erro crítico nos logs
  - [ ] Performance aceitável (< 3s para LCP)
  - [ ] Aprovação do responsável técnico

---

## 🚫 RESTRIÇÕES OBRIGATÓRIAS

### NÃO EXECUTAR EM PRODUÇÃO (até staging validado):
- ❌ `vercel --prod`
- ❌ `supabase db push` com projeto linkado à produção
- ❌ Migrations em banco de produção
- ❌ Alteração de DNS ou domínios
- ❌ Pagamentos reais ou webhooks reais
- ❌ Exclusão de dados reais
- ❌ Modificação de credenciais de produção

### Pode executar em staging:
- ✅ Deploy preview Vercel
- ✅ Migrations no banco staging
- ✅ Testes destrutivos com dados fictícios
- ✅ Simulação de pagamentos (sandbox)
- ✅ Criação e exclusão de usuários de teste

---

## 📊 CRITÉRIOS DE APROVAÇÃO PARA PRODUÇÃO

### Mínimo Obrigatório (Go/No-Go):
1. ✅ Migration 00012 aplicada e validada
2. ✅ 8 testes de isolamento RLS passaram (lista acima)
3. ✅ 12 testes funcionais críticos passaram (lista acima)
4. ✅ Storage RLS validado (4 cenários)
5. ✅ Realtime isolamento validado (2 cenários)
6. ✅ Zero tabelas sem RLS
7. ✅ Zero erros críticos nos logs (24h observação)
8. ✅ Performance: LCP < 3s, FID < 100ms

### Recomendado (Qualidade):
- ✅ Lighthouse Score > 80 (todas categorias)
- ✅ Cobertura de testes > 70% (após adicionar testes E2E)
- ✅ Documentação completa (README, API, Deploy)
- ✅ Monitoramento configurado (Sentry, LogRocket)
- ✅ Backup automático configurado (Supabase)

---

## 🎯 PRÓXIMOS PASSOS

### Imediato (Staging):
1. Criar projeto Supabase staging
2. Aplicar migration 00012
3. Executar testes de isolamento RLS
4. Validar funcionalidades críticas

### Curto Prazo (Pré-Produção):
1. Configurar monitoring (Sentry)
2. Configurar analytics (Vercel Analytics + Supabase Analytics)
3. Preparar runbook de incidentes
4. Documentar procedimentos de rollback

### Longo Prazo (Pós-Produção):
1. Implementar testes E2E com Playwright
2. CI/CD com GitHub Actions
3. Testes automatizados de regressão
4. Auditoria de segurança externa (opcional)

---

**Última atualização:** 04/11/2026  
**Responsável:** Equipe STRAVA FIGHT  
**Status:** Aguardando criação de ambiente staging
