import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Získáme token z cookie nebo Authorization hlavičky
    const authToken = request.cookies.get('auth_token')?.value;
    const authHeader = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    const token = authToken || authHeader;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Není poskytnuta autentizace' },
        { status: 401 }
      );
    }

    // Získáme uživatele podle tokenu
    const result = await getUserFromToken(token);

    if (result.success && result.user) {
      return NextResponse.json(
        { success: true, user: result.user },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Get user API error:', error);
    return NextResponse.json(
      { success: false, message: 'Při získávání informací o uživateli došlo k chybě' },
      { status: 500 }
    );
  }
} 