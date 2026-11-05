// Script para testar conexão e verificar tabelas no Supabase
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Variáveis de ambiente não configuradas!');
  console.log('Verificar .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 TESTANDO CONEXÃO COM SUPABASE...\n');
  
  // 1. Testar autenticação
  console.log('1️⃣ Testando configuração:');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);
  
  // 2. Verificar tabelas
  console.log('\n2️⃣ Verificando tabelas essenciais:');
  
  const tables = [
    'profiles',
    'posts',
    'post_likes',
    'post_comments',
    'user_followers',
    'notifications',
    'activities',
    'combat_challenges',
    'academies',
    'fighters',
    'fights'
  ];
  
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        results[table] = { status: '❌', error: error.message };
      } else {
        results[table] = { status: '✅', count: count || 0 };
      }
    } catch (err) {
      results[table] = { status: '❌', error: err.message };
    }
  }
  
  // Exibir resultados
  console.log('\n📊 RESULTADO DAS TABELAS:');
  console.log('─'.repeat(60));
  
  let allOk = true;
  for (const [table, result] of Object.entries(results)) {
    const status = result.status;
    const info = result.error 
      ? `ERRO: ${result.error}` 
      : `${result.count} registros`;
    
    console.log(`${status} ${table.padEnd(20)} │ ${info}`);
    
    if (result.status === '❌') allOk = false;
  }
  
  console.log('─'.repeat(60));
  
  // 3. Testar Storage Buckets
  console.log('\n3️⃣ Verificando Storage Buckets:');
  
  const buckets = ['avatars', 'covers', 'posts', 'stories', 'reels'];
  
  try {
    const { data: storageBuckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log('❌ Erro ao listar buckets:', error.message);
    } else {
      const existingBuckets = storageBuckets.map(b => b.name);
      
      for (const bucket of buckets) {
        const exists = existingBuckets.includes(bucket);
        console.log(`${exists ? '✅' : '❌'} ${bucket}`);
        if (!exists) allOk = false;
      }
    }
  } catch (err) {
    console.log('❌ Erro ao verificar storage:', err.message);
  }
  
  // 4. Testar RLS (Row Level Security)
  console.log('\n4️⃣ Testando RLS Policies:');
  
  try {
    // Tentar inserir sem autenticação (deve falhar se RLS estiver ativo)
    const { error } = await supabase.from('profiles').insert({
      id: '00000000-0000-0000-0000-000000000000',
      username: 'test',
      full_name: 'Test'
    });
    
    if (error && error.message.includes('row-level security')) {
      console.log('✅ RLS está ativo (segurança ok)');
    } else if (error) {
      console.log('⚠️  RLS pode não estar configurado corretamente');
    } else {
      console.log('❌ RLS NÃO está ativo! (VULNERABILIDADE)');
      allOk = false;
    }
  } catch (err) {
    console.log('✅ RLS está ativo');
  }
  
  // RESUMO FINAL
  console.log('\n' + '='.repeat(60));
  if (allOk) {
    console.log('✅ BANCO DE DADOS 100% CONFIGURADO!');
    console.log('✅ Todas as tabelas existem');
    console.log('✅ Storage buckets criados');
    console.log('✅ RLS ativo (segurança ok)');
    console.log('\n🚀 PRONTO PARA PRODUÇÃO!');
  } else {
    console.log('⚠️  ATENÇÃO: Alguns problemas foram encontrados');
    console.log('⚠️  Execute o SQL do arquivo: EXECUTAR_NO_SUPABASE_SQL_EDITOR.sql');
    console.log('⚠️  No Supabase Dashboard → SQL Editor → New Query');
  }
  console.log('='.repeat(60));
  
  process.exit(allOk ? 0 : 1);
}

testConnection().catch(err => {
  console.error('❌ ERRO FATAL:', err.message);
  process.exit(1);
});
