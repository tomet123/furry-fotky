'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { Photo, PhotoFilters } from '@/app/actions/photos';
import { getPhotos } from '@/app/actions/photos';
import { getPhotographers, getEvents, getTags } from '@/app/actions/filters';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// Výchozí hodnoty filtrů
const DEFAULT_FILTERS: PhotoFilters = {
  event: '',
  photographer: '',
  tags: [],
  sortBy: 'newest',
  page: 1,
  limit: 12,
  onlyLiked: false
};

// Typ pro kontext fotogalerie
type PhotoGalleryContextType = {
  // Stav fotografií
  photos: Photo[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  filters: PhotoFilters;
  
  // Stav filtrů
  photographers: string[];
  events: string[];
  availableTags: string[];
  loadingFilterOptions: boolean;
  
  // Akce
  updateFilters: (newFilters: Partial<PhotoFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  refreshPhotos: () => Promise<void>;
  searchPhotographers: (search: string) => Promise<void>;
  searchEvents: (search: string) => Promise<void>;
  searchTags: (search: string) => Promise<void>;
};

// Vytvoření kontextu s výchozími hodnotami
const PhotoGalleryContext = createContext<PhotoGalleryContextType>({
  photos: [],
  loading: false,
  error: null,
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  filters: DEFAULT_FILTERS,
  
  photographers: [],
  events: [],
  availableTags: [],
  loadingFilterOptions: false,
  
  updateFilters: () => {},
  resetFilters: () => {},
  setPage: () => {},
  refreshPhotos: async () => {},
  searchPhotographers: async () => {},
  searchEvents: async () => {},
  searchTags: async () => {},
});

interface PhotoGalleryProviderProps {
  children: React.ReactNode;
  initialFilters?: Partial<PhotoFilters>;
}

// Provider komponenta pro kontext fotogalerie
export function PhotoGalleryProvider({ children, initialFilters = {} }: PhotoGalleryProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Sloučení výchozích filtrů s inicializačními filtry
  const mergedDefaultFilters = {
    ...DEFAULT_FILTERS,
    ...initialFilters
  };

  // Stav fotogalerie
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(mergedDefaultFilters.page || 1);
  const [filters, setFilters] = useState<PhotoFilters>(mergedDefaultFilters as PhotoFilters);
  
  // Stav pro data filtrů
  const [photographers, setPhotographers] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loadingFilterOptions, setLoadingFilterOptions] = useState<boolean>(false);
  
  // Cache pro již načtené fotografie - zabránění zbytečným dotazům
  const [photosCache, setPhotosCache] = useState<Record<string, {
    photos: Photo[],
    totalItems: number,
    totalPages: number,
    timestamp: number
  }>>({});

  // Funkce pro aktualizaci URL na základě filtrů
  const updateUrlWithFilters = useCallback((currentFilters: Partial<PhotoFilters>) => {
    // Vytvoříme URL parametry
    const params = new URLSearchParams();
    
    // Přidáme parametry z aktuálních filtrů do URL
    if (currentFilters.page && currentFilters.page > 1) {
      params.set('page', currentFilters.page.toString());
    }
    
    if (currentFilters.photographer && currentFilters.photographer !== '') {
      params.set('photographer', currentFilters.photographer);
    }
    
    if (currentFilters.event && currentFilters.event !== '') {
      params.set('event', currentFilters.event);
    }
    
    if (currentFilters.sortBy && currentFilters.sortBy !== 'newest') {
      params.set('sortBy', currentFilters.sortBy);
    }
    
    if (currentFilters.tags && currentFilters.tags.length > 0) {
      currentFilters.tags.forEach(tag => {
        params.append('tags', tag);
      });
    }
    
    if (currentFilters.onlyLiked) {
      params.set('onlyLiked', 'true');
    }
    
    // Aktualizace URL bez přesměrování
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [pathname, router]);

  // Debug log pro sledování filtrů
  useEffect(() => {
    console.log('PhotoGalleryContext filters:', filters);
    // Aktualizuje URL při změně filtrů
    updateUrlWithFilters(filters);
  }, [filters, updateUrlWithFilters]);

  // Funkce pro načtení fotografů s vyhledáváním - optimalizovaná
  const searchPhotographers = useCallback(async (search: string = '') => {
    setLoadingFilterOptions(true);
    try {
      const data = await getPhotographers(search);
      setPhotographers(data);
    } catch (error) {
      console.error('Chyba při načítání fotografů:', error);
    } finally {
      setLoadingFilterOptions(false);
    }
  }, []);
  
  // Funkce pro načtení událostí s vyhledáváním
  const searchEvents = useCallback(async (search: string = '') => {
    setLoadingFilterOptions(true);
    try {
      const data = await getEvents(search);
      setEvents(data);
    } catch (error) {
      // Chyba zpracována tiše
    } finally {
      setLoadingFilterOptions(false);
    }
  }, []);
  
  // Funkce pro načtení tagů s vyhledáváním
  const searchTags = useCallback(async (search: string = '') => {
    setLoadingFilterOptions(true);
    try {
      const data = await getTags(search);
      setAvailableTags(data);
    } catch (error) {
      // Chyba zpracována tiše
    } finally {
      setLoadingFilterOptions(false);
    }
  }, []);

  // Načtení počátečních dat filtrů při prvním renderování
  useEffect(() => {
    const loadInitialFilterData = async () => {
      setLoadingFilterOptions(true);
      try {
        // Načtení všech filtrů současně
        const [photographersData, eventsData, tagsData] = await Promise.all([
          getPhotographers(),
          getEvents(),
          getTags()
        ]);
        
        setPhotographers(photographersData);
        setEvents(eventsData);
        setAvailableTags(tagsData);
      } catch (error) {
        // Chyba zpracována tiše
      } finally {
        setLoadingFilterOptions(false);
      }
    };
    
    loadInitialFilterData();
  }, []);

  // Optimalizovaná funkce pro načtení fotografií podle aktuálních filtrů
  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Vytvoříme klíč pro cache na základě filtrů
      const cacheKey = JSON.stringify(filters);
      
      // Zkontrolujeme, zda máme data v cache a zda nejsou starší než 5 minut
      const currentTime = Date.now();
      const cachedData = photosCache[cacheKey];
      const cacheExpiration = 5 * 60 * 1000; // 5 minut
      
      if (cachedData && (currentTime - cachedData.timestamp) < cacheExpiration) {
        // Použijeme data z cache
        setPhotos(cachedData.photos);
        setTotalItems(cachedData.totalItems);
        setTotalPages(cachedData.totalPages);
        setLoading(false);
        return;
      }
      
      // Získáme ID aktuálního uživatele, pokud je potřeba pro filtrování oblíbených
      let currentFilters = { ...filters };
      
      // Získáme ID přihlášeného uživatele z Next-Auth session
      const sessionData = await fetch('/api/auth/session')
        .then(res => res.json())
        .catch(() => null);
      
      const userId = sessionData?.user?.id;
      
      // Přidáme userId do filtrů pro správné načtení informací o lajcích
      if (userId) {
        currentFilters.userId = userId;
      }
      
      if (filters.onlyLiked) {
        // Pokud uživatel není přihlášen a chce vidět oblíbené, vrátíme prázdný výsledek
        if (!userId) {
          setPhotos([]);
          setTotalItems(0);
          setTotalPages(0);
          setLoading(false);
          return;
        }
      }
      
      const result = await getPhotos(currentFilters);
      
      // Aktualizujeme UI
      setPhotos(result.photos);
      setTotalItems(result.totalItems);
      setTotalPages(result.totalPages);
      
      // Uložíme výsledek do cache
      setPhotosCache(prev => ({
        ...prev,
        [cacheKey]: {
          photos: result.photos,
          totalItems: result.totalItems,
          totalPages: result.totalPages,
          timestamp: currentTime
        }
      }));
      
      // Zkontrolujeme, že stránka je v platném rozsahu
      if (filters.page && filters.page > result.totalPages && result.totalPages > 0) {
        setFilters(prev => ({ ...prev, page: result.totalPages }));
      }
    } catch (err) {
      console.error('Chyba při načítání fotografií:', err);
      setError('Nepodařilo se načíst fotografie');
      setPhotos([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [filters, photosCache]);

  // Obnovení fotografií - exportovaná funkce pro ruční obnovení
  const refreshPhotos = useCallback(async () => {
    // Odstraníme klíč z cache, aby se data načetla znovu
    const cacheKey = JSON.stringify(filters);
    setPhotosCache(prev => {
      const newCache = { ...prev };
      delete newCache[cacheKey];
      return newCache;
    });
    
    await fetchPhotos();
  }, [filters, fetchPhotos]);

  // Načtení fotografií při změně filtrů
  useEffect(() => {
    fetchPhotos();
    // Aktualizujeme také lokální stav pro currentPage
    setCurrentPage(filters.page || 1);
  }, [filters, fetchPhotos]);

  // Funkce pro aktualizaci filtrů
  const updateFilters = useCallback((newFilters: Partial<PhotoFilters>) => {
    setFilters(prev => {
      // Pokud se změní cokoliv jiného než stránka, resetujeme stránku na 1
      const isNotPageChange = Object.keys(newFilters).some(key => key !== 'page');
      const page = isNotPageChange ? 1 : newFilters.page || prev.page;
      
      return {
        ...prev,
        ...newFilters,
        page
      };
    });
  }, []);

  // Funkce pro reset filtrů
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Funkce pro změnu stránky
  const setPage = useCallback((page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  }, []);

  // Memoizace hodnot kontextu pro prevenci zbytečných překreslení
  const contextValue = useMemo(() => ({
    photos,
    loading,
    error,
    totalItems,
    totalPages,
    currentPage,
    filters,
    
    photographers,
    events,
    availableTags,
    loadingFilterOptions,
    
    updateFilters,
    resetFilters,
    setPage,
    refreshPhotos,
    searchPhotographers,
    searchEvents,
    searchTags,
  }), [
    photos, loading, error, totalItems, totalPages, currentPage, filters,
    photographers, events, availableTags, loadingFilterOptions,
    updateFilters, resetFilters, setPage, refreshPhotos,
    searchPhotographers, searchEvents, searchTags
  ]);

  return (
    <PhotoGalleryContext.Provider value={contextValue}>
      {children}
    </PhotoGalleryContext.Provider>
  );
}

// Hook pro snadný přístup ke kontextu fotogalerie
export function usePhotoGallery() {
  const context = useContext(PhotoGalleryContext);
  
  if (!context) {
    throw new Error('usePhotoGallery must be used within a PhotoGalleryProvider');
  }
  
  return context;
} 