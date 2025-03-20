import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { Photographer } from '@/lib/mock-db/photographers';  // Importujeme interface z mock-db

interface UsePhotographersParams {
  query?: string;
}

interface UsePhotographerDetailParams {
  id: string;
  page?: number;
  limit?: number;
}

/**
 * Hook pro získání seznamu fotografů
 */
export function usePhotographers({
  query
}: UsePhotographersParams = {}) {
  const { get, loading, error } = useApi();
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  // Funkce pro načtení fotografů
  const fetchPhotographers = useCallback(async () => {
    const response = await get<Photographer[]>('/api/photographers', {
      query
    });
    
    if (response) {
      setPhotographers(response.data);
      setTotalItems(response.meta?.total || 0);
    }
  }, [get, query]);
  
  // Načtení fotografů při změně parametrů
  useEffect(() => {
    fetchPhotographers();
  }, [fetchPhotographers]);
  
  return {
    photographers,
    loading,
    error,
    totalItems,
    refreshPhotographers: fetchPhotographers
  };
}

/**
 * Hook pro získání detailu fotografa a jeho fotografií
 */
export function usePhotographerDetail({
  id,
  page = 1,
  limit = 12
}: UsePhotographerDetailParams) {
  const { get, loading, error } = useApi();
  const [photographer, setPhotographer] = useState<Photographer | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [totalPhotos, setTotalPhotos] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  
  // Funkce pro načtení detailu fotografa
  const fetchPhotographerDetail = useCallback(async () => {
    const response = await get<Photographer & { photos: { data: any[], meta: { total: number, totalPages: number } } }>(`/api/photographers/${id}`, {
      page,
      limit
    });
    
    if (response) {
      const { photos, ...photographerData } = response.data;
      
      setPhotographer(photographerData);
      
      if (photos) {
        setPhotos(photos.data);
        setTotalPhotos(photos.meta.total);
        setTotalPages(photos.meta.totalPages);
      }
    }
  }, [get, id, page, limit]);
  
  // Načtení detailu fotografa při změně parametrů
  useEffect(() => {
    fetchPhotographerDetail();
  }, [fetchPhotographerDetail]);
  
  return {
    photographer,
    photos,
    loading,
    error,
    totalPhotos,
    totalPages,
    refreshPhotographerDetail: fetchPhotographerDetail
  };
} 