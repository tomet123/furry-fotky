import { Pool, QueryResult } from 'pg';

// Konfigurace PostgreSQL připojení
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'app_user',
  password: process.env.POSTGRES_PASSWORD || 'app_password',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5433'),
  database: process.env.POSTGRES_DB || 'furry_fotky',
});

export async function query(text: string, params: (string | number | null)[] = []): Promise<QueryResult> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Error executing query', { text, error });
    throw error;
  }
}

export async function getClient() {
  const client = await pool.connect();
  return client;
}

// Funkce pro testování připojení k databázi
export async function testConnection() {
  try {
    const result = await query('SELECT NOW()');
    return { connected: true, timestamp: result.rows[0].now };
  } catch (error) {
    console.error('Database connection test failed', error);
    return { connected: false, error };
  }
}

const dbClient = {
  query,
  getClient,
  testConnection
};

export default dbClient; 