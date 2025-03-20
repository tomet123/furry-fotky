import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/avatar - Endpoint pro proxy načítání avatarů z Pravatar
 * 
 * Query parametry:
 * - size: velikost avataru (povinný)
 * - seed: seed pro generování náhodného avataru (volitelný)
 */
export async function GET(request: NextRequest) {
  try {
    // Získání query parametrů
    const searchParams = request.nextUrl.searchParams;
    const size = searchParams.get('size') || '300';
    const seed = searchParams.get('seed');

    // Sestavení URL pro Pravatar
    let pravaratUrl = `https://i.pravatar.cc/${size}`;
    if (seed) {
      pravaratUrl += `?img=${seed}`;
    }

    // Stažení avataru z Pravatar
    const response = await fetch(pravaratUrl);

    // Kontrola, zda byl požadavek úspěšný
    if (!response.ok) {
      return NextResponse.json(
        { error: `Chyba při načítání avataru: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // Získání dat avataru a typu obsahu
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Vytvoření odpovědi s avatarem
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable', // Cachování na 24 hodin, immutable pro lepší optimalizaci
        'Content-Length': imageBuffer.byteLength.toString(), // Pomáhá prohlížeči odhadnout velikost pro lazy loading
        'Accept-Ranges': 'bytes', // Podpora pro částečné načítání
      }
    });
  } catch (error) {
    console.error('Chyba při načítání avataru:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání avataru' },
      { status: 500 }
    );
  }
} 