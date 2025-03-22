import { useState, useEffect } from 'react';
import { endpoints, prepareApiUrl } from '@/lib/api';

export interface Photo {
  id: number;
  title?: string;
  description?: string;
  photographer: string;
  event: string;
  date: string;
  likes: number;
  tags: string[];
  imageUrl?: string;
  thumbnailUrl?: string;
}

export const usePhotoItems = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        // Vytvoříme parametry pro získání foto detailů
        const params = prepareApiUrl(endpoints.photoDetails, {
          limit: 20,
          sortBy: 'date',
          sortOrder: 'desc'
        });
        
        // Sestavení URL s parametry
        const url = `${endpoints.photoDetails}?${params.toString()}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Chyba při načítání fotografií: ${response.statusText}`);
        }
        
        const result = await response.json();
        const data = result.data || [];
        
        // Mapování API dat na PhotoItem
        interface PhotoDetailExtended {
          id: number;
          date: string;
          likes: number;
          event_id?: number | null;
          photographer_id?: number | null;
          event: string | null;
          photographer: string | null;
          photo_id: number;
          thumbnail_id: number;
          tags: string[];
        }
        
        const photoItems: Photo[] = data.map((photoData: PhotoDetailExtended) => {
          return {
            id: photoData.id,
            date: photoData.date,
            eventId: photoData.event_id || null,
            photographerId: photoData.photographer_id || null,
            event: photoData.event || null,
            photographer: photoData.photographer || null,
            tags: photoData.tags || [],
            likes: photoData.likes || 0,
            photoId: photoData.photo_id || null,
            thumbnailId: photoData.thumbnail_id || null,
            imageUrl: photoData.photo_id ? `/api/photos/files/${photoData.photo_id}` : undefined,
            thumbnailUrl: photoData.thumbnail_id ? `/api/photos/thumbnails/${photoData.thumbnail_id}` : undefined
          };
        });
        
        setPhotos(photoItems);
      } catch (error) {
        // console.error('Chyba při načítání fotografií:', error);
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  return { photos, loading, error };
}; 