import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllEvents, 
  getUpcomingEvents, 
  getPastEvents, 
  searchEvents 
} from '@/lib/mock-db/events';

// GET /api/events
export async function GET(request: NextRequest) {
  try {
    // Získání query parametrů
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const type = searchParams.get('type'); // 'all', 'upcoming', 'past'
    
    let events;
    
    // Filtrování podle typu
    if (type === 'upcoming') {
      events = getUpcomingEvents();
    } else if (type === 'past') {
      events = getPastEvents();
    } else {
      events = getAllEvents();
    }
    
    // Vyhledávání podle query
    if (query) {
      if (type) {
        // Pokud je specifikovaný typ, filtrujeme v již vyfiltrovaných událostech
        events = events.filter(event => 
          event.name.toLowerCase().includes(query.toLowerCase()) || 
          event.description.toLowerCase().includes(query.toLowerCase()) ||
          event.location.toLowerCase().includes(query.toLowerCase())
        );
      } else {
        // Pokud není specifikovaný typ, použijeme přímo search funkci
        events = searchEvents(query);
      }
    }
    
    return NextResponse.json({
      data: events,
      meta: {
        total: events.length
      }
    });
  } catch (error) {
    console.error('Chyba při načítání akcí:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání akcí' },
      { status: 500 }
    );
  }
} 