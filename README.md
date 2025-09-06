# Sistema de Gestão de Simuladores Educacionais

Sistema completo de gestão de simuladores educacionais desenvolvido com Next.js, TypeScript, Supabase e Netlify, seguindo as melhores práticas de arquitetura, segurança e escalabilidade.

## 🚀 Características

- **Frontend**: Next.js 14 com App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: API Routes com validação Zod e Prisma ORM
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth com sistema RBAC
- **Storage**: Supabase Storage para uploads seguros
- **Gráficos**: Recharts para dashboards interativos
- **Deploy**: Netlify com CI/CD via GitHub Actions
- **Qualidade**: ESLint, Prettier, Husky, Vitest

## 🎨 Design System

Paleta de cores personalizada inspirada em design moderno:

- **Background**: #0A1A24 (fundo dark azulado)
- **Surface**: #112B3A (cards/overlays)
- **Primary**: #2FA3C7 (botões/links)
- **Accent**: #57C1E8 (destaques)
- **Muted**: #708090 (texto secundário)

## 📊 Funcionalidades

### Gestão de Simuladores

- CRUD completo de simuladores educacionais
- Sistema de códigos únicos (SIM-{codeBase}-NNN)
- Ementa detalhada com editor rich text
- Objetivos de desenvolvimento
- Sistema de anexos (Link, Embed, Arquivo)
- Preview seguro de simuladores
- Controle de publicação

### Organização

- Áreas e subáreas de conhecimento
- Grupos de simuladores
- Sistema de filtros e busca
- Paginação e ordenação

### Roadmap e Priorização

- Métrica RICE (Reach, Impact, Confidence, Effort)
- Status de desenvolvimento (Ideia, Protótipo, Piloto, Produção)
- Transições de status controladas
- Ranking de priorização

### Dashboard

- Gráficos de cobertura por área
- Distribuição de simuladores por grupo
- Top 20 ranking RICE
- Métricas de resumo

### Import/Export

- Importação de planilhas Excel/CSV
- Exportação completa com todas as abas
- Validação e relatório de erros
- Mapeamento de campos atualizado

### Segurança

- Autenticação Supabase
- Sistema RBAC (Viewer, Editor, Admin)
- Headers de segurança
- Sanitização de HTML
- Rate limiting
- Validação de uploads

## 🛠️ Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- pnpm (recomendado) ou npm
- Conta no Supabase
- Conta no Netlify (para deploy)

### 1. Clone o repositório

```bash
git clone <repository-url>
cd gerenciamento-simuladores
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e configure suas variáveis:

```bash
cp env.example .env.local
```

Edite `.env.local` com suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_supabase_database_url
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configure o Supabase

#### 4.1. Crie um novo projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote as credenciais (URL, anon key, service role key)

#### 4.2. Configure o banco de dados

Execute as migrações do Prisma:

```bash
pnpm db:generate
pnpm db:push
```

#### 4.3. Execute o seed

Popule o banco com dados iniciais:

```bash
pnpm db:seed
```

#### 4.4. Configure o Storage

1. No painel do Supabase, vá para Storage
2. Crie um bucket chamado `simulators`
3. Configure as políticas de acesso:

```sql
-- Política para upload (apenas usuários autenticados)
CREATE POLICY "Users can upload files" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para visualização (apenas usuários autenticados)
CREATE POLICY "Users can view files" ON storage.objects
FOR SELECT USING (auth.role() = 'authenticated');
```

#### 4.5. Configure a autenticação

1. No painel do Supabase, vá para Authentication > Settings
2. Configure as URLs permitidas:
   - Site URL: `http://localhost:3000` (desenvolvimento)
   - Redirect URLs: `http://localhost:3000/auth/callback`

### 5. Execute o projeto

```bash
pnpm dev
```

O projeto estará disponível em `http://localhost:3000`.

## 🚀 Deploy no Netlify

### 1. Configure o repositório no GitHub

1. Faça push do código para um repositório GitHub
2. Configure as secrets necessárias no GitHub:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
   - `NEXT_PUBLIC_APP_URL`
   - `NETLIFY_AUTH_TOKEN`
   - `NETLIFY_SITE_ID`

### 2. Configure o Netlify

1. Acesse [netlify.com](https://netlify.com)
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente no Netlify:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
   - `NEXT_PUBLIC_APP_URL`

### 3. Configure o Supabase para produção

1. Atualize as URLs permitidas no Supabase:
   - Site URL: `https://your-app.netlify.app`
   - Redirect URLs: `https://your-app.netlify.app/auth/callback`

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia o servidor de desenvolvimento
pnpm build            # Constrói a aplicação para produção
pnpm start            # Inicia o servidor de produção

# Qualidade de código
pnpm lint             # Executa o ESLint
pnpm lint:fix         # Corrige problemas do ESLint
pnpm type-check       # Verifica tipos TypeScript
pnpm format           # Formata código com Prettier

# Testes
pnpm test             # Executa os testes
pnpm test:ui          # Interface de testes
pnpm test:coverage    # Testes com cobertura

# Banco de dados
pnpm db:generate      # Gera o cliente Prisma
pnpm db:push          # Aplica mudanças no schema
pnpm db:migrate       # Executa migrações
pnpm db:seed          # Popula o banco com dados iniciais
pnpm db:studio        # Interface visual do banco

# Git hooks
pnpm prepare          # Instala hooks do Husky
```

## 🏗️ Arquitetura

### Estrutura de Pastas

```
├── app/                    # App Router do Next.js
│   ├── (dashboard)/        # Layout do dashboard
│   ├── api/               # API Routes
│   ├── auth/              # Páginas de autenticação
│   └── globals.css        # Estilos globais
├── components/            # Componentes React
│   └── ui/               # Componentes base (shadcn/ui)
├── lib/                  # Utilitários e configurações
├── prisma/               # Schema e migrações do banco
├── public/               # Arquivos estáticos
└── test/                 # Configuração de testes
```

### Fluxo de Dados

1. **Frontend**: Componentes React com hooks personalizados
2. **API Routes**: Validação com Zod e processamento
3. **Prisma**: ORM para acesso ao banco
4. **Supabase**: PostgreSQL + Auth + Storage

### Sistema RBAC

- **Viewer**: Apenas visualização e exportação
- **Editor**: CRUD de simuladores e roadmap
- **Admin**: Acesso total + gestão de usuários

## 🔒 Segurança

### Headers de Segurança

- Content Security Policy (CSP) restritiva
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security

### Validação

- Zod para validação de dados
- DOMPurify para sanitização de HTML
- Validação de URLs e domínios permitidos

### Upload Seguro

- Validação de tipos de arquivo
- Limite de tamanho (100MB)
- Políticas de acesso no Supabase Storage

## 🧪 Testes

O projeto inclui configuração completa de testes:

```bash
# Executar todos os testes
pnpm test

# Testes com interface visual
pnpm test:ui

# Testes com cobertura
pnpm test:coverage
```

## 📊 Monitoramento

### Métricas Disponíveis

- Cobertura por área de conhecimento
- Distribuição de simuladores por grupo
- Ranking RICE de priorização
- Taxa de publicação de simuladores

### Logs

- Logs estruturados no console
- Tratamento de erros centralizado
- Validação de dados com feedback

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte e dúvidas:

1. Verifique a documentação
2. Procure por issues similares no GitHub
3. Crie uma nova issue com detalhes do problema

## 🎯 Roadmap

### Próximas Funcionalidades

- [ ] Sistema de notificações
- [ ] Relatórios avançados
- [ ] Integração com LMS
- [ ] API pública
- [ ] Mobile app
- [ ] Analytics avançados

---

Desenvolvido com ❤️ para a educação
