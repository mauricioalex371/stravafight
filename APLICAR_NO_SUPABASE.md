# 🚀 APLICAR MIGRATIONS NO SUPABASE — INSTRUÇÃO RÁPIDA

## ⚡ MÉTODO RÁPIDO (Dashboard Supabase)

### 1. Acessar SQL Editor
1. Ir para: https://supabase.com/dashboard/project/olwwkgtxkduvyhduudbx
2. Menu lateral: **SQL Editor**
3. Clicar em **New Query**

### 2. Aplicar Migrations na Ordem

Execute cada migration abaixo **UMA POR VEZ**, na ordem listada:

---

#### **Migration 1: Schema Inicial (00001)**
```sql
-- Copiar e colar TODO o conteúdo de:
-- supabase/migrations/00001_initial_schema.sql
-- Clicar em "Run"
-- Aguardar confirmação "Success"
```

📄 **Arquivo:** `supabase/migrations/00001_initial_schema.sql`

---

#### **Migration 2: Business Schema (00002)**
```sql
-- Copiar e colar TODO o conteúdo de:
-- supabase/migrations/00002_business_schema.sql
```

📄 **Arquivo:** `supabase/migrations/00002_business_schema.sql`

---

#### **Migration 3: Storage Buckets (00003)**
```sql
-- Copiar e colar TODO o conteúdo de:
-- supabase/migrations/00003_storage_buckets_and_rls.sql
```

📄 **Arquivo:** `supabase/migrations/00003_storage_buckets_and_rls.sql`

---

#### **Migration 4: Security (00004)**
```sql
-- Copiar e colar TODO o conteúdo de:
-- supabase/migrations/00004_security_and_moderation.sql
```

📄 **Arquivo:** `supabase/migrations/00004_security_and_moderation.sql`

---

#### **Migration 5: Marketplace (00005)**
```sql
-- Copiar e colar TODO o conteúdo de:
-- supabase/migrations/00005_marketplace_schema.sql
```

📄 **Arquivo:** `supabase/migrations/00005_marketplace_schema.sql`

---

#### **Migration 6: Events (00006)**
```sql
-- Copiar e colar TODO o conteúdo de:
-- supabase/migrations/00006_events_and_streams.sql
```

📄 **Arquivo:** `supabase/migrations/00006_events_and_streams.sql`

---

#### **Migration 7: Admin Audit Fix (00007)**
```sql
-- Copiar e colar TODO o conteúdo de:
-- supabase/migrations/00007_fix_admin_audit_logs_duplication.sql
```

📄 **Arquivo:** `supabase/migrations/00007_fix_admin_audit_logs_duplication.sql`

---

#### **Migration 8: Admin System (00008)**
```sql
-- Copiar e colar TODO o conteúdo de:
-- supabase/migrations/00008_admin_system_architecture.sql
```

📄 **Arquivo:** `supabase/migrations/00008_admin_system_architecture.sql`

---

#### **Migration 9: RLS Posts (00009) — ESSENCIAL WAVE 1**
```sql
-- Copiar e colar TODO o conteúdo de:
-- supabase/migrations/00009_fix_post_likes_comments_rls.sql
```

📄 **Arquivo:** `supabase/migrations/00009_fix_post_likes_comments_rls.sql`

---

#### **Migration 10: RLS Complete (00010)**
```sql
-- Copiar e colar TODO o conteúdo de:
-- supabase/migrations/00010_complete_rls_policies.sql
```

📄 **Arquivo:** `supabase/migrations/00010_complete_rls_policies.sql`

---

#### **Migration 11: Ad Events Security (00011)**
```sql
-- Copiar e colar TODO o conteúdo de:
-- supabase/migrations/00011_fix_ad_events_security.sql
```

📄 **Arquivo:** `supabase/migrations/00011_fix_ad_events_security.sql`

---

#### **Migration 12: RLS Missing (00012)**
```sql
-- Copiar e colar TODO o conteúdo de:
-- supabase/migrations/00012_fix_missing_rls.sql
```

📄 **Arquivo:** `supabase/migrations/00012_fix_missing_rls.sql`

---

#### **Migration 13: Wave 1 RPCs (00013) — CRÍTICO**
```sql
-- Copiar e colar TODO o conteúdo de:
-- supabase/migrations/00013_wave_1_rpcs.sql
```

📄 **Arquivo:** `supabase/migrations/00013_wave_1_rpcs.sql`

---

### 3. Validar Aplicação

Após aplicar todas as migrations, executar no SQL Editor:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Deve retornar pelo menos:
-- - profiles
-- - posts
-- - post_likes
-- - post_comments
-- - followers
-- - notifications
-- - conversations
-- - messages
```

```sql
-- Verificar RLS habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Todas devem ter rowsecurity = true
```

```sql
-- Verificar RPCs criados
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Deve incluir:
-- - increment_post_likes
-- - decrement_post_likes
-- - increment_post_comments
-- - decrement_post_comments
-- - increment_follower_counts
-- - decrement_follower_counts
-- - update_conversation_timestamp
```

---

### 4. Configurar Storage Buckets

Se as migrations de storage falharam, criar manualmente:

1. Menu: **Storage**
2. Criar bucket: `avatars`
   - Public: ✅ Yes
   - File size limit: 5 MB
   - Allowed MIME types: `image/jpeg, image/png, image/webp`

3. Criar bucket: `posts`
   - Public: ✅ Yes
   - File size limit: 10 MB
   - Allowed MIME types: `image/jpeg, image/png, image/webp, video/mp4`

---

### 5. Habilitar Realtime (se necessário)

1. Menu: **Database > Replication**
2. Habilitar Realtime para estas tabelas:
   - `post_likes`
   - `post_comments`
   - `notifications`
   - `messages`

---

## ✅ CONFIRMAÇÃO

Após aplicar todas as migrations, responda com:
- ✅ "Migrations aplicadas com sucesso"
- ❌ "Erro na migration X: [mensagem de erro]"

Então poderei prosseguir com os testes de integração e deploy na Vercel!
