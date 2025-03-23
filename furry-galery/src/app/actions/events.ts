"use server";

import { db } from "@/db";
import { events } from "@/db/schema/events";
import { organizers } from "@/db/schema/users";
import { user } from "@/db/schema/auth";
import { eq, and, inArray, sql, like, desc, asc, or, SQL } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Typ pro událost
export type Event = {
  id: string;
  name: string;
  organizerId: string;
  organizerName: string;
  description: string | null;
  location: string;
  date: string;
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
    
    return {
      id: eventData[0].id,
      name: eventData[0].name,
      organizerId: eventData[0].organizerId,
      organizerName: organizerData[0]?.username || 'Neznámý organizátor',
      description: eventData[0].description,
      location: eventData[0].location,
      date: eventData[0].date,
    };
  } catch (error) {
    console.error('Chyba při načítání detailu události:', error);
    return null;
  }
} 