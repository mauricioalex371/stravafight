-- ==============================================================================
-- Migration 00015: Correção de Segurança - user_followers Policies Completas
-- ==============================================================================
-- PROBLEMA: user_followers tem RLS enabled mas falta policies INSERT/DELETE
--           Ninguém consegue seguir ou deixar de seguir
-- SOLUÇÃO: Adicionar policies completas para INSERT e DELETE
-- ==============================================================================

BEGIN;

-- Dropar policy antiga se existir (pode ter sido criada na 00010)
DROP POLICY IF EXISTS "Users can follow others" ON public.user_followers;

-- Policy INSERT: usuários podem seguir outros (exceto a si mesmos)
CREATE POLICY "Users can follow others"
  ON public.user_followers FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = follower_id
    AND follower_id != following_id  -- Não pode seguir a si mesmo
    AND NOT EXISTS (
      -- Não pode seguir se já segue
      SELECT 1 FROM user_followers 
      WHERE follower_id = auth.uid() 
        AND following_id = user_followers.following_id
    )
  );

-- Policy DELETE: usuários podem deixar de seguir
CREATE POLICY "Users can unfollow others"
  ON public.user_followers FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- ============================================================================
-- Triggers para atualizar contadores automaticamente
-- ============================================================================

-- Função para atualizar contadores de seguidores
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementa following_count do seguidor
    UPDATE profiles 
    SET following_count = following_count + 1 
    WHERE id = NEW.follower_id;
    
    -- Incrementa followers_count do seguido
    UPDATE profiles 
    SET followers_count = followers_count + 1 
    WHERE id = NEW.following_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementa following_count do seguidor
    UPDATE profiles 
    SET following_count = GREATEST(following_count - 1, 0) 
    WHERE id = OLD.follower_id;
    
    -- Decrementa followers_count do seguido
    UPDATE profiles 
    SET followers_count = GREATEST(followers_count - 1, 0) 
    WHERE id = OLD.following_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger para followers
DROP TRIGGER IF EXISTS user_followers_count_trigger ON user_followers;
CREATE TRIGGER user_followers_count_trigger
AFTER INSERT OR DELETE ON user_followers
FOR EACH ROW
EXECUTE FUNCTION update_follower_counts();

COMMENT ON FUNCTION update_follower_counts() IS 
'Atualiza automaticamente followers_count e following_count quando usuários seguem/deixam de seguir.';

COMMIT;
