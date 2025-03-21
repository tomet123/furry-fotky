import { NextRequest, NextResponse } from 'next/server';
import { PhotoTag, parsePaginationParams, errorResponse } from '@/lib/api-helpers';
import { query } from '@/lib/db';

// GET /api/photo-tags - Získat vztahy mezi fotografiemi a tagy
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('photo_id');
    const tagId = searchParams.get('tag_id');
    
    let sqlQuery = 'SELECT photo_id, tag_id FROM photo_tags';
    const values: (string | number)[] = [];
    const conditions: string[] = [];
    
    if (photoId) {
      conditions.push('photo_id = $1');
      values.push(photoId);
    }
    
    if (tagId) {
      conditions.push(`tag_id = $${values.length + 1}`);
      values.push(tagId);
    }
    
    if (conditions.length > 0) {
      sqlQuery += ' WHERE ' + conditions.join(' AND ');
    }
    
    const { sortBy = 'photo_id', sortOrder = 'ASC' } = parsePaginationParams(request);
    sqlQuery += ` ORDER BY ${sortBy} ${sortOrder}`;
    
    const result = await query(sqlQuery, values);
    const items = result.rows as PhotoTag[];
    
    return NextResponse.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Error fetching photo-tags:', error);
    return errorResponse(`Při načítání vztahů mezi fotografiemi a tagy došlo k chybě: ${(error as Error).message}`, 500);
  }
} 