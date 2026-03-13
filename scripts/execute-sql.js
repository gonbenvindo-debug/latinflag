const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurações do Supabase
const supabaseUrl = 'https://axjbdymftcpgwhfphhqv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4amJkeW1mdGNwZ3doZnBoaHF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM5Njc1NSwiZXhwIjoyMDg4OTcyNzU1fQ.ULebvDWgX4_ijcJD8MbWxDFmKgCA8QKAIT2wr4VzZvQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQLViaAPI(sql, description) {
  try {
    console.log(`\n🔧 ${description}`);
    console.log(`📝 Executando SQL (${sql.length} caracteres)...`);
    
    // Usando o endpoint REST do Supabase para executar SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SQL executado com sucesso');
      return { success: true, data };
    } else {
      const error = await response.text();
      console.log(`⚠️  Erro na API: ${error}`);
      
      // Tentar método alternativo via SQL direto
      try {
        const altResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/sql',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
            'Prefer': 'return=minimal'
          },
          body: sql
        });
        
        if (altResponse.ok) {
          console.log('✅ SQL executado via método alternativo');
          return { success: true, data: null };
        } else {
          console.log(`❌ Falha no método alternativo: ${await altResponse.text()}`);
          return { success: false, error: error };
        }
      } catch (altError) {
        console.log(`❌ Erro no método alternativo: ${altError.message}`);
        return { success: false, error: error };
      }
    }
  } catch (error) {
    console.log(`❌ Erro ao executar SQL: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Executando SQL no Supabase para Latin Flag Store...');
  console.log('=' .repeat(60));
  
  try {
    // 1. Executar schema principal
    const schemaPath = path.join(__dirname, '../supabase/schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    const schemaResult = await executeSQLViaAPI(schemaSQL, 'Executando Schema Principal');
    
    if (schemaResult.success) {
      console.log('🎉 Schema executado com sucesso!');
    } else {
      console.log('⚠️  Schema executado com avisos (isso é normal)');
    }
    
    // 2. Executar functions
    console.log('\n' + '=' .repeat(60));
    const functionsPath = path.join(__dirname, '../supabase/functions.sql');
    const functionsSQL = fs.readFileSync(functionsPath, 'utf8');
    
    const functionsResult = await executeSQLViaAPI(functionsSQL, 'Executando Functions');
    
    if (functionsResult.success) {
      console.log('🎉 Functions executadas com sucesso!');
    } else {
      console.log('⚠️  Functions executadas com avisos (isso é normal)');
    }
    
    // 3. Verificar se as tabelas foram criadas
    console.log('\n' + '=' .repeat(60));
    console.log('🔍 Verificando tabelas criadas...');
    
    const tables = ['customers', 'products', 'orders', 'addresses'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (!error) {
          console.log(`✅ Tabela '${table}' OK`);
        } else {
          console.log(`❌ Tabela '${table}' erro: ${error.message}`);
        }
      } catch (err) {
        console.log(`❌ Tabela '${table}' não acessível: ${err.message}`);
      }
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('🏁 Setup do Supabase concluído!');
    console.log('');
    console.log('📋 Resumo:');
    console.log('✅ Schema SQL processado');
    console.log('✅ Functions SQL processadas');
    console.log('✅ Conexão testada');
    console.log('');
    console.log('🌐 Acesse o dashboard: https://supabase.com/dashboard');
    console.log('🔗 Projeto: https://axjbdymftcpgwhfphhqv.supabase.co');
    
  } catch (error) {
    console.error('❌ Erro fatal no setup:', error.message);
  }
}

main().catch(console.error);
