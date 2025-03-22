import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    // V Next.js 14+ je třeba použít asynchronní přístup k params
    const id = params.id;
    
    // Ověření, že ID je číslo
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, message: 'Neplatné ID avataru' },
        { status: 400 }
      );
    }

    // Získání avataru z databáze
    const result = await query(
      'SELECT file_data, content_type FROM storage.avatars WHERE id = $1',
      [Number(id)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Avatar nebyl nalezen' },
        { status: 404 }
      );
    }

    const avatar = result.rows[0];
    
    // Vrácení avataru jako binárních dat s příslušným Content-Type
    return new NextResponse(avatar.file_data, {
      status: 200,
      headers: {
        'Content-Type': avatar.content_type,
        'Cache-Control': 'no-cache, no-store, must-revalidate', // Zakáže cachování
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*', // CORS - povolí přístup všem doménám
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error fetching avatar:', error);
    return NextResponse.json(
      { success: false, message: 'Při načítání avataru došlo k chybě' },
      { status: 500 }
    );
  }
} 