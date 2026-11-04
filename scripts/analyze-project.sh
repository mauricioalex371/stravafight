#!/bin/bash
# STRAVA FIGHT — Análise Automatizada do Projeto

echo "==================================="
echo "STRAVA FIGHT — INVENTÁRIO TÉCNICO"
echo "==================================="
echo ""

echo "📊 MÉTRICAS GERAIS"
echo "-----------------------------------"
echo "Total de arquivos TypeScript: $(find src -name "*.ts" -o -name "*.tsx" | wc -l)"
echo "Total de componentes (*.tsx): $(find src/components -name "*.tsx" | wc -l)"
echo "Total de views/páginas: $(find src/views -name "*.tsx" | wc -l)"
echo "Total de serviços: $(find src/services -name "*.ts" | wc -l)"
echo "Total de testes: $(find src/__tests__ -name "*.test.ts" | wc -l)"
echo "Total de migrations SQL: $(find supabase/migrations -name "*.sql" | wc -l)"
echo ""

echo "📁 ESTRUTURA DE CÓDIGO"
echo "-----------------------------------"
echo "VIEWS (Páginas):"
ls -1 src/views/ | sed 's/^/  - /'
echo ""

echo "COMPONENTES PRINCIPAIS:"
ls -1 src/components/ | sed 's/^/  - /'
echo ""

echo "SERVIÇOS:"
ls -1 src/services/ | grep -v "supabase" | sed 's/^/  - /'
echo ""

echo "CONTEXTS:"
ls -1 src/contexts/ | sed 's/^/  - /'
echo ""

echo "HOOKS CUSTOMIZADOS:"
ls -1 src/hooks/ | sed 's/^/  - /'
echo ""

echo "🗄️ BANCO DE DADOS"
echo "-----------------------------------"
echo "Migrations disponíveis:"
ls -1 supabase/migrations/ | sed 's/^/  /'
echo ""

echo "🧪 TESTES"
echo "-----------------------------------"
echo "Suites de teste:"
ls -1 src/__tests__/ | sed 's/^/  - /'
echo ""

echo "📦 DEPENDÊNCIAS"
echo "-----------------------------------"
echo "Dependencies principais:"
cat package.json | grep -A 30 '"dependencies"' | grep -v '{' | grep -v '}' | head -15 | sed 's/,$//' | sed 's/^[[:space:]]*/  /'
echo ""

echo "📝 LINHAS DE CÓDIGO"
echo "-----------------------------------"
echo "Total de linhas (src/):"
find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1 | awk '{print "  " $1 " linhas"}'
echo ""

echo "==================================="
echo "ANÁLISE CONCLUÍDA"
echo "==================================="
