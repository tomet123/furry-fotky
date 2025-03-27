import { renderHook, act } from '@testing-library/react';
import { usePhotographers, usePhotographer } from '../usePhotographers';
import * as photographersActions from '@/app/actions/photographers';

// Mock server akcí
jest.mock('@/app/actions/photographers', () => ({
  getPhotographers: jest.fn(),
  getPhotographerById: jest.fn(),
}));

describe('usePhotographers hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('načte fotografy s výchozími filtry při inicializaci', async () => {
    // Mock dat
    const mockPhotographers = [
      { id: '1', userId: 'user1', username: 'Fotograf 1', bio: 'Bio 1', profileImage: '/avatar1.jpg' },
      { id: '2', userId: 'user2', username: 'Fotograf 2', bio: 'Bio 2', profileImage: '/avatar2.jpg' }
    ];
    
    (photographersActions.getPhotographers as jest.Mock).mockResolvedValue({
      photographers: mockPhotographers,
      totalPages: 1
    });

    // Renderování hooku
    const { result, rerender } = renderHook(() => usePhotographers());
    
    // Počáteční stav by měl být "loading"
    expect(result.current.loading).toBe(true);
    
    // Počkáme na dokončení načítání dat
    await act(async () => {
      // act pokrývá jednu iteraci event loopu
      await Promise.resolve();
      // Vynutíme re-render pro aktualizaci stavu
      rerender();
    });
    
    // Ověříme, že data byla načtena
    expect(result.current.loading).toBe(false);
    expect(result.current.photographers).toEqual(mockPhotographers);
    expect(photographersActions.getPhotographers).toHaveBeenCalledWith(expect.objectContaining({
      query: '',
      sortBy: 'username',
      page: 1,
      limit: 10,
      userType: 'all'
    }));
  });

  it('umožňuje změnit stránku', async () => {
    // Mock dat
    const mockPhotographers = [{ id: '1', userId: 'user1', username: 'Fotograf 1' }];
    
    (photographersActions.getPhotographers as jest.Mock).mockResolvedValue({
      photographers: mockPhotographers,
      totalPages: 5
    });

    // Renderování hooku
    const { result, rerender } = renderHook(() => usePhotographers());
    
    // Počkáme na načtení počátečních dat
    await act(async () => {
      await Promise.resolve();
      rerender();
    });
    
    // Změna stránky
    await act(async () => {
      result.current.setPage(3);
      // Počkáme na aktualizaci
      await Promise.resolve();
      rerender();
    });
    
    // Ověříme, že byla načtena správná stránka
    expect(result.current.filters.page).toBe(3);
    expect(photographersActions.getPhotographers).toHaveBeenCalledWith(
      expect.objectContaining({ page: 3 })
    );
  });

  it('umožňuje aktualizovat filtry a resetuje stránku na 1', async () => {
    // Mock dat
    const mockPhotographers = [{ id: '1', userId: 'user1', username: 'Fotograf 1' }];
    
    (photographersActions.getPhotographers as jest.Mock).mockResolvedValue({
      photographers: mockPhotographers,
      totalPages: 5
    });

    // Renderování hooku s vlastní počáteční stránkou
    const { result, rerender } = renderHook(() => usePhotographers({ page: 2 }));
    
    // Počkáme na načtení dat
    await act(async () => {
      await Promise.resolve();
      rerender();
    });
    
    // Aktualizace filtrů
    await act(async () => {
      result.current.updateFilters({ query: 'test', userType: 'photographers' });
      await Promise.resolve();
      rerender();
    });
    
    // Ověříme, že stránka byla resetována a filtry aktualizovány
    expect(result.current.filters.page).toBe(1);
    expect(result.current.filters.query).toBe('test');
    expect(result.current.filters.userType).toBe('photographers');
    expect(photographersActions.getPhotographers).toHaveBeenCalledWith(
      expect.objectContaining({ 
        query: 'test', 
        userType: 'photographers',
        page: 1 
      })
    );
  });

  it('zpracuje chybu při načítání fotografů', async () => {
    // Mock chyby
    const errorMessage = 'Chyba při načítání fotografů';
    (photographersActions.getPhotographers as jest.Mock).mockRejectedValue(new Error(errorMessage));

    // Renderování hooku
    const { result, rerender } = renderHook(() => usePhotographers());
    
    // Počkáme na dokončení načítání dat
    await act(async () => {
      await Promise.resolve();
      rerender();
    });
    
    // Ověříme, že chyba byla zpracována
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.photographers).toEqual([]);
  });

  it('umožňuje manuálně obnovit data', async () => {
    // Mock dat
    const mockPhotographers = [{ id: '1', userId: 'user1', username: 'Fotograf 1' }];
    
    (photographersActions.getPhotographers as jest.Mock).mockResolvedValue({
      photographers: mockPhotographers,
      totalPages: 1
    });

    // Renderování hooku
    const { result, rerender } = renderHook(() => usePhotographers());
    
    // Počkáme na načtení dat
    await act(async () => {
      await Promise.resolve();
      rerender();
    });
    
    // Reset mocks pro jasnější test
    (photographersActions.getPhotographers as jest.Mock).mockClear();
    
    // Manuální obnovení dat
    await act(async () => {
      result.current.refresh();
      await Promise.resolve();
      rerender();
    });
    
    // Ověříme, že data byla znovu načtena
    expect(photographersActions.getPhotographers).toHaveBeenCalledTimes(1);
  });
});

describe('usePhotographer hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('načte detail fotografa podle ID', async () => {
    // Mock dat
    const mockPhotographer = { 
      id: '1', 
      userId: 'user1', 
      username: 'Fotograf 1', 
      bio: 'Profesionální fotograf', 
      profileImage: '/avatar1.jpg'
    };
    
    (photographersActions.getPhotographerById as jest.Mock).mockResolvedValue(mockPhotographer);

    // Renderování hooku
    const { result, rerender } = renderHook(() => usePhotographer('1'));
    
    // Počáteční stav by měl být "loading"
    expect(result.current.photographer).toBeNull();
    expect(result.current.loading).toBe(true);
    
    // Počkáme na dokončení načítání dat
    await act(async () => {
      await Promise.resolve();
      rerender();
    });
    
    // Ověříme, že data byla načtena
    expect(result.current.loading).toBe(false);
    expect(result.current.photographer).toEqual(mockPhotographer);
    expect(photographersActions.getPhotographerById).toHaveBeenCalledWith('1');
  });

  it('zpracuje chybu při načítání fotografa', async () => {
    // Mock chyby
    const errorMessage = 'Fotograf nebyl nalezen';
    (photographersActions.getPhotographerById as jest.Mock).mockRejectedValue(new Error(errorMessage));

    // Renderování hooku
    const { result, rerender } = renderHook(() => usePhotographer('999'));
    
    // Počkáme na dokončení načítání dat
    await act(async () => {
      await Promise.resolve();
      rerender();
    });
    
    // Ověříme, že chyba byla zpracována
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.photographer).toBeNull();
  });

  it('znovu načte data při změně ID', async () => {
    // Mock dat pro první ID
    const mockPhotographer1 = { id: '1', userId: 'user1', username: 'Fotograf 1' };
    (photographersActions.getPhotographerById as jest.Mock).mockResolvedValueOnce(mockPhotographer1);
    
    // Mock dat pro druhé ID
    const mockPhotographer2 = { id: '2', userId: 'user2', username: 'Fotograf 2' };
    (photographersActions.getPhotographerById as jest.Mock).mockResolvedValueOnce(mockPhotographer2);

    // Renderování hooku s prvním ID
    const { result, rerender } = renderHook((id) => usePhotographer(id), {
      initialProps: '1'
    });
    
    // Počkáme na dokončení načítání dat
    await act(async () => {
      await Promise.resolve();
      rerender('1');
    });
    
    // Ověříme, že byla načtena data pro první ID
    expect(result.current.photographer).toEqual(mockPhotographer1);
    
    // Změníme ID
    await act(async () => {
      rerender('2');
      await Promise.resolve();
    });
    
    // Ověříme, že byla načtena data pro druhé ID
    expect(result.current.photographer).toEqual(mockPhotographer2);
    expect(photographersActions.getPhotographerById).toHaveBeenCalledTimes(2);
    expect(photographersActions.getPhotographerById).toHaveBeenNthCalledWith(1, '1');
    expect(photographersActions.getPhotographerById).toHaveBeenNthCalledWith(2, '2');
  });
}); 