# STRAVA FIGHT — ESCALABILIDADE, ARQUITETURA E GESTÃO DE CUSTOS

Documento estratégico com análise de gargalos, dimensionamento de tráfego, boas práticas no Supabase e priorização de otimizações para a publicação em `https://stravafight.com.br`.

---

## 1. ANÁLISE DE GARGALOS E CAPACIDADE

| Componente | Capacidade Atual | Possível Gargalo em Alta Escala | Mitigação Implementada / Recomendada |
| :--- | :--- | :--- | :--- |
| **Front-End Bundle** | 131 kB inicial (reduzido de 1.154 kB) | Sobrecarga de download em conexões 3G/4G | **Implementado:** Code-splitting com `React.lazy`, Vite manual chunks imutáveis. |
| **Banco de Dados** | Supabase Postgres | Full-table scans em buscas e feeds com milhões de registros | **Implementado:** Índices em `created_at`, `status`, `target_id`, `author_id`. Paginação via `.range(from, to)`. |
| **Mídia e Imagens** | Supabase Storage / Unsplash | Tráfego de egress elevado e imagens pesadas baixadas repetidamente | **Implementado:** Utilitário `imageOptimizer.ts` com WebP/AVIF auto-negotiation, thumbnails e cache de 1 ano na Vercel (`Cache-Control: immutable`). |
| **Main Thread JS** | 60 FPS estáveis | Bloqueio síncrono por `JSON.parse` em cascata | **Implementado:** Camada de In-Memory Cache O(1) no `StorageService` e `BusinessService`. |
| **Abuso e Spam** | Protegido | Bots inundando comentários, curtidas e mensagens | **Implementado:** Token-bucket `RateLimiter` no cliente e políticas RLS restritivas no Postgres. |

---

## 2. RECOMENDAÇÕES POR PRIORIDADE

### 🔴 PRIORIDADE ALTA (Executar antes do lançamento público)
1. **Configuração das Chaves de Produção na Vercel:**
   - Adicionar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas Environment Variables da Vercel para o domínio `stravafight.com.br`.
   - Garantir que a `SUPABASE_SERVICE_ROLE_KEY` **nunca** seja exposta no front-end.
2. **Aplicação das Migrations 00001 a 00004 no Supabase:**
   - Executar os 4 arquivos SQL na aba *SQL Editor* do Supabase para garantir que todas as tabelas, RLS e índices estejam ativos.
3. **Restrição de Domínios no Supabase Auth:**
   - Configurar Site URL como `https://stravafight.com.br` e Redirect URLs permitidas para impedir ataques de redirecionamento de OAuth/Auth.

---

### 🟡 PRIORIDADE MÉDIA (Primeiros 1.000 a 10.000 usuários ativos)
1. **Ativação do Supabase Image Transformation:**
   - No plano Supabase Pro, ativar transformações nativas na CDN (`/render/image/public/`) para que fotos tiradas por celulares modernos (48MP) sejam comprimidas na borda para WebP 80% antes de serem enviadas ao feed.
2. **Connection Pooling com Supabase Transaction Pooler (PgBouncer / Supavisor):**
   - Garantir que requisições simultâneas em picos de eventos ou campeonatos utilizem a porta `6543` (pooler) para não estourar o limite de conexões simultâneas do PostgreSQL.
3. **Configuração de Alertas no Sentry / Datadog:**
   - Integrar o `src/utils/logger.ts` a uma plataforma de monitoramento de exceções em tempo real com alertas via Slack ou Telegram para a equipe técnica.

---

### 🟢 PRIORIDADE BAIXA (Otimizações contínuas para escala global)
1. **CDN Geográfica e Edge Caching:**
   - Utilizar Cloudflare na frente da Vercel com regras de cache agressivas para páginas institucionais (`/institutional`, `/events`).
2. **Particionamento de Tabelas de Histórico:**
   - Quando a tabela `attendance` ou `check_ins` ultrapassar 5 milhões de linhas, particionar por ano/mês (`PARTITION BY RANGE (created_at)`).
3. **Background Job Workers (Supabase Edge Functions / Queues):**
   - Processamento assíncrono de notificações em massa via Webhook ou fila RabbitMQ/PgQueuer para transmissões ao vivo.

---

## 3. PROJEÇÃO DE CUSTOS E ESCALA

- **Fase Inicial (Até 5.000 usuários / 50 academias):**
  - Vercel Hobby ou Pro: **$0 a $20/mês**.
  - Supabase Pro (Banco 8GB + 100GB Storage + 250GB Egress): **$25/mês**.
  - Custo total estimado: **~$25 a $45/mês**.
- **Fase de Escala (50.000 usuários / 500 academias):**
  - Vercel Pro + Team: **~$40/mês**.
  - Supabase Pro com compute expandido (Small/Medium compute add-on): **~$75 a $120/mês**.
  - Custo total estimado: **~$120 a $160/mês**.
  - *Viabilidade econômica comprovada pelo modelo de assinatura do SF Business Pro (R$ 189,90/mês por empresa) e planos de academias.*
