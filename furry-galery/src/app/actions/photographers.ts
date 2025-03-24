"use server";

import { db } from "@/db";
import {
  photographers,
  photographerTakeoverRequests,
} from "@/db/schema";
import { eq, and, inArray, sql, like, desc, asc, or, count, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { user } from "@/db/schema/auth";
import { photos, photoLikes } from "@/db/schema";
import { events } from "@/db/schema/events";

// Typ pro fotografa s jeho statistikami
export type PhotographerWithStats = {
  id: string;
  userId: string | null;
  bio: string | null;
  description: string | null;
  isBeginner: boolean;
  createdAt: Date | null;
  stats: {
    galleryCount: number;
    photoCount: number;
    eventCount: number;
  };
  events: {
    eventId: string | null;
    eventName: string | null;
    eventDate: string | null;
    photoCount: number;
  }[];
};

// Zpětná kompatibilita pro typ Photographer - používaný v hooks/usePhotographers.ts
export type Photographer = {
  id: string;
  userId: string;
  username: string;
  bio: string | null;
  description: string | null;
  isBeginner: boolean;
  isOrganizer?: boolean;
  stats: {
    photos: number;
    likes: number;
    events: number;
  };
};

// Zpětná kompatibilita pro typ PhotographerFilters - používaný v hooks/usePhotographers.ts
export type PhotographerFilters = {
  query?: string;
  isBeginner?: boolean;
  sortBy?: 'username' | 'photos' | 'likes';
  page?: number;
  limit?: number;
  userType?: 'all' | 'photographers' | 'organizers';
};

// Zpětná kompatibilita pro návratový typ getPhotographers
export interface PhotographersResponse {
  photographers: Photographer[];
  totalPages: number;
  totalItems: number;
}

/**
 * Vytvoření nového profilu fotografa
 */
export async function createPhotographer(
  userId: string,
  bio: string,
  description: string,
  isBeginner: boolean
) {
  try {
    // Validace userId
    if (!userId || typeof userId !== 'string') {
      console.error("Neplatné userId při vytváření profilu fotografa:", userId);
      return {
        success: false,
        message: "Neplatné ID uživatele",
      };
    }

    // Kontrola, zda uživatel existuje v databázi
    const userData = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (userData.length === 0) {
      console.error("Uživatel nebyl nalezen při vytváření profilu fotografa:", userId);
      return {
        success: false,
        message: "Uživatel nebyl nalezen",
      };
    }

    // Kontrola, zda uživatel již nemá profil fotografa
    const existingPhotographer = await db
      .select({ id: photographers.id })
      .from(photographers)
      .where(eq(photographers.userId, userId))
      .limit(1);

    if (existingPhotographer.length > 0) {
      return {
        success: false,
        message: "Již máte vytvořený profil fotografa",
      };
    }

    // Vytvoření nového profilu fotografa
    console.log("Vytvářím profil fotografa pro uživatele:", userId);
    const [newPhotographer] = await db
      .insert(photographers)
      .values({
        userId,
        bio,
        description,
        isBeginner,
        createdAt: new Date(),
      })
      .returning({
        id: photographers.id,
      });

    revalidatePath("/user/profile");
    console.log("Profil fotografa úspěšně vytvořen:", newPhotographer.id);
    
    return {
      success: true,
      photographerId: newPhotographer.id,
      message: "Profil fotografa byl úspěšně vytvořen",
    };
  } catch (error) {
    // Detailnější logování chyb pro snazší debugging
    console.error("Chyba při vytváření profilu fotografa:", error);
    
    // Zpracování specifických chyb
    if (error && typeof error === 'object' && 'code' in error) {
      const sqliteError = error as { code: string, message?: string };
      
      if (sqliteError.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        return {
          success: false,
          message: "Nepodařilo se vytvořit profil fotografa - problém s odkazem na uživatele",
          error: sqliteError.message || "Foreign key constraint failed"
        };
      }
    }
    
    return {
      success: false,
      message: "Při vytváření profilu fotografa došlo k chybě",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Vyhledá fotografy bez přiřazeného uživatele na základě vyhledávacího dotazu
 */
export async function searchAvailablePhotographers(searchQuery: string) {
  try {
    // Vytvoříme podmínky pro OR část vyhledávání
    let searchCondition = undefined;
    
    if (searchQuery) {
      searchCondition = or(
        like(sql`COALESCE(${photographers.bio}, '')`, `%${searchQuery}%`),
        like(sql`COALESCE(${photographers.description}, '')`, `%${searchQuery}%`)
      );
    }

    // Vyhledání fotografů bez přiřazeného uživatelského ID
    const results = await db
      .select({
        id: photographers.id,
        bio: photographers.bio,
        description: photographers.description,
        isBeginner: photographers.isBeginner,
        createdAt: photographers.createdAt,
      })
      .from(photographers)
      .where(
        searchCondition 
          ? and(isNull(photographers.userId), searchCondition)
          : isNull(photographers.userId)
      )
      .orderBy(desc(photographers.createdAt));

    return results;
  } catch (error) {
    console.error('Chyba při vyhledávání fotografů:', error);
    throw new Error('Při vyhledávání fotografů došlo k chybě');
  }
}

/**
 * Vytvoří novou žádost o převzetí profilu fotografa
 */
export async function requestPhotographerTakeover(
  userId: string,
  photographerId: string,
  reason: string
) {
  try {
    // Kontrola, zda fotograf stále nemá přiřazeného uživatele
    const photographer = await db
      .select({
        id: photographers.id,
        userId: photographers.userId,
      })
      .from(photographers)
      .where(eq(photographers.id, photographerId))
      .limit(1);

    if (!photographer[0]) {
      return { success: false, message: 'Profil fotografa nebyl nalezen' };
    }

    if (photographer[0].userId) {
      return {
        success: false,
        message: 'Tento profil fotografa již má přiřazeného uživatele',
      };
    }

    // Kontrola, zda uživatel již nemá existující žádost pro tohoto fotografa
    const existingRequest = await db
      .select({
        id: photographerTakeoverRequests.id,
        status: photographerTakeoverRequests.status,
      })
      .from(photographerTakeoverRequests)
      .where(
        and(
          eq(photographerTakeoverRequests.userId, userId),
          eq(photographerTakeoverRequests.photographerId, photographerId),
          or(
            eq(photographerTakeoverRequests.status, 'pending'),
            eq(photographerTakeoverRequests.status, 'approved')
          )
        )
      )
      .limit(1);

    if (existingRequest[0]) {
      return {
        success: false,
        message:
          existingRequest[0].status === 'pending'
            ? 'Již máte aktivní žádost pro tohoto fotografa'
            : 'Vaše žádost pro tohoto fotografa byla již schválena',
      };
    }

    // Vytvoření nové žádosti
    await db.insert(photographerTakeoverRequests).values({
      userId,
      photographerId,
      reason,
      status: 'pending',
      createdAt: new Date(),
    });

    return { success: true, message: 'Žádost byla úspěšně odeslána' };
  } catch (error) {
    console.error('Chyba při vytváření žádosti o převzetí:', error);
    return {
      success: false,
      message: 'Při vytváření žádosti došlo k chybě. Zkuste to prosím znovu.',
    };
  }
}

/**
 * Získání profilu fotografa
 */
export async function getUserPhotographerProfile(userId: string) {
  try {
    const photographerData = await db
      .select({
        id: photographers.id,
        bio: photographers.bio,
        description: photographers.description,
        isBeginner: photographers.isBeginner,
        createdAt: photographers.createdAt,
      })
      .from(photographers)
      .where(eq(photographers.userId, userId))
      .limit(1);

    if (photographerData.length === 0) {
      return null;
    }

    // Zjednodušení statistik pro fotografa - pouze základní údaje bez počítání
    const result: PhotographerWithStats = {
      ...photographerData[0],
      userId,
      stats: {
        galleryCount: 0, // Použil bych skutečné počty, pokud by existovala tabulka gallerií
        photoCount: 0,  // Použil bych skutečné počty, pokud by existovala tabulka fotek
        eventCount: 0,
      },
      events: [],
    };

    return result;
  } catch (error) {
    console.error("Chyba při získávání profilu fotografa:", error);
    return null;
  }
}

/**
 * Získání veřejného profilu fotografa podle ID
 */
export async function getPhotographerProfile(photographerId: string) {
  try {
    const photographerData = await db
      .select({
        id: photographers.id,
        userId: photographers.userId,
        bio: photographers.bio,
        description: photographers.description,
        isBeginner: photographers.isBeginner,
        createdAt: photographers.createdAt,
      })
      .from(photographers)
      .where(eq(photographers.id, photographerId))
      .limit(1);

    if (photographerData.length === 0) {
      return null;
    }

    // Získání počtu fotografií
    const photoCountResult = await db
      .select({
        count: count(),
      })
      .from(photos)
      .where(eq(photos.photographerId, photographerId));

    // Získání počtu akcí, na kterých má fotograf fotky
    const eventsCountResult = await db
      .select({
        count: count(sql`DISTINCT ${photos.eventId}`),
      })
      .from(photos)
      .where(and(
        eq(photos.photographerId, photographerId),
        sql`${photos.eventId} IS NOT NULL`
      ));

    // Seznam akcí, kde má fotograf fotky
    const photographerEvents = await db
      .select({
        eventId: photos.eventId,
        eventName: events.name,
        eventDate: events.date,
        photoCount: count(photos.id),
      })
      .from(photos)
      .leftJoin(events, eq(photos.eventId, events.id))
      .where(and(
        eq(photos.photographerId, photographerId),
        sql`${photos.eventId} IS NOT NULL`
      ))
      .groupBy(photos.eventId)
      .orderBy(desc(events.date))
      .limit(10);

    // Zjednodušení statistik pro fotografa - pouze základní údaje bez počítání
    const result: PhotographerWithStats = {
      ...photographerData[0],
      stats: {
        galleryCount: 0, // Zatím nemáme tabulku galerií
        photoCount: photoCountResult[0]?.count || 0,
        eventCount: eventsCountResult[0]?.count || 0,
      },
      events: photographerEvents,
    };

    return result;
  } catch (error) {
    console.error("Chyba při získávání profilu fotografa:", error);
    return null;
  }
}

/**
 * Vytvoření profilu fotografa pro přihlášeného uživatele
 */
export async function createPhotographerProfile(userId: string, data: {
  bio: string;
  description: string;
  isBeginner: boolean;
}) {
  return createPhotographer(userId, data.bio, data.description, data.isBeginner);
}

/**
 * Získání seznamu nejnovějších fotografů
 */
export async function getLatestPhotographers(limit: number = 6) {
  try {
    const latestPhotographers = await db
      .select({
        id: photographers.id,
        bio: photographers.bio,
        isBeginner: photographers.isBeginner,
        createdAt: photographers.createdAt,
      })
      .from(photographers)
      .where(sql`${photographers.userId} IS NOT NULL`)
      .orderBy(desc(photographers.createdAt))
      .limit(limit);

    return latestPhotographers;
  } catch (error) {
    console.error("Chyba při získávání nejnovějších fotografů:", error);
    return [];
  }
}

/**
 * Získání seznamu fotografů - zpětná kompatibilita s hooks/usePhotographers.ts
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
    const conditions: any[] = [];
    
    // Filtrování podle vyhledávacího dotazu
    if (query) {
      conditions.push(
        or(
          like(sql`COALESCE(${user.username}, '')`, `%${query}%`),
          like(sql`COALESCE(${photographers.bio}, '')`, `%${query}%`),
          like(sql`COALESCE(${photographers.description}, '')`, `%${query}%`)
        )
      );
    }
    
    // Filtrování podle úrovně (začátečník)
    if (isBeginner !== undefined) {
      conditions.push(eq(photographers.isBeginner, isBeginner));
    }
    
    // Počet všech položek pro stránkování
    const totalPhotographersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(photographers)
      .innerJoin(user, eq(photographers.userId, user.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    const totalItems = totalPhotographersResult[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);
    
    // Získání fotografů s jejich základními údaji
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
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sortBy === 'username' ? asc(user.username) : asc(photographers.id))
      .limit(limit)
      .offset((page - 1) * limit);
    
    // Získání statistik pro každého fotografa
    const photographerIds = photographersResult.map(p => p.id);
    
    // Počet fotek pro každého fotografa
    const photoCountsResult = photographerIds.length > 0 
      ? await db
        .select({
          photographerId: photos.photographerId,
          count: count(),
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
    
    // Sestavení konečného seznamu fotografů s jejich statistikami
    const photographersWithStats: Photographer[] = photographersResult.map(p => ({
      id: p.id,
      userId: p.userId!,
      username: p.username!,
      bio: p.bio,
      description: p.description,
      isBeginner: p.isBeginner,
      stats: {
        photos: photoCountsMap.get(p.id) || 0,
        likes: likesCountsMap.get(p.id) || 0,
        events: eventsCountsMap.get(p.id) || 0
      }
    }));
    
    return {
      photographers: photographersWithStats,
      totalItems,
      totalPages
    };
  } catch (error) {
    console.error('Chyba při načítání fotografů:', error);
    return {
      photographers: [],
      totalItems: 0,
      totalPages: 0
    };
  }
}

/**
 * Získání detailu fotografa podle ID - zpětná kompatibilita s hooks/usePhotographers.ts
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
        count: count(),
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
      userId: photographerData[0].userId!,
      username: photographerData[0].username!,
      bio: photographerData[0].bio,
      description: photographerData[0].description,
      isBeginner: photographerData[0].isBeginner,
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

/**
 * Aktualizace profilu fotografa
 */
export async function updatePhotographer(
  userId: string,
  photographerId: string,
  data: {
    bio: string;
    description: string;
    isBeginner: boolean;
  }
) {
  try {
    // Validace userId a photographerId
    if (!userId || !photographerId) {
      return {
        success: false,
        message: "Neplatné ID uživatele nebo fotografa",
      };
    }

    // Kontrola, zda profil fotografa existuje a patří danému uživateli
    const existingPhotographer = await db
      .select({ id: photographers.id })
      .from(photographers)
      .where(
        and(
          eq(photographers.id, photographerId),
          eq(photographers.userId, userId)
        )
      )
      .limit(1);

    if (existingPhotographer.length === 0) {
      return {
        success: false,
        message: "Profil fotografa nebyl nalezen nebo k němu nemáte přístup",
      };
    }

    // Aktualizace profilu fotografa
    await db
      .update(photographers)
      .set({
        bio: data.bio,
        description: data.description,
        isBeginner: data.isBeginner,
      })
      .where(eq(photographers.id, photographerId));

    revalidatePath("/user/profile");
    revalidatePath("/photographer/" + photographerId);
    
    return {
      success: true,
      message: "Profil fotografa byl úspěšně aktualizován",
    };
  } catch (error) {
    console.error("Chyba při aktualizaci profilu fotografa:", error);
    return {
      success: false,
      message: "Při aktualizaci profilu fotografa došlo k chybě",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Smazání profilu fotografa
 */
export async function deletePhotographer(userId: string, photographerId: string) {
  try {
    // Kontrola, zda profil fotografa existuje a patří danému uživateli
    const existingPhotographer = await db
      .select({ id: photographers.id })
      .from(photographers)
      .where(
        and(
          eq(photographers.id, photographerId),
          eq(photographers.userId, userId)
        )
      )
      .limit(1);

    if (existingPhotographer.length === 0) {
      return {
        success: false,
        message: "Profil fotografa nebyl nalezen nebo k němu nemáte přístup",
      };
    }

    // TODO: Přidat logiku pro zacházení s existujícími galeriemi a fotkami tohoto fotografa
    // Zde by mělo být ošetření pro:
    // 1. Smazání nebo přesunutí fotek
    // 2. Smazání nebo archivaci galerií
    // 3. Ošetření případných dalších vazeb

    // Smazání profilu fotografa
    await db
      .delete(photographers)
      .where(eq(photographers.id, photographerId));

    revalidatePath("/user/profile");
    
    return {
      success: true,
      message: "Profil fotografa byl úspěšně smazán",
    };
  } catch (error) {
    console.error("Chyba při mazání profilu fotografa:", error);
    return {
      success: false,
      message: "Při mazání profilu fotografa došlo k chybě",
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 