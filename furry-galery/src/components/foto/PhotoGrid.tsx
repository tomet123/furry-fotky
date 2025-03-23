'use client';

import { Grid } from '@mui/material';
import { PhotoCard } from './PhotoCard';
import { useCallback } from 'react';
import { Photo } from '@/app/actions/photos';
import { likePhoto, unlikePhoto } from '@/app/actions/photos';
import { usePhotoGallery } from '@/app/contexts/PhotoGalleryContext';

interface PhotoGridProps {
  photos: Photo[];
  onLikePhoto?: (photo: Photo) => Promise<void>;
  onUnlikePhoto?: (photo: Photo) => Promise<void>;
}

/**
 * Komponenta pro zobrazení mřížky fotografií
 */
export function PhotoGrid({ 
  photos,
  onLikePhoto,
  onUnlikePhoto
}: PhotoGridProps) {
  const { setActivePhotoId } = usePhotoGallery();
  
  // Funkce pro lajkování fotografie
  const handleLike = useCallback(async (photo: Photo) => {
    try {
      if (onLikePhoto) {
        await onLikePhoto(photo);
      } else {
        // Pokud nebyla předána funkce, použijeme server action přímo
        await likePhoto(photo.id, 'current-user-id'); // TODO: Získat ID přihlášeného uživatele
      }
    } catch (error) {
      console.error('Chyba při lajkování fotografie:', error);
    }
  }, [onLikePhoto]);

  // Funkce pro odlajkování fotografie
  const handleUnlike = useCallback(async (photo: Photo) => {
    try {
      if (onUnlikePhoto) {
        await onUnlikePhoto(photo);
      } else {
        // Pokud nebyla předána funkce, použijeme server action přímo
        await unlikePhoto(photo.id, 'current-user-id'); // TODO: Získat ID přihlášeného uživatele
      }
    } catch (error) {
      console.error('Chyba při odlajkování fotografie:', error);
    }
  }, [onUnlikePhoto]);

  // Handler pro kliknutí na fotku
  const handlePhotoClick = useCallback((photo: Photo) => {
    setActivePhotoId(photo.id);
  }, [setActivePhotoId]);

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
            userId="current-user-id" // Předání ID přihlášeného uživatele
          />
        </Grid>
      ))}
    </Grid>
  );
} 