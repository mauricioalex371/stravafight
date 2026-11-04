# STRAVA FIGHT — ESTADO REAL DAS FUNCIONALIDADES

**Data:** 04/11/2026  
**Análise:** Mapeamento completo de integrações vs mocks

---

## ARQUITETURA IDENTIFICADA

### Padrão Híbrido com Fallback Inteligente

O projeto implementa um **padrão híbrido** onde:

```typescript
// Padrão usado em todos os serviços Supabase:
if (!isSupabaseReady()) {
  return StorageService.getFallbackData();
}
try {
  // Tentar buscar do Supabase
  const { data } = await supabase.from('table').select();
  if (error || !data) return StorageService.getFallbackData();
  return data;
} catch {
  return StorageService.getFallbackData();
}
```

**Interpretação:**
- Sistema **funciona offline-first** para desenvolvimento
- Quando Supabase está configurado, usa backend real
- Se houver erro ou sem configuração, volta para LocalStorage
- Permite desenvolvimento sem backend configurado

---

## CLASSIFICAÇÃO POR MÓDULO

### 🟢 NÍVEL 1 — INTEGRAÇÃO REAL IMPLEMENTADA

#### 1. AUTENTICAÇÃO ✅ INTEGRADA
**Arquivo:** `src/services/supabase/authService.ts`

**Status:** Totalmente integrado com Supabase Auth

**Funcionalidades:**
- ✅ `signUp()` — Cadastro com Supabase Auth + profiles
- ✅ `signIn()` — Login com email/senha
- ✅ `signOut()` — Logout
- ✅ `resetPassword()` — Recuperação de senha
- ✅ `updatePassword()` — Trocar senha
- ✅ `getSession()` — Sessão ativa
- ✅ `onAuthStateChange()` — Listener de mudanças

**Fallback:** LocalStorage para desenvolvimento

**Tabelas usadas:**
- `auth.users` (Supabase Auth nativo)
- `profiles` (migration 00001)

**Pronto para produção:** ✅ SIM

---

#### 2. PERFIS (PROFILES) ✅ INTEGRADA
**Arquivo:** `src/services/supabase/dbService.ts`

**Status:** Integrado com fallback

**Funcionalidades:**
- ✅ `getProfile(userId)` — Busca perfil do banco
- ✅ `updateProfile()` — Atualização no banco

**Campos mapeados:**
- ✅ id, username, full_name, avatar_url, cover_url
- ✅ bio, role, location, modalities
- ✅ affiliated_academy_name, affiliated_academy_id
- ✅ followers_count, following_count, posts_count
- ✅ streak_days, total_check_ins, xp_points
- ✅ belt_rank_social, badges, is_verified

**Tabelas usadas:**
- `profiles` (migration 00001)

**Pronto para produção:** ✅ SIM (após remover fallback)

---

#### 3. PUBLICAÇÕES (POSTS) ✅ INTEGRADA
**Arquivo:** `src/services/supabase/dbService.ts`

**Status:** Integrado com paginação

**Funcionalidades:**
- ✅ `getPosts()` — Busca todos os posts com JOIN de profiles
- ✅ `getPostsPaginated()` — Paginação com range
- ✅ `createPost()` — Inserção no banco

**Campos mapeados:**
- ✅ id, author_id, caption, media_url, media_type
- ✅ modality, hashtags, location, tagged_academy
- ✅ likes_count, comments_count, shares_count, saves_count
- ✅ training_data, created_at
- ✅ JOIN com profiles (author)

**Funcionalidades pendentes:**
- ⚠️ Curtidas (apenas contador, não tabela post_likes)
- ⚠️ Comentários (apenas contador, não integrado)
- ⚠️ Compartilhamentos (apenas contador)
- ⚠️ Salvamentos (apenas contador)

**Tabelas usadas:**
- `posts` (migration 00001)
- `profiles` (JOIN)

**Tabelas criadas mas não integradas:**
- `post_likes` (migration 00001)
- `post_comments` (migration 00001)
- `post_shares` (migration 00001)
- `post_saves` (migration 00001)

**Pronto para produção:** 🟡 PARCIAL (criar/listar OK, interações pendentes)

---

#### 4. STORAGE (UPLOAD DE MÍDIA) ✅ INTEGRADA
**Arquivo:** `src/services/supabase/storageService.ts`

**Status:** Totalmente integrado com Storage

**Funcionalidades:**
- ✅ `uploadMedia()` — Upload para buckets Supabase
- ✅ `validateFile()` — Validação de tipo e tamanho
- ✅ `removeFile()` — Remoção de arquivos
- ✅ Fallback para Data URL em desenvolvimento

**Buckets configurados:**
- ✅ `avatars` (max 5MB)
- ✅ `post-media` (max 5MB imagem, 50MB vídeo)
- ✅ `reels` (max 50MB)
- ✅ `stories` (max 50MB)
- ✅ `sf-activities` (max 5MB)
- ✅ `business-assets` (max 5MB)

**Validações:**
- ✅ Limite de tamanho (imagens 5MB, vídeos 50MB)
- ✅ Tipos de arquivo
- ✅ Geração de URLs públicas

**Tabelas usadas:**
- Storage buckets (migration 00003)

**Pronto para produção:** ✅ SIM

---

### 🟡 NÍVEL 2 — INTEGRAÇÃO PARCIAL

#### 5. SF ACADEMY 🟡 PARCIAL
**Arquivo:** `src/services/supabase/dbService.ts`

**Status:** Estrutura criada, integração básica

**Funcionalidades integradas:**
- ✅ `getStudents(academyId)` — Busca alunos por academia
- ✅ `getClasses(academyId)` — Busca turmas por academia

**Funcionalidades pendentes:**
- ⚠️ Criar alunos
- ⚠️ Atualizar alunos
- ⚠️ Registro de presença
- ⚠️ Mensalidades
- ⚠️ Turmas experimentais
- ⚠️ Transações de caixa

**Tabelas usadas:**
- `academy_students` (migration 00002)
- `academy_classes` (migration 00002)

**Tabelas criadas mas não integradas:**
- `academy_attendance` (migration 00002)
- `academy_fees` (migration 00002)
- `academy_cash` (migration 00002)
- `academy_trial_students` (migration 00002)

**Pronto para produção:** 🟡 APENAS LEITURA (CRUD completo pendente)

---

### 🔴 NÍVEL 3 — SEM INTEGRAÇÃO (LOCALSTORAGE APENAS)

#### 6. STORIES ❌ NÃO INTEGRADA
**Arquivo:** `src/services/supabase/dbService.ts`

**Status:** Apenas LocalStorage

```typescript
static async getStories(): Promise<Story[]> {
  return StorageService.getStories();
}
```

**Funcionalidades:**
- ❌ Todas as operações usam LocalStorage
- ❌ Nenhuma integração com banco

**Tabelas disponíveis:**
- `stories` (migration 00001)

**Ação necessária:** Implementar getStories(), createStory(), deleteStory()

---

#### 7. REELS ❌ NÃO INTEGRADA
**Arquivo:** `src/services/supabase/dbService.ts`

**Status:** Apenas LocalStorage

```typescript
static async getReels(): Promise<Reel[]> {
  return StorageService.getReels();
}
```

**Funcionalidades:**
- ❌ Todas as operações usam LocalStorage
- ❌ Nenhuma integração com banco

**Tabelas disponíveis:**
- `reels` (migration 00001)

**Ação necessária:** Implementar getReels(), createReel(), likeReel(), commentReel()

---

#### 8. MENSAGENS PRIVADAS ❌ NÃO INTEGRADA
**Status:** Apenas LocalStorage

**Funcionalidades:**
- ❌ Conversas em LocalStorage
- ❌ Mensagens em LocalStorage
- ❌ Sem Realtime

**Tabelas disponíveis:**
- `direct_conversations` (migration 00001)
- `direct_messages` (migration 00001)

**Ação necessária:**
- Implementar getConversations(), getMessages(), sendMessage()
- Configurar Realtime para mensagens instantâneas

---

#### 9. NOTIFICAÇÕES ❌ NÃO INTEGRADA
**Status:** Apenas LocalStorage

**Funcionalidades:**
- ❌ Notificações em LocalStorage
- ❌ Sem sincronização
- ❌ Sem Realtime

**Tabelas disponíveis:**
- `notifications` (migration 00001)

**Ação necessária:** Implementar getNotifications(), markAsRead(), Realtime

---

#### 10. SEGUIDORES/AMIGOS ❌ NÃO INTEGRADA
**Status:** Apenas contadores nos profiles

**Funcionalidades:**
- ⚠️ followers_count, following_count, friends_count são campos estáticos
- ❌ Nenhuma operação de seguir/deixar de seguir
- ❌ Nenhuma lista de seguidores

**Tabelas disponíveis:**
- `followers` (migration 00001)
- `friend_requests` (migration 00001)

**Ação necessária:**
- Implementar follow(), unfollow(), getFollowers(), getFollowing()
- Implementar sendFriendRequest(), acceptFriendRequest()

---

#### 11. CURTIDAS (POST_LIKES) ❌ NÃO INTEGRADA
**Status:** Apenas contador no post

**Funcionalidades:**
- ⚠️ likes_count é campo estático
- ❌ Nenhuma persistência de curtidas individuais
- ❌ hasLiked sempre false

**Tabelas disponíveis:**
- `post_likes` (migration 00001)

**Ação necessária:** Implementar likePost(), unlikePost(), getLikes()

---

#### 12. COMENTÁRIOS ❌ NÃO INTEGRADA
**Status:** Apenas contador no post

**Funcionalidades:**
- ⚠️ comments_count é campo estático
- ❌ Nenhuma persistência de comentários
- ❌ Array comments sempre vazio

**Tabelas disponíveis:**
- `post_comments` (migration 00001)

**Ação necessária:** Implementar createComment(), getComments(), deleteComment()

---

#### 13. SF BUSINESS ❌ NÃO INTEGRADA
**Status:** Sistema offline complexo com sync planejado

**Arquivos:**
- `businessService.ts` (1.179 linhas - LocalStorage puro)
- `businessSyncService.ts` (sincronização offline)
- `businessMigrationService.ts` (migração de dados legados)

**Funcionalidades:**
- ❌ Perfis comerciais em LocalStorage
- ❌ Campanhas em LocalStorage
- ❌ Produtos em LocalStorage
- ❌ Sync offline implementado mas não conectado ao Supabase

**Tabelas disponíveis:**
- `sf_business_profiles` (migration 00002)
- `sf_business_campaigns` (migration 00002)
- `sf_business_products` (migration 00002)
- `sf_business_opportunities` (migration 00002)
- Mais 10+ tabelas relacionadas

**Ação necessária:**
- Conectar businessSyncService ao Supabase
- Implementar todas as operações CRUD no banco
- Sistema extremamente complexo, migração trabalhosa

---

#### 14. MARKETPLACE ❌ NÃO INTEGRADA
**Status:** Service criado mas não conectado

**Arquivo:** `marketplaceService.ts`

**Funcionalidades:**
- ❌ Produtos, pedidos, pagamentos em LocalStorage

**Tabelas disponíveis:**
- `marketplace_stores` (migration 00005)
- `marketplace_products` (migration 00005)
- `marketplace_orders` (migration 00005)
- `marketplace_payments` (migration 00005)
- `marketplace_payment_webhooks` (migration 00005 + 00012)
- Mais 8 tabelas relacionadas

**Ação necessária:** Implementar todo CRUD + checkout + pagamentos

---

#### 15. EVENTOS E CAMPEONATOS ❌ NÃO INTEGRADA
**Status:** Service criado mas não conectado

**Arquivo:** `eventsService.ts`

**Funcionalidades:**
- ❌ Eventos em LocalStorage
- ❌ Inscrições em LocalStorage

**Tabelas disponíveis:**
- `events` (migration 00006)
- `event_registrations` (migration 00006)
- `event_results` (migration 00006)

**Ação necessária:** Implementar getEvents(), createEvent(), registerForEvent()

---

#### 16. TRANSMISSÕES (STREAMS) ❌ NÃO INTEGRADA
**Status:** Service criado mas não conectado

**Arquivo:** `streamsService.ts`

**Funcionalidades:**
- ❌ Transmissões em LocalStorage

**Tabelas disponíveis:**
- `streams` (migration 00006)

**Ação necessária:** Implementar streaming (complexo, integração externa necessária)

---

#### 17. MODERAÇÃO 🟡 ESTRUTURA CRIADA
**Status:** Service existe, integração não verificada

**Arquivo:** `moderationService.ts`

**Funcionalidades:**
- ⚠️ Denúncias, bloqueios, ações admin
- Precisa validar se está integrado ao banco

**Tabelas disponíveis:**
- `user_reports` (migration 00004)
- `user_blocks` (migration 00004)
- `moderation_actions` (migration 00004)

**Ação necessária:** Verificar integração e completar se necessário

---

## RESUMO EXECUTIVO

### ✅ PRONTO PARA PRODUÇÃO (4 módulos)
1. Autenticação (Supabase Auth)
2. Perfis (profiles)
3. Publicações — listar/criar (posts)
4. Storage — upload de mídia

### 🟡 INTEGRAÇÃO PARCIAL (2 módulos)
5. SF Academy — leitura apenas
6. Moderação — estrutura existe

### ❌ SEM INTEGRAÇÃO (11 módulos)
7. Stories
8. Reels
9. Mensagens privadas
10. Notificações
11. Seguidores/Amigos
12. Curtidas em posts
13. Comentários
14. SF Business (complexo)
15. Marketplace (complexo)
16. Eventos e campeonatos
17. Transmissões (complexo)

---

## DEPENDÊNCIAS DO LOCALSTORAGE

### StorageService.ts é usado por:
1. `App.tsx` — Estado principal da aplicação
2. `AuthContext.tsx` — Fallback de autenticação
3. `searchService.ts` — Busca usa dados locais
4. `supabase/authService.ts` — Fallback
5. `supabase/dbService.ts` — Fallback extensivo
6. `AcademyView.tsx` — Gestão de academia

### Estratégia de Migração

**Não remover StorageService imediatamente**, usar como:
1. **Cache local** durante migração
2. **Fallback** para desenvolvimento sem backend
3. **Preferências locais** (tema, configurações UI)

**Migrar gradualmente:**
- Manter padrão `isSupabaseReady() ? banco : localStorage`
- Remover fallbacks somente após validação completa
- Última etapa: simplificar StorageService para cache/preferências apenas

---

## MIGRATIONS SQL DISPONÍVEIS

### 12 migrations criadas e validadas:
- ✅ 00001 — Schema inicial (profiles, posts, stories, reels, messages, etc)
- ✅ 00002 — SF Business schema
- ✅ 00003 — Storage buckets + RLS
- ✅ 00004 — Segurança e moderação
- ✅ 00005 — Marketplace schema
- ✅ 00006 — Eventos e streams
- ✅ 00007 — Fix admin audit logs
- ✅ 00008 — Sistema admin
- ✅ 00009 — Fix post likes/comments RLS
- ✅ 00010 — Complete RLS policies
- ✅ 00011 — Fix ad events security
- ✅ 00012 — Fix missing RLS (webhooks financeiros)

**Status:** Todas criadas e validadas, mas apenas AUTH/PROFILES/POSTS/STORAGE integradas

---

## CONCLUSÃO

O STRAVA FIGHT possui:
- ✅ **Interface completa** (22.516 linhas)
- ✅ **Migrations SQL completas** (57 tabelas, 100% RLS)
- ✅ **Base sólida** (4 módulos integrados)
- ⚠️ **Migração pendente** (11 módulos sem integração)

**Arquitetura é profissional e escalável.** O trabalho restante é **conectar os serviços existentes aos dados reais**, não reconstruir do zero.

---

**Próximo documento:** MAPA_MIGRACAO_SUPABASE.md (ordem de execução)
