import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { parsePaginationParams } from '@/lib/api-helpers';

// GET /api/users - Získání seznamu uživatelů
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Načtení parametrů stránkování a filtrování
    const { page, limit, offset, sortBy, sortOrder } = parsePaginationParams(request);
    
    // URL parametry
    const { searchParams } = new URL(request.url);
    
    // Zpracování parametrů filtrování
    let whereClause = '';
    const values: (string | number)[] = [];
    let paramIndex = 1;
    
    // Filtrování podle role - podpora pro více rolí
    const roles = searchParams.getAll('role');
    if (roles.length > 0) {
      whereClause += ' WHERE role IN (';
      roles.forEach((role, index) => {
        whereClause += index === 0 ? `$${paramIndex}` : `, $${paramIndex}`;
        values.push(role);
        paramIndex++;
      });
      whereClause += ')';
    }
    
    // Vyhledávání
    const searchTerms = [];
    const searchFields = ['username', 'display_name', 'email'];
    
    for (const field of searchFields) {
      const value = searchParams.get(field);
      if (value) {
        searchTerms.push(`${field} ILIKE $${paramIndex}`);
        values.push(`%${value}%`);
        paramIndex++;
      }
    }
    
    if (searchTerms.length > 0) {
      whereClause = whereClause 
        ? `${whereClause} AND (${searchTerms.join(' OR ')})`
        : ` WHERE ${searchTerms.join(' OR ')}`;
    }

    // Dotaz pro získání uživatelů
    const sqlQuery = `
      SELECT * FROM user_profiles
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Dotaz pro získání celkového počtu
    const countQuery = `
      SELECT COUNT(*) FROM user_profiles
      ${whereClause}
    `;

    // Provedení dotazů
    const result = await query(sqlQuery, values);
    const countResult = await query(countQuery, values);

    // Zpracování výsledků
    const users = result.rows;
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        totalItems: totalCount,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: `Při načítání uživatelů došlo k chybě: ${(error as Error).message}` },
      { status: 500 }
    );
  }
} 