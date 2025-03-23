'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Avatar, Stack, Chip, IconButton, Tooltip, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
import { getPhotos, Photo, likePhoto, unlikePhoto } from '@/app/actions/photos';
import { PhotoDetailModal } from './PhotoDetailModal';
import { PhotoFooter } from './PhotoFooter';
import CanvasImage from './CanvasImage';

// Interval automatického posunu carousel (ms)
const PHOTO_CAROUSEL_AUTOPLAY_INTERVAL = 5000;
// Velikost avataru
const SMALL_AVATAR_SIZE = 32;

// Stylové konstanty
const darkOverlayStyle = {
  bgcolor: 'rgba(0, 0, 0, 0.3)',
};

const darkOverlayHoverStyle = {
  '&:hover': { 
    bgcolor: 'rgba(0, 0, 0, 0.5)' 
  }
};

const actionButtonStyle = {
  color: 'white',
  ...darkOverlayStyle,
  ...darkOverlayHoverStyle,
  p: 1,
  height: 32,
  width: 32
};

const controlBoxStyle = { 
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  px: 1.5,
  py: 0.5,
  borderRadius: 2,
  ...darkOverlayStyle
};

const dotSeparatorStyle = {
  width: '4px',
  height: '4px',
  borderRadius: '50%',
  bgcolor: 'rgba(255, 255, 255, 0.5)',
  mx: 1
};

const tagChipStyle = {
  bgcolor: 'rgba(0, 0, 0, 0.3)',
  color: 'white',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  '&:hover': {
    bgcolor: 'rgba(0, 0, 0, 0.5)',
  }
};

interface HomeCarouselProps {
  title?: string;
  subtitle?: string;
  limit?: number;
}

/**
 * HomeCarousel komponenta pro úvodní stránku
 * Zobrazuje carousel oblíbených fotografií
 */
export const HomeCarousel = ({ 
  title = 'Vítejte na FurryFotky.cz',
  subtitle = 'Váš portál pro furry fotografii a umění',
  limit = 10
}: HomeCarouselProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [modalPhoto, setModalPhoto] = useState<Photo | null>(null);
  
  // Načtení fotografií při prvním renderování
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const result = await getPhotos({ 
          sortBy: 'most_liked',
          limit: 10 // Pevně nastavíme limit na 10
        });
        setPhotos(result.photos || []);
      } catch (err) {
        setError('Nepodařilo se načíst fotografie');
        console.error('Chyba při načítání fotografií:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPhotos();
  }, []);
  
  // Automatické posouvání
  useEffect(() => {
    if (!autoplay || photos.length === 0) return;
    
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
    if (photos.length === 0) return;
    setActiveIndex((current) => (current - 1 + photos.length) % photos.length);
  }, [photos]);
  
  const handleNext = useCallback(() => {
    if (photos.length === 0) return;
    setActiveIndex((current) => (current + 1) % photos.length);
  }, [photos]);
  
  // Handlery pro lajkování
  const handleLike = useCallback(async (photo: Photo) => {
    try {
      await likePhoto(photo.id, 'current-user-id');
      // Aktualizace počtu lajků v lokálním stavu
      setPhotos(prevPhotos => 
        prevPhotos.map(p => p.id === photo.id ? {...p, likes: p.likes + 1} : p)
      );
    } catch (error) {
      console.error('Chyba při lajkování fotky:', error);
    }
  }, []);
  
  const handleUnlike = useCallback(async (photo: Photo) => {
    try {
      await unlikePhoto(photo.id, 'current-user-id');
      // Aktualizace počtu lajků v lokálním stavu
      setPhotos(prevPhotos => 
        prevPhotos.map(p => p.id === photo.id ? {...p, likes: Math.max(0, p.likes - 1)} : p)
      );
    } catch (error) {
      console.error('Chyba při odlajkování fotky:', error);
    }
  }, []);
  
  // Handler pro otevření modálu s detailem fotky
  const handleOpenModal = useCallback((photo: Photo) => {
    setModalPhoto(photo);
    setOpenModal(true);
    setAutoplay(false); // Zastavíme autoplay při otevření modálu
  }, []);
  
  // Handler pro zavření modálu
  const handleCloseModal = useCallback(() => {
    setOpenModal(false);
    setAutoplay(true); // Obnovíme autoplay při zavření modálu
  }, []);
  
  // Handler pro stažení fotky
  const handleDownload = useCallback((photo: Photo, e: React.MouseEvent) => {
    e.stopPropagation(); // Zastavíme propagaci události, aby se neotevřel modál
    
    // Použijeme canvas pro stažení s vodoznakem, stejně jako v ostatních komponentách
    const canvasImage = document.querySelector('canvas');
    if (canvasImage) {
      // Vytvoříme vlastní událost stažení
      const downloadEvent = new CustomEvent('canvas-download', {
        detail: { photoId: photo.id }
      });
      canvasImage.dispatchEvent(downloadEvent);
    } else {
      console.error('Canvas element nebyl nalezen pro stažení fotografie');
    }
  }, []);
  
  // Zobrazení chybové hlášky, pokud nastala chyba
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 500 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }
  
  // Aktuální fotka
  const currentPhoto = photos[activeIndex];
  
  if (!currentPhoto || loading) {
    return (
      <Box 
        sx={{ 
          paddingTop: isMobile ? '56.25%' : undefined, // 16:9 poměr pro mobilní zařízení
          height: isMobile ? 0 : 500, 
          width: '100%', 
          bgcolor: 'black', 
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress color="primary" size={50} />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box 
        sx={{
          position: 'relative',
          mb: 4,
          zIndex: 2
        }}
      >
        {/* Uvítací text překrývající galerii */}
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
            pointerEvents: 'none', // Umožní klikání skrz tento element
          }}
        >
          <Typography component="h1" variant="h3" color="white" gutterBottom sx={{ 
            textShadow: '0 2px 10px rgba(0,0,0,0.9)',
            fontWeight: 'bold',
            fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } // Responzivní velikost fontu
          }}>
            {title}
          </Typography>
          <Typography variant="h5" color="white" paragraph sx={{ 
            textShadow: '0 2px 10px rgba(0,0,0,0.9)',
            fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } // Responzivní velikost fontu
          }}>
            {subtitle}
          </Typography>
        </Box>
        
        {/* Carousel s fotkami */}
        <Box 
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          sx={{ position: 'relative' }}
          onClick={() => handleOpenModal(currentPhoto)}
        >
          <Paper
            sx={{
              position: 'relative',
              backgroundColor: 'black',
              color: '#fff',
              overflow: 'hidden',
              height: isMobile ? 0 : 500, // Na mobilu řídíme výšku pomocí paddingTop
              paddingTop: isMobile ? '56.25%' : undefined, // 16:9 poměr pro mobilní zařízení
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              cursor: 'pointer',
            }}
            elevation={4}
          >
            {/* Obsah fotografie - podobný jako v PhotoDetailModal, ale přizpůsobený pro carousel */}
            <Box sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'black',
              overflow: 'hidden'
            }}>
              {/* Samotná fotografie */}
              <CanvasImage
                photoId={currentPhoto.id}
                alt={`Fotografie od ${currentPhoto.photographer}`}
                width="100%"
                height="100%"
                objectFit="contain"
                style={{
                  transition: 'transform 0.5s ease',
                  backgroundColor: 'black',
                }}
              />
              
              {/* Navigační tlačítka na bocích */}
              <Box sx={{ 
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                left: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                zIndex: 10
              }}>
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  sx={{
                    color: 'white',
                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                    opacity: 0.7,
                    borderRadius: 30,
                    width: isMobile ? 40 : 48,
                    height: isMobile ? 40 : 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': { 
                      opacity: 1, 
                      bgcolor: 'rgba(0, 0, 0, 0.5)' 
                    }
                  }}
                >
                  <Box component="span" sx={{ 
                    fontSize: isMobile ? '1.5rem' : '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                    position: 'relative',
                    top: '-1px' 
                  }}>
                    ‹
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ 
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                zIndex: 10
              }}>
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  sx={{
                    color: 'white',
                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                    opacity: 0.7,
                    borderRadius: 30,
                    width: isMobile ? 40 : 48,
                    height: isMobile ? 40 : 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': { 
                      opacity: 1, 
                      bgcolor: 'rgba(0, 0, 0, 0.5)' 
                    }
                  }}
                >
                  <Box component="span" sx={{ 
                    fontSize: isMobile ? '1.5rem' : '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                    position: 'relative',
                    top: '-1px' 
                  }}>
                    ›
                  </Box>
                </Box>
              </Box>
              
              {/* Pačička s informacemi - zobrazena pouze na větších obrazovkách */}
              {!isMobile && (
                <PhotoFooter 
                  photo={currentPhoto}
                  onDownload={handleDownload}
                  maxTags={3}
                />
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
      
      {/* Modál pro detail fotky při kliknutí */}
      {openModal && modalPhoto && (
        <PhotoDetailModal
          photo={modalPhoto}
          allPhotos={photos}
          open={openModal}
          onClose={handleCloseModal}
          onPrevious={handlePrev}
          onNext={handleNext}
          onLike={handleLike}
          onUnlike={handleUnlike}
        />
      )}
    </Box>
  );
}; 