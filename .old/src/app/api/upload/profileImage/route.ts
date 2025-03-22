import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { JWT_STORAGE_KEY } from '@/lib/constants';

// Maximální velikost souboru (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Povolené typy souborů
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Získání tokenu z cookie
    const token = request.cookies.get(JWT_STORAGE_KEY)?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Nejste přihlášeni' },
        { status: 401 }
      );
    }

    // Získání aktuálního uživatele
    const userResponse = await getUserFromToken(token);
    if (!userResponse.success || !userResponse.user) {
      return NextResponse.json(
        { success: false, message: 'Neplatný token' },
        { status: 401 }
      );
    }

    const user = userResponse.user;
    
    // Kontrola, zda uživatel má fotografa
    if (!user.photographer_id) {
      return NextResponse.json(
        { success: false, message: 'Nemáte profil fotografa' },
        { status: 403 }
      );
    }

    // Zpracování formuláře
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { success: false, message: 'Nebyl nahrán žádný soubor' },
        { status: 400 }
      );
    }

    // Kontrola typu souboru
    if (!ALLOWED_MIME_TYPES.includes(image.type)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Nepodporovaný formát souboru. Povolené formáty jsou: JPEG, PNG, GIF a WebP' 
        },
        { status: 400 }
      );
    }

    // Kontrola velikosti souboru
    if (image.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Soubor je příliš velký. Maximální velikost je 5MB' 
        },
        { status: 400 }
      );
    }

    // Převedení souboru na ArrayBuffer a pak na Buffer
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Kontrola existence tabulky pro profilové obrázky
    try {
      // Nejprve zkontrolujeme, zda tabulka existuje, pokud ne, vytvoříme ji
      await query(`
        CREATE TABLE IF NOT EXISTS storage.profile_images (
          id SERIAL PRIMARY KEY,
          photographer_id INTEGER NOT NULL REFERENCES photographers(id),
          file_data BYTEA NOT NULL,
          content_type TEXT NOT NULL,
          original_name TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
    } catch (error) {
      console.error('Chyba při kontrole/vytváření tabulky profile_images:', error);
      throw new Error('Nepodařilo se připravit úložiště pro obrázky');
    }

    // Uložení souboru do databáze - vložení do tabulky profile_images
    const insertImageResult = await query(
      `INSERT INTO storage.profile_images 
       (photographer_id, file_data, content_type, original_name) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, content_type`,
      [user.photographer_id, buffer as unknown as string, image.type, image.name]
    );

    if (!insertImageResult.rows || insertImageResult.rows.length === 0) {
      throw new Error('Nepodařilo se uložit obrázek do databáze');
    }

    const imageId = insertImageResult.rows[0].id;
    const contentType = insertImageResult.rows[0].content_type;

    // Generujeme URL pro vložení do Markdown editoru
    const imageUrl = `/api/images/${imageId}`;

    return NextResponse.json({
      success: true,
      imageId: imageId,
      imageUrl: imageUrl,
      contentType: contentType,
      message: 'Obrázek byl úspěšně nahrán'
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Při nahrávání obrázku došlo k chybě: ${(error as Error).message}` 
      },
      { status: 500 }
    );
  }
} 