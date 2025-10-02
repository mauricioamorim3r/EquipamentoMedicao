import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configuração para produção com SSL
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(poolConfig);
export const db = drizzle(pool, { schema });

// Log da configuração (sem mostrar credenciais)
console.log(`🗄️ Database configured for ${process.env.NODE_ENV || 'development'} mode`);
if (process.env.NODE_ENV === 'production') {
  console.log('🔒 SSL connection enabled for production');
}