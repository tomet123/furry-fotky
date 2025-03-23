"use server";

import { db } from "@/db";
import { photos, photoTags, tags as tagsTable } from "@/db/schema";
import { user } from "@/db/schema/auth";
import { events } from "@/db/schema/events";
import { photographers as photographersTable } from "@/db/schema/users";
import { sql, eq, and, like, isNotNull, count, asc, desc } from "drizzle-orm";

type Photographer = {
  id: string;
  userId: string;
  username: string | null;
};

type Event = {
  id: string;
  name: string;
};

type Tag = {
  id: string;
  name: string;
};

async function dumpTableCounts() {
  try {
    // Získání počtu záznamů v jednotlivých tabulkách pro diagnostiku
    const [
      userCount,
      photographerCount,
      eventsCount,
      tagsCount,
      photosCount,
      photoTagsCount
    ] = await Promise.all([
      db.select({ count: count() }).from(user),
      db.select({ count: count() }).from(photographersTable),
      db.select({ count: count() }).from(events),
      db.select({ count: count() }).from(tagsTable),
      db.select({ count: count() }).from(photos),
      db.select({ count: count() }).from(photoTags)
    ]);

    console.log('Diagnostika - počty záznamů v tabulkách:');
    console.log('- Uživatelé:', userCount[0]?.count || 0);
    console.log('- Fotografové:', photographerCount[0]?.count || 0);
    console.log('- Události:', eventsCount[0]?.count || 0);
    console.log('- Tagy:', tagsCount[0]?.count || 0);
    console.log('- Fotografie:', photosCount[0]?.count || 0);
    console.log('- Propojení foto-tagy:', photoTagsCount[0]?.count || 0);
  } catch (error) {
    console.error('Chyba při získávání diagnostických dat:', error);
  }
}

/**
 * Načte fotografy z databáze s možností filtrování podle jména
 * Vrací až 10 fotografů s nejvyšším počtem fotografií
 */
export async function getPhotographers(search: string = '', limit: number = 10) {
  try {
    console.log('getPhotographers - start');
    
    // Získání diagnostických dat
    await dumpTableCounts();
    
    // Získáme všechny fotografy s počtem jejich fotografií a seřadíme podle počtu fotografií (sestupně)
    const result = await db
      .select({
        id: photographersTable.id,
        userId: photographersTable.userId,
        username: user.username,
        photoCount: sql<number>`count(${photos.id})`.as('photoCount')
      })
      .from(photographersTable)
      .leftJoin(user, eq(photographersTable.userId, user.id))
      .leftJoin(photos, eq(photos.photographerId, photographersTable.id))
      .where(search 
        ? like(sql`lower(coalesce(${user.username}, ''))`, `%${search.toLowerCase()}%`) 
        : undefined)
      .groupBy(photographersTable.id, user.username)
      .orderBy(desc(sql`photoCount`), asc(user.username))
      .limit(limit);
    
    console.log(`getPhotographers - found ${result.length} photographers`);
    if (result.length > 0) {
      console.log('První fotograf:', result[0]);
    }
    
    // Filtrujeme prázdné hodnoty a vrátíme uživatelská jména jako pole stringů
    const photographers = result
      .filter(photographer => photographer.username !== null && photographer.username !== undefined)
      .map(photographer => photographer.username || 'Neznámý fotograf');
    
    return photographers.length > 0 ? photographers : ['Neznámý fotograf'];
  } catch (error) {
    console.error('Chyba při načítání fotografů:', error);
    return ['Neznámý fotograf'];
  }
}

/**
 * Načte události z databáze s možností filtrování podle názvu
 * Vrací nejnovější události seřazené podle data konání
 */
export async function getEvents(search: string = '', limit: number = 10) {
  try {
    console.log('getEvents - start');
    
    // Nejprve zkusíme získat samotné události bez joinů
    const eventsData = await db
      .select({
        id: events.id,
        name: events.name,
        date: events.date
      })
      .from(events)
      .limit(10);
    
    console.log('Diagnostika - události bez joinů:', eventsData.length > 0 ? 'Nalezeno' : 'Nenalezeno');
    if (eventsData.length > 0) {
      console.log('První událost:', eventsData[0]);
    }
    
    // Získáme všechny události a seřadíme je podle data (nejnovější první)
    const result = await db
      .select({
        id: events.id,
        name: events.name,
        date: events.date
      })
      .from(events)
      .leftJoin(photos, eq(photos.eventId, events.id))
      .where(search 
        ? like(sql`lower(${events.name})`, `%${search.toLowerCase()}%`) 
        : undefined)
      .groupBy(events.id, events.name, events.date)
      .orderBy(desc(events.date), asc(events.name))
      .limit(limit);
    
    console.log(`getEvents - found ${result.length} events`);
    
    // Vrátíme pouze názvy akcí jako pole stringů
    const eventNames = result.map(event => event.name);
    return eventNames.length > 0 ? eventNames : ['Žádné události'];
  } catch (error) {
    console.error('Chyba při načítání akcí:', error);
    return ['Žádné události'];
  }
}

/**
 * Načte tagy z databáze s možností filtrování podle názvu
 */
export async function getTags(search: string = '', limit: number = 30) {
  try {
    console.log('getTags - start');
    
    // Nejprve zkusíme získat samotné tagy bez joinů
    const tagsData = await db
      .select({
        id: tagsTable.id,
        name: tagsTable.name,
      })
      .from(tagsTable)
      .limit(10);
    
    console.log('Diagnostika - tagy bez joinů:', tagsData.length > 0 ? 'Nalezeno' : 'Nenalezeno');
    if (tagsData.length > 0) {
      console.log('První tag:', tagsData[0]);
    }
    
    // Získáme všechny tagy s počtem jejich použití a seřadíme podle popularity
    const result = await db
      .select({
        id: tagsTable.id,
        name: tagsTable.name,
        usage: sql<number>`count(${photoTags.tagId})`.as('usage')
      })
      .from(tagsTable)
      .leftJoin(photoTags, eq(photoTags.tagId, tagsTable.id))
      .where(search 
        ? like(sql`lower(${tagsTable.name})`, `%${search.toLowerCase()}%`) 
        : undefined)
      .groupBy(tagsTable.id, tagsTable.name)
      .orderBy(desc(sql`usage`), asc(tagsTable.name))
      .limit(limit);
    
    console.log(`getTags - found ${result.length} tags`);
    
    // Filtrujeme prázdné hodnoty a vrátíme názvy tagů jako pole stringů
    const tagNames = result
      .filter(tag => tag.name !== null && tag.name !== undefined)
      .map(tag => tag.name);
    
    return tagNames.length > 0 ? tagNames : ['Žádné tagy'];
  } catch (error) {
    console.error('Chyba při načítání tagů:', error);
    return ['Žádné tagy'];
  }
} 