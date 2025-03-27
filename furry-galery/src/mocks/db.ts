import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../db/schema';

// Vytvoření in-memory SQLite databáze pro testování
export const createTestDb = () => {
  const sqlite = new Database(':memory:');
  const db = drizzle(sqlite, { schema });
  
  // Zde můžeme definovat inicializační funkce pro vytvoření tabulek
  const createTables = async () => {
    // Tato část by měla být upravena podle vašich migračních souborů
    // Jednoduchá ukázka vytvoření tabulky uživatelů
    await sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        email_verified DATETIME,
        image TEXT,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Přidání testovacích dat
    await sqlite.exec(`
      INSERT INTO users (id, name, email, role) VALUES 
      ('1', 'Test User', 'test@example.com', 'user'),
      ('2', 'Admin User', 'admin@example.com', 'admin')
    `);
  };

  return {
    db,
    createTables,
    cleanup: () => {
      sqlite.close();
    }
  };
};

// Pro jednoduché testy bez potřeby vytváření instance
export const mockDb = {
  query: jest.fn(),
  select: jest.fn(),
  insert: jest.fn().mockReturnValue({ values: jest.fn() }),
  update: jest.fn().mockReturnValue({ set: jest.fn() }),
  delete: jest.fn(),
}; 