# 🔥 PLANO DE CORREÇÕES MOBILE - STRAVA FIGHT

## ✅ PRIORIDADE ALTA (Fazer AGORA)

### 1. **Perfil Sem Scroll** 🔴
- **Problema:** Container com overflow-hidden bloqueando scroll
- **Solução:** Corrigir ProfileView.tsx para permitir scroll vertical
- **Impacto:** CRÍTICO - usuários não conseguem ver conteúdo

### 2. **Notificações Fantasma** 🔴
- **Problema:** Badge de notificação aparece sem dados reais
- **Solução:** Verificar lógica de contagem e limpar notificações fake
- **Impacto:** ALTO - confunde usuários

### 3. **Textos Sobre Imagens** 🔴
- **Problema:** Títulos/descrições sobrepondo fotos de perfil
- **Solução:** Ajustar z-index, espaçamento e layout
- **Impacto:** ALTO - visual quebrado

### 4. **Botões com Textos Confusos** 🟡
- **Problema:** CTAs não claros, verbosos demais
- **Solução:** Copywriting profissional, icônico, direto
- **Impacto:** MÉDIO - UX ruim

### 5. **Filtro de Imagem Pinch-to-Zoom** 🟡
- **Problema:** Ajuste de filtro difícil em mobile
- **Solução:** Implementar gestures de dois dedos
- **Impacto:** MÉDIO - melhor UX

---

## 📋 CHECKLIST DE CORREÇÕES

### **FASE 1: Crítico (30min)**
- [ ] Corrigir scroll no ProfileView
- [ ] Remover notificações fantasma
- [ ] Ajustar z-index de textos/imagens

### **FASE 2: Layout Mobile (1h)**
- [ ] Revisar todos os containers com overflow
- [ ] Ajustar espaçamentos mobile
- [ ] Garantir touch-targets de 44px mínimo
- [ ] Testar em viewport 375px (iPhone SE)

### **FASE 3: Copywriting (30min)**
- [ ] Simplificar todos os CTAs
- [ ] Usar verbos de ação claros
- [ ] Remover jargões técnicos
- [ ] Emojis estratégicos

### **FASE 4: Gestures (30min)**
- [ ] Pinch-to-zoom no filtro de imagem
- [ ] Swipe gestures onde fizer sentido

---

## 🎨 COPYWRITING - ANTES/DEPOIS

### Botões Principais
❌ "Check-in diário, SF Activity filter e acompanhe sua evolução"
✅ "Registrar Treino"

❌ "Participe de desafios, ganhe XP, desbloqueie badges"
✅ "Desafiar Amigo"

❌ "Configurar academia e catálogo oficial"
✅ "Minha Academia"

### Navegação
❌ "Solicitações de Amizade Pendentes"
✅ "Pedidos" (com badge)

❌ "Publicações e Reels Salvos"
✅ "Salvos"

❌ "Configurações da Conta"
✅ "Ajustes"

---

## 🎯 REFERÊNCIAS (Apps Mobile-First)

### Instagram
- Feed infinito suave
- Stories no topo
- Navbar minimalista (5 ícones)
- Textos curtos, diretos

### TikTok
- Full-screen vertical
- Swipe natural
- CTAs visuais (ícones grandes)
- Zero clutter

### Twitter/X
- Timeline fluido
- Pull-to-refresh
- Fab button (+)
- Notificações claras

---

## 🚀 MÉTRICAS DE SUCESSO

- [ ] Scroll funciona 100%
- [ ] Zero notificações fake
- [ ] Todos os textos visíveis
- [ ] Touch targets ≥ 44px
- [ ] Tempo de carregamento < 2s
- [ ] Zero layout shifts

---

## ⚡ AÇÃO IMEDIATA

**Começar por:** ProfileView scroll + Notificações fake
**Razão:** Bloqueadores críticos de UX

**Tempo estimado total:** 2-3 horas
**Resultado:** App profissional, pronto para escala
