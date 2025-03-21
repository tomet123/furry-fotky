import { useState, useEffect, useCallback, memo } from 'react';
import { Box, Typography } from '@mui/material';
import { Photo } from '@/hooks/usePhotoItems';
import { PhotoDetail } from '@/components/photos/PhotoDetail';
import { usePhotos } from '@/hooks/usePhotos';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import { PHOTO_CAROUSEL_AUTOPLAY_INTERVAL } from '@/lib/constants';

interface PhotoCarouselProps {
  title?: string;
  subtitle?: string;
  limit?: number;
}

/**
 * Komponenta pro zobrazení interaktivního carousel s fotografiemi
 */
const PhotoCarousel: React.FC<PhotoCarouselProps> = ({ 
  title = 'Vítejte na FurryFotky.cz',
  subtitle = 'Váš portál pro furry fotografii a umění',
  limit = 10
}) => {
  const { photos, loading, error, likePhoto, unlikePhoto } = usePhotos({ 
    sortBy: 'most_liked',
    limit
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  
  // Automatické posouvání
  useEffect(() => {
    if (!autoplay || !photos || photos.length === 0) return;
    
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % photos.length);
    }, PHOTO_CAROUSEL_AUTOPLAY_INTERVAL);
    
    return () => clearInterval(interval);
  }, [autoplay, photos]);
  
  // Zastavení autoplay při hoveru
  const handleMouseEnter = useCallback(() => setAutoplay(false), []);
  const handleMouseLeave = useCallback(() => setAutoplay(true), []);
  
  // Navigační handlery
  const handlePrev = useCallback(() => {
    if (!photos || photos.length === 0) return;
    setActiveIndex((current) => (current - 1 + photos.length) % photos.length);
  }, [photos]);
  
  const handleNext = useCallback(() => {
    if (!photos || photos.length === 0) return;
    setActiveIndex((current) => (current + 1) % photos.length);
  }, [photos]);
  
  // Handlery pro lajkování
  const handleLike = useCallback(async (photo: Photo) => {
    await likePhoto(photo.id);
  }, [likePhoto]);
  
  const handleUnlike = useCallback(async (photo: Photo) => {
    await unlikePhoto(photo.id);
  }, [unlikePhoto]);
  
  // Zobrazíme loader dokud se data nenačtou
  if (loading) {
    return <LoadingIndicator height={500} message="Načítání fotografií..." />;
  }
  
  // Zobrazíme chybovou hlášku, pokud nastala chyba
  if (error || !photos || photos.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 500 }}>
        <Typography variant="h6" color="error">
          Nepodařilo se načíst fotografie
        </Typography>
      </Box>
    );
  }

  // Aktuální fotka
  const currentPhoto = photos[activeIndex];
  
  return (
    <Box>
      {/* Uvítací text překrývající galerii */}
      <Box 
        sx={{
          position: 'relative',
          mb: 4,
          zIndex: 2
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            width: '100%',
            zIndex: 5,
            p: { xs: 3, md: 6 },
          }}
        >
          <Typography component="h1" variant="h3" color="white" gutterBottom sx={{ 
            textShadow: '0 2px 10px rgba(0,0,0,0.9)',
            fontWeight: 'bold' 
          }}>
            {title}
          </Typography>
          <Typography variant="h5" color="white" paragraph sx={{ 
            textShadow: '0 2px 10px rgba(0,0,0,0.9)'
          }}>
            {subtitle}
          </Typography>
        </Box>
        
        <Box 
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          sx={{ position: 'relative' }}
        >
          <PhotoDetail 
            photo={currentPhoto}
            mode="inline"
            height={500}
            showLikes={true}
            showViewAllButton={false}
            showHeader={false}
            showFooter={false}
            onNext={handleNext}
            onPrevious={handlePrev}
            onLike={handleLike}
            onUnlike={handleUnlike}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default memo(PhotoCarousel); 