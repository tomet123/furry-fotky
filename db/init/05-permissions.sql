-- Nastavení základních oprávnění pro databázi
-- Nyní je používáme pouze pro uživatele Next.js aplikace (app_user)

-- Oprávnění pro čtení dat z public schéma
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_user;

-- Oprávnění pro manipulaci s uživatelskými daty
GRANT INSERT, UPDATE, DELETE ON users TO app_user;

-- Oprávnění pro používání sekvencí pro generování ID
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Oprávnění pro čtení dat ze storage schéma
GRANT SELECT ON ALL TABLES IN SCHEMA storage TO app_user;

-- Oprávnění pro spouštění funkcí
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user;

-- Oprávnění pro budoucí tabulky a funkce
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT ON TABLES TO app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA storage
GRANT SELECT ON TABLES TO app_user; 