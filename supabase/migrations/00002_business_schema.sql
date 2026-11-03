-- ==============================================================================
-- STRAVA FIGHT — Migration 00002: SF BUSINESS (Comercial, Campanhas & Patrocínios)
-- ==============================================================================

-- 1. PERFIS COMERCIAIS (COMMERCIAL PROFILES)
CREATE TABLE IF NOT EXISTS public.commercial_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    brand_category TEXT NOT NULL CHECK (brand_category IN (
        'MARCA_ESPORTIVA', 'LOJA_EQUIPAMENTOS', 'ACADEMIA', 'ORGANIZADOR_EVENTOS',
        'PROMOTOR_LUTAS', 'ATLETA_PROFISSIONAL', 'PATROCINADOR', 'PROFESSOR_TREINADOR',
        'SERVICO_ESPORTIVO', 'OUTRO'
    )),
    tagline TEXT,
    bio TEXT,
    logo_url TEXT,
    cover_url TEXT,
    website TEXT,
    official_email TEXT,
    phone TEXT,
    instagram TEXT,
    country TEXT DEFAULT 'Brasil',
    state TEXT,
    city TEXT,
    is_verified_business BOOLEAN DEFAULT FALSE,
    verification_documents JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CAMPANHAS DE ANÚNCIOS (AD CAMPAIGNS)
CREATE TABLE IF NOT EXISTS public.ad_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advertiser_id UUID NOT NULL REFERENCES public.commercial_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    objective TEXT NOT NULL CHECK (objective IN (
        'BRAND_AWARENESS', 'SELL_PRODUCT', 'PROMOTE_SERVICE', 'PROMOTE_EVENT',
        'SELL_TICKETS', 'STUDENT_LEADS', 'SUBSCRIPTIONS', 'FIND_SPONSORS',
        'FIND_ATHLETES', 'JOB_OPPORTUNITY'
    )),
    headline TEXT NOT NULL,
    description TEXT NOT NULL,
    media_url TEXT NOT NULL,
    media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
    target_url TEXT NOT NULL,
    cta_text TEXT NOT NULL,
    target_regions TEXT[] DEFAULT ARRAY['Brasil'],
    target_modalities TEXT[] DEFAULT ARRAY['Todas'],
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    daily_budget NUMERIC(10,2) NOT NULL,
    total_budget NUMERIC(10,2) NOT NULL,
    spent_amount NUMERIC(10,2) DEFAULT 0.00,
    placement TEXT DEFAULT 'FEED' CHECK (placement IN ('FEED', 'STORIES', 'REELS', 'EXPLORE', 'ALL')),
    status TEXT DEFAULT 'PENDING_APPROVAL' CHECK (status IN (
        'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'PAUSED', 'ENDED', 'REJECTED'
    )),
    rejection_reason TEXT,
    impressions_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    conversions_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATÁLOGO DE PRODUTOS E SERVIÇOS (COMMERCIAL PRODUCTS)
CREATE TABLE IF NOT EXISTS public.commercial_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commercial_profile_id UUID NOT NULL REFERENCES public.commercial_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    original_price NUMERIC(10,2),
    image_url TEXT NOT NULL,
    category TEXT NOT NULL,
    target_url TEXT NOT NULL,
    is_in_stock BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. OPORTUNIDADES DE PATROCÍNIO (SPONSORSHIP OPPORTUNITIES)
CREATE TABLE IF NOT EXISTS public.sponsorship_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commercial_profile_id UUID NOT NULL REFERENCES public.commercial_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('BUSCO_ATLETA', 'OFERECO_PATROCINIO', 'PARCERIA_ACADEMIA', 'APOIO_EVENTO')),
    description TEXT NOT NULL,
    budget_range TEXT NOT NULL,
    target_modalities TEXT[] NOT NULL,
    requirements TEXT,
    contact_email TEXT NOT NULL,
    status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'PAUSED', 'CLOSED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EVENTOS COMERCIAIS & INGRESSOS (COMMERCIAL EVENTS)
CREATE TABLE IF NOT EXISTS public.commercial_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commercial_profile_id UUID NOT NULL REFERENCES public.commercial_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('CAMPEONATO', 'SEMINARIO', 'SUPER_LUTA', 'WORKSHOP', 'FESTIVAL')),
    banner_url TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    location_name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    ticket_price_starting NUMERIC(10,2),
    ticket_sales_url TEXT NOT NULL,
    modalities TEXT[] NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. EVENTOS DE ANÚNCIO (MÉTRICAS: IMPRESSIONS & CLICKS)
CREATE TABLE IF NOT EXISTS public.ad_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('IMPRESSION', 'CLICK', 'CONVERSION')),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    placement TEXT NOT NULL,
    ip_hash TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DENÚNCIAS DE ANÚNCIOS (AD COMPLAINTS)
CREATE TABLE IF NOT EXISTS public.ad_complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL CHECK (reason IN (
        'FRAUD_OR_SCAM', 'MISLEADING_CONTENT', 'INAPPROPRIATE_CONTENT',
        'PROHIBITED_SUBSTANCE', 'COPYRIGHT_INFRINGEMENT', 'OTHER'
    )),
    details TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'INVESTIGATING', 'DISMISSED', 'CAMPAIGN_REMOVED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AUDITORIA ADMINISTRATIVA (ADMIN AUDIT LOGS)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- RLS POLICIES PARA O MÓDULO SF BUSINESS
-- ==============================================================================

ALTER TABLE public.commercial_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorship_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Perfis Comerciais
CREATE POLICY "Perfis comerciais ativos são públicos"
    ON public.commercial_profiles FOR SELECT
    USING (is_active = true);

CREATE POLICY "Usuários gerenciam seu próprio perfil comercial"
    ON public.commercial_profiles FOR ALL
    USING (auth.uid() = user_id);

-- Campanhas de Anúncios
CREATE POLICY "Anúncios ativos são visíveis publicamente"
    ON public.ad_campaigns FOR SELECT
    USING (status = 'ACTIVE');

CREATE POLICY "Anunciantes gerenciam suas campanhas"
    ON public.ad_campaigns FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.commercial_profiles cp
            WHERE cp.id = ad_campaigns.advertiser_id AND cp.user_id = auth.uid()
        )
    );

-- Catálogo de Produtos
CREATE POLICY "Produtos são públicos"
    ON public.commercial_products FOR SELECT
    USING (true);

CREATE POLICY "Anunciantes gerenciam seus produtos"
    ON public.commercial_products FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.commercial_profiles cp
            WHERE cp.id = commercial_products.commercial_profile_id AND cp.user_id = auth.uid()
        )
    );

-- Oportunidades de Patrocínio
CREATE POLICY "Oportunidades de patrocínio são públicas"
    ON public.sponsorship_opportunities FOR SELECT
    USING (status = 'OPEN');

CREATE POLICY "Anunciantes gerenciam suas oportunidades"
    ON public.sponsorship_opportunities FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.commercial_profiles cp
            WHERE cp.id = sponsorship_opportunities.commercial_profile_id AND cp.user_id = auth.uid()
        )
    );

-- Eventos Comerciais
CREATE POLICY "Eventos comerciais são públicos"
    ON public.commercial_events FOR SELECT
    USING (true);

CREATE POLICY "Anunciantes gerenciam seus eventos"
    ON public.commercial_events FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.commercial_profiles cp
            WHERE cp.id = commercial_events.commercial_profile_id AND cp.user_id = auth.uid()
        )
    );

-- Registro de Eventos de Anúncios (Impressões e Cliques)
CREATE POLICY "Usuários podem registrar impressões e cliques"
    ON public.ad_events FOR INSERT
    WITH CHECK (true);

-- Registro de Denúncias
CREATE POLICY "Usuários podem denunciar anúncios"
    ON public.ad_complaints FOR INSERT
    WITH CHECK (auth.uid() = reporter_id OR reporter_id IS NULL);
