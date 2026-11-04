-- ============================================================================
-- Migration 00011: Correção de Segurança ad_events e Rate Limiting
-- ============================================================================
-- PROBLEMA: ad_events permite INSERT anônimo com WITH CHECK (true)
--           Falta rate limiting server-side
--           Possibilidade de falsificação de métricas
-- SOLUÇÃO: Policy autenticada + trigger de rate limiting + validação
-- ============================================================================

BEGIN;

-- ============================================================================
-- PASSO 1: Substituir policy permissiva por autenticada
-- ============================================================================

-- Dropar policy insegura
DROP POLICY IF EXISTS "Usuários podem registrar impressões e cliques" ON ad_events;

-- Nova policy: requer autenticação (permite NULL user_id para logs anônimos válidos)
CREATE POLICY "Authenticated users can log ad events"
  ON public.ad_events FOR INSERT
  TO authenticated
  WITH CHECK (
    -- user_id deve ser do usuário atual ou NULL (para eventos anônimos válidos)
    (user_id = auth.uid() OR user_id IS NULL)
  );

-- Leitura: apenas owner da campanha ou admin
CREATE POLICY "Campaign owners view ad events"
  ON public.ad_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM ad_campaigns ac
      JOIN commercial_profiles cp ON ac.advertiser_id = cp.id
      WHERE ac.id = ad_events.campaign_id
        AND cp.user_id = auth.uid()
    )
    OR is_admin()
  );

-- ============================================================================
-- PASSO 2: Tabela de rate limiting (anti-spam)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ad_events_rate_limit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  campaign_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, campaign_id, event_type, window_start)
);

CREATE INDEX idx_ad_events_rate_limit_window 
  ON ad_events_rate_limit(user_id, campaign_id, window_start);

COMMENT ON TABLE ad_events_rate_limit IS 
'Rate limiting para eventos de anúncios. Janela de 1 minuto, máximo 5 eventos por tipo.';

-- ============================================================================
-- PASSO 3: Função de validação e rate limiting
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_ad_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recent_count INTEGER;
  window_start TIMESTAMPTZ;
  ad_exists BOOLEAN;
  campaign_active BOOLEAN;
BEGIN
  -- Validação 1: campaign_id existe e campanha está ativa
  SELECT EXISTS(
    SELECT 1 FROM ad_campaigns 
    WHERE id = NEW.campaign_id 
      AND status = 'ACTIVE'
  ) INTO campaign_active;

  IF NOT campaign_active THEN
    RAISE EXCEPTION 'Campanha não existe ou não está ativa: %', NEW.campaign_id;
  END IF;

  -- Validação 2: user_id é válido
  IF NEW.user_id IS NOT NULL AND NEW.user_id != auth.uid() THEN
    RAISE EXCEPTION 'user_id inválido: não pode registrar eventos de outros usuários';
  END IF;

  -- Validação 3: Rate limiting (apenas para usuários autenticados)
  IF NEW.user_id IS NOT NULL THEN
    -- Janela de 1 minuto
    window_start := date_trunc('minute', NOW());

    -- UPSERT atômico ANTES de checar (evita race condition)
    INSERT INTO ad_events_rate_limit (user_id, campaign_id, event_type, window_start, event_count)
    VALUES (NEW.user_id, NEW.campaign_id, NEW.event_type, window_start, 1)
    ON CONFLICT (user_id, campaign_id, event_type, window_start) 
    DO UPDATE SET event_count = ad_events_rate_limit.event_count + 1
    RETURNING event_count INTO recent_count;

    -- Verificar limite APÓS incrementar atomicamente
    IF recent_count > 5 THEN
      RAISE EXCEPTION 'Rate limit excedido: máximo 5 % por minuto (tentativa #%)', NEW.event_type, recent_count;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger antes de INSERT
DROP TRIGGER IF EXISTS ad_events_validation_trigger ON ad_events;
CREATE TRIGGER ad_events_validation_trigger
BEFORE INSERT ON ad_events
FOR EACH ROW
EXECUTE FUNCTION validate_ad_event();

-- ============================================================================
-- PASSO 4: Limpeza automática de rate limit antigos
-- ============================================================================

-- Função para limpar janelas antigas (>1 hora)
CREATE OR REPLACE FUNCTION cleanup_ad_rate_limit()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM ad_events_rate_limit
  WHERE window_start < NOW() - INTERVAL '1 hour';
  
  RAISE NOTICE 'Rate limit antigos removidos';
END;
$$;

-- Job de limpeza (chamar periodicamente via cron ou pg_cron)
COMMENT ON FUNCTION cleanup_ad_rate_limit() IS 
'Executar a cada hora para limpar rate limits antigos. 
Exemplo pg_cron: SELECT cron.schedule(''cleanup-ad-rate-limit'', ''0 * * * *'', ''SELECT cleanup_ad_rate_limit();'');';

-- ============================================================================
-- PASSO 5: RLS na tabela de rate limiting
-- ============================================================================

ALTER TABLE public.ad_events_rate_limit ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver rate limits (debug)
CREATE POLICY "Admins view rate limits"
  ON public.ad_events_rate_limit FOR SELECT
  TO authenticated
  USING (is_admin());

-- Ninguém pode inserir manualmente (apenas via trigger)
CREATE POLICY "System manages rate limits"
  ON public.ad_events_rate_limit FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================================================
-- PASSO 6: Atualizar contadores de campanhas atomicamente
-- ============================================================================

-- Função para incrementar impressões
CREATE OR REPLACE FUNCTION increment_ad_impressions(campaign_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  UPDATE ad_campaigns
  SET impressions_count = COALESCE(impressions_count, 0) + 1,
      updated_at = NOW()
  WHERE id = campaign_id
    AND status = 'ACTIVE';

  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$;

-- Função para incrementar cliques
CREATE OR REPLACE FUNCTION increment_ad_clicks(campaign_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  UPDATE ad_campaigns
  SET clicks_count = COALESCE(clicks_count, 0) + 1,
      ctr = CASE 
        WHEN impressions_count > 0 
        THEN (clicks_count + 1.0) / impressions_count 
        ELSE 0 
      END,
      updated_at = NOW()
  WHERE id = campaign_id
    AND status = 'ACTIVE';

  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$;

-- ============================================================================
-- PASSO 7: Trigger para atualizar contadores automaticamente
-- ============================================================================

CREATE OR REPLACE FUNCTION update_ad_campaign_counters()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.event_type = 'impression' THEN
    PERFORM increment_ad_impressions(NEW.campaign_id);
  ELSIF NEW.event_type = 'click' THEN
    PERFORM increment_ad_clicks(NEW.campaign_id);
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ad_events_update_counters_trigger ON ad_events;
CREATE TRIGGER ad_events_update_counters_trigger
AFTER INSERT ON ad_events
FOR EACH ROW
EXECUTE FUNCTION update_ad_campaign_counters();

-- ============================================================================
-- PASSO 8: Verificação de integridade
-- ============================================================================

DO $$
DECLARE
  policies_count INTEGER;
  triggers_count INTEGER;
BEGIN
  -- Contar policies de ad_events
  SELECT COUNT(*) INTO policies_count
  FROM pg_policies
  WHERE tablename = 'ad_events';

  -- Contar triggers de ad_events
  SELECT COUNT(*) INTO triggers_count
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  WHERE c.relname = 'ad_events'
    AND NOT t.tgisinternal;

  RAISE NOTICE '=== VALIDAÇÃO MIGRATION 00011 ===';
  RAISE NOTICE 'Policies em ad_events: %', policies_count;
  RAISE NOTICE 'Triggers em ad_events: %', triggers_count;
  
  IF policies_count >= 2 AND triggers_count >= 2 THEN
    RAISE NOTICE '✅ ad_events seguro e funcional!';
  ELSE
    RAISE WARNING 'Verificar policies e triggers de ad_events';
  END IF;
END $$;

COMMIT;
