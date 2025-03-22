import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { JWT_STORAGE_KEY } from '@/lib/constants';

// GET /api/users/[id] - Získání detailu uživatele
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const userId = params.id;

    // Validace ID
    if (!userId || isNaN(Number(userId))) {
      return NextResponse.json(
        { success: false, message: 'Neplatné ID uživatele' },
        { status: 400 }
      );
    }

    // Dotaz pro získání detailu uživatele
    const result = await query(
      'SELECT * FROM user_profiles WHERE id = $1',
      [userId]
    );

    // Kontrola, zda byl uživatel nalezen
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Uživatel nebyl nalezen' },
        { status: 404 }
      );
    }

    // Získání detailu uživatele
    const user = result.rows[0];

    let additionalData = {};

    // Získání dodatečných dat podle role uživatele
    if (user.photographer_id) {
      // Získání fotek fotografa
      const photosResult = await query(
        `SELECT p.*, e.name as event_name 
         FROM photos p
         LEFT JOIN events e ON p.event_id = e.id
         WHERE p.photographer_id = $1
         ORDER BY p.created_at DESC
         LIMIT 10`,
        [user.photographer_id]
      );
      
      additionalData = {
        ...additionalData,
        recent_photos: photosResult.rows
      };
    }

    if (user.organizer_id) {
      // Získání akcí organizátora
      const eventsResult = await query(
        `SELECT * FROM events 
         WHERE organizer_id = $1
         ORDER BY date DESC
         LIMIT 10`,
        [user.organizer_id]
      );
      
      additionalData = {
        ...additionalData,
        recent_events: eventsResult.rows
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        ...additionalData
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, message: `Při načítání uživatele došlo k chybě: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Aktualizace uživatelského profilu
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const userId = params.id;

    // Validace ID
    if (!userId || isNaN(Number(userId))) {
      return NextResponse.json(
        { success: false, message: 'Neplatné ID uživatele' },
        { status: 400 }
      );
    }

    // Kontrola autentizace
    const authToken = request.cookies.get(JWT_STORAGE_KEY)?.value;
    const authHeader = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    const token = authToken || authHeader;

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

    const currentUser = userResponse.user;

    // Kontrola, zda uživatel má právo upravit tento profil (může upravovat pouze svůj vlastní)
    if (currentUser.id !== parseInt(userId)) {
      return NextResponse.json(
        { success: false, message: 'Nemáte oprávnění upravovat tento profil' },
        { status: 403 }
      );
    }

    // Zpracování dat z požadavku
    const data = await request.json();
    
    // Validace dat
    if (!data.username || !data.email) {
      return NextResponse.json(
        { success: false, message: 'Uživatelské jméno a e-mail jsou povinné údaje' },
        { status: 400 }
      );
    }

    // Kontrola, zda uživatelské jméno již není použito jiným uživatelem
    const existingUserCheck = await query(
      'SELECT id FROM users WHERE username = $1 AND id != $2',
      [data.username, userId]
    );

    if (existingUserCheck.rowCount && existingUserCheck.rowCount > 0) {
      return NextResponse.json(
        { success: false, message: 'Toto uživatelské jméno je již používáno' },
        { status: 400 }
      );
    }

    // Kontrola, zda e-mail již není použit jiným uživatelem
    const existingEmailCheck = await query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [data.email, userId]
    );

    if (existingEmailCheck.rowCount && existingEmailCheck.rowCount > 0) {
      return NextResponse.json(
        { success: false, message: 'Tento e-mail je již používán' },
        { status: 400 }
      );
    }

    // Aktualizace uživatelského profilu
    const result = await query(
      `UPDATE users 
       SET username = $1, email = $2 
       WHERE id = $3 
       RETURNING id, username, email, is_active, photographer_id, organizer_id, avatar_id, role, created_at`,
      [data.username, data.email, userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Uživatel nebyl nalezen nebo nebyl aktualizován' },
        { status: 404 }
      );
    }

    const updatedUser = result.rows[0];

    return NextResponse.json({
      success: true,
      message: 'Uživatelský profil byl úspěšně aktualizován',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Při aktualizaci uživatelského profilu došlo k chybě: ${(error as Error).message}` 
      },
      { status: 500 }
    );
  }
} 