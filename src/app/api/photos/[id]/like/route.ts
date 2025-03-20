import { NextRequest, NextResponse } from 'next/server';
import { getPhotoById, photos } from '@/lib/mock-db/photos';

// POST /api/photos/:id/like - pro přidání lajku
export async function POST(
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
    
    // V reálné aplikaci bychom ukládali lajky do databáze a kontrolovali duplicity
    // Pro jednoduchost jen zvýšíme počet lajků v mock datech
    photo.likes += 1;
    
    return NextResponse.json({
      success: true,
      likes: photo.likes
    });
  } catch (error) {
    console.error('Chyba při lajkování fotografie:', error);
    return NextResponse.json(
      { error: 'Chyba při lajkování fotografie' },
      { status: 500 }
    );
  }
}

// DELETE /api/photos/:id/like - pro odebrání lajku
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
    
    // V reálné aplikaci bychom mazali lajk z databáze
    // Pro jednoduchost jen snížíme počet lajků v mock datech, pokud je větší než 0
    if (photo.likes > 0) {
      photo.likes -= 1;
    }
    
    return NextResponse.json({
      success: true,
      likes: photo.likes
    });
  } catch (error) {
    console.error('Chyba při odebírání lajku fotografie:', error);
    return NextResponse.json(
      { error: 'Chyba při odebírání lajku fotografie' },
      { status: 500 }
    );
  }
} 