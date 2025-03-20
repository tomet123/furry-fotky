import { NextRequest, NextResponse } from 'next/server';
import { filterPhotos, getAllPhotos } from '@/lib/mock-db/photos';

// GET /api/photos
export async function GET(request: NextRequest) {
  try {
    // Získání query parametrů
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || undefined;
    const event = searchParams.get('event') || undefined;
    const photographer = searchParams.get('photographer') || undefined;
    const tagsParam = searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',') : undefined;
    const sortBy = searchParams.get('sortBy') as 'newest' | 'oldest' | 'most_liked' | undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 12;

    // Aplikování filtrů
    const result = filterPhotos({
      query,
      event,
      photographer,
      tags,
      sortBy,
      page,
      limit
    });

    // Přidání metadat pro stránkování
    const response = {
      data: result.data,
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chyba při načítání fotografií:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání fotografií' },
      { status: 500 }
    );
  }
}

// POST /api/photos - v budoucnu pro přidání nové fotografie
export async function POST(request: NextRequest) {
  try {
    // V reálné aplikaci by zde byla logika pro uložení nové fotografie
    // Pro teď jen vracíme chybovou zprávu, že tato funkcionalita není implementována
    return NextResponse.json(
      { error: 'Přidávání fotografií není v této verzi podporováno' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Chyba při přidávání fotografie:', error);
    return NextResponse.json(
      { error: 'Chyba při přidávání fotografie' },
      { status: 500 }
    );
  }
} 