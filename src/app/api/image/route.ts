import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/image - Endpoint pro proxy načítání obrázků z Picsum
 * 
 * Query parametry:
 * - width: šířka obrázku (povinný)
 * - height: výška obrázku (povinný)
 * - seed: seed pro generování náhodného obrázku (volitelný)
 */
export async function GET(request: NextRequest) {
  try {
    // Získání query parametrů
    const searchParams = request.nextUrl.searchParams;
    const width = searchParams.get('width');
    const height = searchParams.get('height');
    const seed = searchParams.get('seed');

    // Kontrola povinných parametrů
    if (!width || !height) {
      return NextResponse.json(
        { error: 'Chybí povinné parametry width a height' },
        { status: 400 }
      );
    }

    // Sestavení URL pro Picsum
    let picsumUrl = `https://picsum.photos/${width}/${height}`;
    if (seed) {
      picsumUrl += `?random=${seed}`;
    }

    // Stažení obrázku z Picsum
    const response = await fetch(picsumUrl);

    // Kontrola, zda byl požadavek úspěšný
    if (!response.ok) {
      return NextResponse.json(
        { error: `Chyba při načítání obrázku: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // Získání dat obrázku a typu obsahu
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Vytvoření odpovědi s obrázkem
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable', // Cachování na 24 hodin, immutable pro lepší optimalizaci
        'Content-Length': imageBuffer.byteLength.toString(), // Pomáhá prohlížeči odhadnout velikost pro lazy loading
        'Accept-Ranges': 'bytes', // Podpora pro částečné načítání
      }
    });
  } catch (error) {
    console.error('Chyba při načítání obrázku:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání obrázku' },
      { status: 500 }
    );
  }
} 