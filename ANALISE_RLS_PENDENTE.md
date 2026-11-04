# ANÁLISE: 2 TABELAS SEM RLS

## Tabelas Identificadas

### 1. admin_audit_logs_backup_00007

**Tipo:** Tabela de Backup Temporário  
**Origem:** Migration 00007  
**Finalidade:** Backup de segurança antes de alterar schema da admin_audit_logs

**Análise:**
- ❌ **Contém dados sensíveis:** SIM (cópia de audit logs com IPs, ações admin)
- ✅ **Acessível por API:** NÃO (não há endpoint REST para backups)
- ⚠️ **Precisa de RLS:** SIM (dados sensíveis, mesmo sendo backup)
- ❌ **Ausência intencional:** NÃO (esquecimento na migration)

**Risco:** **MÉDIO**
- Backup contém histórico de ações administrativas
- Inclui IPs e target_ids sensíveis
- Não é exposto via API mas pode ser acessado por SQL injection
- Deveria ter sido removido após migration bem-sucedida

**Ação Recomendada:**
1. ✅ **Eliminar tabela** - Backup já serviu seu propósito
2. Se precisar manter: Habilitar RLS + policy admin-only

---

### 2. marketplace_payment_webhooks

**Tipo:** Log de Webhooks de Pagamento  
**Origem:** Migration 00005  
**Finalidade:** Audit trail de eventos de gateway de pagamento (Mercado Pago, Stripe)

**Análise:**
- ✅ **Contém dados sensíveis:** SIM (payloads de pagamento, signatures)
- ❌ **Acessível por API:** NÃO direto, mas via relação com `marketplace_payments`
- ✅ **Precisa de RLS:** SIM (logs de transações financeiras)
- ❌ **Ausência intencional:** NÃO (esquecimento na migration)

**Conteúdo:**
```sql
- payment_id → Relaciona com pedidos
- provider → MERCADO_PAGO, STRIPE
- event_type → payment.approved, payment.refunded, etc
- payload → JSONB completo do webhook
- signature → Hash de validação
- is_processed → Status de processamento
```

**Risco:** **ALTO**
- Contém payloads completos de webhooks financeiros
- Pode incluir dados de cartão (últimos 4 dígitos), emails, etc
- Relaciona com `marketplace_payments` (tem RLS) mas própria tabela não tem
- Um usuário mal-intencionado poderia JOIN com payments e acessar logs

**Ação Recomendada:**
✅ **Habilitar RLS + Policies:**
- Admin-only para leitura
- System-only para inserção (webhooks são escritos pelo backend via service_role)
- Nenhum usuário comum deve acessar

---

## Correção Proposta

### Migration: 00012_fix_missing_rls.sql

```sql
-- ============================================================================
-- Migration 00012: Correção de 2 Tabelas Sem RLS
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. ELIMINAR BACKUP TEMPORÁRIO (NÃO PRECISA MAIS)
-- ============================================================================

-- Backup da migration 00007 já serviu seu propósito
-- Se precisar reverter 00007, usar migrations adequadas, não backup SQL

DROP TABLE IF EXISTS admin_audit_logs_backup_00007;

RAISE NOTICE 'Backup temporário admin_audit_logs_backup_00007 removido';

-- ============================================================================
-- 2. HABILITAR RLS EM marketplace_payment_webhooks
-- ============================================================================

ALTER TABLE public.marketplace_payment_webhooks ENABLE ROW LEVEL SECURITY;

-- Policy: Apenas admins podem ler webhooks
CREATE POLICY "Admins can view payment webhooks"
  ON public.marketplace_payment_webhooks FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy: Apenas system (service_role) pode inserir webhooks
-- Usuários autenticados normais NÃO podem inserir
CREATE POLICY "System can insert payment webhooks"
  ON public.marketplace_payment_webhooks FOR INSERT
  TO authenticated
  WITH CHECK (false); -- Bloqueia INSERT de usuários, apenas service_role

-- Policy: Admins podem atualizar status de processamento
CREATE POLICY "Admins can update webhook processing status"
  ON public.marketplace_payment_webhooks FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Nenhuma policy de DELETE (webhooks são audit trail, não devem ser deletados)

RAISE NOTICE 'RLS habilitado em marketplace_payment_webhooks com 3 policies';

-- ============================================================================
-- VALIDAÇÃO
-- ============================================================================

DO $$
DECLARE
  tables_without_rls INTEGER;
  webhook_policies INTEGER;
BEGIN
  -- Contar tabelas sem RLS
  SELECT COUNT(*) INTO tables_without_rls
  FROM pg_tables t
  LEFT JOIN pg_class c ON c.relname = t.tablename
  LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
  WHERE t.schemaname = 'public'
    AND c.relkind = 'r'
    AND (c.relrowsecurity = false OR c.relrowsecurity IS NULL);
  
  -- Contar policies de marketplace_payment_webhooks
  SELECT COUNT(*) INTO webhook_policies
  FROM pg_policies
  WHERE tablename = 'marketplace_payment_webhooks';
  
  RAISE NOTICE '=== VALIDAÇÃO MIGRATION 00012 ===';
  RAISE NOTICE 'Tabelas públicas sem RLS: %', tables_without_rls;
  RAISE NOTICE 'Policies em marketplace_payment_webhooks: %', webhook_policies;
  
  IF tables_without_rls = 0 AND webhook_policies = 3 THEN
    RAISE NOTICE '✅ TODAS as tabelas agora possuem RLS!';
  ELSE
    RAISE WARNING '⚠️ Ainda há tabelas sem RLS ou policies faltando';
  END IF;
END $$;

COMMIT;
```

---

## Impacto da Correção

### Antes
- ✅ 56/58 tabelas com RLS (96.5%)
- ❌ 2 tabelas vulneráveis

### Depois
- ✅ 57/57 tabelas com RLS (100%) - 1 backup eliminado
- ✅ 119 policies (+3)
- ✅ 0 vulnerabilidades conhecidas

### Segurança
- ✅ Webhooks de pagamento protegidos
- ✅ Logs sensíveis inacessíveis por usuários
- ✅ Audit trail mantido intacto
- ✅ Backend via service_role não é afetado

### Compatibilidade
- ✅ Frontend não acessa webhooks diretamente
- ✅ Backend usa service_role (bypass RLS)
- ✅ Sem breaking changes

---

## Status

**Análise:** ✅ COMPLETA  
**Correção:** ⏳ PENDENTE (aguardando aplicação da migration 00012)  
**Risco Atual:** MÉDIO-ALTO (dados financeiros sem proteção RLS)
