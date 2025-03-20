import { NextRequest, NextResponse } from 'next/server';
import { getEventById } from '@/lib/mock-db/events';
import { filterPhotos } from '@/lib/mock-db/photos';

// GET /api/events/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const event = getEventById(id);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Akce nebyla nalezena' },
        { status: 404 }
      );
    }
    
    // Získání fotografií z této akce
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 12;
    
    const photos = filterPhotos({
      event: event.name,
      page,
      limit
    });
    
    // Připravení kompletní odpovědi s informacemi o akci a jejích fotkách
    const response = {
      ...event,
      photos: {
        data: photos.data,
        meta: {
          total: photos.total,
          page,
          limit,
          totalPages: Math.ceil(photos.total / limit)
        }
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Chyba při načítání detailu akce:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání detailu akce' },
      { status: 500 }
    );
  }
} 