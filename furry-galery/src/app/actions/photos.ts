"use server";

import { db } from "@/db";
import { photos, photoTags, storagePhotos, photoLikes } from "@/db/schema";
import { photographers } from "@/db/schema/users";
import { user } from "@/db/schema/auth";
import { events, tags } from "@/db/schema/events";
import { eq, and, inArray, sql, like, desc, asc, or, SQL } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Typy pro práci s fotografiemi
export type Photo = {
  id: string;
  photographerId: string;
  photographer: string;
  avatarUrl?: string;
  eventId?: string;
  event?: string;
  storageId: string;
  thumbnailUrl: string;
  imageUrl: string;
  likes: number;
  date: string;
  tags: string[];
  isLikedByCurrentUser?: boolean;
};

// Typy pro filtrování fotografií
export type PhotoFilters = {
  query?: string;
  event?: string;
  photographer?: string;
  tags?: string[];
  sortBy?: 'newest' | 'oldest' | 'most_liked';
  page?: number;
  limit?: number;
  onlyLiked?: boolean;
  userId?: string; // ID aktuálního uživatele pro filtrování oblíbených fotek
};

/**
 * Získá všechny fotografie s možností filtrování a řazení
 */
export async function getPhotos({
  query,
  event,
  photographer,
  tags: filterTags,
  sortBy = 'newest',
  page = 1,
  limit = 12,
  onlyLiked = false,
  userId
}: PhotoFilters = {}) {
  try {
    // Připravíme podmínky pro filtrování
    const conditions: SQL<unknown>[] = [];

    // Filtrování pouze oblíbených fotografií
    if (onlyLiked && userId) {
      // Najdeme ID fotografií, které uživatel označil jako oblíbené
      const likedPhotos = await db
        .select({
          photoId: photoLikes.photoId,
        })
        .from(photoLikes)
        .where(eq(photoLikes.userId, userId));
      
      if (likedPhotos.length > 0) {
        const likedPhotoIds = likedPhotos.map(p => p.photoId);
        conditions.push(inArray(photos.id, likedPhotoIds));
      } else {
        // Pokud uživatel nemá žádné oblíbené fotografie, vrátíme prázdný výsledek
        return {
          photos: [],
          totalItems: 0,
          totalPages: 0
        };
      }
    }

    // Filtrování podle fotografa
    if (photographer) {
      // Nejprve najdeme ID fotografů, kteří mají zadané jméno
      const photographersWithName = await db
        .select({
          id: photographers.id,
          userId: photographers.userId,
        })
        .from(photographers)
        .innerJoin(user, eq(photographers.userId, user.id))
        .where(like(user.username, `%${photographer}%`));
      
      if (photographersWithName.length > 0) {
        const photographerIds = photographersWithName.map(p => p.id);
        conditions.push(inArray(photos.photographerId, photographerIds));
      } else {
        // Pokud nebyl nalezen žádný fotograf s tímto jménem, vrátíme prázdný výsledek
        return {
          photos: [],
          totalItems: 0,
          totalPages: 0
        };
      }
    }
    
    // Filtrování podle události
    if (event) {
      const eventsWithName = await db
        .select({
          id: events.id,
        })
        .from(events)
        .where(like(events.name, `%${event}%`));
      
      if (eventsWithName.length > 0) {
        const eventIds = eventsWithName.map(e => e.id);
        conditions.push(inArray(photos.eventId, eventIds));
      } else {
        // Pokud nebyla nalezena žádná událost s tímto jménem, vrátíme prázdný výsledek
        return {
          photos: [],
          totalItems: 0,
          totalPages: 0
        };
      }
    }
    
    // Filtrování podle tagů
    if (filterTags && filterTags.length > 0) {
      // Najdeme ID tagů, které odpovídají hledaným názvům
      const tagsWithNames = await db
        .select({
          id: tags.id,
        })
        .from(tags)
        .where(inArray(tags.name, filterTags));
      
      if (tagsWithNames.length > 0) {
        const tagIds = tagsWithNames.map(t => t.id);
        
        // Najdeme ID fotografií, které mají alespoň jeden z hledaných tagů
        const photosWithTags = await db
          .select({
            photoId: photoTags.photoId,
          })
          .from(photoTags)
          .where(inArray(photoTags.tagId, tagIds));
        
        if (photosWithTags.length > 0) {
          const photoIdsWithTags = [...new Set(photosWithTags.map(p => p.photoId))];
          conditions.push(inArray(photos.id, photoIdsWithTags));
        } else {
          // Pokud nebyly nalezeny žádné fotografie s těmito tagy, vrátíme prázdný výsledek
          return {
            photos: [],
            totalItems: 0,
            totalPages: 0
          };
        }
      } else {
        // Pokud nebyly nalezeny žádné tagy s těmito názvy, vrátíme prázdný výsledek
        return {
          photos: [],
          totalItems: 0,
          totalPages: 0
        };
      }
    }
    
    // Sestavení WHERE podmínky pro filtrování
    const whereClause = conditions.length === 0 
      ? undefined 
      : conditions.length === 1 
        ? conditions[0] 
        : and(...conditions);
    
    // Získání celkového počtu fotografií s použitím filtru
    const countQuery = db.select({
      count: sql<number>`count(*)`,
    }).from(photos);
    
    if (whereClause) {
      countQuery.where(whereClause);
    }
    
    const countResult = await countQuery;
    const total = countResult[0]?.count || 0;
    
    // Základní dotaz pro fotografie
    const photosQuery = db.select({
      id: photos.id,
      photographerId: photos.photographerId,
      storageId: photos.storageId,
      eventId: photos.eventId,
      likes: photos.likes,
      date: photos.date,
    }).from(photos);
    
    // Přidání filtrů, pokud existují
    if (whereClause) {
      photosQuery.where(whereClause);
    }
    
    // Řazení podle zadaného parametru
    if (sortBy === 'newest') {
      photosQuery.orderBy(desc(photos.date));
    } else if (sortBy === 'oldest') {
      photosQuery.orderBy(asc(photos.date));
    } else if (sortBy === 'most_liked') {
      photosQuery.orderBy(desc(photos.likes));
    }
    
    // Přidání stránkování
    const offset = (page - 1) * limit;
    photosQuery.limit(limit).offset(offset);
    
    // Provedení dotazu
    const photoResults = await photosQuery;
    
    // Pokud nemáme žádné výsledky, vrátíme prázdné pole
    if (photoResults.length === 0) {
      return {
        photos: [],
        totalItems: total,
        totalPages: Math.ceil(total / limit)
      };
    }
    
    // Získání ID fotografií pro další dotazy
    const photoIds = photoResults.map(p => p.id);
    const photographerIds = photoResults.map(p => p.photographerId);
    const eventIds = photoResults.filter(p => p.eventId).map(p => p.eventId!);
    
    // Získání informací o fotografech
    const photographersData = await db
      .select({
        id: photographers.id,
        userId: photographers.userId,
      })
      .from(photographers)
      .where(inArray(photographers.id, photographerIds));
    
    // Získání jmen fotografů
    const userIds = photographersData.map(p => p.userId);
    const usersData = await db
      .select({
        id: user.id,
        username: user.username,
      })
      .from(user)
      .where(inArray(user.id, userIds));
    
    // Získání názvů událostí
    const eventsData = eventIds.length > 0 
      ? await db
          .select({
            id: events.id,
            name: events.name,
          })
          .from(events)
          .where(inArray(events.id, eventIds))
      : [];
    
    // Získání tagů pro fotografie
    const photoTagsData = await db
      .select({
        photoId: photoTags.photoId,
        tagId: photoTags.tagId,
      })
      .from(photoTags)
      .where(inArray(photoTags.photoId, photoIds));
    
    const tagIds = photoTagsData.map(pt => pt.tagId);
    const tagsData = tagIds.length > 0
      ? await db
          .select({
            id: tags.id,
            name: tags.name,
          })
          .from(tags)
          .where(inArray(tags.id, tagIds))
      : [];
    
    // Vytvoření mapování mezi ID a objekty
    const photographerMap = new Map(photographersData.map(p => [p.id, p]));
    const userMap = new Map(usersData.map(u => [u.id, u]));
    const eventMap = new Map(eventsData.map(e => [e.id, e]));
    const tagMap = new Map(tagsData.map(t => [t.id, t]));
    
    // Vytvoření mapování tagů pro fotografie
    const photoTagsMap: Record<string, string[]> = {};
    for (const pt of photoTagsData) {
      if (!photoTagsMap[pt.photoId]) {
        photoTagsMap[pt.photoId] = [];
      }
      const tag = tagMap.get(pt.tagId);
      if (tag) {
        photoTagsMap[pt.photoId].push(tag.name);
      }
    }
    
    // Vytvoření kompletních objektů fotografií
    const resultPhotos: Photo[] = photoResults.map(photo => {
      const photographer = photographerMap.get(photo.photographerId);
      const user = photographer ? userMap.get(photographer.userId) : null;
      const event = photo.eventId ? eventMap.get(photo.eventId) : null;
      
      return {
        id: photo.id,
        photographerId: photo.photographerId,
        photographer: user?.username || 'Neznámý fotograf',
        avatarUrl: `/api/profile-pictures/${photographer?.userId || 'unknown'}`,
        eventId: photo.eventId || undefined,
        event: event?.name || undefined,
        storageId: photo.storageId,
        thumbnailUrl: `/api/photos/thumbnails/${photo.storageId}`,
        imageUrl: `/api/photos/${photo.id}`,
        likes: photo.likes,
        date: photo.date,
        tags: photoTagsMap[photo.id] || [],
      };
    });
    
    return {
      photos: resultPhotos,
      totalItems: total,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Chyba při načítání fotografií:', error);
    throw new Error('Nepodařilo se načíst fotografie');
  }
}

/**
 * Získá detail fotografie podle ID
 */
export async function getPhotoById(photoId: string, userId?: string) {
  try {
    // Základní dotaz na fotografii
    const [photoResult] = await db
      .select({
        id: photos.id,
        photographerId: photos.photographerId,
        eventId: photos.eventId,
        storageId: photos.storageId,
        likes: photos.likes,
        date: photos.date,
      })
      .from(photos)
      .where(eq(photos.id, photoId));
    
    if (!photoResult) {
      return null;
    }
    
    // Získání informací o fotografovi
    const photographer = await db
      .select({
        id: photographers.id,
        userId: photographers.userId,
      })
      .from(photographers)
      .where(eq(photographers.id, photoResult.photographerId))
      .then(rows => rows[0]);
    
    // Získání jména fotografa
    let photographerName = 'Neznámý fotograf';
    if (photographer) {
      const [userData] = await db
        .select({
          username: user.username,
        })
        .from(user)
        .where(eq(user.id, photographer.userId));
      
      if (userData) {
        photographerName = userData.username;
      }
    }
    
    // Získání názvu události
    let eventName;
    if (photoResult.eventId) {
      const [event] = await db
        .select({
          name: events.name,
        })
        .from(events)
        .where(eq(events.id, photoResult.eventId));
      
      if (event) {
        eventName = event.name;
      }
    }
    
    // Získání tagů pro fotografii
    const photoTagsResult = await db
      .select({
        tagId: photoTags.tagId,
      })
      .from(photoTags)
      .where(eq(photoTags.photoId, photoId));
    
    const tagIds = photoTagsResult.map(pt => pt.tagId);
    const photoTagsList: string[] = [];
    
    if (tagIds.length > 0) {
      const tagsData = await db
        .select({
          name: tags.name,
        })
        .from(tags)
        .where(inArray(tags.id, tagIds));
      
      tagsData.forEach(tag => {
        photoTagsList.push(tag.name);
      });
    }
    
    // Zjištění, zda uživatel lajknul fotografii
    let isLikedByCurrentUser = false;
    
    if (userId) {
      const [userLike] = await db
        .select()
        .from(photoLikes)
        .where(
          and(
            eq(photoLikes.photoId, photoId),
            eq(photoLikes.userId, userId)
          )
        );
      
      isLikedByCurrentUser = !!userLike;
    }
    
    // Sestavení výsledku
    return {
      id: photoResult.id,
      photographerId: photoResult.photographerId,
      photographer: photographerName,
      avatarUrl: `/api/profile-pictures/${photographer?.userId || 'unknown'}`,
      eventId: photoResult.eventId || undefined,
      event: eventName || undefined,
      storageId: photoResult.storageId,
      thumbnailUrl: `/api/photos/thumbnails/${photoResult.storageId}`,
      imageUrl: `/api/photos/${photoResult.id}`,
      likes: photoResult.likes,
      date: photoResult.date,
      tags: photoTagsList,
      isLikedByCurrentUser
    };
  } catch (error) {
    console.error('Chyba při načítání detailu fotografie:', error);
    throw new Error('Nepodařilo se načíst detail fotografie');
  }
}

/**
 * Přidá lajk k fotografii
 */
export async function likePhoto(photoId: string, userId: string) {
  try {
    // Kontrola, zda již uživatel fotografii lajknul
    const [existingLike] = await db
      .select()
      .from(photoLikes)
      .where(
        and(
          eq(photoLikes.photoId, photoId),
          eq(photoLikes.userId, userId)
        )
      );
    
    if (existingLike) {
      return false; // Uživatel již fotografii lajknul
    }
    
    // Začátek transakce
    await db.transaction(async (tx) => {
      // Přidání záznamu o lajku
      await tx.insert(photoLikes).values({
        photoId,
        userId
      });
      
      // Zvýšení počítadla lajků
      await tx
        .update(photos)
        .set({ likes: sql`${photos.likes} + 1` })
        .where(eq(photos.id, photoId));
    });
    
    revalidatePath('/fotky');
    revalidatePath(`/fotky/${photoId}`);
    
    return true;
  } catch (error) {
    console.error('Chyba při lajkování fotografie:', error);
    throw new Error('Nepodařilo se lajkovat fotografii');
  }
}

/**
 * Odebere lajk z fotografie
 */
export async function unlikePhoto(photoId: string, userId: string) {
  try {
    // Kontrola, zda uživatel fotografii lajknul
    const [existingLike] = await db
      .select()
      .from(photoLikes)
      .where(
        and(
          eq(photoLikes.photoId, photoId),
          eq(photoLikes.userId, userId)
        )
      );
    
    if (!existingLike) {
      return false; // Uživatel fotografii nelajknul
    }
    
    // Začátek transakce
    await db.transaction(async (tx) => {
      // Odebrání záznamu o lajku
      await tx
        .delete(photoLikes)
        .where(
          and(
            eq(photoLikes.photoId, photoId),
            eq(photoLikes.userId, userId)
          )
        );
      
      // Snížení počítadla lajků
      await tx
        .update(photos)
        .set({ likes: sql`${photos.likes} - 1` })
        .where(eq(photos.id, photoId));
    });
    
    revalidatePath('/fotky');
    revalidatePath(`/fotky/${photoId}`);
    
    return true;
  } catch (error) {
    console.error('Chyba při odebírání lajku z fotografie:', error);
    throw new Error('Nepodařilo se odebrat lajk z fotografie');
  }
} 