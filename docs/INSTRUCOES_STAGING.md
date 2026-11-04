# STRAVA FIGHT — Instruções para Criação de Ambiente Staging

**Data:** 04/11/2026  
**Objetivo:** Criar ambiente de homologação isolado e seguro

---

## PASSO 1: CRIAR PROJETO SUPABASE STAGING

### 1.1 Acessar Dashboard

1. Acesse https://supabase.com/dashboard
2. Login com sua conta
3. Clique em **"New Project"**

### 1.2 Configurar Projeto

**Nome do projeto:** `stravafight-staging`  
**Database Password:** Gere uma senha segura (min 12 caracteres)  
**Region:** `South America (São Paulo)` — `sa-east-1`  
**Pricing Plan:** `Free` (suficiente para testes)

### 1.3 Aguardar Provisionamento

O projeto leva ~2 minutos para ser criado.

### 1.4 Obter Credenciais

Após criação, vá em: **Project Settings → API**

Você encontrará:
- **Project URL:** `https://[project-ref].supabase.co`
- **Project API keys:**
  - `anon` `public` — Key pública (pode ser exposta no frontend)
  - `service_role` `secret` — Key privada (NUNCA exponha no frontend)

**⚠️ IMPORTANTE:** Anote apenas a key `anon public` para o staging.

---

## PASSO 2: CONFIGURAR VARIÁVEIS DE AMBIENTE

### 2.1 Criar Arquivo Local

```bash
cd /home/catycaney/Downloads/stravafight
cp .env.staging.example .env.staging
```

### 2.2 Editar .env.staging

Substitua os valores:

```env
VITE_SUPABASE_URL="https://[SEU-PROJECT-REF].supabase.co"
VITE_SUPABASE_ANON_KEY="[SUA-ANON-KEY-STAGING]"
VITE_APP_URL="https://stravafight-staging.vercel.app"
VITE_ENVIRONMENT="staging"
```

### 2.3 Verificar que .env.staging está em .gitignore

```bash
grep ".env" .gitignore
# Deve retornar: .env*
```

✅ Se retornar `.env*`, está protegido (não será commitado)

---

## PASSO 3: APLICAR MIGRATIONS NO STAGING

### 3.1 Linkar Projeto Supabase

```bash
# Instalar Supabase CLI (se não tiver)
npm install -g supabase

# Linkar ao projeto staging
supabase link --project-ref [SEU-PROJECT-REF]
# Quando solicitar database password, use a senha criada no passo 1.2
```

### 3.2 Aplicar Todas as Migrations

```bash
# Aplicar migrations 00001-00012
supabase db push

# OU manualmente via SQL:
supabase db reset --linked
```

### 3.3 Validar Migrations Aplicadas

```bash
# Verificar quantas migrations foram aplicadas
supabase migration list --linked

# Deve retornar 12 migrations (00001 até 00012)
```

### 3.4 Validar Estrutura RLS

Execute o script de validação:

```bash
psql $(supabase db remote-url --linked) < scripts/validate-rls-staging.sql
```

**Resultado esperado:**
```
Total de tabelas públicas: 57
Tabelas COM RLS: 57 (100%)
Tabelas SEM RLS: 0
Total de policies RLS: 119
```

✅ Se `Tabelas SEM RLS: 0`, a migration 00012 foi aplicada com sucesso!

---

## PASSO 4: CRIAR USUÁRIOS DE TESTE

### 4.1 Via Supabase Dashboard

1. Acesse: **Authentication → Users**
2. Clique em **"Add user"** → **"Create new user"**

**Criar 3 usuários:**

| Email | Password | Role |
|-------|----------|------|
| userA@staging.test | TestUser@123 | authenticated |
| userB@staging.test | TestUser@456 | authenticated |
| admin@staging.test | Admin@789 | authenticated + admin |

### 4.2 Adicionar Role Admin

Para o usuário `admin@staging.test`:

1. Copie o `user_id` do usuário no Dashboard
2. Vá em **SQL Editor**
3. Execute:

```sql
-- Obter user_id do admin
SELECT id, email FROM auth.users WHERE email = 'admin@staging.test';

-- Inserir role admin (substitua [USER_ID])
INSERT INTO public.admin_roles (user_id, role, granted_by, is_active)
VALUES (
  '[USER_ID_DO_ADMIN]',
  'Admin',
  '[USER_ID_DO_ADMIN]',
  true
);

-- Validar
SELECT * FROM public.admin_roles WHERE user_id = '[USER_ID_DO_ADMIN]';
```

✅ Se retornar 1 row, role admin foi adicionada!

---

## PASSO 5: CONFIGURAR AUTENTICAÇÃO

### 5.1 Configurar URLs de Redirecionamento

No Supabase Dashboard: **Authentication → URL Configuration**

**Site URL:**
```
https://stravafight-staging.vercel.app
```

**Redirect URLs (adicione todas):**
```
http://localhost:5173/**
https://stravafight-staging.vercel.app/**
https://*.vercel.app/**
```

### 5.2 Habilitar Provedores de Auth

**Authentication → Providers**

Habilitar:
- ✅ Email (já habilitado por padrão)
- ⚠️ Google/Facebook (opcional, requer OAuth apps de teste)

Para staging, **Email é suficiente**.

---

## PASSO 6: CONFIGURAR STORAGE

### 6.1 Verificar Buckets Criados

**Storage → Buckets**

Deve haver 3 buckets (criados pela migration 00003):
- `avatars` (public)
- `posts` (public)
- `private-files` (private)

### 6.2 Configurar CORS (se necessário)

**Storage → Configuration → CORS**

Adicionar origins permitidos:
```
http://localhost:5173
https://stravafight-staging.vercel.app
https://*.vercel.app
```

---

## PASSO 7: PREPARAR DEPLOY VERCEL

### 7.1 Instalar Vercel CLI

```bash
npm install -g vercel
```

### 7.2 Login

```bash
vercel login
```

### 7.3 Linkar Projeto (primeira vez)

```bash
cd /home/catycaney/Downloads/stravafight
vercel link
```

Responda:
- **Set up and deploy?** Y
- **Which scope?** Selecione sua conta/team
- **Link to existing project?** N (se for primeira vez) ou Y (se já existe)
- **Project name?** `stravafight` ou `stravafight-staging`

### 7.4 Configurar Variáveis de Ambiente

```bash
# Adicionar variáveis de staging (uma por vez)
vercel env add VITE_SUPABASE_URL staging
# Cole o valor: https://[seu-project-ref].supabase.co

vercel env add VITE_SUPABASE_ANON_KEY staging
# Cole o valor: [sua-anon-key-staging]

vercel env add VITE_APP_URL staging
# Cole o valor: https://stravafight-staging.vercel.app

vercel env add VITE_ENVIRONMENT staging
# Cole o valor: staging
```

---

## PASSO 8: FAZER DEPLOY DE PREVIEW

### 8.1 Build Local (testar antes)

```bash
npm run build
# Deve compilar sem erros
```

### 8.2 Deploy Preview (NÃO PRODUÇÃO)

```bash
# Deploy para preview (branch main ou staging)
vercel

# OU especificar target staging:
vercel --target staging

# NÃO EXECUTE: vercel --prod (isso é produção!)
```

### 8.3 Obter URL de Preview

Após deploy, Vercel retorna URLs:
```
✅ Preview: https://stravafight-git-main-[seu-user].vercel.app
✅ Unique: https://stravafight-[hash].vercel.app
```

Use essas URLs para testes.

---

## PASSO 9: VALIDAR STAGING

### 9.1 Acessar URL de Preview

Abra no navegador: `https://[sua-url-preview].vercel.app`

### 9.2 Verificar Conexão Supabase

Abra DevTools → Console

Deve haver mensagem:
```
[Supabase] Cliente inicializado: https://[seu-project].supabase.co
```

Se houver erro `Invalid API key`, revisar variáveis de ambiente.

### 9.3 Testar Login

1. Acessar página de login
2. Fazer login com `userA@staging.test` / `TestUser@123`
3. Deve redirecionar para feed

✅ Se login funcionar, autenticação está OK!

---

## CHECKLIST DE VALIDAÇÃO

Marque conforme for completando:

- [ ] Projeto Supabase staging criado
- [ ] Credenciais obtidas (URL + anon key)
- [ ] Arquivo .env.staging configurado (não commitado)
- [ ] Supabase CLI linkado ao projeto staging
- [ ] Migrations 00001-00012 aplicadas
- [ ] Validação RLS executada (0 tabelas sem RLS)
- [ ] 3 usuários criados (userA, userB, admin)
- [ ] Role admin adicionada ao admin@staging.test
- [ ] URLs de redirecionamento configuradas
- [ ] Buckets Storage verificados
- [ ] Vercel CLI linkado ao projeto
- [ ] Variáveis de ambiente adicionadas no Vercel
- [ ] Build local executado com sucesso
- [ ] Deploy preview realizado (NÃO --prod)
- [ ] URL de preview acessível
- [ ] Login funcional com usuários de teste

---

## PRÓXIMOS PASSOS

Após completar este checklist, executar:

**TESTES RLS:** `docs/TESTE_RLS_STAGING.md`  
**TESTES FUNCIONAIS:** `CHECKLIST_STAGING.md`  
**RELATÓRIO:** `RELATORIO_HOMOLOGACAO_STAGING.md`

---

## TROUBLESHOOTING

### Erro: "Invalid API URL"

**Causa:** URL do Supabase incorreta

**Solução:**
```bash
# Verificar variável
echo $VITE_SUPABASE_URL

# Deve retornar: https://[project-ref].supabase.co
# Se estiver errado, corrigir .env.staging e fazer novo deploy
```

### Erro: "Invalid API key"

**Causa:** Anon key incorreta ou de outro projeto

**Solução:**
1. Verificar no Dashboard: Settings → API
2. Copiar key `anon public` (não `service_role`)
3. Atualizar `.env.staging`
4. Redeploy: `vercel`

### Erro: "Migration failed"

**Causa:** Migrations fora de ordem ou SQL inválido

**Solução:**
```bash
# Resetar banco (CUIDADO: apaga tudo)
supabase db reset --linked

# Reaplicar migrations
supabase db push
```

### Erro: "RLS policy violation"

**Causa:** Migration 00012 não aplicada ou policy incorreta

**Solução:**
```bash
# Verificar se migration 00012 foi aplicada
supabase migration list --linked | grep 00012

# Se não aparecer, aplicar manualmente
psql $(supabase db remote-url --linked) < supabase/migrations/00012_fix_missing_rls.sql
```

---

**Última atualização:** 04/11/2026  
**Autor:** Equipe STRAVA FIGHT  
**Status:** Pronto para execução
