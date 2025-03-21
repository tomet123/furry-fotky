import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { errorResponse } from '@/lib/api-helpers';

// GET /api/photos/files/[id] - Získat originální soubor fotografie
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
    
    // Získáme soubor z databáze
    const result = await query(
      'SELECT file_data, content_type FROM storage.photo_files WHERE photo_id = $1',
      [id]
    );
    
    if (result.rowCount === 0) {
      return errorResponse('Fotografie nebyla nalezena', 404);
    }
    
    const { file_data, content_type } = result.rows[0];
    
    // Konverze binárních dat na Buffer
    const buffer = Buffer.from(file_data);
    
    // Vytvoření odpovědi s binárními daty a správným Content-Type
    const response = new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': content_type,
        'Content-Disposition': `inline; filename="photo_${id}.jpg"`,
        'Cache-Control': 'max-age=86400'
      }
    });
    
    return response;
  } catch (error) {
    console.error('Error fetching photo file:', error);
    return errorResponse(`Při načítání souboru fotografie došlo k chybě: ${(error as Error).message}`, 500);
  }
} 