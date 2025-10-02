#!/usr/bin/env node
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from "../shared/schema.js";

const isProduction = process.env.NODE_ENV === 'production';

console.log('🚀 Initializing database connection...');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

// Configuração SSL para produção
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

console.log(`🔗 Database SSL: ${poolConfig.ssl ? 'enabled' : 'disabled'}`);

const pool = new Pool(poolConfig);
const db = drizzle(pool, { schema });

// Test database connection
async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful');
    console.log(`🕐 Server time: ${result.rows[0].current_time}`);
    
    // Test a simple query
    console.log('🔍 Testing schema query...');
    const count = await db.$count(schema.usuarios);
    console.log(`✅ Schema accessible - Users table exists (${count} records)`);
    
    await pool.end();
    console.log('🎉 Database initialization complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();