import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createId } from '@/db/utils';
import { db, storageProfilePictures } from '@/db';
import { eq } from 'drizzle-orm';
import sharp from 'sharp';

/**
 * POST /api/profile-pictures/upload
 * Nahrání profilového obrázku
 */
export async function POST(request: NextRequest) {
  try {
    // Získání aktuální session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ error: 'Neautorizovaný přístup' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Zpracování nahraného souboru
    const formData = await request.formData();
    const file = formData.get('avatar') as File;
    
    if (!file) {
      return new NextResponse(JSON.stringify({ error: 'Chybí soubor' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Kontrola typu souboru
    if (!file.type.startsWith('image/')) {
      return new NextResponse(JSON.stringify({ error: 'Neplatný formát souboru, povoleny jsou pouze obrázky' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Zpracování obrázku - načtení do bufferu
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Zpracování obrázku pomocí sharp
    const processedImageBuffer = await sharp(buffer)
      .resize(500, 500, { fit: 'cover' })
      .jpeg({ quality: 90 })
      .toBuffer();
    
    // Vytvoření miniatury
    const thumbnailBuffer = await sharp(buffer)
      .resize(150, 150, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();
    
    // Kontrola, zda uživatel již má profilový obrázek
    const existingAvatar = await db
      .select({ id: storageProfilePictures.id })
      .from(storageProfilePictures)
      .where(eq(storageProfilePictures.userId, session.user.id))
      .limit(1);
    
    // Pokud již existuje profilový obrázek, aktualizujeme ho
    if (existingAvatar[0]) {
      await db
        .update(storageProfilePictures)
        .set({
          fileData: processedImageBuffer,
          thumbnailData: thumbnailBuffer,
          contentType: 'image/jpeg',
          originalName: file.name,
        })
        .where(eq(storageProfilePictures.id, existingAvatar[0].id));
    } else {
      // Jinak vytvoříme nový záznam
      await db
        .insert(storageProfilePictures)
        .values({
          id: createId('avatar_'),
          fileData: processedImageBuffer,
          thumbnailData: thumbnailBuffer,
          contentType: 'image/jpeg',
          originalName: file.name,
          userId: session.user.id,
          createdAt: new Date(),
        });
    }
    
    return new NextResponse(JSON.stringify({ success: true }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
    
  } catch (error) {
    console.error('Chyba při nahrávání profilového obrázku:', error);
    return new NextResponse(JSON.stringify({ error: 'Interní chyba serveru' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
} 