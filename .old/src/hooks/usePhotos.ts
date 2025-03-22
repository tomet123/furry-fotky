import { useState, useEffect, useCallback } from 'react';
import { Photo } from './usePhotoItems';
import { endpoints, prepareApiUrl } from '@/lib/api';

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
 * Hook pro práci s fotografiemi přímo přes Next.js API
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
      // Vytvoření filtrů pro API
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
      
      if (query) {
        filters.query = query;
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
      
      // Vytvoření parametrů pro API
      const params = prepareApiUrl(endpoints.photoDetails, {
        page,
        limit,
        sortBy: dbSortBy,
        sortOrder,
        filters
      });
      
      // Sestavení URL s parametry
      const url = `${endpoints.photoDetails}?${params.toString()}`;
      
      // Načtení dat
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Chyba při načítání fotografií: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Chyba při načítání fotografií');
      }
      
      const data = result.data || [];
      const pagination = result.pagination || {};
      
      // Transformace dat z API
      interface PhotoItem {
        photo_id?: number;
        thumbnail_id?: number;
        [key: string]: any;
      }

      const transformedData = data.map((item: PhotoItem) => ({
        ...item,
        imageUrl: item.photo_id ? `/api/photos/files/${item.photo_id}` : undefined,
        thumbnailUrl: item.thumbnail_id ? `/api/photos/thumbnails/${item.thumbnail_id}` : undefined
      }));
      
      setPhotos(transformedData);
      setTotalItems(pagination.totalItems || 0);
      setTotalPages(pagination.totalPages || 0);
    } catch {
      setError('Chyba při načítání fotografií');
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
      const response = await fetch(`${endpoints.photos}/${photoId}/like`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Chyba při lajkování fotografie: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Chyba při lajkování fotografie');
      }
      
      const updatedPhoto = result.data;
      
      // Aktualizace stavu fotografií
      setPhotos(prevPhotos => 
        prevPhotos.map(photo => 
          photo.id === photoId 
            ? { ...photo, likes: updatedPhoto.likes }
            : photo
        )
      );
      
      return updatedPhoto;
    } catch (error: any) {
      console.error('Chyba při lajkování fotky:', error.message);
      setError((error as Error).message);
      return null;
    }
  }, []);
  
  // Funkce pro odebrání lajku z fotografie
  const unlikePhoto = useCallback(async (photoId: number): Promise<Photo | null> => {
    try {
      // Obdobný postup jako u likePhoto, ale použijeme unlike endpoint
      const response = await fetch(`${endpoints.photos}/${photoId}/unlike`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Chyba při odebírání lajku z fotografie: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Chyba při odebírání lajku z fotografie');
      }
      
      const updatedPhoto = result.data;
      
      // Aktualizace stavu fotografií
      setPhotos(prevPhotos => 
        prevPhotos.map(photo => 
          photo.id === photoId 
            ? { ...photo, likes: updatedPhoto.likes }
            : photo
        )
      );
      
      return updatedPhoto;
    } catch (error: unknown) {
      console.error('Chyba při lajkování fotky:', error instanceof Error ? error.message : 'Neznámá chyba');
      setError(error instanceof Error ? error.message : 'Neznámá chyba');
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