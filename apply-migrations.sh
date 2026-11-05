#!/bin/bash

# ==============================================================================
# STRAVA FIGHT - Script para Aplicar Migrations no Supabase
# ==============================================================================

set -e  # Exit on error

echo "🚀 STRAVA FIGHT - Aplicação de Migrations no Supabase"
echo "======================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if migrations file exists
MIGRATIONS_FILE="MIGRATIONS_COMPLETAS_FIXED_FINAL.sql"

if [ ! -f "$MIGRATIONS_FILE" ]; then
    echo -e "${RED}❌ Erro: Arquivo $MIGRATIONS_FILE não encontrado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Arquivo de migrations encontrado:${NC} $MIGRATIONS_FILE"
echo ""

# Get file info
FILE_SIZE=$(ls -lh "$MIGRATIONS_FILE" | awk '{print $5}')
LINES_COUNT=$(wc -l < "$MIGRATIONS_FILE")

echo "📊 Informações do arquivo:"
echo "   Tamanho: $FILE_SIZE"
echo "   Linhas: $LINES_COUNT"
echo ""

# Verify hash
echo "🔍 Verificando integridade do arquivo..."
EXPECTED_HASH="bb5b3ae033b1e008c97f6a1c438fe146f0cd905df218d79c928e9fa21bab869e"
ACTUAL_HASH=$(sha256sum "$MIGRATIONS_FILE" | awk '{print $1}')

if [ "$ACTUAL_HASH" == "$EXPECTED_HASH" ]; then
    echo -e "${GREEN}✅ Hash validado: $ACTUAL_HASH${NC}"
else
    echo -e "${RED}❌ AVISO: Hash diferente do esperado!${NC}"
    echo "   Esperado: $EXPECTED_HASH"
    echo "   Atual:    $ACTUAL_HASH"
    echo ""
    read -p "   Deseja continuar mesmo assim? (s/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Operação cancelada."
        exit 1
    fi
fi

echo ""
echo "📝 Migrations incluídas:"
echo "   • 00001 - Esquema relacional completo"
echo "   • 00002 - SF Business schema"
echo "   • 00003 - Storage buckets e RLS"
echo "   • 00004 - Segurança e moderação"
echo "   • 00005 - Fix post content RLS"
echo "   • 00006 - Academy management"
echo "   • 00007 - Attendance system"
echo "   • 00008 - Financial control"
echo "   • 00009 - Fix post likes/comments RLS"
echo "   • 00010 - Complete RLS policies"
echo "   • 00011 - Sherdog integration"
echo "   • 00012 - RLS corrections"
echo "   • 00013 - REMOVED (vulnerable)"
echo "   • 00014 - Fix profiles RLS"
echo "   • 00015 - Fix followers RLS"
echo "   • 00016 - Fix notifications RLS"
echo "   • 00017 - Fix conversations RLS"
echo "   • 00018 - Fix stories/reels/activities RLS"
echo "   • 00019 - Protect minor data"
echo "   • 00020 - Financial audit"
echo ""

echo -e "${YELLOW}⚠️  ATENÇÃO:${NC}"
echo "   • Execute este arquivo APENAS UMA VEZ no banco de produção"
echo "   • Certifique-se de ter backup antes de continuar"
echo "   • Supabase faz backups automáticos, mas é bom confirmar"
echo ""

# Check if Supabase CLI is available
if command -v supabase &> /dev/null; then
    echo -e "${GREEN}✅ Supabase CLI detectado${NC}"
    echo ""
    echo "🔧 Métodos disponíveis para aplicar migrations:"
    echo ""
    echo "1. Via Supabase CLI (RECOMENDADO se estiver logado):"
    echo "   $ supabase db push"
    echo ""
    echo "2. Via psql direto:"
    echo "   $ psql \$DATABASE_URL < $MIGRATIONS_FILE"
    echo ""
    echo "3. Via Supabase Dashboard (MANUAL):"
    echo "   1. Acesse: https://app.supabase.com/project/olwwkgtxkduvyhduudbx"
    echo "   2. Navegue para: SQL Editor"
    echo "   3. Clique em: New Query"
    echo "   4. Cole o conteúdo de: $MIGRATIONS_FILE"
    echo "   5. Execute: Run (Ctrl+Enter)"
    echo ""
    
    read -p "Deseja aplicar via Supabase CLI agora? (s/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo ""
        echo "🚀 Aplicando migrations via Supabase CLI..."
        echo ""
        
        # Check if logged in
        if supabase projects list &> /dev/null; then
            # Try to apply migrations
            cat "$MIGRATIONS_FILE" | supabase db execute --linked
            
            if [ $? -eq 0 ]; then
                echo ""
                echo -e "${GREEN}✅ Migrations aplicadas com sucesso!${NC}"
                echo ""
                echo "🎉 Próximos passos:"
                echo "   1. Verifique no Supabase Dashboard se as tabelas foram criadas"
                echo "   2. Teste o login no frontend"
                echo "   3. Verifique se RLS está ativo em todas as tabelas"
            else
                echo ""
                echo -e "${RED}❌ Erro ao aplicar migrations${NC}"
                echo ""
                echo "Tente aplicar manualmente via Dashboard:"
                echo "https://app.supabase.com/project/olwwkgtxkduvyhduudbx/sql"
            fi
        else
            echo ""
            echo -e "${RED}❌ Você não está logado no Supabase CLI${NC}"
            echo ""
            echo "Para fazer login:"
            echo "   $ supabase login"
            echo ""
            echo "Ou aplique manualmente via Dashboard (opção 3 acima)"
        fi
    else
        echo ""
        echo "✋ Operação cancelada. Use uma das opções acima manualmente."
    fi
else
    echo -e "${YELLOW}⚠️  Supabase CLI não detectado${NC}"
    echo ""
    echo "📖 INSTRUÇÕES PARA APLICAR MIGRATIONS MANUALMENTE:"
    echo ""
    echo "1. Acesse o Supabase Dashboard:"
    echo "   https://app.supabase.com/project/olwwkgtxkduvyhduudbx"
    echo ""
    echo "2. Navegue para: SQL Editor (menu lateral esquerdo)"
    echo ""
    echo "3. Clique em: New Query"
    echo ""
    echo "4. Abra o arquivo em um editor de texto:"
    echo "   $ cat $MIGRATIONS_FILE"
    echo ""
    echo "5. Copie TODO o conteúdo do arquivo"
    echo ""
    echo "6. Cole no SQL Editor do Supabase"
    echo ""
    echo "7. Clique em: Run (ou pressione Ctrl+Enter)"
    echo ""
    echo "8. Aguarde a execução (30-60 segundos)"
    echo ""
    echo "9. Verifique se não há erros no console"
    echo ""
    echo "10. ✅ Pronto! Migrations aplicadas"
fi

echo ""
echo "======================================================"
echo "Para mais informações, consulte: DEPLOYMENT_STATUS.md"
echo "======================================================"
