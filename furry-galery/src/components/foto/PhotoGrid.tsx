'use client';

import React, { useCallback } from 'react';
import { Grid } from '@mui/material';
import { Photo, likePhoto, unlikePhoto } from '@/app/actions/photos';
import { PhotoCard } from './PhotoCard';
import { usePhotoGallery } from '@/app/contexts/PhotoGalleryContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/**
 * Props pro mřížku fotografií
 */
interface PhotoGridProps {
  photos: Photo[];
  onLikePhoto?: (photo: Photo) => Promise<void>;
  onUnlikePhoto?: (photo: Photo) => Promise<void>;
  onPhotoClick?: (photo: Photo) => void;
}

/**
 * Komponenta pro zobrazení mřížky fotografií
 */
export function PhotoGrid({ 
  photos,
  onLikePhoto,
  onUnlikePhoto,
  onPhotoClick
}: PhotoGridProps) {
  const { setActivePhotoId } = usePhotoGallery();
  const router = useRouter();
  const { data: session } = useSession();
  
  // Funkce pro lajkování fotografie
  const handleLike = useCallback(async (photo: Photo) => {
    try {
      if (onLikePhoto) {
        await onLikePhoto(photo);
      } else if (session?.user?.id) {
        // Pouze pokud je uživatel přihlášen
        await likePhoto(photo.id, session.user.id);
      }
    } catch (error) {
      console.error('Chyba při lajkování fotografie:', error);
    }
  }, [onLikePhoto, session]);

  // Funkce pro odlajkování fotografie
  const handleUnlike = useCallback(async (photo: Photo) => {
    try {
      if (onUnlikePhoto) {
        await onUnlikePhoto(photo);
      } else if (session?.user?.id) {
        // Pouze pokud je uživatel přihlášen
        await unlikePhoto(photo.id, session.user.id);
      }
    } catch (error) {
      console.error('Chyba při odlajkování fotografie:', error);
    }
  }, [onUnlikePhoto, session]);

  // Handler pro kliknutí na fotku
  const handlePhotoClick = useCallback((photo: Photo) => {
    if (onPhotoClick) {
      // Použití externí funkce pro řízení kliknutí
      onPhotoClick(photo);
    } else {
      // Fallback na původní URL navigaci, pokud není předána onPhotoClick
      router.push(`/fotogalerie?photoId=${photo.id}`);
      // Aktualizujeme aktivní ID v kontextu
      setActivePhotoId(photo.id);
    }
  }, [router, setActivePhotoId, onPhotoClick]);

  return (
    <Grid 
      container 
      spacing={3} 
      justifyContent="center" 
      sx={{ maxWidth: '100%' }}
    >
      {photos.map((photo) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
          <PhotoCard 
            photo={photo}
            onClick={handlePhotoClick}
          />
        </Grid>
      ))}
    </Grid>
  );
} 