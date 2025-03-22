"use server";

import { db } from "@/db";
import { photos, users, events, photoTags, tags as tagsTable } from "@/db/schema";
import { inArray, eq, sql, desc, asc, like } from "drizzle-orm";

/**
 * Načte fotografy z databáze s možností filtrování podle jména
 */
export async function getPhotographers(search: string = '', limit: number = 10) {
  try {
    // Nejprve získáme všechny unikátní photographerId z fotogalerie
    const photoResults = await db
      .select({ photographerId: photos.photographerId })
      .from(photos)
      .groupBy(photos.photographerId);
    
    const photographerIds = photoResults.map(result => result.photographerId);
    
    // Pokud nejsou žádní fotografové, vrátíme prázdné pole
    if (!photographerIds.length) {
      return [];
    }

    // Připravíme podmínku pro vyhledávání podle jména
    const searchCondition = search 
      ? sql`AND LOWER(${users.username}) LIKE ${`%${search.toLowerCase()}%`}` 
      : sql``;

    // Získáme uživatelská jména fotografů 
    const photographers = await db
      .select({
        id: users.id,
        username: users.username,
      })
      .from(users)
      .where(
        sql`EXISTS (
          SELECT 1 FROM photographers 
          WHERE photographers.user_id = ${users.id} 
          AND photographers.id IN (${photographerIds.join(',')})
          ${searchCondition}
        )`
      )
      .limit(limit);
    
    // Vrátíme pouze uživatelská jména jako pole stringů
    return photographers.map(photographer => photographer.username || 'Neznámý fotograf');
  } catch (error) {
    console.error('Chyba při načítání fotografů:', error);
    return [];
  }
}

/**
 * Načte události z databáze s možností filtrování podle názvu
 */
export async function getEvents(search: string = '', limit: number = 10) {
  try {
    // Nejprve získáme všechny unikátní eventId z fotogalerie
    const photoResults = await db
      .select({ eventId: photos.eventId })
      .from(photos)
      .where(sql`${photos.eventId} IS NOT NULL`)
      .groupBy(photos.eventId);
    
    const eventIds = photoResults.map(result => result.eventId).filter(Boolean) as string[];
    
    // Pokud nejsou žádné akce, vrátíme prázdné pole
    if (!eventIds.length) {
      return [];
    }

    // Získáme názvy akcí s filtrováním podle vyhledávání
    const eventsData = await db
      .select({
        id: events.id,
        name: events.name,
      })
      .from(events)
      .where(
        search 
          ? sql`${events.id} IN (${eventIds.join(',')}) AND LOWER(${events.name}) LIKE ${`%${search.toLowerCase()}%`}`
          : sql`${events.id} IN (${eventIds.join(',')})`
      )
      .limit(limit);
    
    // Vrátíme pouze názvy akcí jako pole stringů
    return eventsData.map(event => event.name);
  } catch (error) {
    console.error('Chyba při načítání akcí:', error);
    return [];
  }
}

/**
 * Načte tagy z databáze s možností filtrování podle názvu
 */
export async function getTags(search: string = '', limit: number = 10) {
  try {
    // Nejprve získáme všechny tagId, které jsou použity u fotografií
    const photoTagResults = await db
      .select({ tagId: photoTags.tagId })
      .from(photoTags)
      .groupBy(photoTags.tagId);
    
    const tagIds = photoTagResults.map(result => result.tagId);
    
    // Pokud nejsou žádné tagy, vrátíme prázdné pole
    if (!tagIds.length) {
      return [];
    }

    // Získáme názvy tagů s filtrováním podle vyhledávání
    const tagsData = await db
      .select({
        id: tagsTable.id,
        name: tagsTable.name,
      })
      .from(tagsTable)
      .where(
        search
          ? sql`${tagsTable.id} IN (${tagIds.join(',')}) AND LOWER(${tagsTable.name}) LIKE ${`%${search.toLowerCase()}%`}`
          : sql`${tagsTable.id} IN (${tagIds.join(',')})`
      )
      .limit(limit);
    
    // Vrátíme pouze názvy tagů jako pole stringů
    return tagsData.map(tag => tag.name);
  } catch (error) {
    console.error('Chyba při načítání tagů:', error);
    return [];
  }
} 