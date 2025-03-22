import { NextRequest, NextResponse } from 'next/server';
import { Event, handleGetRequest } from '@/lib/api-helpers';

// GET /api/events - Získat seznam událostí
export async function GET(request: NextRequest): Promise<NextResponse> {
  return handleGetRequest<Event>(
    request, 
    'events', 
    ['id'],                 // Přesná shoda jen pro ID
    ['name', 'location']    // Textové vyhledávání pro jméno a lokaci
  );
} 