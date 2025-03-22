import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { query } from './db';
import { JWT_EXPIRES_IN, BCRYPT_SALT_ROUNDS } from './constants';

// Konstanty pro autentizaci
export const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-key-that-should-be-in-env';
// export const JWT_EXPIRES_IN = '7d';
// export const BCRYPT_SALT_ROUNDS = 10;
// export const JWT_STORAGE_KEY = 'furry_fotky_auth_token';

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  photographer_id: number | null;
  avatar_id: number | null;
  organizer_id: number | null;
  role: string;
  created_at: string;
}

interface TokenPayload {
  user_id: number;
  username: string;
  email: string;
  photographer_id: number | null;
  organizer_id: number | null;
  role: string;
}

// Hashování hesla
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

// Ověření hesla
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generování JWT tokenu
export function generateToken(user: TokenPayload): string {
  return jwt.sign(
    {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      photographer_id: user.photographer_id,
      organizer_id: user.organizer_id,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Dekódování JWT tokenu
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Registrace nového uživatele
export async function registerUser(
  username: string,
  email: string,
  password: string
): Promise<{ success: boolean; message?: string; userId?: number }> {
  try {
    // Nejprve zkontrolujeme, zda uživatelské jméno již existuje
    const existingUsername = await query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    
    if (existingUsername.rowCount && existingUsername.rowCount > 0) {
      return { 
        success: false, 
        message: 'Toto uživatelské jméno je již obsazeno. Zvolte prosím jiné.' 
      };
    }
    
    // Potom zkontrolujeme, zda email již existuje
    const existingEmail = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingEmail.rowCount && existingEmail.rowCount > 0) {
      return { 
        success: false, 
        message: 'Tento email je již registrován. Zvolte prosím jiný.' 
      };
    }

    // Hashujeme heslo
    const passwordHash = await hashPassword(password);

    // Vložíme nového uživatele do databáze
    const result = await query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      [username, email, passwordHash]
    );

    return { 
      success: true, 
      userId: result.rows[0].id 
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { 
      success: false, 
      message: 'Při registraci došlo k chybě' 
    };
  }
}

// Přihlášení uživatele
export async function loginUser(
  username: string,
  password: string
): Promise<{ success: boolean; message?: string; token?: string; user?: User }> {
  try {
    // Získáme uživatele podle uživatelského jména
    const result = await query(
      'SELECT id, username, email, password_hash, is_active, photographer_id, organizer_id, role, created_at FROM users WHERE username = $1',
      [username]
    );

    if (result.rowCount === 0) {
      return { 
        success: false, 
        message: 'Neplatné uživatelské jméno nebo heslo' 
      };
    }

    const user = result.rows[0];

    // Ověříme heslo
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return { 
        success: false, 
        message: 'Neplatné uživatelské jméno nebo heslo' 
      };
    }

    // Zkontrolujeme, zda je uživatel aktivní
    if (!user.is_active) {
      return { 
        success: false, 
        message: 'Účet je deaktivován' 
      };
    }

    // Vygenerujeme JWT token
    const token = generateToken({
      user_id: user.id,
      username: user.username,
      email: user.email,
      photographer_id: user.photographer_id,
      organizer_id: user.organizer_id,
      role: user.role || 'user',
    });

    // Vytvoříme objekt uživatele bez hesla pro vrácení klientovi
    const userWithoutPassword: User = {
      id: user.id,
      username: user.username,
      email: user.email,
      is_active: user.is_active,
      photographer_id: user.photographer_id,
      organizer_id: user.organizer_id,
      avatar_id: user.avatar_id,
      role: user.role || 'user',
      created_at: user.created_at,
    };

    return { 
      success: true, 
      token, 
      user: userWithoutPassword 
    };
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      message: 'Při přihlašování došlo k chybě' 
    };
  }
}

// Získání informací o přihlášeném uživateli podle tokenu
export async function getUserFromToken(
  token: string
): Promise<{ success: boolean; message?: string; user?: User }> {
  try {
    // Ověříme a dekódujeme token
    const payload = verifyToken(token);
    if (!payload) {
      return { 
        success: false, 
        message: 'Neplatný nebo expirovaný token' 
      };
    }

    // Získáme uživatele z databáze podle ID z tokenu - přidáno avatar_id do výběru
    const result = await query(
      'SELECT id, username, email, is_active, photographer_id, organizer_id, avatar_id, role, created_at FROM users WHERE id = $1',
      [payload.user_id]
    );

    if (result.rowCount === 0) {
      return { 
        success: false, 
        message: 'Uživatel nebyl nalezen' 
      };
    }

    // Zkontrolujeme, zda je uživatel stále aktivní
    const user = result.rows[0];
    if (!user.is_active) {
      return { 
        success: false, 
        message: 'Účet je deaktivován' 
      };
    }

    return { 
      success: true, 
      user 
    };
  } catch (error) {
    console.error('Get user from token error:', error);
    return { 
      success: false, 
      message: 'Při získávání informací o uživateli došlo k chybě' 
    };
  }
}

// Funkcionalita pro změnu hesla
export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // Nejprve získáme aktuální hash hesla z databáze
    const userResult = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rowCount === 0) {
      return {
        success: false,
        message: 'Uživatel nebyl nalezen'
      };
    }

    const storedPasswordHash = userResult.rows[0].password_hash;

    // Ověříme, že současné heslo je správné
    const isPasswordValid = await verifyPassword(currentPassword, storedPasswordHash);
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Současné heslo není správné'
      };
    }

    // Vygenerujeme hash nového hesla
    const newPasswordHash = await hashPassword(newPassword);

    // Aktualizujeme heslo v databázi
    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, userId]
    );

    return {
      success: true,
      message: 'Heslo bylo úspěšně změněno'
    };
  } catch (error) {
    console.error('Password change error:', error);
    return {
      success: false,
      message: 'Při změně hesla došlo k chybě'
    };
  }
} 