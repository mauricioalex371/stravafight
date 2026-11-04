-- ============================================================================
-- Migration 00008: Arquitetura de Administração Segura
-- ============================================================================
-- PROBLEMA: profiles.role CHECK constraint não inclui 'Admin'/'Super Admin'
--           Policies em 00004 usam role IN ('Admin', 'Super Admin') - nunca funcionam
-- SOLUÇÃO: Tabela admin_roles dedicada (server-only, não editável pelo frontend)
--          Função is_admin() valida contra tabela protegida
-- SEGURANÇA: Única fonte de verdade para privilégios admin
-- ============================================================================

BEGIN;

-- ============================================================================
-- PASSO 1: Criar tabela de roles administrativos
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Super Admin', 'Moderator')),
  granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_roles_user_id ON admin_roles(user_id) WHERE is_active = true;
CREATE INDEX idx_admin_roles_active ON admin_roles(is_active, role);

COMMENT ON TABLE admin_roles IS 
'Tabela de privilégios administrativos. Única fonte de verdade para autorização admin. Protegida por RLS - somente service_role pode escrever.';

-- ============================================================================
-- PASSO 2: RLS na tabela admin_roles (proteção crítica)
-- ============================================================================

ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Leitura: apenas o próprio usuário vê seu role
CREATE POLICY "Users can view own admin role"
  ON public.admin_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Escrita: NINGUÉM pode inserir/atualizar via frontend
-- (Apenas service_role key via backend/SQL Editor)
-- Esta política nega tudo para authenticated users
CREATE POLICY "Deny all writes from authenticated users"
  ON public.admin_roles FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================================================
-- PASSO 3: Função is_admin() segura
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_roles
    WHERE user_id = auth.uid()
      AND is_active = true
      AND revoked_at IS NULL
      AND role IN ('Admin', 'Super Admin')
  );
END;
$$;

COMMENT ON FUNCTION is_admin() IS 
'Valida se usuário atual possui privilégio Admin/Super Admin. SECURITY DEFINER permite bypass de RLS para verificação.';

-- ============================================================================
-- PASSO 4: Funções auxiliares de administração
-- ============================================================================

-- Verificar se é Super Admin (permissões máximas)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_roles
    WHERE user_id = auth.uid()
      AND is_active = true
      AND revoked_at IS NULL
      AND role = 'Super Admin'
  );
END;
$$;

-- Verificar se é Moderador
CREATE OR REPLACE FUNCTION public.is_moderator()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_roles
    WHERE user_id = auth.uid()
      AND is_active = true
      AND revoked_at IS NULL
      AND role IN ('Admin', 'Super Admin', 'Moderator')
  );
END;
$$;

-- ============================================================================
-- PASSO 5: Função para revogar admin (somente via service_role)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.revoke_admin_access(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  -- Atualizar registro existente
  UPDATE public.admin_roles
  SET is_active = false,
      revoked_at = NOW()
  WHERE user_id = target_user_id
    AND is_active = true;

  -- Forçar logout deletando refresh tokens (invalidação imediata)
  DELETE FROM auth.refresh_tokens WHERE user_id = target_user_id;
  
  RAISE NOTICE 'Admin access revoked for user %', target_user_id;
END;
$$;

-- ============================================================================
-- PASSO 6: Bootstrap do primeiro Super Admin - PROCEDIMENTO MANUAL
-- ============================================================================

-- ⚠️ IMPORTANTE: Este bootstrap NÃO é executado automaticamente
-- O administrador deve seguir o procedimento abaixo APÓS aplicar esta migration:

-- PROCEDIMENTO DE BOOTSTRAP (executar via Supabase SQL Editor com service_role):
--
-- 1. Criar conta do primeiro admin no Supabase Dashboard:
--    Authentication > Users > Add User
--    Email: seu-email@dominio.com
--    Password: senha-forte
--
-- 2. Copiar o UUID do usuário criado
--
-- 3. Executar SQL abaixo (substituir o UUID):
--
--    INSERT INTO public.admin_roles (user_id, role, notes)
--    VALUES (
--      'UUID-DO-USUARIO-AQUI',  -- ⚠️ Substituir pelo UUID real
--      'Super Admin',
--      'Primeiro administrador (bootstrap manual)'
--    )
--    ON CONFLICT (user_id) DO NOTHING;
--
-- 4. Verificar criação:
--    SELECT * FROM admin_roles WHERE role = 'Super Admin';
--
-- 5. Fazer login com o email/senha criados no passo 1
--
-- 6. Testar privilégios admin:
--    SELECT is_admin(); -- Deve retornar true

COMMENT ON TABLE admin_roles IS 
'BOOTSTRAP DO PRIMEIRO ADMIN:
Após aplicar esta migration, execute via SQL Editor:
INSERT INTO admin_roles (user_id, role, notes) VALUES (''SEU-UUID'', ''Super Admin'', ''Bootstrap'');';

-- ============================================================================
-- PASSO 7: Atualizar policies existentes que usam profiles.role
-- ============================================================================

-- Dropar policies antigas que nunca funcionaram
DROP POLICY IF EXISTS "Users can read own reports or admins" ON community_reports;
DROP POLICY IF EXISTS "Admins can view audit logs" ON admin_audit_logs;

-- Recriar com is_admin()
CREATE POLICY "Users can read own reports or admins"
  ON public.community_reports FOR SELECT
  TO authenticated
  USING (
    auth.uid() = reporter_id OR is_admin()
  );

CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs FOR SELECT
  TO authenticated
  USING (is_admin());

-- Adicionar policy para admins gerenciarem reports
CREATE POLICY "Admins can manage reports"
  ON public.community_reports FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- PASSO 8: Auditoria de concessão de privilégios
-- ============================================================================

-- Trigger para registrar quando admin é criado/revogado
CREATE OR REPLACE FUNCTION audit_admin_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details)
    VALUES (
      NEW.granted_by,
      'GRANT_ADMIN_ROLE',
      'USER',
      NEW.user_id::TEXT,
      jsonb_build_object('role', NEW.role, 'notes', NEW.notes)
    );
  ELSIF TG_OP = 'UPDATE' AND NEW.is_active = false AND OLD.is_active = true THEN
    INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details)
    VALUES (
      auth.uid(), -- quem executou a revogação
      'REVOKE_ADMIN_ROLE',
      'USER',
      NEW.user_id::TEXT,
      jsonb_build_object('role', NEW.role, 'revoked_at', NEW.revoked_at)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER admin_role_audit_trigger
AFTER INSERT OR UPDATE ON admin_roles
FOR EACH ROW
EXECUTE FUNCTION audit_admin_role_changes();

-- ============================================================================
-- INSTRUÇÕES DE USO (para proprietário)
-- ============================================================================

COMMENT ON TABLE admin_roles IS 
'
COMO CONCEDER PRIVILÉGIOS ADMIN:

1. Via Supabase SQL Editor (service_role):
   INSERT INTO admin_roles (user_id, role, granted_by, notes)
   VALUES (
     ''uuid-do-usuario'',
     ''Admin'', -- ou ''Super Admin'' ou ''Moderator''
     ''uuid-de-quem-concede'',
     ''Motivo da concessão''
   );

2. Via Backend com service_role key:
   supabase.from(''admin_roles'').insert({
     user_id: targetUserId,
     role: ''Admin'',
     granted_by: granterUserId,
     notes: ''Aprovado pelo proprietário''
   });

COMO REVOGAR:
   SELECT revoke_admin_access(''uuid-do-usuario'');

COMO VERIFICAR:
   SELECT * FROM admin_roles WHERE is_active = true;

SEGURANÇA:
- Frontend NUNCA consegue escrever em admin_roles (RLS bloqueia)
- Única escrita via service_role key (backend/SQL)
- Revogação invalida sessões imediatamente
- Todas alterações são auditadas em admin_audit_logs
';

COMMIT;
