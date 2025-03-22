import { NextRequest, NextResponse } from 'next/server';
import { changePassword, getUserFromToken } from '@/lib/auth';
import { JWT_STORAGE_KEY } from '@/lib/constants';

// PUT /api/users/[id]/password - Změna hesla uživatele
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const userId = params.id;

    // Validace ID
    if (!userId || isNaN(Number(userId))) {
      return NextResponse.json(
        { success: false, message: 'Neplatné ID uživatele' },
        { status: 400 }
      );
    }

    // Kontrola autentizace
    const authToken = request.cookies.get(JWT_STORAGE_KEY)?.value;
    const authHeader = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    const token = authToken || authHeader;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Nejste přihlášeni' },
        { status: 401 }
      );
    }

    // Získání aktuálního uživatele
    const userResponse = await getUserFromToken(token);
    if (!userResponse.success || !userResponse.user) {
      return NextResponse.json(
        { success: false, message: 'Neplatný token' },
        { status: 401 }
      );
    }

    const currentUser = userResponse.user;

    // Kontrola, zda uživatel má právo změnit heslo (může měnit pouze své vlastní heslo)
    if (currentUser.id !== parseInt(userId)) {
      return NextResponse.json(
        { success: false, message: 'Nemáte oprávnění měnit heslo tohoto uživatele' },
        { status: 403 }
      );
    }

    // Zpracování dat z požadavku
    const data = await request.json();
    
    // Validace dat
    if (!data.currentPassword || !data.newPassword) {
      return NextResponse.json(
        { success: false, message: 'Současné i nové heslo jsou povinné údaje' },
        { status: 400 }
      );
    }

    // Validace nového hesla
    if (data.newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Nové heslo musí mít alespoň 8 znaků' },
        { status: 400 }
      );
    }

    // Kontrola, že heslo obsahuje alespoň jedno velké písmeno, jedno malé a jednu číslici
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(data.newPassword)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Heslo musí obsahovat alespoň jedno velké písmeno, jedno malé písmeno a jednu číslici' 
        },
        { status: 400 }
      );
    }

    // Změna hesla
    const result = await changePassword(
      parseInt(userId),
      data.currentPassword,
      data.newPassword
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Heslo bylo úspěšně změněno'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Při změně hesla došlo k chybě: ${(error as Error).message}` 
      },
      { status: 500 }
    );
  }
} 