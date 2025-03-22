-- Přidání sloupce 'profile' do tabulky photographers, pokud ještě neexistuje
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'photographers' AND column_name = 'profile'
  ) THEN
    ALTER TABLE photographers ADD COLUMN profile TEXT;
  END IF;
END $$; 