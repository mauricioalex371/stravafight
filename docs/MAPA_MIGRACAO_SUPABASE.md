# STRAVA FIGHT — MAPA DE MIGRAÇÃO PARA SUPABASE

**Data:** 04/11/2026  
**Objetivo:** Plano detalhado de migração gradual LocalStorage → Supabase

---

## ESTRATÉGIA GERAL

### Princípios
1. **Migração incremental** — um módulo por vez
2. **Validação rigorosa** — testes após cada etapa
3. **Fallback preservado** — manter LocalStorage como backup durante migração
4. **Zero downtime** — sistema funcional em todas as etapas
5. **Segurança first** — RLS validado antes de cada módulo

### Padrão de Implementação

Todos os serviços seguirão este padrão:

```typescript
// 1. Verificar se Supabase está configurado
if (!isSupabaseReady()) {
  return StorageService.getFallbackData();
}

try {
  // 2. Tentar operação no banco
  const { data, error } = await supabase
    .from('table')
    .select()
    .eq('user_id', auth.uid());
  
  if (error) {
    console.error('[Supabase] Erro:', error);
    return StorageService.getFallbackData();
  }
  
  // 3. Retornar dados reais
  return mapToFrontendModel(data);
  
} catch (err) {
  console.error('[Supabase] Exceção:', err);
  return StorageService.getFallbackData();
}
```

---

## ONDAS DE MIGRAÇÃO

### 🌊 ONDA 1: REDE SOCIAL BÁSICA (Prioridade Máxima)
**Prazo estimado:** 3-5 dias  
**Módulos:** 5  
**Complexidade:** Média

#### 1.1 CURTIDAS EM POSTS ⭐⭐
**Tabela:** `post_likes`  
**Dependências:** posts, profiles (já integradas)  
**RLS:** migration 00009

**Implementar em:** `src/services/supabase/dbService.ts`

```typescript
// Funções necessárias:
static async likePost(postId: string, userId: string): Promise<boolean>
static async unlikePost(postId: string, userId: string): Promise<boolean>
static async getPostLikes(postId: string): Promise<{userId: string, username: string}[]>
static async hasUserLikedPost(postId: string, userId: string): Promise<boolean>
```

**RLS validar:**
- ✅ Usuário pode curtir qualquer post público
- ✅ Usuário pode descurtir apenas própria curtida
- ✅ Listagem de curtidas pública

**Teste de integração:**
1. UserA curte post de UserB
2. UserB vê contador atualizado
3. UserA descurte
4. Contador decrementa

**Estimativa:** 4-6 horas

---

#### 1.2 COMENTÁRIOS EM POSTS ⭐⭐⭐
**Tabela:** `post_comments`  
**Dependências:** posts, profiles, post_likes (curtidas em comentários)  
**RLS:** migration 00009

**Implementar em:** `src/services/supabase/dbService.ts`

```typescript
static async createComment(postId: string, userId: string, content: string): Promise<boolean>
static async getComments(postId: string): Promise<Comment[]>
static async deleteComment(commentId: string, userId: string): Promise<boolean>
static async likeComment(commentId: string, userId: string): Promise<boolean>
```

**RLS validar:**
- ✅ Usuário pode comentar em posts públicos
- ✅ Usuário pode deletar apenas próprios comentários
- ✅ Owner do post pode deletar qualquer comentário
- ✅ Comentários seguem privacidade do post

**Teste de integração:**
1. UserA comenta post de UserB
2. UserB vê comentário em tempo real (se Realtime ativo)
3. UserA deleta próprio comentário
4. UserB tenta deletar comentário de UserA (deve falhar)
5. UserB deleta comentário no próprio post (deve funcionar)

**Estimativa:** 6-8 horas

---

#### 1.3 SEGUIDORES E AMIGOS ⭐⭐⭐
**Tabelas:** `followers`, `friend_requests`  
**Dependências:** profiles  
**RLS:** migration 00010

**Implementar em:** `src/services/supabase/socialService.ts` (novo arquivo)

```typescript
// Seguidores
static async followUser(followerId: string, followingId: string): Promise<boolean>
static async unfollowUser(followerId: string, followingId: string): Promise<boolean>
static async getFollowers(userId: string): Promise<UserProfile[]>
static async getFollowing(userId: string): Promise<UserProfile[]>
static async isFollowing(followerId: string, followingId: string): Promise<boolean>

// Amigos
static async sendFriendRequest(senderId: string, recipientId: string): Promise<boolean>
static async acceptFriendRequest(requestId: string): Promise<boolean>
static async declineFriendRequest(requestId: string): Promise<boolean>
static async getFriendRequests(userId: string): Promise<FriendRequest[]>
static async getFriends(userId: string): Promise<UserProfile[]>
static async removeFriend(userId: string, friendId: string): Promise<boolean>
```

**RLS validar:**
- ✅ Usuário pode seguir qualquer perfil público
- ✅ Usuário pode ver próprios seguidores
- ✅ Usuário pode ver seguidores de perfis públicos
- ✅ Solicitações de amizade privadas (apenas sender e recipient)
- ✅ Usuário não pode aceitar solicitação de outro

**Teste de integração:**
1. UserA segue UserB
2. UserB vê follower_count incrementar
3. UserA deixa de seguir UserB
4. UserA envia solicitação de amizade para UserB
5. UserB aceita
6. Ambos veem friend_count incrementar

**Estimativa:** 8-10 horas

---

#### 1.4 NOTIFICAÇÕES ⭐⭐
**Tabela:** `notifications`  
**Dependências:** posts, profiles, followers, post_likes, post_comments  
**RLS:** migration 00010  
**Realtime:** SIM

**Implementar em:** `src/services/supabase/notificationsService.ts` (novo arquivo)

```typescript
static async getNotifications(userId: string, unreadOnly?: boolean): Promise<NotificationItem[]>
static async markAsRead(notificationId: string, userId: string): Promise<boolean>
static async markAllAsRead(userId: string): Promise<boolean>
static async getUnreadCount(userId: string): Promise<number>
static async deleteNotification(notificationId: string, userId: string): Promise<boolean>

// Sistema cria notificações automaticamente via Database Triggers
```

**RLS validar:**
- ✅ Usuário vê apenas próprias notificações
- ✅ Usuário pode marcar apenas próprias como lidas
- ✅ Usuário pode deletar apenas próprias

**Realtime configurar:**
```typescript
const channel = supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `recipient_id=eq.${userId}`
  }, (payload) => {
    // Adicionar notificação em tempo real
  })
  .subscribe();
```

**Teste de integração:**
1. UserA curte post de UserB
2. UserB recebe notificação em tempo real
3. UserB marca como lida
4. Counter de não lidas decrementa

**Estimativa:** 6-8 horas

---

#### 1.5 MENSAGENS PRIVADAS ⭐⭐⭐⭐
**Tabelas:** `direct_conversations`, `direct_messages`  
**Dependências:** profiles  
**RLS:** migration 00001  
**Realtime:** SIM (crítico)

**Implementar em:** `src/services/supabase/messagesService.ts` (novo arquivo)

```typescript
// Conversas
static async getConversations(userId: string): Promise<DirectConversation[]>
static async getOrCreateConversation(user1Id: string, user2Id: string): Promise<string>
static async markConversationAsRead(convId: string, userId: string): Promise<boolean>
static async deleteConversation(convId: string, userId: string): Promise<boolean>

// Mensagens
static async getMessages(convId: string, userId: string): Promise<ChatMessage[]>
static async sendMessage(convId: string, senderId: string, content: string, mediaUrl?: string): Promise<ChatMessage>
static async deleteMessage(messageId: string, userId: string): Promise<boolean>
static async getUnreadMessagesCount(userId: string): Promise<number>
```

**RLS CRÍTICO validar:**
- ✅ Usuário vê apenas conversas que participa
- ✅ Usuário não lê mensagens de conversas alheias
- ✅ Usuário não envia mensagens como outro usuário
- ✅ Participantes da conversa isolados

**Realtime configurar:**
```typescript
const channel = supabase
  .channel(`conversation:${convId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'direct_messages',
    filter: `conversation_id=eq.${convId}`
  }, (payload) => {
    // Adicionar mensagem em tempo real
  })
  .subscribe();
```

**Teste de isolamento (CRÍTICO):**
1. UserA e UserB têm conversa
2. UserC tenta ler mensagens da conversa A-B (deve retornar 0 rows)
3. UserC tenta enviar mensagem como UserA (deve falhar RLS)
4. UserA envia mensagem, UserB recebe em tempo real
5. UserB responde, UserA recebe em tempo real

**Estimativa:** 10-12 horas

---

### 🌊 ONDA 2: CONTEÚDO DINÂMICO (Segunda Prioridade)
**Prazo estimado:** 2-3 dias  
**Módulos:** 2  
**Complexidade:** Média

#### 2.1 STORIES ⭐⭐
**Tabela:** `stories`  
**Dependências:** profiles, Storage  
**RLS:** migration 00001

**Implementar em:** `src/services/supabase/dbService.ts`

```typescript
static async getStories(userId?: string): Promise<Story[]>
static async createStory(story: Story): Promise<boolean>
static async deleteStory(storyId: string, userId: string): Promise<boolean>
static async markStoryAsViewed(storyId: string, viewerId: string): Promise<boolean>
static async getStoryViewers(storyId: string): Promise<{userId: string, viewedAt: string}[]>
```

**RLS validar:**
- ✅ Usuário vê stories de quem segue
- ✅ Usuário pode deletar apenas próprios stories
- ✅ Privacidade respeitada (private, friends_only, public)
- ✅ Visualizações registradas

**Teste de integração:**
1. UserA cria story público
2. UserB (seguidor) vê story
3. UserC (não seguidor) não vê story privado
4. Story expira após 24h (trigger ou cron job)

**Estimativa:** 4-6 horas

---

#### 2.2 REELS ⭐⭐⭐
**Tabela:** `reels`  
**Dependências:** profiles, Storage, post_likes (reels usam mesma tabela)  
**RLS:** migration 00001

**Implementar em:** `src/services/supabase/dbService.ts`

```typescript
static async getReels(page?: number): Promise<{reels: Reel[], hasMore: boolean}>
static async getReelById(reelId: string): Promise<Reel | null>
static async createReel(reel: Reel): Promise<boolean>
static async deleteReel(reelId: string, userId: string): Promise<boolean>
static async likeReel(reelId: string, userId: string): Promise<boolean>
static async unlikeReel(reelId: string, userId: string): Promise<boolean>
static async commentOnReel(reelId: string, userId: string, content: string): Promise<boolean>
```

**RLS validar:**
- ✅ Reels públicos visíveis para todos
- ✅ Usuário pode deletar apenas próprios reels
- ✅ Curtidas e comentários seguem mesma lógica de posts

**Teste de integração:**
1. UserA faz upload de vídeo para Storage (bucket reels)
2. UserA cria reel com URL do vídeo
3. UserB vê reel no feed de Reels
4. UserB curte reel
5. UserA vê contador incrementar

**Estimativa:** 6-8 horas

---

### 🌊 ONDA 3: SF ACTIVITY (Diferencial)
**Prazo estimado:** 2 dias  
**Módulos:** 1  
**Complexidade:** Média

#### 3.1 SF ACTIVITY ⭐⭐⭐
**Tabelas:** Usa `posts` com campo `training_data`  
**Dependências:** profiles, posts, Storage  
**RLS:** migration 00001 (posts)

**Implementar em:** `src/services/supabase/dbService.ts`

```typescript
// SF Activity é um tipo especial de Post
static async createSfActivityPost(activity: {
  userId: string;
  modality: string;
  duration: number;
  distance?: number;
  description: string;
  mediaUrl: string; // Imagem com overlay gerado pelo editor
  trainingData: {
    modality: string;
    duration: number;
    distance?: number;
    pace?: string;
    calories?: number; // Estimado
    timestamp: string;
    location?: string;
  };
}): Promise<boolean>

// Listagem de atividades
static async getUserActivities(userId: string): Promise<Post[]>
static async getFriendsActivities(userId: string): Promise<Post[]>
```

**Features do SF Activity:**
- ✅ Editor de overlay já implementado no frontend
- ✅ Upload de foto para Storage
- ✅ Post criado com training_data
- ✅ Aparece no feed com badge "SF Activity"

**RLS validar:**
- ✅ Mesmas regras de posts regulares
- ✅ Privacidade configurável

**Teste de integração:**
1. UserA registra treino (Muay Thai, 60min)
2. Editor gera imagem com overlay
3. Upload para Storage (sf-activities bucket)
4. Post criado com training_data
5. Amigos veem no feed com badge SF Activity

**Estimativa:** 4-6 horas

---

### 🌊 ONDA 4: SF ACADEMY (Gestão de Academias)
**Prazo estimado:** 3-4 dias  
**Módulos:** 1  
**Complexidade:** Alta

#### 4.1 SF ACADEMY COMPLETO ⭐⭐⭐⭐
**Tabelas:** `academy_students`, `academy_classes`, `academy_attendance`, `academy_fees`, `academy_cash`, `academy_trial_students`  
**Dependências:** profiles  
**RLS:** migration 00002  
**Permissões:** Apenas professores/admins da academia

**Implementar em:** `src/services/supabase/academyService.ts` (novo arquivo)

```typescript
// CRUD Alunos
static async createStudent(student: Student): Promise<boolean>
static async updateStudent(studentId: string, updates: Partial<Student>): Promise<boolean>
static async getStudents(academyId: string): Promise<Student[]>
static async getStudentById(studentId: string): Promise<Student | null>
static async deleteStudent(studentId: string): Promise<boolean>

// CRUD Turmas
static async createClass(classEntity: ClassEntity): Promise<boolean>
static async updateClass(classId: string, updates: Partial<ClassEntity>): Promise<boolean>
static async getClasses(academyId: string): Promise<ClassEntity[]>
static async deleteClass(classId: string): Promise<boolean>

// Presença
static async registerAttendance(record: AttendanceRecord): Promise<boolean>
static async getAttendance(academyId: string, dateRange?: {from: string, to: string}): Promise<AttendanceRecord[]>
static async getStudentAttendance(studentId: string): Promise<AttendanceRecord[]>

// Mensalidades
static async createFee(fee: MonthlyFee): Promise<boolean>
static async updateFeeStatus(feeId: string, status: 'PAGO' | 'PENDENTE' | 'ATRASADO'): Promise<boolean>
static async getFees(academyId: string, month?: string): Promise<MonthlyFee[]>
static async getStudentFees(studentId: string): Promise<MonthlyFee[]>

// Caixa
static async createTransaction(transaction: CashTransaction): Promise<boolean>
static async getTransactions(academyId: string, dateRange?: {from: string, to: string}): Promise<CashTransaction[]>
static async getCashBalance(academyId: string): Promise<number>

// Alunos Experimentais
static async createTrialStudent(trial: TrialStudent): Promise<boolean>
static async convertTrialToStudent(trialId: string): Promise<boolean>
static async getTrialStudents(academyId: string): Promise<TrialStudent[]>
```

**RLS CRÍTICO validar:**
- ✅ Apenas professores/admins da academia acessam dados
- ✅ Alunos não veem dados de outras academias
- ✅ Dados financeiros protegidos
- ✅ Perfis de alunos isolados por academia

**Teste de isolamento:**
1. Professor da Academia A cria aluno
2. Professor da Academia B não vê aluno da Academia A
3. Aluno vinculado à Academia A não acessa dados da Academia B
4. Admin global (se houver) vê todas as academias

**Estimativa:** 12-16 horas

---

### 🌊 ONDA 5: EVENTOS E CAMPEONATOS
**Prazo estimado:** 2-3 dias  
**Módulos:** 1  
**Complexidade:** Média

#### 5.1 EVENTOS E RESULTADOS ⭐⭐⭐
**Tabelas:** `events`, `event_registrations`, `event_results`  
**Dependências:** profiles  
**RLS:** migration 00006

**Implementar em:** `src/services/supabase/eventsService.ts` (refatorar existente)

```typescript
// CRUD Eventos
static async createEvent(event: CombatEvent): Promise<boolean>
static async updateEvent(eventId: string, updates: Partial<CombatEvent>): Promise<boolean>
static async getEvents(filters?: {modality?: string, status?: string}): Promise<CombatEvent[]>
static async getEventById(eventId: string): Promise<CombatEvent | null>
static async deleteEvent(eventId: string): Promise<boolean>

// Inscrições
static async registerForEvent(eventId: string, userId: string, categoryId: string): Promise<boolean>
static async cancelRegistration(registrationId: string, userId: string): Promise<boolean>
static async getEventRegistrations(eventId: string): Promise<EventRegistration[]>
static async getUserRegistrations(userId: string): Promise<EventRegistration[]>

// Resultados
static async createResult(result: EventResult): Promise<boolean>
static async updateResult(resultId: string, updates: Partial<EventResult>): Promise<boolean>
static async getEventResults(eventId: string): Promise<EventResult[]>
static async getUserResults(userId: string): Promise<EventResult[]>
```

**RLS validar:**
- ✅ Eventos públicos visíveis para todos
- ✅ Apenas organizador pode editar/deletar evento
- ✅ Usuário pode se inscrever em eventos abertos
- ✅ Resultados públicos após evento concluído

**Teste de integração:**
1. Organizador cria evento (campeonato Muay Thai)
2. UserA se inscreve na categoria "até 70kg"
3. Evento acontece
4. Organizador registra resultados
5. UserA vê resultado no perfil

**Estimativa:** 8-10 horas

---

### 🌊 ONDA 6: SF BUSINESS (Sistema Complexo)
**Prazo estimado:** 5-7 dias  
**Módulos:** 1  
**Complexidade:** Muito Alta

#### 6.1 SF BUSINESS COMPLETO ⭐⭐⭐⭐⭐
**Tabelas:** 15+ tabelas (profiles, campaigns, products, opportunities, ads, analytics, etc)  
**Dependências:** profiles, Storage, payments (futuro)  
**RLS:** migration 00002  
**Sistema:** Offline-first com sync

**Status atual:**
- ✅ businessService.ts implementado (LocalStorage)
- ✅ businessSyncService.ts implementado (fila de sync)
- ✅ businessMigrationService.ts implementado (migração de dados)
- ❌ Nenhuma integração com Supabase

**Desafio:** Sistema extremamente complexo com 1.179 linhas em businessService.ts

**Estratégia recomendada:**

**Fase 1: Perfis Comerciais**
```typescript
// src/services/supabase/businessService.ts (novo)
static async createBusinessProfile(profile: BusinessProfile): Promise<boolean>
static async updateBusinessProfile(profileId: string, updates: Partial<BusinessProfile>): Promise<boolean>
static async getBusinessProfile(profileId: string): Promise<BusinessProfile | null>
static async getBusinessProfiles(filters?: {category?: string}): Promise<BusinessProfile[]>
```

**Fase 2: Campanhas**
```typescript
static async createCampaign(campaign: BusinessCampaign): Promise<boolean>
static async updateCampaign(campaignId: string, updates: Partial<BusinessCampaign>): Promise<boolean>
static async getCampaigns(businessId: string): Promise<BusinessCampaign[]>
static async pauseCampaign(campaignId: string): Promise<boolean>
static async resumeCampaign(campaignId: string): Promise<boolean>
```

**Fase 3: Produtos**
```typescript
static async createProduct(product: BusinessProduct): Promise<boolean>
static async updateProduct(productId: string, updates: Partial<BusinessProduct>): Promise<boolean>
static async getProducts(businessId: string): Promise<BusinessProduct[]>
static async deleteProduct(productId: string): Promise<boolean>
```

**Fase 4: Sincronização Offline**
```typescript
// Adaptar businessSyncService.ts para usar Supabase
static async syncPendingOperations(): Promise<{success: number, failed: number}>
static async queueOperation(operation: BusinessOperation): Promise<boolean>
static async processSyncQueue(): Promise<void>
```

**RLS CRÍTICO validar:**
- ✅ Apenas dono do negócio edita perfil/campanhas/produtos
- ✅ Dados de analytics privados
- ✅ Orçamento de campanhas não exposto
- ✅ Métricas reais, não inventadas

**Teste de isolamento:**
1. Negócio A cria campanha
2. Negócio B não vê campanha de A
3. Negócio B não edita perfil de A
4. Usuário comum vê apenas anúncios públicos, não dados internos

**Estimativa:** 20-30 horas (muito complexo)

---

### 🌊 ONDA 7: MARKETPLACE (Sistema Complexo)
**Prazo estimado:** 7-10 dias  
**Módulos:** 1  
**Complexidade:** Muito Alta

#### 7.1 MARKETPLACE COMPLETO ⭐⭐⭐⭐⭐
**Tabelas:** 12+ tabelas (stores, products, orders, payments, webhooks, shipments, reviews, etc)  
**Dependências:** profiles, Storage, Payment Gateway  
**RLS:** migration 00005 + 00012  
**Integrações:** Pix, Cartões, Frete

**Fases de implementação:**

**Fase 1: Lojas e Produtos (Catálogo)**
```typescript
static async createStore(store: MarketplaceStore): Promise<boolean>
static async updateStore(storeId: string, updates: Partial<MarketplaceStore>): Promise<boolean>
static async getStore(storeId: string): Promise<MarketplaceStore | null>
static async createProduct(product: MarketplaceProduct): Promise<boolean>
static async updateProduct(productId: string, updates: Partial<MarketplaceProduct>): Promise<boolean>
static async getProducts(filters?: {category?: string, storeId?: string}): Promise<MarketplaceProduct[]>
```

**Fase 2: Carrinho e Pedidos**
```typescript
static async addToCart(userId: string, productId: string, quantity: number): Promise<boolean>
static async getCart(userId: string): Promise<CartItem[]>
static async createOrder(order: MarketplaceOrder): Promise<string> // Retorna orderId
static async getOrders(userId: string): Promise<MarketplaceOrder[]>
static async getOrderDetails(orderId: string): Promise<MarketplaceOrder>
```

**Fase 3: Pagamentos (CRÍTICO)**
```typescript
// Integração com gateway (Stripe, Mercado Pago, PagSeguro)
static async createPaymentIntent(orderId: string, amount: number): Promise<{clientSecret: string}>
static async confirmPayment(paymentId: string): Promise<boolean>
static async refundPayment(paymentId: string): Promise<boolean>
static async getPaymentStatus(paymentId: string): Promise<string>

// Webhooks (migration 00012 protege essa tabela)
static async handlePaymentWebhook(provider: string, payload: any): Promise<boolean>
```

**Fase 4: Envio e Rastreamento**
```typescript
static async createShipment(orderId: string, shipment: Shipment): Promise<boolean>
static async updateShipmentStatus(shipmentId: string, status: string): Promise<boolean>
static async getShipmentTracking(shipmentId: string): Promise<Shipment>
```

**Fase 5: Avaliações**
```typescript
static async createReview(review: ProductReview): Promise<boolean>
static async getReviews(productId: string): Promise<ProductReview[]>
static async deleteReview(reviewId: string, userId: string): Promise<boolean>
```

**RLS ULTRA CRÍTICO validar:**
- ✅ `marketplace_payment_webhooks` protegida (migration 00012)
- ✅ Apenas service_role insere webhooks
- ✅ Apenas admins leem webhooks
- ✅ Usuário vê apenas próprios pedidos
- ✅ Vendedor vê apenas pedidos da própria loja
- ✅ Dados financeiros isolados

**Teste de segurança financeira:**
1. UserA cria pedido
2. UserB não vê pedido de UserA
3. UserA não consegue inserir webhook falso
4. UserA não lê webhooks do sistema
5. Admin lê webhooks para debug
6. Backend (service_role) insere webhooks de pagamento
7. Signature de webhook validada antes de processar

**Estimativa:** 30-40 horas (muito complexo + integração externa)

---

### 🌊 ONDA 8: STREAMING (Futuro)
**Prazo estimado:** 10-15 dias  
**Módulos:** 1  
**Complexidade:** Muito Alta

#### 8.1 TRANSMISSÕES AO VIVO ⭐⭐⭐⭐⭐
**Tabelas:** `streams`  
**Dependências:** profiles, eventos  
**RLS:** migration 00006  
**Integrações:** Streaming provider (Twitch, YouTube, custom RTMP)

**Ação recomendada:** **ADIAR** para etapa posterior

**Motivo:**
- Requer infraestrutura de streaming (complexo e caro)
- Pode usar incorporação de provedores externos (YouTube, Twitch)
- Não é essencial para lançamento inicial

**Quando implementar:** Após validação de mercado e receita

**Estimativa:** 40-60 horas (complexo + infraestrutura)

---

## RESUMO DE ESTIMATIVAS

### Por Onda

| Onda | Módulos | Complexidade | Horas | Dias úteis |
|------|---------|--------------|-------|------------|
| 1 — Rede Social Básica | 5 | Média | 34-44h | 4-6 dias |
| 2 — Conteúdo Dinâmico | 2 | Média | 10-14h | 2-3 dias |
| 3 — SF Activity | 1 | Média | 4-6h | 1 dia |
| 4 — SF Academy | 1 | Alta | 12-16h | 2-3 dias |
| 5 — Eventos | 1 | Média | 8-10h | 2 dias |
| 6 — SF Business | 1 | Muito Alta | 20-30h | 3-5 dias |
| 7 — Marketplace | 1 | Muito Alta | 30-40h | 5-7 dias |
| 8 — Streaming | 1 | Muito Alta | 40-60h | **ADIAR** |

**Total estimado (ondas 1-7):** 118-160 horas → **15-20 dias úteis** de trabalho focado

---

## ORDEM DE EXECUÇÃO RECOMENDADA

### Sprint 1 (Semana 1-2): Rede Social Básica
- [x] Autenticação (já integrada)
- [x] Perfis (já integrado)
- [x] Posts (já integrado)
- [x] Storage (já integrado)
- [ ] Curtidas
- [ ] Comentários
- [ ] Seguidores/Amigos
- [ ] Notificações
- [ ] Mensagens Privadas

**Resultado:** Rede social funcional multi-usuário

### Sprint 2 (Semana 3): Conteúdo + SF Activity
- [ ] Stories
- [ ] Reels
- [ ] SF Activity

**Resultado:** Diferencial de conteúdo implementado

### Sprint 3 (Semana 4): SF Academy + Eventos
- [ ] SF Academy completo
- [ ] Eventos e campeonatos

**Resultado:** Gestão de academias funcional

### Sprint 4 (Semana 5-6): SF Business
- [ ] Perfis comerciais
- [ ] Campanhas
- [ ] Produtos
- [ ] Sincronização offline

**Resultado:** Módulo comercial funcional

### Sprint 5 (Semana 7-9): Marketplace
- [ ] Catálogo
- [ ] Carrinho e pedidos
- [ ] Pagamentos (gateway real)
- [ ] Envios
- [ ] Avaliações

**Resultado:** E-commerce completo

### Sprint 6 (Futuro): Streaming
- [ ] Adiar até validação de mercado

---

## CRITÉRIOS DE CONCLUSÃO

Cada módulo é considerado **concluído** quando:

1. ✅ **CRUD completo** implementado
2. ✅ **RLS validado** com testes de isolamento
3. ✅ **Testes de integração** passando
4. ✅ **Fallback** removido ou mantido apenas para dev
5. ✅ **Documentação** atualizada
6. ✅ **UI** conectada ao backend real
7. ✅ **Performance** validada (queries < 500ms)
8. ✅ **Segurança** auditada (sem vazamento de dados)

---

## RISCOS E MITIGAÇÕES

### Risco 1: RLS mal configurado
**Impacto:** Vazamento de dados entre usuários  
**Mitigação:** Testes de isolamento obrigatórios antes de cada módulo

### Risco 2: Performance de queries
**Impacto:** Lentidão na aplicação  
**Mitigação:** Índices no banco, paginação, cache

### Risco 3: Migração de dados existentes
**Impacto:** Perda de dados de desenvolvimento  
**Mitigação:** Manter fallback durante migração, backup antes de cada onda

### Risco 4: Complexidade do SF Business
**Impacto:** Atraso na entrega  
**Mitigação:** Dividir em fases menores, implementar MVP primeiro

### Risco 5: Integrações externas (pagamentos, frete)
**Impacto:** Dependência de terceiros  
**Mitigação:** Usar provedores confiáveis (Stripe, Mercado Pago), ter plano B

---

## PRÓXIMO PASSO

Após aprovação deste mapa, iniciar **ONDA 1 — Rede Social Básica**, começando por:

1. **Curtidas em Posts** (mais simples)
2. **Comentários** (dependência de curtidas)
3. **Seguidores/Amigos** (base para feed)
4. **Notificações** (feedback de interações)
5. **Mensagens Privadas** (comunicação)

**Prazo:** 4-6 dias úteis  
**Resultado:** STRAVA FIGHT como rede social real e funcional

---

**Status:** Planejamento concluído, aguardando aprovação para início da implementação
