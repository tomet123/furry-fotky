-- Základní inicializační skript pro databázi furry-fotky
-- Nová verze zahrnující optimalizovanou strukturu tabulek

-- Odstranění existujících tabulek v případě potřeby přepsání schématu
DROP TABLE IF EXISTS "photo_likes" CASCADE;
DROP TABLE IF EXISTS "photo_tags" CASCADE;
DROP TABLE IF EXISTS "photos" CASCADE;
DROP TABLE IF EXISTS "storage_photos" CASCADE;
DROP TABLE IF EXISTS "tags" CASCADE;
DROP TABLE IF EXISTS "events" CASCADE;
DROP TABLE IF EXISTS "organizers" CASCADE;
DROP TABLE IF EXISTS "photographers" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "storage_profile_pictures" CASCADE;
DROP SCHEMA IF EXISTS "storage" CASCADE;

-- Definice schémat
CREATE SCHEMA storage;  -- Pro ukládání binárních dat fotografií


-- Uživatelé
CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(255) NOT NULL UNIQUE,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password_hash" VARCHAR(255) NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT FALSE,
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE "users" IS 'Uživatelé aplikace';

-- Úložiště profilových obrázků
CREATE TABLE "storage_profile_pictures" (
    "id" SERIAL PRIMARY KEY,
    "file_data" BYTEA NOT NULL,
    "thumbnail_data" BYTEA NOT NULL,
    "content_type" VARCHAR(100) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "user_id" INTEGER REFERENCES "users" ("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE "storage_profile_pictures" IS 'Úložiště pro profilové obrázky uživatelů';
COMMENT ON COLUMN "storage_profile_pictures"."user_id" IS 'Vazba one-to-many (1:N): Jeden uživatel může mít více profilových obrázků, nejnovější se používá jako aktuální';


-- Fotografové
CREATE TABLE "photographers" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL UNIQUE REFERENCES "users" ("id") ON DELETE CASCADE, -- Vazba one-to-one (1:1): Jeden uživatel je jeden fotograf
    "bio" VARCHAR(64),
    "description" TEXT,
    "is_beginner" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE "photographers" IS 'Fotografové - uživatelé specializovaní na fotografování';
COMMENT ON COLUMN "photographers"."user_id" IS 'Vazba one-to-one (1:1): Jeden uživatel může být maximálně jedním fotografem';

-- Organizátoři
CREATE TABLE "organizers" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL UNIQUE REFERENCES "users" ("id") ON DELETE CASCADE, -- Vazba one-to-one (1:1): Jeden uživatel je jeden organizátor
    "bio" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE "organizers" IS 'Organizátoři akcí - uživatelé specializovaní na organizaci událostí';
COMMENT ON COLUMN "organizers"."user_id" IS 'Vazba one-to-one (1:1): Jeden uživatel může být maximálně jedním organizátorem';

-- Události
CREATE TABLE "events" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "organizer_id" INTEGER NOT NULL REFERENCES "organizers" ("id") ON DELETE RESTRICT, -- Vazba one-to-many (1:N): Jeden organizátor může mít více událostí
    "description" TEXT,
    "location" VARCHAR(255) NOT NULL,
    "date" DATE NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE "events" IS 'Události a akce pořádané organizátory';
COMMENT ON COLUMN "events"."organizer_id" IS 'Vazba one-to-many (1:N): Jeden organizátor může organizovat více událostí';

-- Tagy
CREATE TABLE "tags" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE "tags" IS 'Tagy pro kategorizaci fotografií';

-- Úložiště fotografií
CREATE TABLE "storage_photos" (
    "id" SERIAL PRIMARY KEY,
    "file_data" BYTEA NOT NULL,
    "thumbnail_data" BYTEA NOT NULL,
    "content_type" VARCHAR(100) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE "storage_photos" IS 'Úložiště binárních dat fotografií a jejich miniatur';

-- Fotografie
CREATE TABLE "photos" (
    "id" SERIAL PRIMARY KEY,
    "photographer_id" INTEGER NOT NULL REFERENCES "photographers" ("id") ON DELETE CASCADE, -- Vazba one-to-many (1:N): Jeden fotograf může mít více fotografií
    "event_id" INTEGER REFERENCES "events" ("id") ON DELETE SET NULL, -- Vazba one-to-many (1:N): Jedna událost může mít více fotografií
    "storage_id" INTEGER NOT NULL REFERENCES "storage_photos" ("id") ON DELETE RESTRICT, -- Vazba one-to-one (1:1): Jedna fotografie má jedno úložiště
    "likes" INTEGER NOT NULL DEFAULT 0,
    "date" DATE NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "check_likes_positive" CHECK (likes >= 0)
);
COMMENT ON TABLE "photos" IS 'Fotografie nahrané fotografy, případně přiřazené k událostem';
COMMENT ON COLUMN "photos"."photographer_id" IS 'Vazba one-to-many (1:N): Jeden fotograf může nahrát více fotografií';
COMMENT ON COLUMN "photos"."event_id" IS 'Vazba one-to-many (1:N): Jedna událost může mít více fotografií';
COMMENT ON COLUMN "photos"."storage_id" IS 'Vazba one-to-one (1:1): Jedna fotografie má právě jedno úložiště dat';

-- Propojení fotografií a tagů (m:n vztah)
CREATE TABLE "photo_tags" (
    "photo_id" INTEGER NOT NULL REFERENCES "photos" ("id") ON DELETE CASCADE, -- Vazba many-to-many (M:N): Jedna fotografie může mít více tagů
    "tag_id" INTEGER NOT NULL REFERENCES "tags" ("id") ON DELETE CASCADE, -- Vazba many-to-many (M:N): Jeden tag může být přiřazen k více fotografiím
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("photo_id", "tag_id")
);
COMMENT ON TABLE "photo_tags" IS 'Spojovací tabulka pro many-to-many (M:N) vztah mezi fotografiemi a tagy';

-- Lajky fotografií
CREATE TABLE "photo_likes" (
    "user_id" INTEGER NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE, -- Vazba many-to-many (M:N): Jeden uživatel může lajkovat více fotografií
    "photo_id" INTEGER NOT NULL REFERENCES "photos" ("id") ON DELETE CASCADE, -- Vazba many-to-many (M:N): Jednu fotografii může lajkovat více uživatelů
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("user_id", "photo_id")
);
COMMENT ON TABLE "photo_likes" IS 'Spojovací tabulka pro many-to-many (M:N) vztah mezi uživateli a lajkovanými fotografiemi';

-- Vytvoření pohledů pro optimalizaci dotazů

-- Pohled pro profilové obrázky - vybere nejnovější profilový obrázek každého uživatele
CREATE OR REPLACE VIEW latest_profile_pictures AS
SELECT DISTINCT ON (user_id)
  id AS profile_picture_id,
  user_id
FROM
  storage_profile_pictures
ORDER BY
  user_id, created_at DESC;

-- Pohled pro statistiky fotografů - počet fotek, lajků a akcí
CREATE OR REPLACE VIEW photographer_stats AS
SELECT 
  p.id AS photographer_id,
  u.username AS photographer_name,
  p.bio AS photographer_bio,
  pp.profile_picture_id,
  COUNT(ph.id) AS photo_count,
  COALESCE(SUM(ph.likes), 0) AS total_likes,
  COUNT(DISTINCT ph.event_id) AS event_count
FROM 
  photographers p
JOIN
  users u ON p.user_id = u.id
LEFT JOIN
  latest_profile_pictures pp ON u.id = pp.user_id
LEFT JOIN 
  photos ph ON p.id = ph.photographer_id
GROUP BY 
  p.id, u.username, p.bio, pp.profile_picture_id
ORDER BY 
  p.id;

-- Pohled pro statistiky organizátorů - počet uspořádaných akcí
CREATE OR REPLACE VIEW organizer_stats AS
SELECT
  o.id AS organizer_id,
  u.username AS organizer_name,
  o.bio AS organizer_description,
  pp.profile_picture_id,
  COUNT(e.id) AS event_count,
  COUNT(CASE WHEN e.date >= CURRENT_DATE THEN 1 END) AS upcoming_event_count
FROM
  organizers o
JOIN
  users u ON o.user_id = u.id
LEFT JOIN
  latest_profile_pictures pp ON u.id = pp.user_id
LEFT JOIN
  events e ON e.organizer_id = o.id
GROUP BY
  o.id, u.username, o.bio, pp.profile_picture_id
ORDER BY
  o.id;

-- Kompletní pohled na uživatelské profily s rolemi
CREATE OR REPLACE VIEW user_profiles AS
SELECT
  u.id,
  u.username,
  u.email,
  u.is_active,
  CASE
    WHEN p.id IS NOT NULL AND o.id IS NOT NULL THEN 'photographer_organizer'
    WHEN p.id IS NOT NULL THEN 'photographer'
    WHEN o.id IS NOT NULL THEN 'organizer'
    ELSE 'user'
  END AS role,
  pp.profile_picture_id,
  CASE 
    WHEN p.id IS NOT NULL THEN COALESCE(p.bio, '')
    WHEN o.id IS NOT NULL THEN COALESCE(o.bio, '')
    ELSE ''
  END AS bio,
  CASE
    WHEN p.id IS NOT NULL THEN p.description
    ELSE NULL
  END AS description,
  p.id AS photographer_id,
  o.id AS organizer_id,
  COALESCE(ps.photo_count, 0) AS photo_count,
  COALESCE(ps.total_likes, 0) AS total_likes,
  COALESCE(ps.event_count, 0) AS photographed_event_count,
  COALESCE(os.event_count, 0) AS organized_event_count,
  COALESCE(os.upcoming_event_count, 0) AS upcoming_event_count,
  u.created_at
FROM
  users u
LEFT JOIN
  photographers p ON u.id = p.user_id
LEFT JOIN
  organizers o ON u.id = o.user_id
LEFT JOIN
  latest_profile_pictures pp ON u.id = pp.user_id
LEFT JOIN
  photographer_stats ps ON p.id = ps.photographer_id
LEFT JOIN
  organizer_stats os ON o.id = os.organizer_id;

-- Indexy pro zlepšení výkonu
CREATE INDEX "idx_photos_photographer" ON "photos" ("photographer_id");
CREATE INDEX "idx_photos_event" ON "photos" ("event_id");
CREATE INDEX "idx_photos_date" ON "photos" ("date");
CREATE INDEX "idx_events_date" ON "events" ("date");
CREATE INDEX "idx_photographers_user" ON "photographers" ("user_id");
CREATE INDEX "idx_organizers_user" ON "organizers" ("user_id"); 