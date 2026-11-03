# GUIA DE TRANSIÇÃO E FINALIZAÇÃO: STRAVA FIGHT 🥋🥊
## Documento Mestre de Engenharia para o Agente Kiro e Publicação na Vercel

> **Slogan:** *Esforço que transforma. Luta que evolui.*  
> **Domínio de Produção:** `https://stravafight.com.br`  
> **Identidade Visual:**  
> - Azul-marinho: `#071321`  
> - Preto Profundo: `#05070B`  
> - Vermelho Combate: `#F20D18`  
> - Grafite: `#171C25`  
> - Branco: `#FFFFFF`

---

## 1. RESUMO EXECUTIVO E ESTADO DA ARTE

O **STRAVA FIGHT** foi auditado, estruturado e preparado para a finalização e publicação direta em produção. Toda a camada de código-fonte está consolidada em **React 19 + TypeScript + Vite**, com tipagem estrita, separação limpa de camadas e suporte nativo ao **Supabase (PostgreSQL, Auth e Storage)** com mecanismo resiliente de *offline fallback*.

### Status dos Módulos:
| Módulo | Status | Descrição Técnica |
| :--- | :---: | :--- |
| **Feed Social & Mídias** | ✅ 100% | Posts com métricas de treino (rounds, intensidade, XP), comentários, curtidas, compartilhamentos e tags de tatame. |
| **Reels & Stories** | ✅ 100% | Carrossel de stories ativos com anel gradiente da marca, player de vídeo para reels com áudios marciais e interação rápida. |
| **SF Activity (Canvas Editor)** | ✅ 100% | Editor de sobreposição de métricas com drag, resize, rotate, troca de modalidades com SVGs customizados (Boxe, Muay Thai, Jiu-Jitsu, MMA, Funcional). |
| **SF Academy** | ✅ 100% | Gestão multi-tenant de academias: cadastro de alunos (maiores e menores com dados do responsável), turmas, lista de chamada/frequência, controle de mensalidades, fluxo de caixa e backup/restore JSON. |
| **SF Business** | ✅ 100% | Central de anúncios comerciais, perfis empresariais verificados, campanhas publicitárias com objetivos de conversão, catálogo de produtos e marketplace de patrocínios. |
| **Direct & Desafios** | ✅ 100% | Mensagens diretas em tempo real, abas principal/geral/solicitações e emissão de desafios de sparring com meta de rounds. |
| **Autenticação & Contas** | ✅ 100% | Camada Supabase Auth preparada (`AuthService`) com suporte a login, cadastro, recuperação de senha e perfil público. |
| **Banco de Dados & Storage** | ✅ 100% | 3 migrações SQL completas com Row Level Security (RLS) e regras para 6 buckets no Supabase Storage. |

---

## 2. ARQUITETURA DE DIRETÓRIOS E SERVIÇOS

```
├── /public/
│   ├── assets/aistudio/LOGO_47d32ee0.jpg  # Logotipo oficial em alta definição
│   └── manifest.json                     # PWA Manifest
├── /supabase/
│   └── migrations/
│       ├── 00001_initial_schema.sql        # Esquema social, acadêmico, chat e RLS
│       ├── 00002_business_schema.sql       # Esquema SF BUSINESS (anúncios, patrocínios)
│       └── 00003_storage_buckets_and_rls.sql # Buckets e permissões de storage
├── /src/
│   ├── lib/
│   │   └── supabase.ts                    # Cliente Supabase singleton com detecção dinâmica
│   ├── services/
│   │   ├── supabase/
│   │   │   ├── authService.ts             # Login, cadastro, sessão e redefinição
│   │   │   ├── storageService.ts          # Upload com validação de tamanho e tipo
│   │   │   └── dbService.ts               # Consultas PostgreSQL com mock fallback
│   │   ├── businessService.ts             # Estado comercial reativo
│   │   ├── storageService.ts              # Persistência local transparente
│   │   └── supabaseClient.ts              # Ponte unificada de serviços
│   ├── components/                        # Componentes modulares (Navbar, Sidebar, Modais, etc.)
│   ├── views/                             # Visualizações (Feed, Academy, Business, Direct, etc.)
│   └── types/                             # Interfaces TypeScript rigorosas
├── vercel.json                            # Rewrites SPA e cabeçalhos de segurança
├── .env.example                           # Modelo documentado de variáveis
└── package.json                           # React 19, TypeScript, Tailwind 4, Supabase JS
```

---

## 3. PASSO A PASSO PARA O KIRO: CONFIGURAÇÃO DO SUPABASE

1. **Acessar o Painel do Supabase:**
   - Crie ou selecione o projeto para o STRAVA FIGHT.
2. **Executar as Migrações SQL (em ordem cronológica):**
   - Acesse o **SQL Editor** do Supabase.
   - Execute o script `/supabase/migrations/00001_initial_schema.sql`.
   - Execute o script `/supabase/migrations/00002_business_schema.sql`.
   - Execute o script `/supabase/migrations/00003_storage_buckets_and_rls.sql`.
3. **Verificar os Buckets Criados no Storage:**
   - `avatars` (Público, limite 5MB)
   - `post-media` (Público, limite 50MB)
   - `reels` (Público, limite 100MB)
   - `stories` (Público, limite 50MB)
   - `sf-activities` (Público, limite 10MB)
   - `business-assets` (Público, limite 50MB)
4. **Configurar URL de Redirecionamento de Auth:**
   - Em **Authentication > URL Configuration**:
     - Site URL: `https://stravafight.com.br`
     - Redirect URLs: `https://stravafight.com.br/*` e `http://localhost:3000/*`
5. **Obter Chaves de API:**
   - Copie `Project URL` e a `anon/public key` em **Project Settings > API**.

---

## 4. PASSO A PASSO PARA O KIRO: PUBLICAÇÃO NA VERCEL

1. **Conectar ao Repositório GitHub:**
   - Suba o repositório no GitHub da organização/cliente.
   - Conecte o repositório na Vercel clicando em **Add New... > Project**.
2. **Configurações de Build:**
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. **Variáveis de Ambiente na Vercel:**
   Adicione as seguintes variáveis na seção **Environment Variables** (Production, Preview e Development):
   - `VITE_SUPABASE_URL`: URL do seu projeto Supabase (ex: `https://xyz.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY`: Chave anônima pública do Supabase
   - `VITE_APP_URL`: `https://stravafight.com.br`
   - `VITE_ENVIRONMENT`: `production`
4. **Deploy:**
   - Clique em **Deploy**. O arquivo `vercel.json` configurará automaticamente as regras de rewrite de SPA para evitar erros de 404 ao recarregar a página.
5. **Configuração de Domínio Personalizado (`stravafight.com.br`):**
   - Na Vercel, acesse **Settings > Domains**.
   - Adicione `stravafight.com.br` e `www.stravafight.com.br`.
   - No painel da sua registradora de domínio (Registro.br, Cloudflare, etc.):
     - Registro **A**: Host `@` -> IP `76.76.21.21` (ou o indicado pela Vercel)
     - Registro **CNAME**: Host `www` -> `cname.vercel-dns.com.`
   - A Vercel emitirá o certificado SSL gratuito automaticamente via Let's Encrypt.

---

## 5. PONTOS DE ATENÇÃO PARA O KIRO (CHECKLIST FINAL)

- [x] O app compila de forma limpa sem erros de tipagem (`npm run lint` / `tsc --noEmit`).
- [x] O bundle de produção é gerado com sucesso (`npm run build`).
- [x] Modo híbrido ativo: o aplicativo funciona perfeitamente mesmo se o Supabase não estiver conectado no primeiro segundo de navegação.
- [x] Nenhuma credencial privada (`service_role` ou senhas de banco) foi exposta no repositório.
- [ ] Configuração do gateway de pagamento real (ex: Stripe ou Asaas) caso o cliente deseje automatizar cobranças com cartão de crédito diretamente além do PIX já implementado.
