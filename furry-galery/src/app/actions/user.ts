'use server';

import { db, users, eq, createId } from '@/db';

// Získání uživatele podle ID
export async function getUserById(id: string) {
  try {
    const user = await db.select().from(users).where(eq(users.id, id)).get();
    return { user };
  } catch (error) {
    console.error('Chyba při načítání uživatele:', error);
    return { error: 'Nepodařilo se načíst uživatele' };
  }
}

// Získání všech uživatelů (s omezením)
export async function getAllUsers(limit = 20) {
  try {
    const userList = await db.select().from(users).limit(limit);
    return { users: userList };
  } catch (error) {
    console.error('Chyba při načítání uživatelů:', error);
    return { error: 'Nepodařilo se načíst uživatele' };
  }
}

// Vytvoření nového uživatele
export async function createUser(userData: {
  email: string;
  username: string;
  passwordHash: string;
  displayName?: string;
  role?: 'user' | 'photographer' | 'admin' | 'organizer';
}) {
  try {
    const newUser = await db.insert(users).values({
      id: createId('user_'),
      email: userData.email,
      username: userData.username,
      passwordHash: userData.passwordHash,
      displayName: userData.displayName,
      role: userData.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning().get();
    
    return { user: newUser };
  } catch (error) {
    console.error('Chyba při vytváření uživatele:', error);
    return { error: 'Nepodařilo se vytvořit uživatele' };
  }
} 