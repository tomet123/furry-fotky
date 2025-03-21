import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Parsování těla požadavku
    const { username, email, password } = await request.json();

    // Validace vstupů
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Chybějící povinné údaje' },
        { status: 400 }
      );
    }

    // Validace emailu
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Neplatný formát emailu' },
        { status: 400 }
      );
    }

    // Validace uživatelského jména
    if (username.length < 3) {
      return NextResponse.json(
        { success: false, message: 'Uživatelské jméno musí mít alespoň 3 znaky' },
        { status: 400 }
      );
    }

    // Validace hesla
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Heslo musí mít alespoň 6 znaků' },
        { status: 400 }
      );
    }

    // Registrace uživatele
    const result = await registerUser(username, email, password);

    if (result.success) {
      return NextResponse.json(
        { success: true, userId: result.userId },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { success: false, message: 'Při registraci došlo k chybě' },
      { status: 500 }
    );
  }
} 