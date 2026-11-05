-- ========================================
-- URGENTE: DESABILITAR CONFIRMAÇÃO DE EMAIL
-- ========================================
-- Execute ESTE SQL no Supabase SQL Editor IMEDIATAMENTE

-- 1. Verificar configuração atual de auth
SELECT 
  setting_name,
  value,
  description
FROM auth.config
WHERE setting_name IN ('mailer_autoconfirm', 'email_provider', 'site_url');

-- 2. Se não houver configuração, execute isto para permitir cadastros:
-- NOTA: Esta query pode não funcionar diretamente no SQL Editor
-- Você precisa fazer via Dashboard: Authentication > Email Auth > Disable email confirmations

-- ========================================
-- SOLUÇÃO VIA DASHBOARD (FAÇA ISSO AGORA):
-- ========================================
-- 1. Vá em: https://supabase.com/dashboard/project/olwwkgtxkduvyhduudbx
-- 2. Menu lateral: Authentication > Providers
-- 3. Clique em "Email"
-- 4. DESABILITE "Enable email confirmations" (toggle OFF)
-- 5. Clique em "Save"
-- 
-- Isso vai permitir que usuários criem contas sem verificar email primeiro.
-- ========================================

-- 3. Verificar se há usuários bloqueados
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmation_sent_at,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 4. Se houver usuários com email_confirmed_at NULL, você pode confirmar manualmente:
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW(), 
--     updated_at = NOW()
-- WHERE email = 'email@usuario.com';
