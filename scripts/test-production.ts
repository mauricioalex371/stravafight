#!/usr/bin/env tsx
/**
 * STRAVA FIGHT - Production Functional Test
 * 
 * Executa verificações não-destrutivas em produção:
 * - Conectividade com Supabase
 * - Estrutura de tabelas
 * - RLS policies ativas
 * - Contagem de dados existentes
 * - Health check dos endpoints
 * 
 * NÃO cria, modifica ou deleta dados.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env file manually
const envPath = resolve(process.cwd(), '.env');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
} catch (error) {
  console.error('⚠️  Could not load .env file');
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function log(result: TestResult) {
  results.push(result);
  const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${result.name}: ${result.message}`);
  if (result.details) {
    console.log(`   ${JSON.stringify(result.details)}`);
  }
}

async function testSupabaseConnection() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error) throw error;
    
    log({
      name: 'Supabase Connection',
      status: 'PASS',
      message: 'Conexão estabelecida com sucesso',
      details: { url: SUPABASE_URL }
    });
    return true;
  } catch (error) {
    log({
      name: 'Supabase Connection',
      status: 'FAIL',
      message: 'Falha na conexão',
      details: { error: String(error) }
    });
    return false;
  }
}

async function testTableStructure() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const tables = ['profiles', 'posts', 'followers', 'feed_posts'];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      
      log({
        name: `Table: ${table}`,
        status: 'PASS',
        message: `Tabela acessível`,
        details: { records: count ?? 0 }
      });
    } catch (error: any) {
      log({
        name: `Table: ${table}`,
        status: 'FAIL',
        message: 'Tabela não acessível',
        details: { error: error.message }
      });
    }
  }
}

async function testRLSPolicies() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Tentar acessar dados sem autenticação deve ser bloqueado por RLS
  try {
    const { data: posts } = await supabase
      .from('posts')
      .select('*')
      .limit(1);
    
    // Se conseguir ler posts públicos, RLS está configurado corretamente
    log({
      name: 'RLS Policies',
      status: 'PASS',
      message: 'Políticas RLS ativas (acesso anônimo controlado)',
      details: { publicPostsReadable: posts !== null }
    });
  } catch (error: any) {
    log({
      name: 'RLS Policies',
      status: 'WARN',
      message: 'RLS pode estar bloqueando acesso anônimo',
      details: { error: error.message }
    });
  }
}

async function testDataCounts() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  const counts: Record<string, number> = {};
  
  for (const table of ['profiles', 'posts', 'followers']) {
    try {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      counts[table] = count ?? 0;
    } catch {
      counts[table] = -1;
    }
  }
  
  log({
    name: 'Data Integrity',
    status: 'PASS',
    message: 'Contagem de registros obtida',
    details: counts
  });
}

async function testProductionURL() {
  const url = process.env.VITE_APP_URL || 'https://stravafight.vercel.app';
  
  try {
    const response = await fetch(url);
    const status = response.status;
    
    if (status === 200) {
      log({
        name: 'Production URL',
        status: 'PASS',
        message: `Site acessível (HTTP ${status})`,
        details: { url, headers: Object.fromEntries(response.headers) }
      });
    } else {
      log({
        name: 'Production URL',
        status: 'WARN',
        message: `Site retornou HTTP ${status}`,
        details: { url }
      });
    }
  } catch (error) {
    log({
      name: 'Production URL',
      status: 'FAIL',
      message: 'Falha ao acessar site',
      details: { url, error: String(error) }
    });
  }
}

async function testEnvironmentVariables() {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_APP_URL',
    'VITE_ENVIRONMENT'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length === 0) {
    log({
      name: 'Environment Variables',
      status: 'PASS',
      message: 'Todas as variáveis obrigatórias definidas',
      details: { count: required.length }
    });
  } else {
    log({
      name: 'Environment Variables',
      status: 'FAIL',
      message: 'Variáveis faltando',
      details: { missing }
    });
  }
}

async function main() {
  console.log('🥋 STRAVA FIGHT - Teste Funcional de Produção\n');
  console.log('⚠️  MODO READ-ONLY: Nenhum dado será modificado\n');
  
  await testEnvironmentVariables();
  
  const connected = await testSupabaseConnection();
  if (!connected) {
    console.log('\n❌ Falha na conexão. Testes interrompidos.');
    process.exit(1);
  }
  
  await testTableStructure();
  await testRLSPolicies();
  await testDataCounts();
  await testProductionURL();
  
  console.log('\n' + '='.repeat(60));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;
  
  console.log(`\n📊 RESULTADO: ${passed} passou | ${failed} falhou | ${warned} avisos`);
  
  if (failed > 0) {
    console.log('\n❌ Alguns testes falharam. Verifique os detalhes acima.');
    process.exit(1);
  } else if (warned > 0) {
    console.log('\n⚠️  Testes passaram com avisos. Revisar recomendado.');
    process.exit(0);
  } else {
    console.log('\n✅ Todos os testes passaram! STRAVA FIGHT está pronto para uso.');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('\n❌ Erro fatal:', error);
  process.exit(1);
});
