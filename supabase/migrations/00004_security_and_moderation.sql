-- ============================================================================
-- STRAVA FIGHT — MIGRATION 00004: SECURITY, COMMUNITY MODERATION & AUDIT LOGS
-- ============================================================================

-- 1. TABELA DE DENÚNCIAS DA COMUNIDADE (COMMUNITY REPORTS)
CREATE TABLE IF NOT EXISTS public.community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('POST', 'COMMENT', 'USER', 'MESSAGE', 'AD')),
  target_author_username TEXT,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reporter_username TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN (
    'SPAM', 'ASSEDIO', 'DISCURSO_ODIO', 'CONTEUDO_INADEQUADO', 
    'GOLPE_OU_FRAUDE', 'VIOLENCIA_DESMEDIDA', 'PERFIL_FALSO', 'OUTRO'
  )),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'EM_ANALISE', 'RESOLVIDA', 'REJEITADA')),
  admin_action_taken TEXT DEFAULT 'NENHUMA' CHECK (admin_action_taken IN ('NENHUMA', 'AVISO', 'CONTEUDO_REMOVIDO', 'CONTA_SUSPENSA')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.community_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_target ON public.community_reports(target_id, target_type);

-- 2. TABELA DE USUÁRIOS BLOQUEADOS (USER BLOCKS)
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON public.user_blocks(blocker_id);

-- 3. TABELA DE LOGS DE AUDITORIA ADMINISTRATIVA (ADMIN AUDIT LOGS)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON public.admin_audit_logs(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Reports: Usuários autenticados podem submeter denúncias
CREATE POLICY "Authenticated users can create reports"
  ON public.community_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Reports: Apenas administradores e o próprio autor da denúncia podem visualizar
CREATE POLICY "Users can read own reports or admins"
  ON public.community_reports FOR SELECT
  TO authenticated
  USING (
    auth.uid() = reporter_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin'))
  );

-- Blocks: Usuário pode gerenciar seus próprios bloqueios
CREATE POLICY "Users can manage own blocks"
  ON public.user_blocks FOR ALL
  TO authenticated
  USING (auth.uid() = blocker_id)
  WITH CHECK (auth.uid() = blocker_id);

-- Audit Logs: Apenas administradores podem ler logs de auditoria
CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin'))
  );
