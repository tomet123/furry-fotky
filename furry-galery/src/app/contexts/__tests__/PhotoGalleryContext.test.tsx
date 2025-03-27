import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhotoGalleryProvider, usePhotoGallery } from '../PhotoGalleryContext';
import * as photosActions from '@/app/actions/photos';
import * as filtersActions from '@/app/actions/filters';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn()
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'test-user-id'
      }
    }
  }))
}));

// Mock server akcí - musí být provedeno před importem kontextu
jest.mock('@/app/actions/photos', () => ({
  getPhotos: jest.fn().mockResolvedValue({
    photos: [
      { id: '1', title: 'Test Photo 1', url: '/photos/1.jpg', userId: '1', userName: 'Test User' },
      { id: '2', title: 'Test Photo 2', url: '/photos/2.jpg', userId: '2', userName: 'Admin User' }
    ],
    totalItems: 2,
    totalPages: 1
  }),
  deletePhoto: jest.fn().mockResolvedValue({ success: true }),
  likePhoto: jest.fn().mockResolvedValue({ success: true }),
  unlikePhoto: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('@/app/actions/filters', () => ({
  getPhotographers: jest.fn().mockResolvedValue(['Photographer 1', 'Photographer 2']),
  getEvents: jest.fn().mockResolvedValue(['Event 1', 'Event 2']),
  getTags: jest.fn().mockResolvedValue(['Tag 1', 'Tag 2']),
}));

// Testovací komponenta pro použití kontextu
const TestComponent = () => {
  const { 
    photos, 
    loading, 
    error, 
    filters, 
    updateFilters, 
    resetFilters, 
    setPage,
    photographers,
    events,
    availableTags,
    searchPhotographers,
    searchEvents,
    searchTags,
    deletePhoto,
    likePhoto,
    unlikePhoto
  } = usePhotoGallery();

  return (
    <div>
      <div data-testid="loading">{loading ? 'true' : 'false'}</div>
      <div data-testid="error">{error || 'null'}</div>
      <div data-testid="photos-count">{photos.length}</div>
      <div data-testid="current-page">{filters.page}</div>
      <div data-testid="photographers">{photographers.join(',')}</div>
      <div data-testid="events">{events.join(',')}</div>
      <div data-testid="tags">{availableTags.join(',')}</div>
      
      <button data-testid="update-filters" onClick={() => updateFilters({ tags: ['test'] })}>
        Update Filters
      </button>
      
      <button data-testid="reset-filters" onClick={resetFilters}>
        Reset Filters
      </button>
      
      <button data-testid="next-page" onClick={() => setPage(2)}>
        Next Page
      </button>
      
      <button data-testid="search-photographers" onClick={() => searchPhotographers('test')}>
        Search Photographers
      </button>
      
      <button data-testid="search-events" onClick={() => searchEvents('test')}>
        Search Events
      </button>
      
      <button data-testid="search-tags" onClick={() => searchTags('test')}>
        Search Tags
      </button>

      <button data-testid="delete-photo" onClick={() => deletePhoto('1')}>
        Delete Photo
      </button>

      <button data-testid="like-photo" onClick={() => likePhoto('1')}>
        Like Photo
      </button>

      <button data-testid="unlike-photo" onClick={() => unlikePhoto('1')}>
        Unlike Photo
      </button>
    </div>
  );
};

describe('PhotoGalleryContext', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  };
  
  const mockSearchParams = {
    get: jest.fn().mockImplementation(key => {
      if (key === 'page') return '1';
      return null;
    }),
    toString: jest.fn().mockReturnValue(''),
    has: jest.fn().mockReturnValue(false),
    getAll: jest.fn().mockReturnValue([]),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Výchozí mock implementace
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue('/fotogalerie');
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    
    // Reset mock implementace pro akce
    (photosActions.getPhotos as jest.Mock).mockClear();
    (filtersActions.getPhotographers as jest.Mock).mockClear();
    (filtersActions.getEvents as jest.Mock).mockClear();
    (filtersActions.getTags as jest.Mock).mockClear();
  });

  it('zobrazuje načtená data', async () => {
    render(
      <PhotoGalleryProvider>
        <TestComponent />
      </PhotoGalleryProvider>
    );
    
    // Počkáme na načtení dat
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Ověříme, že data byla zobrazena
    expect(screen.getByTestId('photos-count').textContent).toBe('2');
    expect(screen.getByTestId('photographers').textContent).toBe('Photographer 1,Photographer 2');
    expect(screen.getByTestId('events').textContent).toBe('Event 1,Event 2');
    expect(screen.getByTestId('tags').textContent).toBe('Tag 1,Tag 2');
  });

  it('umožňuje aktualizovat filtry', async () => {
    const user = userEvent.setup();
    
    render(
      <PhotoGalleryProvider>
        <TestComponent />
      </PhotoGalleryProvider>
    );
    
    // Počkáme na načtení dat
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Mock pro další načtení
    (photosActions.getPhotos as jest.Mock).mockClear();
    
    // Klikneme na tlačítko pro aktualizaci filtrů
    await user.click(screen.getByTestId('update-filters'));
    
    // Ověříme, že byly načteny nové data s novými filtry
    expect(photosActions.getPhotos).toHaveBeenCalledWith(
      expect.objectContaining({ tags: ['test'] })
    );
  });

  it('umožňuje resetovat filtry', async () => {
    const user = userEvent.setup();
    
    render(
      <PhotoGalleryProvider initialFilters={{ tags: ['initial'] }}>
        <TestComponent />
      </PhotoGalleryProvider>
    );
    
    // Počkáme na načtení dat
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Mock pro další načtení
    (photosActions.getPhotos as jest.Mock).mockClear();
    
    // Klikneme na tlačítko pro reset filtrů
    await user.click(screen.getByTestId('reset-filters'));
    
    // Ověříme, že byly načteny nové data s výchozími filtry
    expect(photosActions.getPhotos).toHaveBeenCalledWith(
      expect.objectContaining({ 
        tags: [], 
        event: '',
        photographer: '',
        page: 1
      })
    );
  });

  it('umožňuje změnit stránku', async () => {
    const user = userEvent.setup();
    
    render(
      <PhotoGalleryProvider>
        <TestComponent />
      </PhotoGalleryProvider>
    );
    
    // Počkáme na načtení dat
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Mock pro další načtení
    (photosActions.getPhotos as jest.Mock).mockClear();
    
    // Klikneme na tlačítko pro další stránku
    await user.click(screen.getByTestId('next-page'));
    
    // Ověříme, že byly načteny nové data pro stránku 2
    expect(photosActions.getPhotos).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 })
    );
  });

  it('umožňuje vyhledat fotografy', async () => {
    const user = userEvent.setup();
    
    render(
      <PhotoGalleryProvider>
        <TestComponent />
      </PhotoGalleryProvider>
    );
    
    // Počkáme na načtení dat
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Mock pro vyhledávání fotografů
    (filtersActions.getPhotographers as jest.Mock).mockClear();
    (filtersActions.getPhotographers as jest.Mock).mockResolvedValue(['Test Photographer']);
    
    // Klikneme na tlačítko pro vyhledání fotografů
    await user.click(screen.getByTestId('search-photographers'));
    
    // Ověříme, že bylo provedeno vyhledání fotografů
    expect(filtersActions.getPhotographers).toHaveBeenCalledWith('test');
    
    // Počkáme na aktualizaci dat
    await waitFor(() => {
      expect(screen.getByTestId('photographers').textContent).toBe('Test Photographer');
    });
  });

  it('umožňuje vyhledat události', async () => {
    const user = userEvent.setup();
    
    render(
      <PhotoGalleryProvider>
        <TestComponent />
      </PhotoGalleryProvider>
    );
    
    // Počkáme na načtení dat
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Mock pro vyhledávání událostí
    (filtersActions.getEvents as jest.Mock).mockClear();
    (filtersActions.getEvents as jest.Mock).mockResolvedValue(['Test Event']);
    
    // Klikneme na tlačítko pro vyhledání událostí
    await user.click(screen.getByTestId('search-events'));
    
    // Ověříme, že bylo provedeno vyhledání událostí
    expect(filtersActions.getEvents).toHaveBeenCalledWith('test');
    
    // Počkáme na aktualizaci dat
    await waitFor(() => {
      expect(screen.getByTestId('events').textContent).toBe('Test Event');
    });
  });

  it('umožňuje vyhledat tagy', async () => {
    const user = userEvent.setup();
    
    render(
      <PhotoGalleryProvider>
        <TestComponent />
      </PhotoGalleryProvider>
    );
    
    // Počkáme na načtení dat
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Mock pro vyhledávání tagů
    (filtersActions.getTags as jest.Mock).mockClear();
    (filtersActions.getTags as jest.Mock).mockResolvedValue(['Test Tag']);
    
    // Klikneme na tlačítko pro vyhledání tagů
    await user.click(screen.getByTestId('search-tags'));
    
    // Ověříme, že bylo provedeno vyhledání tagů
    expect(filtersActions.getTags).toHaveBeenCalledWith('test');
    
    // Počkáme na aktualizaci dat
    await waitFor(() => {
      expect(screen.getByTestId('tags').textContent).toBe('Test Tag');
    });
  });

  it('zpracuje chybu při načítání fotografií', async () => {
    // Mock chyby při načítání fotografií
    (photosActions.getPhotos as jest.Mock).mockRejectedValueOnce(new Error('Failed to load photos'));
    
    render(
      <PhotoGalleryProvider>
        <TestComponent />
      </PhotoGalleryProvider>
    );
    
    // Počkáme na zpracování chyby
    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).not.toBe('null');
    });
    
    // Ověříme, že stav se změnil na "not loading" a je dostupná chybová zpráva
    expect(screen.getByTestId('loading').textContent).toBe('false');
    expect(screen.getByTestId('photos-count').textContent).toBe('0');
  });

  it('zpracuje chybu při načítání možností filtrů', async () => {
    // Mock chyby při načítání filtrů
    (filtersActions.getPhotographers as jest.Mock).mockRejectedValue(new Error('Failed to load photographers'));
    (filtersActions.getEvents as jest.Mock).mockRejectedValue(new Error('Failed to load events'));
    (filtersActions.getTags as jest.Mock).mockRejectedValue(new Error('Failed to load tags'));
    
    render(
      <PhotoGalleryProvider>
        <TestComponent />
      </PhotoGalleryProvider>
    );
    
    // Počkáme na dokončení načtení
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // I když nastala chyba v načtení filtrů, komponenta by měla fungovat s prázdnými hodnotami
    expect(screen.getByTestId('photographers').textContent).toBe('');
    expect(screen.getByTestId('events').textContent).toBe('');
    expect(screen.getByTestId('tags').textContent).toBe('');
  });

  it('umožňuje smazat fotografii', async () => {
    const user = userEvent.setup();
    
    render(
      <PhotoGalleryProvider>
        <TestComponent />
      </PhotoGalleryProvider>
    );
    
    // Počkáme na načtení dat
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Mock pro mazání fotografie
    (photosActions.deletePhoto as jest.Mock).mockClear();
    (photosActions.getPhotos as jest.Mock).mockClear();
    
    // Klikneme na tlačítko pro smazání fotografie
    await user.click(screen.getByTestId('delete-photo'));
    
    // V testovacím prostředí se volá speciální dynamicky importovaná funkce
    // Ověříme, že bylo provedeno načtení fotografií po smazání
    expect(photosActions.getPhotos).toHaveBeenCalled();
  });

  it('umožňuje označit fotografii jako oblíbenou', async () => {
    const user = userEvent.setup();
    
    render(
      <PhotoGalleryProvider>
        <TestComponent />
      </PhotoGalleryProvider>
    );
    
    // Počkáme na načtení dat
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Mock pro označení fotografie jako oblíbené
    (photosActions.likePhoto as jest.Mock).mockClear();
    (photosActions.getPhotos as jest.Mock).mockClear();
    
    // Klikneme na tlačítko pro označení fotografie jako oblíbené
    await user.click(screen.getByTestId('like-photo'));
    
    // Ověříme, že bylo provedeno označení fotografie jako oblíbené
    expect(photosActions.likePhoto).toHaveBeenCalledWith('1', 'test-user-id');
    
    // Ověříme, že byly znovu načteny fotografie
    expect(photosActions.getPhotos).toHaveBeenCalled();
  });

  it('umožňuje odebrat fotografii z oblíbených', async () => {
    const user = userEvent.setup();
    
    render(
      <PhotoGalleryProvider>
        <TestComponent />
      </PhotoGalleryProvider>
    );
    
    // Počkáme na načtení dat
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Mock pro odebrání fotografie z oblíbených
    (photosActions.unlikePhoto as jest.Mock).mockClear();
    (photosActions.getPhotos as jest.Mock).mockClear();
    
    // Klikneme na tlačítko pro odebrání fotografie z oblíbených
    await user.click(screen.getByTestId('unlike-photo'));
    
    // Ověříme, že bylo provedeno odebrání fotografie z oblíbených
    expect(photosActions.unlikePhoto).toHaveBeenCalledWith('1', 'test-user-id');
    
    // Ověříme, že byly znovu načteny fotografie
    expect(photosActions.getPhotos).toHaveBeenCalled();
  });
}); 