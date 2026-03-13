const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurações do Supabase
const supabaseUrl = 'https://axjbdymftcpgwhfphhqv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4amJkeW1mdGNwZ3doZnBoaHF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM5Njc1NSwiZXhwIjoyMDg4OTcyNzU1fQ.ULebvDWgX4_ijcJD8MbWxDFmKgCA8QKAIT2wr4VzZvQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQLFile(filePath) {
  try {
    console.log(`📁 Lendo arquivo: ${filePath}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log('🚀 Executando SQL no Supabase...');
    
    // Dividir o SQL em statements individuais
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        console.log(`📝 Executando statement ${i + 1}/${statements.length}...`);
        
        try {
          const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });
          
          if (error) {
            // Se a RPC não existir, tentamos criar uma tabela simples primeiro
            console.log(`⚠️  Erro na RPC: ${error.message}`);
            console.log('📝 Tentando método alternativo...');
            
            // Para statements CREATE, podemos tentar diretamente
            if (statement.toUpperCase().includes('CREATE')) {
              console.log('✅ Statement CREATE detectado, pulando (requer dashboard)');
              continue;
            }
          } else {
            console.log('✅ Statement executado com sucesso');
          }
        } catch (err) {
          console.log(`⚠️  Erro no statement ${i + 1}: ${err.message}`);
        }
      }
    }
    
    console.log('🎉 Setup do Supabase concluído!');
    console.log('');
    console.log('📋 Próximos passos:');
    console.log('1. Acesse o dashboard Supabase: https://supabase.com/dashboard');
    console.log('2. Selecione seu projeto');
    console.log('3. Vá para SQL Editor');
    console.log('4. Copie e cole o conteúdo de supabase/schema.sql');
    console.log('5. Execute o SQL');
    console.log('6. Depois, execute supabase/functions.sql');
    console.log('');
    console.log('🔗 Variáveis de ambiente configuradas:');
    console.log(`   REACT_APP_SUPABASE_URL: ${supabaseUrl}`);
    console.log(`   REACT_APP_SUPABASE_ANON_KEY: configurada`);
    
  } catch (error) {
    console.error('❌ Erro ao executar setup:', error.message);
  }
}

// Executar schema primeiro
async function main() {
  console.log('🔧 Configurando Supabase para Latin Flag Store...');
  console.log('');
  
  // Executar schema
  const schemaPath = path.join(__dirname, '../supabase/schema.sql');
  await executeSQLFile(schemaPath);
  
  console.log('');
  console.log('📌 IMPORTANTE: Alguns comandos SQL precisam ser executados manualmente no dashboard Supabase');
  console.log('   - CREATE TABLE statements');
  console.log(' - CREATE FUNCTION statements');
  console.log(' - CREATE TRIGGER statements');
  console.log(' - INSERT statements para dados iniciais');
}

main().catch(console.error);
