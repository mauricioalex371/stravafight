-- ==============================================================================
-- Migration 00014: Correção de Segurança - Profiles UPDATE Policy
-- ==============================================================================
-- PROBLEMA: Policy atual permite UPDATE em TODAS as colunas, incluindo:
--           - followers_count, following_count (contadores)
--           - is_verified (verificação)
--           - xp_points (gamificação)
-- SOLUÇÃO: Restringir UPDATE apenas a colunas editáveis pelo usuário
-- ==============================================================================

BEGIN;

-- Remove policy insegura
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON public.profiles;

-- Cria policy segura que restringe colunas editáveis
CREATE POLICY "Users can update own profile safely"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Garante que colunas protegidas NÃO sejam alteradas
    AND (followers_count IS NOT DISTINCT FROM (SELECT followers_count FROM profiles WHERE id = auth.uid()))
    AND (following_count IS NOT DISTINCT FROM (SELECT following_count FROM profiles WHERE id = auth.uid()))
    AND (posts_count IS NOT DISTINCT FROM (SELECT posts_count FROM profiles WHERE id = auth.uid()))
    AND (is_verified IS NOT DISTINCT FROM (SELECT is_verified FROM profiles WHERE id = auth.uid()))
    AND (xp_points IS NOT DISTINCT FROM (SELECT xp_points FROM profiles WHERE id = auth.uid()))
    AND (streak_days IS NOT DISTINCT FROM (SELECT streak_days FROM profiles WHERE id = auth.uid()))
    AND (total_check_ins IS NOT DISTINCT FROM (SELECT total_check_ins FROM profiles WHERE id = auth.uid()))
    AND (belt_rank_social IS NOT DISTINCT FROM (SELECT belt_rank_social FROM profiles WHERE id = auth.uid()))
  );

COMMENT ON POLICY "Users can update own profile safely" ON public.profiles IS 
'Permite UPDATE apenas em colunas editáveis (full_name, bio, avatar_url, etc). Bloqueia alteração de contadores, verificação e gamificação.';

COMMIT;
