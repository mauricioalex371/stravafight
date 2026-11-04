-- ============================================================================
-- Migration 00007: Correção da Duplicação admin_audit_logs
-- ============================================================================
-- PROBLEMA: admin_audit_logs foi criada em 00002 (UUID) e 00004 (TEXT)
-- SOLUÇÃO: Preservar schema da 00004 (mais completo: TEXT + ip_address)
-- ESTRATÉGIA: IF NOT EXISTS garante idempotência
-- ============================================================================

BEGIN;

-- ============================================================================
-- PASSO 1: Verificar qual schema está ativo e criar backup
-- ============================================================================

-- Se a tabela foi criada pela 00002 (UUID), precisamos converter
-- Se foi criada pela 00004 (TEXT), não precisamos fazer nada

DO $$
DECLARE
  target_id_type TEXT;
  has_ip_address BOOLEAN;
BEGIN
  -- Detectar tipo da coluna target_id
  SELECT data_type INTO target_id_type
  FROM information_schema.columns
  WHERE table_name = 'admin_audit_logs' 
    AND column_name = 'target_id';

  -- Detectar se ip_address existe
  SELECT EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_audit_logs' 
      AND column_name = 'ip_address'
  ) INTO has_ip_address;

  RAISE NOTICE 'admin_audit_logs atual: target_id=%, tem ip_address=%', 
    target_id_type, has_ip_address;

  -- Cenário 1: Schema da 00002 (UUID, sem ip_address) - precisa migrar
  IF target_id_type = 'uuid' OR NOT has_ip_address THEN
    RAISE NOTICE 'Migrando schema da 00002 para 00004...';
    
    -- Backup de segurança
    DROP TABLE IF EXISTS admin_audit_logs_backup_00007;
    CREATE TABLE admin_audit_logs_backup_00007 AS 
    SELECT * FROM admin_audit_logs;
    
    RAISE NOTICE 'Backup criado: admin_audit_logs_backup_00007';
    
    -- Converter target_id de UUID para TEXT
    IF target_id_type = 'uuid' THEN
      ALTER TABLE admin_audit_logs 
        ALTER COLUMN target_id TYPE TEXT USING target_id::TEXT;
      RAISE NOTICE 'Coluna target_id convertida para TEXT';
    END IF;
    
    -- Adicionar ip_address se não existir
    IF NOT has_ip_address THEN
      ALTER TABLE admin_audit_logs ADD COLUMN ip_address INET;
      RAISE NOTICE 'Coluna ip_address adicionada';
    END IF;
    
    -- Recriar índice otimizado
    DROP INDEX IF EXISTS idx_admin_audit_logs_created;
    DROP INDEX IF EXISTS idx_audit_created;
    CREATE INDEX IF NOT EXISTS idx_audit_created 
      ON admin_audit_logs(created_at DESC);
    
    RAISE NOTICE 'Migration 00007 aplicada com sucesso';
  
  -- Cenário 2: Schema da 00004 (TEXT, com ip_address) - já está correto
  ELSE
    RAISE NOTICE 'Schema já está no formato da 00004. Nenhuma ação necessária.';
  END IF;
END $$;

-- ============================================================================
-- PASSO 2: Garantir consistência de constraints
-- ============================================================================

-- Garantir que admin_id permite SET NULL (necessário para 00004)
DO $$
BEGIN
  -- Verificar e ajustar constraint de admin_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_audit_logs'
      AND column_name = 'admin_id'
      AND is_nullable = 'NO'
  ) THEN
    -- Remover NOT NULL se existir (compatibilidade com ON DELETE SET NULL)
    ALTER TABLE admin_audit_logs 
      ALTER COLUMN admin_id DROP NOT NULL;
    RAISE NOTICE 'admin_id agora permite NULL (ON DELETE SET NULL)';
  END IF;
END $$;

-- ============================================================================
-- PASSO 3: Atualizar comentário da tabela
-- ============================================================================

COMMENT ON TABLE admin_audit_logs IS 
'Tabela de auditoria administrativa (schema consolidado - Migration 00007). Registra todas ações admin com IP tracking.';

-- ============================================================================
-- ROLLBACK PLAN (documentado)
-- ============================================================================
-- Para reverter esta migration:
-- 1. Se backup existe: DROP TABLE admin_audit_logs; 
--                      ALTER TABLE admin_audit_logs_backup_00007 RENAME TO admin_audit_logs;
-- 2. Recriar índices originais
-- 3. Verificar foreign keys

COMMIT;
