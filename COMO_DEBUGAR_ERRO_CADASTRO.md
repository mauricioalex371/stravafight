# 🔍 Como Debugar Erro de Cadastro

## ✅ O que foi feito agora:

1. **Logging detalhado adicionado** ao código de autenticação
2. **Mensagens de erro mais claras** para usuário final
3. **Console.log estratégicos** para identificar onde está falhando
4. **Deploy enviado** (commit `973a5ba`)

---

## 🧪 Como testar agora (após 1-2 minutos do deploy):

### 1. Abra o site:
```
https://stravafight.com.br/
```

### 2. Abra o Console do Navegador:
- **Chrome/Edge**: F12 ou Ctrl+Shift+I
- **Firefox**: F12 ou Ctrl+Shift+K  
- **Safari**: Cmd+Option+I

### 3. Tente criar uma conta

### 4. Veja os LOGS no Console:
Você verá mensagens como:
```
[AUTH] Iniciando cadastro... { email: '...', supabaseUrl: '...' }
```

Se der erro, verá:
```
[AUTH] Erro do Supabase: { message: '...', code: '...' }
```
ou
```
[AUTH] Exception ao cadastrar: ...
```

---

## 🎯 Próximos passos baseado no erro:

### Se aparecer: `NetworkError` ou `Failed to fetch`
**Causa:** Variável de ambiente ainda não aplicada na Vercel
**Solução:** Aguardar mais 1 minuto e recarregar a página (Ctrl+Shift+R)

### Se aparecer: `Invalid API key` ou `401 Unauthorized`
**Causa:** Chave Supabase incorreta
**Solução:** Verificar variáveis na Vercel dashboard

### Se aparecer: `Email already registered`
**Causa:** Email já foi usado antes
**Solução:** Usar outro email ou fazer login

### Se aparecer: `email_address_invalid`
**Causa:** Supabase rejeitando formato do email
**Solução:** Tentar com email de provedor conhecido (@gmail.com, @outlook.com)

### Se aparecer: `User creation failed` ou `Database error`
**Causa:** Problema no banco de dados
**Solução:** Executar `CORRIGIR_AUTH_SUPABASE.sql` no Supabase SQL Editor

---

## 🚨 SOLUÇÃO EMERGENCIAL - Desabilitar confirmação de email:

Se o problema persistir, pode ser que o Supabase esteja exigindo confirmação de email.

### No Supabase Dashboard:
1. Vá em **Authentication** > **Providers** > **Email**
2. Procure por **"Enable email confirmations"**
3. **DESABILITE** essa opção (temporariamente)
4. Clique em **Save**

Isso permite criar contas sem verificar o email primeiro.

---

## 📊 Verificar Status do Deploy:

```bash
curl -I https://stravafight.com.br/ | grep -i "x-vercel"
```

Aguardar deploy aparecer em: https://vercel.com/dashboard

---

## ✉️ Me envie os logs:

Se o erro persistir após 2 minutos, me envie:
1. Screenshot do Console (F12)
2. Mensagem de erro exata
3. Email que tentou usar no cadastro

