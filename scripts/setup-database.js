const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupDatabase() {
  try {
    console.log('🔧 Configurando banco de dados...');
    
    // Test connection
    const { data, error } = await supabase.from('_supabase_migrations').select('*').limit(1);
    
    if (error && error.code === 'PGRST116') {
      console.log('✅ Conexão com Supabase estabelecida!');
      console.log('📝 As tabelas serão criadas automaticamente quando você executar o aplicativo.');
      console.log('🚀 Execute: npm run dev');
    } else if (error) {
      console.error('❌ Erro de conexão:', error);
    } else {
      console.log('✅ Banco de dados já configurado!');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

setupDatabase();
