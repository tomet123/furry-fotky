import { useState, useEffect, useCallback } from 'react';
import { endpoints, preparePostgRESTUrl, getTotalCount } from '@/lib/postgrest';
import { Photo } from './usePhotoItems';

export interface Photographer {
  id: number;
  name: string;
  bio?: string;
  email?: string;
  website?: string;
  avatar?: string;
  photos_count?: number;
}

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
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  // Funkce pro načtení fotografů
  const fetchPhotographers = useCallback(async () => {
    setLoading(true);
    try {
      // Vytvoření parametrů pro PostgREST
      const params = new URLSearchParams();
      
      // Filtrování dle query
      if (query) {
        params.append('name', `ilike.%${query}%`);
      }
      
      // Získání celkového počtu záznamů
      const total = await getTotalCount(endpoints.photographers, params);
      
      // Načtení dat
      const url = `${endpoints.photographers}?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Chyba při načítání fotografů: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setPhotographers(data);
      setTotalItems(total);
    } catch (err) {
      console.error('Chyba při načítání fotografů:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [query]);
  
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
  const [photographer, setPhotographer] = useState<Photographer | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPhotos, setTotalPhotos] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  
  // Funkce pro načtení detailu fotografa
  const fetchPhotographerDetail = useCallback(async () => {
    setLoading(true);
    try {
      // Nejprve získáme fotografa
      const photographerUrl = `${endpoints.photographers}?id=eq.${id}`;
      const photographerResponse = await fetch(photographerUrl);
      
      if (!photographerResponse.ok) {
        throw new Error(`Chyba při načítání fotografa: ${photographerResponse.statusText}`);
      }
      
      const photographers = await photographerResponse.json();
      
      if (photographers.length === 0) {
        throw new Error('Fotograf nebyl nalezen');
      }
      
      setPhotographer(photographers[0]);
      
      // Potom získáme fotografie od tohoto fotografa
      const params = preparePostgRESTUrl(endpoints.photoDetails, {
        page,
        limit,
        filters: {
          photographer: photographers[0].name
        }
      });
      
      // Získání celkového počtu fotografií
      const total = await getTotalCount(endpoints.photoDetails, params);
      
      // Načtení fotografií
      const photosUrl = `${endpoints.photoDetails}?${params.toString()}`;
      const photosResponse = await fetch(photosUrl);
      
      if (!photosResponse.ok) {
        throw new Error(`Chyba při načítání fotografií: ${photosResponse.statusText}`);
      }
      
      const photosData = await photosResponse.json();
      
      setPhotos(photosData);
      setTotalPhotos(total);
      setTotalPages(Math.ceil(total / limit));
    } catch (err) {
      console.error('Chyba při načítání detailu fotografa:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id, page, limit]);
  
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