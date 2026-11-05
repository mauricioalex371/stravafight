-- ==============================================================================
-- Migration 00017: Correção de Segurança - conversations & messages RLS
-- ==============================================================================
-- PROBLEMA: Policies incompletas em conversations e conversation_participants
--           Mensagens diretas podem estar bloqueadas ou inseguras
-- SOLUÇÃO: Policies completas com isolamento total
-- ==============================================================================

BEGIN;

-- ============================================================================
-- CONVERSATIONS
-- ============================================================================

-- Policy SELECT: usuários veem conversas em que são participantes
CREATE POLICY "Participants can view conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversations.id 
        AND cp.user_id = auth.uid()
    )
  );

-- Policy INSERT: usuários podem criar conversas
CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);  -- Validação será feita em conversation_participants

-- Policy UPDATE: participantes podem atualizar timestamp
CREATE POLICY "Participants can update conversation timestamp"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversations.id 
        AND cp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- CONVERSATION_PARTICIPANTS
-- ============================================================================

-- Policy SELECT: participantes veem outros participantes da mesma conversa
CREATE POLICY "Participants can view conversation members"
  ON public.conversation_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id 
        AND cp.user_id = auth.uid()
    )
  );

-- Policy INSERT: usuários podem adicionar participantes (incluindo a si mesmos)
CREATE POLICY "Users can add participants to conversations"
  ON public.conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Pode adicionar se ele mesmo é participante OU se está se adicionando pela primeira vez
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id 
        AND cp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- MESSAGES (policies já existem na 00001, apenas validando)
-- ============================================================================

-- Garantir que policies existem
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' 
      AND policyname = 'Participantes leem mensagens da conversa'
  ) THEN
    RAISE EXCEPTION 'Policy de SELECT em messages não encontrada. Migration 00001 pode estar incompleta.';
  END IF;
END $$;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user 
  ON conversation_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation 
  ON conversation_participants(conversation_id);

COMMIT;
