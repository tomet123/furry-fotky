import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { errorResponse } from '@/lib/api-helpers';

// GET /api/photos/thumbnails/[id] - Získat miniaturu fotografie
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> {
  try {
    // Získání ID z dynamické cesty
    const id = parseInt(context.params.id);
    
    if (isNaN(id)) {
      return errorResponse('Neplatné ID fotografie', 400);
    }
    
    // Získáme miniaturu z databáze
    const result = await query(
      'SELECT thumbnail_data, content_type FROM storage.photo_thumbnails WHERE photo_id = $1',
      [id]
    );
    
    if (result.rowCount === 0) {
      return errorResponse('Miniatura nebyla nalezena', 404);
    }
    
    const { thumbnail_data, content_type } = result.rows[0];
    
    // Konverze binárních dat na Buffer
    const buffer = Buffer.from(thumbnail_data);
    
    // Vytvoření odpovědi s binárními daty a správným Content-Type
    const response = new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': content_type,
        'Content-Disposition': `inline; filename="thumbnail_${id}.jpg"`,
        'Cache-Control': 'max-age=86400'
      }
    });
    
    return response;
  } catch (error) {
    console.error('Error fetching photo thumbnail:', error);
    return errorResponse(`Při načítání miniatury fotografie došlo k chybě: ${(error as Error).message}`, 500);
  }
} 