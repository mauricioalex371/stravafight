# STRAVA FIGHT — ANÁLISE ESTRATÉGICA

**Data:** 04/11/2026  
**Objetivo:** Mapear estado atual e planejar reestruturação completa

---

## INVENTÁRIO TÉCNICO EXECUTADO

### Métricas Gerais
- **Total de código:** 22.516 linhas
- **Arquivos TypeScript:** 69
- **Componentes:** 21
- **Views/Páginas:** 10
- **Serviços:** 15
- **Testes:** 9 suites (60 testes)
- **Migrations SQL:** 12

### Estrutura de Código

**VIEWS (10 páginas principais):**
1. FeedView — Feed principal da rede social
2. ExploreView — Descoberta de conteúdo
3. ReelsView — Vídeos curtos (SF Reels)
4. DirectInboxView — Mensagens privadas
5. ProfileView — Perfil do usuário
6. AcademyView — Gestão de academias
7. BusinessView — Módulo comercial
8. FriendsView — Rede de amigos/seguidores
9. EventsView — Eventos e campeonatos
10. InstitutionalView — Páginas institucionais

**COMPONENTES PRINCIPAIS (21):**
- Navegação: Navbar, Sidebar, BottomNav
- Modais: SfActivityModal, CreatePostModal, CommentsModal, ShareModal, etc
- Utilidades: ErrorBoundary, SkeletonLoading, OfflineIndicator
- Específicos: BusinessMigrationModal, BusinessSyncIndicator

**SERVIÇOS (15):**
- storageService.ts — Gerenciamento de LocalStorage
- businessService.ts — SF Business
- businessSyncService.ts — Sincronização offline
- businessMigrationService.ts — Migração de dados
- eventsService.ts — Eventos e campeonatos
- marketplaceService.ts — Marketplace
- moderationService.ts — Moderação
- searchService.ts — Busca
- streamsService.ts — Transmissões
- supabaseClient.ts — Cliente Supabase

**CONTEXTS (1):**
- AuthContext.tsx — Autenticação centralizada

**HOOKS (2):**
- useOnlineStatus.ts — Status de conexão
- usePWAInstall.ts — Instalação PWA

---

## ANÁLISE INICIAL — ARQUITETURA

### ✅ PONTOS FORTES IDENTIFICADOS

1. **Code Splitting Implementado**
   - Views secundárias carregadas com React.lazy()
   - Modais pesados carregados dinamicamente
   - Otimização de bundle

2. **Estrutura Organizada**
   - Separação clara entre views, components, services
   - Migrations SQL versionadas (00001-00012)
   - Testes automatizados (60 testes passando)

3. **Funcionalidades Implementadas**
   - Feed de publicações
   - Stories e Reels
   - Mensagens privadas
   - Perfis e amizades
   - SF Academy (gestão de academias)
   - SF Business (módulo comercial)
   - Eventos e campeonatos
   - Marketplace
   - Moderação e segurança
   - Sistema offline-first (Business Sync)

4. **Segurança**
   - RLS implementado em 57/57 tabelas (100%)
   - 119 policies ativas
   - Autenticação centralizada
   - Moderação implementada

### ⚠️ PONTOS DE ATENÇÃO IDENTIFICADOS

1. **Storage Centralizado em LocalStorage**
   - StorageService.ts parece ser a fonte principal de dados
   - Pode indicar uso excessivo de mocks/dados simulados
   - Precisa validar integração real com Supabase

2. **Possível Duplicação de Estado**
   - App.tsx mantém MUITO estado local
   - Pode haver conflito entre LocalStorage e Supabase
   - Precisa verificar fluxo de dados real

3. **Autenticação**
   - Apenas 1 Context (AuthContext)
   - Precisa validar se está centralizada adequadamente
   - Verificar se módulos não mantêm estados conflitantes

4. **Complexidade do App.tsx**
   - Muitos estados locais no componente principal
   - Pode dificultar manutenção e testes
   - Candidato à refatoração

---

## PRÓXIMAS ANÁLISES NECESSÁRIAS

Para executar a missão completa, preciso analisar em detalhes:

### 1. INTEGRAÇÃO SUPABASE vs LOCALSTORAGE
- [ ] Verificar se StorageService é mock ou camada de cache
- [ ] Validar fluxo real de dados com backend
- [ ] Identificar funcionalidades que usam apenas LocalStorage
- [ ] Mapear funcionalidades com integração real

### 2. ESTADO DA REDE SOCIAL
- [ ] Analisar FeedView — integração real?
- [ ] Validar posts, curtidas, comentários — backend ou mock?
- [ ] Verificar perfis — Supabase profiles ou LocalStorage?
- [ ] Testar busca — SearchService real ou simulado?

### 3. SF REELS
- [ ] Verificar se vídeos são carregados do Storage
- [ ] Validar upload e reprodução
- [ ] Identificar se é funcional ou apenas UI

### 4. SF ACTIVITY
- [ ] Validar SfActivityModal — editor funcional?
- [ ] Verificar salvamento no backend
- [ ] Testar compartilhamento no feed

### 5. SF ACADEMY
- [ ] AcademyView — integração com banco?
- [ ] Gestão de alunos — real ou mock?
- [ ] Vínculos com usuários — implementado?

### 6. SF BUSINESS
- [ ] BusinessView — funcional ou interface?
- [ ] Business Sync — realmente funciona offline?
- [ ] Migração de dados — quando necessária?

### 7. MARKETPLACE
- [ ] MarketplaceService — integrado ao banco?
- [ ] Produtos — reais ou simulados?
- [ ] Checkout — implementado ou planejado?

### 8. MENSAGENS E NOTIFICAÇÕES
- [ ] DirectInboxView — Realtime funcionando?
- [ ] Notificações — integradas ao Supabase?
- [ ] Isolamento entre usuários — validado?

---

## ESTRATÉGIA DE TRABALHO

Devido ao tamanho do projeto (22k linhas), vou executar a reestruturação em **fases incrementais** com commits verificáveis:

### FASE 1: ANÁLISE DETALHADA (ATUAL)
✅ Inventário completo executado
⏳ Classificação de funcionalidades (próximo)
⏳ Identificação de integrações reais vs mocks

### FASE 2: CONSOLIDAÇÃO DA BASE
- Padronizar cliente Supabase
- Centralizar autenticação
- Eliminar duplicações
- Validar fluxo de dados

### FASE 3: OTIMIZAÇÃO DA REDE SOCIAL
- Fortalecer Feed
- Consolidar perfis
- Melhorar busca
- Otimizar performance

### FASE 4: INTEGRAÇÃO DOS MÓDULOS
- SF Reels
- SF Activity
- SF Academy
- SF Business

### FASE 5: SIMPLIFICAÇÃO
- Reduzir complexidade desnecessária
- Manter funcionalidades essenciais
- Preparar expansões futuras

### FASE 6: DOCUMENTAÇÃO E VALIDAÇÃO
- Plano de evolução
- Estado real das funcionalidades
- Testes completos

---

## DECISÕES PENDENTES

Antes de continuar, preciso entender:

### QUESTÃO CRÍTICA 1: StorageService

O arquivo `storageService.ts` parece ser a fonte principal de dados. Isso indica:

**A)** Sistema usa principalmente LocalStorage (offline-first real)  
**B)** StorageService é camada de cache sobre Supabase  
**C)** Funcionalidades ainda usam mocks extensivamente  

**Ação:** Analisar StorageService.ts para entender arquitetura real

### QUESTÃO CRÍTICA 2: Escopo da Reestruturação

Considerando:
- 22.516 linhas de código
- 69 arquivos TypeScript
- 10 views principais
- Complexidade significativa

Preciso definir:

**Opção A:** Reestruturação completa em uma única execução (arriscado, pode levar horas)  
**Opção B:** Reestruturação incremental com commits verificáveis (mais seguro)  
**Opção C:** Análise profunda primeiro, implementação depois com aprovação

**Recomendação:** Opção B — Incremental e verificável

---

## PRÓXIMO PASSO

Vou analisar o **StorageService.ts** para entender a arquitetura real de dados, e então classificar cada funcionalidade conforme solicitado:

1. Operacional e integrada ao backend
2. Parcialmente implementada
3. Apenas interface visual
4. Utiliza dados simulados
5. Precisa de correção
6. Deve ficar para etapa posterior

Após essa classificação, executarei as melhorias priorizadas.

**Aguardando confirmação para prosseguir ou ajustes na estratégia.**

---

**Status:** ANÁLISE INICIAL CONCLUÍDA  
**Próximo:** Classificação de funcionalidades  
**Tempo estimado:** 2-4 horas para reestruturação completa
