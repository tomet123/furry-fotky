import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Tato funkce provede migraci, když je spuštěna přímo
async function main() {
  console.log('🔄 Provádění migrace databáze...');
  // Otevřeme SQLite databázi
  const sqlite = new Database('./sqlite.db');
  const db = drizzle(sqlite, { schema });

  // Provedeme migraci
  await migrate(db, { migrationsFolder: './src/db/migrations' });

  console.log('✅ Migrace dokončena');
  process.exit(0);
}

// Pokud je skript spuštěn přímo (ne importován), proveď migraci
if (require.main === module) {
  main().catch((err) => {
    console.error('❌ Chyba při migraci:', err);
    process.exit(1);
  });
} 