import { renderHook, act } from '@testing-library/react';
import { usePhotos, usePhoto } from '../usePhotos';
import * as photosActions from '@/app/actions/photos';

// Mock server akcí
jest.mock('@/app/actions/photos', () => ({
  getPhotos: jest.fn(),
  getPhotoById: jest.fn(),
  likePhoto: jest.fn(),
  unlikePhoto: jest.fn(),
}));

describe('usePhotos hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('načte fotografie s výchozími filtry při inicializaci', async () => {
    // Mock dat
    const mockPhotos = [
      { id: '1', title: 'Test Photo 1', url: '/photos/1.jpg', userId: '1', userName: 'Test User' },
      { id: '2', title: 'Test Photo 2', url: '/photos/2.jpg', userId: '2', userName: 'Admin User' }
    ];
    
    (photosActions.getPhotos as jest.Mock).mockResolvedValue({
      photos: mockPhotos,
      totalItems: 2,
      totalPages: 1
    });

    // Renderování hooku
    const { result } = renderHook(() => usePhotos());
    
    // Počáteční stav by měl být "loading"
    expect(result.current.photos).toEqual([]);
    expect(result.current.loading).toBe(true);
    
    // Počkáme na dokončení načítání dat
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Ověříme, že data byla načtena
    expect(result.current.loading).toBe(false);
    expect(result.current.photos).toEqual(mockPhotos);
    expect(result.current.totalItems).toBe(2);
    expect(photosActions.getPhotos).toHaveBeenCalledWith(expect.objectContaining({
      sortBy: 'newest',
      page: 1,
      limit: 12
    }));
  });

  it('aktualizuje filtry a načte nová data', async () => {
    // Mock pro výchozí data
    const initialPhotos = [
      { id: '1', title: 'Initial Photo', url: '/photos/1.jpg', userId: '1', userName: 'Test User' }
    ];
    
    (photosActions.getPhotos as jest.Mock).mockResolvedValueOnce({
      photos: initialPhotos,
      totalItems: 1,
      totalPages: 1
    });

    // Renderování hooku
    const { result } = renderHook(() => usePhotos());
    
    // Počkáme na počáteční načtení
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Připravíme mock pro filtrovaná data
    const filteredPhotos = [
      { id: '3', title: 'Filtered Photo', url: '/photos/3.jpg', userId: '1', userName: 'Test User' }
    ];
    
    (photosActions.getPhotos as jest.Mock).mockResolvedValueOnce({
      photos: filteredPhotos,
      totalItems: 1,
      totalPages: 1
    });
    
    // Aktualizujeme filtry
    await act(async () => {
      result.current.updateFilters({ tags: ['nature'], photographer: '1' });
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Ověříme, že byla použita správná kritéria filtru
    expect(photosActions.getPhotos).toHaveBeenCalledWith(
      expect.objectContaining({ 
        tags: ['nature'], 
        photographer: '1',
        page: 1
      })
    );
    expect(result.current.photos).toEqual(filteredPhotos);
  });

  it('zpracuje chybu při získávání dat', async () => {
    // Mock chyby
    const error = new Error('Network error');
    (photosActions.getPhotos as jest.Mock).mockRejectedValue(error);

    // Renderování hooku
    const { result } = renderHook(() => usePhotos());
    
    // Počkáme na zpracování chyby
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Ověříme, že chyba byla zpracována
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeTruthy();
    expect(result.current.photos).toEqual([]);
  });

  it('umožňuje změnit stránku', async () => {
    // Počáteční nastavení
    const initialPhotos = [{ id: '1', title: 'Page 1 Photo', url: '/photos/1.jpg', userId: '1', userName: 'Test User' }];
    (photosActions.getPhotos as jest.Mock).mockResolvedValueOnce({
      photos: initialPhotos,
      totalItems: 20,
      totalPages: 2
    });

    // Renderování hooku
    const { result } = renderHook(() => usePhotos());
    
    // Počkáme na počáteční načtení
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Připravíme mock pro data na druhé stránce
    const page2Photos = [{ id: '2', title: 'Page 2 Photo', url: '/photos/2.jpg', userId: '2', userName: 'Admin User' }];
    (photosActions.getPhotos as jest.Mock).mockResolvedValueOnce({
      photos: page2Photos,
      totalItems: 20,
      totalPages: 2
    });
    
    // Změníme stránku
    await act(async () => {
      result.current.setPage(2);
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Ověříme, že byla načtena správná stránka
    expect(photosActions.getPhotos).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 })
    );
    expect(result.current.photos).toEqual(page2Photos);
  });

  it('umožňuje lajkovat fotografie', async () => {
    // Mock pro výchozí načtení
    (photosActions.getPhotos as jest.Mock).mockResolvedValue({
      photos: [],
      totalItems: 0,
      totalPages: 0
    });
    
    // Mock pro úspěšný like
    (photosActions.likePhoto as jest.Mock).mockResolvedValue(true);

    // Renderování hooku
    const { result } = renderHook(() => usePhotos());
    
    // Počkáme na počáteční načtení
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Použijeme funkci likePhoto
    let success = false;
    await act(async () => {
      success = await result.current.likePhoto('photo123', 'user456');
    });
    
    // Ověříme, že akce byla provedena
    expect(photosActions.likePhoto).toHaveBeenCalledWith('photo123', 'user456');
    expect(success).toBe(true);
  });

  it('umožňuje odlajkovat fotografie', async () => {
    // Mock pro výchozí načtení
    (photosActions.getPhotos as jest.Mock).mockResolvedValue({
      photos: [],
      totalItems: 0,
      totalPages: 0
    });
    
    // Mock pro úspěšný unlike
    (photosActions.unlikePhoto as jest.Mock).mockResolvedValue(true);

    // Renderování hooku
    const { result } = renderHook(() => usePhotos());
    
    // Počkáme na počáteční načtení
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Použijeme funkci unlikePhoto
    let success = false;
    await act(async () => {
      success = await result.current.unlikePhoto('photo123', 'user456');
    });
    
    // Ověříme, že akce byla provedena
    expect(photosActions.unlikePhoto).toHaveBeenCalledWith('photo123', 'user456');
    expect(success).toBe(true);
  });

  it('tiše zpracuje chybu při lajkování', async () => {
    // Mock pro výchozí načtení
    (photosActions.getPhotos as jest.Mock).mockResolvedValue({
      photos: [],
      totalItems: 0,
      totalPages: 0
    });
    
    // Mock pro chybu při like
    (photosActions.likePhoto as jest.Mock).mockRejectedValue(new Error('Server error'));

    // Renderování hooku
    const { result } = renderHook(() => usePhotos());
    
    // Počkáme na počáteční načtení
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Použijeme funkci likePhoto
    let success = true;
    await act(async () => {
      success = await result.current.likePhoto('photo123', 'user456');
    });
    
    // Ověříme, že akce nebyla úspěšná, ale nezpůsobila pád
    expect(photosActions.likePhoto).toHaveBeenCalledWith('photo123', 'user456');
    expect(success).toBe(false);
  });
});

describe('usePhoto hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('načte detail fotografie podle ID', async () => {
    const mockPhoto = { 
      id: '1', 
      title: 'Test Photo', 
      description: 'Test description',
      url: '/photos/1.jpg',
      userId: '1',
      userName: 'Test User'
    };
    
    (photosActions.getPhotoById as jest.Mock).mockResolvedValue(mockPhoto);

    // Renderování hooku
    const { result } = renderHook(() => usePhoto('1'));
    
    // Počkáme na načtení dat
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(photosActions.getPhotoById).toHaveBeenCalledWith('1');
    expect(result.current.photo).toEqual(mockPhoto);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('zpracuje chybu při získávání detailu fotografie', async () => {
    const error = new Error('Test error');
    (photosActions.getPhotoById as jest.Mock).mockRejectedValue(error);

    // Renderování hooku
    const { result } = renderHook(() => usePhoto('1'));
    
    // Počkáme na zpracování chyby
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(photosActions.getPhotoById).toHaveBeenCalledWith('1');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeTruthy();
    expect(result.current.photo).toBeNull();
  });
}); 