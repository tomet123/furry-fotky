import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const id = params.id;
    
    // Validace ID
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, message: 'Neplatné ID obrázku' },
        { status: 400 }
      );
    }

    // Získání obrázku z databáze
    const result = await query(
      `SELECT file_data, content_type 
       FROM storage.profile_images 
       WHERE id = $1`,
      [id]
    );

    // Kontrola, zda byl obrázek nalezen
    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Obrázek nebyl nalezen' },
        { status: 404 }
      );
    }

    const image = result.rows[0];
    const buffer = image.file_data;
    const contentType = image.content_type;

    // Vrácení obrázku jako binárních dat
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache na 1 rok
      },
    });
  } catch (error) {
    console.error('Error retrieving image:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Při načítání obrázku došlo k chybě: ${(error as Error).message}` 
      },
      { status: 500 }
    );
  }
} 