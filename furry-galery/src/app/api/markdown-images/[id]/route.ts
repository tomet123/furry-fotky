import { NextRequest, NextResponse } from 'next/server';
import { db, markdownImages, eq } from '@/db';

// Endpoint pro získání obrázku podle ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Pokud ID začíná prefixem mdimg_, odebereme ho pro vyhledávání
    const searchId = id.startsWith('mdimg_') ? id : `mdimg_${id}`;
    
    // Vyhledání obrázku v databázi
    const results = await db
      .select()
      .from(markdownImages)
      .where(eq(markdownImages.id, searchId))
      .limit(1);
    
    // Pokud obrázek neexistuje, vrátíme 404
    if (!results.length) {
      console.error(`Obrázek s ID ${searchId} nebyl nalezen`);
      return NextResponse.json({ error: 'Obrázek nebyl nalezen' }, { status: 404 });
    }
    
    const image = results[0];
    
    // Pokud je obrázek soukromý, zkontrolujeme oprávnění (TODO)
    // if (!image.isPublic) { ... }
    
    // Konverze Blob na Buffer a použití jako BodyInit
    const fileData = image.fileData as Buffer;
    
    // Vrátíme obrázek s příslušnými hlavičkami
    return new NextResponse(fileData, {
      status: 200,
      headers: {
        'Content-Type': image.contentType,
        'Content-Disposition': `inline; filename="${image.originalName}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
    
  } catch (error) {
    console.error('Chyba při získávání markdown obrázku:', error);
    return NextResponse.json({ error: 'Chyba serveru' }, { status: 500 });
  }
} 