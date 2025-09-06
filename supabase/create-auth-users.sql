-- Script para criar usuários no sistema de autenticação do Supabase
-- Execute este script no Supabase SQL Editor

-- 1. Criar usuários na tabela auth.users
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES 
-- Admin user (senha: admin123)
(
    'user_1',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@simuladores.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Administrador do Sistema"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
-- Editor user (senha: editor123)
(
    'user_2',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'editor@simuladores.com',
    crypt('editor123', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Editor Principal"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
-- Viewer user (senha: viewer123)
(
    'user_3',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'viewer@simuladores.com',
    crypt('viewer123', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Visualizador"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- 2. Criar identidades para os usuários
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES 
-- Admin identity
(
    'user_1',
    'user_1',
    '{"sub": "user_1", "email": "admin@simuladores.com", "email_verified": true, "phone_verified": false}',
    'email',
    NULL,
    NOW(),
    NOW()
),
-- Editor identity
(
    'user_2',
    'user_2',
    '{"sub": "user_2", "email": "editor@simuladores.com", "email_verified": true, "phone_verified": false}',
    'email',
    NULL,
    NOW(),
    NOW()
),
-- Viewer identity
(
    'user_3',
    'user_3',
    '{"sub": "user_3", "email": "viewer@simuladores.com", "email_verified": true, "phone_verified": false}',
    'email',
    NULL,
    NOW(),
    NOW()
);
