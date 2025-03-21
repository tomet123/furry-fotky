-- Komplexní View pro zobrazení detailů fotografií
CREATE VIEW photo_details AS
SELECT 
  p.id,
  p.date,
  p.likes,
  e.name AS event,
  ph.name AS photographer,
  '/rpc/photo_file?p_id=' || p.id AS image_url,
  '/rpc/photo_file?p_id=' || p.id || '&p_thumbnail=true' AS thumbnail_url,
  array_agg(t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
FROM photos p
LEFT JOIN events e ON p.event_id = e.id
LEFT JOIN photographers ph ON p.photographer_id = ph.id
LEFT JOIN photo_tags pt ON p.id = pt.photo_id
LEFT JOIN tags t ON pt.tag_id = t.id
GROUP BY p.id, e.name, ph.name;

-- Definice domén pro typy obsahu
CREATE DOMAIN "image/jpeg" AS bytea;
CREATE DOMAIN "image/png" AS bytea;
CREATE DOMAIN "application/octet-stream" AS bytea;
CREATE DOMAIN "*/*" AS bytea;

-- Funkce pro získání obrázku s hlavičkami a cache kontrolou
CREATE OR REPLACE FUNCTION photo_file(p_id INTEGER, p_thumbnail BOOLEAN DEFAULT FALSE) 
RETURNS "*/*" 
LANGUAGE plpgsql
AS $$
DECLARE
  image_data bytea;
  content_type text;
  filename text;
BEGIN
  IF p_thumbnail THEN
    SELECT t.thumbnail_data, t.content_type 
    INTO image_data, content_type
    FROM storage.photo_thumbnails t
    WHERE t.photo_id = p_id
    LIMIT 1;
    filename := 'thumbnail_' || p_id || '.jpg';
  ELSE
    SELECT f.file_data, f.content_type 
    INTO image_data, content_type
    FROM storage.photo_files f
    WHERE f.photo_id = p_id
    LIMIT 1;
    filename := 'image_' || p_id || '.jpg';
  END IF;
  
  IF image_data IS NULL THEN
    RAISE SQLSTATE 'PT404' USING
      message = 'NOT FOUND',
      detail = 'Image not found',
      hint = format('ID %s seems to be invalid or image does not exist', p_id);
  END IF;
  
  -- Nastavení HTTP hlaviček
  PERFORM set_config('response.headers', 
                  format('[{"Content-Type": "%s"}, 
                         {"Content-Disposition": "inline; filename=\"%s\""}, 
                         {"Cache-Control": "max-age=86400"}]',
                         content_type, filename),
                  true);
  
  RETURN image_data;
END;
$$;

-- Funkce pro získání obrázku (originální nebo thumbnail)
CREATE OR REPLACE FUNCTION get_photo_image(p_photo_id INTEGER, p_is_thumbnail BOOLEAN DEFAULT FALSE)
RETURNS TABLE (
  content_type TEXT,
  file_data BYTEA
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_is_thumbnail THEN
    RETURN QUERY 
      SELECT t.content_type, t.thumbnail_data
      FROM storage.photo_thumbnails t
      WHERE t.photo_id = p_photo_id
      LIMIT 1;
  ELSE
    RETURN QUERY 
      SELECT f.content_type, f.file_data
      FROM storage.photo_files f
      WHERE f.photo_id = p_photo_id
      LIMIT 1;
  END IF;
END;
$$;

-- Nová zjednodušená funkce pro získání fotografií
CREATE OR REPLACE FUNCTION simple_get_photo(
    photo_id INTEGER,
    is_thumbnail BOOLEAN DEFAULT FALSE
) RETURNS BYTEA AS $$
DECLARE
    result BYTEA;
BEGIN
    IF is_thumbnail THEN
        SELECT thumbnail_data INTO result
        FROM storage.photo_thumbnails
        WHERE photo_id = $1
        LIMIT 1;
    ELSE
        SELECT file_data INTO result
        FROM storage.photo_files
        WHERE photo_id = $1
        LIMIT 1;
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Funkce pro získání binárního obsahu fotografie
CREATE OR REPLACE FUNCTION photo_binary(id INTEGER, thumbnail BOOLEAN DEFAULT FALSE)
RETURNS BYTEA
LANGUAGE plpgsql
AS $$
DECLARE
  image_data BYTEA;
BEGIN
  IF thumbnail THEN
    SELECT t.thumbnail_data INTO image_data
    FROM storage.photo_thumbnails t
    WHERE t.photo_id = id
    LIMIT 1;
  ELSE
    SELECT f.file_data INTO image_data
    FROM storage.photo_files f
    WHERE f.photo_id = id
    LIMIT 1;
  END IF;
  
  RETURN image_data;
END;
$$;

-- Funkce pro získání content type fotografie
CREATE OR REPLACE FUNCTION photo_content_type(id INTEGER, thumbnail BOOLEAN DEFAULT FALSE)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  content TEXT;
BEGIN
  IF thumbnail THEN
    SELECT t.content_type INTO content
    FROM storage.photo_thumbnails t
    WHERE t.photo_id = id
    LIMIT 1;
  ELSE
    SELECT f.content_type INTO content
    FROM storage.photo_files f
    WHERE f.photo_id = id
    LIMIT 1;
  END IF;
  
  RETURN content;
END;
$$;

-- Funkce pro HTTP odpověď s obrázkem
CREATE OR REPLACE FUNCTION get_photo(photo_id INTEGER, is_thumbnail BOOLEAN DEFAULT FALSE) 
RETURNS bytea 
LANGUAGE plpgsql
AS $$
DECLARE
  img_data bytea;
  content_type text;
BEGIN
  IF is_thumbnail THEN
    SELECT t.thumbnail_data, t.content_type 
    INTO img_data, content_type
    FROM storage.photo_thumbnails t
    WHERE t.photo_id = photo_id
    LIMIT 1;
  ELSE
    SELECT f.file_data, f.content_type 
    INTO img_data, content_type
    FROM storage.photo_files f
    WHERE f.photo_id = photo_id
    LIMIT 1;
  END IF;
  
  -- Set response headers using PostgREST custom headers
  PERFORM set_config('response.headers', 
                  '[{"Content-Type": "' || content_type || '"}, ' ||
                  '{"Content-Disposition": "inline; filename=\"photo_' || photo_id || '.jpg\""}]',
                  true);
  
  RETURN img_data;
END;
$$;
