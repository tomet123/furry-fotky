"use server";

import { db } from "@/db";
import { events } from "@/db/schema/events";
import { photographers } from "@/db/schema/users";
import { user } from "@/db/schema/auth";
import { photos, photoLikes, storageProfilePictures } from "@/db/schema";
import { eq, and, inArray, sql, desc, count, asc, SQL } from "drizzle-orm";
import { Event } from "./events";
import { Photographer as BasePhotographer } from "./photographers";

// Export typu Photographer pro použití v TopPhotographersSection
export interface Photographer extends Omit<BasePhotographer, 'stats'> {
  photoCount?: number;
  likesCount?: number;
  eventsCount?: number;
  rank?: number;
  avatarUrl?: string | null;
  name: string;
}

/**
 * Získá nejbližší nadcházející události
 */
export async function getUpcomingEvents(limit: number = 3): Promise<Event[]> {
  try {
    const currentDate = new Date().toISOString().split('T')[0]; // Formát YYYY-MM-DD
    
    // Podmínka pro nadcházející události
    const condition: SQL<unknown> = sql`date(${events.date}) >= date(${currentDate})`;
    
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
      .where(condition)
      .orderBy(asc(events.date)) // Řazení podle nejbližší události
      .limit(limit);
    
    // Získání informací o organizátorech
    const organizerIds = [...new Set(rawEvents.map(event => event.organizerId))];
    
    const organizersData = organizerIds.length > 0 
      ? await db
        .select({
          id: photographers.id,
          username: user.username,
        })
        .from(photographers)
        .innerJoin(user, eq(photographers.userId, user.id))
        .where(inArray(photographers.id, organizerIds))
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
    
    return eventsWithOrganizers;
  } catch (error) {
    console.error('Chyba při načítání nadcházejících událostí:', error);
    return [];
  }
}

/**
 * Získá top fotografy s mixováním podle počtu fotek a lajků
 */
export async function getTopPhotographers(limit: number = 10): Promise<Photographer[]> {
  try {
    // Získání fotografů s počtem fotek
    const photographersWithPhotoCount = await db
      .select({
        id: photographers.id,
        userId: photographers.userId,
        username: user.username,
        bio: photographers.bio,
        description: photographers.description,
        isBeginner: photographers.isBeginner,
        photoCount: count(photos.id).as('photoCount'), // Explicitní pojmenování alias sloupce
      })
      .from(photographers)
      .innerJoin(user, eq(photographers.userId, user.id))
      .leftJoin(photos, eq(photos.photographerId, photographers.id))
      .groupBy(photographers.id, user.id, user.username)
      .orderBy(desc(count(photos.id).as('photoCount'))) // Použití funkce count přímo v orderBy
      .limit(limit * 2); // Získáme 2x více fotografů pro mixování
    
    // Získání ID fotografů pro další dotazy
    const photographerIds = photographersWithPhotoCount.map(p => p.id);
    const userIds = photographersWithPhotoCount.map(p => p.userId);
    
    // Pokud nemáme žádné fotografy, vrátíme prázdné pole
    if (photographerIds.length === 0) {
      return [];
    }
    
    // Získání počtu lajků pro fotografy
    const likesCountsResult = await db
      .select({
        photographerId: photos.photographerId,
        likeCount: count().as('likeCount'), // Explicitní alias pro počet lajků
      })
      .from(photoLikes)
      .innerJoin(photos, eq(photoLikes.photoId, photos.id))
      .where(inArray(photos.photographerId, photographerIds))
      .groupBy(photos.photographerId);
    
    // Mapa počtu lajků pro rychlý lookup
    const likesCountMap = new Map();
    likesCountsResult.forEach(item => {
      likesCountMap.set(item.photographerId, item.likeCount);
    });
    
    // Počet akcí, na kterých má fotograf fotky
    const eventsCountsResult = await db
      .select({
        photographerId: photos.photographerId,
        eventCount: count(sql`DISTINCT ${photos.eventId}`).as('eventCount'), // Explicitní alias
      })
      .from(photos)
      .where(and(
        inArray(photos.photographerId, photographerIds),
        sql`${photos.eventId} IS NOT NULL`
      ))
      .groupBy(photos.photographerId);
    
    // Mapa počtu akcí pro rychlý lookup
    const eventsCountMap = new Map();
    eventsCountsResult.forEach(item => {
      eventsCountMap.set(item.photographerId, item.eventCount);
    });

    // Získání URL profilových obrázků uživatelů
    const avatarsResult = await db
      .select({
        userId: storageProfilePictures.userId,
        avatarId: storageProfilePictures.id,
      })
      .from(storageProfilePictures)
      .where(inArray(storageProfilePictures.userId, userIds));

    // Mapa avatarů pro rychlý lookup
    const avatarsMap = new Map();
    avatarsResult.forEach(item => {
      if (item.userId) {
        avatarsMap.set(item.userId, `/api/profile-pictures/${item.userId}`);
      }
    });
    
    // Sestavení fotografů s jejich statistikami
    const photographersWithStats = photographersWithPhotoCount.map(p => ({
      id: p.id,
      userId: p.userId,
      username: p.username,
      bio: p.bio,
      description: p.description,
      isBeginner: !!p.isBeginner,
      avatarUrl: avatarsMap.get(p.userId) || null,
      stats: {
        photos: Number(p.photoCount) || 0, // Zajištění, že hodnota je číslo
        likes: likesCountMap.get(p.id) || 0,
        events: eventsCountMap.get(p.id) || 0,
      },
      // Kombinované skóre pro mixování (50% fotky, 50% lajky)
      mixScore: ((Number(p.photoCount) || 0) * 0.5) + ((likesCountMap.get(p.id) || 0) * 0.5)
    }));
    
    // Řazení podle kombinovaného skóre
    photographersWithStats.sort((a, b) => b.mixScore - a.mixScore);
    
    // Vybere část podle fotek a část podle lajků a smíchá je
    const byPhotos = [...photographersWithStats].sort((a, b) => b.stats.photos - a.stats.photos).slice(0, limit / 2);
    const byLikes = [...photographersWithStats]
      .sort((a, b) => b.stats.likes - a.stats.likes)
      .filter(p => !byPhotos.some(ph => ph.id === p.id)) // Odstraní duplicity
      .slice(0, limit / 2);
    
    // Smíchání výsledků a omezení na požadovaný počet
    const mixedPhotographers = [...byPhotos, ...byLikes].slice(0, limit);
    
    // Transformujeme data do formátu, který očekává naše komponenta
    return mixedPhotographers.map(p => ({
      id: p.id,
      userId: p.userId,
      username: p.username,
      name: p.username, // Pro použití v UI
      bio: p.bio,
      description: p.description,
      isBeginner: p.isBeginner,
      photoCount: p.stats.photos,
      likesCount: p.stats.likes,
      eventsCount: p.stats.events,
      avatarUrl: p.avatarUrl // Použijeme URL avataru získanou z dotazu
    }));
  } catch (error) {
    console.error('Chyba při načítání top fotografů:', error);
    return [];
  }
} 