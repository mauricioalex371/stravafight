# 🚀 Guia de Deploy Passo a Passo - STRAVA FIGHT

## ⚠️ PASSO 0: SEGURANÇA URGENTE (FAZER AGORA!)

### Revogar Token GitHub Exposto
1. Acesse: https://github.com/settings/tokens
2. Localize o token que termina com `...3y1wD80g`
3. Clique em **Delete** ou **Revoke**
4. Confirme a revogação
5. ✅ **Criar novo token** (se necessário):
   - Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token → Marque `repo` → Generate
   - **COPIE O TOKEN** (aparece uma vez só)
   - **NÃO COMPARTILHE** novamente

---

## 📋 CHECKLIST GERAL

```
[ ] 1. Revogar token GitHub exposto
[ ] 2. Criar projeto no Supabase
[ ] 3. Executar migrações do banco de dados
[ ] 4. Configurar Storage Buckets
[ ] 5. Copiar credenciais do Supabase
[ ] 6. Fazer deploy no Vercel
[ ] 7. Configurar variáveis de ambiente
[ ] 8. Configurar DNS (stravafight.com.br)
[ ] 9. Testar aplicação em produção
[ ] 10. Monitorar primeiras 48h
```

---

## 🗄️ PASSO 1: CONFIGURAR SUPABASE

### 1.1 Criar Projeto
1. Acesse: https://supabase.com/dashboard
2. Clique em **"New Project"**
3. Preencha:
   - **Name**: `stravafight` ou `strava-fight-prod`
   - **Database Password**: Crie uma senha forte (ANOTE!)
   - **Region**: `South America (São Paulo)` (menor latência para Brasil)
   - **Pricing Plan**: `Free` (começa grátis, pode escalar depois)
4. Clique em **"Create new project"**
5. ⏳ Aguarde ~2 minutos (setup do banco)

### 1.2 Copiar Credenciais
Quando o projeto estiver pronto:
1. No dashboard, vá em **Settings** (⚙️) → **API**
2. Copie e ANOTE em local seguro:
   ```
   Project URL: https://xxxxxxxxxx.supabase.co
   anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (NÃO usar no frontend!)
   ```

### 1.3 Executar Migrações do Banco de Dados

**Opção A: Via SQL Editor (Web - RECOMENDADO)**
1. No dashboard Supabase, vá em **SQL Editor** (ícone </> na barra lateral)
2. Clique em **"New query"**
3. Abra e copie o conteúdo de cada arquivo na ordem:
   - `supabase/migrations/00001_initial_schema.sql`
   - `supabase/migrations/00002_rls_policies.sql`
   - `supabase/migrations/00003_storage_buckets.sql`
   - `supabase/migrations/00004_indexes_performance.sql`
4. Cole o conteúdo no editor
5. Clique em **"Run"** (ou Ctrl+Enter)
6. Verifique se aparece "Success. No rows returned" (ou similar)
7. Repita para cada arquivo na ordem

**Opção B: Via Supabase CLI (Local - AVANÇADO)**
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Linkar ao projeto (você receberá um project-ref no dashboard)
supabase link --project-ref seu-project-ref

# Executar migrações
supabase db push
```

### 1.4 Configurar Storage Buckets

Os buckets já foram criados pela migração `00003_storage_buckets.sql`.

Verifique se foram criados:
1. No dashboard, vá em **Storage** (ícone 📦)
2. Você deve ver 6 buckets:
   - `avatars` (público)
   - `post-media` (público)
   - `reels` (público)
   - `stories` (público)
   - `sf-activities` (público)
   - `business-assets` (público)

✅ Se todos aparecerem, o Storage está OK!

### 1.5 Verificar Tabelas

1. Vá em **Table Editor** (ícone 📊)
2. Você deve ver 29 tabelas criadas:
   - `users`, `posts`, `comments`, `likes`, `follows`
   - `challenges`, `reels`, `stories`, `check_ins`
   - `business_pages`, `sponsored_posts`, `plans`
   - E outras...

✅ Se as tabelas aparecerem, o banco está OK!

---

## 🌐 PASSO 2: FAZER DEPLOY NO VERCEL

### 2.1 Importar Repositório
1. Acesse: https://vercel.com/new
2. Clique em **"Import Git Repository"**
3. Se não estiver conectado ao GitHub:
   - Clique em **"Continue with GitHub"**
   - Autorize o Vercel
4. Procure por: `mauricioalex371/stravafight`
5. Clique em **"Import"**

### 2.2 Configurar Projeto
1. **Project Name**: `stravafight` (ou personalizado)
2. **Framework Preset**: Vite (deve detectar automaticamente)
3. **Root Directory**: `./` (raiz do projeto)
4. **Build Command**: `npm run build` (já detectado)
5. **Output Directory**: `dist` (já detectado)

### 2.3 Adicionar Variáveis de Ambiente

Clique em **"Environment Variables"** e adicione:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_URL=https://stravafight.vercel.app
VITE_ENVIRONMENT=production
```

**⚠️ IMPORTANTE:**
- Use a **anon key** (pública), NUNCA a service_role key
- `VITE_APP_URL` pode ser o domínio Vercel primeiro, depois trocar para seu domínio customizado

### 2.4 Deploy!
1. Clique em **"Deploy"**
2. ⏳ Aguarde ~2-3 minutos
3. ✅ Quando terminar, você verá: **"Congratulations! Your project has been deployed"**
4. Clique em **"Visit"** para ver o site ao vivo!

### 2.5 Testar Aplicação
1. Abra o link do Vercel (ex: `https://stravafight.vercel.app`)
2. Teste funcionalidades básicas:
   - [ ] Página carrega sem erros
   - [ ] Modal de login aparece
   - [ ] Formulário de registro funciona
   - [ ] Navegação está responsiva

---

## 🌍 PASSO 3: CONFIGURAR DOMÍNIO CUSTOMIZADO

### 3.1 No Vercel
1. No dashboard do seu projeto, vá em **Settings** → **Domains**
2. Clique em **"Add Domain"**
3. Digite: `stravafight.com.br`
4. Clique em **"Add"**
5. O Vercel mostrará instruções de DNS

### 3.2 No Registro.br
1. Acesse: https://registro.br/
2. Faça login com sua conta
3. Vá em **"Meus Domínios"** → Clique em `stravafight.com.br`
4. Vá em **"Editar zona DNS"** ou **"DNS"**

Adicione os registros:

**Registro A (apontar domínio raiz):**
```
Tipo: A
Nome: @
Valor: 76.76.21.21
TTL: 3600
```

**Registro CNAME (apontar www):**
```
Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com
TTL: 3600
```

5. Salve as alterações
6. ⏳ Aguarde propagação DNS (15 min - 48h, geralmente ~1h)

### 3.3 Verificar Propagação
Após ~1 hora, teste:
```bash
# Verificar se DNS está apontando corretamente
nslookup stravafight.com.br
dig stravafight.com.br
```

Ou use: https://dnschecker.org/

### 3.4 Ativar SSL (Automático)
1. Quando o DNS propagar, volte ao Vercel
2. Em **Settings** → **Domains**
3. O Vercel automaticamente emitirá certificado SSL (Let's Encrypt)
4. ✅ Quando aparecer o cadeado verde, está pronto!

### 3.5 Atualizar Variável de Ambiente
1. No Vercel, vá em **Settings** → **Environment Variables**
2. Edite `VITE_APP_URL`:
   ```
   VITE_APP_URL=https://stravafight.com.br
   ```
3. Clique em **"Save"**
4. Vá em **Deployments** → Clique nos 3 pontos do último deploy → **"Redeploy"**

---

## ✅ PASSO 4: VALIDAÇÃO FINAL

### 4.1 Checklist de Produção
Acesse `https://stravafight.com.br` e teste:

**Funcionalidades Básicas:**
- [ ] Site carrega em < 3 segundos
- [ ] HTTPS ativo (cadeado verde)
- [ ] Registro de usuário funciona
- [ ] Login funciona
- [ ] Upload de imagem funciona
- [ ] Feed carrega posts
- [ ] Responsivo funciona (mobile/tablet/desktop)

**Performance:**
- [ ] PageSpeed Insights: > 80 (desktop/mobile)
- [ ] Lighthouse: > 80 em todas as métricas

**Segurança:**
- [ ] Token GitHub antigo foi revogado ✅
- [ ] Service role key NÃO está no frontend
- [ ] RLS ativo no Supabase (Settings → Database → RLS enabled)

### 4.2 Monitoramento (Primeiras 48h)
1. **Vercel Analytics**: Settings → Analytics (ver tráfego/erros)
2. **Supabase Logs**: Dashboard → Logs (ver queries/erros)
3. **Erros de JavaScript**: Console do navegador
4. **Feedback de usuários**: Observe relatórios/comentários

---

## 🆘 RESOLUÇÃO DE PROBLEMAS

### Erro: "Failed to fetch" ou "Network Error"
- ✅ Verifique se `VITE_SUPABASE_URL` está correto
- ✅ Verifique se Supabase permite conexões públicas (Settings → API → API Settings)

### Erro: "Invalid API key"
- ✅ Verifique se `VITE_SUPABASE_ANON_KEY` está correto
- ✅ Certifique-se de estar usando a **anon key**, não a service_role

### Site não abre no domínio customizado
- ✅ Verifique DNS com `nslookup stravafight.com.br`
- ✅ Aguarde mais tempo (propagação pode levar até 48h)
- ✅ Limpe cache do navegador (Ctrl+Shift+R)

### Imagens não fazem upload
- ✅ Verifique se os buckets foram criados no Supabase Storage
- ✅ Verifique se as políticas RLS dos buckets permitem insert/select públicos

### Build falha no Vercel
- ✅ Verifique se todas as variáveis de ambiente estão configuradas
- ✅ Veja o log completo do build no Vercel

---

## 📞 SUPORTE

**Documentação Oficial:**
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs
- Vite: https://vitejs.dev/guide/

**Comunidades:**
- Supabase Discord: https://discord.supabase.com/
- Vercel Discord: https://vercel.com/discord

---

## 🎉 CONCLUSÃO

Após completar todos os passos:
- ✅ Aplicação estará no ar em `https://stravafight.com.br`
- ✅ SSL/HTTPS ativo
- ✅ Banco de dados operacional
- ✅ Pronto para receber usuários!

**Próximos passos sugeridos:**
1. Configurar backup automático do Supabase
2. Configurar analytics (Google Analytics, Plausible, etc.)
3. Configurar monitoramento de erros (Sentry)
4. Marketing e aquisição de usuários
5. Coletar feedback e iterar

---

**Boa sorte com o lançamento! 🚀🥊**
