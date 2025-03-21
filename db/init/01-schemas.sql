-- Definice schémat
CREATE SCHEMA storage;  -- Pro ukládání binárních dat fotografií

-- Vytvoření rolí
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'mysecretpassword';
GRANT anon TO authenticator;

-- Nastavení výchozího schématu pro vyhledávání
ALTER ROLE anon SET search_path TO public, storage;
ALTER ROLE authenticator SET search_path TO public, storage; 