import { useState, useEffect, useCallback } from 'react';
import { endpoints, prepareApiUrl } from '@/lib/api';
import { Photographer, PhotoDetail } from '@/lib/api-helpers';
import { Photo } from './usePhotoItems';

export interface PhotographerProfile {
  id: number;
  name: string;
  bio?: string;
  email?: string;
  website?: string;
  avatar?: string;
  photos_count?: number;
}

export interface PhotographerStats extends PhotographerProfile {
  photographer_id?: number;
  photographer_name?: string;
  photographer_bio?: string;
  photographer_avatar?: string;
  total_likes?: number;
  event_count?: number;
  photo_count?: number;
}

interface UsePhotographersParams {
  query?: string;
  limit?: number;
  page?: number;
}

interface UsePhotographerDetailParams {
  id: string;
  page?: number;
  limit?: number;
}

/**
 * Hook pro získání statistik fotografů
 */
export function usePhotographerStats(id?: string) {
  const [stats, setStats] = useState<PhotographerStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      // Připravení URL s ID, pokud bylo zadáno
      let url = endpoints.photographerStats;
      if (id) {
        url += `?id=${id}`;
      }
      
      // Načtení dat
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Chyba při načítání statistik fotografů: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Chyba při načítání statistik fotografů');
      }
      
      // Transformace dat do správného formátu
      interface PhotographerStatData {
        photographer_id: number;
        photographer_name: string;
        photographer_bio: string | null;
        photographer_avatar: string | null;
        photo_count: number;
        total_likes: number;
        event_count: number;
      }
      
      const transformedStats = (result.data || []).map((stat: PhotographerStatData) => ({
        id: stat.photographer_id,
        name: stat.photographer_name,
        bio: stat.photographer_bio,
        avatar: stat.photographer_avatar,
        photographer_id: stat.photographer_id,
        photographer_name: stat.photographer_name,
        photographer_bio: stat.photographer_bio,
        photographer_avatar: stat.photographer_avatar,
        photo_count: stat.photo_count,
        total_likes: stat.total_likes,
        event_count: stat.event_count
      }));
      
      setStats(transformedStats);
    } catch {
      console.error('Chyba při načítání statistik fotografů:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  // Načtení statistik při změně ID
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  
  return { stats, loading, error, refreshStats: fetchStats };
}

/**
 * Hook pro získání seznamu fotografů
 */
export function usePhotographers({
  query,
  limit = 10,
  page = 1
}: UsePhotographersParams = {}) {
  const [photographers, setPhotographers] = useState<PhotographerProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  // Funkce pro načtení fotografů
  const fetchPhotographers = useCallback(async () => {
    setLoading(true);
    try {
      // Vytvoření filtrů
      const filters: Record<string, string> = {};
      
      // Filtrování dle query - mapujeme na name parametr pro vyhledávání
      if (query) {
        filters.name = query;
      }
      
      // Připravíme parametry včetně stránkování
      const params = prepareApiUrl(endpoints.photographers, {
        page,
        limit,
        filters
      });
      
      // Načtení dat
      const url = `${endpoints.photographers}?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Chyba při načítání fotografů: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Chyba při načítání fotografů');
      }
      
      setPhotographers(result.data || []);
      setTotalItems(result.pagination?.totalItems || 0);
    } catch {
      console.error('Chyba při načítání fotografů:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [query, page, limit]);
  
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
      const photographerUrl = `${endpoints.photographers}?id=${id}`;
      const photographerResponse = await fetch(photographerUrl);
      
      if (!photographerResponse.ok) {
        throw new Error(`Chyba při načítání fotografa: ${photographerResponse.statusText}`);
      }
      
      const photographerResult = await photographerResponse.json();
      
      if (!photographerResult.success || !photographerResult.data || photographerResult.data.length === 0) {
        throw new Error('Fotograf nebyl nalezen');
      }
      
      setPhotographer(photographerResult.data[0]);
      
      // Potom získáme fotografie od tohoto fotografa
      const params = prepareApiUrl(endpoints.photoDetails, {
        page,
        limit,
        filters: {
          photographer_id: id
        }
      });
      
      // Načtení fotografií
      const photosUrl = `${endpoints.photoDetails}?${params.toString()}`;
      const photosResponse = await fetch(photosUrl);
      
      if (!photosResponse.ok) {
        throw new Error(`Chyba při načítání fotografií: ${photosResponse.statusText}`);
      }
      
      const photosResult = await photosResponse.json();
      
      if (!photosResult.success) {
        throw new Error(photosResult.message || 'Chyba při načítání fotografií');
      }
      
      const photosData = photosResult.data || [];
      const pagination = photosResult.pagination || {};
      
      // Transformace dat
      const transformedPhotos = photosData.map((item: PhotoDetail) => ({
        ...item,
        imageUrl: item.photo_id ? `/api/photos/files/${item.photo_id}` : undefined,
        thumbnailUrl: item.thumbnail_id ? `/api/photos/thumbnails/${item.thumbnail_id}` : undefined
      }));
      
      setPhotos(transformedPhotos);
      setTotalPhotos(pagination.totalItems || 0);
      setTotalPages(pagination.totalPages || 0);
    } catch {
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