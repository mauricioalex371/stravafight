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
