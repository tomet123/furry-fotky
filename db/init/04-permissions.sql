-- Nastavení oprávnění pro PostgREST

-- Oprávnění pro public schéma - pouze SELECT (GET)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;

-- Oprávnění pro storage schéma (pouze pro čtení binárních dat)
GRANT USAGE ON SCHEMA storage TO anon;
GRANT SELECT ON storage.photo_files TO anon;
GRANT SELECT ON storage.photo_thumbnails TO anon;
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA storage FROM anon;

-- Oprávnění pro funkce
GRANT EXECUTE ON FUNCTION photo_file TO anon;

-- Oprávnění pro budoucí tabulky a funkce - nastavení bezpečnosti
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
REVOKE INSERT, UPDATE, DELETE ON TABLES FROM anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA storage
GRANT SELECT ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA storage
REVOKE INSERT, UPDATE, DELETE ON TABLES FROM anon; 