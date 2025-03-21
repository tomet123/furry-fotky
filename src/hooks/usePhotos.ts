import { useState, useEffect, useCallback } from 'react';
import { Photo } from './usePhotoItems';
import { endpoints, preparePostgRESTUrl, getTotalCount } from '@/lib/postgrest';

interface UsePhotosParams {
  page?: number;
  limit?: number;
  query?: string;
  event?: string;
  photographer?: string;
  tags?: string[];
  sortBy?: 'newest' | 'oldest' | 'most_liked';
}

interface UsePhotosResult {
  photos: Photo[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  totalPages: number;
  refreshPhotos: () => Promise<void>;
  likePhoto: (photoId: number) => Promise<Photo | null>;
  unlikePhoto: (photoId: number) => Promise<Photo | null>;
}

/**
 * Hook pro práci s fotografiemi přímo přes PostgREST API
 */
export function usePhotos({
  page = 1,
  limit = 12,
  query,
  event,
  photographer,
  tags,
  sortBy = 'newest'
}: UsePhotosParams = {}): UsePhotosResult {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  
  // Funkce pro načtení fotografií
  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      // Vytvoření filtrů pro PostgREST
      const filters: Record<string, string | string[]> = {};
      
      if (event) {
        filters.event = event;
      }
      
      if (photographer) {
        filters.photographer = photographer;
      }
      
      if (tags && tags.length > 0) {
        filters.tags = tags;
      }
      
      // Mapování sortBy hodnot na názvy sloupců v databázi
      let dbSortBy = 'date';
      let sortOrder: 'asc' | 'desc' = 'desc';
      
      if (sortBy === 'newest') {
        dbSortBy = 'date';
        sortOrder = 'desc';
      } else if (sortBy === 'oldest') {
        dbSortBy = 'date';
        sortOrder = 'asc';
      } else if (sortBy === 'most_liked') {
        dbSortBy = 'likes';
        sortOrder = 'desc';
      }
      
      // Vytvoření parametrů pro PostgREST
      const params = preparePostgRESTUrl(endpoints.photoDetails, {
        page,
        limit,
        sortBy: dbSortBy,
        sortOrder,
        filters
      });
      
      // Text search filtr (query)
      if (query) {
        params.append('or', `(event.ilike.%${query}%,photographer.ilike.%${query}%)`);
      }
      
      // Získání celkového počtu záznamů
      const total = await getTotalCount(endpoints.photoDetails, params);
      
      // Sestavení URL s parametry
      const url = `${endpoints.photoDetails}?${params.toString()}`;
      
      // Načtení dat
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Chyba při načítání fotografií: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transformace dat z API
      const transformedData = data.map((item: any) => ({
        ...item,
        imageUrl: item.image_url,
        thumbnailUrl: item.thumbnail_url
      }));
      
      setPhotos(transformedData);
      setTotalItems(total);
      setTotalPages(Math.ceil(total / limit));
    } catch (err) {
      console.error('Chyba při načítání fotografií:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, query, event, photographer, tags, sortBy]);
  
  // Načtení fotografií při změně parametrů
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);
  
  // Funkce pro přidání lajku k fotografii
  const likePhoto = useCallback(async (photoId: number): Promise<Photo | null> => {
    try {
      // Nejprve získáme aktuální počet lajků
      const getResponse = await fetch(`${endpoints.photos}?id=eq.${photoId}&select=likes`);
      
      if (!getResponse.ok) {
        throw new Error(`Chyba při načítání dat fotografie: ${getResponse.statusText}`);
      }
      
      const photos = await getResponse.json();
      
      if (photos.length === 0) {
        throw new Error('Fotografie nebyla nalezena');
      }
      
      const currentLikes = photos[0].likes || 0;
      
      // Aktualizace počtu lajků
      const updateResponse = await fetch(`${endpoints.photos}?id=eq.${photoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          likes: currentLikes + 1
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error(`Chyba při aktualizaci počtu lajků: ${updateResponse.statusText}`);
      }
      
      const updatedPhotos = await updateResponse.json();
      const updatedPhoto = updatedPhotos[0];
      
      // Aktualizace stavu fotografií
      setPhotos(prevPhotos => 
        prevPhotos.map(photo => 
          photo.id === photoId 
            ? { ...photo, likes: updatedPhoto.likes }
            : photo
        )
      );
      
      return updatedPhoto;
    } catch (err) {
      console.error('Chyba při lajkování fotografie:', err);
      setError((err as Error).message);
      return null;
    }
  }, []);
  
  // Funkce pro odebrání lajku z fotografie
  const unlikePhoto = useCallback(async (photoId: number): Promise<Photo | null> => {
    try {
      // Obdobný postup jako u likePhoto, ale odečítáme lajk
      const getResponse = await fetch(`${endpoints.photos}?id=eq.${photoId}&select=likes`);
      
      if (!getResponse.ok) {
        throw new Error(`Chyba při načítání dat fotografie: ${getResponse.statusText}`);
      }
      
      const photos = await getResponse.json();
      
      if (photos.length === 0) {
        throw new Error('Fotografie nebyla nalezena');
      }
      
      const currentLikes = photos[0].likes || 0;
      const newLikes = Math.max(0, currentLikes - 1); // Zajistíme, že počet lajků neklesne pod 0
      
      // Aktualizace počtu lajků
      const updateResponse = await fetch(`${endpoints.photos}?id=eq.${photoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          likes: newLikes
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error(`Chyba při aktualizaci počtu lajků: ${updateResponse.statusText}`);
      }
      
      const updatedPhotos = await updateResponse.json();
      const updatedPhoto = updatedPhotos[0];
      
      // Aktualizace stavu fotografií
      setPhotos(prevPhotos => 
        prevPhotos.map(photo => 
          photo.id === photoId 
            ? { ...photo, likes: updatedPhoto.likes }
            : photo
        )
      );
      
      return updatedPhoto;
    } catch (err) {
      console.error('Chyba při odebírání lajku z fotografie:', err);
      setError((err as Error).message);
      return null;
    }
  }, []);
  
  return {
    photos,
    loading,
    error,
    totalItems,
    totalPages,
    refreshPhotos: fetchPhotos,
    likePhoto,
    unlikePhoto
  };
} 