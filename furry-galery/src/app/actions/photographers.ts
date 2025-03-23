"use server";

import { db } from "@/db";
import { photographers, organizers } from "@/db/schema/users";
import { user } from "@/db/schema/auth";
import { photos, photoLikes } from "@/db/schema";
import { events } from "@/db/schema/events";
import { eq, and, inArray, sql, like, desc, asc, or, count, SQL } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Typ pro fotografa s jeho statistikami
export type Photographer = {
  id: string;
  userId: string;
  username: string;
  bio: string | null;
  description: string | null;
  isBeginner: boolean;
  isOrganizer?: boolean; // Přidán příznak pro organizátora
  stats: {
    photos: number;
    likes: number;
    events: number;
  };
};

// Filtry pro fotografy
export type PhotographerFilters = {
  query?: string;
  isBeginner?: boolean;
  sortBy?: 'username' | 'photos' | 'likes';
  page?: number;
  limit?: number;
  userType?: 'all' | 'photographers' | 'organizers';
};

export interface PhotographersResponse {
  photographers: Photographer[];
  totalPages: number;
  totalItems: number;
}

/**
 * Získá všechny fotografy s jejich statistikami
 */
export async function getPhotographers({
  query,
  isBeginner,
  sortBy = 'username',
  page = 1,
  limit = 10,
  userType = 'photographers'
}: PhotographerFilters = {}): Promise<PhotographersResponse> {
  try {
    // Připravíme podmínky pro filtrování
    const conditions: SQL<unknown>[] = [];
    
    // Filtrování podle vyhledávacího dotazu (username, bio, description)
    if (query) {
      conditions.push(
        or(
          like(user.username, `%${query}%`),
          like(photographers.bio ?? '', `%${query}%`),
          like(photographers.description ?? '', `%${query}%`)
        )
      );
    }
    
    // Filtrování podle úrovně (začátečník)
    if (isBeginner !== undefined && userType !== 'organizers') {
      conditions.push(eq(photographers.isBeginner, isBeginner));
    }
    
    // Získáme fotografy, organizátory nebo obojí podle požadovaného typu
    let results: any[] = [];
    let totalItems = 0;
    let totalPages = 0;
    let totalPhotographers = 0;
    
    // Získání fotografů
    if (userType === 'photographers' || userType === 'all') {
      // Počet všech položek pro stránkování - pouze fotografové
      const totalPhotographersResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(photographers)
        .innerJoin(user, eq(photographers.userId, user.id))
        .where(conditions.length > 0 ? and(...conditions) : sql`1=1`);
      
      totalPhotographers = totalPhotographersResult[0]?.count || 0;
      
      // Získání fotografů
      const photographersResult = await db
        .select({
          id: photographers.id,
          userId: photographers.userId,
          username: user.username,
          bio: photographers.bio,
          description: photographers.description,
          isBeginner: photographers.isBeginner,
        })
        .from(photographers)
        .innerJoin(user, eq(photographers.userId, user.id))
        .where(conditions.length > 0 ? and(...conditions) : sql`1=1`)
        .orderBy(sortBy === 'username' ? asc(user.username) : asc(photographers.id))
        .limit(userType === 'all' ? Math.ceil(limit/2) : limit)
        .offset((page - 1) * (userType === 'all' ? Math.ceil(limit/2) : limit));
      
      results = [...photographersResult];
      totalItems = totalPhotographers;
    }
    
    // Získání organizátorů
    if (userType === 'organizers' || userType === 'all') {
      // Podmínky pro organizátory
      const organizerConditions: SQL<unknown>[] = [];
      if (query) {
        organizerConditions.push(
          or(
            like(user.username, `%${query}%`),
            like(organizers.bio ?? '', `%${query}%`)
          )
        );
      }
      
      // Počet všech organizátorů pro stránkování
      const totalOrganizersResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(organizers)
        .innerJoin(user, eq(organizers.userId, user.id))
        .where(organizerConditions.length > 0 ? and(...organizerConditions) : sql`1=1`);
      
      const totalOrganizers = totalOrganizersResult[0]?.count || 0;
      
      // Získání organizátorů
      const organizersResult = await db
        .select({
          id: organizers.id,
          userId: organizers.userId,
          username: user.username,
          bio: organizers.bio,
          description: sql<string | null>`null`,
          isBeginner: sql<boolean>`false`,
        })
        .from(organizers)
        .innerJoin(user, eq(organizers.userId, user.id))
        .where(organizerConditions.length > 0 ? and(...organizerConditions) : sql`1=1`)
        .orderBy(sortBy === 'username' ? asc(user.username) : asc(organizers.id))
        .limit(userType === 'all' ? Math.ceil(limit/2) : limit)
        .offset((page - 1) * (userType === 'all' ? Math.ceil(limit/2) : limit));
      
      // Přidáme organizátory do výsledků
      results = [...results, ...organizersResult];
      
      // Aktualizujeme celkový počet položek
      if (userType === 'organizers') {
        totalItems = totalOrganizers;
      } else if (userType === 'all') {
        totalItems = totalPhotographers + totalOrganizers;
      }
    }
    
    // Výpočet celkového počtu stránek
    totalPages = Math.ceil(totalItems / limit);
    
    // Získání statistik pro každého fotografa
    const photographerIds = results
      .filter(result => result.id.startsWith('photographer_'))
      .map(result => result.id);
    
    // Získání ID organizátorů
    const organizerIds = results
      .filter(result => result.id.startsWith('organizer_'))
      .map(result => result.id);
    
    // Počet fotek pro každého fotografa
    const photoCountsResult = photographerIds.length > 0 
      ? await db
        .select({
          photographerId: photos.photographerId,
          count: count(photos.id),
        })
        .from(photos)
        .where(inArray(photos.photographerId, photographerIds))
        .groupBy(photos.photographerId)
      : [];
    
    // Počet lajků pro každého fotografa
    const likesCountsResult = photographerIds.length > 0 
      ? await db
        .select({
          photographerId: photos.photographerId,
          count: count(),
        })
        .from(photoLikes)
        .innerJoin(photos, eq(photoLikes.photoId, photos.id))
        .where(inArray(photos.photographerId, photographerIds))
        .groupBy(photos.photographerId)
      : [];
    
    // Počet akcí, na kterých má fotograf fotky
    const eventsCountsResult = photographerIds.length > 0 
      ? await db
        .select({
          photographerId: photos.photographerId,
          count: count(sql`DISTINCT ${photos.eventId}`),
        })
        .from(photos)
        .where(and(
          inArray(photos.photographerId, photographerIds),
          sql`${photos.eventId} IS NOT NULL`
        ))
        .groupBy(photos.photographerId)
      : [];
    
    // Vytvoření map pro rychlý lookup
    const photoCountsMap = new Map();
    photoCountsResult.forEach(item => {
      photoCountsMap.set(item.photographerId, item.count);
    });
    
    const likesCountsMap = new Map();
    likesCountsResult.forEach(item => {
      likesCountsMap.set(item.photographerId, item.count);
    });
    
    const eventsCountsMap = new Map();
    eventsCountsResult.forEach(item => {
      eventsCountsMap.set(item.photographerId, item.count);
    });
    
    // Sestavení konečného seznamu uživatelů s jejich statistikami
    const photographersWithStats: Photographer[] = results.map(result => ({
      id: result.id,
      userId: result.userId,
      username: result.username,
      bio: result.bio,
      description: result.description,
      isBeginner: !!result.isBeginner,
      isOrganizer: result.id.startsWith('organizer_'),
      stats: {
        photos: result.id.startsWith('photographer_') ? photoCountsMap.get(result.id) || 0 : 0,
        likes: result.id.startsWith('photographer_') ? likesCountsMap.get(result.id) || 0 : 0,
        events: result.id.startsWith('photographer_') ? eventsCountsMap.get(result.id) || 0 : 0,
      }
    }));
    
    // Řazení podle počtu fotek nebo lajků, pokud je požadováno
    if (sortBy === 'photos') {
      photographersWithStats.sort((a, b) => b.stats.photos - a.stats.photos);
    } else if (sortBy === 'likes') {
      photographersWithStats.sort((a, b) => b.stats.likes - a.stats.likes);
    }
    
    return {
      photographers: photographersWithStats,
      totalItems,
      totalPages
    };
  } catch (error) {
    console.error('Chyba při načítání uživatelů:', error);
    throw new Error('Nepodařilo se načíst uživatele');
  }
}

/**
 * Získá detail fotografa podle ID
 */
export async function getPhotographerById(id: string): Promise<Photographer | null> {
  try {
    const photographerData = await db
      .select({
        id: photographers.id,
        userId: photographers.userId,
        username: user.username,
        bio: photographers.bio,
        description: photographers.description,
        isBeginner: photographers.isBeginner,
      })
      .from(photographers)
      .innerJoin(user, eq(photographers.userId, user.id))
      .where(eq(photographers.id, id))
      .limit(1);
    
    if (!photographerData[0]) {
      return null;
    }
    
    // Počet fotek
    const photoCount = await db
      .select({
        count: count(photos.id),
      })
      .from(photos)
      .where(eq(photos.photographerId, id));
    
    // Počet lajků
    const likesCount = await db
      .select({
        count: count(),
      })
      .from(photoLikes)
      .innerJoin(photos, eq(photoLikes.photoId, photos.id))
      .where(eq(photos.photographerId, id));
    
    // Počet akcí
    const eventsCount = await db
      .select({
        count: count(sql`DISTINCT ${photos.eventId}`),
      })
      .from(photos)
      .where(and(
        eq(photos.photographerId, id),
        sql`${photos.eventId} IS NOT NULL`
      ));
    
    return {
      id: photographerData[0].id,
      userId: photographerData[0].userId,
      username: photographerData[0].username,
      bio: photographerData[0].bio,
      description: photographerData[0].description,
      isBeginner: !!photographerData[0].isBeginner,
      stats: {
        photos: photoCount[0]?.count || 0,
        likes: likesCount[0]?.count || 0,
        events: eventsCount[0]?.count || 0,
      }
    };
  } catch (error) {
    console.error('Chyba při načítání detailu fotografa:', error);
    return null;
  }
} 