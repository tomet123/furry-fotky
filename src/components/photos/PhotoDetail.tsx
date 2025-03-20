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
  Paper,
  Button,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Photo } from '@/hooks/usePhotoItems';
import Link from 'next/link';

// Hook pro sledování velikosti okna
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  
  useEffect(() => {
    // Funkce pro aktualizaci rozměrů
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    // Přidání event listeneru pro změnu velikosti okna
    window.addEventListener('resize', handleResize);
    
    // Inicializace dat při prvním renderování
    handleResize();
    
    // Vyčištění při odpojení komponenty
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return windowSize;
}

interface PhotoDetailProps {
  photo: Photo | null;
  open?: boolean;
  onClose?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onLike?: (photo: Photo) => Promise<void>;
  onUnlike?: (photo: Photo) => Promise<void>;
  mode?: "dialog" | "inline";
  height?: number | string;
  showLikes?: boolean;
  showViewAllButton?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  title?: string;
}

/**
 * Komponenta pro zobrazení detailu fotografie v modálním okně nebo inline
 */
export const PhotoDetail: React.FC<PhotoDetailProps> = ({ 
  photo, 
  open = true, 
  onClose = () => {},
  onNext,
  onPrevious,
  onLike,
  onUnlike,
  mode = "dialog",
  height = 500,
  showLikes = true,
  showViewAllButton = true,
  showHeader = true,
  showFooter = true,
  title = "Nejoblíbenější fotky"
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  const [loading, setLoading] = useState(true);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(photo?.likes || 0);
  const [likeInProgress, setLikeInProgress] = useState(false);
  const windowSize = useWindowSize();

  // Pokud nemáme foto, nezobrazujeme nic
  if (!photo) {
    return null;
  }

  // Aktualizujeme počet lajků při změně fotografie
  useEffect(() => {
    if (photo) {
      setLikeCount(photo.likes);
      setLiked(false); // Reset stavu like při změně fotografie
    }
  }, [photo]);

  const toggleFitMode = () => {
    setFitMode(prev => prev === 'contain' ? 'cover' : 'contain');
  };

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.target as HTMLImageElement;
    setImgDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
    setLoading(false);
    
    // Nastavíme znovu velikost modálního okna po načtení obrázku
    // Toto je potřeba pro správné vykreslení bez okrajů
    if (mode === "dialog") {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
    }
  };

  const handleImageError = () => {
    setLoading(false);
    // Nastavit základní rozměry v případě chyby při načítání
    setImgDimensions({ width: 800, height: 600 });
    
    // Nastavíme znovu velikost modálního okna po chybě
    if (mode === "dialog") {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
    }
  };

  const handleLikeClick = async () => {
    if (likeInProgress || !photo || (!onLike && !onUnlike)) return;
    
    setLikeInProgress(true);
    
    try {
      if (liked) {
        if (onUnlike) {
          await onUnlike(photo);
          setLikeCount(prev => Math.max(prev - 1, 0));
          setLiked(false);
        }
      } else {
        if (onLike) {
          await onLike(photo);
          setLikeCount(prev => prev + 1);
          setLiked(true);
        }
      }
    } catch (error) {
      console.error('Chyba při lajkování:', error);
    } finally {
      setLikeInProgress(false);
    }
  };

  const MAX_WIDTH_PERCENTAGE = 0.75; // Maximální šířka jako procento viewportu
  const MAX_HEIGHT_PERCENTAGE = 0.75; // Maximální výška jako procento viewportu

  // Výpočet rozměrů modálního okna
  let modalWidth = fullScreen ? '100%' : 
    isSmall ? '95vw' : 
    imgDimensions.width > 0 ? 
      // Přesná šířka fotografie bez paddingu, omezená maximální šířkou viewportu
      Math.min(imgDimensions.width, windowSize.width * MAX_WIDTH_PERCENTAGE) + 'px' : 
      '95vw';

  let modalHeight = fullScreen ? '100%' : 
    isSmall ? '95vh' : 
    imgDimensions.height > 0 ? 
      // Přesná výška fotografie bez paddingu, omezená maximální výškou viewportu
      Math.min(imgDimensions.height, windowSize.height * MAX_HEIGHT_PERCENTAGE) + 'px' : 
      '95vh';

  // Obsah detailu fotografie
  const photoContent = (
    <Box sx={{ 
      position: 'relative', 
      height: '100%',
      width: '100%',
      bgcolor: 'black'
    }}>
      {/* Fotografie */}
      <Box sx={{ 
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
      }}>
        {/* Loading spinner */}
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

        {/* Samotná fotografie */}
        <Box
          component="img"
          src={photo.imageUrl || `/api/image?width=1920&height=1080&seed=${photo.id + 50}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: mode === "dialog" ? fitMode : 'cover',
            objectPosition: 'center',
            transition: 'object-fit 0.3s ease',
            opacity: loading ? 0 : 1,
            p: 0,
            m: 0
          }}
        />

        {/* Horní panel s ovládacími prvky */}
        {showHeader && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            py: mode === "inline" ? 2 : 1,
            px: mode === "inline" ? 3 : 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
            zIndex: 10
          }}>
            {/* Levá strana */}
            {mode === "inline" ? (
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {title}
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {showLikes && (
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(0, 0, 0, 0.3)'
                  }}>
                    <Tooltip title={liked ? 'Odebrat lajku' : 'Přidat lajku'}>
                      <IconButton
                        onClick={handleLikeClick}
                        aria-label={liked ? 'Odebrat lajku' : 'Přidat lajku'}
                        sx={{
                          color: 'white',
                          bgcolor: 'rgba(0, 0, 0, 0.3)',
                          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.5)' },
                          p: 1,
                          height: 32,
                          width: 32
                        }}
                        size="small"
                      >
                        <Box component="span" sx={{ fontSize: '1.2rem' }}>
                          {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        </Box>
                      </IconButton>
                    </Tooltip>
                    <Typography sx={{ fontWeight: 'bold', color: 'white' }}>
                      {likeCount}
                    </Typography>
                  </Box>
                )}
                
                {/* Tlačítko pro přepínání režimu zobrazení */}
                {mode === "dialog" && (
                  <IconButton
                    onClick={toggleFitMode}
                    aria-label={fitMode === 'contain' ? 'zvětšit na celou plochu' : 'zobrazit celou fotku'}
                    sx={{
                      color: 'white',
                      bgcolor: 'rgba(0, 0, 0, 0.3)',
                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.5)' },
                      p: 1,
                      height: 32,
                      width: 32
                    }}
                    size="small"
                  >
                    <Box component="span" sx={{ fontSize: '1.2rem' }}>
                      {fitMode === 'contain' ? '⤢' : '◱'}
                    </Box>
                  </IconButton>
                )}
              </Box>
            )}

            {/* Pravá strana */}
            {mode === "inline" && showLikes && (
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.7,
                borderRadius: 2,
                bgcolor: 'rgba(0, 0, 0, 0.3)'
              }}>
                <Tooltip title={liked ? 'Odebrat lajku' : 'Přidat lajku'}>
                  <IconButton
                    onClick={handleLikeClick}
                    aria-label={liked ? 'Odebrat lajku' : 'Přidat lajku'}
                    sx={{
                      color: 'white',
                      bgcolor: 'rgba(0, 0, 0, 0.3)',
                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.5)' },
                      p: 1,
                      height: 32,
                      width: 32
                    }}
                    size="small"
                  >
                    <Box component="span" sx={{ fontSize: '1.2rem' }}>
                      {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </Box>
                  </IconButton>
                </Tooltip>
                <Typography sx={{ fontWeight: 'bold', color: 'white' }}>
                  {likeCount}
                </Typography>
              </Box>
            )}
            
            {mode === "dialog" && (
              <IconButton
                onClick={onClose}
                aria-label="zavřít"
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(0, 0, 0, 0.3)',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.5)' }
                }}
                size="small"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        )}
        
        {/* Navigační tlačítka na bocích */}
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '50%',
          display: 'flex',
          alignItems: 'center',
          px: 2,
          zIndex: 9
        }}>
          {onPrevious && (
            <IconButton
              onClick={onPrevious}
              aria-label="předchozí fotografie"
              sx={{
                color: 'white',
                bgcolor: 'rgba(0, 0, 0, 0.3)',
                opacity: 0.7,
                borderRadius: 30, // Oválný tvar místo hranatého
                width: 48,
                height: 48,
                '&:hover': { 
                  opacity: 1, 
                  bgcolor: 'rgba(0, 0, 0, 0.5)' 
                }
              }}
            >
              <Box component="span" sx={{ fontSize: '2rem' }}>
                ‹
              </Box>
            </IconButton>
          )}
        </Box>
        
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100%',
          width: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          px: 2,
          zIndex: 9
        }}>
          {onNext && (
            <IconButton
              onClick={onNext}
              aria-label="další fotografie"
              sx={{
                color: 'white',
                bgcolor: 'rgba(0, 0, 0, 0.3)',
                opacity: 0.7,
                borderRadius: 30, // Oválný tvar místo hranatého
                width: 48,
                height: 48,
                '&:hover': { 
                  opacity: 1, 
                  bgcolor: 'rgba(0, 0, 0, 0.5)' 
                }
              }}
            >
              <Box component="span" sx={{ fontSize: '2rem' }}>
                ›
              </Box>
            </IconButton>
          )}
        </Box>

        {/* Info panel překrývající spodní část fotografie */}
        {showFooter && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              p: 2,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
              color: 'white',
              zIndex: 10
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              flexWrap: 'wrap',
              gap: { xs: 1, sm: 2 }
            }}>
              {/* Fotograf */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1
              }}>
                <Avatar 
                  sx={{ 
                    width: 28, 
                    height: 28,
                    bgcolor: 'primary.main'
                  }}
                >
                  {photo.photographer.charAt(0)}
                </Avatar>
                <Typography variant="body2" fontWeight="medium" sx={{ color: 'white' }}>
                  {photo.photographer}
                </Typography>
              </Box>
              
              <Box sx={{ 
                width: 4, 
                height: 4, 
                borderRadius: '50%', 
                bgcolor: 'rgba(255, 255, 255, 0.5)'
              }} />
              
              {/* Akce */}
              <Typography variant="body2" sx={{ color: 'white' }}>
                {photo.event}
              </Typography>
  
              {/* Oddělovač před tagy pro větší obrazovky */}
              <Box 
                sx={{ 
                  width: 4, 
                  height: 4, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(255, 255, 255, 0.5)',
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
                {photo.tags.slice(0, fullScreen ? 3 : 6).map((tag: string) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: '0.7rem',
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      color: 'white'
                    }}
                  />
                ))}
              </Stack>
              
              {/* Tlačítko pro zobrazení všech fotek */}
              {mode === "inline" && showViewAllButton && (
                <Button 
                  variant="contained" 
                  component={Link} 
                  href="/photos"
                  sx={{ 
                    mt: 2,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                    display: 'block',
                    width: '100%'
                  }}
                >
                  Procházet všechny fotky
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );

  // Vrácení komponenty podle režimu zobrazení
  if (mode === "dialog") {
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
            height: loading ? '70vh' : modalHeight,
            bgcolor: 'black',
            overflow: 'hidden',
            borderRadius: { xs: 0, sm: 1 },
            backgroundImage: 'none',
            transition: 'width 0.3s, height 0.3s',
            boxSizing: 'content-box'
          }
        }}
      >
        {photoContent}
      </Dialog>
    );
  } else {
    return (
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'black',
          color: '#fff',
          mb: 4,
          overflow: 'hidden',
          height: height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
        }}
        elevation={4}
      >
        {photoContent}
      </Paper>
    );
  }
}; 