import { NextRequest, NextResponse } from 'next/server';
import { db, eq, user } from '@/db';
import bcrypt from 'bcrypt';

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

    // Kontrola, zda uživatelské jméno již existuje
    const existingUsername = await db
      .select()
      .from(user)
      .where(eq(user.username, username))
      .limit(1);

    if (existingUsername.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Toto uživatelské jméno je již obsazeno' },
        { status: 400 }
      );
    }

    // Kontrola, zda email již existuje
    const existingEmail = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existingEmail.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Tento email je již registrován' },
        { status: 400 }
      );
    }

    // Hashování hesla
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Vytvoření nového uživatele
    const newUser = await db.insert(user).values({
      name: username,
      username,
      email,
      passwordHash,
      isAdmin: false,
      isActive: true
    }).returning();

    return NextResponse.json(
      { success: true, userId: newUser[0].id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { success: false, message: 'Při registraci došlo k chybě' },
      { status: 500 }
    );
  }
} 