import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { storagePhotos } from '@/db/schema/photos';
import { eq } from 'drizzle-orm';

/**
 * GET /api/event-images/[id]
 * Vrátí obrázek události podle ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Získání obrázku z databáze
    const photo = await db
      .select({
        fileData: storagePhotos.fileData,
        contentType: storagePhotos.contentType,
      })
      .from(storagePhotos)
      .where(eq(storagePhotos.id, params.id))
      .limit(1);

    if (!photo[0]) {
      return new NextResponse('Obrázek nebyl nalezen', { status: 404 });
    }

    // Vrácení obrázku s příslušným Content-Type
    return new NextResponse(Buffer.from(photo[0].fileData as Buffer), {
      headers: {
        'Content-Type': photo[0].contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache na 1 rok
      },
    });
  } catch (error) {
    console.error('Chyba při načítání obrázku události:', error);
    return new NextResponse('Interní chyba serveru', { status: 500 });
  }
} 