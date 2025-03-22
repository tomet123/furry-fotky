import { db } from "@/db";
import { photos, storagePhotos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/photos/download/[id]
 * Stáhne fotografii podle ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Použití parametrů až po zajištění, že jsou k dispozici
    const { id } = params;
    
    if (!id) {
      return new NextResponse("Chybí ID fotografie", { status: 400 });
    }
    
    // Nejprve zjistíme storage ID podle photo ID
    const [photo] = await db
      .select({ storageId: photos.storageId })
      .from(photos)
      .where(eq(photos.id, id));
    
    if (!photo) {
      return new NextResponse("Fotografie nebyla nalezena", { status: 404 });
    }
    
    // Poté načteme data z úložiště
    const [storage] = await db
      .select({
        fileData: storagePhotos.fileData,
        contentType: storagePhotos.contentType,
        originalName: storagePhotos.originalName
      })
      .from(storagePhotos)
      .where(eq(storagePhotos.id, photo.storageId));
    
    if (!storage || !storage.fileData) {
      return new NextResponse("Data fotografie nebyla nalezena", { status: 404 });
    }
    
    // Vytvoření odpovědi s daty fotografie
    const imageData = storage.fileData as Buffer | Uint8Array | string;
    const response = new NextResponse(imageData);
    
    // Nastavení hlaviček
    response.headers.set("Content-Type", storage.contentType);
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${storage.originalName}"`
    );
    
    return response;
  } catch (error) {
    console.error("Chyba při stahování fotografie:", error);
    return new NextResponse("Interní chyba serveru", { status: 500 });
  }
} 