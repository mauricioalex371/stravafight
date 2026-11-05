-- ==============================================================================
-- STRAVA FIGHT - SQL COMPLETO PARA EXECUTAR NO SUPABASE
-- Copie TUDO e execute no Supabase SQL Editor
-- ==============================================================================

-- Habilita extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. TABELA DE PERFIS PÚBLICOS (PROFILES)
-- ==============================================================================
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
    sherdog_url TEXT,
    sherdog_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. TABELAS DO SHERDOG (LUTADORES E LUTAS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.fighters (
    id SERIAL PRIMARY KEY,
    sherdog_id INTEGER UNIQUE NOT NULL,
    sherdog_url TEXT,
    sherdog_slug TEXT,
    name TEXT,
    nickname TEXT,
    nationality TEXT,
    locality TEXT,
    birth_date TEXT,
    age INTEGER,
    image_url TEXT,
    height TEXT,
    height_cm REAL,
    weight_lbs REAL,
    weight_kg REAL,
    association TEXT,
    weight_class TEXT,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    nc INTEGER DEFAULT 0,
    win_ko INTEGER DEFAULT 0,
    win_sub INTEGER DEFAULT 0,
    win_dec INTEGER DEFAULT 0,
    win_ko_pct TEXT,
    win_sub_pct TEXT,
    win_dec_pct TEXT,
    loss_ko INTEGER DEFAULT 0,
    loss_sub INTEGER DEFAULT 0,
    loss_dec INTEGER DEFAULT 0,
    loss_ko_pct TEXT,
    loss_sub_pct TEXT,
    loss_dec_pct TEXT,
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fights (
    id SERIAL PRIMARY KEY,
    fighter_id INTEGER NOT NULL REFERENCES public.fighters(id) ON DELETE CASCADE,
    result TEXT,
    opponent TEXT,
    opponent_url TEXT,
    event TEXT,
    event_url TEXT,
    event_date TEXT,
    event_date_iso TEXT,
    method TEXT,
    referee TEXT,
    round INTEGER,
    time TEXT,
    fight_type TEXT DEFAULT 'pro',
    fight_order INTEGER DEFAULT 0,
    UNIQUE (fighter_id, opponent, event, event_date)
);

-- ==============================================================================
-- 3. OUTRAS TABELAS ESSENCIAIS
-- ==============================================================================

-- ACADEMIAS
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

-- POSTS DO FEED
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

-- CURTIDAS
CREATE TABLE IF NOT EXISTS public.post_likes (
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(post_id, user_id)
);

-- COMENTÁRIOS
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEGUIDORES
CREATE TABLE IF NOT EXISTS public.user_followers (
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

-- NOTIFICAÇÕES
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

-- ATIVIDADES (CHECK-INS)
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

-- DESAFIOS
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

-- ==============================================================================
-- 4. ÍNDICES PARA PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);
CREATE INDEX IF NOT EXISTS idx_profiles_sherdog_id ON public.profiles (sherdog_id);
CREATE INDEX IF NOT EXISTS idx_fighters_name ON public.fighters (name);
CREATE INDEX IF NOT EXISTS idx_fighters_sherdog_id ON public.fighters (sherdog_id);
CREATE INDEX IF NOT EXISTS idx_fighters_weight_class ON public.fighters (weight_class);
CREATE INDEX IF NOT EXISTS idx_fights_fighter_id ON public.fights (fighter_id);
CREATE INDEX IF NOT EXISTS idx_fights_opponent ON public.fights (opponent);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts (author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications (recipient_id);

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fighters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combat_challenges ENABLE ROW LEVEL SECURITY;

-- Políticas de Profiles
DROP POLICY IF EXISTS "Perfis são legíveis publicamente" ON public.profiles;
CREATE POLICY "Perfis são legíveis publicamente"
    ON public.profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Usuários podem inserir seus próprios perfis" ON public.profiles;
CREATE POLICY "Usuários podem inserir seus próprios perfis"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON public.profiles;
CREATE POLICY "Usuários podem atualizar seus próprios perfis"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Políticas de Fighters (público)
DROP POLICY IF EXISTS "Registros de lutadores sao legiveis publicamente" ON public.fighters;
CREATE POLICY "Registros de lutadores sao legiveis publicamente"
    ON public.fighters FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Historico de lutas e legivel publicamente" ON public.fights;
CREATE POLICY "Historico de lutas e legivel publicamente"
    ON public.fights FOR SELECT
    USING (true);

-- Políticas de Academias
DROP POLICY IF EXISTS "Academias são legíveis publicamente" ON public.academies;
CREATE POLICY "Academias são legíveis publicamente"
    ON public.academies FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Donos gerenciam suas academias" ON public.academies;
CREATE POLICY "Donos gerenciam suas academias"
    ON public.academies FOR ALL
    USING (auth.uid() = owner_id);

-- Políticas de Posts
DROP POLICY IF EXISTS "Posts são legíveis por todos" ON public.posts;
CREATE POLICY "Posts são legíveis por todos"
    ON public.posts FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Usuários autenticados criam posts" ON public.posts;
CREATE POLICY "Usuários autenticados criam posts"
    ON public.posts FOR INSERT
    WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Autores podem atualizar ou excluir seus posts" ON public.posts;
CREATE POLICY "Autores podem atualizar ou excluir seus posts"
    ON public.posts FOR ALL
    USING (auth.uid() = author_id);

-- Políticas de Likes
DROP POLICY IF EXISTS "Qualquer um pode ver curtidas" ON public.post_likes;
CREATE POLICY "Qualquer um pode ver curtidas"
    ON public.post_likes FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Usuários podem curtir posts" ON public.post_likes;
CREATE POLICY "Usuários podem curtir posts"
    ON public.post_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem descurtir seus próprios likes" ON public.post_likes;
CREATE POLICY "Usuários podem descurtir seus próprios likes"
    ON public.post_likes FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas de Comentários
DROP POLICY IF EXISTS "Qualquer um pode ver comentários" ON public.post_comments;
CREATE POLICY "Qualquer um pode ver comentários"
    ON public.post_comments FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Usuários podem comentar" ON public.post_comments;
CREATE POLICY "Usuários podem comentar"
    ON public.post_comments FOR INSERT
    WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Autores podem deletar seus comentários" ON public.post_comments;
CREATE POLICY "Autores podem deletar seus comentários"
    ON public.post_comments FOR DELETE
    USING (auth.uid() = author_id);

-- Políticas de Seguidores
DROP POLICY IF EXISTS "Qualquer um pode ver seguidores" ON public.user_followers;
CREATE POLICY "Qualquer um pode ver seguidores"
    ON public.user_followers FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Usuários podem seguir outros" ON public.user_followers;
CREATE POLICY "Usuários podem seguir outros"
    ON public.user_followers FOR INSERT
    WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Usuários podem deixar de seguir" ON public.user_followers;
CREATE POLICY "Usuários podem deixar de seguir"
    ON public.user_followers FOR DELETE
    USING (auth.uid() = follower_id);

-- Políticas de Notificações
DROP POLICY IF EXISTS "Usuários veem suas próprias notificações" ON public.notifications;
CREATE POLICY "Usuários veem suas próprias notificações"
    ON public.notifications FOR SELECT
    USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Sistema pode criar notificações" ON public.notifications;
CREATE POLICY "Sistema pode criar notificações"
    ON public.notifications FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários podem marcar suas notificações como lidas" ON public.notifications;
CREATE POLICY "Usuários podem marcar suas notificações como lidas"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = recipient_id);

-- Políticas de Atividades
DROP POLICY IF EXISTS "Usuários veem atividades públicas" ON public.activities;
CREATE POLICY "Usuários veem atividades públicas"
    ON public.activities FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Usuários podem criar suas próprias atividades" ON public.activities;
CREATE POLICY "Usuários podem criar suas próprias atividades"
    ON public.activities FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Políticas de Desafios
DROP POLICY IF EXISTS "Usuários veem desafios envolvendo eles" ON public.combat_challenges;
CREATE POLICY "Usuários veem desafios envolvendo eles"
    ON public.combat_challenges FOR SELECT
    USING (auth.uid() = challenger_id OR auth.uid() = target_id);

DROP POLICY IF EXISTS "Usuários podem criar desafios" ON public.combat_challenges;
CREATE POLICY "Usuários podem criar desafios"
    ON public.combat_challenges FOR INSERT
    WITH CHECK (auth.uid() = challenger_id);

DROP POLICY IF EXISTS "Participantes podem atualizar desafios" ON public.combat_challenges;
CREATE POLICY "Participantes podem atualizar desafios"
    ON public.combat_challenges FOR UPDATE
    USING (auth.uid() = challenger_id OR auth.uid() = target_id);

-- ==============================================================================
-- 6. TRIGGERS E FUNÇÕES
-- ==============================================================================

-- Trigger: updated_at automático nos lutadores
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_fighters_updated_at ON public.fighters;
CREATE TRIGGER trg_fighters_updated_at 
    BEFORE UPDATE ON public.fighters
    FOR EACH ROW 
    EXECUTE FUNCTION public.set_updated_at();

-- Trigger: Sincroniza novo usuário (auth.users -> profiles)
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
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 7. STORAGE BUCKETS (para fotos de perfil, posts, etc)
-- ==============================================================================

-- Cria buckets se não existirem
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('avatars', 'avatars', true),
    ('covers', 'covers', true),
    ('posts', 'posts', true),
    ('stories', 'stories', true),
    ('reels', 'reels', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage: qualquer usuário autenticado pode fazer upload
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de avatars" ON storage.objects;
CREATE POLICY "Usuários autenticados podem fazer upload de avatars"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatars são públicos" ON storage.objects;
CREATE POLICY "Avatars são públicos"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de covers" ON storage.objects;
CREATE POLICY "Usuários autenticados podem fazer upload de covers"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'covers');

DROP POLICY IF EXISTS "Covers são públicos" ON storage.objects;
CREATE POLICY "Covers são públicos"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'covers');

DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de posts" ON storage.objects;
CREATE POLICY "Usuários autenticados podem fazer upload de posts"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'posts');

DROP POLICY IF EXISTS "Posts são públicos" ON storage.objects;
CREATE POLICY "Posts são públicos"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'posts');

-- ==============================================================================
-- PRONTO! Estrutura completa criada com sucesso.
-- ==============================================================================
