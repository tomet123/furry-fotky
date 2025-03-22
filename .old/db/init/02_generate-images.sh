#!/bin/bash
set -e

# Tento skript stáhne obrázky z Picsum Photos a importuje je do PostgreSQL databáze
# podle nové struktury tabulek pro projekt furry-fotky
echo "Spouštím inicializaci obrázků..."

# Vytvoření dočasného adresáře
TEMP_DIR="/tmp/photo_import"
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

# Funkce pro stažení obrázku, konverzi do base64 a vložení do PostgreSQL
download_and_import() {
  local photo_id=$1
  local width_original=800
  local height_original=600
  local width_thumbnail=400
  local height_thumbnail=300
  local file_name="image_${photo_id}.jpg"
  local thumb_name="thumb_${photo_id}.jpg"
  
  echo "Stahuji originál ${file_name} z externího zdroje..."
  
  # Použijeme picsum.photos pro stažení originálního obrázku
  curl -L -s "https://picsum.photos/id/${photo_id}/${width_original}/${height_original}" -o "$file_name"
  
  if [ ! -f "$file_name" ]; then
    echo "Chyba: Originální obrázek ${file_name} se nepodařilo stáhnout!"
    return 1
  fi
  
  # Kontrola velikosti originálního souboru
  local file_size=$(stat -c%s "$file_name")
  if [ "$file_size" -lt 1000 ]; then
    echo "Varování: Originální obrázek ${file_name} je příliš malý nebo poškozený!"
    return 1
  fi
  
  echo "Originální obrázek ${file_name} stažen úspěšně (${file_size} bajtů)"
  
  # Stáhneme miniaturu
  echo "Stahuji miniaturu ${thumb_name} z externího zdroje..."
  curl -L -s "https://picsum.photos/id/${photo_id}/${width_thumbnail}/${height_thumbnail}" -o "$thumb_name"
  
  if [ ! -f "$thumb_name" ]; then
    echo "Chyba: Miniatura ${thumb_name} se nepodařilo stáhnout!"
    return 1
  fi
  
  # Kontrola velikosti miniatury
  local thumb_size=$(stat -c%s "$thumb_name")
  if [ "$thumb_size" -lt 1000 ]; then
    echo "Varování: Miniatura ${thumb_name} je příliš malá nebo poškozená!"
    return 1
  fi
  
  echo "Miniatura ${thumb_name} stažena úspěšně (${thumb_size} bajtů)"
  
  # Import do PostgreSQL - vložíme originál i miniaturu najednou do storage_photos
  echo "Importuji obrázky do PostgreSQL..."
  
  # Převedeme obrázky na base64
  ENCODED_IMAGE=$(base64 -w 0 "$file_name")
  ENCODED_THUMBNAIL=$(base64 -w 0 "$thumb_name")
  
  # Zkontrolujeme, zda záznam existuje
  RECORD_EXISTS=$(PGPASSWORD=${POSTGRES_PASSWORD} psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -t -c "SELECT 1 FROM storage_photos WHERE id = ${photo_id}")
  
  if [ -n "$RECORD_EXISTS" ]; then
    # Aktualizace existujícího záznamu (UPDATE)
    echo "Aktualizuji existující obrázek s ID ${photo_id}..."
    PGPASSWORD=${POSTGRES_PASSWORD} psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "
      UPDATE storage_photos SET
        file_data = decode('${ENCODED_IMAGE}', 'base64'),
        thumbnail_data = decode('${ENCODED_THUMBNAIL}', 'base64'),
        content_type = 'image/jpeg',
        original_name = 'photo${photo_id}.jpg'
      WHERE id = ${photo_id}
    "
  else
    # Vložení nového záznamu (INSERT)
    echo "Vkládám nový obrázek s ID ${photo_id}..."
    PGPASSWORD=${POSTGRES_PASSWORD} psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "
      INSERT INTO storage_photos (
        id, file_data, thumbnail_data, content_type, original_name
      ) VALUES (
        ${photo_id}, 
        decode('${ENCODED_IMAGE}', 'base64'),
        decode('${ENCODED_THUMBNAIL}', 'base64'),
        'image/jpeg',
        'photo${photo_id}.jpg'
      )"
  fi
  
  echo "Import obrázků pro ID ${photo_id} dokončen."
}

# Stáhneme a importujeme pouze 5 obrázků pro efektivitu
echo "Stahuji pouze 5 skutečných obrázků (ID 1-5)..."
for photo_id in {1..5}; do
  download_and_import "$photo_id" || echo "Přeskakuji ID ${photo_id} z důvodu chyby."
  sleep 1  # Krátká pauza mezi požadavky, abychom nezahltili API
done

# Nyní vytvoříme zbývající záznamy (6-60) mapující na existující obrázky
echo "Vytvářím dodatečné záznamy (ID 6-60) mapující na existující obrázky..."
for photo_id in {6..60}; do
  # Určení zdrojového ID (1-5) cyklicky
  source_id=$(( (photo_id - 1) % 5 + 1 ))
  
  echo "Vytvářím záznam ID ${photo_id} mapující na zdrojový obrázek ID ${source_id}..."
  
  # Zkontrolujeme, zda cílový záznam existuje
  RECORD_EXISTS=$(PGPASSWORD=${POSTGRES_PASSWORD} psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -t -c "SELECT 1 FROM storage_photos WHERE id = ${photo_id}")
  
  # Vytvoříme nový záznam jako kopii existujícího, ale s novým ID - použijeme bezpečnější způsob
  if [ -n "$RECORD_EXISTS" ]; then
    # Aktualizace existujícího záznamu přímo v SQL bez extrakce dat
    PGPASSWORD=${POSTGRES_PASSWORD} psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "
      UPDATE storage_photos SET
        file_data = (SELECT file_data FROM storage_photos WHERE id = ${source_id}),
        thumbnail_data = (SELECT thumbnail_data FROM storage_photos WHERE id = ${source_id}),
        content_type = 'image/jpeg',
        original_name = 'photo${photo_id}.jpg'
      WHERE id = ${photo_id}
    "
  else
    # Vložení nového záznamu přímo v SQL bez extrakce dat
    PGPASSWORD=${POSTGRES_PASSWORD} psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "
      INSERT INTO storage_photos (
        id, file_data, thumbnail_data, content_type, original_name
      ) 
      SELECT 
        ${photo_id},
        file_data,
        thumbnail_data,
        'image/jpeg',
        'photo${photo_id}.jpg'
      FROM storage_photos 
      WHERE id = ${source_id}
    "
  fi
  
  echo "Záznam ID ${photo_id} vytvořen."
done

# Aktualizace sekvence v PostgreSQL po přímém vložení s ID
PGPASSWORD=${POSTGRES_PASSWORD} psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "
  SELECT setval('storage_photos_id_seq', (SELECT MAX(id) FROM storage_photos), true);"

# Vyčištění
echo "Odstraňuji dočasné soubory..."
cd /
rm -rf "$TEMP_DIR"

echo "Inicializace obrázků dokončena!" 