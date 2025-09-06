// Script para criar usuários no Supabase usando a API
// Execute com: node scripts/setup-users.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const users = [
  {
    email: 'admin@simuladores.com',
    password: 'admin123',
    user_metadata: {
      name: 'Administrador do Sistema'
    }
  },
  {
    email: 'editor@simuladores.com',
    password: 'editor123',
    user_metadata: {
      name: 'Editor Principal'
    }
  },
  {
    email: 'viewer@simuladores.com',
    password: 'viewer123',
    user_metadata: {
      name: 'Visualizador'
    }
  }
];

async function createUsers() {
  console.log('🚀 Criando usuários no Supabase...\n');

  for (const user of users) {
    try {
      console.log(`📧 Criando usuário: ${user.email}`);
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_metadata: user.user_metadata,
        email_confirm: true
      });

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`⚠️  Usuário ${user.email} já existe, pulando...`);
        } else {
          console.error(`❌ Erro ao criar usuário ${user.email}:`, error.message);
        }
      } else {
        console.log(`✅ Usuário ${user.email} criado com sucesso!`);
      }
    } catch (err) {
      console.error(`❌ Erro inesperado ao criar usuário ${user.email}:`, err.message);
    }
  }

  console.log('\n🎉 Processo concluído!');
  console.log('\n📋 Credenciais de login:');
  console.log('👑 Admin: admin@simuladores.com / admin123');
  console.log('✏️  Editor: editor@simuladores.com / editor123');
  console.log('👁️  Viewer: viewer@simuladores.com / viewer123');
}

createUsers().catch(console.error);
