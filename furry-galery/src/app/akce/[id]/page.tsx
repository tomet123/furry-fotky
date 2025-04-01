import { notFound } from 'next/navigation';
import { getEventById } from '@/app/actions/events';
import EventDetailClient from './client';
import { db } from '@/db';
import { organizers } from '@/db/schema/users';
import { user } from '@/db/schema/auth';
import { eq } from 'drizzle-orm';

// Metadata pro stránku
export const metadata = {
  title: 'Detail akce | FurryFotky.cz',
  description: 'Detail akce a její fotografie na FurryFotky.cz',
};

/**
 * Stránka detailu akce - načte data akce ze serveru a předá je klientské komponentě
 */
export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Kontrola, zda máme ID
  if (!params?.id) {
    notFound();
  }
  
  // Získání detailu události
  const event = await getEventById(params.id);
  
  // Pokud událost neexistuje, vrátíme 404
  if (!event) {
    notFound();
  }

  // Načtení uživatelských dat organizátora
  let organizerData = null;
  if (event.organizerId) {
    const organizerResult = await db
      .select({
        id: organizers.id,
        userId: organizers.userId,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
        },
      })
      .from(organizers)
      .innerJoin(user, eq(user.id, organizers.userId))
      .where(eq(organizers.id, event.organizerId))
      .limit(1);

    if (organizerResult[0]) {
      organizerData = organizerResult[0];
    }
  }
  
  // Spojení dat akce a organizátora
  const eventWithOrganizer = {
    ...event,
    organizer: organizerData,
  };
  
  // Vrátíme klientskou komponentu s daty události
  return <EventDetailClient event={eventWithOrganizer} />;
} 