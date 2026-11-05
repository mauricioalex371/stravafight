// Listar posts do feed
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function listPosts() {
  console.log('📱 POSTS NO FEED DO STRAVA FIGHT\n');
  console.log('='.repeat(80));
  
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(username, full_name, avatar_url)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('❌ Erro ao buscar posts:', error.message);
    return;
  }
  
  if (!posts || posts.length === 0) {
    console.log('📭 Nenhum post criado ainda');
    console.log('\n💡 Crie o primeiro post na plataforma!');
    return;
  }
  
  console.log(`\n📊 Total de posts: ${posts.length}\n`);
  
  posts.forEach((post, index) => {
    const author = Array.isArray(post.author) ? post.author[0] : post.author;
    console.log(`${index + 1}. Post de @${author?.username || 'unknown'}`);
    console.log(`   Autor: ${author?.full_name || 'Usuário'}`);
    console.log(`   Caption: ${post.caption || '(sem legenda)'}`);
    console.log(`   Mídia: ${post.media_url}`);
    console.log(`   Tipo: ${post.media_type}`);
    console.log(`   Modalidade: ${post.modality || 'Jiu-Jitsu'}`);
    console.log(`   Hashtags: ${post.hashtags?.join(', ') || 'nenhuma'}`);
    console.log(`   Curtidas: ${post.likes_count || 0}`);
    console.log(`   Comentários: ${post.comments_count || 0}`);
    console.log(`   Criado em: ${new Date(post.created_at).toLocaleString('pt-BR')}`);
    console.log('   ' + '-'.repeat(76));
  });
  
  console.log('\n='.repeat(80));
}

listPosts();
