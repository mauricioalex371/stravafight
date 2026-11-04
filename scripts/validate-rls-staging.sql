-- ============================================================================
-- STRAVA FIGHT — Validação RLS para Staging (Execução Manual)
-- ============================================================================
-- OBJETIVO: Validar isolamento entre usuários com JWTs reais em staging
-- EXECUTAR: psql <STAGING_DATABASE_URL> < scripts/validate-rls-staging.sql
-- ============================================================================

\echo ''
\echo '============================================================'
\echo 'STRAVA FIGHT — VALIDAÇÃO DE RLS EM STAGING'
\echo '============================================================'
\echo ''

-- ============================================================================
-- PASSO 1: Verificar Contagem de Tabelas e RLS
-- ============================================================================

\echo '📊 PASSO 1: Análise de Tabelas e RLS'
\echo ''

SELECT 
  'Total de tabelas públicas' as metric,
  COUNT(*)::TEXT as value
FROM pg_tables
WHERE schemaname = 'public'
UNION ALL
SELECT 
  'Tabelas COM RLS habilitado' as metric,
  COUNT(*)::TEXT as value
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
WHERE t.schemaname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity = true
UNION ALL
SELECT 
  'Tabelas SEM RLS' as metric,
  COUNT(*)::TEXT as value
FROM pg_tables t
LEFT JOIN pg_class c ON c.relname = t.tablename
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
WHERE t.schemaname = 'public'
  AND c.relkind = 'r'
  AND (c.relrowsecurity = false OR c.relrowsecurity IS NULL)
UNION ALL
SELECT 
  'Total de policies RLS' as metric,
  COUNT(*)::TEXT as value
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY metric;

\echo ''
\echo '⚠️  TABELAS SEM RLS (DEVE SER VAZIO):'
\echo ''

SELECT t.tablename as "Tabela Desprotegida"
FROM pg_tables t
LEFT JOIN pg_class c ON c.relname = t.tablename
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
WHERE t.schemaname = 'public'
  AND c.relkind = 'r'
  AND (c.relrowsecurity = false OR c.relrowsecurity IS NULL);

-- ============================================================================
-- PASSO 2: Verificar Policies em Tabelas Críticas
-- ============================================================================

\echo ''
\echo '🔒 PASSO 2: Policies em Tabelas Críticas'
\echo ''

SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operacao,
  CASE 
    WHEN roles = '{authenticated}' THEN 'authenticated'
    WHEN roles = '{anon}' THEN 'anon'
    ELSE roles::TEXT
  END as roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'marketplace_payment_webhooks',
    'profiles',
    'posts',
    'direct_messages',
    'admin_audit_logs',
    'marketplace_orders',
    'marketplace_payments'
  )
ORDER BY tablename, cmd, policyname;

-- ============================================================================
-- PASSO 3: Verificar Funções de Autorização
-- ============================================================================

\echo ''
\echo '🔐 PASSO 3: Funções de Autorização Existentes'
\echo ''

SELECT 
  proname as "Função",
  pg_get_functiondef(oid) ~ 'auth\.uid\(\)' as "Usa auth.uid()",
  prosecdef as "SECURITY DEFINER"
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND proname IN ('is_admin', 'is_super_admin', 'can_moderate', 'owns_business', 'is_owner')
ORDER BY proname;

-- ============================================================================
-- PASSO 4: Instruções para Testes com JWTs Reais
-- ============================================================================

\echo ''
\echo '============================================================'
\echo 'PASSO 4: TESTES COM USUÁRIOS REAIS (EXECUTAR MANUALMENTE)'
\echo '============================================================'
\echo ''
\echo 'Para validar isolamento real, execute os seguintes testes:'
\echo ''
\echo '1. Criar 3 usuários via Supabase Dashboard ou API:'
\echo '   - userA@test.com (usuário comum)'
\echo '   - userB@test.com (usuário comum)'
\echo '   - admin@test.com (admin via admin_roles)'
\echo ''
\echo '2. Obter JWT de cada usuário (via login na aplicação ou API)'
\echo ''
\echo '3. Teste de Isolamento de Posts:'
\echo '   a) UserA cria post privado'
\echo '   b) UserB tenta ler o post de UserA'
\echo '   c) ESPERADO: Acesso negado (0 rows)'
\echo ''
\echo '4. Teste de Isolamento de Mensagens Diretas:'
\echo '   a) UserA envia DM para UserB'
\echo '   b) Consultar direct_messages com JWT de um terceiro usuário'
\echo '   c) ESPERADO: 0 rows retornadas'
\echo ''
\echo '5. Teste de Privilégios Admin:'
\echo '   a) UserA (não-admin) tenta acessar admin_audit_logs'
\echo '   b) ESPERADO: 0 rows'
\echo '   c) Admin tenta acessar admin_audit_logs'
\echo '   d) ESPERADO: Retorna logs (se houver)'
\echo ''
\echo '6. Teste de Webhooks Financeiros:'
\echo '   a) UserA tenta ler marketplace_payment_webhooks'
\echo '   b) ESPERADO: 0 rows (apenas admin pode ler)'
\echo '   c) UserA tenta inserir webhook'
\echo '   d) ESPERADO: Permission denied'
\echo ''
\echo '7. Teste de Storage:'
\echo '   a) UserA faz upload de imagem privada'
\echo '   b) UserB tenta acessar URL da imagem'
\echo '   c) ESPERADO: 403 Forbidden ou redirect para login'
\echo ''
\echo '8. Teste de Realtime:'
\echo '   a) UserA se inscreve em posts:user_id=eq.{userA_id}'
\echo '   b) UserB cria post privado'
\echo '   c) ESPERADO: UserA não recebe evento do post de UserB'
\echo ''
\echo '============================================================'
\echo 'VALIDAÇÃO CONCLUÍDA - Revisar resultados acima'
\echo '============================================================'
\echo ''
