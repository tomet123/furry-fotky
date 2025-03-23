'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Photo, PhotoFilters } from '@/app/actions/photos';
import { getPhotos } from '@/app/actions/photos';
import { getPhotographers, getEvents, getTags } from '@/app/actions/filters';

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
  
  // Stav aktivní fotky v modálu
  activePhotoId: string | null;
  setActivePhotoId: (id: string | null) => void;
  
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
  
  activePhotoId: null,
  setActivePhotoId: () => {},
  
  updateFilters: () => {},
  resetFilters: () => {},
  setPage: () => {},
  refreshPhotos: async () => {},
  searchPhotographers: async () => {},
  searchEvents: async () => {},
  searchTags: async () => {},
});

// Provider komponenta pro kontext fotogalerie
export function PhotoGalleryProvider({ children }: { children: React.ReactNode }) {
  // Stav fotogalerie
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filters, setFilters] = useState<PhotoFilters>(DEFAULT_FILTERS);
  
  // Stav pro aktivní fotku v modálu
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  
  // Stav pro data filtrů
  const [photographers, setPhotographers] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loadingFilterOptions, setLoadingFilterOptions] = useState<boolean>(false);

  // Funkce pro načtení fotografů s vyhledáváním
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
      console.error('Chyba při načítání událostí:', error);
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
      console.error('Chyba při načítání tagů:', error);
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
        console.error('Chyba při načítání dat filtrů:', error);
      } finally {
        setLoadingFilterOptions(false);
      }
    };
    
    loadInitialFilterData();
  }, []);

  // Funkce pro načtení fotografií podle aktuálních filtrů
  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Získáme ID aktuálního uživatele, pokud je potřeba pro filtrování oblíbených
      let currentFilters = { ...filters };
      
      if (filters.onlyLiked) {
        // Pro získání ID přihlášeného uživatele použijeme Session API nebo localStorage
        // Toto je jen placeholder - skutečná implementace by měla používat váš autentizační systém
        const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
        if (userId) {
          currentFilters.userId = userId;
        } else {
          // Pokud uživatel není přihlášen a chce vidět oblíbené, vrátíme prázdný výsledek
          setPhotos([]);
          setTotalItems(0);
          setTotalPages(0);
          setLoading(false);
          return;
        }
      }
      
      const result = await getPhotos(currentFilters);
      
      setPhotos(result.photos);
      setTotalItems(result.totalItems);
      setTotalPages(result.totalPages);
      
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
  }, [filters]);

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

  // Poskytujeme hodnoty a funkce přes kontext
  const contextValue = {
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
    
    activePhotoId,
    setActivePhotoId,
    
    updateFilters,
    resetFilters,
    setPage,
    refreshPhotos: fetchPhotos,
    searchPhotographers,
    searchEvents,
    searchTags
  };

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