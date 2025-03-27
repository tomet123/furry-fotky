import { renderHook, act } from '@testing-library/react';
import { useEvents, useEvent } from '../useEvents';
import * as eventsActions from '@/app/actions/events';

// Mock server akcí
jest.mock('@/app/actions/events', () => ({
  getEvents: jest.fn(),
  getEventById: jest.fn(),
}));

describe('useEvents hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('načte události s výchozími filtry při inicializaci', async () => {
    // Mock dat
    const mockEvents = [
      { id: '1', name: 'Test Event 1', date: '2023-05-15', location: 'Praha', organizerId: '1', organizerName: 'Test User', description: 'Test Description' },
      { id: '2', name: 'Test Event 2', date: '2023-06-20', location: 'Brno', organizerId: '2', organizerName: 'Admin User', description: 'Test Description 2' }
    ];
    
    (eventsActions.getEvents as jest.Mock).mockResolvedValue({
      events: mockEvents,
      totalItems: 2,
      totalPages: 1
    });

    // Renderování hooku
    const { result } = renderHook(() => useEvents());
    
    // Počáteční stav by měl být "loading"
    expect(result.current.events).toEqual([]);
    expect(result.current.loading).toBe(true);
    
    // Počkáme na dokončení načítání dat
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Ověříme, že data byla načtena
    expect(result.current.loading).toBe(false);
    expect(result.current.events).toEqual(mockEvents);
    expect(result.current.totalItems).toBe(2);
    expect(eventsActions.getEvents).toHaveBeenCalledWith(expect.objectContaining({
      upcoming: true,
      past: false,
      page: 1,
      limit: 10
    }));
  });

  it('aktualizuje filtry a načte nová data', async () => {
    // Mock pro výchozí data
    const initialEvents = [
      { id: '1', name: 'Initial Event', date: '2023-05-15', location: 'Praha', organizerId: '1', organizerName: 'Test User', description: 'Test Description' }
    ];
    
    (eventsActions.getEvents as jest.Mock).mockResolvedValueOnce({
      events: initialEvents,
      totalItems: 1,
      totalPages: 1
    });

    // Renderování hooku
    const { result } = renderHook(() => useEvents());
    
    // Počkáme na počáteční načtení
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Připravíme mock pro filtrovaná data
    const filteredEvents = [
      { id: '3', name: 'Filtered Event', date: '2023-07-10', location: 'Praha', organizerId: '1', organizerName: 'Test User', description: 'Test Description 3' }
    ];
    
    (eventsActions.getEvents as jest.Mock).mockResolvedValueOnce({
      events: filteredEvents,
      totalItems: 1,
      totalPages: 1
    });
    
    // Aktualizujeme filtry
    await act(async () => {
      result.current.updateFilters({ query: 'test', location: 'Praha' });
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Ověříme, že byla použita správná kritéria filtru
    expect(eventsActions.getEvents).toHaveBeenCalledWith(
      expect.objectContaining({ 
        query: 'test', 
        location: 'Praha',
        upcoming: true,
        past: false
      })
    );
    expect(result.current.events).toEqual(filteredEvents);
  });

  it('zpracuje chybu při získávání dat', async () => {
    // Mock chyby
    const error = new Error('Network error');
    (eventsActions.getEvents as jest.Mock).mockRejectedValue(error);

    // Renderování hooku
    const { result } = renderHook(() => useEvents());
    
    // Počkáme na zpracování chyby
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Ověříme, že chyba byla zpracována
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeTruthy();
    expect(result.current.events).toEqual([]);
  });

  it('umožňuje změnit stránku', async () => {
    // Počáteční nastavení
    const initialEvents = [{ id: '1', name: 'Page 1 Event', date: '2023-05-15', location: 'Praha', organizerId: '1', organizerName: 'Test User', description: 'Test' }];
    (eventsActions.getEvents as jest.Mock).mockResolvedValueOnce({
      events: initialEvents,
      totalItems: 20,
      totalPages: 2
    });

    // Renderování hooku
    const { result } = renderHook(() => useEvents());
    
    // Počkáme na počáteční načtení
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Připravíme mock pro data na druhé stránce
    const page2Events = [{ id: '2', name: 'Page 2 Event', date: '2023-06-20', location: 'Brno', organizerId: '2', organizerName: 'Admin User', description: 'Test 2' }];
    (eventsActions.getEvents as jest.Mock).mockResolvedValueOnce({
      events: page2Events,
      totalItems: 20,
      totalPages: 2
    });
    
    // Změníme stránku
    await act(async () => {
      result.current.setPage(2);
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Ověříme, že byla načtena správná stránka
    expect(eventsActions.getEvents).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 })
    );
    expect(result.current.events).toEqual(page2Events);
  });

  it('umožňuje obnovit data', async () => {
    // Počáteční nastavení
    const initialEvents = [{ id: '1', name: 'Initial Event', date: '2023-05-15', location: 'Praha', organizerId: '1', organizerName: 'Test User', description: 'Test' }];
    (eventsActions.getEvents as jest.Mock).mockResolvedValueOnce({
      events: initialEvents,
      totalItems: 1,
      totalPages: 1
    });

    // Renderování hooku
    const { result } = renderHook(() => useEvents());
    
    // Počkáme na počáteční načtení
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Připravíme mock pro obnovená data
    const refreshedEvents = [
      { id: '1', name: 'Refreshed Event', date: '2023-05-15', location: 'Praha', organizerId: '1', organizerName: 'Test User', description: 'Test' }
    ];
    (eventsActions.getEvents as jest.Mock).mockResolvedValueOnce({
      events: refreshedEvents,
      totalItems: 1,
      totalPages: 1
    });
    
    // Obnovíme data
    await act(async () => {
      await result.current.refreshEvents();
    });
    
    // Ověříme, že data byla znovu načtena
    expect(eventsActions.getEvents).toHaveBeenCalledTimes(2);
    expect(result.current.events).toEqual(refreshedEvents);
  });
});

describe('useEvent hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('načte detail události podle ID', async () => {
    const mockEvent = { 
      id: '1', 
      name: 'Test Event', 
      date: '2023-05-15', 
      location: 'Praha', 
      organizerId: '1', 
      organizerName: 'Test User', 
      description: 'Test Description' 
    };
    
    (eventsActions.getEventById as jest.Mock).mockResolvedValue(mockEvent);

    // Renderování hooku
    const { result } = renderHook(() => useEvent('1'));
    
    // Počkáme na načtení dat
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(eventsActions.getEventById).toHaveBeenCalledWith('1');
    expect(result.current.event).toEqual(mockEvent);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('vrací null pokud detail události není nalezen', async () => {
    (eventsActions.getEventById as jest.Mock).mockResolvedValue(null);

    // Renderování hooku
    const { result } = renderHook(() => useEvent('999'));
    
    // Počkáme na načtení dat
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(eventsActions.getEventById).toHaveBeenCalledWith('999');
    expect(result.current.event).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('zpracuje chybu při získávání detailu události', async () => {
    const error = new Error('Test error');
    (eventsActions.getEventById as jest.Mock).mockRejectedValue(error);

    // Renderování hooku
    const { result } = renderHook(() => useEvent('1'));
    
    // Počkáme na zpracování chyby
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(eventsActions.getEventById).toHaveBeenCalledWith('1');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeTruthy();
    expect(result.current.event).toBeNull();
  });

  it('neprovedne načítání při chybějícím ID', async () => {
    // Renderování hooku s prázdným ID
    const { result } = renderHook(() => useEvent(''));
    
    // Počkáme na dokončení načítání
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(eventsActions.getEventById).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.event).toBeNull();
  });
}); 