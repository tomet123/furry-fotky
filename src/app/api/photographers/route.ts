import { NextRequest, NextResponse } from 'next/server';
import { getAllPhotographers, searchPhotographers } from '@/lib/mock-db/photographers';

// GET /api/photographers
export async function GET(request: NextRequest) {
  try {
    // Získání query parametrů
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    
    let photographers;
    
    if (query) {
      photographers = searchPhotographers(query);
    } else {
      photographers = getAllPhotographers();
    }
    
    return NextResponse.json({
      data: photographers,
      meta: {
        total: photographers.length
      }
    });
  } catch (error) {
    console.error('Chyba při načítání fotografů:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání fotografů' },
      { status: 500 }
    );
  }
} 