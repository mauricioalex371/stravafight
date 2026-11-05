# 🎬 Como Adicionar Vídeo no Splash Screen

## 📹 Opções de Vídeo

### Opção 1: Vídeo Local (Recomendado)
Coloque seu vídeo na pasta `public/`:

```bash
# Copie seu vídeo para:
public/splash-video.mp4
# ou
public/splash-video.webm
```

**Formatos suportados:**
- ✅ MP4 (H.264) - melhor compatibilidade
- ✅ WebM - menor tamanho
- ✅ MOV - converta para MP4

**Tamanho recomendado:**
- Resolução: 1080x1920 (vertical) ou 1920x1080 (horizontal)
- Duração: 5-10 segundos
- Peso: < 5MB (otimizado)
- FPS: 30fps

---

### Opção 2: Vídeo Externo (URL)
Se hospedar em servidor externo:

```tsx
// Em src/components/SplashScreen.tsx
<video ...>
  <source src="https://seu-servidor.com/video.mp4" type="video/mp4" />
</video>
```

**Serviços compatíveis:**
- ✅ Cloudinary
- ✅ AWS S3
- ✅ Vimeo (com player API)
- ✅ YouTube (requer iframe, não tag video)

---

## 🎨 Otimização de Vídeo

### Converter/Otimizar com FFmpeg:

```bash
# Instale FFmpeg: https://ffmpeg.org/

# Converter para MP4 otimizado (H.264)
ffmpeg -i seu-video.mov -c:v libx264 -crf 28 -preset fast -c:a aac -b:a 128k -vf scale=1920:1080 splash-video.mp4

# Converter para WebM (menor tamanho)
ffmpeg -i seu-video.mov -c:v libvpx-vp9 -crf 35 -b:v 0 -vf scale=1920:1080 splash-video.webm

# Reduzir duração para 5 segundos
ffmpeg -i seu-video.mp4 -t 5 -c copy splash-video-5s.mp4

# Reduzir FPS para 24
ffmpeg -i seu-video.mp4 -filter:v fps=24 splash-video-24fps.mp4
```

---

## 🔧 Configuração Atual

O código já está preparado para receber vídeo!

**Arquivo:** `src/components/SplashScreen.tsx`

**Configuração:**
```tsx
<video
  autoPlay       // Inicia automaticamente
  muted          // Sem som (obrigatório para autoplay)
  loop           // Repete infinitamente
  playsInline    // Não abre fullscreen no mobile
  className="... opacity-40" // 40% de opacidade
>
  <source src="/splash-video.mp4" type="video/mp4" />
  <source src="/splash-video.webm" type="video/webm" />
</video>
```

**Overlay:**
- Gradiente escuro: `from-black/60 via-transparent to-black/80`
- Garante que logo e texto fiquem legíveis

---

## 📱 Sugestões de Vídeo

### Tipos de Conteúdo:
1. **Treino/Luta em Slow Motion**
   - Golpes técnicos
   - Sparring intenso
   - Movimentos fluidos

2. **Montagem Rápida**
   - Vários atletas treinando
   - Cortes dinâmicos
   - Música épica de fundo

3. **Academia/Tatame**
   - Vista aérea do tatame
   - Pessoas treinando ao fundo
   - Ambiente autêntico

4. **Animação/Motion Graphics**
   - Logo animado SF
   - Partículas/efeitos
   - Futurista/tecnológico

### Bancos de Vídeo Gratuitos:
- **Pexels Videos:** https://pexels.com/videos/
- **Pixabay Videos:** https://pixabay.com/videos/
- **Videvo:** https://videvo.net/
- **Coverr:** https://coverr.co/

**Busque por:**
- "martial arts training"
- "boxing gym"
- "jiu jitsu"
- "mma fighter"
- "combat sports"

---

## 🚀 Como Implementar

### Passo 1: Escolha/Otimize o Vídeo
```bash
# Exemplo: otimizar para web
ffmpeg -i original.mp4 -c:v libx264 -crf 28 -vf scale=1920:1080 -t 10 splash-video.mp4
```

### Passo 2: Copie para Public
```bash
cp splash-video.mp4 public/
```

### Passo 3: Build e Deploy
```bash
npm run build
git add public/splash-video.mp4
git commit -m "feat: vídeo no splash screen"
git push origin main
```

### Passo 4: Teste
1. Acesse: https://stravafight.vercel.app
2. Veja vídeo tocando no fundo
3. Logo sobreposta nítida
4. Loading bar funcionando

---

## ⚡ Performance

### Carregamento Otimizado:
- ✅ `poster` attribute: mostra frame estático enquanto carrega
- ✅ `preload="auto"`: começa download antecipado
- ✅ Múltiplos formatos: MP4 + WebM (fallback)
- ✅ Lazy loading: só carrega quando necessário

### Mobile-Friendly:
- ✅ `playsInline`: não abre fullscreen
- ✅ `muted`: permite autoplay no iOS/Android
- ✅ `object-cover`: mantém proporção
- ✅ Overlay escuro: economiza bateria (menos brilho)

---

## 🎨 Ajustes Visuais

### Alterar Opacidade do Vídeo:
```tsx
// Mais visível (menos escuro)
className="... opacity-60"

// Menos visível (mais escuro)
className="... opacity-30"
```

### Alterar Overlay:
```tsx
// Mais escuro
className="... from-black/80 via-black/40 to-black/90"

// Mais claro
className="... from-black/40 via-transparent to-black/60"
```

### Desfocar Vídeo:
```tsx
className="... blur-sm opacity-40"
```

---

## 📊 Exemplo Completo

```tsx
<video
  autoPlay
  muted
  loop
  playsInline
  preload="auto"
  poster="/poster.jpg"
  onLoadedData={() => console.log('Vídeo carregado!')}
  className="absolute inset-0 w-full h-full object-cover opacity-40"
>
  <source src="/splash-video.mp4" type="video/mp4" />
  <source src="/splash-video.webm" type="video/webm" />
  Seu navegador não suporta vídeos.
</video>
```

---

## 🐛 Troubleshooting

### Vídeo não aparece:
1. Verifique se arquivo está em `public/`
2. Limpe cache do navegador (Ctrl+Shift+R)
3. Confira console do navegador por erros
4. Teste em modo anônimo

### Vídeo não toca no mobile:
- ✅ Certifique que tem `muted`
- ✅ Certifique que tem `playsInline`
- ✅ Use formato MP4 H.264 (mais compatível)

### Vídeo muito grande/lento:
- Reduza resolução: 1920x1080 → 1280x720
- Aumente compressão: `-crf 28` → `-crf 32`
- Reduza duração: `-t 5` (5 segundos)
- Use WebM junto com MP4

---

## ✅ Checklist

- [ ] Vídeo escolhido/criado
- [ ] Vídeo otimizado (< 5MB)
- [ ] Vídeo copiado para `public/`
- [ ] Build local funcionando
- [ ] Deploy em produção
- [ ] Testado no mobile
- [ ] Testado em diferentes navegadores
- [ ] Performance OK (< 3s para carregar)

---

## 🎬 Pronto!

Agora é só adicionar seu vídeo e ver o splash screen ganhar vida! 🔥

**Qualquer dúvida, me chame!**
