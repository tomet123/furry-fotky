-- Vytvoření tabulek v public schématu
CREATE TABLE photographers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  is_beginner BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE organizers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  contact_email TEXT,
  website TEXT,
  is_beginner BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
); 


CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  date DATE,
  organizer_id INTEGER REFERENCES organizers(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE SET NULL,
  photographer_id INTEGER REFERENCES photographers(id) ON DELETE SET NULL,
  likes INTEGER DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE photo_tags (
  photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (photo_id, tag_id)
);



-- Vytvoření tabulek pro ukládání obrazových dat v storage schématu
CREATE TABLE storage.avatars (
  id SERIAL PRIMARY KEY,
  file_data BYTEA NOT NULL,
  content_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE storage.photo_files (
  id SERIAL PRIMARY KEY,
  photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE,
  file_data BYTEA NOT NULL,
  content_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE storage.photo_thumbnails (
  id SERIAL PRIMARY KEY,
  photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE,
  thumbnail_data BYTEA NOT NULL,
  content_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Přidání tabulky pro uživatele (nahrazuje autentizaci z PostgREST)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  photographer_id INTEGER REFERENCES photographers(id) ON DELETE SET NULL,
  organizer_id INTEGER REFERENCES organizers(id) ON DELETE SET NULL,
  avatar_id INTEGER REFERENCES storage.avatars(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role TEXT DEFAULT 'user'
);

-- Přidání odkazu na avatar do tabulek fotografů a organizátorů
ALTER TABLE photographers ADD COLUMN avatar_id INTEGER REFERENCES storage.avatars(id) ON DELETE SET NULL;
ALTER TABLE organizers ADD COLUMN avatar_id INTEGER REFERENCES storage.avatars(id) ON DELETE SET NULL;