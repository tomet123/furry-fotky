import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema/*.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './sqlite.db',
  },
  // Pro budoucí použití PostgreSQL
  // dialect: 'pg',
  // dbCredentials: {
  //   url: process.env.DATABASE_URL,
  // },
  verbose: true,
  strict: true,
} satisfies Config; 