import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { Photo } from './usePhotoItems';  // Ponecháváme původní definici rozhraní Photo

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
 * Hook pro práci s fotografiemi přes API
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
  const { get, post, del, loading, error } = useApi();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  
  // Funkce pro načtení fotografií
  const fetchPhotos = useCallback(async () => {
    const response = await get<Photo[]>('/api/photos', {
      page,
      limit,
      query,
      event,
      photographer,
      tags: tags?.join(','),
      sortBy
    });
    
    if (response) {
      setPhotos(response.data);
      setTotalItems(response.meta?.total || 0);
      setTotalPages(response.meta?.totalPages || 0);
    }
  }, [get, page, limit, query, event, photographer, tags, sortBy]);
  
  // Načtení fotografií při změně parametrů
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);
  
  // Funkce pro přidání lajku k fotografii
  const likePhoto = useCallback(async (photoId: number): Promise<Photo | null> => {
    const response = await post<Photo>(`/api/photos/${photoId}/like`);
    
    if (response) {
      // Aktualizace stavu fotografií
      setPhotos(prevPhotos => 
        prevPhotos.map(photo => 
          photo.id === photoId 
            ? { ...photo, likes: response.data.likes } 
            : photo
        )
      );
      return response.data;
    }
    
    return null;
  }, [post]);
  
  // Funkce pro odebrání lajku z fotografie
  const unlikePhoto = useCallback(async (photoId: number): Promise<Photo | null> => {
    const response = await del<Photo>(`/api/photos/${photoId}/like`);
    
    if (response) {
      // Aktualizace stavu fotografií
      setPhotos(prevPhotos => 
        prevPhotos.map(photo => 
          photo.id === photoId 
            ? { ...photo, likes: response.data.likes } 
            : photo
        )
      );
      return response.data;
    }
    
    return null;
  }, [del]);
  
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