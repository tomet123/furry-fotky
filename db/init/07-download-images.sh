#!/bin/bash
set -e

# Tento skript stáhne obrázky z Picsum Photos a importuje je do PostgreSQL databáze
echo "Spouštím inicializaci obrázků..."

# Vytvoření dočasného adresáře
TEMP_DIR="/tmp/photo_import"
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

# Funkce pro stažení obrázku, konverzi do base64 a vložení do PostgreSQL
download_and_import() {
  local photo_id=$1
  local size=$2
  local is_thumbnail=$3
  local width
  local height
  local file_name
  local table_name
  local column_name
  
  if [ "$is_thumbnail" = true ]; then
    width=800
    height=600
    file_name="thumb_${photo_id}.jpg"
    table_name="storage.photo_thumbnails"
    column_name="thumbnail_data"
  else
    width=800
    height=600
    file_name="image_${photo_id}.jpg"
    table_name="storage.photo_files"
    column_name="file_data"
  fi
  
  echo "Stahuji ${file_name} z externího zdroje..."
  
  # Použijeme správnou URL na picsum.photos, která provede přesměrování na skutečný obrazek
  curl -L -s "https://picsum.photos/id/${photo_id}/${width}/${height}" -o "$file_name"
  
  if [ -f "$file_name" ]; then
    # Kontrola, zda se obrázek správně stáhl
    local file_size=$(stat -c%s "$file_name")
    if [ "$file_size" -gt 1000 ]; then
      echo "Obrázek ${file_name} stažen úspěšně (${file_size} bajtů)"
      
      # Import do PostgreSQL
      echo "Importuji ${file_name} do PostgreSQL..."
      PGPASSWORD=${POSTGRES_PASSWORD} psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "DELETE FROM ${table_name} WHERE photo_id = ${photo_id};"
      
      # Použijeme base64 pro vložení binárních dat
      ENCODED_IMAGE=$(base64 -w 0 "$file_name")
      PGPASSWORD=${POSTGRES_PASSWORD} psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "INSERT INTO ${table_name} (photo_id, ${column_name}, content_type) VALUES (${photo_id}, decode('${ENCODED_IMAGE}', 'base64'), 'image/jpeg');"
      
      echo "Import ${file_name} dokončen."
    else
      echo "Varování: Obrázek ${file_name} je příliš malý nebo poškozený!"
    fi
  else
    echo "Chyba: Obrázek ${file_name} se nepodařilo stáhnout!"
  fi
}

# Stáhni a importuj originální obrázky a thumbnaily pro každé photo_id
for photo_id in {1..10}; do
  download_and_import "$photo_id" "original" false
  sleep 1  # Krátká pauza mezi požadavky
  download_and_import "$photo_id" "thumbnail" true
  sleep 1  # Krátká pauza mezi požadavky
done

# Vyčištění
echo "Odstraňuji dočasné soubory..."
cd /
rm -rf "$TEMP_DIR"

echo "Inicializace obrázků dokončena!" 