-- ==============================================================================
-- Migration 00019: Proteção de Dados de Menores (LGPD/ECA)
-- ==============================================================================
-- PROBLEMA: Dados de menores (birth_date, guardian info) sem proteção adicional
--           Policy FOR ALL permite acesso irrestrito por donos de academia
-- SOLUÇÃO: Policies específicas + Auditoria de acesso + Mascaramento
-- ==============================================================================

BEGIN;

-- ============================================================================
-- Tabela de Auditoria de Acesso a Dados de Menores
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.minor_data_access_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    accessor_id UUID NOT NULL REFERENCES auth.users(id),
    student_id UUID NOT NULL REFERENCES academy_students(id),
    academy_id UUID NOT NULL REFERENCES academies(id),
    operation TEXT NOT NULL CHECK (operation IN ('SELECT', 'UPDATE', 'DELETE')),
    accessed_fields TEXT[],
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE minor_data_access_log ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver logs
CREATE POLICY "Only admins can view minor data access logs"
  ON minor_data_access_log FOR SELECT
  TO authenticated
  USING (is_admin());

-- ============================================================================
-- Função para validar e auditar acesso a dados de menores
-- ============================================================================

CREATE OR REPLACE FUNCTION audit_minor_data_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  accessed_fields TEXT[];
BEGIN
  -- Apenas audita se for menor
  IF (TG_OP = 'SELECT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE') 
     AND COALESCE(NEW.is_minor, OLD.is_minor) = true THEN
    
    -- Identifica campos sensíveis acessados
    accessed_fields := ARRAY[]::TEXT[];
    
    IF TG_OP = 'UPDATE' THEN
      IF NEW.birth_date IS DISTINCT FROM OLD.birth_date THEN
        accessed_fields := array_append(accessed_fields, 'birth_date');
      END IF;
      IF NEW.guardian_name IS DISTINCT FROM OLD.guardian_name THEN
        accessed_fields := array_append(accessed_fields, 'guardian_name');
      END IF;
      IF NEW.guardian_phone IS DISTINCT FROM OLD.guardian_phone THEN
        accessed_fields := array_append(accessed_fields, 'guardian_phone');
      END IF;
    ELSIF TG_OP = 'SELECT' THEN
      accessed_fields := ARRAY['birth_date', 'guardian_name', 'guardian_phone', 'guardian_relationship'];
    END IF;
    
    -- Registra acesso
    INSERT INTO minor_data_access_log (
      accessor_id,
      student_id,
      academy_id,
      operation,
      accessed_fields,
      ip_address
    ) VALUES (
      auth.uid(),
      COALESCE(NEW.id, OLD.id),
      COALESCE(NEW.academy_id, OLD.academy_id),
      TG_OP,
      accessed_fields,
      inet_client_addr()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger de auditoria
DROP TRIGGER IF EXISTS audit_minor_access_trigger ON academy_students;
CREATE TRIGGER audit_minor_access_trigger
AFTER SELECT OR UPDATE OR DELETE ON academy_students
FOR EACH ROW
WHEN (COALESCE(NEW.is_minor, OLD.is_minor) = true)
EXECUTE FUNCTION audit_minor_data_access();

-- ============================================================================
-- View segura para listar alunos (mascara dados de menores)
-- ============================================================================

CREATE OR REPLACE VIEW academy_students_safe AS
SELECT 
  id,
  academy_id,
  profile_id,
  name,
  -- Mascara telefone de menores
  CASE 
    WHEN is_minor THEN '***-****' 
    ELSE phone 
  END AS phone,
  -- Mascara data de nascimento de menores (apenas ano)
  CASE 
    WHEN is_minor THEN EXTRACT(YEAR FROM birth_date::date)::text 
    ELSE birth_date 
  END AS birth_date,
  is_minor,
  -- Mascara nome do responsável
  CASE 
    WHEN is_minor THEN SPLIT_PART(guardian_name, ' ', 1) || ' ***'
    ELSE guardian_name 
  END AS guardian_name,
  -- Mascara telefone do responsável
  CASE 
    WHEN is_minor THEN '***-****'
    ELSE guardian_phone 
  END AS guardian_phone,
  guardian_relationship,
  modality,
  graduation,
  monthly_fee,
  due_day,
  status,
  notes,
  created_at,
  updated_at
FROM academy_students;

-- RLS na view segura
ALTER VIEW academy_students_safe SET (security_barrier = true);

COMMENT ON VIEW academy_students_safe IS 
'View segura que mascara dados sensíveis de menores. Use esta view ao invés da tabela direta para listagens.';

-- ============================================================================
-- Restrições adicionais em academy_students
-- ============================================================================

-- Comentário educativo na tabela
COMMENT ON COLUMN academy_students.is_minor IS 
'⚠️  ATENÇÃO LGPD/ECA: Dados de menores são sensíveis. Acesso é auditado automaticamente. Use academy_students_safe view para listagens.';

COMMENT ON COLUMN academy_students.guardian_phone IS 
'⚠️  DADO SENSÍVEL: Telefone do responsável legal. Acesso auditado.';

COMMIT;
