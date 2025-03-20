import { NextRequest, NextResponse } from 'next/server';
import { getPhotoById } from '@/lib/mock-db/photos';

// GET /api/photos/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Neplatné ID fotografie' },
        { status: 400 }
      );
    }
    
    const photo = getPhotoById(id);
    
    if (!photo) {
      return NextResponse.json(
        { error: 'Fotografie nebyla nalezena' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(photo);
  } catch (error) {
    console.error('Chyba při načítání detailu fotografie:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání detailu fotografie' },
      { status: 500 }
    );
  }
}

// PUT /api/photos/:id - pro aktualizaci fotky (např. přidání lajku)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Neplatné ID fotografie' },
        { status: 400 }
      );
    }
    
    const photo = getPhotoById(id);
    
    if (!photo) {
      return NextResponse.json(
        { error: 'Fotografie nebyla nalezena' },
        { status: 404 }
      );
    }
    
    // V reálné aplikaci bychom zde aktualizovali data v databázi
    // Pro teď jen vracíme zprávu, že tato funkcionalita není plně implementována
    return NextResponse.json(
      { message: 'Aktualizace fotografií není v této verzi plně podporována' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Chyba při aktualizaci fotografie:', error);
    return NextResponse.json(
      { error: 'Chyba při aktualizaci fotografie' },
      { status: 500 }
    );
  }
}

// DELETE /api/photos/:id - pro smazání fotky
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Neplatné ID fotografie' },
        { status: 400 }
      );
    }
    
    const photo = getPhotoById(id);
    
    if (!photo) {
      return NextResponse.json(
        { error: 'Fotografie nebyla nalezena' },
        { status: 404 }
      );
    }
    
    // V reálné aplikaci bychom zde mazali z databáze
    // Pro teď jen vracíme zprávu, že tato funkcionalita není implementována
    return NextResponse.json(
      { message: 'Mazání fotografií není v této verzi podporováno' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Chyba při mazání fotografie:', error);
    return NextResponse.json(
      { error: 'Chyba při mazání fotografie' },
      { status: 500 }
    );
  }
} 