# STRAVA FIGHT — INSTRUÇÕES DE DEPLOY PARA PRODUÇÃO

## ✅ STATUS PRÉ-DEPLOY

**Data:** 04/11/2026  
**Build:** ✅ PASSING (5.42s, 0 errors)  
**TypeScript:** ✅ PASSING (0 errors)  
**Unit Tests:** ✅ PASSING (7/7)  
**Git:** ✅ CLEAN (commit a873b43)

---

## 🚀 ETAPA 1: CRIAR PROJETO SUPABASE

### 1.1. Acessar Supabase Dashboard
1. Ir para: https://supabase.com/dashboard
2. Fazer login com sua conta
3. Clicar em **"New Project"**

### 1.2. Configurar Projeto
```
Nome do Projeto: stravafight-prod
Região: South America (São Paulo) — recomendado para Brasil
Database Password: [CRIAR SENHA FORTE - GUARDAR EM SEGURANÇA]
Pricing Plan: Free (suficiente para lançamento)
```

### 1.3. Aguardar Provisionamento
- Tempo estimado: 2-3 minutos
- Aguardar até status "Active"

---

## 🔧 ETAPA 2: APLICAR MIGRATIONS

### 2.1. Obter Credenciais
No dashboard do projeto criado:
1. Ir em **Settings > API**
2. Copiar **Project URL** (exemplo: `https://abcdefgh.supabase.co`)
3. Copiar **anon/public key**

### 2.2. Configurar CLI Localmente
```bash
cd /home/catycaney/Downloads/stravafight

# Linkar projeto local com remoto
supabase link --project-ref <SEU_PROJECT_REF>
# Project ref é o ID antes de .supabase.co na URL

# Quando solicitado, fornecer a database password criada no passo 1.2
```

### 2.3. Aplicar Migrations
```bash
# Verificar migrations pendentes
supabase db diff --linked

# Aplicar TODAS as migrations (00001 até 00013)
# NOTA: 00014_sherdog_fighters.sql será aplicada em fase futura
supabase db push --linked --include-all
```

**IMPORTANTE:** Confirme que está aplicando no projeto correto antes de executar!

### 2.4. Validar Aplicação
```bash
# Verificar tabelas criadas
supabase db inspect tables --linked

# Deve mostrar:
# - profiles
# - posts
# - post_likes
# - post_comments
# - followers
# - notifications
# - conversations
# - messages
# - admin_audit_logs
# - (e outras tabelas auxiliares)
```

---

## 📦 ETAPA 3: CONFIGURAR VERCEL

### 3.1. Criar Conta/Projeto Vercel
1. Acessar: https://vercel.com
2. Fazer login com GitHub (recomendado)
3. Clicar em **"Add New..." > Project**
4. Importar repositório: `mauricioalex371/stravafight`

### 3.2. Configurar Build Settings
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 3.3. Configurar Environment Variables
Na seção **Environment Variables**, adicionar:

```env
VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_copiada_do_supabase
VITE_APP_URL=https://stravafight.vercel.app
VITE_ENVIRONMENT=production
```

**IMPORTANTE:**
- Substituir `SEU_PROJECT_ID` e `sua_anon_key` pelos valores reais
- Aplicar para: **Production**, **Preview**, **Development**

### 3.4. Deploy Inicial
```bash
# Clicar em "Deploy"
# Aguardar build (2-3 minutos)
# Vercel irá gerar URL: https://stravafight.vercel.app
```

---

## 🌐 ETAPA 4: CONFIGURAR DOMÍNIO (OPCIONAL)

### 4.1. Adicionar stravafight.com.br
No dashboard Vercel do projeto:
1. Ir em **Settings > Domains**
2. Adicionar: `stravafight.com.br`
3. Seguir instruções de DNS

### 4.2. Atualizar DNS
No seu provedor de domínio (Registro.br, GoDaddy, etc):
```
Tipo: CNAME
Nome: @
Valor: cname.vercel-dns.com
TTL: Automático

Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com
TTL: Automático
```

### 4.3. Atualizar Supabase Auth
No Supabase Dashboard:
1. Ir em **Authentication > URL Configuration**
2. Adicionar em **Redirect URLs**:
   - `https://stravafight.com.br/**`
   - `https://www.stravafight.com.br/**`
   - `https://stravafight.vercel.app/**`

---

## ✅ ETAPA 5: VALIDAÇÃO PÓS-DEPLOY

### 5.1. Checklist Funcional
Acessar: https://stravafight.vercel.app (ou domínio custom)

- [ ] **Página inicial carrega sem erros**
- [ ] **Console do navegador sem erros críticos**
- [ ] **Cadastro de novo usuário funciona**
- [ ] **Login funciona**
- [ ] **Editar perfil funciona**
- [ ] **Upload de foto de perfil funciona**
- [ ] **Criar publicação funciona**
- [ ] **Curtir post funciona**
- [ ] **Comentar funciona**
- [ ] **Seguir outro usuário funciona**
- [ ] **Notificações aparecem**
- [ ] **Mensagens privadas funcionam**
- [ ] **Logout funciona**
- [ ] **Dados persistem após recarregar página**

### 5.2. Criar 2 Usuários de Teste
```
Usuário A:
- Email: teste.lutador1@gmail.com
- Username: lutador_teste1
- Modalidade: Jiu-Jitsu

Usuário B:
- Email: teste.lutador2@gmail.com
- Username: lutador_teste2
- Modalidade: Muay Thai
```

### 5.3. Testar Interações Wave 1
1. **Usuário A** cria um post com foto
2. **Usuário B** curte o post → **A** recebe notificação
3. **Usuário B** comenta no post → **A** recebe notificação
4. **Usuário B** segue **A** → **A** recebe notificação
5. **Usuário A** envia mensagem privada para **B**
6. **Usuário B** responde a mensagem
7. Verificar que notificações aparecem em tempo real
8. Verificar que contador de não lidas atualiza

---

## 🔒 ETAPA 6: SEGURANÇA PÓS-DEPLOY

### 6.1. Verificar RLS
No Supabase Dashboard > Database > Tables:
```sql
-- Verificar que RLS está habilitado em TODAS as tabelas:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Resultado esperado: rowsecurity = true para todas
```

### 6.2. Testar Isolamento
- Usuário A NÃO deve ver mensagens privadas entre B e C
- Usuário A NÃO deve ver notificações de B
- Usuário A NÃO deve poder editar posts de B

### 6.3. Monitorar Logs
```bash
# No Supabase Dashboard > Logs
# Verificar por:
# - Tentativas de acesso não autorizado
# - Erros de RLS
# - Queries maliciosas
```

---

## 📊 ETAPA 7: MONITORAMENTO

### 7.1. Vercel Analytics
- Acessar: Dashboard Vercel > Analytics
- Monitorar: Page views, unique visitors, performance

### 7.2. Supabase Dashboard
- Acessar: Database > Usage
- Monitorar: Connections, storage, API requests

### 7.3. Limites Free Tier Supabase
```
Database Size: 500 MB
Storage: 1 GB
Bandwidth: 5 GB/mês
Realtime: 200 concurrent connections
Auth: Unlimited users
```

---

## 🚨 TROUBLESHOOTING

### Erro: "Failed to connect to Supabase"
```bash
# Verificar variáveis de ambiente na Vercel
# Verificar se VITE_SUPABASE_URL está correto
# Verificar se anon key é a pública (não a secret!)
```

### Erro: "Row Level Security violation"
```bash
# Verificar se migrations foram aplicadas corretamente
# Executar novamente: supabase db push --linked
# Verificar policies no Supabase Dashboard
```

### Erro: "Storage bucket not found"
```bash
# No Supabase Dashboard > Storage
# Criar buckets manualmente se não existirem:
# - avatars (public)
# - posts (public)
```

### Build falha na Vercel
```bash
# Verificar logs completos no Vercel
# Comum: dependências faltando
# Solução: npm install --save <pacote-faltando>
# Push e redeploy
```

---

## 📞 PRÓXIMOS PASSOS APÓS DEPLOY

1. **Divulgar URL:** Compartilhar `stravafight.com.br` em redes
2. **Coletar Feedback:** Pedir para primeiros usuários testarem
3. **Monitorar Erros:** Configurar Sentry ou similar (opcional)
4. **Backup Database:** Configurar backups automáticos no Supabase
5. **Wave 2:** Após estabilização, iniciar próximas features

---

## 📋 CHECKLIST FINAL

- [ ] Projeto Supabase criado e ativo
- [ ] Migrations aplicadas (00001-00013)
- [ ] Vercel projeto configurado
- [ ] Environment variables definidas
- [ ] Deploy realizado com sucesso
- [ ] 2 usuários de teste criados
- [ ] Wave 1 features validadas
- [ ] RLS testado e funcionando
- [ ] Domínio configurado (opcional)
- [ ] Monitoramento ativo

---

## ✅ RESULTADO ESPERADO

**URL PÚBLICA:** https://stravafight.vercel.app  
**Status:** LIVE e funcional  
**Funcionalidades:** Cadastro, login, perfis, posts, curtidas, comentários, seguidores, notificações, mensagens

**Primeira versão funcional do STRAVA FIGHT publicada com sucesso! 🥋🔥**
