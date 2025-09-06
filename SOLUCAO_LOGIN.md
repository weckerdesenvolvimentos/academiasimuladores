# 🔐 Solução para Problema de Login

## Problema Identificado
Os usuários foram criados apenas na tabela `users` do banco de dados, mas **NÃO** no sistema de autenticação do Supabase. Por isso, o login não funciona.

## Solução: Criar Usuários no Sistema de Autenticação

### Método 1: Via Supabase Dashboard (Mais Fácil) ⭐

1. **Acesse o Supabase Dashboard**
   - Vá para [supabase.com](https://supabase.com)
   - Faça login na sua conta
   - Selecione seu projeto

2. **Vá para Authentication > Users**
   - No menu lateral, clique em "Authentication"
   - Clique em "Users"

3. **Crie os usuários manualmente**
   - Clique em "Add user" (botão azul no canto superior direito)
   - Crie os seguintes usuários:

   **👑 Usuário Admin:**
   - Email: `admin@simuladores.com`
   - Senha: `admin123`
   - Confirme o email: ✅ (marque esta opção)

   **✏️ Usuário Editor:**
   - Email: `editor@simuladores.com`
   - Senha: `editor123`
   - Confirme o email: ✅ (marque esta opção)

   **👁️ Usuário Viewer:**
   - Email: `viewer@simuladores.com`
   - Senha: `viewer123`
   - Confirme o email: ✅ (marque esta opção)

### Método 2: Via SQL Editor

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

## Por que isso aconteceu?

O sistema de autenticação do Supabase funciona com duas tabelas:
- `auth.users` - Usuários do sistema de autenticação (onde as senhas são armazenadas)
- `public.users` - Usuários da aplicação (dados adicionais)

Os usuários foram criados apenas na tabela `public.users`, mas não na `auth.users`, por isso o login não funciona.

## Segurança

⚠️ **IMPORTANTE:** Estas são senhas temporárias para desenvolvimento. Em produção, você deve:

1. Alterar todas as senhas
2. Usar senhas mais seguras
3. Configurar autenticação de dois fatores
4. Implementar políticas de senha mais rigorosas

## Troubleshooting

Se ainda não conseguir fazer login:

1. Verifique se os usuários foram criados em "Authentication > Users"
2. Confirme se o email está verificado (deve aparecer um ✅ verde)
3. Verifique se as variáveis de ambiente estão corretas
4. Teste com diferentes navegadores/aba anônima
5. Limpe o cache do navegador

## Próximos Passos

Após conseguir fazer login:
1. Teste todas as funcionalidades
2. Altere as senhas padrão
3. Configure usuários adicionais conforme necessário
4. Implemente políticas de segurança adequadas
