import { NextRequest, NextResponse } from 'next/server';
import { Photo, handleGetRequest } from '@/lib/api-helpers';

// GET /api/photos - Získat seznam fotografií
export async function GET(request: NextRequest): Promise<NextResponse> {
  return handleGetRequest<Photo>(
    request, 
    'photos', 
    ['id', 'event_id', 'photographer_id']
  );
} 