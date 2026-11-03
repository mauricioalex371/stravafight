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
