// Teste direto dos buckets
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testStorage() {
  console.log('🔍 Testando Storage Buckets...\n');
  
  // Listar todos os buckets
  const { data: buckets, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error('❌ Erro:', error.message);
    return;
  }
  
  console.log('📦 Buckets encontrados:', buckets.length);
  buckets.forEach(b => {
    console.log(`  ✅ ${b.name} (${b.public ? 'público' : 'privado'})`);
  });
  
  // Verificar buckets necessários
  const needed = ['avatars', 'covers', 'posts', 'stories', 'reels'];
  const found = buckets.map(b => b.name);
  
  console.log('\n🎯 Verificação:');
  needed.forEach(name => {
    const exists = found.includes(name);
    console.log(`  ${exists ? '✅' : '❌'} ${name}`);
  });
  
  const allOk = needed.every(n => found.includes(n));
  
  if (allOk) {
    console.log('\n✅ TODOS OS BUCKETS CRIADOS COM SUCESSO!');
    console.log('🚀 Upload de imagens liberado!');
  } else {
    console.log('\n⚠️  Alguns buckets ainda não existem');
    console.log('⚠️  Tente criar via Dashboard: Storage → New Bucket');
  }
}

testStorage();
