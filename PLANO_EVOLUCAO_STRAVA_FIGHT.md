# 🚀 PLANO DE EVOLUÇÃO - STRAVA FIGHT

## 📋 Sumário Executivo

Este documento define o **roadmap completo de evolução** do STRAVA FIGHT desde o estado atual (MVP LocalStorage) até uma **plataforma social multiusuário completa e escalável** integrando rede social, academia digital, marketplace, eventos e business.

**Status:** 📍 Fase A completada - Iniciando Fase B (Migração Supabase)  
**Data:** 2026-11-04  
**Versão:** 1.0

---

## 🎯 Visão de Produto

### Missão

> "Conectar a comunidade de artes marciais e fitness através de uma plataforma social completa que une treino, aprendizado, networking e oportunidades de negócio."

### Valores

1. **Comunidade First**: Conexões reais entre praticantes
2. **Autenticidade**: Conteúdo genuíno, sem fake engagement
3. **Progressão**: Ferramentas para acompanhar evolução
4. **Oportunidades**: Conectar atletas, treinadores e negócios

### Público-Alvo

#### Personas Primárias

**1. Lucas - O Praticante Entusiasta**
- 25 anos, pratica Muay Thai há 2 anos
- Quer conectar com outros praticantes
- Busca treinos e técnicas novas
- Frustrado com redes sociais genéricas

**2. Mariana - A Treinadora Profissional**
- 32 anos, instrutora de Boxing há 8 anos
- Quer ampliar base de alunos
- Precisa divulgar seu trabalho
- Busca networking profissional

**3. Rafael - O Dono de Academia**
- 45 anos, possui 2 academias de MMA
- Quer divulgar sua academia
- Busca contratar professores
- Precisa gerenciar eventos

**4. Carla - A Iniciante Curiosa**
- 28 anos, nunca praticou lutas
- Quer começar mas tem medo
- Busca informações e motivação
- Precisa encontrar academia próxima

---

## 📊 Estado Atual (Fase A - Concluída)

### ✅ O que já temos

| Módulo | Status | Descrição |
|--------|--------|-----------|
| **Auth** | ✅ Operacional | Cadastro, login, sessão com Supabase Auth |
| **Perfis** | ✅ Operacional | Criação/edição de perfis com avatar |
| **Posts** | ✅ Operacional | Criar posts com texto + mídia |
| **Feed** | ✅ Operacional | Listagem de posts públicos |
| **Upload** | ✅ Operacional | Upload de imagens/vídeos para Storage |
| **UI/UX** | ✅ Operacional | Interface mobile-first completa |
| **Navegação** | ✅ Operacional | Bottom nav + rotas funcionais |

### 🟡 Implementações Parciais

| Módulo | Status | O que falta |
|--------|--------|-------------|
| **SF Academy** | 🟡 Parcial | Backend read-only → Migrar para Supabase completo |
| **Moderação** | 🟡 Estrutura | Tabelas existem → Implementar lógica |

### ❌ Funcionalidades Mock (LocalStorage)

**Críticas para rede social:**
- Likes
- Comentários
- Seguidores/Seguindo
- Notificações
- Mensagens Diretas
- Stories
- Reels

**Módulos SF:**
- SF Activity (treinos)
- SF Business (academias/treinadores)
- Events (lutas, campeonatos)
- Marketplace (equipamentos)

---

## 🗺️ Roadmap de Evolução

### Visão Geral das Fases

```
FASE A (CONCLUÍDA) → FASE B (EM ANDAMENTO) → FASE C → FASE D → FASE E
    MVP                Migração Supabase       Scale      Growth    Monetization
    ✅                      ⏳                    🔮         🔮          🔮
```

---

## 📅 FASE B: Migração Supabase (ATUAL)

**Objetivo:** Transformar de MVP LocalStorage para plataforma multiusuário real

**Prazo:** 15-20 dias úteis (118-160 horas)  
**Início:** 2026-11-04  
**Conclusão prevista:** 2026-11-28

### Estratégia

✅ **Migração gradual em Waves**  
✅ **Preservar funcionalidades existentes**  
✅ **Validação contínua a cada Wave**  
✅ **Prioridade: Rede Social completa**

### Waves da Fase B

#### 🌊 Wave 1: Fundação da Rede Social (34-44h)

**Prioridade:** 🔴 CRÍTICA

**Módulos:**
- ✅ Likes em posts
- ✅ Comentários em posts
- ✅ Sistema de seguidores
- ✅ Notificações em tempo real
- ✅ Mensagens diretas

**Entregáveis:**
- [ ] `likesService.ts` completo
- [ ] `commentsService.ts` completo
- [ ] `followersService.ts` completo
- [ ] `notificationsService.ts` completo com Realtime
- [ ] `messagesService.ts` completo com Realtime
- [ ] Testes de integração passando
- [ ] UI atualizada (remoção de mocks)

**Validação:**
- [ ] Usuário A curte post de Usuário B → B recebe notificação
- [ ] Usuário A comenta em post de B → B recebe notificação
- [ ] Usuário A segue B → B recebe notificação
- [ ] Usuário A envia mensagem para B → B recebe em tempo real
- [ ] Contador de likes atualiza instantaneamente
- [ ] Feed mostra apenas posts de quem eu sigo

**Impacto:** 🎯 Plataforma se torna rede social funcional

---

#### 🌊 Wave 2: Conteúdo Efêmero (10-14h)

**Prioridade:** 🟡 ALTA

**Módulos:**
- Stories (24h auto-delete)
- Reels (vídeos curtos)

**Entregáveis:**
- [ ] `storiesService.ts` completo
- [ ] `reelsService.ts` completo
- [ ] Auto-delete de Stories após 24h (trigger)
- [ ] Player de vídeo para Reels
- [ ] Upload otimizado para vídeos

**Validação:**
- [ ] Story expira automaticamente após 24h
- [ ] Reel reproduz sem lag
- [ ] Visualizador de Stories funcional (swipe entre users)

**Impacto:** 🎯 Engajamento diário aumenta (FOMO de Stories)

---

#### 🌊 Wave 3: SF Activity (4-6h)

**Prioridade:** 🟡 ALTA

**Módulos:**
- Registro de treinos
- Histórico de atividades
- Estatísticas pessoais

**Entregáveis:**
- [ ] `activityService.ts` completo
- [ ] Gráficos de progresso
- [ ] Integração com posts (compartilhar treino)

**Validação:**
- [ ] Registrar treino de Muay Thai
- [ ] Visualizar histórico dos últimos 30 dias
- [ ] Compartilhar treino no feed

**Impacto:** 🎯 Diferencial vs redes sociais genéricas

---

#### 🌊 Wave 4: SF Academy Completo (12-16h)

**Prioridade:** 🟢 MÉDIA

**Módulos:**
- Catálogo de cursos
- Matrículas
- Progresso de aulas
- Certificados

**Entregáveis:**
- [ ] `academyService.ts` expandido (CRUD completo)
- [ ] Sistema de matrículas
- [ ] Tracking de progresso
- [ ] Player de vídeo com controles

**Validação:**
- [ ] Instrutor cria curso novo
- [ ] Aluno se matricula
- [ ] Progresso salvo ao assistir aula
- [ ] Certificado emitido ao completar

**Impacto:** 🎯 Monetização futura (cursos pagos)

---

#### 🌊 Wave 5: Events (8-10h)

**Prioridade:** 🟢 MÉDIA

**Módulos:**
- Criação de eventos
- Inscrições
- Check-in
- Listagem pública

**Entregáveis:**
- [ ] `eventsService.ts` completo
- [ ] Calendário de eventos
- [ ] Sistema de inscrições
- [ ] Notificações de eventos próximos

**Validação:**
- [ ] Academia cria evento de campeonato
- [ ] Atleta se inscreve
- [ ] Organizador visualiza lista de inscritos
- [ ] Notificação 1 dia antes do evento

**Impacto:** 🎯 Engajamento offline da comunidade

---

#### 🌊 Wave 6: SF Business (20-30h)

**Prioridade:** 🟢 MÉDIA-ALTA

**Módulos:**
- Cadastro de academias/treinadores
- Perfis de negócio
- Avaliações
- Busca por localização

**Entregáveis:**
- [ ] `businessService.ts` completo
- [ ] Perfil diferenciado para Business
- [ ] Sistema de reviews (1-5 estrelas)
- [ ] Mapa de academias próximas
- [ ] Solicitação de verificação (badge)

**Validação:**
- [ ] Treinador cria perfil Business
- [ ] Aluno deixa avaliação 5 estrelas
- [ ] Busca por "academia de Muay Thai em SP"
- [ ] Badge de verificado aparece no perfil

**Impacto:** 🎯 Atração de academias e profissionais

---

#### 🌊 Wave 7: Marketplace (30-40h)

**Prioridade:** 🔵 BAIXA

**Módulos:**
- Listagem de produtos
- Categorias (luvas, kimonos, suplementos)
- Favoritos
- Chat vendedor-comprador

**Entregáveis:**
- [ ] `marketplaceService.ts` completo
- [ ] CRUD de produtos
- [ ] Sistema de favoritos
- [ ] Chat integrado (usa messagesService)
- [ ] Busca e filtros

**Validação:**
- [ ] Vendedor lista luvas de boxe
- [ ] Comprador marca como favorito
- [ ] Comprador envia mensagem ao vendedor
- [ ] Transação (pagamento) - FASE C

**Impacto:** 🎯 Ecossistema completo (social + comércio)

---

#### 🌊 Wave 8: Streaming (TBD - FUTURO)

**Prioridade:** 🔵 BAIXA (Fase D)

**Módulos:**
- Lives de treinos
- Lives de lutas
- Chat em tempo real

**Nota:** Requer infraestrutura adicional (WebRTC, CDN)

---

### Métricas de Sucesso - Fase B

| Métrica | Meta |
|---------|------|
| Funcionalidades em Supabase | 100% |
| Referências a LocalStorage | 0% (exceto legacy) |
| Test Coverage | >80% |
| Latência média queries | <100ms P95 |
| RLS Coverage | 100% |
| Bugs críticos | 0 |

---

## 📅 FASE C: Scale & Polish (Futuro)

**Objetivo:** Otimizar para crescimento, refinar UX, adicionar features avançadas

**Prazo estimado:** 2-3 meses  
**Início previsto:** 2026-12-01

### Iniciativas Principais

#### 1. **Performance & Infrastructure**
- CDN para mídia (Cloudflare)
- Redis caching layer
- Database sharding (se >100k users)
- Monitoring avançado (Sentry, LogRocket)

#### 2. **Features Avançadas**
- Algoritmo de feed personalizado (ML-based)
- Busca avançada (Algolia/Typesense)
- Hashtags e trending topics
- Mentions (@username)
- Compartilhamento externo (deep links)

#### 3. **Gamificação**
- Sistema de badges (conquistas)
- Leaderboards (mais ativo, mais engajado)
- Desafios semanais
- XP e níveis

#### 4. **UX/UI Refinements**
- Onboarding interativo
- Dark mode completo
- Animações polidas (Framer Motion)
- Acessibilidade (WCAG 2.1 AA)

#### 5. **Internacionalização**
- Suporte multi-idioma (i18n)
- Localização de conteúdo
- Moedas locais (marketplace)

### Métricas de Sucesso - Fase C

| Métrica | Meta |
|---------|------|
| Tempo de carregamento (P95) | <2s |
| Lighthouse Score | >90 |
| Retention D7 | >40% |
| DAU/MAU ratio | >0.2 |
| Crash rate | <0.1% |

---

## 📅 FASE D: Growth & Community (Futuro)

**Objetivo:** Crescer base de usuários, fortalecer comunidade, parcerias estratégicas

**Prazo estimado:** 6 meses  
**Início previsto:** 2027-03-01

### Iniciativas Principais

#### 1. **Marketing & Acquisition**
- Landing page otimizada (SEO)
- Blog com conteúdo relevante
- Parcerias com academias (embaixadores)
- Influencers de artes marciais
- App Store Optimization (ASO)

#### 2. **Community Management**
- Moderação ativa
- Programa de embaixadores
- Eventos presenciais (meetups)
- Conteúdo exclusivo (entrevistas, bastidores)

#### 3. **Integrations**
- Strava (sync de atividades)
- Apple Health / Google Fit
- Spotify (playlists de treino)
- YouTube (embed de técnicas)

#### 4. **Mobile Apps Nativos**
- React Native (iOS + Android)
- Push notifications nativas
- Geolocalização avançada
- Câmera integrada (stories/reels)

#### 5. **Sherdog Fighter Database** 🥊

**Contexto:** Base de ~850 lutadores (CSV) fornecida pelo usuário

**Integração:**
- [ ] Importar CSV para tabela `fighters`
- [ ] Perfis de lutadores (read-only)
- [ ] Vincular usuários STRAVA FIGHT a perfis de lutadores
- [ ] Stats oficiais (record, weight class, etc)
- [ ] Feed de notícias de lutas

**Impacto:** 🎯 Credibilidade + conteúdo rico

### Métricas de Sucesso - Fase D

| Métrica | Meta |
|---------|------|
| Usuários cadastrados | 10,000+ |
| Posts por dia | 1,000+ |
| Academias cadastradas | 500+ |
| NPS (Net Promoter Score) | >50 |
| Organic traffic | 50% do total |

---

## 📅 FASE E: Monetization (Futuro)

**Objetivo:** Sustentabilidade financeira através de múltiplas fontes de receita

**Prazo estimado:** Ongoing  
**Início previsto:** 2027-09-01

### Modelos de Receita

#### 1. **Freemium (Core Model)**

**Free Tier:**
- Rede social completa
- 5 posts por dia
- Visualizar Academy (samples)
- Marketplace (browsing)

**Premium ($9.90/mês):**
- Posts ilimitados
- Academy completo (todos os cursos)
- Badge de verificado
- Analytics avançado
- Sem anúncios

#### 2. **Business Plans**

**Treinador ($19.90/mês):**
- Perfil verificado
- Criar cursos na Academy
- Analytics de alunos
- Destaque em buscas

**Academia ($49.90/mês):**
- Múltiplos perfis de instrutores
- Eventos ilimitados
- Gestão de turmas
- Integração com site

#### 3. **Marketplace Fees**

- 10% de comissão sobre vendas
- Destaque de anúncios (boost) - $5/semana

#### 4. **Event Monetization**

- 5% sobre ingressos vendidos
- Ferramentas de gestão de evento (Pro) - $29

#### 5. **Advertising (Último Recurso)**

- Native ads no feed (discretos)
- Sponsored posts de marcas relevantes
- Apenas para free users

### Métricas de Sucesso - Fase E

| Métrica | Meta Ano 1 |
|---------|------------|
| Paid users | 5% da base |
| MRR (Monthly Recurring Revenue) | $10,000 |
| LTV/CAC ratio | >3 |
| Churn rate | <5%/mês |
| Business accounts | 100+ |

---

## 🎯 Priorização de Features (Pós-Fase B)

### Framework: RICE Score

**RICE = (Reach × Impact × Confidence) / Effort**

| Feature | Reach | Impact | Confidence | Effort | RICE | Prioridade |
|---------|-------|--------|------------|--------|------|------------|
| Feed Personalizado (ML) | 1000 | 3 | 80% | 8 | 300 | 🔴 Alta |
| Dark Mode | 1000 | 2 | 100% | 2 | 1000 | 🔴 Alta |
| Push Notifications | 1000 | 3 | 90% | 4 | 675 | 🔴 Alta |
| Sherdog Integration | 500 | 2 | 70% | 6 | 117 | 🟡 Média |
| Streaming Lives | 200 | 3 | 50% | 20 | 15 | 🔵 Baixa |
| Pagamentos Marketplace | 300 | 3 | 80% | 12 | 60 | 🟡 Média |

---

## 🔄 Ciclo de Desenvolvimento

### Sprints de 2 Semanas

**Estrutura padrão:**
- Sprint Planning (Segunda)
- Daily standups (async via Slack)
- Sprint Review (Sexta da 2ª semana)
- Sprint Retro (Sexta da 2ª semana)

### Releases

- **Hotfix:** Deploy imediato (bugs críticos)
- **Minor:** Semanal (features pequenas)
- **Major:** Mensal (grandes features)

### Versionamento Semântico

```
v1.0.0 → Fase A concluída (MVP LocalStorage)
v2.0.0 → Fase B concluída (Supabase completo)
v2.1.0 → Fase C - Feature X
v3.0.0 → Fase D - Mobile apps
v4.0.0 → Fase E - Monetização
```

---

## 📊 Dashboard de Métricas (KPIs)

### Técnicas

| Métrica | Fase B | Fase C | Fase D |
|---------|--------|--------|--------|
| Uptime | 99.5% | 99.9% | 99.99% |
| Latência P95 | <200ms | <100ms | <50ms |
| Test Coverage | 80% | 85% | 90% |
| Security Score | A | A+ | A+ |
| Lighthouse | 80 | 90 | 95 |

### Produto

| Métrica | Fase B | Fase C | Fase D |
|---------|--------|--------|--------|
| MAU | 100 | 1,000 | 10,000 |
| DAU/MAU | 0.15 | 0.20 | 0.30 |
| Posts/dia | 50 | 500 | 2,000 |
| Retention D7 | 30% | 40% | 50% |
| NPS | 40 | 50 | 60 |

### Negócio (Fase E)

| Métrica | Ano 1 | Ano 2 | Ano 3 |
|---------|-------|-------|-------|
| MRR | $10k | $50k | $200k |
| Paid Users | 500 | 2,500 | 10,000 |
| CAC | $10 | $8 | $5 |
| LTV | $50 | $100 | $200 |
| Burn Rate | $15k/mês | $30k/mês | $50k/mês |

---

## 🚧 Riscos e Mitigação

### Riscos Técnicos

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Supabase downtime | 🔴 Alto | 🟡 Baixa | Fallback temporário, SLA Enterprise |
| Escalabilidade DB | 🔴 Alto | 🟡 Média | Sharding, read replicas |
| CDN costs explosion | 🟡 Médio | 🟡 Média | Compressão, limits, monitoring |
| Security breach | 🔴 Alto | 🟢 Baixa | Audits regulares, bug bounty |

### Riscos de Produto

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Baixa adoção inicial | 🔴 Alto | 🟡 Média | Marketing agressivo, embaixadores |
| Concorrência (Instagram) | 🟡 Médio | 🔴 Alta | Foco em nicho, features únicas |
| Conteúdo inapropriado | 🟡 Médio | 🟡 Média | Moderação ativa, reports |
| Churn alto | 🔴 Alto | 🟡 Média | Onboarding melhor, engagement |

### Riscos de Negócio

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Runway insuficiente | 🔴 Alto | 🟡 Média | Fundraising, bootstrapping |
| Dependência Supabase | 🟡 Médio | 🟢 Baixa | Abstração de infra, backup plan |
| Regulação (LGPD) | 🟡 Médio | 🟢 Baixa | Compliance desde início |

---

## 🎉 Milestones Estratégicos

### 🏁 Milestone 1: Rede Social Funcional
**Data:** 2026-11-28 (Fim da Wave 1)  
**Critério:** Usuário pode curtir, comentar, seguir, receber notificações, enviar mensagens

### 🏁 Milestone 2: Ecossistema Completo
**Data:** 2026-12-15 (Fim da Fase B)  
**Critério:** Todas as 7 Waves concluídas, 0% LocalStorage

### 🏁 Milestone 3: Product-Market Fit
**Data:** 2027-06-01 (Fase D)  
**Critério:** 1,000 MAU, Retention D7 >40%, NPS >50

### 🏁 Milestone 4: Sustainable Business
**Data:** 2028-01-01 (Fase E)  
**Critério:** $10k MRR, LTV/CAC >3, Churn <5%

---

## 📚 Documentação de Apoio

### Documentos já criados:
- ✅ `ANALISE_ESTRATEGICA.md` - Inventário completo
- ✅ `DECISAO_CRITICA.md` - Análise de opções
- ✅ `ESTADO_REAL_FUNCIONALIDADES.md` - Status atual detalhado
- ✅ `MAPA_MIGRACAO_SUPABASE.md` - Roadmap técnico de migração
- ✅ `ARQUITETURA_ALVO_STRAVA_FIGHT.md` - Especificação técnica definitiva
- ✅ `PLANO_EVOLUCAO_STRAVA_FIGHT.md` - Este documento

### Próximos documentos:
- 🔄 `WAVE_1_EXECUTION_PLAN.md` - Plano detalhado Wave 1 (criar ao iniciar)
- 🔄 `ONBOARDING_GUIDE.md` - Guia para novos desenvolvedores
- 🔄 `API_DOCUMENTATION.md` - Referência de APIs Supabase
- 🔄 `DEPLOYMENT_CHECKLIST.md` - Checklist de deploy (já existe `DEPLOY.md`)

---

## ✅ Aprovação para Início da Fase B

### Pré-requisitos

- [x] Análise profunda concluída
- [x] Arquitetura alvo definida
- [x] Roadmap detalhado criado
- [x] Prioridades validadas
- [x] Estimativas de esforço calculadas
- [x] Riscos mapeados
- [x] Métricas de sucesso definidas

### Próximos Passos Imediatos

1. ⏳ **Aguardar aprovação do usuário** para iniciar Wave 1
2. ⏳ Criar branch `feature/wave-1-social-foundation`
3. ⏳ Implementar `likesService.ts`
4. ⏳ Implementar `commentsService.ts`
5. ⏳ Implementar `followersService.ts`
6. ⏳ Implementar `notificationsService.ts`
7. ⏳ Implementar `messagesService.ts`
8. ⏳ Atualizar UI (remover mocks)
9. ⏳ Escrever testes de integração
10. ⏳ Validar manualmente
11. ⏳ Merge para `main`
12. ⏳ Deploy

---

## 🎯 Mensagem Final

O STRAVA FIGHT está **perfeitamente posicionado** para se tornar a **plataforma definitiva** da comunidade de artes marciais e fitness.

**Temos:**
- ✅ Base técnica sólida (Supabase + React)
- ✅ UI/UX completa e polida
- ✅ Roadmap claro e executável
- ✅ Diferencial competitivo (nicho específico)

**Falta:**
- ⏳ Executar migração (15-20 dias)
- ⏳ Crescer base de usuários (marketing)
- ⏳ Iterar com feedback real

**Momento:** 🚀 **AGORA**

A janela de oportunidade está aberta. Vamos construir a maior comunidade de artes marciais da América Latina.

---

**FIM DO DOCUMENTO**  
Pronto para execução. Aguardando comando para iniciar Wave 1.

---

**Última atualização:** 2026-11-04  
**Responsável:** Kiro AI + Maurício Alex  
**Status:** 📍 Documentação completa - Pronto para implementação
