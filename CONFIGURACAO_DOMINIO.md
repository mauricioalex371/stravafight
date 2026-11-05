# 🌐 Configuração do Domínio stravafight.com.br

## ✅ Status Atual

**Domínios adicionados na Vercel:**
- ✅ `stravafight.com.br` → Projeto: stravafight
- ✅ `www.stravafight.com.br` → Projeto: stravafight

**Próximo passo:** Configurar DNS no Registro.br

---

## 📝 Configuração DNS no Registro.br

### **Acesse o painel do Registro.br:**
1. Vá em: https://registro.br/
2. Faça login com sua conta
3. Clique em **"Meus Domínios"**
4. Selecione **stravafight.com.br**
5. Clique em **"Editar Zona"** ou **"DNS"**

---

## 🔧 Registros DNS para adicionar:

### **Opção 1: Usando registros A e CNAME (RECOMENDADO)**

Adicione estes 2 registros:

```
1️⃣ Para o domínio raiz (stravafight.com.br):

Tipo: A
Nome: @ (ou deixe vazio)
Valor: 76.76.21.21
TTL: 3600
```

```
2️⃣ Para www (www.stravafight.com.br):

Tipo: CNAME
Nome: www
Valor: ef613c8bca1e8e7b.vercel-dns-017.com.
TTL: 3600
```

⚠️ **IMPORTANTE:** 
- O valor do CNAME do `www` é específico do seu projeto: `ef613c8bca1e8e7b.vercel-dns-017.com.`
- Copie EXATAMENTE como está (incluindo o ponto no final)
- O IP `76.76.21.21` é o IP da Vercel

---

### **Opção 2: Usando Nameservers da Vercel (alternativa)**

Se preferir delegar completamente para a Vercel:

```
Nameserver 1: ns1.vercel-dns.com
Nameserver 2: ns2.vercel-dns.com
```

⚠️ Esta opção remove o controle do DNS do Registro.br e passa 100% para a Vercel.

---

## ⏱️ Tempo de Propagação

- **Mínimo:** 5-10 minutos
- **Máximo:** 48 horas
- **Média:** 1-2 horas

---

## ✅ Como verificar se funcionou:

### **Teste 1: Ping no terminal**
```bash
ping stravafight.com.br
ping www.stravafight.com.br
```

Se retornar `76.76.21.21`, está correto!

### **Teste 2: Verificar na Vercel**
```bash
cd /home/catycaney/Downloads/stravafight
vercel domains inspect stravafight.com.br
vercel domains inspect www.stravafight.com.br
```

### **Teste 3: Acessar no navegador**
- https://stravafight.com.br
- https://www.stravafight.com.br

---

## 🔒 Certificado SSL

A Vercel vai gerar automaticamente o certificado SSL gratuito assim que o DNS estiver propagado.

Você verá:
- ✅ Cadeado verde no navegador
- ✅ HTTPS funcionando

---

## 🆘 Problemas Comuns

### **❌ "DNS_PROBE_FINISHED_NXDOMAIN"**
- DNS ainda não propagou
- Aguarde mais alguns minutos

### **❌ "ERR_SSL_VERSION_OR_CIPHER_MISMATCH"**
- DNS configurado, mas SSL ainda não foi gerado
- Aguarde 5-10 minutos

### **❌ "stravafight.com.br refused to connect"**
- Verifique se o registro A está apontando para `76.76.21.21`
- Verifique se o domínio está ativo no Registro.br

---

## 📞 Comandos úteis:

```bash
# Ver todos os domínios
vercel domains ls

# Verificar configuração DNS
vercel domains verify stravafight.com.br
vercel domains verify www.stravafight.com.br

# Inspecionar domínio
vercel domains inspect stravafight.com.br

# Remover domínio (se precisar)
vercel domains rm stravafight.com.br
```

---

## 🎯 Resumo Rápido:

1. ✅ Domínios já adicionados na Vercel (feito por mim)
2. ⏳ Configure DNS no Registro.br (você precisa fazer)
3. ⏱️ Aguarde propagação (5 min a 2 horas)
4. ✅ SSL será gerado automaticamente
5. 🚀 Site estará acessível em stravafight.com.br

---

**Dúvidas?** Me chame quando terminar de configurar o DNS no Registro.br que eu verifico se está tudo certo! 🚀
