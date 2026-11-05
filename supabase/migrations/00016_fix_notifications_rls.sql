-- ==============================================================================
-- Migration 00016: Correção de Segurança - notifications Policies Completas
-- ==============================================================================
-- PROBLEMA: notifications tem RLS enabled mas ZERO policies
--           Sistema de notificações completamente bloqueado
-- SOLUÇÃO: Adicionar policies completas para SELECT, INSERT, UPDATE
-- ==============================================================================

BEGIN;

-- Policy SELECT: usuários veem apenas suas próprias notificações
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_id);

-- Policy INSERT: sistema/backend pode criar notificações via service_role
-- Usuários autenticados PODEM criar notificações para outros (notifyLike, notifyComment, etc)
CREATE POLICY "Authenticated users can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Usuário pode criar notificação se ele é o "actor" (quem executou a ação)
    auth.uid() = actor_id
    -- E não está criando notificação para si mesmo
    AND recipient_id != auth.uid()
  );

-- Policy UPDATE: usuários podem marcar suas notificações como lidas
CREATE POLICY "Users can mark own notifications as read"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (
    auth.uid() = recipient_id
    -- Permite apenas alterar is_read
    AND (is_read IS DISTINCT FROM (SELECT is_read FROM notifications WHERE id = notifications.id))
  );

-- Policy DELETE: usuários podem deletar suas próprias notificações
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = recipient_id);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread 
  ON notifications(recipient_id, created_at DESC) 
  WHERE is_read = false;

COMMENT ON TABLE notifications IS 
'Notificações de ações sociais (likes, comentários, follows). Isoladas por recipient_id com RLS.';

COMMIT;
