# 🎯 PLANO DE INTEGRAÇÃO DUPLA

**Data:** 2026-11-04  
**Escopo:** Integrar Sherdog + Wave 1 UI

---

## 📋 VISÃO GERAL

Duas frentes de trabalho em paralelo:

### FRENTE A: Integração Sherdog
**Objetivo:** Permitir que leads se cadastrem com link do Sherdog e vejam seu registro completo (cartel + histórico) dentro do STRAVA FIGHT

**Entregáveis:**
1. Migration 00007 aplicada (tabelas fighters + fights)
2. Tipos e services copiados
3. Component FighterRecordCard integrado
4. Campo sherdog_url no cadastro/perfil
5. Backfill configurado (aguardando string conexão)

### FRENTE B: Integração Wave 1 UI
**Objetivo:** Conectar os 5 services da Wave 1 (likes, comments, followers, notifications, messages) à interface existente

**Entregáveis:**
1. FeedView com likes + comments funcionais
2. ProfileView com followers funcionais
3. Notificações realtime funcionando
4. Mensagens DM funcionando
5. Testes passando + build OK

---

## 🔍 PRÉ-INTEGRAÇÃO: AUDITORIA DOS SERVICES WAVE 1

### Status Atual (já criados):
- ✅ likesService.ts (6 métodos)
- ✅ commentsService.ts (5 métodos)
- ✅ followersService.ts (8 métodos)
- ✅ notificationsService.ts (12 métodos + realtime)
- ✅ messagesService.ts (11 métodos + realtime)
- ✅ Migration 00013_wave_1_rpcs.sql (9 RPCs)

### Pontos a Verificar:

#### 1. Schema x Services
- [  ] Nomes de tabelas correspondem exatamente?
- [  ] Nomes de colunas correspondem (snake_case DB)?
- [  ] FKs corretas?
- [  ] Tipos TypeScript compatíveis com DB?

#### 2. RPCs (Stored Procedures)
- [  ] Existem em 00013_wave_1_rpcs.sql?
- [  ] Validação de permissões OK?
- [  ] Tratamento de concorrência (GREATEST para não negativar)?
- [  ] Grants para authenticated users?

#### 3. Integração com dbService.ts
- [  ] Services exportados em index.ts?
- [  ] Imports corretos?
- [  ] Padrão híbrido consistente?

---

## 📦 PARTE 1: INTEGRAÇÃO SHERDOG

### Checklist de Execução

#### 1.1. Copiar arquivos para o repo ✅ PRIORITÁRIO

```bash
# Migration
cp /home/catycaney/Downloads/stravafight-sherdog-pacote/integracao-stravafight/supabase/migrations/00007_sherdog_fighters.sql \
   /home/catycaney/Downloads/stravafight/supabase/migrations/00007_sherdog_fighters.sql

# Tipos
cp /home/catycaney/Downloads/stravafight-sherdog-pacote/integracao-stravafight/src/types/fighter.ts \
   /home/catycaney/Downloads/stravafight/src/types/fighter.ts

# Service
cp /home/catycaney/Downloads/stravafight-sherdog-pacote/integracao-stravafight/src/services/fighterService.ts \
   /home/catycaney/Downloads/stravafight/src/services/fighterService.ts

# Component
cp /home/catycaney/Downloads/stravafight-sherdog-pacote/integracao-stravafight/src/components/FighterRecordCard.tsx \
   /home/catycaney/Downloads/stravafight/src/components/FighterRecordCard.tsx
```

#### 1.2. Modificar tipos existentes

**Arquivo:** `src/types/index.ts`

Adicionar em `UserProfile`:
```typescript
  sherdogUrl?: string;
  sherdogId?: number;
```

#### 1.3. Atualizar AuthService

**Arquivo:** `src/services/supabase/authService.ts`

Adicionar em `SignUpPayload`:
```typescript
  sherdogUrl?: string;
```

Adicionar no upsert:
```typescript
  sherdog_url: payload.sherdogUrl || null,
```

#### 1.4. Integrar no ProfileView

**Arquivo:** `src/views/ProfileView.tsx`

```typescript
import { FighterRecordCard } from '../components/FighterRecordCard';

// No JSX (após info do perfil):
{profile.sherdogId && <FighterRecordCard sherdogId={profile.sherdogId} />}
```

#### 1.5. Validar build

```bash
npm run typecheck
npm run build
```

#### 1.6. Motor Sherdog (AGUARDANDO)

**BLOQUEADO:** Precisa de `DATABASE_URL` do Supabase

**Ação:** Documentar que está pronto mas aguardando credenciais

---

## 🎨 PARTE 2: INTEGRAÇÃO WAVE 1 UI

### Ordem de Implementação

#### 2.1. Revisar Services (PRIMEIRO)

Antes de tocar na UI, garantir que services estão corretos:

**Checklist:**
- [ ] Ler 00001_initial_schema.sql e validar que tabelas existem
- [ ] Verificar nomes de colunas (post_likes, post_comments, user_followers, etc)
- [ ] Confirmar que RPCs em 00013 correspondem ao que services chamam
- [ ] Testar imports: `import { LikesService } from '@/services/supabase'`

**Arquivos a revisar:**
1. `supabase/migrations/00001_initial_schema.sql` (linhas 150-280)
2. `src/services/supabase/likesService.ts`
3. `src/services/supabase/commentsService.ts`
4. `src/services/supabase/followersService.ts`
5. `src/services/supabase/notificationsService.ts`
6. `src/services/supabase/messagesService.ts`

**Correções esperadas:**
- Ajustar nomes de colunas se necessário
- Garantir que FKs estão corretos
- Validar que tipos Match com DB

#### 2.2. Integrar Likes + Comments no FeedView

**Arquivo:** `src/views/FeedView.tsx`

**Features a implementar:**
- [ ] Botão de curtir (toggle like/unlike)
- [ ] Contador de likes em tempo real
- [ ] Visual: hasLiked = filled heart
- [ ] Botão de comentar (abre modal)
- [ ] Contador de comentários
- [ ] Criar notificação ao curtir/comentar

**Imports necessários:**
```typescript
import { LikesService, CommentsService, NotificationsService } from '@/services/supabase';
```

**Lógica de like:**
```typescript
const handleLike = async (post: Post) => {
  if (post.hasLiked) {
    await LikesService.unlikePost(post.id, currentUser.id);
  } else {
    await LikesService.likePost(post.id, currentUser.id);
    // Notificar autor
    if (post.authorId !== currentUser.id) {
      await NotificationsService.notifyLike(post.authorId, currentUser.id, post.id);
    }
  }
  // Atualizar UI
  queryClient.invalidateQueries(['posts']);
};
```

**Lógica de verificação inicial:**
```typescript
useEffect(() => {
  if (posts.length > 0 && currentUser) {
    const postIds = posts.map(p => p.id);
    LikesService.checkMultipleLikes(postIds, currentUser.id).then(likesMap => {
      // Atualizar hasLiked de cada post
    });
  }
}, [posts]);
```

#### 2.3. Integrar CommentsModal

**Arquivo:** `src/components/CommentsModal.tsx`

**Features a implementar:**
- [ ] Listar comentários reais (paginados)
- [ ] Criar comentário
- [ ] Deletar comentário (se for autor)
- [ ] Notificar autor do post ao comentar
- [ ] Loading states
- [ ] Empty state

#### 2.4. Integrar Followers no ProfileView

**Arquivo:** `src/views/ProfileView.tsx`

**Features a implementar:**
- [ ] Botão Seguir/Seguindo
- [ ] Contadores followers/following atualizados
- [ ] Modal de lista de seguidores
- [ ] Modal de lista de seguindo
- [ ] Notificar ao seguir
- [ ] Prevenção de auto-follow

#### 2.5. Integrar Notificações

**Arquivos:**
- `src/components/BottomNav.tsx` (badge contador)
- Nova view ou modal para lista de notificações

**Features a implementar:**
- [ ] Badge com contador de não lidas
- [ ] Lista de notificações paginada
- [ ] Marcar como lida ao clicar
- [ ] Marcar todas como lidas
- [ ] Realtime subscription (useEffect cleanup)
- [ ] Navegação para post/perfil relacionado

#### 2.6. Integrar Mensagens DM

**Arquivo:** `src/views/DirectInboxView.tsx`

**Features a implementar:**
- [ ] Lista de conversas com last message
- [ ] Badge contador de não lidas
- [ ] View de conversa individual
- [ ] Enviar mensagem
- [ ] Realtime subscription
- [ ] Histórico paginado (scroll infinito)
- [ ] Estado de leitura (checkmarks)
- [ ] Empty state (sem conversas)

---

## 🧪 PARTE 3: VALIDAÇÃO E TESTES

### 3.1. Testes Estruturais
```bash
npm test
```

**Esperado:** 127 testes passando (60 originais + 67 Wave 1)

### 3.2. TypeScript
```bash
npm run typecheck
```

**Esperado:** 0 erros

### 3.3. Build
```bash
npm run build
```

**Esperado:** Build success

### 3.4. Testes Manuais (Checklist)

#### Likes:
- [ ] Curtir post → contador incrementa
- [ ] Descurtir post → contador decrementa
- [ ] Heart preenchido quando curtido
- [ ] Autor recebe notificação de like
- [ ] Não pode curtir próprio post (ou pode mas sem notificar)

#### Comments:
- [ ] Criar comentário → aparece na lista
- [ ] Deletar comentário (apenas se for autor)
- [ ] Contador de comentários atualiza
- [ ] Paginação funciona
- [ ] Autor do post recebe notificação

#### Followers:
- [ ] Seguir usuário → botão muda para "Seguindo"
- [ ] Deixar de seguir → botão volta para "Seguir"
- [ ] Contadores atualizam
- [ ] Usuário seguido recebe notificação
- [ ] Não pode seguir a si mesmo

#### Notifications:
- [ ] Badge atualiza em tempo real
- [ ] Clicar em notificação navega para conteúdo
- [ ] Marcar como lida remove badge
- [ ] Nova notificação aparece instantaneamente

#### Messages:
- [ ] Enviar mensagem → aparece na conversa
- [ ] Receber mensagem em tempo real
- [ ] Contador de não lidas atualiza
- [ ] Marcar conversa como lida limpa contador
- [ ] Histórico carrega ao scrollar

---

## 📝 DOCUMENTAÇÃO FINAL

### Arquivo: `docs/INTEGRACAO_WAVE_1.md`

**Conteúdo:**
1. Resumo das integrações realizadas
2. Arquivos modificados (lista completa)
3. Services integrados e onde
4. Testes executados
5. Problemas encontrados e soluções
6. Pendências (se houver)
7. Próximos passos

### Arquivo: `docs/INTEGRACAO_SHERDOG.md`

**Conteúdo:**
1. Arquivos copiados
2. Modificações nos tipos
3. Integração no ProfileView
4. Status do backfill (aguardando credenciais)
5. Como executar o backfill quando tiver DATABASE_URL

---

## ⚠️ RESTRIÇÕES E SEGURANÇA

### NÃO FAZER:
- ❌ Executar `supabase db push --linked`
- ❌ Fazer deploy sem aprovação
- ❌ Commitar credenciais
- ❌ Remover funcionalidades existentes
- ❌ Substituir implementações reais por mocks

### FAZER:
- ✅ Validar schema antes de integrar
- ✅ Preservar design existente
- ✅ Adicionar loading states
- ✅ Tratar erros gracefully
- ✅ Implementar cleanup de subscriptions
- ✅ Documentar tudo

---

## 📊 CRITÉRIOS DE SUCESSO

### Sherdog:
- [  ] Arquivos copiados e build OK
- [  ] FighterRecordCard renderiza (mock ou real)
- [  ] Campo sherdog_url no cadastro
- [  ] Documentado como rodar backfill

### Wave 1:
- [  ] Likes funcionando no feed
- [  ] Comentários funcionando
- [  ] Seguidores funcionando no perfil
- [  ] Notificações em tempo real
- [  ] Mensagens DM em tempo real
- [  ] Testes passando
- [  ] Build OK
- [  ] Documentação completa

---

## 🚀 ORDEM DE EXECUÇÃO

1. **SHERDOG (1-2h):**
   - Copiar arquivos
   - Modificar tipos
   - Integrar ProfileView
   - Validar build
   - Documentar

2. **WAVE 1 - REVISÃO (30min):**
   - Auditar services vs schema
   - Corrigir inconsistências
   - Validar exports

3. **WAVE 1 - LIKES/COMMENTS (2-3h):**
   - FeedView
   - CommentsModal
   - Validar

4. **WAVE 1 - FOLLOWERS (1-2h):**
   - ProfileView
   - Modals de listas
   - Validar

5. **WAVE 1 - NOTIFICATIONS (1-2h):**
   - BottomNav badge
   - Lista/modal
   - Realtime
   - Validar

6. **WAVE 1 - MESSAGES (2-3h):**
   - DirectInboxView
   - Conversa individual
   - Realtime
   - Validar

7. **TESTES FINAIS (1h):**
   - npm test
   - npm run build
   - Testes manuais

8. **DOCUMENTAÇÃO (30min):**
   - INTEGRACAO_WAVE_1.md
   - INTEGRACAO_SHERDOG.md

---

## 🎯 ESTIMATIVA TOTAL

- Sherdog: 1-2h
- Wave 1: 8-12h
- Testes: 1h
- Docs: 30min

**TOTAL: 10-15 horas**

---

**INÍCIO DA EXECUÇÃO:** Aguardando confirmação

**PRIORIDADE 1:** Sherdog (mais simples, menos risco)  
**PRIORIDADE 2:** Wave 1 UI (mais complexo, maior impacto)
