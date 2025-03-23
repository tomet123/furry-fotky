'use server';

import { db, user } from '@/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { revalidatePath } from 'next/cache';

// Validační schéma pro aktualizaci profilu
const updateProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Jméno musí mít alespoň 2 znaky'),
  email: z.string().email('Zadejte platný email'),
});

// Validační schéma pro změnu hesla
const changePasswordSchema = z.object({
  id: z.string(),
  currentPassword: z.string().min(6, 'Aktuální heslo musí mít alespoň 6 znaků'),
  newPassword: z.string().min(6, 'Nové heslo musí mít alespoň 6 znaků'),
});

/**
 * Aktualizace profilu uživatele
 */
export async function updateUserProfile(formData: { id: string, name: string, email: string }) {
  try {
    // Validace vstupních dat
    const validatedData = updateProfileSchema.parse(formData);
    
    // Kontrola, zda email již neexistuje u jiného uživatele
    const existingUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, validatedData.email))
      .limit(1);
    
    if (existingUser[0] && existingUser[0].id !== validatedData.id) {
      return { success: false, message: 'Email je již používán jiným uživatelem' };
    }
    
    // Aktualizace profilu
    await db
      .update(user)
      .set({
        name: validatedData.name,
        email: validatedData.email,
      })
      .where(eq(user.id, validatedData.id));
    
    // Revalidace cesty profilu
    revalidatePath('/profil');
    
    return { success: true, message: 'Profil byl úspěšně aktualizován' };
  } catch (error) {
    console.error('Chyba při aktualizaci profilu:', error);
    return { 
      success: false, 
      message: error instanceof z.ZodError 
        ? 'Neplatná vstupní data' 
        : 'Při aktualizaci profilu došlo k chybě' 
    };
  }
}

/**
 * Změna hesla uživatele
 */
export async function changeUserPassword(formData: { id: string, currentPassword: string, newPassword: string }) {
  try {
    // Validace vstupních dat
    const validatedData = changePasswordSchema.parse(formData);
    
    // Načtení aktuálního hesla
    const userRecord = await db
      .select({ passwordHash: user.passwordHash })
      .from(user)
      .where(eq(user.id, validatedData.id))
      .limit(1);
    
    if (!userRecord[0] || !userRecord[0].passwordHash) {
      return { success: false, message: 'Uživatel nebyl nalezen' };
    }
    
    // Ověření aktuálního hesla
    const isValid = await bcrypt.compare(
      validatedData.currentPassword,
      userRecord[0].passwordHash
    );
    
    if (!isValid) {
      return { success: false, message: 'Nesprávné aktuální heslo' };
    }
    
    // Hashování nového hesla
    const newPasswordHash = await bcrypt.hash(validatedData.newPassword, 10);
    
    // Aktualizace hesla
    await db
      .update(user)
      .set({
        passwordHash: newPasswordHash,
      })
      .where(eq(user.id, validatedData.id));
    
    return { success: true, message: 'Heslo bylo úspěšně změněno' };
  } catch (error) {
    console.error('Chyba při změně hesla:', error);
    return { 
      success: false, 
      message: error instanceof z.ZodError 
        ? 'Neplatná vstupní data' 
        : 'Při změně hesla došlo k chybě' 
    };
  }
} 