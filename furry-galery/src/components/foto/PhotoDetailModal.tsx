'use client';

import React, { useState, useEffect, useTransition } from 'react';
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
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Photo } from '@/app/actions/photos';
import { getPhotoById } from '@/app/actions/photos';
import { PhotoFooter } from './PhotoFooter';

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
}

export const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({
  photo,
  allPhotos = [],
  open,
  onClose,
  onNext,
  onPrevious,
  onLike,
  onUnlike
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(photo?.likes || 0);
  const [likeInProgress, setLikeInProgress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const windowSize = useWindowSize();
  
  // Při změně fotky aktualizujeme stav
  useEffect(() => {
    if (photo) {
      // Zde by měla být správná logika pro zjištění, zda uživatel už fotografii olajkoval
      // Protože nemáme vlastnost 'liked' přímo v objektu Photo, 
      // předpokládáme, že tato informace by měla být zjištěna jinak
      setLiked(false); // Výchozí hodnota, měla by být nahrazena skutečnou logikou
      setLikeCount(photo.likes || 0);
      setLoading(true);
    }
  }, [photo]);

  const currentPhoto = photo;

  if (!currentPhoto) {
    return null;
  }

  const handleLikeClick = async () => {
    if (likeInProgress) return;
    
    setLikeInProgress(true);
    
    try {
      if (liked) {
        if (onUnlike) {
          await onUnlike(currentPhoto);
          setLiked(false);
          setLikeCount(prev => Math.max(0, prev - 1));
        }
      } else {
        if (onLike) {
          await onLike(currentPhoto);
          setLiked(true);
          setLikeCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error liking/unliking photo:', error);
    } finally {
      setLikeInProgress(false);
    }
  };

  const handleDownload = () => {
    const downloadLink = document.createElement('a');
    downloadLink.href = currentPhoto.imageUrl;
    downloadLink.download = `photo-${currentPhoto.id}`;
    downloadLink.click();
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
          m: 0,
          p: 0,
          borderRadius: fullScreen ? 0 : 2,
          overflow: 'hidden',
        }
      }}
    >
      <Box sx={photoContainerStyle}>
        {loading && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%'
          }}>
            <Typography color="white">Načítání...</Typography>
          </Box>
        )}
        
        <Box
          component="img"
          src={currentPhoto.imageUrl}
          alt={`Fotografie od ${currentPhoto.photographer}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          sx={{
            width: fullScreen ? '100%' : calculateImageSize().width,
            height: fullScreen ? '100%' : calculateImageSize().height,
            objectFit: fitMode,
            visibility: loading ? 'hidden' : 'visible',
            transition: 'all 0.3s ease',
          }}
        />
        
        {/* Kontrolní panel v horní části */}
        <Box sx={headerStyle}>
          {/* Levá strana - lajky a ovládací prvky */}
          <Box sx={{
            display: 'flex',
            p: 2,
            gap: 1
          }}>
            {/* Lajky */}
            <Box 
              sx={{
                ...likeBoxStyle,
                color: liked ? 'primary.main' : 'white',
              }}
              onClick={handleLikeClick}
            >
              {liked ? (
                <FavoriteIcon sx={{ fontSize: 20, color: '#ff6b81' }} />
              ) : (
                <FavoriteBorderIcon sx={{ fontSize: 20 }} />
              )}
              <Typography variant="body2">
                {likeCount}
              </Typography>
            </Box>
            
            {/* Tlačítko pro změnu režimu zobrazení */}
            <Box sx={controlBoxStyle}>
              <IconButton
                onClick={toggleFitMode}
                aria-label="změnit režim zobrazení"
                sx={actionButtonStyle}
                size="small"
              >
                <Box component="span" sx={{ fontSize: '1.2rem' }}>
                  {fitMode === 'contain' ? '⤢' : '◱'}
                </Box>
              </IconButton>
            </Box>
          </Box>
          
          {/* Pravá strana - zavírací tlačítko */}
          <IconButton
            onClick={onClose}
            aria-label="zavřít"
            sx={{
              color: 'white',
              ...darkOverlayStyle,
              ...darkOverlayHoverStyle
            }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        
        {/* Navigační tlačítka na bocích */}
        {onPrevious && (
          <Box sx={{ 
            ...navContainerStyle,
            left: 0,
          }}>
            <IconButton
              onClick={onPrevious}
              aria-label="předchozí fotografie"
              sx={navButtonStyle}
            >
              <Box component="span" sx={{ fontSize: '2rem' }}>
                ‹
              </Box>
            </IconButton>
          </Box>
        )}
        
        {onNext && (
          <Box sx={{ 
            ...navContainerStyle,
            right: 0,
          }}>
            <IconButton
              onClick={onNext}
              aria-label="další fotografie"
              sx={navButtonStyle}
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