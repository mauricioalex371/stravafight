-- ==============================================================================
-- POPULAR FEED E REELS - STRAVA FIGHT
-- Execute no Supabase SQL Editor
-- ==============================================================================

-- ==============================================================================
-- POSTS PARA O FEED (10 posts variados)
-- ==============================================================================

-- Post 1: Treino de Jiu-Jitsu
INSERT INTO posts (author_id, caption, media_url, media_type, modality, hashtags, likes_count, comments_count, created_at)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima' LIMIT 1),
  '🥋 Treino intenso de Jiu-Jitsu hoje! Focando em transições de guarda e finalizações. A evolução é constante, cada dia um aprendizado novo. OSS! 💪 #JiuJitsu #BJJ #Treino #OSS',
  'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&q=80',
  'image',
  'Jiu-Jitsu',
  ARRAY['jiujitsu', 'bjj', 'treino', 'oss', 'guardawork'],
  24,
  5,
  NOW() - INTERVAL '2 hours'
);

-- Post 2: Sparring de Muay Thai
INSERT INTO posts (author_id, caption, media_url, media_type, modality, hashtags, likes_count, comments_count, created_at)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima' LIMIT 1),
  '💥 Sparring de Muay Thai foi INSANO hoje! Trabalhando chutes, joelhadas e clinch. Quanto mais treina, mais percebe que tem que aprender. Foco total! 🔥 #MuayThai #Treino #Sparring',
  'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=80',
  'image',
  'Muay Thai',
  ARRAY['muaythai', 'treino', 'sparring', 'kickboxing'],
  38,
  9,
  NOW() - INTERVAL '5 hours'
);

-- Post 3: Finalização perfeita
INSERT INTO posts (author_id, caption, media_url, media_type, modality, hashtags, likes_count, comments_count, created_at)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima' LIMIT 1),
  '🔺 Finalização perfeita no treino! Triângulo é minha queda favorita, essa pegou certinho. Técnica + timing = sucesso 🎯 #BJJ #Submissions #Triangle',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
  'image',
  'Jiu-Jitsu',
  ARRAY['bjj', 'submissions', 'triangle', 'jiujitsu', 'finalizacao'],
  52,
  12,
  NOW() - INTERVAL '8 hours'
);

-- Post 4: Combos no saco
INSERT INTO posts (author_id, caption, media_url, media_type, modality, hashtags, likes_count, comments_count, created_at)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima' LIMIT 1),
  '🥊 Combinações de socos no saco pesado! Jab, cruzado, gancho... velocidade e potência precisam andar juntas. Treino de striking é fundamental! ⚡ #Boxing #Striking #Power',
  'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=80',
  'image',
  'Muay Thai',
  ARRAY['boxing', 'striking', 'power', 'combos', 'training'],
  31,
  7,
  NOW() - INTERVAL '1 day'
);

-- Post 5: Queda dupla
INSERT INTO posts (author_id, caption, media_url, media_type, modality, hashtags, likes_count, comments_count, created_at)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima' LIMIT 1),
  '🤼 Queda dupla no treino de wrestling! Base sólida é essencial para o Jiu-Jitsu. Quem domina as quedas, domina a luta. 💯 #Wrestling #Grappling #Takedown',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
  'image',
  'Jiu-Jitsu',
  ARRAY['wrestling', 'grappling', 'takedown', 'bjj', 'quedas'],
  29,
  6,
  NOW() - INTERVAL '1 day 5 hours'
);

-- Post 6: Evolução constante
INSERT INTO posts (author_id, caption, media_url, media_type, modality, hashtags, likes_count, comments_count, created_at)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima' LIMIT 1),
  '🔵 Evolução constante! Faixa branca hoje, mas trabalhando todo dia para evoluir. Cada treino é um aprendizado, cada rola uma lição. A jornada é longa mas vale muito! OSS! 🙏 #JiuJitsu #Evolução #NeverGiveUp',
  'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&q=80',
  'image',
  'Jiu-Jitsu',
  ARRAY['jiujitsu', 'evolucao', 'oss', 'nevergiveup', 'whitebelt'],
  27,
  4,
  NOW() - INTERVAL '2 days'
);

-- Post 7: Low kick
INSERT INTO posts (author_id, caption, media_url, media_type, modality, hashtags, likes_count, comments_count, created_at)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima' LIMIT 1),
  '🦶 Low kick certeiro! Treino de Muay Thai foi demais hoje, professor mandou 100 chutes na perna. Amanhã vai doer mas vale a pena! 😅💪 #MuayThai #LowKick #ThaiBoxing',
  'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=80',
  'image',
  'Muay Thai',
  ARRAY['muaythai', 'lowkick', 'thaiboxing', 'kicks', 'treino'],
  45,
  11,
  NOW() - INTERVAL '2 days 8 hours'
);

-- Post 8: Raspagem da guarda
INSERT INTO posts (author_id, caption, media_url, media_type, modality, hashtags, likes_count, comments_count, created_at)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima' LIMIT 1),
  '🥋 Raspagem perfeita da meia-guarda! Técnica limpa que aprendi hoje no treino. Guardeiro sempre acha um jeito! 🔄 #BJJ #Technique #HalfGuard',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
  'image',
  'Jiu-Jitsu',
  ARRAY['bjj', 'technique', 'halfguard', 'sweep', 'jiujitsu'],
  33,
  8,
  NOW() - INTERVAL '3 days'
);

-- Post 9: Força e técnica
INSERT INTO posts (author_id, caption, media_url, media_type, modality, hashtags, likes_count, comments_count, created_at)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima' LIMIT 1),
  '💪 Força e técnica andam juntas! Treino pesado hoje, mas sempre respeitando a técnica. Não adianta força bruta sem fundamento. Evolução é o caminho! 📈 #Treino #Force #BJJ',
  'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&q=80',
  'image',
  'Jiu-Jitsu',
  ARRAY['treino', 'force', 'bjj', 'technique', 'evolution'],
  28,
  5,
  NOW() - INTERVAL '3 days 12 hours'
);

-- Post 10: Sequência completa
INSERT INTO posts (author_id, caption, media_url, media_type, modality, hashtags, likes_count, comments_count, created_at)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima' LIMIT 1),
  '🔥 Sequência de socos, chutes e joelhadas! Treino completo de MMA style. Misturando tudo que aprendi no Jiu-Jitsu e Muay Thai. É isso que faz a diferença! 🥊🥋 #MMA #Training #Complete',
  'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=80',
  'image',
  'Muay Thai',
  ARRAY['mma', 'training', 'complete', 'combo', 'fight'],
  61,
  15,
  NOW() - INTERVAL '4 days'
);

-- ==============================================================================
-- REELS PARA ABA DE VÍDEOS (5 reels)
-- ==============================================================================

-- Reel 1: Combo devastador
INSERT INTO reels (author_id, caption, video_url, hashtags, likes_count, comments_count, shares_count, created_at)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima' LIMIT 1),
  '🥊 Combo devastador! Jab + cruzado + gancho + low kick. Treino de striking pesado! Quem aguenta? 💥 #MMA #Combo #Striking',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
  ARRAY['mma', 'combo', 'striking', 'knockout', 'boxing'],
  73,
  18,
  9,
  NOW() - INTERVAL '6 hours'
);

-- Reel 2: Triângulo voador
INSERT INTO reels (author_id, caption, video_url, hashtags, likes_count, comments_count, shares_count, created_at)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima' LIMIT 1),
  '🔺 Triângulo voador! Técnica arriscada mas quando pega... ACABOU! Quem quer tentar? 😎 #BJJ #Flying #Triangle',
  'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&q=80',
  ARRAY['bjj', 'flying', 'triangle', 'submission', 'jiujitsu'],
  124,
  31,
  22,
  NOW() - INTERVAL '1 day'
);

-- Reel 3: High kick giratório
INSERT INTO reels (author_id, caption, video_url, hashtags, likes_count, comments_count, shares_count, created_at)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima' LIMIT 1),
  '💥 High kick giratório no saco! Velocidade + potência = nocaute! Treino de Muay Thai foi brutal! 🌪️ #MuayThai #HighKick #Power',
  'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=80',
  ARRAY['muaythai', 'highkick', 'power', 'spinning', 'knockout'],
  89,
  24,
  14,
  NOW() - INTERVAL '2 days'
);

-- Reel 4: Queda + passagem
INSERT INTO reels (author_id, caption, video_url, hashtags, likes_count, comments_count, shares_count, created_at)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima' LIMIT 1),
  '🤼 Queda dupla direto pra passagem de guarda! Fluxo perfeito do wrestling pro Jiu-Jitsu. É tudo conectado! 🔄 #Wrestling #BJJ #Flow',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
  ARRAY['wrestling', 'bjj', 'flow', 'takedown', 'passagem'],
  67,
  16,
  8,
  NOW() - INTERVAL '3 days'
);

-- Reel 5: Mata-leão relâmpago
INSERT INTO reels (author_id, caption, video_url, hashtags, likes_count, comments_count, shares_count, created_at)
VALUES (
  (SELECT id FROM profiles WHERE username = 'alexlima' LIMIT 1),
  '🔥 Finalização relâmpago! Pegou as costas, encaixou o mata-leão e... PAM! Dormiu! A finalização mais clássica do Jiu-Jitsu! 😴 #BJJ #RearNakedChoke #Submission',
  'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&q=80',
  ARRAY['bjj', 'choke', 'submission', 'rearnakedchoke', 'finalizacao'],
  142,
  37,
  28,
  NOW() - INTERVAL '4 days'
);

-- ==============================================================================
-- ATUALIZAR CONTADOR DE POSTS DO USUÁRIO
-- ==============================================================================

UPDATE profiles 
SET posts_count = (SELECT COUNT(*) FROM posts WHERE author_id = profiles.id)
WHERE username = 'alexlima';

-- ==============================================================================
-- VERIFICAR SE FOI CRIADO
-- ==============================================================================

-- Contar posts e reels criados
SELECT 
  (SELECT COUNT(*) FROM posts WHERE author_id = (SELECT id FROM profiles WHERE username = 'alexlima' LIMIT 1)) as total_posts,
  (SELECT COUNT(*) FROM reels WHERE author_id = (SELECT id FROM profiles WHERE username = 'alexlima' LIMIT 1)) as total_reels;

-- Ver posts mais recentes
SELECT 
  substring(caption, 1, 50) || '...' as caption_preview,
  likes_count,
  comments_count,
  modality,
  created_at
FROM posts
ORDER BY created_at DESC
LIMIT 5;

-- Ver reels mais curtidos
SELECT 
  substring(caption, 1, 50) || '...' as caption_preview,
  likes_count,
  shares_count,
  created_at
FROM reels
ORDER BY likes_count DESC
LIMIT 5;

-- ==============================================================================
-- ✅ PRONTO! 10 POSTS + 5 REELS CRIADOS
-- Feed completo e pronto para impressionar!
-- ==============================================================================
