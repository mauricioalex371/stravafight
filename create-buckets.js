// Criar buckets via código
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// ⚠️ ATENÇÃO: Você precisa usar a SERVICE_ROLE_KEY para criar buckets
// A ANON_KEY não tem permissão para criar buckets
console.log('❌ ERRO: Não é possível criar buckets com ANON_KEY');
console.log('');
console.log('📋 SOLUÇÃO: Criar buckets manualmente no Dashboard');
console.log('');
console.log('🔧 PASSO A PASSO:');
console.log('1. Abrir: https://supabase.com/dashboard/project/olwwkgtxkduvyhduudbx/storage/buckets');
console.log('2. Clicar: "New Bucket" (5 vezes)');
console.log('3. Criar cada bucket com estas configurações:');
console.log('');
console.log('   BUCKET 1: avatars');
console.log('   - Name: avatars');
console.log('   - Public: ✅ Yes');
console.log('   - File size limit: 5 MB');
console.log('   - Allowed MIME types: image/jpeg, image/png, image/webp');
console.log('');
console.log('   BUCKET 2: covers');
console.log('   - Name: covers');
console.log('   - Public: ✅ Yes');
console.log('   - File size limit: 10 MB');
console.log('   - Allowed MIME types: image/jpeg, image/png, image/webp');
console.log('');
console.log('   BUCKET 3: posts');
console.log('   - Name: posts');
console.log('   - Public: ✅ Yes');
console.log('   - File size limit: 10 MB');
console.log('   - Allowed MIME types: image/jpeg, image/png, image/webp, video/mp4');
console.log('');
console.log('   BUCKET 4: stories');
console.log('   - Name: stories');
console.log('   - Public: ✅ Yes');
console.log('   - File size limit: 10 MB');
console.log('   - Allowed MIME types: image/jpeg, image/png, video/mp4');
console.log('');
console.log('   BUCKET 5: reels');
console.log('   - Name: reels');
console.log('   - Public: ✅ Yes');
console.log('   - File size limit: 50 MB');
console.log('   - Allowed MIME types: video/mp4, video/webm');
console.log('');
console.log('⏱️  Tempo total: 2-3 minutos');
console.log('');
console.log('✅ Depois execute: node test-storage-direct.js');
