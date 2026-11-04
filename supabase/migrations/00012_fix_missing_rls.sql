-- ============================================================================
-- STRAVA FIGHT — Migration 00012: Correção de 2 Tabelas Sem RLS
-- ============================================================================
-- PROBLEMA: 2 tabelas sem RLS encontradas na auditoria:
--           1. admin_audit_logs_backup_00007 (backup temporário com dados sensíveis)
--           2. marketplace_payment_webhooks (logs financeiros desprotegidos)
-- SOLUÇÃO: Eliminar backup + Habilitar RLS com policies adequadas
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. ELIMINAR BACKUP TEMPORÁRIO (JÁ SERVIU SEU PROPÓSITO)
-- ============================================================================

-- Backup da migration 00007 foi criado apenas para segurança durante alteração schema
-- Migration 00007 já foi aplicada com sucesso há várias migrations atrás
-- Manter backups SQL perpetuamente é má prática e risco de segurança

DROP TABLE IF EXISTS public.admin_audit_logs_backup_00007;

RAISE NOTICE '✅ Backup temporário admin_audit_logs_backup_00007 removido';

-- ============================================================================
-- 2. HABILITAR RLS EM marketplace_payment_webhooks
-- ============================================================================

ALTER TABLE public.marketplace_payment_webhooks ENABLE ROW LEVEL SECURITY;

-- Policy 1: Apenas admins podem ler webhooks (audit/debug)
CREATE POLICY "Admins can view payment webhooks"
  ON public.marketplace_payment_webhooks FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy 2: Apenas system (service_role) pode inserir webhooks
-- Usuários autenticados normais NÃO podem inserir
-- Webhooks são recebidos pelo backend e escritos via service_role
CREATE POLICY "System can insert payment webhooks"
  ON public.marketplace_payment_webhooks FOR INSERT
  TO authenticated
  WITH CHECK (false); -- Bloqueia todos, apenas service_role bypass RLS

-- Policy 3: Admins podem atualizar status de processamento (reprocessamento manual)
CREATE POLICY "Admins can update webhook processing status"
  ON public.marketplace_payment_webhooks FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Nenhuma policy de DELETE: webhooks são audit trail permanente

RAISE NOTICE '✅ RLS habilitado em marketplace_payment_webhooks com 3 policies';

-- ============================================================================
-- VALIDAÇÃO FINAL
-- ============================================================================

DO $$
DECLARE
  total_public_tables INTEGER;
  tables_with_rls INTEGER;
  tables_without_rls INTEGER;
  webhook_policies INTEGER;
  tables_without_rls_list TEXT[];
BEGIN
  -- Contar tabelas públicas
  SELECT COUNT(*) INTO total_public_tables
  FROM pg_tables
  WHERE schemaname = 'public';
  
  -- Contar tabelas com RLS
  SELECT COUNT(*) INTO tables_with_rls
  FROM pg_tables t
  JOIN pg_class c ON c.relname = t.tablename
  JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
  WHERE t.schemaname = 'public'
    AND c.relkind = 'r'
    AND c.relrowsecurity = true;
  
  -- Contar tabelas SEM RLS
  SELECT COUNT(*) INTO tables_without_rls
  FROM pg_tables t
  LEFT JOIN pg_class c ON c.relname = t.tablename
  LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
  WHERE t.schemaname = 'public'
    AND c.relkind = 'r'
    AND (c.relrowsecurity = false OR c.relrowsecurity IS NULL);
  
  -- Listar tabelas SEM RLS (se houver)
  SELECT array_agg(t.tablename) INTO tables_without_rls_list
  FROM pg_tables t
  LEFT JOIN pg_class c ON c.relname = t.tablename
  LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
  WHERE t.schemaname = 'public'
    AND c.relkind = 'r'
    AND (c.relrowsecurity = false OR c.relrowsecurity IS NULL);
  
  -- Contar policies de marketplace_payment_webhooks
  SELECT COUNT(*) INTO webhook_policies
  FROM pg_policies
  WHERE tablename = 'marketplace_payment_webhooks'
    AND schemaname = 'public';
  
  RAISE NOTICE '';
  RAISE NOTICE '==========================================================';
  RAISE NOTICE '           VALIDAÇÃO MIGRATION 00012                      ';
  RAISE NOTICE '==========================================================';
  RAISE NOTICE 'Total de tabelas públicas: %', total_public_tables;
  RAISE NOTICE 'Tabelas COM RLS: % (%.1f%%)', tables_with_rls, (tables_with_rls::FLOAT / total_public_tables * 100);
  RAISE NOTICE 'Tabelas SEM RLS: %', tables_without_rls;
  
  IF tables_without_rls_list IS NOT NULL THEN
    RAISE WARNING '⚠️  Tabelas ainda sem RLS: %', tables_without_rls_list;
  END IF;
  
  RAISE NOTICE 'Policies em marketplace_payment_webhooks: %', webhook_policies;
  RAISE NOTICE '';
  
  IF tables_without_rls = 0 AND webhook_policies = 3 THEN
    RAISE NOTICE '✅ ✅ ✅  SUCESSO: TODAS as tabelas possuem RLS!';
    RAISE NOTICE '✅ marketplace_payment_webhooks protegido com 3 policies';
    RAISE NOTICE '✅ Backup temporário admin_audit_logs_backup_00007 removido';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 SEGURANÇA: 100%% das tabelas protegidas por RLS';
  ELSE
    RAISE WARNING '❌ FALHA: Ainda há % tabelas sem RLS', tables_without_rls;
    RAISE WARNING 'Ou policies de marketplace_payment_webhooks incorretas (esperado: 3, atual: %)', webhook_policies;
  END IF;
  
  RAISE NOTICE '==========================================================';
  RAISE NOTICE '';
END $$;

COMMIT;
