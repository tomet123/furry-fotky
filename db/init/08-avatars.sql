-- Tento soubor již není potřeba, protože změny byly integrovány do 02-tables.sql
-- Ponecháváme ho zde pouze pro dokumentaci změn

-- Vytvoření tabulky pro ukládání avatarů bylo přesunuto do 02-tables.sql
-- CREATE TABLE storage.avatars (
--   id SERIAL PRIMARY KEY,
--   file_data BYTEA NOT NULL,
--   content_type TEXT NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Přidání sloupců avatar_id do tabulek bylo přesunuto do 02-tables.sql
-- ALTER TABLE users ADD COLUMN avatar_id INTEGER REFERENCES storage.avatars(id) ON DELETE SET NULL;
-- ALTER TABLE photographers ADD COLUMN avatar_id INTEGER REFERENCES storage.avatars(id) ON DELETE SET NULL;
-- ALTER TABLE organizers ADD COLUMN avatar_id INTEGER REFERENCES storage.avatars(id) ON DELETE SET NULL;
