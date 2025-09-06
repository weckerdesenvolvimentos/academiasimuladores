# 🔐 Instruções de Login - Sistema de Gestão de Simuladores

## Problema Identificado
Os usuários foram criados apenas na tabela `users` do banco de dados, mas não no sistema de autenticação do Supabase. Por isso, o login não funciona.

## Solução: Criar Usuários no Sistema de Autenticação

### Opção 1: Via Supabase Dashboard (Recomendado)

1. **Acesse o Supabase Dashboard**
   - Vá para [supabase.com](https://supabase.com)
   - Faça login na sua conta
   - Selecione seu projeto

2. **Vá para Authentication > Users**
   - No menu lateral, clique em "Authentication"
   - Clique em "Users"

3. **Crie os usuários manualmente**
   - Clique em "Add user"
   - Crie os seguintes usuários:

   **Usuário Admin:**
   - Email: `admin@simuladores.com`
   - Senha: `admin123`
   - Confirme o email: ✅

   **Usuário Editor:**
   - Email: `editor@simuladores.com`
   - Senha: `editor123`
   - Confirme o email: ✅

   **Usuário Viewer:**
   - Email: `viewer@simuladores.com`
   - Senha: `viewer123`
   - Confirme o email: ✅

### Opção 2: Via SQL Editor

1. **Acesse o SQL Editor no Supabase**
   - Vá para "SQL Editor" no menu lateral

2. **Execute o script SQL**
   - Copie e cole o conteúdo do arquivo `supabase/create-auth-users.sql`
   - Execute o script

## Credenciais de Login

Após criar os usuários, use estas credenciais para fazer login:

### 👑 Administrador
- **Email:** `admin@simuladores.com`
- **Senha:** `admin123`
- **Permissões:** Acesso total ao sistema

### ✏️ Editor
- **Email:** `editor@simuladores.com`
- **Senha:** `editor123`
- **Permissões:** Pode criar e editar simuladores

### 👁️ Visualizador
- **Email:** `viewer@simuladores.com`
- **Senha:** `viewer123`
- **Permissões:** Apenas visualização

## Verificação

1. Acesse a aplicação
2. Vá para a página de login
3. Use uma das credenciais acima
4. Você deve conseguir fazer login com sucesso

## Segurança

⚠️ **IMPORTANTE:** Estas são senhas temporárias para desenvolvimento. Em produção, você deve:

1. Alterar todas as senhas
2. Usar senhas mais seguras
3. Configurar autenticação de dois fatores
4. Implementar políticas de senha mais rigorosas

## Troubleshooting

Se ainda não conseguir fazer login:

1. Verifique se os usuários foram criados em "Authentication > Users"
2. Confirme se o email está verificado
3. Verifique se as variáveis de ambiente estão corretas
4. Teste com diferentes navegadores/aba anônima
