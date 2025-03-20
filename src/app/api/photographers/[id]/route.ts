import { NextRequest, NextResponse } from 'next/server';
import { getPhotographerById } from '@/lib/mock-db/photographers';
import { filterPhotos } from '@/lib/mock-db/photos';

// GET /api/photographers/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const photographer = getPhotographerById(id);
    
    if (!photographer) {
      return NextResponse.json(
        { error: 'Fotograf nebyl nalezen' },
        { status: 404 }
      );
    }
    
    // Získání fotografií tohoto fotografa
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 12;
    
    const photos = filterPhotos({
      photographer: photographer.name,
      page,
      limit
    });
    
    // Připravení kompletní odpovědi s informacemi o fotografovi a jeho fotkami
    const response = {
      ...photographer,
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
    console.error('Chyba při načítání detailu fotografa:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání detailu fotografa' },
      { status: 500 }
    );
  }
} 