-- Vytvoření pohledů pro optimalizaci dotazů

-- Pohled pro statistiky fotografů - počet fotek, lajků a akcí
CREATE OR REPLACE VIEW photographer_stats AS
SELECT 
  p.id AS photographer_id,
  p.name AS photographer_name,
  p.bio AS photographer_bio,
  a.id AS avatar_id,
  COUNT(ph.id) AS photo_count,
  COALESCE(SUM(ph.likes), 0) AS total_likes,
  COUNT(DISTINCT ph.event_id) AS event_count
FROM 
  photographers p
LEFT JOIN
  storage.avatars a ON p.avatar_id = a.id
LEFT JOIN 
  photos ph ON p.id = ph.photographer_id
GROUP BY 
  p.id, p.name, p.bio, a.id
ORDER BY 
  p.id;

-- Pohled pro statistiky organizátorů - počet uspořádaných akcí
CREATE OR REPLACE VIEW organizer_stats AS
SELECT
  o.id AS organizer_id,
  o.name AS organizer_name,
  o.description AS organizer_description,
  a.id AS avatar_id,
  COUNT(e.id) AS event_count,
  COUNT(CASE WHEN e.date >= CURRENT_DATE THEN 1 END) AS upcoming_event_count
FROM
  organizers o
LEFT JOIN
  storage.avatars a ON o.avatar_id = a.id
LEFT JOIN
  events e ON e.organizer_id = o.id
GROUP BY
  o.id, o.name, o.description, a.id
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
    WHEN u.photographer_id IS NOT NULL AND u.organizer_id IS NOT NULL THEN 'photographer_organizer'
    WHEN u.photographer_id IS NOT NULL THEN 'photographer'
    WHEN u.organizer_id IS NOT NULL THEN 'organizer'
    ELSE 'user'
  END AS role,
  COALESCE(p.name, o.name, u.username) AS display_name,
  COALESCE(u.avatar_id, p.avatar_id, o.avatar_id) AS avatar_id,
  COALESCE(p.bio, o.description, NULL) AS bio,
  u.photographer_id,
  u.organizer_id,
  ps.photo_count,
  ps.total_likes,
  ps.event_count AS photographed_event_count,
  os.event_count AS organized_event_count,
  os.upcoming_event_count,
  u.created_at
FROM
  users u
LEFT JOIN
  photographers p ON u.photographer_id = p.id
LEFT JOIN
  organizers o ON u.organizer_id = o.id
LEFT JOIN
  photographer_stats ps ON u.photographer_id = ps.photographer_id
LEFT JOIN
  organizer_stats os ON u.organizer_id = os.organizer_id;

-- Přidáme index na photographer_id ve fotografiích pro rychlejší dotazy
CREATE INDEX IF NOT EXISTS idx_photos_photographer_id ON photos(photographer_id);
CREATE INDEX IF NOT EXISTS idx_photos_event_id ON photos(event_id);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_users_avatar_id ON users(avatar_id);
CREATE INDEX IF NOT EXISTS idx_photographers_avatar_id ON photographers(avatar_id);
CREATE INDEX IF NOT EXISTS idx_organizers_avatar_id ON organizers(avatar_id); 