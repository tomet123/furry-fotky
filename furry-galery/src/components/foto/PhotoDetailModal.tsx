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

  const toggleFitMode = () => {
    setFitMode(prev => prev === 'contain' ? 'cover' : 'contain');
  };

  const handleDownload = () => {
    const downloadLink = document.createElement('a');
    downloadLink.href = currentPhoto.imageUrl;
    downloadLink.download = `photo-${currentPhoto.id}`;
    downloadLink.click();
  };

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.target as HTMLImageElement;
    setImgDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
    setLoading(false);
  };

  const handleImageError = () => {
    setLoading(false);
  };

  // Výpočet rozměrů modálního okna
  const modalWidth = fullScreen ? '100%' : 
    isSmall ? '95vw' : 
    imgDimensions.width > 0 ? 
      // Přesná šířka fotografie bez paddingu, omezená maximální šířkou viewportu
      Math.min(imgDimensions.width, windowSize.width * MAX_WIDTH_PERCENTAGE) + 'px' : 
      '95vw';

  const modalHeight = fullScreen ? '100%' : 
    isSmall ? '95vh' : 
    imgDimensions.height > 0 ? 
      // Přesná výška fotografie bez paddingu, omezená maximální výškou viewportu
      Math.min(imgDimensions.height, windowSize.height * MAX_HEIGHT_PERCENTAGE) + 'px' : 
      '95vh';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          m: 0,
          width: loading ? '95vw' : modalWidth,
          height: loading ? '95vh' : modalHeight,
          bgcolor: 'black',
          overflow: 'hidden',
          borderRadius: { xs: 0, sm: 1 },
          backgroundImage: 'none',
          transition: 'width 0.3s, height 0.3s',
        }
      }}
    >
      <Box sx={photoContainerStyle}>
        {/* Indikátor načítání */}
        {loading && (
          <Box sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: `3px solid rgba(255, 255, 255, 0.2)`,
                borderTop: `3px solid ${theme.palette.primary.main}`,
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }}
            />
          </Box>
        )}

        {/* Fotografie */}
        <Box
          component="img"
          src={currentPhoto.imageUrl}
          alt={`Fotografie od ${currentPhoto.photographer}`}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: fitMode,
            objectPosition: 'center',
            transition: 'object-fit 0.3s ease',
            opacity: loading ? 0 : 1,
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {/* Horní panel s ovládacími prvky */}
        <Box sx={{
          ...headerStyle,
          py: 1,
          px: 2,
        }}>
          {/* Levá strana */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* Box pro lajkování a přepínání režimu zobrazení v jednom tmavém boxu */}
            <Box sx={likeBoxStyle}>
              {/* Lajkování */}
              <Tooltip title={liked ? 'Odebrat lajk' : 'Přidat lajk'}>
                <IconButton
                  onClick={handleLikeClick}
                  disabled={likeInProgress || (!onLike && !onUnlike)}
                  aria-label={liked ? 'Odebrat lajk' : 'Přidat lajk'}
                  sx={{ 
                    ...actionButtonStyle,
                    bgcolor: 'transparent',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.3)' } 
                  }}
                  size="small"
                >
                  <Box component="span" sx={{ fontSize: '1.2rem' }}>
                    {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </Box>
                </IconButton>
              </Tooltip>
              <Typography sx={{ fontWeight: 'bold', color: 'white', mr: 1 }}>
                {likeCount}
              </Typography>
              
              {/* Tlačítko pro přepínání režimu zobrazení */}
              <IconButton
                onClick={toggleFitMode}
                aria-label={fitMode === 'contain' ? 'zvětšit na celou plochu' : 'zobrazit celou fotku'}
                sx={{ 
                  ...actionButtonStyle,
                  bgcolor: 'transparent',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.3)' } 
                }}
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

        {/* Info panel překrývající spodní část fotografie */}
        <Box sx={footerStyle}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            flexWrap: 'wrap',
            gap: { xs: 1, sm: 2 },
            justifyContent: 'space-between'
          }}>
            {/* Levá strana - fotograf a event */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 2 },
              flexWrap: 'wrap'
            }}>
              {/* Fotograf */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1
              }}>
                <Avatar 
                  src={currentPhoto.avatarUrl}
                  sx={{ 
                    width: SMALL_AVATAR_SIZE, 
                    height: SMALL_AVATAR_SIZE,
                    bgcolor: 'primary.main'
                  }}
                >
                  {currentPhoto.photographer.charAt(0)}
                </Avatar>
                <Typography variant="body2" fontWeight="medium" sx={{ color: 'white' }}>
                  {currentPhoto.photographer}
                </Typography>
              </Box>
              
              {currentPhoto.event && (
                <>
                  <Box sx={dotSeparatorStyle} />
                  
                  {/* Akce */}
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    {currentPhoto.event}
                  </Typography>
                </>
              )}

              {/* Tagy */}
              {currentPhoto.tags && currentPhoto.tags.length > 0 && (
                <>
                  {/* Oddělovač před tagy pro větší obrazovky */}
                  <Box 
                    sx={{ 
                      ...dotSeparatorStyle,
                      display: { xs: 'none', sm: 'block' }
                    }} 
                  />

                  {/* Tagy pro větší obrazovky */}
                  <Stack 
                    direction="row" 
                    spacing={0.5} 
                    sx={{ 
                      flexWrap: 'wrap',
                      gap: 0.5,
                      display: { xs: 'none', sm: 'flex' }
                    }}
                  >
                    {currentPhoto.tags?.slice(0, fullScreen ? 3 : 6).map((tag: string) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={tagChipStyle}
                      />
                    ))}
                  </Stack>
                </>
              )}
            </Box>

            {/* Pravá strana - tlačítko pro stažení fotografie */}
            <Box sx={controlBoxStyle}>
              <IconButton
                onClick={handleDownload}
                aria-label="stáhnout fotografii"
                sx={actionButtonStyle}
                size="small"
              >
                <Box component="span" sx={{ fontSize: '1.2rem' }}>
                  ↓
                </Box>
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};