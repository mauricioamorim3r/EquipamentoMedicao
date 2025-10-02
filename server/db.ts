import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configuração SSL para produção (Render) e desenvolvimento (Neon)
const isProduction = process.env.NODE_ENV === 'production';
const isRender = process.env.RENDER === 'true' || process.env.DATABASE_URL?.includes('render');

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: (isProduction || isRender) ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(poolConfig);
export const db = drizzle(pool, { schema });

// Log de configuração
console.log(`🗄️ Database configured for ${process.env.NODE_ENV || 'development'} mode`);
if (poolConfig.ssl) {
  console.log('🔒 SSL connection enabled');
}