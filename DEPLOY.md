# 🚀 GUIA COMPLETO DE DEPLOY: STRAVA FIGHT

> **Domínio de Produção:** https://stravafight.com.br  
> **Stack:** React 19 + TypeScript + Vite + Supabase + Vercel

---

## 📋 PRÉ-REQUISITOS

Antes de iniciar o deploy, certifique-se de ter:

- ✅ Conta no [Supabase](https://supabase.com)
- ✅ Conta no [Vercel](https://vercel.com)
- ✅ Conta no [GitHub](https://github.com)
- ✅ Domínio `stravafight.com.br` registrado e acessível
- ✅ Node.js 22+ instalado localmente

---

## 🗄️ PARTE 1: CONFIGURAÇÃO DO SUPABASE

### 1.1. Criar Projeto no Supabase

1. Acesse https://app.supabase.com
2. Clique em **"New Project"**
3. Preencha:
   - **Name:** `stravafight-production`
   - **Database Password:** Crie uma senha forte e salve em local seguro
   - **Region:** Escolha a mais próxima do Brasil (recomendado: São Paulo ou US East)
4. Aguarde ~2 minutos para provisionar o banco

### 1.2. Executar Migrations SQL

1. No painel do Supabase, acesse **SQL Editor**
2. Execute **na ordem correta** os seguintes scripts:

```sql
-- Copie e cole o conteúdo de cada arquivo:
```

**Ordem de execução:**
1. `supabase/migrations/00001_initial_schema.sql`
2. `supabase/migrations/00002_business_schema.sql`
3. `supabase/migrations/00003_storage_buckets_and_rls.sql`
4. `supabase/migrations/00004_security_and_moderation.sql`

Clique em **"RUN"** após cada script.

### 1.3. Verificar Storage Buckets

1. Acesse **Storage** no menu lateral
2. Verifique se os seguintes buckets foram criados:
   - ✅ `avatars` (5 MB limite)
   - ✅ `post-media` (50 MB limite)
   - ✅ `reels` (100 MB limite)
   - ✅ `stories` (50 MB limite)
   - ✅ `sf-activities` (10 MB limite)
   - ✅ `business-assets` (50 MB limite)

### 1.4. Configurar Authentication

1. Acesse **Authentication > URL Configuration**
2. Preencha:
   - **Site URL:** `https://stravafight.com.br`
   - **Redirect URLs:** Adicione:
     ```
     https://stravafight.com.br/*
     https://stravafight.com.br/auth/callback
     http://localhost:3000/*
     ```

### 1.5. Obter Credenciais da API

1. Acesse **Settings > API**
2. Copie:
   - **Project URL** (ex: `https://xyz.supabase.co`)
   - **anon public key** (chave pública para uso no frontend)

⚠️ **IMPORTANTE:** Nunca exponha a `service_role` key no código frontend ou GitHub!

---

## 📦 PARTE 2: PREPARAÇÃO DO REPOSITÓRIO GITHUB

### 2.1. Inicializar Git (se ainda não foi feito)

```bash
cd /home/catycaney/Downloads/stravafight
git init
git add .
git commit -m "feat: preparação completa do STRAVA FIGHT para produção"
```

### 2.2. Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Preencha:
   - **Repository name:** `stravafight`
   - **Visibility:** Private (recomendado para projetos comerciais)
   - **NÃO** marque "Initialize with README"
3. Clique em **"Create repository"**

### 2.3. Conectar Repositório Local ao GitHub

```bash
git remote add origin https://github.com/SEU_USUARIO/stravafight.git
git branch -M main
git push -u origin main
```

### 2.4. Configurar Secrets no GitHub (Opcional - Para CI/CD)

1. No repositório, acesse **Settings > Secrets and variables > Actions**
2. Clique em **"New repository secret"**
3. Adicione os seguintes secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_URL` (valor: `https://stravafight.com.br`)
   - `VERCEL_TOKEN` (obtido em https://vercel.com/account/tokens)
   - `VERCEL_ORG_ID` (encontrado nas configurações do projeto Vercel)
   - `VERCEL_PROJECT_ID` (encontrado nas configurações do projeto Vercel)

---

## 🌐 PARTE 3: DEPLOY NA VERCEL

### 3.1. Importar Projeto do GitHub

1. Acesse https://vercel.com/new
2. Clique em **"Import Git Repository"**
3. Selecione o repositório `stravafight`
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (deixe padrão)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### 3.2. Adicionar Variáveis de Ambiente

Na seção **"Environment Variables"**, adicione:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_SUPABASE_URL` | `https://xyz.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` (sua anon key) | Production, Preview, Development |
| `VITE_APP_URL` | `https://stravafight.com.br` | Production |
| `VITE_APP_URL` | Auto (Vercel URL) | Preview, Development |
| `VITE_ENVIRONMENT` | `production` | Production |
| `VITE_ENVIRONMENT` | `preview` | Preview |

### 3.3. Fazer o Deploy Inicial

1. Clique em **"Deploy"**
2. Aguarde ~2-3 minutos
3. Vercel fornecerá uma URL temporária (ex: `stravafight.vercel.app`)
4. Acesse e teste o funcionamento básico

---

## 🌍 PARTE 4: CONFIGURAÇÃO DO DOMÍNIO PERSONALIZADO

### 4.1. Adicionar Domínio na Vercel

1. No projeto, acesse **Settings > Domains**
2. Clique em **"Add Domain"**
3. Digite: `stravafight.com.br`
4. Clique em **"Add"**
5. Repita para: `www.stravafight.com.br`

### 4.2. Configurar DNS no Registro.br (ou seu provedor)

Acesse o painel do **Registro.br** ou seu provedor de domínio e adicione:

**Para o domínio raiz (`stravafight.com.br`):**
```
Tipo: A
Host: @
Valor: 76.76.21.21
TTL: 3600
```

**Para o subdomínio www:**
```
Tipo: CNAME
Host: www
Valor: cname.vercel-dns.com.
TTL: 3600
```

⏱️ **Aguarde:** A propagação DNS pode levar de 5 minutos a 48 horas (geralmente 15-30 min).

### 4.3. Verificar SSL (HTTPS)

1. Na Vercel, a emissão automática de certificado SSL via **Let's Encrypt** ocorre automaticamente
2. Após propagação do DNS, acesse: https://stravafight.com.br
3. Verifique o cadeado verde no navegador

---

## ✅ CHECKLIST FINAL

Antes de considerar o deploy concluído, verifique:

### Backend (Supabase)
- [ ] Todas as 4 migrations foram executadas sem erros
- [ ] 6 buckets de storage estão criados e públicos
- [ ] RLS (Row Level Security) está habilitado em todas as tabelas
- [ ] Políticas de acesso estão corretas
- [ ] Authentication redirect URLs incluem o domínio de produção

### Frontend (Vercel)
- [ ] Build passa sem erros (`npm run build`)
- [ ] Variáveis de ambiente estão configuradas
- [ ] Domínio `stravafight.com.br` está conectado
- [ ] Certificado SSL está ativo (HTTPS)
- [ ] Rewrite rules do `vercel.json` estão funcionando (navegação SPA)

### Testes Finais
- [ ] Login/cadastro funcionando
- [ ] Upload de imagens funciona (testar avatar e post)
- [ ] Feed carrega publicações
- [ ] Stories e Reels aparecem
- [ ] SF Academy carrega dados (se logado como proprietário)
- [ ] SF Business exibe anúncios e catálogo
- [ ] Mensagens diretas funcionam
- [ ] Desafios podem ser criados e aceitos

---

## 🔧 COMANDOS ÚTEIS

### Desenvolvimento Local
```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Verificar TypeScript
npm run lint

# Executar testes
npm run test

# Build de produção local
npm run build

# Preview do build
npm run preview
```

### Deploy Manual via Vercel CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy production
vercel --prod
```

---

## 🆘 TROUBLESHOOTING

### Problema: "TypeError: Failed to fetch" ao fazer login
**Solução:** Verifique se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão corretas nas variáveis de ambiente da Vercel.

### Problema: Erro 404 ao recarregar página
**Solução:** Verifique se o arquivo `vercel.json` existe e contém os rewrites corretos.

### Problema: Uploads de imagem falham
**Solução:** 
1. Verifique se os buckets foram criados no Supabase Storage
2. Confirme que as políticas RLS do storage permitem `INSERT` para usuários autenticados

### Problema: Domínio não resolve após 48h
**Solução:**
1. Verifique os registros DNS com: `dig stravafight.com.br`
2. Confirme que não há registros conflitantes (múltiplos A records)
3. Entre em contato com suporte do Registro.br

---

## 📞 SUPORTE

- **Supabase:** https://supabase.com/docs
- **Vercel:** https://vercel.com/docs
- **Documentação do Projeto:** Ver `README.md` e `KIRO_HANDOFF.md`

---

**🥋 Esforço que transforma. Luta que evolui. 🥊**
