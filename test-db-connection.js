// Teste de conexão com o banco Render/Neon
import pg from 'pg';
const { Client } = pg;

const DATABASE_URL = "postgresql://sgm_user:7NQ9lj8B2JZeikYGT7DyLGlFNSBDM12d@dpg-d3eh5infte5s73cintpg-a.oregon-postgres.render.com:5432/sgm_production";

async function testConnection() {
  console.log('🔍 Testando conexão com banco...');
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    console.log('📊 Dados do banco:');
    console.log('   Tempo atual:', result.rows[0].current_time);
    console.log('   Versão:', result.rows[0].db_version.split(' ')[0]);
    
    // Testar se existem tabelas
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Tabelas encontradas:', tables.rows.length);
    tables.rows.forEach(row => console.log('   -', row.table_name));
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.error('🔧 Detalhes do erro:', error.code);
    
    if (error.code === 'ENOTFOUND') {
      console.log('🌐 Problema DNS - host não encontrado');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('🚫 Conexão recusada - serviço indisponível');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('⏰ Timeout - conexão muito lenta');
    }
  } finally {
    await client.end();
  }
}

testConnection();