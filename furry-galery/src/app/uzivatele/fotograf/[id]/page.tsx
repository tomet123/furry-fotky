import { notFound } from 'next/navigation';
import { getPhotographerProfile } from '@/app/actions/photographers';
import { db } from '@/db';
import { user } from '@/db/schema/auth';
import { eq } from 'drizzle-orm';
import PhotographerDetailClient from './client';

export const metadata = {
  title: 'Detail fotografa | FurryFotky.cz',
  description: 'Profil fotografa a jeho galerie na FurryFotky.cz',
};

/**
 * Stránka detailu fotografa - načte data fotografa ze serveru a předá je klientské komponentě
 */
export default async function PhotographerDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  
  if (!id) {
    return notFound();
  }
  
  // Načtení profilu fotografa
  const photographerData = await getPhotographerProfile(id);
  
  if (!photographerData) {
    return notFound();
  }
  
  // Načtení uživatelských dat fotografa (username, atd.)
  let userData = null;
  if (photographerData.userId) {
    const users = await db
      .select({
        id: user.id,
        username: user.username,
        name: user.name,
      })
      .from(user)
      .where(eq(user.id, photographerData.userId))
      .limit(1);
      
    if (users.length > 0) {
      userData = users[0];
    }
  }
  
  // Spojení dat fotografa a uživatele
  const photographerWithUser = {
    ...photographerData,
    user: userData,
  };
  
  return (
    <>
      <PhotographerDetailClient photographer={photographerWithUser} />
    </>
  );
} 