-- ==============================================================================
-- CRIAR POSTS E REELS SEM USUÁRIO (SOLUÇÃO TEMPORÁRIA)
-- Este SQL desabilita temporariamente a constraint de foreign key
-- ==============================================================================

-- AVISO: Use apenas em desenvolvimento/staging
-- Em produção, sempre crie o usuário via signup normal

-- 1. Criar um UUID fake para usar como author_id
DO $$
DECLARE
  fake_user_id UUID := '00000000-0000-0000-0000-000000000001'::UUID;
BEGIN
  -- Inserir perfil fake (sem validação de auth.users)
  ALTER TABLE profiles DISABLE TRIGGER ALL;
  
  INSERT INTO profiles (
    id, username, full_name, avatar_url, role, location, 
    is_verified, created_at
  ) VALUES (
    fake_user_id,
    'stravafight_demo',
    'STRAVA FIGHT Demo',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    'Atleta',
    'Brasil',
    true,
    NOW()
  ) ON CONFLICT (id) DO NOTHING;
  
  ALTER TABLE profiles ENABLE TRIGGER ALL;

  -- 2. CRIAR POSTS
  INSERT INTO posts (author_id, caption, media_url, media_type, modality, hashtags, likes_count, comments_count, created_at)
  VALUES
    -- Post 1
    (fake_user_id, '🥋 Treino intenso de Jiu-Jitsu hoje! #JiuJitsu #BJJ', 
     'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800', 'image', 'Jiu-Jitsu',
     ARRAY['jiujitsu', 'bjj'], 24, 5, NOW() - INTERVAL '2 hours'),
    
    -- Post 2
    (fake_user_id, '💥 Sparring de Muay Thai foi INSANO! #MuayThai', 
     'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800', 'image', 'Muay Thai',
     ARRAY['muaythai', 'sparring'], 38, 9, NOW() - INTERVAL '5 hours'),
    
    -- Post 3
    (fake_user_id, '🔺 Finalização perfeita! Triângulo é minha queda #BJJ', 
     'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800', 'image', 'Jiu-Jitsu',
     ARRAY['bjj', 'submissions'], 52, 12, NOW() - INTERVAL '8 hours'),
    
    -- Post 4
    (fake_user_id, '🥊 Combinações no saco pesado! #Boxing #Power', 
     'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800', 'image', 'Muay Thai',
     ARRAY['boxing', 'power'], 31, 7, NOW() - INTERVAL '1 day'),
    
    -- Post 5
    (fake_user_id, '🤼 Queda dupla no wrestling! #Wrestling #Grappling', 
     'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800', 'image', 'Jiu-Jitsu',
     ARRAY['wrestling', 'grappling'], 29, 6, NOW() - INTERVAL '1 day 5 hours');

  -- 3. CRIAR REELS
  INSERT INTO reels (author_id, caption, video_url, hashtags, likes_count, comments_count, shares_count, created_at)
  VALUES
    -- Reel 1
    (fake_user_id, '🥊 Combo devastador! #MMA #Combo', 
     'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
     ARRAY['mma', 'combo'], 73, 18, 9, NOW() - INTERVAL '6 hours'),
    
    -- Reel 2
    (fake_user_id, '🔺 Triângulo voador! #BJJ #Flying', 
     'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800',
     ARRAY['bjj', 'flying'], 124, 31, 22, NOW() - INTERVAL '1 day'),
    
    -- Reel 3
    (fake_user_id, '💥 High kick giratório! #MuayThai', 
     'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800',
     ARRAY['muaythai', 'highkick'], 89, 24, 14, NOW() - INTERVAL '2 days');

END $$;

-- Verificar
SELECT COUNT(*) as total_posts FROM posts;
SELECT COUNT(*) as total_reels FROM reels;

-- ==============================================================================
-- ✅ 5 POSTS + 3 REELS CRIADOS
-- ==============================================================================
