import { NextRequest, NextResponse } from 'next/server';
import { PhotoDetail, parsePaginationParams, errorResponse } from '@/lib/api-helpers';
import { query } from '@/lib/db';

// GET /api/photos/details - Získat detaily fotografií
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { limit, offset, sortBy, sortOrder } = parsePaginationParams(request);
    const { searchParams } = new URL(request.url);
    
    // Filtrování
    const conditions: string[] = [];
    const values: (string | number)[] = [];
    let paramIndex = 1;
    
    // ID filtry
    const photoId = searchParams.get('id');
    if (photoId !== null) {
      conditions.push(`p.id = $${paramIndex}`);
      values.push(photoId);
      paramIndex++;
    }
    
    const eventId = searchParams.get('event_id');
    if (eventId !== null) {
      conditions.push(`p.event_id = $${paramIndex}`);
      values.push(eventId);
      paramIndex++;
    }
    
    const photographerId = searchParams.get('photographer_id');
    if (photographerId !== null) {
      conditions.push(`p.photographer_id = $${paramIndex}`);
      values.push(photographerId);
      paramIndex++;
    }
    
    // Tag filtr
    const tag = searchParams.get('tag');
    if (tag !== null) {
      conditions.push(`t.name = $${paramIndex}`);
      values.push(tag);
      paramIndex++;
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Dotaz pro získání detailů fotografií - používá JOIN místo pohledu photo_details
    const sqlQuery = `
      SELECT 
        p.id,
        p.date,
        p.likes,
        e.name as event,
        ph.name as photographer,
        pf.id as photo_id,
        pt.id as thumbnail_id,
        (
          SELECT ARRAY_AGG(t.name)
          FROM photo_tags pt
          JOIN tags t ON t.id = pt.tag_id
          WHERE pt.photo_id = p.id
        ) as tags
      FROM photos p
      LEFT JOIN events e ON e.id = p.event_id
      LEFT JOIN photographers ph ON ph.id = p.photographer_id
      LEFT JOIN storage.photo_files pf ON pf.photo_id = p.id
      LEFT JOIN storage.photo_thumbnails pt ON pt.photo_id = p.id
      ${tag ? 'JOIN photo_tags ptag ON ptag.photo_id = p.id JOIN tags t ON t.id = ptag.tag_id' : ''}
      ${whereClause}
      GROUP BY p.id, e.name, ph.name, pf.id, pt.id
      ORDER BY p.${sortBy} ${sortOrder}
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    // Dotaz pro získání celkového počtu
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) 
      FROM photos p
      LEFT JOIN events e ON e.id = p.event_id
      LEFT JOIN photographers ph ON ph.id = p.photographer_id
      ${tag ? 'JOIN photo_tags ptag ON ptag.photo_id = p.id JOIN tags t ON t.id = ptag.tag_id' : ''}
      ${whereClause}
    `;
    
    // Provedení dotazů
    const result = await query(sqlQuery, values);
    const countResult = await query(countQuery, values);
    
    // Zpracování výsledků
    const items = result.rows as PhotoDetail[];
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        totalItems: totalCount,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching photo details:', error);
    return errorResponse(`Při načítání detailů fotografií došlo k chybě: ${(error as Error).message}`, 500);
  }
} 