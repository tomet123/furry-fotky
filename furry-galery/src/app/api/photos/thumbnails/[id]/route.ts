import { db } from "@/db";
import { storagePhotos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/photos/thumbnails/[id]
 * Vrátí náhled (miniaturu) fotografie podle ID úložiště
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
      return new NextResponse("Chybí ID fotografie", { status: 400 });
    }
    
    // Načteme data miniatury z úložiště
    const [storage] = await db
      .select({
        thumbnailData: storagePhotos.thumbnailData,
        contentType: storagePhotos.contentType,
        originalName: storagePhotos.originalName
      })
      .from(storagePhotos)
      .where(eq(storagePhotos.id, id));
    
    if (!storage || !storage.thumbnailData) {
      return new NextResponse("Náhled fotografie nebyl nalezen", { status: 404 });
    }
    
    // Vytvoření odpovědi s daty miniatury
    const imageData = storage.thumbnailData as Buffer | Uint8Array | string;
    const response = new NextResponse(imageData);
    
    // Nastavení hlaviček
    response.headers.set("Content-Type", storage.contentType);
    response.headers.set(
      "Content-Disposition",
      `inline; filename="thumb-${storage.originalName}"`
    );
    response.headers.set("Cache-Control", "public, max-age=31536000");
    
    return response;
  } catch (error) {
    console.error("Chyba při načítání náhledu fotografie:", error);
    return new NextResponse("Interní chyba serveru", { status: 500 });
  }
} 