import { NextRequest, NextResponse } from 'next/server';
import { query } from './db';

// Typy entit
export interface Photo {
  id: number;
  event_id: number | null;
  photographer_id: number | null;
  likes: number;
  date: string;
  created_at: string;
}

export interface PhotoDetail {
  id: number;
  date: string;
  likes: number;
  event: string | null;
  photographer: string | null;
  photo_id: number;
  thumbnail_id: number;
  tags: string[];
}

export interface Photographer {
  id: number;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Event {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  date: string | null;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  created_at: string;
}

export interface PhotoTag {
  photo_id: number;
  tag_id: number;
}

// Společná funkce pro parsování parametrů stránkování a filtrování
export function parsePaginationParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Stránkování
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;
  
  // Řazení
  const sortBy = searchParams.get('sortBy') || 'id';
  const sortOrder = (searchParams.get('sortOrder') || 'asc').toUpperCase() as 'ASC' | 'DESC';
  
  return { page, limit, offset, sortBy, sortOrder };
}

/**
 * Funkce pro zpracování filtrovacích parametrů z požadavku
 * 
 * @param request HTTP požadavek
 * @param exactFields Pole názvů parametrů, které mají být filtrovány přesnou shodou
 * @param textFields Pole názvů parametrů, které mají být filtrovány pomocí ILIKE
 * @returns Objekt s částí WHERE pro SQL dotaz a pole hodnot pro parametrizovaný dotaz
 */
export function parseFilterParams(
  request: NextRequest,
  exactFields: string[] = [],
  textFields: string[] = []
): { whereClause: string; values: (string | number)[] } {
  const { searchParams } = new URL(request.url);
  const conditions: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  // Zpracování polí s přesnou shodou
  for (const field of exactFields) {
    const value = searchParams.get(field);
    if (value !== null) {
      conditions.push(`${field} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  // Zpracování textových polí s částečnou shodou (ILIKE)
  for (const field of textFields) {
    const value = searchParams.get(field);
    if (value !== null) {
      conditions.push(`${field} ILIKE $${paramIndex}`);
      values.push(`%${value}%`);
      paramIndex++;
    }
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereClause, values };
}

// Generická metoda pro vytvoření odpovědi s chybou
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

// Generická metoda pro GET operaci s paginací
export async function handleGetRequest<T>(
  request: NextRequest,
  tableName: string,
  allowedFilters: string[] = [],
  textSearchParams: string[] = []
): Promise<NextResponse> {
  try {
    const { limit, offset, sortBy, sortOrder } = parsePaginationParams(request);
    const { whereClause, values } = parseFilterParams(request, allowedFilters, textSearchParams);
    
    // Dotaz pro získání dat
    const sqlQuery = `
      SELECT * FROM ${tableName}
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    // Dotaz pro získání celkového počtu
    const countQuery = `
      SELECT COUNT(*) FROM ${tableName}
      ${whereClause}
    `;
    
    // Provedení dotazů
    const result = await query(sqlQuery, values);
    const countResult = await query(countQuery, values);
    
    // Zpracování výsledků
    const items = result.rows as T[];
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
    console.error(`Error fetching ${tableName}:`, error);
    return errorResponse(`Při načítání dat došlo k chybě: ${(error as Error).message}`, 500);
  }
} 