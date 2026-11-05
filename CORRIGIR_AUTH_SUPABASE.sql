-- ========================================
-- STRAVA FIGHT - CORREÇÃO AUTENTICAÇÃO
-- ========================================
-- Execute este SQL no Supabase SQL Editor para corrigir problemas de autenticação

-- 1. VERIFICAR CONFIGURAÇÃO ATUAL
SELECT
  raw_app_meta_data->'providers' as auth_providers,
  email_confirmed_at,
  confirmation_sent_at,
  created_at
FROM auth.users
LIMIT 1;

-- 2. VERIFICAR SE HÁ USUÁRIOS CRIADOS
SELECT COUNT(*) as total_users FROM auth.users;

-- 3. VERIFICAR POLÍTICAS RLS DA TABELA PROFILES
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 4. HABILITAR CADASTRO SEM CONFIRMAÇÃO DE EMAIL (TEMPORÁRIO PARA TESTES)
-- NOTA: Execute isso SOMENTE se quiser permitir cadastros sem verificação de email
-- Para fazer isso permanentemente, vá em: Authentication > Email Auth > Disable email confirmations

-- 5. VERIFICAR LOGS DE ERROS RECENTES (se disponível)
-- SELECT * FROM auth.audit_log_entries ORDER BY created_at DESC LIMIT 10;

