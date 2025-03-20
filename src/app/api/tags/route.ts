import { NextRequest, NextResponse } from 'next/server';
import { TAGS } from '@/lib/mock-db/photos';

// GET /api/tags - vrátí seznam všech dostupných tagů
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      data: TAGS,
      meta: {
        total: TAGS.length
      }
    });
  } catch (error) {
    console.error('Chyba při načítání tagů:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání tagů' },
      { status: 500 }
    );
  }
} 