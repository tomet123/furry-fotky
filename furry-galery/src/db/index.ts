import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { createId } from './utils';

// Import dotazovacích modulů
import { eq, and, or, not, like } from 'drizzle-orm';

// Inicializace SQLite databáze
const sqlite = new Database('./sqlite.db');

// Vytvoření drizzle klienta
export const db = drizzle(sqlite, { schema });

// Export pomocných funkcí
export { createId, eq, and, or, not, like };

// Export schémat
export * from './schema'; 