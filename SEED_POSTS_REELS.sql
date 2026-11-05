-- ==============================================================================
-- POPULAR BANCO COM POSTS E REELS
-- Execute este SQL no Supabase SQL Editor
-- ==============================================================================

-- NOTA: Substitua 'USER_ID_DO_ALEXLIMA' pelo ID real do @alexlima
-- Para pegar o ID, execute: SELECT id FROM profiles WHERE username = 'alexlima';

-- Exemplo de ID (UUID): '123e4567-e89b-12d3-a456-426614174000'

-- ==============================================================================
-- POSTS PARA O FEED
-- ==============================================================================

-- Post 1
INSERT INTO posts (author_id, caption, media_url, media_type, modality, hashtags, likes_count, comments_count)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima'),
  '🥋 Treino intenso de Jiu-Jitsu hoje! Focando em transições e finalizações. OSS! #JiuJitsu #BJJ #Treino',
  'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800',
  'image',
  'Jiu-Jitsu',
  ARRAY['jiujitsu', 'bjj', 'treino', 'oss'],
  12,
  3
);

-- Post 2
INSERT INTO posts (author_id, caption, media_url, media_type, modality, hashtags, likes_count, comments_count)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima'),
  '💪 Sparring de Muay Thai! Trabalhando chutes e joelhadas. Foco total! #MuayThai #Treino #Luta',
  'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800',
  'image',
  'Muay Thai',
  ARRAY['muaythai', 'treino', 'luta'],
  25,
  7
);

-- Post 3
INSERT INTO posts (author_id, caption, media_url, media_type, modality, hashtags, likes_count, comments_count)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima'),
  '🔥 Finalização perfeita no treino! Triângulo é minha queda favorita 🔺 #BJJ #Submissions',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
  'image',
  'Jiu-Jitsu',
  ARRAY['bjj', 'submissions', 'jiujitsu'],
  31,
  8
);

-- Post 4
INSERT INTO posts (author_id, caption, media_url, media_type, modality, hashtags, likes_count, comments_count)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima'),
  '🥊 Combinações de socos no saco! Velocidade e potência. #Boxing #Treino #Power',
  'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800',
  'image',
  'Muay Thai',
  ARRAY['boxing', 'treino', 'power'],
  18,
  4
);

-- Post 5
INSERT INTO posts (author_id, caption, media_url, media_type, modality, hashtags, likes_count, comments_count)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima'),
  '💥 Queda dupla no treino de wrestling! Técnica é fundamental. #Wrestling #Grappling',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
  'image',
  'Jiu-Jitsu',
  ARRAY['wrestling', 'grappling', 'takedown'],
  22,
  5
);

-- Post 6
INSERT INTO posts (author_id, caption, media_url, media_type, modality, hashtags, likes_count, comments_count)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima'),
  '🔵 Evolução constante! Cada treino é um aprendizado. OSS! #JiuJitsu #Evolução',
  'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800',
  'image',
  'Jiu-Jitsu',
  ARRAY['jiujitsu', 'evolucao', 'oss'],
  15,
  2
);

-- Post 7
INSERT INTO posts (author_id, caption, media_url, media_type, modality, hashtags, likes_count, comments_count)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima'),
  '🦶 Low kick certeiro! Treino de Muay Thai foi demais hoje. #MuayThai #Kicks',
  'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800',
  'image',
  'Muay Thai',
  ARRAY['muaythai', 'kicks', 'lowkick'],
  28,
  6
);

-- Post 8
INSERT INTO posts (author_id, caption, media_url, media_type, modality, hashtags, likes_count, comments_count)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima'),
  '🥋 Raspagem perfeita da meia-guarda! Técnica limpa. #BJJ #Technique',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
  'image',
  'Jiu-Jitsu',
  ARRAY['bjj', 'technique', 'sweep'],
  20,
  4
);

-- Post 9
INSERT INTO posts (author_id, caption, media_url, media_type, modality, hashtags, likes_count, comments_count)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima'),
  '💪 Força e técnica andam juntas! Treino pesado hoje. #Treino #Force #BJJ',
  'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800',
  'image',
  'Jiu-Jitsu',
  ARRAY['treino', 'force', 'bjj'],
  19,
  3
);

-- Post 10
INSERT INTO posts (author_id, caption, media_url, media_type, modality, hashtags, likes_count, comments_count)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima'),
  '🔥 Sequência de socos e chutes! Treino completo de MMA. #MMA #Training',
  'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800',
  'image',
  'Muay Thai',
  ARRAY['mma', 'training', 'combo'],
  35,
  9
);

-- ==============================================================================
-- REELS PARA A ABA DE VÍDEOS
-- ==============================================================================

-- Reel 1
INSERT INTO reels (author_id, caption, video_url, hashtags, likes_count, comments_count, shares_count)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima'),
  '🥊 Combo devastador! Jab + cruzado + low kick #MMA #Combo',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
  ARRAY['mma', 'combo', 'knockout'],
  42,
  11,
  5
);

-- Reel 2
INSERT INTO reels (author_id, caption, video_url, hashtags, likes_count, comments_count, shares_count)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima'),
  '🔺 Triângulo voador! Quem quer tentar? #BJJ #Flying',
  'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800',
  ARRAY['bjj', 'flying', 'submission'],
  67,
  18,
  12
);

-- Reel 3
INSERT INTO reels (author_id, caption, video_url, hashtags, likes_count, comments_count, shares_count)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima'),
  '💥 High kick giratório! Treino de Muay Thai #MuayThai',
  'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800',
  ARRAY['muaythai', 'highkick', 'power'],
  51,
  14,
  8
);

-- Reel 4
INSERT INTO reels (author_id, caption, video_url, hashtags, likes_count, comments_count, shares_count)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima'),
  '🤼 Queda dupla + passagem de guarda #Wrestling #BJJ',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
  ARRAY['wrestling', 'bjj', 'takedown'],
  38,
  9,
  4
);

-- Reel 5
INSERT INTO reels (author_id, caption, video_url, hashtags, likes_count, comments_count, shares_count)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima'),
  '🔥 Finalização relâmpago! Mata-leão perfeito #BJJ',
  'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800',
  ARRAY['bjj', 'choke', 'submission'],
  73,
  21,
  15
);

-- ==============================================================================
-- VERIFICAR SE FOI CRIADO
-- ==============================================================================

-- Contar posts criados
SELECT COUNT(*) as total_posts FROM posts;

-- Contar reels criados
SELECT COUNT(*) as total_reels FROM reels;

-- Ver posts recentes
SELECT 
  p.caption,
  pr.username,
  p.likes_count,
  p.comments_count,
  p.created_at
FROM posts p
JOIN profiles pr ON p.author_id = pr.id
ORDER BY p.created_at DESC
LIMIT 5;

-- ==============================================================================
-- PRONTO! 10 POSTS + 5 REELS CRIADOS
-- ==============================================================================
