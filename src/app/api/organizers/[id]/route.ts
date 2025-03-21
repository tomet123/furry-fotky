import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { JWT_STORAGE_KEY } from '@/lib/constants';
import { query } from '@/lib/db';

// Validace dat
interface OrganizerData {
  name: string;
  contact_email?: string;
  website?: string;
  description?: string;
}

function validateOrganizerData(data: OrganizerData): { valid: boolean, message?: string } {
  if (!data.name || data.name.trim() === '') {
    return { valid: false, message: 'Název organizátora je povinný' };
  }

  // Validace e-mailu, pokud je zadán
  if (data.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact_email)) {
    return { valid: false, message: 'Neplatný formát e-mailu' };
  }

  // Validace URL webových stránek, pokud jsou zadány
  if (data.website && !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(data.website)) {
    return { valid: false, message: 'Neplatný formát URL' };
  }

  return { valid: true };
}

// GET /api/organizers/[id] - Získání detailu organizátora
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const organizerId = params.id;

    // Validace ID
    if (!organizerId || isNaN(Number(organizerId))) {
      return NextResponse.json(
        { success: false, message: 'Neplatné ID organizátora' },
        { status: 400 }
      );
    }

    // Získání detailu organizátora
    const result = await query(
      `SELECT id, name, description, contact_email, website, avatar_url, is_beginner, created_at 
       FROM organizers 
       WHERE id = $1`,
      [organizerId]
    );

    // Kontrola, zda byl organizátor nalezen
    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Organizátor nebyl nalezen' },
        { status: 404 }
      );
    }

    // Získání statistik organizátora - počet uspořádaných akcí
    const statsResult = await query(
      `SELECT COUNT(e.id) as event_count, 
              COUNT(CASE WHEN e.date >= CURRENT_DATE THEN 1 END) as upcoming_event_count
       FROM events e
       WHERE e.organizer_id = $1`,
      [organizerId]
    );

    const organizer = result.rows[0];
    const stats = statsResult.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        ...organizer,
        stats: {
          event_count: parseInt(stats.event_count) || 0,
          upcoming_event_count: parseInt(stats.upcoming_event_count) || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching organizer:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Při načítání detailu organizátora došlo k chybě: ${(error as Error).message}` 
      },
      { status: 500 }
    );
  }
}

// PUT /api/organizers/[id] - Aktualizace profilu organizátora
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const organizerId = params.id;

    // Validace ID
    if (!organizerId || isNaN(Number(organizerId))) {
      return NextResponse.json(
        { success: false, message: 'Neplatné ID organizátora' },
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

    // Kontrola, zda uživatel má právo upravit tohoto organizátora
    if (user.organizer_id !== parseInt(organizerId)) {
      return NextResponse.json(
        { success: false, message: 'Nemáte oprávnění upravovat tento profil' },
        { status: 403 }
      );
    }

    // Zpracování dat z požadavku
    const data = await request.json();
    
    // Validace dat
    const validation = validateOrganizerData(data);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      );
    }

    // Aktualizace profilu organizátora
    const result = await query(
      `UPDATE organizers 
       SET name = $1, description = $2, contact_email = $3, website = $4 
       WHERE id = $5 
       RETURNING id, name, description, contact_email, website, avatar_url, is_beginner, created_at`,
      [
        data.name,
        data.description || null,
        data.contact_email || null,
        data.website || null,
        organizerId
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Organizátor nebyl nalezen' },
        { status: 404 }
      );
    }

    const organizer = result.rows[0];

    return NextResponse.json({
      success: true,
      message: 'Profil organizátora byl úspěšně aktualizován',
      data: organizer
    });
  } catch (error) {
    console.error('Error updating organizer:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Při aktualizaci profilu organizátora došlo k chybě: ${(error as Error).message}` 
      },
      { status: 500 }
    );
  }
} 