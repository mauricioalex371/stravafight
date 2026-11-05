-- ============================================================================
-- Migration 00020: Auditoria de Dados Financeiros
-- ============================================================================
-- OBJETIVO: Compliance LGPD - rastreabilidade de operações financeiras
-- ESCOPO: academy_fees, academy_cash_flow
-- ============================================================================

BEGIN;

-- ============================================================================
-- PASSO 1: Tabela de auditoria financeira
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.financial_audit_log (
  id BIGSERIAL PRIMARY KEY,
  
  -- Identificação da operação
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  record_id BIGINT NOT NULL,
  
  -- Quem executou
  user_id UUID,
  user_ip INET,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Dados da operação
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  
  -- Contexto adicional
  academy_id UUID,
  reason TEXT,
  
  -- Índices para busca
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para consulta rápida
CREATE INDEX idx_financial_audit_table_record ON financial_audit_log(table_name, record_id);
CREATE INDEX idx_financial_audit_user ON financial_audit_log(user_id, performed_at DESC);
CREATE INDEX idx_financial_audit_academy ON financial_audit_log(academy_id, performed_at DESC);
CREATE INDEX idx_financial_audit_performed_at ON financial_audit_log(performed_at DESC);

-- RLS: apenas admins e gestores da academia podem ver logs
ALTER TABLE public.financial_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Academy admins can view financial audit logs"
  ON public.financial_audit_log FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR
    EXISTS (
      SELECT 1 FROM academy_members am
      WHERE am.academy_id = financial_audit_log.academy_id
        AND am.user_id = auth.uid()
        AND am.role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- PASSO 2: Função de auditoria financeira
-- ============================================================================

CREATE OR REPLACE FUNCTION audit_financial_operation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_academy_id UUID;
  v_changed_fields TEXT[];
  v_old_data JSONB;
  v_new_data JSONB;
BEGIN
  -- Extrair academy_id dependendo da tabela
  IF TG_TABLE_NAME = 'academy_fees' THEN
    v_academy_id := COALESCE(NEW.academy_id, OLD.academy_id);
  ELSIF TG_TABLE_NAME = 'academy_cash_flow' THEN
    v_academy_id := COALESCE(NEW.academy_id, OLD.academy_id);
  END IF;

  -- Preparar dados antigos e novos
  IF TG_OP = 'DELETE' THEN
    v_old_data := to_jsonb(OLD);
    v_new_data := NULL;
  ELSIF TG_OP = 'INSERT' THEN
    v_old_data := NULL;
    v_new_data := to_jsonb(NEW);
  ELSE -- UPDATE
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
    
    -- Identificar campos alterados
    SELECT ARRAY_AGG(key)
    INTO v_changed_fields
    FROM jsonb_each(v_old_data) old_fields
    WHERE v_new_data->old_fields.key IS DISTINCT FROM old_fields.value;
  END IF;

  -- Registrar operação no log de auditoria
  INSERT INTO financial_audit_log (
    table_name,
    operation,
    record_id,
    user_id,
    user_ip,
    old_data,
    new_data,
    changed_fields,
    academy_id
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    auth.uid(),
    inet_client_addr(),
    v_old_data,
    v_new_data,
    v_changed_fields,
    v_academy_id
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ============================================================================
-- PASSO 3: Triggers de auditoria
-- ============================================================================

-- Auditoria para academy_fees
DROP TRIGGER IF EXISTS audit_academy_fees_trigger ON academy_fees;
CREATE TRIGGER audit_academy_fees_trigger
AFTER INSERT OR UPDATE OR DELETE ON academy_fees
FOR EACH ROW
EXECUTE FUNCTION audit_financial_operation();

-- Auditoria para academy_cash_flow
DROP TRIGGER IF EXISTS audit_academy_cash_flow_trigger ON academy_cash_flow;
CREATE TRIGGER audit_academy_cash_flow_trigger
AFTER INSERT OR UPDATE OR DELETE ON academy_cash_flow
FOR EACH ROW
EXECUTE FUNCTION audit_financial_operation();

-- ============================================================================
-- PASSO 4: View para relatórios de auditoria
-- ============================================================================

CREATE OR REPLACE VIEW financial_audit_report AS
SELECT 
  fal.id,
  fal.table_name,
  fal.operation,
  fal.record_id,
  fal.performed_at,
  
  -- Informações do usuário
  p.username AS performed_by_username,
  p.full_name AS performed_by_name,
  fal.user_ip,
  
  -- Academia relacionada
  a.name AS academy_name,
  a.slug AS academy_slug,
  
  -- Dados da operação
  fal.old_data,
  fal.new_data,
  fal.changed_fields,
  
  -- Detalhes específicos por tipo
  CASE 
    WHEN fal.table_name = 'academy_fees' THEN
      jsonb_build_object(
        'student_name', (SELECT full_name FROM profiles WHERE id = (fal.new_data->>'student_id')::UUID),
        'amount', COALESCE(fal.new_data->>'amount', fal.old_data->>'amount'),
        'status', COALESCE(fal.new_data->>'payment_status', fal.old_data->>'payment_status')
      )
    WHEN fal.table_name = 'academy_cash_flow' THEN
      jsonb_build_object(
        'amount', COALESCE(fal.new_data->>'amount', fal.old_data->>'amount'),
        'type', COALESCE(fal.new_data->>'transaction_type', fal.old_data->>'transaction_type'),
        'category', COALESCE(fal.new_data->>'category', fal.old_data->>'category')
      )
  END AS operation_details
  
FROM financial_audit_log fal
LEFT JOIN profiles p ON p.id = fal.user_id
LEFT JOIN academies a ON a.id = fal.academy_id
ORDER BY fal.performed_at DESC;

-- RLS para a view
ALTER VIEW financial_audit_report SET (security_barrier = true);

-- ============================================================================
-- PASSO 5: Função para consultar histórico financeiro
-- ============================================================================

CREATE OR REPLACE FUNCTION get_financial_history(
  p_table_name TEXT,
  p_record_id BIGINT,
  p_limit INT DEFAULT 50
)
RETURNS TABLE(
  operation TEXT,
  performed_at TIMESTAMPTZ,
  performed_by TEXT,
  changed_fields TEXT[],
  old_data JSONB,
  new_data JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  -- Verificar autorização
  IF NOT (
    is_admin()
    OR
    EXISTS (
      SELECT 1 FROM financial_audit_log fal
      INNER JOIN academy_members am 
        ON am.academy_id = fal.academy_id
      WHERE fal.table_name = p_table_name
        AND fal.record_id = p_record_id
        AND am.user_id = auth.uid()
        AND am.role IN ('owner', 'admin')
      LIMIT 1
    )
  ) THEN
    RAISE EXCEPTION 'Acesso negado ao histórico financeiro';
  END IF;

  -- Retornar histórico
  RETURN QUERY
  SELECT 
    fal.operation,
    fal.performed_at,
    COALESCE(p.full_name, fal.user_id::TEXT) AS performed_by,
    fal.changed_fields,
    fal.old_data,
    fal.new_data
  FROM financial_audit_log fal
  LEFT JOIN profiles p ON p.id = fal.user_id
  WHERE fal.table_name = p_table_name
    AND fal.record_id = p_record_id
  ORDER BY fal.performed_at DESC
  LIMIT p_limit;
END;
$$;

-- ============================================================================
-- VALIDAÇÃO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 00020: Auditoria financeira configurada';
  RAISE NOTICE '- Tabela: financial_audit_log criada';
  RAISE NOTICE '- Triggers: academy_fees e academy_cash_flow auditados';
  RAISE NOTICE '- View: financial_audit_report disponível';
  RAISE NOTICE '- Função: get_financial_history() configurada';
  RAISE NOTICE 'Compliance LGPD: rastreabilidade de operações financeiras ATIVA';
END $$;

COMMIT;
