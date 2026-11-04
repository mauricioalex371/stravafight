# 🏗️ ARQUITETURA ALVO - STRAVA FIGHT

## 📋 Sumário Executivo

Este documento define a **arquitetura definitiva** do STRAVA FIGHT como uma **plataforma multiusuário real** baseada em Supabase, eliminando gradualmente a dependência de LocalStorage e estabelecendo uma base sólida para crescimento escalável.

**Status:** 🎯 Arquitetura alvo definida - Em migração gradual  
**Data:** 2026-11-04  
**Versão:** 1.0

---

## 🎯 Visão da Arquitetura

### Princípios Fundamentais

1. **Multi-tenant por Design**: Todos os dados são isolados por usuário com RLS (Row Level Security)
2. **Real-time First**: Sincronização em tempo real para feed, mensagens, notificações
3. **Progressive Enhancement**: Funcionalidades offline como enhancement, não como base
4. **Security by Default**: Autenticação obrigatória, políticas RLS em 100% das tabelas
5. **Scalable from Day One**: Arquitetura preparada para milhares de usuários simultâneos

### Decisão Crítica

**❌ Rejeitado:** LocalStorage como banco de dados principal  
**✅ Adotado:** Supabase (PostgreSQL + Auth + Storage + Realtime) como fonte única da verdade

---

## 🏛️ Camadas da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  React Components + Views + Context API + React Router      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│         Service Layer (supabase/* services)                  │
│  - authService    - notificationsService                     │
│  - dbService      - messagesService                          │
│  - storageService - reelsService                             │
│  - likesService   - eventsService                            │
│  - commentsService- academyService                           │
│  - followersService- businessService                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE CLIENT LAYER                      │
│              @supabase/supabase-js (v2.45+)                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Auth      │ │  PostgreSQL │ │   Storage   │           │
│  │  (Supabase) │ │  + RLS      │ │  (Buckets)  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Realtime   │ │  Functions  │ │    Edge     │           │
│  │ (WebSockets)│ │  (Optional) │ │  Functions  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Módulos e Responsabilidades

### 1. **Authentication & Authorization**

**Componentes:**
- `src/services/supabase/authService.ts` (✅ PRONTO)
- `src/contexts/AuthContext.tsx` (✅ PRONTO)

**Funcionalidades:**
- ✅ Cadastro com email + senha
- ✅ Login/Logout
- ✅ Sessão persistente
- ✅ Recuperação de senha
- 🔄 OAuth (Google, Facebook) - PLANEJADO

**Tecnologia:** Supabase Auth (GoTrue)

---

### 2. **User Profiles**

**Componentes:**
- `src/services/supabase/dbService.ts` → `profiles` (✅ PRONTO)

**Funcionalidades:**
- ✅ CRUD de perfis
- ✅ Upload de avatar
- ✅ Campos: username, full_name, bio, avatar_url, user_type

**Tabelas:**
```sql
profiles (
  id UUID PRIMARY KEY (FK → auth.users),
  username TEXT UNIQUE,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  user_type TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

**RLS:** ✅ 100% protegido

---

### 3. **Posts & Feed**

**Componentes:**
- `src/services/supabase/dbService.ts` → `posts` (✅ PRONTO)

**Funcionalidades:**
- ✅ Criar post (texto + mídia)
- ✅ Listar posts (feed público)
- 🔄 Feed personalizado (following only) - Wave 1
- 🔄 Editar/deletar posts - Wave 1

**Tabelas:**
```sql
posts (
  id UUID PRIMARY KEY,
  user_id UUID (FK → profiles),
  content TEXT,
  media_url TEXT,
  media_type TEXT,
  visibility TEXT DEFAULT 'public',
  created_at TIMESTAMPTZ
)
```

**RLS:** ✅ SELECT público, INSERT/UPDATE/DELETE owner only

---

### 4. **Likes & Comments** 🎯 Wave 1

**Status:** ❌ LocalStorage → Migração Wave 1

**Tabelas alvo:**
```sql
likes (
  id UUID PRIMARY KEY,
  user_id UUID (FK → profiles),
  post_id UUID (FK → posts),
  created_at TIMESTAMPTZ,
  UNIQUE(user_id, post_id)
)

comments (
  id UUID PRIMARY KEY,
  user_id UUID (FK → profiles),
  post_id UUID (FK → posts),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ
)
```

**Service:** `src/services/supabase/likesService.ts` (CRIAR)  
**Service:** `src/services/supabase/commentsService.ts` (CRIAR)

**RLS:** SELECT público, INSERT/DELETE owner only

---

### 5. **Followers & Following** 🎯 Wave 1

**Status:** ❌ LocalStorage → Migração Wave 1

**Tabelas alvo:**
```sql
followers (
  id UUID PRIMARY KEY,
  follower_id UUID (FK → profiles),
  following_id UUID (FK → profiles),
  created_at TIMESTAMPTZ,
  UNIQUE(follower_id, following_id)
)
```

**Service:** `src/services/supabase/followersService.ts` (CRIAR)

**Queries críticas:**
- Listar quem eu sigo
- Listar meus seguidores
- Contar seguidores/seguindo
- Verificar se sigo usuário X

**RLS:** SELECT público, INSERT/DELETE owner only

---

### 6. **Notifications** 🎯 Wave 1

**Status:** ❌ LocalStorage → Migração Wave 1

**Tabelas alvo:**
```sql
notifications (
  id UUID PRIMARY KEY,
  user_id UUID (FK → profiles),
  type TEXT NOT NULL, -- 'like', 'comment', 'follow', 'mention'
  content TEXT,
  related_user_id UUID (FK → profiles),
  related_post_id UUID (FK → posts),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ
)
```

**Service:** `src/services/supabase/notificationsService.ts` (CRIAR)

**Realtime:** ✅ Subscrição em tempo real para novas notificações

**RLS:** SELECT/UPDATE owner only, INSERT via triggers

---

### 7. **Direct Messages** 🎯 Wave 1

**Status:** ❌ LocalStorage → Migração Wave 1

**Tabelas alvo:**
```sql
conversations (
  id UUID PRIMARY KEY,
  participant_1 UUID (FK → profiles),
  participant_2 UUID (FK → profiles),
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  UNIQUE(least(participant_1, participant_2), greatest(participant_1, participant_2))
)

messages (
  id UUID PRIMARY KEY,
  conversation_id UUID (FK → conversations),
  sender_id UUID (FK → profiles),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ
)
```

**Service:** `src/services/supabase/messagesService.ts` (CRIAR)

**Realtime:** ✅ Subscrição em tempo real para novas mensagens

**RLS:** SELECT/INSERT onde user é participante

---

### 8. **Stories & Reels** 🎯 Wave 2

**Status:** ❌ LocalStorage → Migração Wave 2

**Tabelas alvo:**
```sql
stories (
  id UUID PRIMARY KEY,
  user_id UUID (FK → profiles),
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL,
  expires_at TIMESTAMPTZ, -- 24h após criação
  created_at TIMESTAMPTZ
)

reels (
  id UUID PRIMARY KEY,
  user_id UUID (FK → profiles),
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ
)
```

**Service:** `src/services/supabase/storiesService.ts` (CRIAR)  
**Service:** `src/services/supabase/reelsService.ts` (CRIAR)

**RLS:** SELECT público, INSERT/DELETE owner only

---

### 9. **SF Activity** 🎯 Wave 3

**Status:** ❌ LocalStorage → Migração Wave 3

**Tabelas alvo:**
```sql
workouts (
  id UUID PRIMARY KEY,
  user_id UUID (FK → profiles),
  type TEXT NOT NULL, -- 'muay_thai', 'boxing', 'mma', 'functional'
  duration_minutes INTEGER,
  calories_burned INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ
)
```

**Service:** `src/services/supabase/activityService.ts` (CRIAR)

---

### 10. **SF Academy** 🎯 Wave 4

**Status:** 🟡 Parcial (read-only) → Migração Wave 4

**Tabelas alvo:**
```sql
academy_courses (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID (FK → profiles),
  thumbnail_url TEXT,
  video_url TEXT,
  duration_minutes INTEGER,
  level TEXT, -- 'beginner', 'intermediate', 'advanced'
  created_at TIMESTAMPTZ
)

course_enrollments (
  id UUID PRIMARY KEY,
  user_id UUID (FK → profiles),
  course_id UUID (FK → academy_courses),
  progress INTEGER DEFAULT 0, -- 0-100
  completed BOOLEAN DEFAULT false,
  enrolled_at TIMESTAMPTZ
)
```

**Service:** `src/services/supabase/academyService.ts` (EXPANDIR)

---

### 11. **SF Business** 🎯 Wave 6

**Status:** ❌ LocalStorage → Migração Wave 6

**Tabelas alvo:**
```sql
businesses (
  id UUID PRIMARY KEY,
  owner_id UUID (FK → profiles),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'gym', 'trainer', 'nutritionist'
  address TEXT,
  phone TEXT,
  logo_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ
)

business_reviews (
  id UUID PRIMARY KEY,
  business_id UUID (FK → businesses),
  user_id UUID (FK → profiles),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ
)
```

**Service:** `src/services/supabase/businessService.ts` (CRIAR)

---

### 12. **Events** 🎯 Wave 5

**Status:** ❌ LocalStorage → Migração Wave 5

**Tabelas alvo:**
```sql
events (
  id UUID PRIMARY KEY,
  organizer_id UUID (FK → profiles),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_date TIMESTAMPTZ,
  max_participants INTEGER,
  image_url TEXT,
  created_at TIMESTAMPTZ
)

event_participants (
  id UUID PRIMARY KEY,
  event_id UUID (FK → events),
  user_id UUID (FK → profiles),
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
  joined_at TIMESTAMPTZ
)
```

**Service:** `src/services/supabase/eventsService.ts` (CRIAR)

---

### 13. **Marketplace** 🎯 Wave 7

**Status:** ❌ LocalStorage → Migração Wave 7

**Tabelas alvo:**
```sql
marketplace_items (
  id UUID PRIMARY KEY,
  seller_id UUID (FK → profiles),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  category TEXT,
  images TEXT[], -- array de URLs
  condition TEXT, -- 'new', 'used'
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ
)
```

**Service:** `src/services/supabase/marketplaceService.ts` (CRIAR)

**Nota:** Pagamentos serão integração futura (Stripe/PayPal)

---

## 🔄 Estratégia de Migração

### Padrão Híbrido Temporário

Durante a migração, utilizamos o padrão:

```typescript
// ✅ PADRÃO CORRETO
async function getPosts() {
  if (!isSupabaseReady()) {
    return StorageService.getPosts(); // fallback
  }
  
  try {
    const posts = await supabaseDbService.getPosts();
    return posts;
  } catch (error) {
    console.error('Supabase falhou, usando fallback:', error);
    return StorageService.getPosts();
  }
}
```

### Remoção do Fallback

Após Wave completada e validada:

```typescript
// ✅ ESTADO FINAL (sem fallback)
async function getPosts() {
  return supabaseDbService.getPosts();
}
```

**Critério para remoção:**
- ✅ 100% das funcionalidades migradas
- ✅ Testes passando (100%)
- ✅ Validação manual completa
- ✅ Zero dependências de StorageService no módulo

---

## 🔐 Segurança (RLS Policies)

### Política de Acesso Universal

**Regra de Ouro:** Toda tabela tem RLS habilitado + políticas explícitas

### Templates de Políticas

#### 1. **Dados Públicos (Leitura)**
```sql
-- Qualquer um autenticado pode ler
CREATE POLICY "public_read" ON posts
  FOR SELECT TO authenticated
  USING (visibility = 'public');
```

#### 2. **Owner-Only (Escrita)**
```sql
-- Apenas dono pode inserir/atualizar/deletar
CREATE POLICY "owner_insert" ON posts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner_update" ON posts
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "owner_delete" ON posts
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
```

#### 3. **Participants-Only (Mensagens)**
```sql
-- Apenas participantes da conversa podem ler/escrever
CREATE POLICY "participants_read" ON messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
  );
```

### Auditoria de Segurança

**Status atual:** 57 tabelas, 119 políticas RLS (100% coverage) ✅

---

## 📊 Performance & Escalabilidade

### Índices Críticos

```sql
-- Posts
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- Likes
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_post ON likes(user_id, post_id);

-- Comments
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Followers
CREATE INDEX idx_followers_following ON followers(following_id);
CREATE INDEX idx_followers_follower ON followers(follower_id);

-- Notifications
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

### Paginação Obrigatória

Todas as listagens implementam paginação:

```typescript
const { data, count } = await supabase
  .from('posts')
  .select('*, profiles(*)', { count: 'exact' })
  .range(offset, offset + limit - 1)
  .order('created_at', { ascending: false });
```

**Limites:**
- Posts: 20 por página
- Comentários: 50 por página
- Notificações: 30 por página
- Mensagens: 50 por página

### Caching Strategy

- **React Query**: Cache client-side com stale-time de 5 minutos
- **Realtime Updates**: Invalidação automática via Supabase subscriptions

---

## 🔌 Integração Realtime

### Módulos com Realtime

| Módulo | Subscription | Trigger |
|--------|--------------|---------|
| Feed | `posts:INSERT` | Novo post de following |
| Likes | `likes:INSERT,DELETE` | Like/unlike em meus posts |
| Comments | `comments:INSERT` | Novo comentário em meu post |
| Notifications | `notifications:INSERT` | Nova notificação |
| Messages | `messages:INSERT` | Nova mensagem |

### Implementação Padrão

```typescript
const subscription = supabase
  .channel('posts-channel')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'posts',
      filter: `user_id=eq.${currentUserId}`
    },
    (payload) => {
      // Atualizar UI
      queryClient.invalidateQueries(['posts']);
    }
  )
  .subscribe();

// Cleanup
return () => {
  subscription.unsubscribe();
};
```

---

## 🗄️ Storage (Mídia)

### Buckets Configurados

```
avatars/       → Fotos de perfil (público)
posts/         → Imagens/vídeos de posts (público)
stories/       → Stories temporários (público, auto-delete 24h)
reels/         → Vídeos Reels (público)
business/      → Logos de businesses (público)
marketplace/   → Fotos de produtos (público)
academy/       → Vídeos de aulas (privado/autenticado)
```

### Upload Pattern

```typescript
async function uploadPostMedia(file: File, userId: string) {
  const fileName = `${userId}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('posts')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('posts')
    .getPublicUrl(fileName);
  
  return publicUrl;
}
```

### Limites

- **Tamanho máximo por arquivo:** 50MB
- **Formatos permitidos:** jpg, png, gif, mp4, webm
- **Duração máxima vídeo:** 60s (Reels), 15s (Stories)

---

## 🧪 Testing Strategy

### Coverage Alvo

- **Unit Tests:** 80%+ coverage
- **Integration Tests:** Todos os services Supabase
- **E2E Tests:** Fluxos críticos (signup → post → like)

### Estrutura de Testes

```
src/__tests__/
├── unit/
│   ├── authService.test.ts
│   ├── likesService.test.ts
│   └── followersService.test.ts
├── integration/
│   ├── feedFlow.test.ts
│   └── messagesFlow.test.ts
└── e2e/
    ├── userJourney.test.ts
    └── socialInteractions.test.ts
```

### Ambiente de Testes

- **Supabase Local:** `supabase start` (Docker)
- **Test Database:** Seed com dados mock
- **Cleanup:** Automático após cada teste

---

## 📈 Métricas de Sucesso

### KPIs Técnicos

- ✅ 100% de funcionalidades em Supabase (0% LocalStorage)
- ✅ <100ms latência média em queries (P95)
- ✅ 99.9% uptime Supabase
- ✅ 0 políticas RLS faltando
- ✅ 80%+ test coverage

### KPIs de Produto

- 🎯 1000+ usuários cadastrados (Fase D)
- 🎯 10,000+ posts criados
- 🎯 50,000+ likes/comentários
- 🎯 500+ businesses cadastrados

---

## 🚀 Roadmap de Implementação

### Waves (já definidas em MAPA_MIGRACAO_SUPABASE.md)

| Wave | Módulo | Prazo | Status |
|------|--------|-------|--------|
| 1 | Likes, Comments, Followers, Notifications, Messages | 34-44h | ⏳ Pendente |
| 2 | Stories, Reels | 10-14h | ⏳ Pendente |
| 3 | SF Activity | 4-6h | ⏳ Pendente |
| 4 | SF Academy | 12-16h | ⏳ Pendente |
| 5 | Events | 8-10h | ⏳ Pendente |
| 6 | SF Business | 20-30h | ⏳ Pendente |
| 7 | Marketplace | 30-40h | ⏳ Pendente |
| 8 | Streaming | TBD | 🔮 Futuro |

**Total estimado:** 118-160 horas (15-20 dias úteis)

---

## ✅ Checklist de Validação (Pós-Migração)

### Por Wave

- [ ] Todas as funcionalidades migradas para Supabase
- [ ] Fallback removido do código
- [ ] Testes unitários passando (100%)
- [ ] Testes de integração passando
- [ ] Validação manual completa
- [ ] Performance aceitável (<200ms P95)
- [ ] RLS policies auditadas
- [ ] Documentação atualizada

### Final (Wave 8)

- [ ] Zero referências a `StorageService` (exceto migrations)
- [ ] `storageService.ts` movido para `src/legacy/`
- [ ] 100% coverage RLS
- [ ] 80%+ test coverage geral
- [ ] Deploy em produção validado
- [ ] Monitoramento ativo (logs, errors, performance)

---

## 📚 Referências

- [Supabase Docs](https://supabase.com/docs)
- [RLS Policies Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)
- [Storage Guide](https://supabase.com/docs/guides/storage)

---

**FIM DO DOCUMENTO**  
Arquitetura definitiva aprovada para implementação.  
Próximo passo: Iniciar Wave 1 (Likes, Comments, Followers, Notifications, Messages).
