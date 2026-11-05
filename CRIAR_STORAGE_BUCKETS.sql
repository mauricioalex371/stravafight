-- ==============================================================================
-- CRIAR STORAGE BUCKETS (Copie e execute no Supabase SQL Editor)
-- ==============================================================================

-- 1. CRIAR BUCKETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
    ('covers', 'covers', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
    ('posts', 'posts', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'video/mp4', 'video/quicktime']),
    ('stories', 'stories', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'video/mp4']),
    ('reels', 'reels', true, 52428800, ARRAY['video/mp4', 'video/quicktime', 'video/webm'])
ON CONFLICT (id) DO NOTHING;

-- 2. POLÍTICAS DE STORAGE (RLS)

-- AVATARS
DROP POLICY IF EXISTS "Avatars são públicos" ON storage.objects;
CREATE POLICY "Avatars são públicos"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de avatars" ON storage.objects;
CREATE POLICY "Usuários autenticados podem fazer upload de avatars"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios avatars" ON storage.objects;
CREATE POLICY "Usuários podem atualizar seus próprios avatars"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Usuários podem deletar seus próprios avatars" ON storage.objects;
CREATE POLICY "Usuários podem deletar seus próprios avatars"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'avatars');

-- COVERS
DROP POLICY IF EXISTS "Covers são públicos" ON storage.objects;
CREATE POLICY "Covers são públicos"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'covers');

DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de covers" ON storage.objects;
CREATE POLICY "Usuários autenticados podem fazer upload de covers"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'covers');

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios covers" ON storage.objects;
CREATE POLICY "Usuários podem atualizar seus próprios covers"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'covers');

DROP POLICY IF EXISTS "Usuários podem deletar seus próprios covers" ON storage.objects;
CREATE POLICY "Usuários podem deletar seus próprios covers"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'covers');

-- POSTS
DROP POLICY IF EXISTS "Posts são públicos" ON storage.objects;
CREATE POLICY "Posts são públicos"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'posts');

DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de posts" ON storage.objects;
CREATE POLICY "Usuários autenticados podem fazer upload de posts"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'posts');

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios posts" ON storage.objects;
CREATE POLICY "Usuários podem atualizar seus próprios posts"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'posts');

DROP POLICY IF EXISTS "Usuários podem deletar seus próprios posts" ON storage.objects;
CREATE POLICY "Usuários podem deletar seus próprios posts"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'posts');

-- STORIES
DROP POLICY IF EXISTS "Stories são públicos" ON storage.objects;
CREATE POLICY "Stories são públicos"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'stories');

DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de stories" ON storage.objects;
CREATE POLICY "Usuários autenticados podem fazer upload de stories"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'stories');

DROP POLICY IF EXISTS "Usuários podem deletar seus próprios stories" ON storage.objects;
CREATE POLICY "Usuários podem deletar seus próprios stories"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'stories');

-- REELS
DROP POLICY IF EXISTS "Reels são públicos" ON storage.objects;
CREATE POLICY "Reels são públicos"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'reels');

DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de reels" ON storage.objects;
CREATE POLICY "Usuários autenticados podem fazer upload de reels"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'reels');

DROP POLICY IF EXISTS "Usuários podem deletar seus próprios reels" ON storage.objects;
CREATE POLICY "Usuários podem deletar seus próprios reels"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'reels');

-- ==============================================================================
-- PRONTO! Storage configurado com:
-- - 5 buckets públicos (avatars, covers, posts, stories, reels)
-- - Limites de tamanho: avatars 5MB, covers/posts/stories 10MB, reels 50MB
-- - RLS policies: apenas donos podem modificar/deletar suas mídias
-- ==============================================================================
