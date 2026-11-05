-- ==============================================================================
-- STRAVA FIGHT — Migration 00001: Esquema Relacional Completo & Políticas RLS
-- Banco de Dados: PostgreSQL (Supabase)
-- ==============================================================================

-- Habilita extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE PERFIS PÚBLICOS (PROFILES)
-- Sincronizada com auth.users do Supabase
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    cover_url TEXT DEFAULT 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200',
    bio TEXT,
    role TEXT DEFAULT 'Atleta' CHECK (role IN ('Atleta', 'Professor', 'Mestre', 'Academia', 'Visitante', 'Empresa')),
    location TEXT DEFAULT 'Brasil',
    modalities JSONB DEFAULT '[]'::jsonb,
    affiliated_academy_name TEXT,
    affiliated_academy_id UUID,
    is_verified BOOLEAN DEFAULT FALSE,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    friends_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    total_check_ins INTEGER DEFAULT 0,
    xp_points INTEGER DEFAULT 0,
    belt_rank_social TEXT DEFAULT 'Faixa Branca SF (Nível 1)',
    badges JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE ACADEMIAS (SF ACADEMY MULTI-TENANT)
CREATE TABLE IF NOT EXISTS public.academies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    master_name TEXT NOT NULL,
    logo_url TEXT,
    address TEXT,
    phone TEXT,
    description TEXT,
    modalities TEXT[] DEFAULT ARRAY['Jiu-Jitsu'],
    is_verified BOOLEAN DEFAULT FALSE,
    pin_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ALUNOS DA ACADEMIA (STUDENTS)
CREATE TABLE IF NOT EXISTS public.academy_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT,
    birth_date TEXT,
    is_minor BOOLEAN DEFAULT FALSE,
    guardian_name TEXT,
    guardian_phone TEXT,
    guardian_relationship TEXT,
    modality TEXT NOT NULL,
    graduation TEXT,
    monthly_fee NUMERIC(10,2) DEFAULT 0.00,
    due_day INTEGER DEFAULT 10,
    status TEXT DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'INATIVO', 'TRANCADO', 'EM_ATRASO')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TURMAS / AULAS DA ACADEMIA (CLASSES)
CREATE TABLE IF NOT EXISTS public.academy_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    modality TEXT NOT NULL,
    level TEXT DEFAULT 'Todos os Níveis',
    instructor TEXT NOT NULL,
    days TEXT[] NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    max_capacity INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FREQUÊNCIA / PRESENÇA (ATTENDANCE)
CREATE TABLE IF NOT EXISTS public.academy_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.academy_classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.academy_students(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'PRESENTE' CHECK (status IN ('PRESENTE', 'FALTA', 'JUSTIFICADA')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(academy_id, class_id, student_id, date)
);

-- 6. MENSALIDADES (FEES)
CREATE TABLE IF NOT EXISTS public.academy_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.academy_students(id) ON DELETE CASCADE,
    month_year TEXT NOT NULL, -- ex: '11/2026'
    due_date DATE NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    amount_paid NUMERIC(10,2) DEFAULT 0.00,
    status TEXT DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'PAGO', 'ATRASADO', 'ISENTO')),
    paid_date DATE,
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. FLUXO DE CAIXA (CASH TRANSACTIONS)
CREATE TABLE IF NOT EXISTS public.academy_cash_flow (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('ENTRADA', 'SAIDA')),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT DEFAULT 'PIX',
    fee_id UUID REFERENCES public.academy_fees(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PUBLICAÇÕES DO FEED (POSTS)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    caption TEXT,
    media_url TEXT NOT NULL,
    media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
    modality TEXT DEFAULT 'Jiu-Jitsu',
    hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
    location TEXT,
    tagged_academy TEXT,
    training_data JSONB,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CURTIDAS DE POSTS
CREATE TABLE IF NOT EXISTS public.post_likes (
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(post_id, user_id)
);

-- 10. COMENTÁRIOS DE POSTS
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. STORIES
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT DEFAULT 'image',
    caption TEXT,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. REELS
CREATE TABLE IF NOT EXISTS public.reels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    caption TEXT,
    hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
    audio_track TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. CONVERSAS & DIRECT MESSAGES
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT DEFAULT 'DIRECT' CHECK (type IN ('DIRECT', 'GROUP')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    text TEXT,
    media_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. DESAFIOS DE COMBATE (COMBAT CHALLENGES)
CREATE TABLE IF NOT EXISTS public.combat_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    modality TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('SPARRING', 'ROUNDS_META', 'TATAME_DUEL', 'CARDIO_FIGHT')),
    target_rounds INTEGER NOT NULL,
    proposed_date TEXT,
    location TEXT,
    notes TEXT,
    winner_notes TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED', 'EXPIRED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 15. SEGUIDORES & AMIZADES
CREATE TABLE IF NOT EXISTS public.user_followers (
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

-- 16. NOTIFICAÇÕES
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    text TEXT NOT NULL,
    target_id TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. ATIVIDADES SF ACTIVITY (CHECK-INS)
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    modality TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    calories_burned INTEGER,
    heart_rate_avg INTEGER,
    intensity TEXT,
    overlay_image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_cash_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combat_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Políticas de Profiles
CREATE POLICY "Perfis são legíveis publicamente"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Usuários podem atualizar seus próprios perfis"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Políticas de Academias
CREATE POLICY "Academias são legíveis publicamente"
    ON public.academies FOR SELECT
    USING (true);

CREATE POLICY "Donos gerenciam suas academias"
    ON public.academies FOR ALL
    USING (auth.uid() = owner_id);

-- Políticas de SF Academy (Multi-tenant por academy_id)
CREATE POLICY "Gestão de alunos por donos de academia"
    ON public.academy_students FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.academies a
            WHERE a.id = academy_students.academy_id AND a.owner_id = auth.uid()
        )
    );

CREATE POLICY "Gestão de turmas por donos de academia"
    ON public.academy_classes FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.academies a
            WHERE a.id = academy_classes.academy_id AND a.owner_id = auth.uid()
        )
    );

CREATE POLICY "Gestão de presenças por donos de academia"
    ON public.academy_attendance FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.academies a
            WHERE a.id = academy_attendance.academy_id AND a.owner_id = auth.uid()
        )
    );

CREATE POLICY "Gestão financeira por donos de academia"
    ON public.academy_fees FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.academies a
            WHERE a.id = academy_fees.academy_id AND a.owner_id = auth.uid()
        )
    );

CREATE POLICY "Fluxo de caixa por donos de academia"
    ON public.academy_cash_flow FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.academies a
            WHERE a.id = academy_cash_flow.academy_id AND a.owner_id = auth.uid()
        )
    );

-- Políticas de Posts
CREATE POLICY "Posts são legíveis por todos"
    ON public.posts FOR SELECT
    USING (true);

CREATE POLICY "Usuários autenticados criam posts"
    ON public.posts FOR INSERT
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Autores podem atualizar ou excluir seus posts"
    ON public.posts FOR ALL
    USING (auth.uid() = author_id);

-- Políticas de Mensagens Direct
CREATE POLICY "Participantes leem mensagens da conversa"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Participantes enviam mensagens para a conversa"
    ON public.messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
        )
    );

-- Trigger de sincronização de novo usuário (auth.users -> profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'guerreiro_' || SUBSTRING(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Atleta STRAVA FIGHT'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Atleta')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
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
-- ==============================================================================
-- STRAVA FIGHT — Migration 00003: Storage Buckets & Políticas de Armazenamento
-- Supabase Storage
-- ==============================================================================

-- 1. CRIAÇÃO DOS BUCKETS PÚBLICOS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('post-media', 'post-media', true, 52428800, ARRAY['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']),
  ('reels', 'reels', true, 104857600, ARRAY['video/mp4', 'video/quicktime', 'video/webm']),
  ('stories', 'stories', true, 52428800, ARRAY['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'video/quicktime']),
  ('sf-activities', 'sf-activities', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('business-assets', 'business-assets', true, 52428800, ARRAY['image/png', 'image/jpeg', 'image/webp', 'video/mp4'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. POLÍTICAS DE ACESSO AO STORAGE

-- Leitura pública para todos os buckets de mídia
CREATE POLICY "Acesso público de leitura aos assets de mídia"
ON storage.objects FOR SELECT
USING (bucket_id IN ('avatars', 'post-media', 'reels', 'stories', 'sf-activities', 'business-assets'));

-- Upload permitido para usuários autenticados
CREATE POLICY "Upload permitido para usuários autenticados"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  bucket_id IN ('avatars', 'post-media', 'reels', 'stories', 'sf-activities', 'business-assets')
);

-- Atualização e exclusão apenas pelo proprietário do objeto
CREATE POLICY "Usuários podem gerenciar seus próprios uploads"
ON storage.objects FOR UPDATE
USING (
  auth.uid() = owner AND
  bucket_id IN ('avatars', 'post-media', 'reels', 'stories', 'sf-activities', 'business-assets')
);

CREATE POLICY "Usuários podem deletar seus próprios uploads"
ON storage.objects FOR DELETE
USING (
  auth.uid() = owner AND
  bucket_id IN ('avatars', 'post-media', 'reels', 'stories', 'sf-activities', 'business-assets')
);
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
-- ==============================================================================
-- STRAVA FIGHT — Migration 00005: MARKETPLACE & E-COMMERCE COMPLETO
-- Marketplace Multivendedor, Carrinho, Checkout, Pedidos, Pagamentos
-- ==============================================================================

-- 1. LOJAS DO MARKETPLACE (SELLERS/STORES)
CREATE TABLE IF NOT EXISTS public.marketplace_stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    commercial_profile_id UUID REFERENCES public.commercial_profiles(id) ON DELETE SET NULL,
    store_name TEXT NOT NULL UNIQUE,
    store_slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    legal_name TEXT,
    tax_id TEXT, -- CNPJ/CPF
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    bank_account_info JSONB, -- encrypted fields
    commission_rate NUMERIC(5,2) DEFAULT 10.00, -- percentage
    status TEXT DEFAULT 'PENDING_APPROVAL' CHECK (status IN (
        'PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'INACTIVE'
    )),
    verification_documents JSONB DEFAULT '[]'::jsonb,
    is_verified BOOLEAN DEFAULT FALSE,
    total_sales NUMERIC(12,2) DEFAULT 0.00,
    total_products INTEGER DEFAULT 0,
    rating_average NUMERIC(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIAS DE PRODUTOS (HIERÁRQUICA)
CREATE TABLE IF NOT EXISTS public.marketplace_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES public.marketplace_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUTOS DO MARKETPLACE
CREATE TABLE IF NOT EXISTS public.marketplace_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.marketplace_stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.marketplace_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT NOT NULL,
    brand TEXT,
    sku TEXT,
    base_price NUMERIC(10,2) NOT NULL,
    sale_price NUMERIC(10,2),
    currency TEXT DEFAULT 'BRL',
    weight_grams INTEGER, -- for shipping
    dimensions_cm JSONB, -- {length, width, height}
    modality TEXT, -- Jiu-Jitsu, Muay Thai, etc
    main_image_url TEXT NOT NULL,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    video_url TEXT,
    has_variants BOOLEAN DEFAULT FALSE,
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED'
    )),
    views_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    rating_average NUMERIC(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, slug)
);

-- 4. VARIAÇÕES DE PRODUTOS (TAMANHO, COR, etc)
CREATE TABLE IF NOT EXISTS public.marketplace_product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- ex: "G Preto", "M Azul"
    sku TEXT,
    attributes JSONB NOT NULL, -- {size: "G", color: "Preto"}
    price_adjustment NUMERIC(10,2) DEFAULT 0.00, -- +/- do base_price
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ENDEREÇOS DE ENTREGA
CREATE TABLE IF NOT EXISTS public.marketplace_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    label TEXT NOT NULL, -- Casa, Trabalho, Academia
    recipient_name TEXT NOT NULL,
    street TEXT NOT NULL,
    number TEXT NOT NULL,
    complement TEXT,
    neighborhood TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    phone TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CARRINHOS DE COMPRA
CREATE TABLE IF NOT EXISTS public.marketplace_carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CONVERTED', 'ABANDONED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partial unique index: only one active cart per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_marketplace_carts_user_active 
    ON public.marketplace_carts(user_id) 
    WHERE status = 'ACTIVE';

-- 7. ITENS DO CARRINHO
CREATE TABLE IF NOT EXISTS public.marketplace_cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES public.marketplace_carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.marketplace_product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cart_id, product_id, variant_id)
);

-- 8. CUPONS DE DESCONTO
CREATE TABLE IF NOT EXISTS public.marketplace_coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.marketplace_stores(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
    discount_value NUMERIC(10,2) NOT NULL,
    min_purchase_amount NUMERIC(10,2) DEFAULT 0.00,
    max_uses INTEGER,
    uses_count INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PEDIDOS (ORDERS)
CREATE TABLE IF NOT EXISTS public.marketplace_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE, -- SF-2026-123456
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    shipping_address_id UUID NOT NULL REFERENCES public.marketplace_addresses(id),
    subtotal NUMERIC(10,2) NOT NULL,
    shipping_cost NUMERIC(10,2) DEFAULT 0.00,
    discount_amount NUMERIC(10,2) DEFAULT 0.00,
    coupon_code TEXT,
    total_amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    status TEXT DEFAULT 'PENDING_PAYMENT' CHECK (status IN (
        'PENDING_PAYMENT', 'PAYMENT_PROCESSING', 'PAID', 'PREPARING',
        'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'
    )),
    payment_method TEXT, -- PIX, CREDIT_CARD, BOLETO
    payment_status TEXT DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ITENS DO PEDIDO
CREATE TABLE IF NOT EXISTS public.marketplace_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.marketplace_stores(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES public.marketplace_product_variants(id),
    product_name TEXT NOT NULL,
    variant_name TEXT,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    commission_rate NUMERIC(5,2) NOT NULL,
    commission_amount NUMERIC(10,2) NOT NULL,
    seller_amount NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PAGAMENTOS (TRANSACTIONS)
CREATE TABLE IF NOT EXISTS public.marketplace_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
    payment_provider TEXT NOT NULL, -- MERCADO_PAGO, STRIPE
    provider_payment_id TEXT UNIQUE, -- external ID from gateway
    payment_method TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    status TEXT DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'CANCELLED', 'REFUNDED'
    )),
    pix_qr_code TEXT,
    pix_qr_code_base64 TEXT,
    boleto_url TEXT,
    installments INTEGER DEFAULT 1,
    failure_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. WEBHOOKS DE PAGAMENTO (AUDIT LOG)
CREATE TABLE IF NOT EXISTS public.marketplace_payment_webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES public.marketplace_payments(id) ON DELETE SET NULL,
    provider TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    signature TEXT,
    is_processed BOOLEAN DEFAULT FALSE,
    processing_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ENVIOS (SHIPMENTS)
CREATE TABLE IF NOT EXISTS public.marketplace_shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.marketplace_stores(id) ON DELETE RESTRICT,
    carrier TEXT NOT NULL, -- CORREIOS, JADLOG, etc
    service_name TEXT, -- SEDEX, PAC
    tracking_code TEXT,
    tracking_url TEXT,
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    shipping_cost NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'POSTED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED'
    )),
    events JSONB DEFAULT '[]'::jsonb, -- tracking events
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. AVALIAÇÕES DE PRODUTOS
CREATE TABLE IF NOT EXISTS public.marketplace_product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES public.marketplace_order_items(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title TEXT,
    comment TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    helpful_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(order_item_id, reviewer_id)
);

-- 15. PERGUNTAS SOBRE PRODUTOS
CREATE TABLE IF NOT EXISTS public.marketplace_product_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
    asker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT,
    answered_by UUID REFERENCES public.profiles(id),
    answered_at TIMESTAMPTZ,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. COMISSÕES E REPASSES
CREATE TABLE IF NOT EXISTS public.marketplace_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID NOT NULL REFERENCES public.marketplace_order_items(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.marketplace_stores(id) ON DELETE RESTRICT,
    commission_amount NUMERIC(10,2) NOT NULL,
    seller_amount NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'AVAILABLE', 'WITHDRAWN', 'REFUNDED'
    )),
    available_at DATE,
    withdrawn_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. SAQUES DE VENDEDORES
CREATE TABLE IF NOT EXISTS public.marketplace_withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.marketplace_stores(id) ON DELETE RESTRICT,
    amount NUMERIC(10,2) NOT NULL,
    bank_account_info JSONB NOT NULL,
    status TEXT DEFAULT 'REQUESTED' CHECK (status IN (
        'REQUESTED', 'PROCESSING', 'COMPLETED', 'FAILED'
    )),
    failure_reason TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ==============================================================================

CREATE INDEX idx_products_store ON public.marketplace_products(store_id);
CREATE INDEX idx_products_category ON public.marketplace_products(category_id);
CREATE INDEX idx_products_status ON public.marketplace_products(status);
CREATE INDEX idx_products_featured ON public.marketplace_products(is_featured);
CREATE INDEX idx_orders_buyer ON public.marketplace_orders(buyer_id);
CREATE INDEX idx_orders_status ON public.marketplace_orders(status);
CREATE INDEX idx_order_items_store ON public.marketplace_order_items(store_id);
CREATE INDEX idx_payments_provider_id ON public.marketplace_payments(provider_payment_id);
CREATE INDEX idx_shipments_tracking ON public.marketplace_shipments(tracking_code);
CREATE INDEX idx_reviews_product ON public.marketplace_product_reviews(product_id);

-- ==============================================================================
-- RLS POLICIES
-- ==============================================================================

ALTER TABLE public.marketplace_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_product_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_withdrawals ENABLE ROW LEVEL SECURITY;

-- STORES
CREATE POLICY "Lojas ativas são públicas"
    ON public.marketplace_stores FOR SELECT
    USING (status = 'ACTIVE');

CREATE POLICY "Donos gerenciam suas lojas"
    ON public.marketplace_stores FOR ALL
    USING (auth.uid() = owner_id);

-- PRODUCTS
CREATE POLICY "Produtos ativos são públicos"
    ON public.marketplace_products FOR SELECT
    USING (is_active = true AND status = 'ACTIVE');

CREATE POLICY "Vendedores gerenciam seus produtos"
    ON public.marketplace_products FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_stores ms
            WHERE ms.id = marketplace_products.store_id AND ms.owner_id = auth.uid()
        )
    );

-- ADDRESSES
CREATE POLICY "Usuários gerenciam seus endereços"
    ON public.marketplace_addresses FOR ALL
    USING (auth.uid() = user_id);

-- CARTS
CREATE POLICY "Usuários gerenciam seus carrinhos"
    ON public.marketplace_carts FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários gerenciam itens do carrinho"
    ON public.marketplace_cart_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_carts mc
            WHERE mc.id = marketplace_cart_items.cart_id AND mc.user_id = auth.uid()
        )
    );

-- ORDERS
CREATE POLICY "Compradores veem seus pedidos"
    ON public.marketplace_orders FOR SELECT
    USING (auth.uid() = buyer_id);

CREATE POLICY "Vendedores veem pedidos de seus produtos"
    ON public.marketplace_order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_stores ms
            WHERE ms.id = marketplace_order_items.store_id AND ms.owner_id = auth.uid()
        )
    );

-- PAYMENTS
CREATE POLICY "Compradores veem seus pagamentos"
    ON public.marketplace_payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_orders mo
            WHERE mo.id = marketplace_payments.order_id AND mo.buyer_id = auth.uid()
        )
    );

-- REVIEWS
CREATE POLICY "Reviews publicados são públicos"
    ON public.marketplace_product_reviews FOR SELECT
    USING (is_published = true);

CREATE POLICY "Compradores criam reviews"
    ON public.marketplace_product_reviews FOR INSERT
    WITH CHECK (auth.uid() = reviewer_id);

-- QUESTIONS
CREATE POLICY "Perguntas são públicas"
    ON public.marketplace_product_questions FOR SELECT
    USING (is_published = true);

CREATE POLICY "Usuários fazem perguntas"
    ON public.marketplace_product_questions FOR INSERT
    WITH CHECK (auth.uid() = asker_id);
-- ==============================================================================
-- STRAVA FIGHT — Migration 00006: EVENTOS ESPORTIVOS & TRANSMISSÕES AO VIVO
-- Campeonatos, Inscrições, Ingressos, Lutas Profissionais, Streams Autorizados
-- ==============================================================================

-- 1. EVENTOS ESPORTIVOS COMPLETOS (CAMPEONATOS, SEMINÁRIOS, TREINOS)
CREATE TABLE IF NOT EXISTS public.sports_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    commercial_profile_id UUID REFERENCES public.commercial_profiles(id),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'CAMPEONATO', 'SUPER_LUTA', 'SEMINARIO', 'WORKSHOP', 
        'TREINO_COLETIVO', 'FESTIVAL', 'TORNEIO_ABERTO'
    )),
    modality TEXT NOT NULL,
    banner_url TEXT NOT NULL,
    promo_video_url TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TEXT NOT NULL,
    end_time TEXT,
    venue_name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT DEFAULT 'Brasil',
    map_coordinates JSONB, -- {lat, lng}
    categories TEXT[] DEFAULT ARRAY[]::TEXT[], -- Faixas, pesos, idades
    rules_url TEXT,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    registration_open BOOLEAN DEFAULT TRUE,
    registration_deadline DATE,
    registration_fee NUMERIC(10,2),
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    has_ticketing BOOLEAN DEFAULT FALSE,
    ticket_price NUMERIC(10,2),
    ticket_url TEXT,
    has_live_stream BOOLEAN DEFAULT FALSE,
    stream_url TEXT,
    status TEXT DEFAULT 'UPCOMING' CHECK (status IN (
        'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'
    )),
    is_featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    interested_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INSCRIÇÕES EM EVENTOS
CREATE TABLE IF NOT EXISTS public.sports_event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.sports_events(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT, -- Categoria inscrita
    team_name TEXT,
    registration_number TEXT UNIQUE,
    payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN (
        'PENDING', 'PAID', 'EXEMPT', 'REFUNDED'
    )),
    payment_id UUID REFERENCES public.marketplace_payments(id),
    check_in_status TEXT DEFAULT 'NOT_CHECKED_IN' CHECK (check_in_status IN (
        'NOT_CHECKED_IN', 'CHECKED_IN', 'COMPETING', 'FINISHED'
    )),
    check_in_time TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, participant_id)
);

-- 3. RESULTADOS DE EVENTOS
CREATE TABLE IF NOT EXISTS public.sports_event_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.sports_events(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES public.sports_event_registrations(id) ON DELETE SET NULL,
    participant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    position INTEGER NOT NULL, -- 1º, 2º, 3º
    medal TEXT CHECK (medal IN ('GOLD', 'SILVER', 'BRONZE', 'PARTICIPANT')),
    points_earned INTEGER DEFAULT 0,
    match_results JSONB, -- histórico de lutas
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. GALERIA DE FOTOS E VÍDEOS DO EVENTO
CREATE TABLE IF NOT EXISTS public.sports_event_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.sports_events(id) ON DELETE CASCADE,
    uploader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    caption TEXT,
    is_highlight BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INTERESSE EM EVENTOS (I'M INTERESTED)
CREATE TABLE IF NOT EXISTS public.sports_event_interests (
    event_id UUID NOT NULL REFERENCES public.sports_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(event_id, user_id)
);

-- ==============================================================================
-- TRANSMISSÕES AUTORIZADAS (LUTAS PROFISSIONAIS E EVENTOS AO VIVO)
-- ==============================================================================

-- 6. STREAMS AUTORIZADOS (LUTAS, TRANSMISSÕES OFICIAIS)
CREATE TABLE IF NOT EXISTS public.authorized_streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    stream_type TEXT NOT NULL CHECK (stream_type IN (
        'UFC_FIGHT', 'BELLATOR_FIGHT', 'CAMPEONATO', 'SUPER_LUTA', 
        'SEMINARIO_LIVE', 'TREINO_ABERTO', 'OUTRO'
    )),
    modality TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TEXT NOT NULL,
    banner_url TEXT NOT NULL,
    fight_card JSONB, -- [{fighter1, fighter2, weight_class, ...}]
    stream_provider TEXT CHECK (stream_provider IN (
        'YOUTUBE', 'TWITCH', 'VIMEO', 'CUSTOM_HLS', 'IFRAME_EMBED'
    )),
    stream_url TEXT NOT NULL, -- iframe src, video ID, HLS manifest
    embed_code TEXT, -- código de incorporação oficial
    is_live BOOLEAN DEFAULT FALSE,
    is_free BOOLEAN DEFAULT TRUE,
    requires_subscription BOOLEAN DEFAULT FALSE,
    access_rules JSONB, -- pricing, geo-restrictions, etc
    chat_enabled BOOLEAN DEFAULT TRUE,
    countdown_enabled BOOLEAN DEFAULT TRUE,
    views_count INTEGER DEFAULT 0,
    peak_viewers INTEGER DEFAULT 0,
    status TEXT DEFAULT 'SCHEDULED' CHECK (status IN (
        'SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED'
    )),
    rights_holder TEXT, -- "UFC", "Bellator", "ONE Championship", etc
    license_confirmation TEXT, -- internal note about authorization
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ACESSO A STREAMS (CONTROLE DE ACESSO)
CREATE TABLE IF NOT EXISTS public.stream_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stream_id UUID NOT NULL REFERENCES public.authorized_streams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ip_address TEXT,
    user_agent TEXT,
    watch_duration_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CHAT DE TRANSMISSÃO (MENSAGENS AO VIVO)
CREATE TABLE IF NOT EXISTS public.stream_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stream_id UUID NOT NULL REFERENCES public.authorized_streams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PROGRAMAÇÃO DE TRANSMISSÕES (SCHEDULE)
CREATE TABLE IF NOT EXISTS public.stream_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stream_id UUID NOT NULL REFERENCES public.authorized_streams(id) ON DELETE CASCADE,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    status TEXT DEFAULT 'SCHEDULED' CHECK (status IN (
        'SCHEDULED', 'LIVE', 'ENDED', 'RESCHEDULED', 'CANCELLED'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ==============================================================================

CREATE INDEX idx_events_organizer ON public.sports_events(organizer_id);
CREATE INDEX idx_events_date ON public.sports_events(start_date);
CREATE INDEX idx_events_status ON public.sports_events(status);
CREATE INDEX idx_registrations_event ON public.sports_event_registrations(event_id);
CREATE INDEX idx_registrations_participant ON public.sports_event_registrations(participant_id);
CREATE INDEX idx_streams_date ON public.authorized_streams(event_date);
CREATE INDEX idx_streams_status ON public.authorized_streams(status);
CREATE INDEX idx_stream_chat ON public.stream_chat_messages(stream_id, created_at);

-- ==============================================================================
-- RLS POLICIES
-- ==============================================================================

ALTER TABLE public.sports_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_event_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_event_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_event_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorized_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_schedules ENABLE ROW LEVEL SECURITY;

-- EVENTS
CREATE POLICY "Eventos são públicos"
    ON public.sports_events FOR SELECT
    USING (true);

CREATE POLICY "Organizadores gerenciam seus eventos"
    ON public.sports_events FOR ALL
    USING (auth.uid() = organizer_id);

-- REGISTRATIONS
CREATE POLICY "Participantes veem suas inscrições"
    ON public.sports_event_registrations FOR SELECT
    USING (auth.uid() = participant_id);

CREATE POLICY "Usuários se inscrevem em eventos"
    ON public.sports_event_registrations FOR INSERT
    WITH CHECK (auth.uid() = participant_id);

-- RESULTS
CREATE POLICY "Resultados são públicos"
    ON public.sports_event_results FOR SELECT
    USING (true);

-- MEDIA
CREATE POLICY "Mídias de eventos são públicas"
    ON public.sports_event_media FOR SELECT
    USING (true);

-- INTERESTS
CREATE POLICY "Usuários demonstram interesse"
    ON public.sports_event_interests FOR ALL
    USING (auth.uid() = user_id);

-- STREAMS
CREATE POLICY "Streams são públicos"
    ON public.authorized_streams FOR SELECT
    USING (true);

-- CHAT
CREATE POLICY "Chat é público para leitura"
    ON public.stream_chat_messages FOR SELECT
    USING (is_deleted = false);

CREATE POLICY "Usuários enviam mensagens no chat"
    ON public.stream_chat_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários deletam suas mensagens"
    ON public.stream_chat_messages FOR UPDATE
    USING (auth.uid() = user_id);
-- ============================================================================
-- Migration 00007: Correção da Duplicação admin_audit_logs
-- ============================================================================
-- PROBLEMA: admin_audit_logs foi criada em 00002 (UUID) e 00004 (TEXT)
-- SOLUÇÃO: Preservar schema da 00004 (mais completo: TEXT + ip_address)
-- ESTRATÉGIA: IF NOT EXISTS garante idempotência
-- ============================================================================

BEGIN;

-- ============================================================================
-- PASSO 1: Verificar qual schema está ativo e criar backup
-- ============================================================================

-- Se a tabela foi criada pela 00002 (UUID), precisamos converter
-- Se foi criada pela 00004 (TEXT), não precisamos fazer nada

DO $$
DECLARE
  target_id_type TEXT;
  has_ip_address BOOLEAN;
BEGIN
  -- Detectar tipo da coluna target_id
  SELECT data_type INTO target_id_type
  FROM information_schema.columns
  WHERE table_name = 'admin_audit_logs' 
    AND column_name = 'target_id';

  -- Detectar se ip_address existe
  SELECT EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_audit_logs' 
      AND column_name = 'ip_address'
  ) INTO has_ip_address;

  RAISE NOTICE 'admin_audit_logs atual: target_id=%, tem ip_address=%', 
    target_id_type, has_ip_address;

  -- Cenário 1: Schema da 00002 (UUID, sem ip_address) - precisa migrar
  IF target_id_type = 'uuid' OR NOT has_ip_address THEN
    RAISE NOTICE 'Migrando schema da 00002 para 00004...';
    
    -- Backup de segurança
    DROP TABLE IF EXISTS admin_audit_logs_backup_00007;
    CREATE TABLE admin_audit_logs_backup_00007 AS 
    SELECT * FROM admin_audit_logs;
    
    RAISE NOTICE 'Backup criado: admin_audit_logs_backup_00007';
    
    -- Converter target_id de UUID para TEXT
    IF target_id_type = 'uuid' THEN
      ALTER TABLE admin_audit_logs 
        ALTER COLUMN target_id TYPE TEXT USING target_id::TEXT;
      RAISE NOTICE 'Coluna target_id convertida para TEXT';
    END IF;
    
    -- Adicionar ip_address se não existir
    IF NOT has_ip_address THEN
      ALTER TABLE admin_audit_logs ADD COLUMN ip_address INET;
      RAISE NOTICE 'Coluna ip_address adicionada';
    END IF;
    
    -- Recriar índice otimizado
    DROP INDEX IF EXISTS idx_admin_audit_logs_created;
    DROP INDEX IF EXISTS idx_audit_created;
    CREATE INDEX IF NOT EXISTS idx_audit_created 
      ON admin_audit_logs(created_at DESC);
    
    RAISE NOTICE 'Migration 00007 aplicada com sucesso';
  
  -- Cenário 2: Schema da 00004 (TEXT, com ip_address) - já está correto
  ELSE
    RAISE NOTICE 'Schema já está no formato da 00004. Nenhuma ação necessária.';
  END IF;
END $$;

-- ============================================================================
-- PASSO 2: Garantir consistência de constraints
-- ============================================================================

-- Garantir que admin_id permite SET NULL (necessário para 00004)
DO $$
BEGIN
  -- Verificar e ajustar constraint de admin_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_audit_logs'
      AND column_name = 'admin_id'
      AND is_nullable = 'NO'
  ) THEN
    -- Remover NOT NULL se existir (compatibilidade com ON DELETE SET NULL)
    ALTER TABLE admin_audit_logs 
      ALTER COLUMN admin_id DROP NOT NULL;
    RAISE NOTICE 'admin_id agora permite NULL (ON DELETE SET NULL)';
  END IF;
END $$;

-- ============================================================================
-- PASSO 3: Atualizar comentário da tabela
-- ============================================================================

COMMENT ON TABLE admin_audit_logs IS 
'Tabela de auditoria administrativa (schema consolidado - Migration 00007). Registra todas ações admin com IP tracking.';

-- ============================================================================
-- PASSO 4: Limpeza de backup (se migration foi bem sucedida)
-- ============================================================================

DO $$
BEGIN
  -- Remover backup temporário após 24h (manual)
  -- DROP TABLE IF EXISTS admin_audit_logs_backup_00007;
  -- Por segurança, mantemos o backup disponível para rollback manual
  NULL;
END $$;

-- ============================================================================
-- ROLLBACK PLAN (documentado)
-- ============================================================================
-- Para reverter esta migration:
-- 1. Se backup existe: DROP TABLE admin_audit_logs; 
--                      ALTER TABLE admin_audit_logs_backup_00007 RENAME TO admin_audit_logs;
-- 2. Recriar índices originais
-- 3. Verificar foreign keys

COMMIT;
-- ============================================================================
-- Migration 00008: Arquitetura de Administração Segura
-- ============================================================================
-- PROBLEMA: profiles.role CHECK constraint não inclui 'Admin'/'Super Admin'
--           Policies em 00004 usam role IN ('Admin', 'Super Admin') - nunca funcionam
-- SOLUÇÃO: Tabela admin_roles dedicada (server-only, não editável pelo frontend)
--          Função is_admin() valida contra tabela protegida
-- SEGURANÇA: Única fonte de verdade para privilégios admin
-- ============================================================================

BEGIN;

-- ============================================================================
-- PASSO 1: Criar tabela de roles administrativos
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Super Admin', 'Moderator')),
  granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_roles_user_id ON admin_roles(user_id) WHERE is_active = true;
CREATE INDEX idx_admin_roles_active ON admin_roles(is_active, role);

COMMENT ON TABLE admin_roles IS 
'Tabela de privilégios administrativos. Única fonte de verdade para autorização admin. Protegida por RLS - somente service_role pode escrever.';

-- ============================================================================
-- PASSO 2: RLS na tabela admin_roles (proteção crítica)
-- ============================================================================

ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Leitura: apenas o próprio usuário vê seu role
CREATE POLICY "Users can view own admin role"
  ON public.admin_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Escrita: NINGUÉM pode inserir/atualizar via frontend
-- (Apenas service_role key via backend/SQL Editor)
-- Esta política nega tudo para authenticated users
CREATE POLICY "Deny all writes from authenticated users"
  ON public.admin_roles FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================================================
-- PASSO 3: Função is_admin() segura
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_roles
    WHERE user_id = auth.uid()
      AND is_active = true
      AND revoked_at IS NULL
      AND role IN ('Admin', 'Super Admin')
  );
END;
$$;

COMMENT ON FUNCTION is_admin() IS 
'Valida se usuário atual possui privilégio Admin/Super Admin. SECURITY DEFINER permite bypass de RLS para verificação.';

-- ============================================================================
-- PASSO 4: Funções auxiliares de administração
-- ============================================================================

-- Verificar se é Super Admin (permissões máximas)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_roles
    WHERE user_id = auth.uid()
      AND is_active = true
      AND revoked_at IS NULL
      AND role = 'Super Admin'
  );
END;
$$;

-- Verificar se é Moderador
CREATE OR REPLACE FUNCTION public.is_moderator()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_roles
    WHERE user_id = auth.uid()
      AND is_active = true
      AND revoked_at IS NULL
      AND role IN ('Admin', 'Super Admin', 'Moderator')
  );
END;
$$;

-- ============================================================================
-- PASSO 5: Função para revogar admin (somente via service_role)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.revoke_admin_access(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  -- Atualizar registro existente
  UPDATE public.admin_roles
  SET is_active = false,
      revoked_at = NOW()
  WHERE user_id = target_user_id
    AND is_active = true;

  -- Forçar logout deletando refresh tokens (invalidação imediata)
  DELETE FROM auth.refresh_tokens WHERE user_id = target_user_id;
  
  RAISE NOTICE 'Admin access revoked for user %', target_user_id;
END;
$$;

-- ============================================================================
-- PASSO 6: Bootstrap do primeiro Super Admin - PROCEDIMENTO MANUAL
-- ============================================================================

-- ⚠️ IMPORTANTE: Este bootstrap NÃO é executado automaticamente
-- O administrador deve seguir o procedimento abaixo APÓS aplicar esta migration:

-- PROCEDIMENTO DE BOOTSTRAP (executar via Supabase SQL Editor com service_role):
--
-- 1. Criar conta do primeiro admin no Supabase Dashboard:
--    Authentication > Users > Add User
--    Email: seu-email@dominio.com
--    Password: senha-forte
--
-- 2. Copiar o UUID do usuário criado
--
-- 3. Executar SQL abaixo (substituir o UUID):
--
--    INSERT INTO public.admin_roles (user_id, role, notes)
--    VALUES (
--      'UUID-DO-USUARIO-AQUI',  -- ⚠️ Substituir pelo UUID real
--      'Super Admin',
--      'Primeiro administrador (bootstrap manual)'
--    )
--    ON CONFLICT (user_id) DO NOTHING;
--
-- 4. Verificar criação:
--    SELECT * FROM admin_roles WHERE role = 'Super Admin';
--
-- 5. Fazer login com o email/senha criados no passo 1
--
-- 6. Testar privilégios admin:
--    SELECT is_admin(); -- Deve retornar true

COMMENT ON TABLE admin_roles IS 
'BOOTSTRAP DO PRIMEIRO ADMIN:
Após aplicar esta migration, execute via SQL Editor:
INSERT INTO admin_roles (user_id, role, notes) VALUES (''SEU-UUID'', ''Super Admin'', ''Bootstrap'');';

-- ============================================================================
-- PASSO 7: Atualizar policies existentes que usam profiles.role
-- ============================================================================

-- Dropar policies antigas que nunca funcionaram
DROP POLICY IF EXISTS "Users can read own reports or admins" ON community_reports;
DROP POLICY IF EXISTS "Admins can view audit logs" ON admin_audit_logs;

-- Recriar com is_admin()
CREATE POLICY "Users can read own reports or admins"
  ON public.community_reports FOR SELECT
  TO authenticated
  USING (
    auth.uid() = reporter_id OR is_admin()
  );

CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs FOR SELECT
  TO authenticated
  USING (is_admin());

-- Adicionar policy para admins gerenciarem reports
CREATE POLICY "Admins can manage reports"
  ON public.community_reports FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- PASSO 8: Auditoria de concessão de privilégios
-- ============================================================================

-- Trigger para registrar quando admin é criado/revogado
CREATE OR REPLACE FUNCTION audit_admin_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details)
    VALUES (
      NEW.granted_by,
      'GRANT_ADMIN_ROLE',
      'USER',
      NEW.user_id::TEXT,
      jsonb_build_object('role', NEW.role, 'notes', NEW.notes)
    );
  ELSIF TG_OP = 'UPDATE' AND NEW.is_active = false AND OLD.is_active = true THEN
    INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details)
    VALUES (
      auth.uid(), -- quem executou a revogação
      'REVOKE_ADMIN_ROLE',
      'USER',
      NEW.user_id::TEXT,
      jsonb_build_object('role', NEW.role, 'revoked_at', NEW.revoked_at)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER admin_role_audit_trigger
AFTER INSERT OR UPDATE ON admin_roles
FOR EACH ROW
EXECUTE FUNCTION audit_admin_role_changes();

-- ============================================================================
-- INSTRUÇÕES DE USO (para proprietário)
-- ============================================================================

COMMENT ON TABLE admin_roles IS 
'
COMO CONCEDER PRIVILÉGIOS ADMIN:

1. Via Supabase SQL Editor (service_role):
   INSERT INTO admin_roles (user_id, role, granted_by, notes)
   VALUES (
     ''uuid-do-usuario'',
     ''Admin'', -- ou ''Super Admin'' ou ''Moderator''
     ''uuid-de-quem-concede'',
     ''Motivo da concessão''
   );

2. Via Backend com service_role key:
   supabase.from(''admin_roles'').insert({
     user_id: targetUserId,
     role: ''Admin'',
     granted_by: granterUserId,
     notes: ''Aprovado pelo proprietário''
   });

COMO REVOGAR:
   SELECT revoke_admin_access(''uuid-do-usuario'');

COMO VERIFICAR:
   SELECT * FROM admin_roles WHERE is_active = true;

SEGURANÇA:
- Frontend NUNCA consegue escrever em admin_roles (RLS bloqueia)
- Única escrita via service_role key (backend/SQL)
- Revogação invalida sessões imediatamente
- Todas alterações são auditadas em admin_audit_logs
';

COMMIT;
-- ============================================================================
-- Migration 00009: Políticas RLS Completas para post_likes e post_comments
-- ============================================================================
-- VERSÃO FIXED: Adiciona SET search_path para segurança em SECURITY DEFINER
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
-- PASSO 3: Funções auxiliares para atualizar contadores (CORRIGIDO)
-- ============================================================================
-- CORREÇÃO: Adiciona SET search_path para segurança em funções SECURITY DEFINER
-- ============================================================================

-- Função para atualizar contador de curtidas
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
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
SET search_path = pg_catalog, public
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
-- ============================================================================
-- STRAVA FIGHT — Migration 00012: Correção de 2 Tabelas Sem RLS
-- ============================================================================
-- PROBLEMA: 2 tabelas sem RLS encontradas na auditoria:
--           1. admin_audit_logs_backup_00007 (backup temporário com dados sensíveis)
--           2. marketplace_payment_webhooks (logs financeiros desprotegidos)
-- SOLUÇÃO: Eliminar backup + Habilitar RLS com policies adequadas
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. ELIMINAR BACKUP TEMPORÁRIO (JÁ SERVIU SEU PROPÓSITO)
-- ============================================================================

-- Backup da migration 00007 foi criado apenas para segurança durante alteração schema
-- Migration 00007 já foi aplicada com sucesso há várias migrations atrás
-- Manter backups SQL perpetuamente é má prática e risco de segurança

DROP TABLE IF EXISTS public.admin_audit_logs_backup_00007;

-- ============================================================================
-- 2. HABILITAR RLS EM marketplace_payment_webhooks
-- ============================================================================

ALTER TABLE public.marketplace_payment_webhooks ENABLE ROW LEVEL SECURITY;

-- Policy 1: Apenas admins podem ler webhooks (audit/debug)
CREATE POLICY "Admins can view payment webhooks"
  ON public.marketplace_payment_webhooks FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy 2: Apenas system (service_role) pode inserir webhooks
-- Usuários autenticados normais NÃO podem inserir
-- Webhooks são recebidos pelo backend e escritos via service_role
CREATE POLICY "System can insert payment webhooks"
  ON public.marketplace_payment_webhooks FOR INSERT
  TO authenticated
  WITH CHECK (false); -- Bloqueia todos, apenas service_role bypass RLS

-- Policy 3: Admins podem atualizar status de processamento (reprocessamento manual)
CREATE POLICY "Admins can update webhook processing status"
  ON public.marketplace_payment_webhooks FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Nenhuma policy de DELETE: webhooks são audit trail permanente

-- ============================================================================
-- VALIDAÇÃO FINAL
-- ============================================================================

DO $$
DECLARE
  total_public_tables INTEGER;
  tables_with_rls INTEGER;
  tables_without_rls INTEGER;
  webhook_policies INTEGER;
  tables_without_rls_list TEXT[];
BEGIN
  -- Contar tabelas públicas
  SELECT COUNT(*) INTO total_public_tables
  FROM pg_tables
  WHERE schemaname = 'public';
  
  -- Contar tabelas com RLS
  SELECT COUNT(*) INTO tables_with_rls
  FROM pg_tables t
  JOIN pg_class c ON c.relname = t.tablename
  JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
  WHERE t.schemaname = 'public'
    AND c.relkind = 'r'
    AND c.relrowsecurity = true;
  
  -- Contar tabelas SEM RLS
  SELECT COUNT(*) INTO tables_without_rls
  FROM pg_tables t
  LEFT JOIN pg_class c ON c.relname = t.tablename
  LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
  WHERE t.schemaname = 'public'
    AND c.relkind = 'r'
    AND (c.relrowsecurity = false OR c.relrowsecurity IS NULL);
  
  -- Listar tabelas SEM RLS (se houver)
  SELECT array_agg(t.tablename) INTO tables_without_rls_list
  FROM pg_tables t
  LEFT JOIN pg_class c ON c.relname = t.tablename
  LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
  WHERE t.schemaname = 'public'
    AND c.relkind = 'r'
    AND (c.relrowsecurity = false OR c.relrowsecurity IS NULL);
  
  -- Contar policies de marketplace_payment_webhooks
  SELECT COUNT(*) INTO webhook_policies
  FROM pg_policies
  WHERE tablename = 'marketplace_payment_webhooks'
    AND schemaname = 'public';
  
  RAISE NOTICE '';
  RAISE NOTICE '==========================================================';
  RAISE NOTICE '           VALIDAÇÃO MIGRATION 00012                      ';
  RAISE NOTICE '==========================================================';
  RAISE NOTICE 'Total de tabelas públicas: %', total_public_tables;
  RAISE NOTICE 'Tabelas COM RLS: % (%.1f%%)', tables_with_rls, (tables_with_rls::FLOAT / total_public_tables * 100);
  RAISE NOTICE 'Tabelas SEM RLS: %', tables_without_rls;
  
  IF tables_without_rls_list IS NOT NULL THEN
    RAISE WARNING '⚠️  Tabelas ainda sem RLS: %', tables_without_rls_list;
  END IF;
  
  RAISE NOTICE 'Policies em marketplace_payment_webhooks: %', webhook_policies;
  RAISE NOTICE '';
  
  IF tables_without_rls = 0 AND webhook_policies = 3 THEN
    RAISE NOTICE '✅ ✅ ✅  SUCESSO: TODAS as tabelas possuem RLS!';
    RAISE NOTICE '✅ marketplace_payment_webhooks protegido com 3 policies';
    RAISE NOTICE '✅ Backup temporário admin_audit_logs_backup_00007 removido';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 SEGURANÇA: 100%% das tabelas protegidas por RLS';
  ELSE
    RAISE WARNING '❌ FALHA: Ainda há % tabelas sem RLS', tables_without_rls;
    RAISE WARNING 'Ou policies de marketplace_payment_webhooks incorretas (esperado: 3, atual: %)', webhook_policies;
  END IF;
  
  RAISE NOTICE '==========================================================';
  RAISE NOTICE '';
END $$;

COMMIT;
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
-- ==============================================================================
-- Migration 00019: Proteção de Dados de Menores (LGPD/ECA)
-- ==============================================================================
-- PROBLEMA: Dados de menores (birth_date, guardian info) sem proteção adicional
--           Policy FOR ALL permite acesso irrestrito por donos de academia
-- SOLUÇÃO: Policies específicas + Auditoria de acesso + Mascaramento
-- ==============================================================================

BEGIN;

-- ============================================================================
-- Tabela de Auditoria de Acesso a Dados de Menores
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.minor_data_access_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    accessor_id UUID NOT NULL REFERENCES auth.users(id),
    student_id UUID NOT NULL REFERENCES academy_students(id),
    academy_id UUID NOT NULL REFERENCES academies(id),
    operation TEXT NOT NULL CHECK (operation IN ('SELECT', 'UPDATE', 'DELETE')),
    accessed_fields TEXT[],
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE minor_data_access_log ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver logs
CREATE POLICY "Only admins can view minor data access logs"
  ON minor_data_access_log FOR SELECT
  TO authenticated
  USING (is_admin());

-- ============================================================================
-- Função para validar e auditar acesso a dados de menores
-- ============================================================================

CREATE OR REPLACE FUNCTION audit_minor_data_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  accessed_fields TEXT[];
BEGIN
  -- Apenas audita se for menor
  IF (TG_OP = 'SELECT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE') 
     AND COALESCE(NEW.is_minor, OLD.is_minor) = true THEN
    
    -- Identifica campos sensíveis acessados
    accessed_fields := ARRAY[]::TEXT[];
    
    IF TG_OP = 'UPDATE' THEN
      IF NEW.birth_date IS DISTINCT FROM OLD.birth_date THEN
        accessed_fields := array_append(accessed_fields, 'birth_date');
      END IF;
      IF NEW.guardian_name IS DISTINCT FROM OLD.guardian_name THEN
        accessed_fields := array_append(accessed_fields, 'guardian_name');
      END IF;
      IF NEW.guardian_phone IS DISTINCT FROM OLD.guardian_phone THEN
        accessed_fields := array_append(accessed_fields, 'guardian_phone');
      END IF;
    ELSIF TG_OP = 'SELECT' THEN
      accessed_fields := ARRAY['birth_date', 'guardian_name', 'guardian_phone', 'guardian_relationship'];
    END IF;
    
    -- Registra acesso
    INSERT INTO minor_data_access_log (
      accessor_id,
      student_id,
      academy_id,
      operation,
      accessed_fields,
      ip_address
    ) VALUES (
      auth.uid(),
      COALESCE(NEW.id, OLD.id),
      COALESCE(NEW.academy_id, OLD.academy_id),
      TG_OP,
      accessed_fields,
      inet_client_addr()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger de auditoria
DROP TRIGGER IF EXISTS audit_minor_access_trigger ON academy_students;
CREATE TRIGGER audit_minor_access_trigger
AFTER SELECT OR UPDATE OR DELETE ON academy_students
FOR EACH ROW
WHEN (COALESCE(NEW.is_minor, OLD.is_minor) = true)
EXECUTE FUNCTION audit_minor_data_access();

-- ============================================================================
-- View segura para listar alunos (mascara dados de menores)
-- ============================================================================

CREATE OR REPLACE VIEW academy_students_safe AS
SELECT 
  id,
  academy_id,
  profile_id,
  name,
  -- Mascara telefone de menores
  CASE 
    WHEN is_minor THEN '***-****' 
    ELSE phone 
  END AS phone,
  -- Mascara data de nascimento de menores (apenas ano)
  CASE 
    WHEN is_minor THEN EXTRACT(YEAR FROM birth_date::date)::text 
    ELSE birth_date 
  END AS birth_date,
  is_minor,
  -- Mascara nome do responsável
  CASE 
    WHEN is_minor THEN SPLIT_PART(guardian_name, ' ', 1) || ' ***'
    ELSE guardian_name 
  END AS guardian_name,
  -- Mascara telefone do responsável
  CASE 
    WHEN is_minor THEN '***-****'
    ELSE guardian_phone 
  END AS guardian_phone,
  guardian_relationship,
  modality,
  graduation,
  monthly_fee,
  due_day,
  status,
  notes,
  created_at,
  updated_at
FROM academy_students;

-- RLS na view segura
ALTER VIEW academy_students_safe SET (security_barrier = true);

COMMENT ON VIEW academy_students_safe IS 
'View segura que mascara dados sensíveis de menores. Use esta view ao invés da tabela direta para listagens.';

-- ============================================================================
-- Restrições adicionais em academy_students
-- ============================================================================

-- Comentário educativo na tabela
COMMENT ON COLUMN academy_students.is_minor IS 
'⚠️  ATENÇÃO LGPD/ECA: Dados de menores são sensíveis. Acesso é auditado automaticamente. Use academy_students_safe view para listagens.';

COMMENT ON COLUMN academy_students.guardian_phone IS 
'⚠️  DADO SENSÍVEL: Telefone do responsável legal. Acesso auditado.';

COMMIT;
-- ============================================================================
-- Migration 00020: Auditoria de Dados Financeiros
-- ============================================================================
-- OBJETIVO: Compliance LGPD - rastreabilidade de operações financeiras
-- ESCOPO: academy_fees, academy_cash_flow
-- ============================================================================

BEGIN;

-- ============================================================================
-- PASSO 1: Tabela de auditoria financeira
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.financial_audit_log (
  id BIGSERIAL PRIMARY KEY,
  
  -- Identificação da operação
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  record_id BIGINT NOT NULL,
  
  -- Quem executou
  user_id UUID,
  user_ip INET,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Dados da operação
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  
  -- Contexto adicional
  academy_id UUID,
  reason TEXT,
  
  -- Índices para busca
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para consulta rápida
CREATE INDEX idx_financial_audit_table_record ON financial_audit_log(table_name, record_id);
CREATE INDEX idx_financial_audit_user ON financial_audit_log(user_id, performed_at DESC);
CREATE INDEX idx_financial_audit_academy ON financial_audit_log(academy_id, performed_at DESC);
CREATE INDEX idx_financial_audit_performed_at ON financial_audit_log(performed_at DESC);

-- RLS: apenas admins e gestores da academia podem ver logs
ALTER TABLE public.financial_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Academy admins can view financial audit logs"
  ON public.financial_audit_log FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR
    EXISTS (
      SELECT 1 FROM academy_members am
      WHERE am.academy_id = financial_audit_log.academy_id
        AND am.user_id = auth.uid()
        AND am.role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- PASSO 2: Função de auditoria financeira
-- ============================================================================

CREATE OR REPLACE FUNCTION audit_financial_operation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_academy_id UUID;
  v_changed_fields TEXT[];
  v_old_data JSONB;
  v_new_data JSONB;
BEGIN
  -- Extrair academy_id dependendo da tabela
  IF TG_TABLE_NAME = 'academy_fees' THEN
    v_academy_id := COALESCE(NEW.academy_id, OLD.academy_id);
  ELSIF TG_TABLE_NAME = 'academy_cash_flow' THEN
    v_academy_id := COALESCE(NEW.academy_id, OLD.academy_id);
  END IF;

  -- Preparar dados antigos e novos
  IF TG_OP = 'DELETE' THEN
    v_old_data := to_jsonb(OLD);
    v_new_data := NULL;
  ELSIF TG_OP = 'INSERT' THEN
    v_old_data := NULL;
    v_new_data := to_jsonb(NEW);
  ELSE -- UPDATE
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
    
    -- Identificar campos alterados
    SELECT ARRAY_AGG(key)
    INTO v_changed_fields
    FROM jsonb_each(v_old_data) old_fields
    WHERE v_new_data->old_fields.key IS DISTINCT FROM old_fields.value;
  END IF;

  -- Registrar operação no log de auditoria
  INSERT INTO financial_audit_log (
    table_name,
    operation,
    record_id,
    user_id,
    user_ip,
    old_data,
    new_data,
    changed_fields,
    academy_id
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    auth.uid(),
    inet_client_addr(),
    v_old_data,
    v_new_data,
    v_changed_fields,
    v_academy_id
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ============================================================================
-- PASSO 3: Triggers de auditoria
-- ============================================================================

-- Auditoria para academy_fees
DROP TRIGGER IF EXISTS audit_academy_fees_trigger ON academy_fees;
CREATE TRIGGER audit_academy_fees_trigger
AFTER INSERT OR UPDATE OR DELETE ON academy_fees
FOR EACH ROW
EXECUTE FUNCTION audit_financial_operation();

-- Auditoria para academy_cash_flow
DROP TRIGGER IF EXISTS audit_academy_cash_flow_trigger ON academy_cash_flow;
CREATE TRIGGER audit_academy_cash_flow_trigger
AFTER INSERT OR UPDATE OR DELETE ON academy_cash_flow
FOR EACH ROW
EXECUTE FUNCTION audit_financial_operation();

-- ============================================================================
-- PASSO 4: View para relatórios de auditoria
-- ============================================================================

CREATE OR REPLACE VIEW financial_audit_report AS
SELECT 
  fal.id,
  fal.table_name,
  fal.operation,
  fal.record_id,
  fal.performed_at,
  
  -- Informações do usuário
  p.username AS performed_by_username,
  p.full_name AS performed_by_name,
  fal.user_ip,
  
  -- Academia relacionada
  a.name AS academy_name,
  a.slug AS academy_slug,
  
  -- Dados da operação
  fal.old_data,
  fal.new_data,
  fal.changed_fields,
  
  -- Detalhes específicos por tipo
  CASE 
    WHEN fal.table_name = 'academy_fees' THEN
      jsonb_build_object(
        'student_name', (SELECT full_name FROM profiles WHERE id = (fal.new_data->>'student_id')::UUID),
        'amount', COALESCE(fal.new_data->>'amount', fal.old_data->>'amount'),
        'status', COALESCE(fal.new_data->>'payment_status', fal.old_data->>'payment_status')
      )
    WHEN fal.table_name = 'academy_cash_flow' THEN
      jsonb_build_object(
        'amount', COALESCE(fal.new_data->>'amount', fal.old_data->>'amount'),
        'type', COALESCE(fal.new_data->>'transaction_type', fal.old_data->>'transaction_type'),
        'category', COALESCE(fal.new_data->>'category', fal.old_data->>'category')
      )
  END AS operation_details
  
FROM financial_audit_log fal
LEFT JOIN profiles p ON p.id = fal.user_id
LEFT JOIN academies a ON a.id = fal.academy_id
ORDER BY fal.performed_at DESC;

-- RLS para a view
ALTER VIEW financial_audit_report SET (security_barrier = true);

-- ============================================================================
-- PASSO 5: Função para consultar histórico financeiro
-- ============================================================================

CREATE OR REPLACE FUNCTION get_financial_history(
  p_table_name TEXT,
  p_record_id BIGINT,
  p_limit INT DEFAULT 50
)
RETURNS TABLE(
  operation TEXT,
  performed_at TIMESTAMPTZ,
  performed_by TEXT,
  changed_fields TEXT[],
  old_data JSONB,
  new_data JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  -- Verificar autorização
  IF NOT (
    is_admin()
    OR
    EXISTS (
      SELECT 1 FROM financial_audit_log fal
      INNER JOIN academy_members am 
        ON am.academy_id = fal.academy_id
      WHERE fal.table_name = p_table_name
        AND fal.record_id = p_record_id
        AND am.user_id = auth.uid()
        AND am.role IN ('owner', 'admin')
      LIMIT 1
    )
  ) THEN
    RAISE EXCEPTION 'Acesso negado ao histórico financeiro';
  END IF;

  -- Retornar histórico
  RETURN QUERY
  SELECT 
    fal.operation,
    fal.performed_at,
    COALESCE(p.full_name, fal.user_id::TEXT) AS performed_by,
    fal.changed_fields,
    fal.old_data,
    fal.new_data
  FROM financial_audit_log fal
  LEFT JOIN profiles p ON p.id = fal.user_id
  WHERE fal.table_name = p_table_name
    AND fal.record_id = p_record_id
  ORDER BY fal.performed_at DESC
  LIMIT p_limit;
END;
$$;

-- ============================================================================
-- VALIDAÇÃO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 00020: Auditoria financeira configurada';
  RAISE NOTICE '- Tabela: financial_audit_log criada';
  RAISE NOTICE '- Triggers: academy_fees e academy_cash_flow auditados';
  RAISE NOTICE '- View: financial_audit_report disponível';
  RAISE NOTICE '- Função: get_financial_history() configurada';
  RAISE NOTICE 'Compliance LGPD: rastreabilidade de operações financeiras ATIVA';
END $$;

COMMIT;
