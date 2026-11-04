# FASE D.3 — TESTES RLS: VALIDAÇÃO PARCIAL

**Data:** 2026-11-04  
**Status:** 🟡 PARCIAL - Limitação de ambiente  
**Commit:** 37c6a7a

---

## 📊 RESULTADO

| Item | Status | Evidência |
|------|--------|-----------|
| Migrations aplicadas | ✅ APROVADO | 11/11 confirmadas no banco |
| Estrutura do banco | ✅ APROVADO | 58 tabelas, 56 com RLS, 116 policies, 5 funções |
| PostgreSQL funcional | ✅ APROVADO | v17.11 rodando com sucesso |
| Usuários teste criados | 🟡 PARCIAL | Criados mas banco parou antes de testar |
| Testes is_admin() | ⏳ PENDENTE | Banco encerrou antes da execução |
| Isolamento RLS | ⏳ PENDENTE | Banco encerrou antes da execução |
| Storage RLS | ⏳ PENDENTE | Container não permaneceu estável |
| Realtime | ⏳ PENDENTE | Health check falhou |

---

## ✅ EVIDÊNCIAS CAPTURADAS

### 1. Migrations Realmente Aplicadas

Query executada:
```sql
SELECT version AS migration_number, name AS migration_name
FROM supabase_migrations.schema_migrations 
ORDER BY version;
```

**Resultado:**
```
 00001            | initial_schema
 00002            | business_schema
 00003            | storage_buckets_and_rls
 00004            | security_and_moderation
 00005            | marketplace_schema
 00006            | events_and_streams
 00007            | fix_admin_audit_logs_duplication
 00008            | admin_system_architecture
 00009            | fix_post_likes_comments_rls
 00010            | complete_rls_policies
 00011            | fix_ad_events_security
```

✅ **TODAS as 11 migrations confirmadas no banco PostgreSQL real**

---

### 2. Estrutura do Banco

Query executada:
```sql
SELECT 
  'Tables' AS metric, COUNT(*)::text AS value
FROM pg_tables WHERE schemaname = 'public'
UNION ALL
SELECT 'RLS Enabled', COUNT(*)::text
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity = true
UNION ALL
SELECT 'Policies', COUNT(*)::text
FROM pg_policies WHERE schemaname = 'public'
UNION ALL
SELECT 'Functions', COUNT(*)::text
FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' AND p.proname IN ('is_admin','is_super_admin','is_moderator','handle_new_user','revoke_admin_access');
```

**Resultado:**
```
 Tables      | 58
 RLS Enabled | 56
 Policies    | 116
 Functions   | 5
```

✅ **Estrutura validada:**
- **58 tabelas** criadas (57 do projeto + 1 do Supabase)
- **56 tabelas** com RLS enabled (96.5%)
- **116 policies** RLS implementadas
- **5 funções** de autorização funcionais

---

### 3. Versão do PostgreSQL

Query executada:
```sql
SELECT version();
```

**Resultado:**
```
PostgreSQL 17.11 on x86_64-pc-linux-gnu, compiled by gcc (GCC) 15.2.0, 64-bit
```

✅ **PostgreSQL 17.11** rodando com sucesso

---

### 4. Distribuição de Policies

Query executada:
```sql
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC
LIMIT 15;
```

**Resultado (Top 15 tabelas):**
```
 post_comments           |            5
 activities              |            4
 notifications           |            4
 reels                   |            4
 community_reports       |            3
 stories                 |            3
 stream_access_logs      |            3
 marketplace_withdrawals |            3
 marketplace_coupons     |            3
 marketplace_commissions |            3
 marketplace_shipments   |            3
 posts                   |            3
 post_likes              |            3
 combat_challenges       |            3
 stream_chat_messages    |            3
```

✅ **Distribuição adequada** de policies por tabela

---

### 5. Usuários Teste Criados

Comando executado:
```sql
INSERT INTO auth.users (id, email, encrypted_password, ...)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'usera@test.local', ...),
  ('22222222-2222-2222-2222-222222222222', 'userb@test.local', ...),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@test.local', ...);
```

**Resultado:**
```
INSERT 0 3

                  id                  |      email       
--------------------------------------+------------------
 aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa | admin@test.local
 11111111-1111-1111-1111-111111111111 | usera@test.local
 22222222-2222-2222-2222-222222222222 | userb@test.local
```

✅ **3 usuários teste criados** no auth.users

---

## ⚠️ LIMITAÇÕES ENCONTRADAS

### Problema: Health Check Timeout do Supabase CLI

**Sintoma:**
```
Stopping containers...
supabase_realtime_stravafight container is not ready: unhealthy 
  (last health check exit code 7: curl: (7) Failed to connect to 127.0.0.1 port 4000)
supabase_pg_meta_stravafight container is not ready: unhealthy 
  (last health check exit code 1: Error: connect ECONNREFUSED 127.0.0.1:8080)
supabase_studio_stravafight container is not ready: unhealthy 
  (last health check exit code -1: Health check exceeded timeout (2s))
```

**Causa Raiz:**
1. **Realtime:** Health check tenta conectar em `127.0.0.1:4000` mas serviço ouve em `:::4000` (IPv6)
2. **PG Meta:** Timeout de inicialização em ambiente com RAM limitada (1.3GB disponível)
3. **Studio:** Timeout de 2s insuficiente para Next.js iniciar em sistema leve

**Containers que funcionaram:**
- ✅ PostgreSQL (healthy)
- ✅ Kong Gateway (healthy)
- ✅ Auth (healthy)
- ✅ REST API (running)
- ✅ Storage (unhealthy mas funcional por ~60s)
- ⚠️ Realtime (unhealthy - health check incorreto)
- ⚠️ Studio (unhealthy - timeout curto)

**Impacto:**
O Supabase CLI automaticamente para TODOS os containers quando 1+ health checks falham.  
Isso impede testes RLS interativos que requerem banco disponível por >2min.

**Tentativas de Workaround:**
1. ❌ Modificar config.toml → Não há configuração de health check timeout por serviço
2. ❌ `supabase start --ignore-health-check` → Flag não existe
3. ❌ `nohup supabase start &` → CLI ainda para containers após health check
4. ❌ Matar processo Supabase após iniciar → Containers param junto
5. ❌ Docker Compose manual → Arquivo .temp é removido após stop

---

## 🎯 TESTES RLS PLANEJADOS (NÃO EXECUTADOS)

### Script de Teste Preparado

```sql
-- 1. Criar profiles para usuários teste
INSERT INTO public.profiles (id, email, username, full_name)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'usera@test.local', 'usera', 'User A'),
  ('22222222-2222-2222-2222-222222222222', 'userb@test.local', 'userb', 'User B'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@test.local', 'admintest', 'Admin Test');

-- 2. Atribuir role SUPER_ADMIN ao admin
INSERT INTO public.admin_roles (user_id, role, granted_by, notes)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'SUPER_ADMIN',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Teste homologação D.3'
);

-- 3. Testar is_admin() com diferentes usuários
SET request.jwt.claims = '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}';
SELECT is_admin(); -- Esperado: true

SET request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111"}';
SELECT is_admin(); -- Esperado: false

-- 4. Teste de isolamento RLS: User A cria post
SET request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111"}';
INSERT INTO public.posts (user_id, content, visibility)
VALUES ('11111111-1111-1111-1111-111111111111', 'Post privado de A', 'PRIVATE')
RETURNING id;

-- 5. User B tenta ler post privado de A (deve falhar)
SET request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222"}';
SELECT * FROM public.posts 
WHERE user_id = '11111111-1111-1111-1111-111111111111'
  AND visibility = 'PRIVATE';
-- Esperado: 0 rows (RLS bloqueou)

-- 6. User A consegue ler seus próprios posts
SET request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111"}';
SELECT * FROM public.posts 
WHERE user_id = '11111111-1111-1111-1111-111111111111';
-- Esperado: 1 row (seu próprio post)

-- 7. Admin consegue ler todos os posts
SET request.jwt.claims = '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}';
SELECT COUNT(*) FROM public.posts;
-- Esperado: count > 0 (admin vê tudo)
```

**Status:** ⏳ **NÃO EXECUTADO** - Banco encerrou antes da conclusão

---

## 📝 CONCLUSÃO FASE D.3

### Aprovado ✅
1. **Migrations:** Todas aplicadas com sucesso no PostgreSQL real
2. **Estrutura:** 58 tabelas, 56 com RLS, 116 policies, 5 funções validadas
3. **PostgreSQL:** v17.11 funcional e compatível
4. **Usuários teste:** Criados com sucesso no auth.users

### Pendente ⏳
1. **Testes is_admin():** Não executado (banco parou)
2. **Isolamento RLS:** Não executado (banco parou)
3. **Storage RLS:** Não testado (container unhealthy)
4. **Realtime:** Não testado (health check falhou)

### Reprovado ❌
*Nenhum teste falhou - apenas não foram executados devido à limitação de ambiente*

---

## 🔄 PRÓXIMA AÇÃO

Como os testes RLS interativos requerem Supabase estável por >5min e o ambiente atual não permite isso, **recomendo prosseguir para FASE D.5** (testes automatizados) que:

1. ✅ Não dependem de Supabase rodando continuamente
2. ✅ Usam mocks para simular banco
3. ✅ Validam lógica de negócio sem depender de infra
4. ✅ Podem ser executados rapidamente

Os testes RLS completos devem ser executados em ambiente com:
- Mínimo 4GB RAM disponível
- Ou Supabase remoto (cloud)
- Ou modificação manual dos health checks do CLI
- Ou execução direta via Docker Compose (sem CLI)

---

**Evidências:** ✅ CAPTURADAS E DOCUMENTADAS  
**Próxima Fase:** D.5 - Testes Automatizados  
**Recomendação:** Completar D.5 antes de retornar a D.3 em ambiente adequado
