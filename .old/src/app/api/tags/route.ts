import { NextRequest, NextResponse } from 'next/server';
import { Tag, handleGetRequest } from '@/lib/api-helpers';

// GET /api/tags - Získat seznam tagů
export async function GET(request: NextRequest): Promise<NextResponse> {
  return handleGetRequest<Tag>(
    request, 
    'tags', 
    ['id', 'name']
  );
} 