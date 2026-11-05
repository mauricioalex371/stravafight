#!/bin/bash

echo "🔍 Verificando DNS de stravafight.com.br..."
echo ""

echo "📋 Nameservers atuais:"
dig +short NS stravafight.com.br
echo ""

echo "📍 Registro A (IP):"
dig +short A stravafight.com.br
echo ""

echo "🌐 Registro WWW (CNAME):"
dig +short CNAME www.stravafight.com.br
echo ""

echo "✅ Teste de acesso HTTP:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" https://stravafight.com.br 2>&1 || echo "Ainda não acessível"
echo ""

echo "📊 Verificação Vercel:"
vercel domains inspect stravafight.com.br 2>&1 | grep -E "(Intended|Current|WARNING)" || echo "Tudo OK!"
