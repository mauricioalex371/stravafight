// Listar usuários cadastrados no Supabase
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function listUsers() {
  console.log('👥 USUÁRIOS CADASTRADOS NO STRAVA FIGHT\n');
  console.log('='.repeat(80));
  
  // Buscar todos os perfis
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('❌ Erro ao buscar usuários:', error.message);
    return;
  }
  
  if (!profiles || profiles.length === 0) {
    console.log('📭 Nenhum usuário cadastrado ainda');
    console.log('\n💡 Cadastre o primeiro usuário em: https://stravafight.vercel.app/');
    return;
  }
  
  console.log(`\n📊 Total de usuários: ${profiles.length}\n`);
  
  profiles.forEach((user, index) => {
    console.log(`${index + 1}. @${user.username}`);
    console.log(`   Nome: ${user.full_name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Modalidades: ${JSON.stringify(user.modalities || [])}`);
    console.log(`   Localização: ${user.location || 'Não informado'}`);
    console.log(`   Academia: ${user.affiliated_academy_name || 'Nenhuma'}`);
    console.log(`   Sherdog: ${user.sherdog_url || 'Não informado'}`);
    console.log(`   Seguidores: ${user.followers_count || 0}`);
    console.log(`   Seguindo: ${user.following_count || 0}`);
    console.log(`   Verificado: ${user.is_verified ? '✅' : '❌'}`);
    console.log(`   Cadastrado em: ${new Date(user.created_at).toLocaleString('pt-BR')}`);
    console.log('   ' + '-'.repeat(76));
  });
  
  console.log('\n='.repeat(80));
  console.log('✅ Listagem completa!');
}

listUsers();
