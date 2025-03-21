import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { JWT_STORAGE_KEY } from '@/lib/constants';
import { query } from '@/lib/db';

// Validace dat
interface PhotographerData {
  name: string;
  bio?: string;
}

function validatePhotographerData(data: PhotographerData): { valid: boolean, message?: string } {
  if (!data.name || data.name.trim() === '') {
    return { valid: false, message: 'Jméno fotografa je povinné' };
  }

  return { valid: true };
}

// GET /api/photographers/[id] - Získání detailu fotografa
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const photographerId = params.id;

    // Validace ID
    if (!photographerId || isNaN(Number(photographerId))) {
      return NextResponse.json(
        { success: false, message: 'Neplatné ID fotografa' },
        { status: 400 }
      );
    }

    // Získání detailu fotografa
    const result = await query(
      `SELECT id, name, bio, avatar_url, is_beginner, created_at 
       FROM photographers 
       WHERE id = $1`,
      [photographerId]
    );

    // Kontrola, zda byl fotograf nalezen
    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Fotograf nebyl nalezen' },
        { status: 404 }
      );
    }

    // Získání statistik fotografa
    const statsResult = await query(
      `SELECT COUNT(p.id) as photo_count, 
              COALESCE(SUM(p.likes), 0) as total_likes,
              COUNT(DISTINCT p.event_id) as event_count
       FROM photos p
       WHERE p.photographer_id = $1`,
      [photographerId]
    );

    const photographer = result.rows[0];
    const stats = statsResult.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        ...photographer,
        stats: {
          photo_count: parseInt(stats.photo_count) || 0,
          total_likes: parseInt(stats.total_likes) || 0,
          event_count: parseInt(stats.event_count) || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching photographer:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Při načítání detailu fotografa došlo k chybě: ${(error as Error).message}` 
      },
      { status: 500 }
    );
  }
}

// PUT /api/photographers/[id] - Aktualizace profilu fotografa
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const photographerId = params.id;

    // Validace ID
    if (!photographerId || isNaN(Number(photographerId))) {
      return NextResponse.json(
        { success: false, message: 'Neplatné ID fotografa' },
        { status: 400 }
      );
    }

    // Kontrola autentizace
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

    // Kontrola, zda uživatel má právo upravit tohoto fotografa
    if (user.photographer_id !== parseInt(photographerId)) {
      return NextResponse.json(
        { success: false, message: 'Nemáte oprávnění upravovat tento profil' },
        { status: 403 }
      );
    }

    // Zpracování dat z požadavku
    const data = await request.json();
    
    // Validace dat
    const validation = validatePhotographerData(data);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      );
    }

    // Aktualizace profilu fotografa
    const result = await query(
      `UPDATE photographers 
       SET name = $1, bio = $2 
       WHERE id = $3 
       RETURNING id, name, bio, avatar_url, is_beginner, created_at`,
      [data.name, data.bio || null, photographerId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Fotograf nebyl nalezen' },
        { status: 404 }
      );
    }

    const photographer = result.rows[0];

    return NextResponse.json({
      success: true,
      message: 'Profil fotografa byl úspěšně aktualizován',
      data: photographer
    });
  } catch (error) {
    console.error('Error updating photographer:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Při aktualizaci profilu fotografa došlo k chybě: ${(error as Error).message}` 
      },
      { status: 500 }
    );
  }
} 