import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/photographers/stats - Získání statistik fotografů
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const photographerId = searchParams.get('id');
    
    let sqlQuery = 'SELECT * FROM photographer_stats';
    const params: (string | number)[] = [];
    
    // Pokud byl zadán konkrétní ID fotografa, vrátíme pouze jeho statistiky
    if (photographerId) {
      sqlQuery += ' WHERE photographer_id = $1';
      params.push(photographerId);
    }
    
    sqlQuery += ' ORDER BY photo_count DESC';
    
    // Provedení dotazu
    const result = await query(sqlQuery, params);
    
    // Zpracování výsledků
    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching photographer stats:', error);
    return NextResponse.json(
      { success: false, message: `Při načítání statistik došlo k chybě: ${(error as Error).message}` },
      { status: 500 }
    );
  }
} 