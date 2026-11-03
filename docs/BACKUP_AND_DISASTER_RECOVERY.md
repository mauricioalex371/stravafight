# STRAVA FIGHT — ESTRATÉGIA DE BACKUP E RECUPERAÇÃO DE DESASTRES (DISASTER RECOVERY)

Este documento define os procedimentos operacionais para proteção de dados, versionamento de banco e recuperação rápida para a plataforma **STRAVA FIGHT** (`https://stravafight.com.br`).

---

## 1. ARQUITETURA DE ARMAZENAMENTO E DADOS

A plataforma opera sob uma arquitetura híbrida de alta resiliência:
- **Banco de Dados Principal:** Supabase PostgreSQL com criptografia em repouso (AES-256) e RLS (Row Level Security).
- **Mídia e Arquivos Estáticos:** Supabase Storage (Buckets S3-compatible: `posts-media`, `stories-media`, `avatars`, `academy-documents`, `campaigns-assets`).
- **Resiliência Local / Offline:** In-Memory Cache e persistência estruturada para permitir que academias (SF Academy) e alunos continuem operando mesmo em momentos de oscilação de conexão no tatame.

---

## 2. POLÍTICA DE BACKUP AUTOMATIZADO

### A. Backup Contínuo do Banco de Dados (PITR - Point-in-Time Recovery)
- No plano Supabase Pro/Team para produção:
  - **WAL (Write-Ahead Logging) contínuo:** permite restaurar o banco para qualquer segundo específico nos últimos 7 a 30 dias.
  - **Backups físicos diários:** snapshots completos gerados às 03:00 UTC (horário de menor tráfego).
  - **Retenção:** 30 dias para snapshots diários; 1 ano para backups mensais arquivados em Cold Storage (AWS Glacier / Google Cloud Storage Archive).

### B. Backup de Arquivos de Mídia (Supabase Storage)
- Os buckets do Supabase Storage contam com redundância multi-zona.
- Para desastres regionais, recomenda-se configurar replicação cruzada periódica via script CLI:
  ```bash
  # Sincronização automatizada para bucket de backup secundário
  rclone sync supabase:posts-media backup-gcs:stravafight-archive/posts-media/
  ```

---

## 3. VERSIONAMENTO E APLICAÇÃO DE MIGRATIONS

Todas as alterações estruturais de banco estão estritamente versionadas no repositório em `/supabase/migrations/`:
1. `00001_initial_schema.sql` — Perfis, postagens, check-ins, graduações e ERP acadêmico (alunos, turmas, mensalidades, caixa).
2. `00002_business_schema.sql` — Central de anúncios, perfis comerciais, produtos, patrocínios e métricas de anúncios.
3. `00003_storage_buckets_and_rls.sql` — Criação de buckets e políticas RLS de upload/leitura de mídia.
4. `00004_security_and_moderation.sql` — Denúncias comunitárias, bloqueio de usuários e trilhas de auditoria administrativa.

### Procedimento de Aplicação no Kiro / Produção:
```bash
# Linkar ao projeto de produção no Supabase
supabase link --project-ref <PROJECT_ID>

# Testar migrations localmente
supabase db diff

# Aplicar migrations de forma segura
supabase db push
```

---

## 4. PROCEDIMENTO DE RECUPERAÇÃO EMERGENCIAL (RTO & RPO)

- **RTO (Recovery Time Objective):** Tempo máximo tolerado de retorno: **< 15 minutos**.
- **RPO (Recovery Point Objective):** Perda máxima tolerada de dados: **< 5 minutos** (graças ao WAL contínuo do PITR).

### Passos de Restauração:
1. **Identificação da Falha:** Verificar se a corrupção é lógica (ex: exclusão acidental) ou física de infraestrutura.
2. **Ativação de Manutenção:** Redirecionar temporariamente a Vercel para a página estática `/public/maintenance.html` se necessário.
3. **Restauração via Dashboard Supabase:**
   - Acesse *Database* ➔ *Backups* ➔ *Point in Time*.
   - Selecione o carimbo de data/hora imediatamente anterior ao incidente.
   - Confirme a restauração no cluster primário.
4. **Verificação de Integridade:**
   - Execute o script de validação de dados:
     ```bash
     npm test
     ```
5. **Reativação de Tráfego:** Desativar página de manutenção na Vercel e normalizar DNS.

---

## 5. BACKUP LOCAL DAS ACADEMIAS (SF ACADEMY EXPORT)

Para garantir que mestres e proprietários de academias nunca fiquem reféns de conexão:
- O módulo **SF Academy** possui botão de **Exportar Backup Completo (JSON)** em `Configurações da Academia`.
- Este arquivo pode ser restaurado a qualquer momento em qualquer dispositivo offline, reconstruindo alunos, turmas, graduações, mensalidades e fluxo de caixa instantaneamente.
