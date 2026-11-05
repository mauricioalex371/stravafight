-- ==============================================================================
-- Migration 00018: Correção de Segurança - stories, reels, activities RLS
-- ==============================================================================
-- PROBLEMA: stories, reels e activities têm RLS enabled mas ZERO policies
--           Funcionalidades completamente bloqueadas
-- SOLUÇÃO: Adicionar policies completas
-- ==============================================================================

BEGIN;

-- ============================================================================
-- STORIES
-- ============================================================================

-- Policy SELECT: todos podem ver stories não expirados
CREATE POLICY "Anyone can view active stories"
  ON public.stories FOR SELECT
  USING (expires_at > NOW());

-- Policy INSERT: usuários criam seus próprios stories
CREATE POLICY "Users can create own stories"
  ON public.stories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy DELETE: usuários deletam seus próprios stories
CREATE POLICY "Users can delete own stories"
  ON public.stories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- REELS
-- ============================================================================

-- Policy SELECT: todos podem ver reels públicos
CREATE POLICY "Anyone can view reels"
  ON public.reels FOR SELECT
  USING (true);

-- Policy INSERT: usuários criam seus próprios reels
CREATE POLICY "Users can create own reels"
  ON public.reels FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Policy UPDATE: autores podem editar seus reels
CREATE POLICY "Authors can update own reels"
  ON public.reels FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Policy DELETE: autores podem deletar seus reels
CREATE POLICY "Authors can delete own reels"
  ON public.reels FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- ============================================================================
-- ACTIVITIES (SF Activity - Check-ins de treino)
-- ============================================================================

-- Dropar policies antigas se existirem (podem ter sido criadas na 00010)
DROP POLICY IF EXISTS "Users can create own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can update own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can delete own activities" ON public.activities;

-- Policy SELECT: usuários veem suas próprias atividades (privacidade)
CREATE POLICY "Users can view own activities"
  ON public.activities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy INSERT: usuários registram seus próprios check-ins
CREATE POLICY "Users can create own activities"
  ON public.activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy UPDATE: usuários podem editar seus check-ins
CREATE POLICY "Users can update own activities"
  ON public.activities FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy DELETE: usuários podem deletar seus check-ins
CREATE POLICY "Users can delete own activities"
  ON public.activities FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- Limpeza automática de stories expirados (função utilitária)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_stories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  DELETE FROM stories WHERE expires_at < NOW() - INTERVAL '7 days';
END;
$$;

COMMENT ON FUNCTION cleanup_expired_stories() IS 
'Função utilitária para limpar stories expirados há mais de 7 dias. Executar periodicamente via cron.';

COMMIT;
