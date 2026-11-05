-- ============================================================================
-- Migration 00010: Policies RLS Completas para 16 Tabelas Pendentes
-- ============================================================================
-- PROBLEMA: 16 tabelas têm RLS enabled mas zero policies (acesso 100% bloqueado)
-- SOLUÇÃO: Policies adequadas para cada tabela respeitando lógica de negócio
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. ACTIVITIES (SF Activity - Treinos/Atividades)
-- ============================================================================

-- Leitura: públicas ou apenas do próprio usuário (dependendo de is_public)
CREATE POLICY "Public activities are visible to all"
  ON public.activities FOR SELECT
  USING (true); -- Ajustar se tiver campo is_public

-- NOTA: Policies de INSERT/UPDATE/DELETE foram movidas para 00018 (com melhorias)
-- Não criar aqui para evitar duplicação

-- ============================================================================
-- 2. COMBAT_CHALLENGES (Desafios de Luta)
-- ============================================================================

-- Leitura: desafios públicos
CREATE POLICY "Public challenges are visible"
  ON public.combat_challenges FOR SELECT
  USING (true);

-- Inserção: usuário autenticado cria desafio
CREATE POLICY "Users can create challenges"
  ON public.combat_challenges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = challenger_id);

-- Atualização: challenger ou target podem atualizar
CREATE POLICY "Participants can update challenges"
  ON public.combat_challenges FOR UPDATE
  TO authenticated
  USING (auth.uid() = challenger_id OR auth.uid() = target_id)
  WITH CHECK (auth.uid() = challenger_id OR auth.uid() = target_id);

-- ============================================================================
-- 3. CONVERSATIONS (Conversas Diretas)
-- ============================================================================

-- Leitura: apenas participantes
CREATE POLICY "Participants can read conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversations.id
        AND cp.user_id = auth.uid()
    )
  );

-- Inserção: qualquer usuário autenticado pode criar conversa
CREATE POLICY "Authenticated users can create conversations"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (true); -- conversation_participants controlará acesso

-- ============================================================================
-- 4. CONVERSATION_PARTICIPANTS (Participantes de Conversas)
-- ============================================================================

-- Leitura: participantes veem outros participantes da mesma conversa
CREATE POLICY "Participants can see other participants"
  ON public.conversation_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
        AND cp.user_id = auth.uid()
    )
  );

-- Inserção: participante existente pode adicionar outros (ou creator da conversa)
CREATE POLICY "Participants can add other participants"
  ON public.conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
        AND cp.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 5. MARKETPLACE_CATEGORIES (Categorias de Produtos)
-- ============================================================================

-- Leitura: públicas
CREATE POLICY "Categories are public"
  ON public.marketplace_categories FOR SELECT
  USING (is_active = true);

-- Inserção/Atualização/Exclusão: apenas admins
CREATE POLICY "Admins manage categories"
  ON public.marketplace_categories FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- 6. MARKETPLACE_COMMISSIONS (Comissões de Vendas)
-- ============================================================================

-- Leitura: vendedor vê suas comissões
CREATE POLICY "Sellers view own commissions"
  ON public.marketplace_commissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM marketplace_stores ms
      WHERE ms.id = marketplace_commissions.store_id
        AND ms.owner_id = auth.uid()
    )
  );

-- Admins veem tudo
CREATE POLICY "Admins view all commissions"
  ON public.marketplace_commissions FOR SELECT
  TO authenticated
  USING (is_admin());

-- Inserção/Atualização: apenas admins (via sistema automático)
CREATE POLICY "System manages commissions"
  ON public.marketplace_commissions FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- 7. MARKETPLACE_COUPONS (Cupons de Desconto)
-- ============================================================================

-- Leitura: cupons ativos são públicos (validação)
CREATE POLICY "Active coupons are public"
  ON public.marketplace_coupons FOR SELECT
  USING (
    is_active = true 
    AND (valid_until IS NULL OR valid_until > NOW())
    AND (uses_count < max_uses OR max_uses IS NULL)
  );

-- Inserção: vendedor cria cupons para sua loja
CREATE POLICY "Sellers create own coupons"
  ON public.marketplace_coupons FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM marketplace_stores ms
      WHERE ms.id = marketplace_coupons.store_id
        AND ms.owner_id = auth.uid()
    )
  );

-- Atualização: vendedor gerencia seus cupons
CREATE POLICY "Sellers manage own coupons"
  ON public.marketplace_coupons FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM marketplace_stores ms
      WHERE ms.id = marketplace_coupons.store_id
        AND ms.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- 8. MARKETPLACE_PRODUCT_VARIANTS (Variações de Produtos)
-- ============================================================================

-- Leitura: pública (variações de produtos ativos)
CREATE POLICY "Product variants are public"
  ON public.marketplace_product_variants FOR SELECT
  USING (is_active = true);

-- Inserção: vendedor gerencia variações de seus produtos
CREATE POLICY "Sellers manage product variants"
  ON public.marketplace_product_variants FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM marketplace_products mp
      JOIN marketplace_stores ms ON mp.store_id = ms.id
      WHERE mp.id = marketplace_product_variants.product_id
        AND ms.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM marketplace_products mp
      JOIN marketplace_stores ms ON mp.store_id = ms.id
      WHERE mp.id = marketplace_product_variants.product_id
        AND ms.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- 9. MARKETPLACE_SHIPMENTS (Envios/Frete)
-- ============================================================================

-- Leitura: comprador vê seus envios
CREATE POLICY "Buyers view own shipments"
  ON public.marketplace_shipments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM marketplace_orders mo
      WHERE mo.id = marketplace_shipments.order_id
        AND mo.buyer_id = auth.uid()
    )
  );

-- Vendedor vê envios de seus produtos
CREATE POLICY "Sellers view shipments of own products"
  ON public.marketplace_shipments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM marketplace_orders mo
      JOIN marketplace_order_items moi ON mo.id = moi.order_id
      JOIN marketplace_stores ms ON moi.store_id = ms.id
      WHERE mo.id = marketplace_shipments.order_id
        AND ms.owner_id = auth.uid()
    )
  );

-- Atualização: vendedor atualiza status de envio
CREATE POLICY "Sellers update shipment status"
  ON public.marketplace_shipments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM marketplace_orders mo
      JOIN marketplace_order_items moi ON mo.id = moi.order_id
      JOIN marketplace_stores ms ON moi.store_id = ms.id
      WHERE mo.id = marketplace_shipments.order_id
        AND ms.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- 10. MARKETPLACE_WITHDRAWALS (Saques de Vendedores)
-- ============================================================================

-- Leitura: vendedor vê apenas seus saques
CREATE POLICY "Sellers view own withdrawals"
  ON public.marketplace_withdrawals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM marketplace_stores ms
      WHERE ms.id = marketplace_withdrawals.store_id
        AND ms.owner_id = auth.uid()
    )
  );

-- Inserção: vendedor solicita saque
CREATE POLICY "Sellers request withdrawals"
  ON public.marketplace_withdrawals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM marketplace_stores ms
      WHERE ms.id = marketplace_withdrawals.store_id
        AND ms.owner_id = auth.uid()
    )
  );

-- Atualização: admin aprova/rejeita saques
CREATE POLICY "Admins process withdrawals"
  ON public.marketplace_withdrawals FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- 11. NOTIFICATIONS (Notificações)
-- ============================================================================

-- Leitura: usuário vê apenas suas notificações
CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_id);

-- Inserção: sistema cria notificações (via backend)
-- Usuários NÃO podem criar notificações diretamente
CREATE POLICY "System creates notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (false); -- Apenas via service_role

-- Atualização: usuário marca como lida
CREATE POLICY "Users mark own notifications as read"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- Exclusão: usuário pode deletar suas notificações
CREATE POLICY "Users delete own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = recipient_id);

-- ============================================================================
-- 12. REELS (Vídeos Curtos)
-- ============================================================================

-- Leitura: públicos
CREATE POLICY "Reels are public"
  ON public.reels FOR SELECT
  USING (true);

-- Inserção: usuário autenticado cria reels
CREATE POLICY "Users create own reels"
  ON public.reels FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Atualização: apenas próprio usuário
CREATE POLICY "Users update own reels"
  ON public.reels FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Exclusão: próprio usuário ou admin
CREATE POLICY "Users delete own reels"
  ON public.reels FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id OR is_admin());

-- ============================================================================
-- 13. STORIES (Histórias 24h)
-- ============================================================================

-- Leitura: públicas e não expiradas
CREATE POLICY "Stories are public"
  ON public.stories FOR SELECT
  USING (expires_at > NOW());

-- Inserção: usuário autenticado cria stories
CREATE POLICY "Users create own stories"
  ON public.stories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Exclusão: apenas próprio usuário
CREATE POLICY "Users delete own stories"
  ON public.stories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 14. STREAM_ACCESS_LOGS (Logs de Acesso a Streams)
-- ============================================================================

-- Leitura: admin da stream vê logs
CREATE POLICY "Stream admins view access logs"
  ON public.stream_access_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM authorized_streams ast
      WHERE ast.id = stream_access_logs.stream_id
        AND ast.admin_id = auth.uid()
    )
  );

-- Admins veem todos os logs
CREATE POLICY "Admins view all stream logs"
  ON public.stream_access_logs FOR SELECT
  TO authenticated
  USING (is_admin());

-- Inserção: sistema registra acessos automaticamente
CREATE POLICY "System logs stream access"
  ON public.stream_access_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 15. STREAM_SCHEDULES (Agendamentos de Streams)
-- ============================================================================

-- Leitura: públicos (agenda de streams)
CREATE POLICY "Stream schedules are public"
  ON public.stream_schedules FOR SELECT
  USING (true);

-- Inserção: admin da stream cria schedule
CREATE POLICY "Stream admins create schedules"
  ON public.stream_schedules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM authorized_streams ast
      WHERE ast.id = stream_schedules.stream_id
        AND ast.admin_id = auth.uid()
    )
  );

-- Atualização: admin da stream gerencia schedule
CREATE POLICY "Stream admins manage schedules"
  ON public.stream_schedules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM authorized_streams ast
      WHERE ast.id = stream_schedules.stream_id
        AND ast.admin_id = auth.uid()
    )
  );

-- ============================================================================
-- 16. USER_FOLLOWERS (Seguidores)
-- ============================================================================

-- Leitura: públicas (lista de seguidores/seguindo)
CREATE POLICY "Followers are public"
  ON public.user_followers FOR SELECT
  USING (true);

-- NOTA: Policy "Users can follow others" foi movida para 00015 (com trigger de contadores)
-- Não criar aqui para evitar duplicação

-- Exclusão: usuário pode deixar de seguir
CREATE POLICY "Users can unfollow"
  ON public.user_followers FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- ============================================================================
-- VALIDAÇÃO FINAL
-- ============================================================================

DO $$
DECLARE
  total_tables_with_rls INTEGER;
  total_tables_with_policies INTEGER;
  tables_without_policies TEXT[];
BEGIN
  -- Contar tabelas com RLS
  SELECT COUNT(DISTINCT tablename) INTO total_tables_with_rls
  FROM pg_tables pt
  WHERE schemaname = 'public'
    AND EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = pt.tablename
        AND n.nspname = 'public'
        AND c.relrowsecurity = true
    );

  -- Contar tabelas com policies
  SELECT COUNT(DISTINCT tablename) INTO total_tables_with_policies
  FROM pg_policies
  WHERE schemaname = 'public';

  -- Listar tabelas ainda sem policies
  SELECT array_agg(tablename) INTO tables_without_policies
  FROM pg_tables pt
  WHERE schemaname = 'public'
    AND EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = pt.tablename
        AND n.nspname = 'public'
        AND c.relrowsecurity = true
    )
    AND NOT EXISTS (
      SELECT 1 FROM pg_policies pp
      WHERE pp.tablename = pt.tablename
        AND pp.schemaname = 'public'
    );

  RAISE NOTICE '=== VALIDAÇÃO MIGRATION 00010 ===';
  RAISE NOTICE 'Total de tabelas com RLS: %', total_tables_with_rls;
  RAISE NOTICE 'Total de tabelas com policies: %', total_tables_with_policies;
  
  IF tables_without_policies IS NOT NULL THEN
    RAISE WARNING 'Tabelas AINDA SEM policies: %', tables_without_policies;
  ELSE
    RAISE NOTICE '✅ TODAS as tabelas com RLS possuem policies!';
  END IF;
END $$;

COMMIT;
