'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { 
  getPhotos, 
  getPhotoById, 
  likePhoto, 
  unlikePhoto,
  type Photo,
  type PhotoFilters
} from '@/app/actions/photos';

export type UsePhotosResult = {
  photos: Photo[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  totalPages: number;
  refreshPhotos: () => Promise<void>;
  likePhotoAction: (photoId: string) => Promise<void>;
  unlikePhotoAction: (photoId: string) => Promise<void>;
};

/**
 * Hook pro práci s fotografiemi
 */
export function usePhotos(
  initialFilters: PhotoFilters = {}
): UsePhotosResult {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [filters, setFilters] = useState<PhotoFilters>(initialFilters);
  const [isPending, startTransition] = useTransition();

  // Funkce pro načtení fotografií
  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getPhotos(filters);
      
      setPhotos(result.photos);
      setTotalItems(result.totalItems);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error('Chyba při načítání fotografií:', err);
      setError('Nepodařilo se načíst fotografie');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Načtení fotografií při změně filtrů
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Funkce pro aktualizaci filtrů
  const updateFilters = useCallback((newFilters: Partial<PhotoFilters>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters,
      // Pokud měníme cokoliv kromě stránky, resetujeme stránkování
      page: newFilters.hasOwnProperty('page') ? newFilters.page : 1
    }));
  }, []);

  // Funkce pro like fotografie
  const likePhotoAction = useCallback(async (photoId: string) => {
    try {
      startTransition(async () => {
        await likePhoto(photoId, 'current-user-id'); // TODO: Získat aktuální ID přihlášeného uživatele

        // Aktualizujeme stav fotografií po lajku
        setPhotos(prev => 
          prev.map(photo => 
            photo.id === photoId 
              ? { 
                  ...photo, 
                  likes: photo.likes + 1,
                  isLikedByCurrentUser: true
                }
              : photo
          )
        );
      });
    } catch (error) {
      console.error('Chyba při lajkování fotografie:', error);
    }
  }, []);

  // Funkce pro unlike fotografie
  const unlikePhotoAction = useCallback(async (photoId: string) => {
    try {
      startTransition(async () => {
        await unlikePhoto(photoId, 'current-user-id'); // TODO: Získat aktuální ID přihlášeného uživatele

        // Aktualizujeme stav fotografií po odlajku
        setPhotos(prev => 
          prev.map(photo => 
            photo.id === photoId 
              ? { 
                  ...photo, 
                  likes: photo.likes - 1,
                  isLikedByCurrentUser: false
                }
              : photo
          )
        );
      });
    } catch (error) {
      console.error('Chyba při odlajkování fotografie:', error);
    }
  }, []);

  return {
    photos,
    loading: loading || isPending,
    error,
    totalItems,
    totalPages,
    refreshPhotos: fetchPhotos,
    likePhotoAction,
    unlikePhotoAction
  };
}

/**
 * Hook pro práci s detailem fotografie
 */
export function usePhotoDetail(photoId: string | null) {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Načtení detailu fotografie
  const fetchPhoto = useCallback(async () => {
    if (!photoId) {
      setPhoto(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await getPhotoById(photoId, 'current-user-id'); // TODO: Získat aktuální ID přihlášeného uživatele
      setPhoto(result);
    } catch (err) {
      console.error('Chyba při načítání detailu fotografie:', err);
      setError('Nepodařilo se načíst detail fotografie');
    } finally {
      setLoading(false);
    }
  }, [photoId]);

  // Načtení detailu při změně ID
  useEffect(() => {
    fetchPhoto();
  }, [fetchPhoto]);

  // Funkce pro like fotografie
  const likePhotoAction = useCallback(async () => {
    if (!photo) return;
    
    try {
      startTransition(async () => {
        await likePhoto(photo.id, 'current-user-id'); // TODO: Získat aktuální ID přihlášeného uživatele

        // Aktualizujeme stav fotografie po lajku
        setPhoto(prev => {
          if (!prev) return null;
          return {
            ...prev,
            likes: prev.likes + 1,
            isLikedByCurrentUser: true
          };
        });
      });
    } catch (error) {
      console.error('Chyba při lajkování fotografie:', error);
    }
  }, [photo]);

  // Funkce pro unlike fotografie
  const unlikePhotoAction = useCallback(async () => {
    if (!photo) return;
    
    try {
      startTransition(async () => {
        await unlikePhoto(photo.id, 'current-user-id'); // TODO: Získat aktuální ID přihlášeného uživatele

        // Aktualizujeme stav fotografie po odlajku
        setPhoto(prev => {
          if (!prev) return null;
          return {
            ...prev,
            likes: prev.likes - 1,
            isLikedByCurrentUser: false
          };
        });
      });
    } catch (error) {
      console.error('Chyba při odlajkování fotografie:', error);
    }
  }, [photo]);

  return {
    photo,
    loading: loading || isPending,
    error,
    refreshPhoto: fetchPhoto,
    likePhotoAction,
    unlikePhotoAction
  };
} 