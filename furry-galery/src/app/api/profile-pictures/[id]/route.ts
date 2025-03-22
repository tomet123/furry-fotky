import { db } from "@/db";
import { storageProfilePictures } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/profile-pictures/[id]
 * Vrátí profilový obrázek podle ID uživatele
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Správně čekáme na rozbalení parametrů, které jsou v Next.js 15 Promises
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    if (!id) {
      return new NextResponse("Chybí ID uživatele", { status: 400 });
    }
    
    // Nyní přímo načteme data profilového obrázku z úložiště podle userId
    const [profilePicture] = await db
      .select({
        thumbnailData: storageProfilePictures.thumbnailData,
        contentType: storageProfilePictures.contentType
      })
      .from(storageProfilePictures)
      .where(eq(storageProfilePictures.userId, id));
    
    if (!profilePicture || !profilePicture.thumbnailData) {
      // Pokud uživatel nemá profilový obrázek, vracíme 404
      return new NextResponse("Profilový obrázek nebyl nalezen", { status: 404 });
    }
    
    // Vytvoření odpovědi s daty profilového obrázku
    const imageData = profilePicture.thumbnailData as Buffer | Uint8Array | string;
    const response = new NextResponse(imageData);
    
    // Nastavení hlaviček
    response.headers.set("Content-Type", profilePicture.contentType);
    response.headers.set("Content-Disposition", `inline; filename="profile-${id}.jpg"`);
    response.headers.set("Cache-Control", "public, max-age=31536000");
    
    return response;
  } catch (error) {
    console.error("Chyba při načítání profilového obrázku:", error);
    return new NextResponse("Interní chyba serveru", { status: 500 });
  }
} 