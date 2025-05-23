'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Dialog, 
  Box, 
  IconButton, 
  Typography, 
  Avatar, 
  Stack, 
  Chip, 
  useMediaQuery, 
  useTheme,
  Button,
  Tooltip,
  Fade,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DownloadIcon from '@mui/icons-material/Download';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import { Photo } from '@/app/actions/photos';
import { getPhotoById, getSecurePhotoUrl } from '@/app/actions/photos';
import { PhotoFooter } from './PhotoFooter';
import { formatDistanceToNow } from 'date-fns';
import { cs } from 'date-fns/locale';
import { keyframes } from '@mui/system';
import styles from './PhotoDetailModal.module.css';
import CanvasImage from './CanvasImage';
import { useSession } from 'next-auth/react';

// Animace srdce při lajkování
const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
`;

// Stylové konstanty
const MAX_WIDTH_PERCENTAGE = 0.75; // Maximální šířka jako procento viewportu
const MAX_HEIGHT_PERCENTAGE = 0.75; // Maximální výška jako procento viewportu
const SMALL_AVATAR_SIZE = 32; // Velikost avataru fotografa

// Hook pro sledování velikosti okna
function useWindowSize() {
  // Inicializujeme state s prázdnými hodnotami pro SSR
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  
  useEffect(() => {
    // Funkce pro aktualizaci rozměrů
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    // Spustíme pouze na klientovi (browser)
    if (typeof window !== 'undefined') {
      // Přidání event listeneru pro změnu velikosti okna
      window.addEventListener('resize', handleResize);
      
      // Inicializace dat při prvním renderování
      handleResize();
      
      // Vyčištění při odpojení komponenty
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  
  return windowSize;
}

const darkOverlayStyle = {
  bgcolor: 'rgba(0, 0, 0, 0.3)',
};

const darkOverlayHoverStyle = {
  '&:hover': { 
    bgcolor: 'rgba(0, 0, 0, 0.5)' 
  }
};

const navButtonStyle = {
  color: 'white',
  ...darkOverlayStyle,
  opacity: 0.7,
  borderRadius: 30, // Oválný tvar místo hranatého
  width: 48,
  height: 48,
  '&:hover': { 
    opacity: 1, 
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
  // darkOverlayStyle odstraněno pro průhlednost
};

const likeBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  px: 1.5,
  py: 0.5,
  borderRadius: 2,
  ...darkOverlayStyle,
  marginRight: 1,
};

const headerStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
  zIndex: 10
};

const footerStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
  padding: '16px',
  zIndex: 10
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

const photoContainerStyle = { 
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  p: 0,
  m: 0,
  bgcolor: 'black',
  overflow: 'hidden'
};

const navContainerStyle = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  p: 2,
  zIndex: 10
};

export interface PhotoDetailModalProps {
  photo: Photo;
  allPhotos?: Photo[];
  open: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onLike?: (photo: Photo) => Promise<void>;
  onUnlike?: (photo: Photo) => Promise<void>;
  isLoading?: boolean;
}

export const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({
  photo,
  allPhotos = [],
  open,
  onClose,
  onNext,
  onPrevious,
  onLike,
  onUnlike,
  isLoading = false
}) => {
  const { data: session } = useSession();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(photo?.likes || 0);
  const [likeInProgress, setLikeInProgress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(photo);
  const [isNavigating, setIsNavigating] = useState(false);
  const windowSize = useWindowSize();
  
  // Při změně fotky aktualizujeme stav, ale nezavíráme modál
  useEffect(() => {
    if (photo) {
      console.log('Aktualizuji foto v modálu:', photo.id);
      setCurrentPhoto(photo);
      // Nastavíme na základě vlastnosti isLikedByCurrentUser z objektu Photo
      setLiked(photo.isLikedByCurrentUser || false);
      setLikeCount(photo.likes || 0);
      
      // Nastavíme krátké loading, ale neblokujeme zobrazení předchozí fotografie
      const timer = setTimeout(() => {
        setLoading(false);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [photo]);
  
  // Animace, když se změní stav lajku
  useEffect(() => {
    if (liked) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [liked]);

  // Nová metoda pro bezpečnější navigaci
  const safeNavigate = useCallback((direction: 'next' | 'prev') => {
    if (isNavigating) return; // Zabraňuje opakovaným kliknutím

    setIsNavigating(true);
    console.log(`Navigace ${direction} zahájena`);

    if (direction === 'next' && onNext) {
      onNext();
    } else if (direction === 'prev' && onPrevious) {
      onPrevious();
    }

    // Uvolníme zámek navigace po určité době
    setTimeout(() => {
      setIsNavigating(false);
      console.log('Navigace odemčena');
    }, 300);
  }, [onNext, onPrevious, isNavigating]);

  // Funkce pro obsluhu klávesnice
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'ArrowLeft' && onPrevious) {
        e.preventDefault();
        safeNavigate('prev');
      } else if (e.key === 'ArrowRight' && onNext) {
        e.preventDefault();
        safeNavigate('next');
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, safeNavigate, onClose, onNext, onPrevious]);

  if (!currentPhoto) {
    return null;
  }

  const handleLikeClick = async () => {
    if (likeInProgress) return;
    
    setLikeInProgress(true);
    
    try {
      // Optimistický update - okamžitě aktualizovat UI
      const wasLiked = liked;
      setLiked(!wasLiked);
      setLikeCount(prev => wasLiked ? Math.max(0, prev - 1) : prev + 1);
      
      if (wasLiked) {
        if (onUnlike) {
          await onUnlike(currentPhoto);
        }
      } else {
        if (onLike) {
          await onLike(currentPhoto);
        }
      }
    } catch (error) {
      console.error('Error liking/unliking photo:', error);
      
      // Pokud se operace nezdaří, vrátit původní stav
      setLiked(prev => !prev);
      setLikeCount(prev => liked ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setLikeInProgress(false);
    }
  };

  const handleDownload = () => {
    // Použijeme metodu pro stažení z CanvasImage komponenty
    // Tato metoda je interní pro komponentu, takže musíme použít její vlastní
    // implementaci pro bezpečné stažení s vodoznakem
    const canvasImage = document.querySelector('canvas');
    if (canvasImage) {
      // Vytvoříme vlastní událost stažení
      const downloadEvent = new CustomEvent('canvas-download', {
        detail: { photoId: currentPhoto.id }
      });
      canvasImage.dispatchEvent(downloadEvent);
    } else {
      console.error('Canvas element nebyl nalezen pro stažení fotografie');
    }
  };

  const calculateImageSize = () => {
    if (!windowSize.width || !windowSize.height || !imgDimensions.width || !imgDimensions.height) {
      return { width: '100%', height: '100%' };
    }

    const maxWidth = windowSize.width * MAX_WIDTH_PERCENTAGE;
    const maxHeight = windowSize.height * MAX_HEIGHT_PERCENTAGE;
    
    // Poměr stran obrázku
    const imageRatio = imgDimensions.width / imgDimensions.height;
    
    // Výpočet rozměrů s ohledem na maximální povolené hodnoty
    let width = imgDimensions.width;
    let height = imgDimensions.height;
    
    if (width > maxWidth) {
      width = maxWidth;
      height = width / imageRatio;
    }
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * imageRatio;
    }
    
    return { 
      width: `${width}px`, 
      height: `${height}px` 
    };
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImgDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
    setLoading(false);
  };

  const handleImageError = () => {
    setLoading(false);
  };

  const toggleFitMode = () => {
    setFitMode(prev => prev === 'contain' ? 'cover' : 'contain');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          bgcolor: 'black',
          width: fullScreen ? '100%' : 'auto',
          height: fullScreen ? '100%' : 'auto',
          maxWidth: fullScreen ? '100%' : 'none',
          maxHeight: fullScreen ? '100%' : 'none',
          m: fullScreen ? 0 : 1, // Zmenšené okraje (z defaultních hodnot)
          p: 0,
          borderRadius: fullScreen ? 0 : 2,
          overflow: 'hidden',
          position: 'relative'
        }
      }}
    >
      <IconButton
        onClick={onClose}
        aria-label="zavřít"
        className={styles.closeButton}
        size="medium"
        sx={{ 
          width: isSmall ? 48 : 40,
          height: isSmall ? 48 : 40
        }}
      >
        <CloseIcon />
      </IconButton>
      
      <Box 
        className={styles.photoContainer} 
        sx={{ position: 'relative' }}
      >
        {(loading || isLoading) && (
          <Box className={styles.loadingContainer}>
            <CircularProgress color="primary" size={40} />
          </Box>
        )}
      
        <CanvasImage
          photoId={currentPhoto.id}
          alt={`Fotografie od ${currentPhoto.photographer}`}
          objectFit={fitMode}
          onLoad={() => {
            console.log('CanvasImage načtena pro foto:', currentPhoto.id);
            setLoading(false);
            if (imgDimensions.width === 0) {
              // Pokud nemáme rozměry, použijeme přímo z currentPhoto nebo defaultní hodnoty
              setImgDimensions({
                width: 1200, // Defaultní hodnota, pokud není k dispozici
                height: 800  // Defaultní hodnota, pokud není k dispozici
              });
            }
          }}
          onError={handleImageError}
          width={fullScreen ? '100%' : calculateImageSize().width}
          height={fullScreen ? '100%' : calculateImageSize().height}
          style={{
            visibility: 'visible', // Vždy viditelné, aby se zabránilo blikání
            opacity: loading || isLoading ? 0.3 : 1, // Nastavíme průhlednost místo skrytí
            transition: 'opacity 0.2s ease-in-out', // Plynulý přechod
          }}
        />
        
        {/* Kontrolní panel v horní části */}
        <Box className={styles.header}>
          {/* Levá strana - lajky a ovládací prvky */}
          <Box sx={{
            display: 'flex',
            gap: 1
          }}>
            {/* Lajky - zobrazit pouze pokud je uživatel přihlášený */}
            {session?.user ? (
              <Box 
                onClick={handleLikeClick}
                sx={{
                  color: liked ? 'primary.main' : 'white',
                  display: 'flex', 
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px',
                  padding: '4px 12px',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)'
                  }
                }}
              >
                <IconButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikeClick();
                  }} 
                  disabled={likeInProgress}
                  sx={{ 
                    color: liked ? 'primary.main' : 'white',
                    animation: isAnimating ? `${pulseAnimation} 0.5s ease-in-out` : 'none',
                    transition: 'color 0.3s ease-in-out',
                    padding: '4px'
                  }}
                  size="small"
                >
                  {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                <Typography color="white" variant="body2" sx={{ ml: 0.5 }}>
                  {likeCount}
                </Typography>
              </Box>
            ) : (
              <Box 
                sx={{
                  color: 'white',
                  display: 'flex', 
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px',
                  padding: '4px 12px',
                }}
              >
                <FavoriteBorderIcon fontSize="small" sx={{ color: 'white', mr: 0.5 }} />
                <Typography color="white" variant="body2">
                  {likeCount}
                </Typography>
              </Box>
            )}
            
            {/* Tlačítko pro změnu režimu zobrazení */}
            <Box 
              onClick={toggleFitMode}
              sx={{
                display: 'flex', 
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                padding: '4px 12px',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.5)'
                }
              }}
            >
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFitMode();
                }}
                aria-label="změnit režim zobrazení"
                size="small"
                sx={{ 
                  color: 'white',
                  padding: '4px'
                }}
              >
                <Box component="span" sx={{ fontSize: '1.2rem' }}>
                  {fitMode === 'contain' ? '⤢' : '◱'}
                </Box>
              </IconButton>
              <Typography color="white" variant="body2" sx={{ ml: 0.5 }}>
                {fitMode === 'contain' ? 'Celý' : 'Vyplnit'}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Navigační tlačítka na bocích */}
        {onPrevious && !loading && (
          <Box sx={{ 
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            zIndex: 10,
            left: 0,
          }}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                safeNavigate('prev');
              }}
              disabled={isNavigating}
              aria-label="předchozí fotografie"
              className={styles.navButton}
              sx={{
                visibility: 'visible', // Vždy viditelné
                opacity: 0.8,
                '&:hover': {
                  opacity: 1,
                }
              }}
            >
              <Box component="span" sx={{ fontSize: '2rem' }}>
                ‹
              </Box>
            </IconButton>
          </Box>
        )}
        
        {onNext && !loading && (
          <Box sx={{ 
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            zIndex: 10,
            right: 0,
          }}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                safeNavigate('next');
              }}
              disabled={isNavigating}
              aria-label="další fotografie"
              className={styles.navButton}
              sx={{
                visibility: 'visible', // Vždy viditelné
                opacity: 0.8,
                '&:hover': {
                  opacity: 1,
                }
              }}
            >
              <Box component="span" sx={{ fontSize: '2rem' }}>
                ›
              </Box>
            </IconButton>
          </Box>
        )}

        {/* Použití komponenty PhotoFooter */}
        <PhotoFooter 
          photo={currentPhoto}
          onDownload={handleDownload}
          maxTags={fullScreen ? 3 : 6}
          fullScreen={fullScreen}
        />
      </Box>
    </Dialog>
  );
};