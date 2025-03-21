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

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
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

    // Kontrola, zda uživatel již nemá profil organizátora
    if (user.organizer_id) {
      return NextResponse.json(
        { success: false, message: 'Již máte vytvořený profil organizátora' },
        { status: 400 }
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

    // Vytvoření profilu organizátora
    const result = await query(
      `INSERT INTO organizers (name, description, contact_email, website, is_beginner) 
       VALUES ($1, $2, $3, $4, TRUE) 
       RETURNING id, name, description, contact_email, website, avatar_url, is_beginner, created_at`,
      [
        data.name,
        data.description || null,
        data.contact_email || null,
        data.website || null
      ]
    );

    if (result.rowCount === 0) {
      throw new Error('Nepodařilo se vytvořit profil organizátora');
    }

    const organizer = result.rows[0];

    // Aktualizace uživatele - přiřazení ID organizátora
    await query(
      'UPDATE users SET organizer_id = $1 WHERE id = $2',
      [organizer.id, user.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Profil organizátora byl úspěšně vytvořen',
      organizer_id: organizer.id,
      data: organizer
    });
  } catch (error) {
    console.error('Error creating organizer profile:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Při vytváření profilu organizátora došlo k chybě: ${(error as Error).message}` 
      },
      { status: 500 }
    );
  }
} 