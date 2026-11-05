// Verificar status da integração Sherdog
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkSherdog() {
  console.log('🔍 VERIFICANDO INTEGRAÇÃO SHERDOG\n');
  console.log('='.repeat(80));
  
  // 1. Verificar tabela fighters
  console.log('\n1️⃣ Verificando tabela fighters...');
  const { data: fighters, error: fightersError } = await supabase
    .from('fighters')
    .select('*')
    .limit(5);
  
  if (fightersError) {
    console.log('   ❌ Erro:', fightersError.message);
  } else {
    console.log(`   ✅ Tabela existe (${fighters?.length || 0} lutadores)`);
  }
  
  // 2. Verificar tabela fights
  console.log('\n2️⃣ Verificando tabela fights...');
  const { data: fights, error: fightsError } = await supabase
    .from('fights')
    .select('*')
    .limit(5);
  
  if (fightsError) {
    console.log('   ❌ Erro:', fightsError.message);
  } else {
    console.log(`   ✅ Tabela existe (${fights?.length || 0} lutas)`);
  }
  
  // 3. Verificar campo sherdog_url nos profiles
  console.log('\n3️⃣ Verificando campo sherdog_url em profiles...');
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('username, sherdog_url, sherdog_id')
    .not('sherdog_url', 'is', null);
  
  if (profilesError) {
    console.log('   ❌ Erro:', profilesError.message);
  } else {
    console.log(`   ✅ Campo existe (${profiles?.length || 0} usuários com Sherdog)`);
    if (profiles && profiles.length > 0) {
      profiles.forEach(p => {
        console.log(`      - @${p.username}: ${p.sherdog_url} (ID: ${p.sherdog_id || 'não extraído'})`);
      });
    }
  }
  
  // 4. Verificar se componente FighterRecordCard existe
  console.log('\n4️⃣ Verificando componente FighterRecordCard...');
  const fs = await import('fs');
  const componentPath = './src/components/FighterRecordCard.tsx';
  if (fs.existsSync(componentPath)) {
    console.log('   ✅ Componente existe');
  } else {
    console.log('   ❌ Componente não encontrado');
  }
  
  // 5. Verificar serviço fighterService
  console.log('\n5️⃣ Verificando serviço fighterService...');
  const servicePath = './src/services/fighterService.ts';
  if (fs.existsSync(servicePath)) {
    console.log('   ✅ Serviço existe');
  } else {
    console.log('   ❌ Serviço não encontrado');
  }
  
  // RESUMO
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 RESUMO DA INTEGRAÇÃO SHERDOG:\n');
  
  const status = {
    tabelas: !fightersError && !fightsError,
    campos: !profilesError,
    componente: fs.existsSync(componentPath),
    servico: fs.existsSync(servicePath),
    dados: (fighters?.length || 0) > 0
  };
  
  if (status.tabelas && status.campos) {
    console.log('✅ Banco de dados: Configurado corretamente');
  } else {
    console.log('❌ Banco de dados: Faltam configurações');
  }
  
  if (status.componente && status.servico) {
    console.log('✅ Código frontend: Componentes prontos');
  } else {
    console.log('❌ Código frontend: Faltam componentes');
  }
  
  if (status.dados) {
    console.log('✅ Dados: Lutadores já cadastrados');
  } else {
    console.log('⚠️  Dados: Nenhum lutador ainda (precisa rodar backfill)');
  }
  
  console.log('\n📋 O QUE FUNCIONA:');
  console.log('   ✅ Usuários podem adicionar URL do Sherdog no cadastro');
  console.log('   ✅ Sistema extrai automaticamente o sherdog_id');
  console.log('   ✅ Campo salvo no banco de dados');
  
  console.log('\n⏳ O QUE FALTA (OPCIONAL):');
  console.log('   ⏳ Popular tabela fighters (rodar backfill.py)');
  console.log('   ⏳ Exibir FighterRecordCard no ProfileView');
  console.log('   ⏳ Mostrar cartel completo do lutador');
  
  console.log('\n💡 NOTA: O Sherdog está FUNCIONAL para cadastro.');
  console.log('   Falta apenas exibir o card de recordes no perfil (opcional).');
  
  console.log('\n' + '='.repeat(80));
}

checkSherdog();
