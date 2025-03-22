import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken, verifyToken, User } from '@/lib/auth';
import { JWT_STORAGE_KEY } from '@/lib/constants';

/**
 * Získá token z požadavku - kontroluje jak cookie, tak Authorization hlavičku
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  // Zkusíme získat token z cookies
  const cookieToken = request.cookies.get(JWT_STORAGE_KEY)?.value;
  if (cookieToken) {
    return cookieToken;
  }
  
  // Zkusíme získat token z auth_token cookie (pro zpětnou kompatibilitu)
  const authCookieToken = request.cookies.get('auth_token')?.value;
  if (authCookieToken) {
    return authCookieToken;
  }
  
  // Zkusíme získat token z Authorization hlavičky
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Odstranění 'Bearer ' prefixu
  }
  
  return null;
}

/**
 * Ověří požadavek a vrátí uživatele, pokud je autentizovaný
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<{ authenticated: boolean; user?: User; message?: string }> {
  const token = getTokenFromRequest(request);
  
  if (!token) {
    return { 
      authenticated: false, 
      message: 'Nejste přihlášeni' 
    };
  }
  
  // Ověření tokenu a získání uživatele
  const userResponse = await getUserFromToken(token);
  
  if (!userResponse.success || !userResponse.user) {
    return {
      authenticated: false,
      message: userResponse.message || 'Neplatný token'
    };
  }
  
  return {
    authenticated: true,
    user: userResponse.user
  };
}

/**
 * Vytvoří standardní odpověď pro chybu autentizace
 */
export function createAuthErrorResponse(message: string, status: number = 401): NextResponse {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

/**
 * Vytvoří standardní odpověď pro chybu oprávnění
 */
export function createPermissionErrorResponse(message: string = 'Nemáte oprávnění k této akci'): NextResponse {
  return NextResponse.json(
    { success: false, message },
    { status: 403 }
  );
}

/**
 * Kontroluje, zda uživatel má oprávnění k úpravě fotografova profilu
 */
export function canEditPhotographer(user: User, photographerId: number | string): boolean {
  const photographerIdNum = typeof photographerId === 'string' 
    ? parseInt(photographerId, 10) 
    : photographerId;
    
  // Admin může upravovat všechny profily, uživatel jen svůj vlastní
  return user.role === 'admin' || user.photographer_id === photographerIdNum;
}

/**
 * Kontroluje, zda uživatel má oprávnění k úpravě organizátora
 */
export function canEditOrganizer(user: User, organizerId: number | string): boolean {
  const organizerIdNum = typeof organizerId === 'string' 
    ? parseInt(organizerId, 10) 
    : organizerId;
    
  // Admin může upravovat všechny profily, uživatel jen svůj vlastní
  return user.role === 'admin' || user.organizer_id === organizerIdNum;
}

/**
 * Kontroluje, zda uživatel je admin
 */
export function isAdmin(user: User): boolean {
  return user.role === 'admin';
}

/**
 * Kontroluje, zda uživatel je fotograf
 */
export function isPhotographer(user: User): boolean {
  return user.photographer_id !== null;
}

/**
 * Kontroluje, zda uživatel je organizátor
 */
export function isOrganizer(user: User): boolean {
  return user.organizer_id !== null;
} 