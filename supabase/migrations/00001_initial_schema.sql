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
