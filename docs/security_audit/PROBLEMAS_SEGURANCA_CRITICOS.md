# 🚨 PROBLEMAS CRÍTICOS DE SEGURANÇA — STRAVA FIGHT MIGRATIONS

**Data da Auditoria:** 04/11/2026 19:00 BRT  
**Arquivos Auditados:** Migrations 00001-00013  
**Status:** ❌ **VULNERABILIDADES CRÍTICAS ENCONTRADAS**

---

## 🔴 PROBLEMAS CRÍTICOS (BLOQUEADORES)

### 1. FUNÇÕES RPC SEM VALIDAÇÃO DE AUTORIZAÇÃO (Migration 00013)

**Severidade:** 🔴 **CRÍTICA**  
**Impacto:** Qualquer usuário autenticado pode manipular contadores de posts, comentários e perfis de TERCEIROS

#### Funções Vulneráveis:

```sql
-- ❌ VULNERÁVEL: Qualquer usuário pode incrementar likes de qualquer post
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET likes_count = likes_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION increment_post_likes(UUID) TO authenticated;
```

**Problema:** Não valida se o usuário realmente curtiu o post! Permite:
- Inflar curtidas artificialmente
- Sabotar contadores de outros usuários
- Manipular estatísticas da plataforma

**Exploração:**
```javascript
// Usuário malicioso pode chamar diretamente:
await supabase.rpc('increment_post_likes', { post_id: 'post-do-concorrente' });
// Infinitas vezes, sem ter curtido o post
```

#### Todas as Funções Afetadas:
- ❌ `increment_post_likes(UUID)` — Sem validação
- ❌ `decrement_post_likes(UUID)` — Sem validação
- ❌ `increment_post_comments(UUID)` — Sem validação
- ❌ `decrement_post_comments(UUID)` — Sem validação
- ❌ `increment_follower_counts(UUID, UUID)` — Sem validação
- ❌ `decrement_follower_counts(UUID, UUID)` — Sem validação
- ❌ `increment_comment_likes(UUID)` — Sem validação
- ❌ `decrement_comment_likes(UUID)` — Sem validação
- ❌ `update_conversation_timestamp(UUID)` — Sem validação

---

### 2. CONFLITO ENTRE TRIGGERS E RPCs

**Severidade:** 🔴 **CRÍTICA**  
**Impacto:** Contadores duplicados ou dessincroni

zados

**Problema:** Migration 00009 cria triggers automáticos que incrementam/decrementam contadores:

```sql
-- Trigger automático na 00009
CREATE TRIGGER post_likes_count_trigger
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW
EXECUTE FUNCTION update_post_likes_count();
```

**E** Migration 00013 cria RPCs manuais para o mesmo propósito:

```sql
-- RPC manual na 00013
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET likes_count = likes_count + 1 WHERE id = post_id;
END;
$$
```

**Consequência:** Se o frontend chamar o RPC **E** o trigger disparar, o contador é incrementado **DUAS VEZES**!

**Código Frontend Atual:**
```typescript
// Em likesService.ts
async likePost(postId: string, userId: string): Promise<boolean> {
  // 1. INSERT dispara trigger (conta +1)
  const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
  
  // 2. Chama RPC (conta +1 novamente!) ❌ DUPLICADO
  await supabase.rpc('increment_post_likes', { post_id: postId });
  
  // Resultado: likes_count incrementado 2x!
}
```

---

### 3. AUSÊNCIA DE SEARCH_PATH SEGURO

**Severidade:** 🟡 **ALTA**  
**Impacto:** Vulnerabilidade a Schema Hijacking

**Problema:** Funções SECURITY DEFINER sem `search_path` permitem que atacantes criem funções maliciosas em schemas personalizados.

**Funções Afetadas (Migration 00013 - TODAS):**
```sql
-- ❌ SEM search_path definido
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET likes_count = likes_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Correção Necessária:**
```sql
-- ✅ COM search_path seguro
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET likes_count = likes_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public;
```

**Funções OK (Migration 00008 - is_admin):**
```sql
-- ✅ Bem configurada
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public  -- ✅ CORRETO
STABLE
AS $$...$$;
```

---

### 4. POLICY RLS EM PROFILES PERMITE EDIÇÃO IRRESTRITA

**Severidade:** 🔴 **CRÍTICA**  
**Impacto:** Usuários podem alterar campos protegidos

**Problema (Migration 00001):**
```sql
CREATE POLICY "Usuários podem atualizar seus próprios perfis"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);
```

**Vulnerabilidade:** Permite UPDATE em **TODAS as colunas**, incluindo:
- ❌ `followers_count` — Usuário pode inflar seus seguidores
- ❌ `following_count` — Usuário pode manipular estatística
- ❌ `posts_count` — Usuário pode forjar quantidade de posts
- ❌ `xp_points` — Usuário pode se dar XP infinito
- ❌ `is_verified` — Usuário pode se auto-verificar
- ❌ `belt_rank_social` — Usuário pode se promover

**Exploração:**
```javascript
// Usuário malicioso executa:
await supabase.from('profiles')
  .update({ 
    followers_count: 999999,
    is_verified: true,
    belt_rank_social: 'Faixa Preta 10º Dan',
    xp_points: 1000000
  })
  .eq('id', auth.user.id);
// ✅ Sucesso! RLS permite.
```

**Correção Necessária:** Limitar colunas editáveis:
```sql
-- ✅ Apenas colunas seguras
WITH CHECK (
  auth.uid() = id 
  AND (NEW.full_name IS DISTINCT FROM OLD.full_name
    OR NEW.bio IS DISTINCT FROM OLD.bio
    OR NEW.avatar_url IS DISTINCT FROM OLD.avatar_url
    OR NEW.location IS DISTINCT FROM OLD.location)
  -- Bloqueia: followers_count, is_verified, xp_points, etc.
)
```

---

### 5. AUSÊNCIA DE POLICIES EM TABELAS CRÍTICAS

**Severidade:** 🔴 **CRÍTICA**  
**Impacto:** RLS habilitado mas SEM policies = Acesso negado para TODOS

#### Tabelas COM RLS mas SEM policies completas:

**5.1. user_followers** (Migration 00001, 00010)
```sql
ALTER TABLE public.user_followers ENABLE ROW LEVEL SECURITY;

-- ✅ SELECT policy existe (00010):
CREATE POLICY "Followers are public" ON user_followers FOR SELECT USING (true);

-- ❌ INSERT policy AUSENTE!
-- ❌ DELETE policy AUSENTE!
```

**Impacto:** Ninguém consegue seguir ou deixar de seguir (operações bloqueadas).

**5.2. notifications** (Migration 00001)
```sql
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
-- ❌ NENHUMA policy definida em 00001!
```

**Impacto:** Ninguém consegue ler ou criar notificações.

**5.3. conversations & conversation_participants** (Migration 00001)
```sql
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
-- ❌ Policies incompletas
```

**Impacto:** Sistema de mensagens pode estar bloqueado.

---

### 6. PROTEÇÃO INSUFICIENTE DE DADOS DE MENORES

**Severidade:** 🔴 **CRÍTICA** (LGPD/ECA)  
**Impacto:** Violação de privacidade de menores

**Problema (Migration 00001 - academy_students):**
```sql
CREATE POLICY "Gestão de alunos por donos de academia"
    ON public.academy_students FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.academies a
            WHERE a.id = academy_students.academy_id AND a.owner_id = auth.uid()
        )
    );
```

**Campos Sensíveis SEM proteção adicional:**
- `birth_date` — Data de nascimento exposta
- `is_minor` — Flag de menor exposto
- `guardian_name` — Nome do responsável exposto
- `guardian_phone` — Telefone do responsável exposto
- `guardian_relationship` — Relação familiar exposta

**Problema:** Policy permite `FOR ALL` (SELECT, INSERT, UPDATE, DELETE) sem restrições adicionais para dados de menores.

**Correção Necessária:**
- Policies separadas para `is_minor = true`
- Log de auditoria para acesso a dados de menores
- Mascaramento de dados sensíveis em SELECT
- Validação adicional em UPDATE/DELETE

---

### 7. DADOS FINANCEIROS SEM AUDITORIA

**Severidade:** 🟡 **ALTA**  
**Impacto:** Manipulação financeira sem rastreabilidade

**Problema (Migration 00001 - academy_fees, academy_cash_flow):**
```sql
CREATE POLICY "Gestão financeira por donos de academia"
    ON public.academy_fees FOR ALL
    USING (...);

CREATE POLICY "Fluxo de caixa por donos de academia"
    ON public.academy_cash_flow FOR ALL
    USING (...);
```

**Vulnerabilidades:**
- UPDATE e DELETE permitidos sem registro de auditoria
- Nenhum log de quem alterou valores financeiros
- Nenhuma proteção contra alteração retroativa

**Correção Necessária:**
- Trigger de auditoria em UPDATE/DELETE
- Tabela de log financeiro (quem, quando, o que mudou)
- Restrição de DELETE em registros financeiros

---

## 🟡 PROBLEMAS DE SEGURANÇA ALTA

### 8. STORIES E REELS SEM POLICIES

**Severidade:** 🟡 **ALTA**  
**Tabelas:** `stories`, `reels` (Migration 00001)

```sql
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
-- ❌ NENHUMA policy definida na 00001
```

**Impacto:** RLS bloqueando tudo (ninguém consegue criar/ver stories e reels).

---

### 9. ACTIVITIES SEM POLICIES

**Severidade:** 🟡 **ALTA**  
**Tabela:** `activities` (SF Activity check-ins)

```sql
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
-- ❌ NENHUMA policy definida na 00001
```

**Impacto:** Check-ins de treino bloqueados.

---

### 10. COMBAT_CHALLENGES SEM POLICIES ADEQUADAS

**Severidade:** 🟡 **ALTA**  
**Tabela:** `combat_challenges`

```sql
ALTER TABLE public.combat_challenges ENABLE ROW LEVEL SECURITY;
-- ❌ Policies incompletas ou ausentes
```

**Impacto:** Sistema de desafios pode estar bloqueado.

---

## 🟢 PROBLEMAS DE SEGURANÇA MÉDIA

### 11. TRIGGERS SEM SET search_path (Migration 00009)

**Severidade:** 🟢 **MÉDIA**  
**Funções Afetadas:**
- `update_post_likes_count()` — SECURITY DEFINER sem search_path
- `update_post_comments_count()` — SECURITY DEFINER sem search_path

**Correção:**
```sql
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public  -- ✅ Adicionar
AS $$...$$;
```

---

## 📊 RESUMO DE VULNERABILIDADES

| Severidade | Quantidade | Bloqueador? |
|------------|------------|-------------|
| 🔴 Crítica | 7 | Sim |
| 🟡 Alta | 4 | Não |
| 🟢 Média | 1 | Não |
| **TOTAL** | **12** | **7 bloqueadores** |

---

## ❌ VEREDITO FINAL

**Status:** ❌ **REPROVADO PARA PRODUÇÃO**

**Motivo:** 7 vulnerabilidades críticas bloqueiam o lançamento seguro.

**Principais Riscos:**
1. Manipulação de contadores (likes, seguidores, XP)
2. Auto-verificação de usuários
3. Contadores duplicados (trigger + RPC)
4. Exposição de dados de menores
5. Alterações financeiras sem auditoria
6. Funcionalidades bloqueadas (notificações, seguir, stories)

---

## 🎯 PRÓXIMAS AÇÕES OBRIGATÓRIAS

1. ✅ Corrigir RPCs da Migration 00013 (adicionar validações)
2. ✅ Remover conflito Trigger vs RPC (escolher um mecanismo)
3. ✅ Adicionar search_path em TODAS funções SECURITY DEFINER
4. ✅ Restringir colunas editáveis em profiles
5. ✅ Adicionar policies completas em user_followers, notifications, conversations
6. ✅ Proteger dados de menores com policies específicas
7. ✅ Implementar auditoria financeira

**Não prosseguir com aplicação das migrations até correção destes problemas.**

---

**Documento gerado automaticamente pela auditoria de segurança Kiro.**
