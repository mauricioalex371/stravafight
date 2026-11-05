-- ========================================
-- ADICIONAR CAMPO EMAIL NA TABELA PROFILES
-- ========================================

-- 1. Adicionar coluna email se não existir
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Criar índice para busca rápida por email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 3. Permitir inserção direta na tabela profiles (bypass Auth)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Ou se preferir manter RLS mas permitir inserção anônima:
DROP POLICY IF EXISTS "Permitir inserção pública" ON profiles;
CREATE POLICY "Permitir inserção pública" ON profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura pública" ON profiles;
CREATE POLICY "Permitir leitura pública" ON profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 4. Verificar
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'email';
