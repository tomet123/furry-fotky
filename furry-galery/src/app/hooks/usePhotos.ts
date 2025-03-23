'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPhotos, getPhotoById, likePhoto, unlikePhoto, PhotoFilters } from '@/app/actions/photos';
import type { Photo } from '@/app/actions/photos';

// Typ pro stav použitý v usePhotos
export type PhotosState = {
  photos: Photo[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  totalPages: number;
}

// Výchozí hodnoty filtrů
const DEFAULT_FILTERS: PhotoFilters = {
  event: '',
  photographer: '',
  tags: [],
  sortBy: 'newest',
  page: 1,
  limit: 12
};

/**
 * Hook pro práci s fotografiemi
 * Načte fotografie podle filtrů a poskytuje funkce pro interakci
 */
export function usePhotos(initialFilters: Partial<PhotoFilters> = {}) {
  // Stav pro fotografie a metadata
  const [state, setState] = useState<PhotosState>({
    photos: [],
    loading: true,
    error: null,
    totalItems: 0,
    totalPages: 0
  });
  
  // Stav pro filtry
  const [filters, setFilters] = useState<PhotoFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters
  });
  
  // Funkce pro načtení fotografií
  const fetchPhotos = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await getPhotos(filters);
      setState({
        photos: result.photos,
        loading: false,
        error: null,
        totalItems: result.totalItems,
        totalPages: result.totalPages
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Nepodařilo se načíst fotografie',
        photos: []
      }));
    }
  }, [filters]);
  
  // Načtení fotografií při změně filtrů
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);
  
  // Funkce pro změnu stránky
  const setPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);
  
  // Funkce pro aktualizaci filtrů
  const updateFilters = useCallback((newFilters: Partial<PhotoFilters>) => {
    setFilters(prev => {
      const isPageResetNeeded = Object.keys(newFilters).some(key => key !== 'page');
      return {
        ...prev,
        ...newFilters,
        page: isPageResetNeeded ? 1 : newFilters.page || prev.page
      };
    });
  }, []);
  
  // Funkce pro lajkování fotografie
  const handleLike = useCallback(async (photoId: string, userId: string) => {
    try {
      return await likePhoto(photoId, userId);
    } catch (error) {
      // Chyba zpracována tiše
      return false;
    }
  }, []);
  
  // Funkce pro odlajkování fotografie
  const handleUnlike = useCallback(async (photoId: string, userId: string) => {
    try {
      return await unlikePhoto(photoId, userId);
    } catch (error) {
      // Chyba zpracována tiše
      return false;
    }
  }, []);
  
  // Vrácení stavu a funkcí
  return {
    ...state,
    filters,
    setPage,
    updateFilters,
    refreshPhotos: fetchPhotos,
    likePhoto: handleLike,
    unlikePhoto: handleUnlike
  };
}

/**
 * Hook pro práci s jednou fotografií
 * Načte detail fotografie podle ID
 */
export function usePhoto(photoId: string) {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchPhoto = useCallback(async () => {
    if (!photoId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getPhotoById(photoId);
      setPhoto(result);
      setLoading(false);
    } catch (err) {
      setError('Nepodařilo se načíst detail fotografie');
      setLoading(false);
    }
  }, [photoId]);
  
  useEffect(() => {
    fetchPhoto();
  }, [fetchPhoto]);
  
  // Funkce pro lajkování fotografie
  const handleLike = useCallback(async (userId: string) => {
    if (!photo) return false;
    
    try {
      const success = await likePhoto(photo.id, userId);
      if (success) {
        setPhoto(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      }
      return success;
    } catch (error) {
      // Chyba zpracována tiše
      return false;
    }
  }, [photo]);
  
  // Funkce pro odlajkování fotografie
  const handleUnlike = useCallback(async (userId: string) => {
    if (!photo) return false;
    
    try {
      const success = await unlikePhoto(photo.id, userId);
      if (success) {
        setPhoto(prev => prev ? { ...prev, likes: Math.max(0, prev.likes - 1) } : null);
      }
      return success;
    } catch (error) {
      // Chyba zpracována tiše
      return false;
    }
  }, [photo]);
  
  return {
    photo,
    loading,
    error,
    refreshPhoto: fetchPhoto,
    likePhoto: handleLike,
    unlikePhoto: handleUnlike
  };
} 