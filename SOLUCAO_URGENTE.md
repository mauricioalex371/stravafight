# 🚨 SOLUÇÃO URGENTE - Erro "Failed to fetch"

## 🔍 PROBLEMA IDENTIFICADO:
O Supabase está **rejeitando emails** porque a **confirmação de email está ativada** mas o **provedor de email não está configurado**.

---

## ✅ SOLUÇÃO IMEDIATA (5 minutos):

### **1. Acesse o Dashboard do Supabase:**
```
https://supabase.com/dashboard/project/olwwkgtxkduvyhduudbx
```

### **2. No menu lateral, clique em:**
```
Authentication > Providers
```

### **3. Clique no provider "Email"**

### **4. ENCONTRE a opção:**
```
☑ Enable email confirmations
```

### **5. DESABILITE essa opção (toggle para OFF)**
Isso vai permitir que usuários criem contas **SEM precisar verificar email**.

### **6. Clique em "Save" no final da página**

### **7. TESTE IMEDIATAMENTE:**
- Acesse: https://stravafight.com.br/
- Tente criar conta novamente
- **DEVE FUNCIONAR AGORA!** ✅

---

## 🎯 ALTERNATIVA (se não encontrar a opção acima):

### Vá em: **Settings > Auth** ou **Configuration**
Procure por:
- `MAILER_AUTOCONFIRM` → marque como TRUE
- `SITE_URL` → confirme que está correto
- `DISABLE_SIGNUP` → deve estar FALSE

---

## ⚠️ POR QUE ISSO ACONTECEU:

1. Supabase tem confirmação de email **ATIVADA** por padrão
2. Mas você **NÃO configurou** um provedor de email (SendGrid, AWS SES, etc)
3. Resultado: Supabase **rejeita** todos os cadastros com erro `email_address_invalid`

---

## 🔧 CONFIGURAÇÃO PERMANENTE (depois):

Para aceitar cadastros COM confirmação de email, você precisa configurar um provider:

1. Vá em **Settings > Auth > Email Templates**
2. Configure um provedor de email:
   - **SendGrid** (recomendado - free tier disponível)
   - **AWS SES**
   - **Resend**
   - **SMTP customizado**

Por enquanto, **desabilitar confirmação é mais rápido** para sua campanha.

---

## 📸 PRECISA DE AJUDA?

Se não encontrar a opção, me envie um **screenshot** da página:
- Authentication > Providers > Email

---

**EXECUTE ISSO AGORA E ME CONFIRME QUANDO TERMINAR!** ⚡
