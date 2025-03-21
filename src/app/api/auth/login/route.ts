import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Parsování těla požadavku
    const { username, password } = await request.json();

    // Validace vstupů
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Chybějící uživatelské jméno nebo heslo' },
        { status: 400 }
      );
    }

    // Přihlášení uživatele
    const result = await loginUser(username, password);

    if (result.success && result.token && result.user) {
      // Nastavíme HTTP-only cookie s tokenem (pro větší bezpečnost)
      const response = NextResponse.json(
        { 
          success: true, 
          user: result.user,
          token: result.token // Posíláme token i v těle odpovědi pro klienty, kteří nemohou použít cookies
        },
        { status: 200 }
      );

      // Nastavení cookies
      response.cookies.set({
        name: 'auth_token',
        value: result.token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 dní
        path: '/',
      });

      return response;
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, message: 'Při přihlašování došlo k chybě' },
      { status: 500 }
    );
  }
} 