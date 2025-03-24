import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import sharp from 'sharp';
import { db, markdownImages, eq } from '@/db';
import { v4 as uuidv4 } from 'uuid';

// Maximální velikost obrázku pro nahrávání (2MB)
const MAX_SIZE = 2 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Kontrola autentizace
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Neautorizovaný přístup' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    // Kontrola existence souboru
    if (!file) {
      return NextResponse.json({ error: 'Soubor nebyl nahrán' }, { status: 400 });
    }
    
    // Kontrola velikosti souboru
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Soubor je příliš velký. Maximální velikost je 2MB' }, { status: 400 });
    }
    
    // Kontrola typu souboru
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Neplatný typ souboru. Povolené typy: JPEG, PNG, WEBP, GIF' }, { status: 400 });
    }
    
    // Načtení dat souboru
    const buffer = await file.arrayBuffer();
    const fileData = Buffer.from(buffer);
    
    // Zpracování obrázku
    const processedImage = await sharp(fileData)
      .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
      .toBuffer();
    
    // Vytvoření náhledu
    const thumbnailImage = await sharp(fileData)
      .resize({ width: 300, height: 300, fit: 'inside', withoutEnlargement: true })
      .toBuffer();
    
    // Vytvoření URL identifikátoru obrázku
    const imageId = `mdimg_${uuidv4()}`;
    const url = `/api/markdown-images/${imageId}`;
    
    // Uložení do databáze
    await db.insert(markdownImages).values({
      id: imageId,
      fileData: processedImage,
      thumbnailData: thumbnailImage,
      contentType: file.type,
      originalName: file.name,
      userId: userId,
      url,
      isPublic: true,
    });
    
    // Vrácení URL a typu pro vložení do Markdown
    return NextResponse.json({
      url,
      contentType: file.type,
      success: true
    });
    
  } catch (error) {
    console.error('Chyba při zpracování nahrávání markdown obrázku:', error);
    return NextResponse.json({ error: 'Chyba při zpracování obrázku' }, { status: 500 });
  }
} 