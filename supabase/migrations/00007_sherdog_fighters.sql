-- ==============================================================================
-- 00007 — REGISTRO DE LUTADORES DO SHERDOG
-- Cria as tabelas de lutadores e histórico de lutas e liga o perfil do lead
-- ao registro dele no Sherdog. Os dados são populados pelo motor Python
-- (sherdog-engine/backfill.py) que escreve com a service role do Supabase.
-- A UI lê via SELECT público.
-- ==============================================================================

-- 1. LUTADORES (perfil + cartel)
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
CREATE INDEX IF NOT EXISTS idx_fighters_name ON public.fighters (name);
CREATE INDEX IF NOT EXISTS idx_fighters_weight_class ON public.fighters (weight_class);

-- 2. HISTÓRICO DE LUTAS
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
CREATE INDEX IF NOT EXISTS idx_fights_fighter_id ON public.fights (fighter_id);
CREATE INDEX IF NOT EXISTS idx_fights_opponent ON public.fights (opponent);

-- 3. LIGAÇÃO DO PERFIL DO LEAD AO SHERDOG DELE
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS sherdog_url TEXT,
    ADD COLUMN IF NOT EXISTS sherdog_id BIGINT;
CREATE INDEX IF NOT EXISTS idx_profiles_sherdog_id ON public.profiles (sherdog_id);

-- 4. ROW LEVEL SECURITY
ALTER TABLE public.fighters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fights ENABLE ROW LEVEL SECURITY;

-- Registros de lutadores são públicos (qualquer um pode ver cartel/histórico)
CREATE POLICY "Registros de lutadores sao legiveis publicamente"
    ON public.fighters FOR SELECT USING (true);
CREATE POLICY "Historico de lutas e legivel publicamente"
    ON public.fights FOR SELECT USING (true);
-- Escrita só via service role (backfill) — sem política pública de insert/update.

-- 5. updated_at automático nos lutadores
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_fighters_updated_at ON public.fighters;
CREATE TRIGGER trg_fighters_updated_at BEFORE UPDATE ON public.fighters
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
