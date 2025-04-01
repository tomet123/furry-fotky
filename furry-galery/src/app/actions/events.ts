"use server";

import { db } from "@/db";
import { events } from "@/db/schema/events";
import { organizers } from "@/db/schema/users";
import { user } from "@/db/schema/auth";
import { eq, and, inArray, sql, like, desc, asc, or, SQL } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { photos } from "@/db/schema/photos";
import { photographers } from "@/db/schema/users";
import { count } from "drizzle-orm";

// Typ pro událost
export type Event = {
  id: string;
  name: string;
  organizerId: string;
  organizerName?: string;
  description: string | null;
  location: string;
  date: string;
  imageId: string | null;
  createdAt: Date | null;
  topPhotos: {
    id: string;
    storageId: string;
    photographerId: string;
    photographer: {
      id: string;
      userId: string;
      user: {
        id: string;
        username: string;
        name: string | null;
      };
    };
    likes: number;
  }[];
  photographers: {
    id: string;
    userId: string;
    user: {
      id: string;
      username: string;
      name: string | null;
    };
    photoCount: number;
  }[];
};

// Filtry pro události
export type EventFilters = {
  query?: string;
  location?: string;
  upcoming?: boolean;
  past?: boolean;
  organizerId?: string;
  sortBy?: 'newest' | 'oldest';
  page?: number;
  limit?: number;
};

/**
 * Získá všechny události s možností filtrování a řazení
 */
export async function getEvents({
  query,
  location,
  upcoming = false,
  past = false,
  organizerId,
  sortBy = 'newest',
  page = 1,
  limit = 10
}: EventFilters = {}) {
  try {
    // Připravíme podmínky pro filtrování
    const conditions: SQL<unknown>[] = [];
    
    // Filtrování podle vyhledávacího dotazu (jméno události)
    if (query) {
      conditions.push(like(events.name, `%${query}%`));
    }
    
    // Filtrování podle lokace
    if (location) {
      conditions.push(like(events.location, `%${location}%`));
    }
    
    // Filtrování podle organizátora
    if (organizerId) {
      conditions.push(eq(events.organizerId, organizerId));
    }
    
    // Filtrování podle data (nadcházející/minulé události)
    const currentDate = new Date().toISOString().split('T')[0]; // Formát YYYY-MM-DD
    
    if (upcoming && !past) {
      // Pouze nadcházející události (datum >= dnešní datum)
      conditions.push(sql`date(${events.date}) >= date(${currentDate})`);
    } else if (past && !upcoming) {
      // Pouze minulé události (datum < dnešní datum)
      conditions.push(sql`date(${events.date}) < date(${currentDate})`);
    }
    
    // Počet všech položek pro stránkování
    const totalItemsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(conditions.length > 0 ? and(...conditions) : undefined as any);
    
    const totalItems = totalItemsResult[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);
    
    // Připravení řazení
    const orderBy = sortBy === 'oldest' 
      ? asc(events.date) 
      : desc(events.date);
    
    // Získání událostí s informacemi o organizátorech
    const rawEvents = await db
      .select({
        id: events.id,
        name: events.name,
        organizerId: events.organizerId,
        description: events.description,
        location: events.location,
        date: events.date,
        imageId: events.imageId,
        createdAt: events.createdAt,
      })
      .from(events)
      .where(conditions.length > 0 ? and(...conditions) : undefined as any)
      .orderBy(orderBy)
      .limit(limit)
      .offset((page - 1) * limit);
    
    // Získání informací o organizátorech
    const organizerIds = [...new Set(rawEvents.map(event => event.organizerId))];
    
    const organizersData = organizerIds.length > 0 
      ? await db
        .select({
          id: organizers.id,
          username: user.username,
        })
        .from(organizers)
        .innerJoin(user, eq(organizers.userId, user.id))
        .where(inArray(organizers.id, organizerIds))
      : [];
    
    // Vytvoření map organizátorů pro rychlý lookup
    const organizersMap = new Map();
    organizersData.forEach(organizer => {
      organizersMap.set(organizer.id, organizer.username);
    });
    
    // Sestavení konečných dat událostí
    const eventsWithOrganizers: Event[] = rawEvents.map(event => ({
      id: event.id,
      name: event.name,
      organizerId: event.organizerId,
      organizerName: organizersMap.get(event.organizerId) || 'Neznámý organizátor',
      description: event.description,
      location: event.location,
      date: event.date,
      imageId: event.imageId,
      createdAt: event.createdAt,
      topPhotos: [],
      photographers: [],
    }));
    
    return {
      events: eventsWithOrganizers,
      totalItems,
      totalPages
    };
  } catch (error) {
    console.error('Chyba při načítání událostí:', error);
    throw new Error('Nepodařilo se načíst události');
  }
}

/**
 * Získá detail události podle ID
 */
export async function getEventById(id: string): Promise<Event | null> {
  try {
    const eventData = await db
      .select({
        id: events.id,
        name: events.name,
        organizerId: events.organizerId,
        description: events.description,
        location: events.location,
        date: events.date,
        imageId: events.imageId,
        createdAt: events.createdAt,
      })
      .from(events)
      .where(eq(events.id, id))
      .limit(1);
    
    if (!eventData[0]) {
      return null;
    }
    
    // Získání informací o organizátorovi
    const organizerData = await db
      .select({
        username: user.username,
      })
      .from(organizers)
      .innerJoin(user, eq(organizers.userId, user.id))
      .where(eq(organizers.id, eventData[0].organizerId))
      .limit(1);
    
    // Získání 5 nejvíce lajknutých fotek z akce
    const topPhotos = await db
      .select({
        id: photos.id,
        storageId: photos.storageId,
        photographerId: photos.photographerId,
        photographer: {
          id: photographers.id,
          userId: photographers.userId,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
          },
        },
        likes: photos.likes,
      })
      .from(photos)
      .leftJoin(photographers, eq(photos.photographerId, photographers.id))
      .leftJoin(user, eq(photographers.userId, user.id))
      .where(eq(photos.eventId, id))
      .orderBy(desc(photos.likes))
      .limit(5);

    // Získání unikátních fotografů z akce
    const photographersList = await db
      .select({
        id: photographers.id,
        userId: photographers.userId,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
        },
        photoCount: count(photos.id),
      })
      .from(photos)
      .innerJoin(photographers, eq(photos.photographerId, photographers.id))
      .innerJoin(user, eq(photographers.userId, user.id))
      .where(eq(photos.eventId, id))
      .groupBy(photographers.id)
      .orderBy(desc(count(photos.id)))
      .limit(10);

    return {
      id: eventData[0].id,
      name: eventData[0].name,
      organizerId: eventData[0].organizerId,
      organizerName: organizerData[0]?.username || 'Neznámý organizátor',
      description: eventData[0].description,
      location: eventData[0].location,
      date: eventData[0].date,
      imageId: eventData[0].imageId,
      createdAt: eventData[0].createdAt,
      topPhotos,
      photographers: photographersList,
    };
  } catch (error) {
    console.error('Chyba při načítání detailu události:', error);
    return null;
  }
}

export async function getEventDetail(id: string): Promise<Event | null> {
  try {
    const results = await db
      .select({
        id: events.id,
        name: events.name,
        organizerId: events.organizerId,
        description: events.description,
        location: events.location,
        date: events.date,
        imageId: events.imageId,
        createdAt: events.createdAt,
      })
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (!results.length) {
      return null;
    }

    const event = results[0];
    
    // Získání jména organizátora
    const organizer = await db
      .select({
        userId: organizers.userId,
      })
      .from(organizers)
      .where(eq(organizers.id, event.organizerId))
      .limit(1);

    if (organizer.length > 0) {
      const userData = await db
        .select({
          username: user.username,
        })
        .from(user)
        .where(eq(user.id, organizer[0].userId))
        .limit(1);

      if (userData.length > 0) {
        event.organizerName = userData[0].username;
      }
    }

    // Přidání prázdných polí pro topPhotos a photographers
    return {
      ...event,
      topPhotos: [],
      photographers: [],
    };
  } catch (error) {
    console.error('Chyba při získávání detailu akce:', error);
    return null;
  }
} 