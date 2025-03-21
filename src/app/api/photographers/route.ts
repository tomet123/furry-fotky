import { NextRequest, NextResponse } from 'next/server';
import { Photographer, handleGetRequest } from '@/lib/api-helpers';
import { getUserFromToken } from '@/lib/auth';
import { JWT_STORAGE_KEY } from '@/lib/constants';
import { query } from '@/lib/db';

// GET /api/photographers - Získat seznam fotografů
export async function GET(request: NextRequest): Promise<NextResponse> {
  return handleGetRequest<Photographer>(
    request, 
    'photographers', 
    ['id'],              // Přesná shoda jen pro ID
    ['name']             // Textové vyhledávání pro jméno
  );
}

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

    // Kontrola, zda uživatel již nemá profil fotografa
    if (user.photographer_id) {
      return NextResponse.json(
        { success: false, message: 'Již máte vytvořený profil fotografa' },
        { status: 400 }
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

    // Vytvoření profilu fotografa
    const result = await query(
      `INSERT INTO photographers (name, bio, is_beginner) 
       VALUES ($1, $2, TRUE) 
       RETURNING id, name, bio, avatar_url, is_beginner, created_at`,
      [data.name, data.bio || null]
    );

    if (result.rowCount === 0) {
      throw new Error('Nepodařilo se vytvořit profil fotografa');
    }

    const photographer = result.rows[0];

    // Aktualizace uživatele - přiřazení ID fotografa
    await query(
      'UPDATE users SET photographer_id = $1 WHERE id = $2',
      [photographer.id, user.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Profil fotografa byl úspěšně vytvořen',
      photographer_id: photographer.id,
      data: photographer
    });
  } catch (error) {
    console.error('Error creating photographer profile:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Při vytváření profilu fotografa došlo k chybě: ${(error as Error).message}` 
      },
      { status: 500 }
    );
  }
} 