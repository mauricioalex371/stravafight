// Criar usuários, posts e reels de teste
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const users = [
  {
    email: 'mestre.uarlei@stravafight.com',
    password: 'Senha123!',
    username: 'mestre_uarlei',
    full_name: 'Mestre Uarlei Silva',
    role: 'Professor',
    location: 'São Paulo, SP',
    bio: '🥋 Faixa Preta 3º Dan | Professor de Jiu-Jitsu | UBF Team',
    modalities: [
      { modality: 'Jiu-Jitsu', belt: 'Faixa Preta 3º Dan' },
      { modality: 'MMA', belt: 'Treinador' }
    ],
    affiliated_academy_name: 'UBF Team Parque Indiano',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    is_verified: true
  },
  {
    email: 'amanda.souza@stravafight.com',
    password: 'Senha123!',
    username: 'amanda_bjj',
    full_name: 'Amanda Souza',
    role: 'Atleta',
    location: 'Rio de Janeiro, RJ',
    bio: '💪 Faixa Roxa de Jiu-Jitsu | Competidora | Paixão pelo tatame',
    modalities: [{ modality: 'Jiu-Jitsu', belt: 'Faixa Roxa' }],
    affiliated_academy_name: 'Gracie Barra',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
    is_verified: true
  },
  {
    email: 'carlos.silva@stravafight.com',
    password: 'Senha123!',
    username: 'carlos_mma',
    full_name: 'Carlos Gracie Silva',
    role: 'Atleta Profissional',
    location: 'São Paulo, SP',
    bio: '🥊 Lutador de MMA Profissional | Faixa Preta de Jiu-Jitsu',
    modalities: [
      { modality: 'MMA', belt: 'Profissional' },
      { modality: 'Jiu-Jitsu', belt: 'Faixa Preta' }
    ],
    affiliated_academy_name: 'American Top Team',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
    is_verified: true
  },
  {
    email: 'beatriz.lima@stravafight.com',
    password: 'Senha123!',
    username: 'beatriz_thai',
    full_name: 'Beatriz Lima',
    role: 'Atleta',
    location: 'Belo Horizonte, MG',
    bio: '🔥 Muay Thai | Kruang Vermelho | 3x Campeã Estadual',
    modalities: [{ modality: 'Muay Thai', belt: 'Kruang Vermelho' }],
    affiliated_academy_name: 'Tiger Muay Thai BH',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300',
    is_verified: false
  },
  {
    email: 'diego.santos@stravafight.com',
    password: 'Senha123!',
    username: 'diego_wrestler',
    full_name: 'Diego Santos',
    role: 'Atleta',
    location: 'Curitiba, PR',
    bio: '🤼 Wrestling & No-Gi | Atleta Nacional | Foco total',
    modalities: [
      { modality: 'Wrestling', belt: 'Atleta Nacional' },
      { modality: 'Jiu-Jitsu No-Gi', belt: 'Faixa Preta' }
    ],
    affiliated_academy_name: 'Alliance Curitiba',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300',
    is_verified: false
  },
  {
    email: 'fernanda.costa@stravafight.com',
    password: 'Senha123!',
    username: 'fernanda_boxer',
    full_name: 'Fernanda Costa',
    role: 'Atleta',
    location: 'Salvador, BA',
    bio: '🥊 Boxe Olímpico | Medalhista Pan-Americano | Treino é vida',
    modalities: [{ modality: 'Boxe', belt: 'Atleta Olímpico' }],
    affiliated_academy_name: 'Boxing Academy Salvador',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
    is_verified: true
  },
  {
    email: 'rafael.oliveira@stravafight.com',
    password: 'Senha123!',
    username: 'rafael_judoka',
    full_name: 'Rafael Oliveira',
    role: 'Professor',
    location: 'Porto Alegre, RS',
    bio: '🥋 Faixa Preta de Judô | Professor há 15 anos | Formando campeões',
    modalities: [{ modality: 'Judô', belt: 'Faixa Preta 2º Dan' }],
    affiliated_academy_name: 'Instituto Judô RS',
    avatar_url: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=300',
    is_verified: true
  },
  {
    email: 'julia.mendes@stravafight.com',
    password: 'Senha123!',
    username: 'julia_kickboxer',
    full_name: 'Júlia Mendes',
    role: 'Atleta',
    location: 'Brasília, DF',
    bio: '💥 Kickboxing | K-1 Style | Campeã Sul-Americana 2023',
    modalities: [{ modality: 'Kickboxing', belt: 'Profissional' }],
    affiliated_academy_name: 'Fight Zone BSB',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300',
    is_verified: false
  },
  {
    email: 'thiago.alves@stravafight.com',
    password: 'Senha123!',
    username: 'thiago_bjj',
    full_name: 'Thiago Alves',
    role: 'Atleta',
    location: 'Recife, PE',
    bio: '🔵 Faixa Azul de Jiu-Jitsu | Começando a jornada | OSS!',
    modalities: [{ modality: 'Jiu-Jitsu', belt: 'Faixa Azul' }],
    affiliated_academy_name: 'Checkmat Recife',
    avatar_url: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=300',
    is_verified: false
  },
  {
    email: 'marina.rodrigues@stravafight.com',
    password: 'Senha123!',
    username: 'marina_taekwondo',
    full_name: 'Marina Rodrigues',
    role: 'Atleta',
    location: 'Florianópolis, SC',
    bio: '🦶 Taekwondo | Faixa Preta 1º Dan | Seleção Brasileira',
    modalities: [{ modality: 'Taekwondo', belt: 'Faixa Preta 1º Dan' }],
    affiliated_academy_name: 'Taekwondo Floripa',
    avatar_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300',
    is_verified: true
  }
];

const posts = [
  {
    username: 'mestre_uarlei',
    caption: '🥋 Treino de quarta-feira! Focando em transições de guarda. Equipe chegando forte para o campeonato! #JiuJitsu #UBFTeam #OSS',
    media_url: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800',
    modality: 'Jiu-Jitsu',
    hashtags: ['jiujitsu', 'ubfteam', 'oss', 'bjj']
  },
  {
    username: 'amanda_bjj',
    caption: '💜 Finalização perfeita no treino de hoje! Triângulo é minha queda 🔺 #BJJ #Submissions #GracieBarra',
    media_url: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800',
    modality: 'Jiu-Jitsu',
    hashtags: ['bjj', 'submissions', 'graciebarra', 'jiujitsu']
  },
  {
    username: 'carlos_mma',
    caption: '🥊 Sparring pesado hoje! Preparação para a luta do próximo mês. Foco total! #MMA #UFC #Fighter',
    media_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
    modality: 'MMA',
    hashtags: ['mma', 'ufc', 'fighter', 'training']
  },
  {
    username: 'beatriz_thai',
    caption: '🔥 Chutes na perna toda! Treino de Muay Thai foi intenso. Quem aguenta? 💪 #MuayThai #KickBoxing',
    media_url: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800',
    modality: 'Muay Thai',
    hashtags: ['muaythai', 'kickboxing', 'fighter']
  },
  {
    username: 'diego_wrestler',
    caption: '🤼 Wrestling drill! Single leg takedown é a base. Repetição leva à perfeição! #Wrestling #Grappling',
    media_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
    modality: 'Wrestling',
    hashtags: ['wrestling', 'grappling', 'takedown']
  },
  {
    username: 'fernanda_boxer',
    caption: '🥊 Trabalhando o jab cruzado! Velocidade e precisão fazem a diferença. #Boxe #Boxing #Speed',
    media_url: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800',
    modality: 'Boxe',
    hashtags: ['boxe', 'boxing', 'speed', 'training']
  },
  {
    username: 'rafael_judoka',
    caption: '🥋 Uchi Mata perfeito! Técnica é fundamental no Judô. OSS! #Judo #MartialArts #Technique',
    media_url: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800',
    modality: 'Judô',
    hashtags: ['judo', 'martialarts', 'technique', 'oss']
  },
  {
    username: 'julia_kickboxer',
    caption: '💥 Low kick + High kick combo! Treino de Kickboxing intenso. Bora! #Kickboxing #K1 #Fighter',
    media_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
    modality: 'Kickboxing',
    hashtags: ['kickboxing', 'k1', 'fighter', 'combo']
  },
  {
    username: 'thiago_bjj',
    caption: '🔵 Primeiro mês de faixa azul! A jornada está só começando. Humildade e disciplina! #BJJ #JiuJitsu #OSS',
    media_url: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800',
    modality: 'Jiu-Jitsu',
    hashtags: ['bjj', 'jiujitsu', 'oss', 'bluebelt']
  },
  {
    username: 'marina_taekwondo',
    caption: '🦶 Dollyo Chagi perfeito! Preparação para o Pan-Americano. Vamos com tudo! #Taekwondo #TKD #Champion',
    media_url: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800',
    modality: 'Taekwondo',
    hashtags: ['taekwondo', 'tkd', 'champion', 'kicks']
  }
];

const reels = [
  {
    username: 'carlos_mma',
    caption: '🥊 Sequência de socos e quedas! Treino completo de MMA #MMA #UFC',
    video_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
    hashtags: ['mma', 'ufc', 'training', 'knockout']
  },
  {
    username: 'amanda_bjj',
    caption: '🔺 Triângulo voador! Quem quer tentar? #BJJ #Submissions',
    video_url: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800',
    hashtags: ['bjj', 'submissions', 'flying', 'jiujitsu']
  },
  {
    username: 'beatriz_thai',
    caption: '💥 Combo devastador de Muay Thai! Quem aguenta? #MuayThai',
    video_url: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800',
    hashtags: ['muaythai', 'combo', 'knockout']
  },
  {
    username: 'julia_kickboxer',
    caption: '🔥 High kick no saco pesado! Potência máxima #Kickboxing',
    video_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
    hashtags: ['kickboxing', 'power', 'highkick']
  }
];

async function seedDatabase() {
  console.log('🌱 POPULANDO BANCO DE DADOS...\n');
  
  let createdUsers = 0;
  let createdPosts = 0;
  let createdReels = 0;
  
  // 1. CRIAR USUÁRIOS
  console.log('👥 Criando usuários...');
  for (const user of users) {
    try {
      // Criar conta no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            username: user.username,
            full_name: user.full_name,
            role: user.role
          }
        }
      });
      
      if (authError) {
        console.log(`  ⚠️  ${user.username}: ${authError.message}`);
        continue;
      }
      
      if (!authData.user) {
        console.log(`  ⚠️  ${user.username}: Usuário não criado`);
        continue;
      }
      
      // Atualizar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: user.full_name,
          bio: user.bio,
          location: user.location,
          modalities: user.modalities,
          affiliated_academy_name: user.affiliated_academy_name,
          avatar_url: user.avatar_url,
          is_verified: user.is_verified
        })
        .eq('id', authData.user.id);
      
      if (!profileError) {
        console.log(`  ✅ @${user.username}`);
        createdUsers++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
    } catch (err) {
      console.log(`  ❌ ${user.username}: ${err.message}`);
    }
  }
  
  console.log(`\n📊 Usuários criados: ${createdUsers}/${users.length}\n`);
  
  // 2. BUSCAR USUÁRIOS PARA PEGAR IDs
  const { data: profiles } = await supabase.from('profiles').select('*');
  const userMap = new Map(profiles?.map(p => [p.username, p.id]) || []);
  
  // 3. CRIAR POSTS
  console.log('📱 Criando posts...');
  for (const post of posts) {
    const authorId = userMap.get(post.username);
    if (!authorId) {
      console.log(`  ⚠️  @${post.username} não encontrado`);
      continue;
    }
    
    try {
      const { error } = await supabase.from('posts').insert({
        author_id: authorId,
        caption: post.caption,
        media_url: post.media_url,
        media_type: 'image',
        modality: post.modality,
        hashtags: post.hashtags
      });
      
      if (!error) {
        console.log(`  ✅ Post de @${post.username}`);
        createdPosts++;
      } else {
        console.log(`  ❌ @${post.username}: ${error.message}`);
      }
    } catch (err) {
      console.log(`  ❌ @${post.username}: ${err.message}`);
    }
  }
  
  console.log(`\n📊 Posts criados: ${createdPosts}/${posts.length}\n`);
  
  // 4. CRIAR REELS
  console.log('🎥 Criando reels...');
  for (const reel of reels) {
    const authorId = userMap.get(reel.username);
    if (!authorId) {
      console.log(`  ⚠️  @${reel.username} não encontrado`);
      continue;
    }
    
    try {
      const { error } = await supabase.from('reels').insert({
        author_id: authorId,
        caption: reel.caption,
        video_url: reel.video_url,
        hashtags: reel.hashtags
      });
      
      if (!error) {
        console.log(`  ✅ Reel de @${reel.username}`);
        createdReels++;
      } else {
        console.log(`  ❌ @${reel.username}: ${error.message}`);
      }
    } catch (err) {
      console.log(`  ❌ @${reel.username}: ${err.message}`);
    }
  }
  
  console.log(`\n📊 Reels criados: ${createdReels}/${reels.length}\n`);
  
  // RESUMO
  console.log('='.repeat(80));
  console.log('✅ BANCO POPULADO COM SUCESSO!\n');
  console.log(`👥 Usuários: ${createdUsers}`);
  console.log(`📱 Posts: ${createdPosts}`);
  console.log(`🎥 Reels: ${createdReels}`);
  console.log('\n🔥 Acesse: https://stravafight.vercel.app/');
  console.log('='.repeat(80));
}

seedDatabase();
