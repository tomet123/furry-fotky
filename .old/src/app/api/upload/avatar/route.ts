import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { query } from '@/lib/db';

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
    // Kontrola autentizace - získání tokenu z Authorization hlavičky
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Nejste přihlášeni' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Odstranění "Bearer " z hlavičky
    
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
    
    // Zkontrolujeme, zda je specifikováno ID uživatele a zda se jedná o vlastní profil
    const url = new URL(request.url);
    const userIdParam = url.searchParams.get('userId');
    
    if (userIdParam) {
      const userId = parseInt(userIdParam);
      // Pokud je specifikováno ID uživatele a nejedná se o vlastní profil, vrátíme chybu
      if (!isNaN(userId) && userId !== user.id) {
        return NextResponse.json(
          { success: false, message: 'Nemáte oprávnění upravovat avatar jiného uživatele' },
          { status: 403 }
        );
      }
    }

    // Zpracování formuláře
    const formData = await request.formData();
    const avatar = formData.get('avatar') as File;

    if (!avatar) {
      return NextResponse.json(
        { success: false, message: 'Nebyl nahrán žádný soubor' },
        { status: 400 }
      );
    }

    // Kontrola typu souboru
    if (!ALLOWED_MIME_TYPES.includes(avatar.type)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Nepodporovaný formát souboru. Povolené formáty jsou: JPEG, PNG, GIF a WebP' 
        },
        { status: 400 }
      );
    }

    // Kontrola velikosti souboru
    if (avatar.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Soubor je příliš velký. Maximální velikost je 5MB' 
        },
        { status: 400 }
      );
    }

    // Převedení souboru na ArrayBuffer a pak na Buffer
    const arrayBuffer = await avatar.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Uložení souboru do databáze - nejprve vložení do tabulky avatars
    const insertAvatarResult = await query(
      'INSERT INTO storage.avatars (file_data, content_type) VALUES ($1, $2) RETURNING id',
      [buffer, avatar.type]
    );

    if (!insertAvatarResult.rows || insertAvatarResult.rows.length === 0) {
      throw new Error('Nepodařilo se uložit avatar do databáze');
    }

    const avatarId = insertAvatarResult.rows[0].id;

    // Určení, které tabulky aktualizovat na základě rolí uživatele
    const tablesToUpdate = [];
    
    // Aktualizace ID v tabulce users - zajistíme, že uživatel může aktualizovat jen svůj vlastní záznam
    try {
      await query('UPDATE users SET avatar_id = $1 WHERE id = $2', [avatarId, user.id]);
      tablesToUpdate.push('users');
    } catch (error) {
      console.error('Chyba při aktualizaci users:', error);
    }

    // Pokud má uživatel profil fotografa, aktualizujeme i tam - pouze pokud patří přihlášenému uživateli
    if (user.photographer_id) {
      try {
        await query('UPDATE photographers SET avatar_id = $1 WHERE id = $2', [avatarId, user.photographer_id]);
        tablesToUpdate.push('photographers');
      } catch (error) {
        console.error('Chyba při aktualizaci fotografa:', error);
      }
    }

    // Pokud má uživatel profil organizátora, aktualizujeme i tam - pouze pokud patří přihlášenému uživateli
    if (user.organizer_id) {
      try {
        await query('UPDATE organizers SET avatar_id = $1 WHERE id = $2', [avatarId, user.organizer_id]);
        tablesToUpdate.push('organizers');
      } catch (error) {
        console.error('Chyba při aktualizaci organizátora:', error);
      }
    }

    return NextResponse.json({
      success: true,
      avatarId: avatarId,
      message: 'Avatar byl úspěšně nahrán',
      updatedTables: tablesToUpdate
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Při nahrávání avataru došlo k chybě: ${(error as Error).message}` 
      },
      { status: 500 }
    );
  }
} 