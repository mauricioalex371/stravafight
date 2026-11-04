-- ============================================================================
-- Migration 00009: Políticas RLS Completas para post_likes e post_comments
-- ============================================================================
-- PROBLEMA: post_likes e post_comments têm RLS enabled mas ZERO policies
--           Ninguém consegue curtir ou comentar (tudo bloqueado)
-- SOLUÇÃO: Policies completas com proteção contra user_blocks
-- ============================================================================

BEGIN;

-- ============================================================================
-- PASSO 1: Políticas para post_likes
-- ============================================================================

-- Leitura: todos podem ver curtidas públicas
CREATE POLICY "Anyone can view likes"
  ON public.post_likes FOR SELECT
  USING (true);

-- Inserção: usuários autenticados podem curtir (exceto bloqueados)
CREATE POLICY "Authenticated users can like posts"
  ON public.post_likes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      -- Verificar bloqueio bidirecional (otimizado com JOIN)
      SELECT 1 
      FROM user_blocks ub
      INNER JOIN posts p ON p.id = post_likes.post_id
      WHERE (
        -- Autor do post bloqueou o usuário
        (ub.blocker_id = p.author_id AND ub.blocked_id = auth.uid())
        OR
        -- Usuário bloqueou o autor do post
        (ub.blocked_id = p.author_id AND ub.blocker_id = auth.uid())
      )
    )
  );

-- Exclusão: usuários podem descurtir seus próprios likes
CREATE POLICY "Users can unlike posts"
  ON public.post_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- PASSO 2: Políticas para post_comments
-- ============================================================================

-- Leitura: todos podem ver comentários públicos (exceto de users bloqueados)
CREATE POLICY "Anyone can view comments"
  ON public.post_comments FOR SELECT
  USING (
    -- Comentário visível se não houver bloqueio envolvido
    NOT EXISTS (
      SELECT 1 FROM user_blocks ub
      WHERE (
        -- Visualizador bloqueou o autor do comentário
        (ub.blocker_id = auth.uid() AND ub.blocked_id = post_comments.author_id)
        OR
        -- Autor do comentário bloqueou o visualizador
        (ub.blocked_id = auth.uid() AND ub.blocker_id = post_comments.author_id)
      )
    )
  );

-- Inserção: usuários autenticados podem comentar (exceto bloqueados)
CREATE POLICY "Authenticated users can comment on posts"
  ON public.post_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND NOT EXISTS (
      -- Verificar bloqueio bidirecional (otimizado com JOIN)
      SELECT 1 
      FROM user_blocks ub
      INNER JOIN posts p ON p.id = post_comments.post_id
      WHERE (
        -- Autor do post bloqueou o usuário
        (ub.blocker_id = p.author_id AND ub.blocked_id = auth.uid())
        OR
        -- Usuário bloqueou o autor do post
        (ub.blocked_id = p.author_id AND ub.blocker_id = auth.uid())
      )
    )
  );

-- Atualização: autores podem editar seus próprios comentários
CREATE POLICY "Authors can update own comments"
  ON public.post_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Exclusão: autores podem deletar seus próprios comentários
CREATE POLICY "Authors can delete own comments"
  ON public.post_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Moderação: admins podem deletar qualquer comentário
CREATE POLICY "Admins can delete any comment"
  ON public.post_comments FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================================
-- PASSO 3: Funções auxiliares para atualizar contadores
-- ============================================================================

-- Função para atualizar contador de curtidas
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts 
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts 
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.post_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger para curtidas
DROP TRIGGER IF EXISTS post_likes_count_trigger ON post_likes;
CREATE TRIGGER post_likes_count_trigger
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW
EXECUTE FUNCTION update_post_likes_count();

-- Função para atualizar contador de comentários
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts 
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts 
    SET comments_count = GREATEST(comments_count - 1, 0)
    WHERE id = OLD.post_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger para comentários
DROP TRIGGER IF EXISTS post_comments_count_trigger ON post_comments;
CREATE TRIGGER post_comments_count_trigger
AFTER INSERT OR DELETE ON post_comments
FOR EACH ROW
EXECUTE FUNCTION update_post_comments_count();

-- ============================================================================
-- PASSO 4: Índices de performance
-- ============================================================================

-- Índice para verificação rápida de bloqueios
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker_blocked 
  ON user_blocks(blocker_id, blocked_id);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_blocker 
  ON user_blocks(blocked_id, blocker_id);

-- Índice para comentários por post
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id 
  ON post_comments(post_id, created_at DESC);

-- Índice para comentários por autor
CREATE INDEX IF NOT EXISTS idx_post_comments_author_id 
  ON post_comments(author_id);

-- ============================================================================
-- VALIDAÇÃO FINAL
-- ============================================================================

DO $$
DECLARE
  likes_policies_count INTEGER;
  comments_policies_count INTEGER;
BEGIN
  -- Contar policies de post_likes
  SELECT COUNT(*) INTO likes_policies_count
  FROM pg_policies
  WHERE tablename = 'post_likes';
  
  -- Contar policies de post_comments
  SELECT COUNT(*) INTO comments_policies_count
  FROM pg_policies
  WHERE tablename = 'post_comments';
  
  RAISE NOTICE 'post_likes agora tem % policies', likes_policies_count;
  RAISE NOTICE 'post_comments agora tem % policies', comments_policies_count;
  
  IF likes_policies_count = 0 OR comments_policies_count = 0 THEN
    RAISE WARNING 'Algumas policies não foram criadas. Verificar logs.';
  ELSE
    RAISE NOTICE 'Migration 00009 aplicada com sucesso!';
  END IF;
END $$;

COMMIT;
