'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Avatar, Chip, Stack, IconButton } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Photo, likePhoto, unlikePhoto } from '@/app/actions/photos';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { keyframes } from '@mui/system';

// Animace srdce při lajkování
const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
`;

// Styly pro kartu fotografii
const cardStyle = {
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  cursor: 'pointer',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  transformOrigin: 'center',
  height: '100%',
  '&:hover': {
    transform: 'scale(1.03)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
  },
};

interface PhotoCardProps {
  photo: Photo;
  onClick?: (photo: Photo) => void;
  userId?: string;  // Přidáno userId pro like/unlike operace
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState<boolean>(photo.isLikedByCurrentUser || false);
  const [likeCount, setLikeCount] = useState<number>(photo.likes || 0);
  const [isLikeProcessing, setIsLikeProcessing] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Aktualizovat stav při změně props
  useEffect(() => {
    setIsLiked(photo.isLikedByCurrentUser || false);
    setLikeCount(photo.likes || 0);
  }, [photo.isLikedByCurrentUser, photo.likes]);
  
  // Animace, když se změní stav lajku
  useEffect(() => {
    if (isLiked) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isLiked]);

  const handleCardClick = () => {
    if (onClick) {
      onClick(photo);
      
      // Aktualizujeme URL s ID fotky
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('photoId', photo.id);
      router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
    }
  };

  const handleLikeClick = useCallback(async (e: React.MouseEvent) => {
    // Zastavit propagaci kliknutí, aby se neotevřel detail fotky
    e.stopPropagation();

    // Kontrola, zda je uživatel přihlášen
    if (!session?.user?.id) return;

    // Zabránit vícenásobnému kliknutí během zpracování
    if (isLikeProcessing) return;
    setIsLikeProcessing(true);

    try {
      // Optimistický update - okamžitě aktualizovat UI
      const wasLiked = isLiked;
      setIsLiked(!wasLiked);
      setLikeCount(prev => wasLiked ? Math.max(0, prev - 1) : prev + 1);

      if (wasLiked) {
        // Odlajkování fotky
        await unlikePhoto(photo.id, session.user.id);
      } else {
        // Lajkování fotky
        await likePhoto(photo.id, session.user.id);
      }
    } catch (error) {
      console.error('Chyba při zpracování lajku:', error);
      
      // Pokud se operace nezdaří, vrátit původní stav
      setIsLiked(prev => !prev);
      setLikeCount(prev => isLiked ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setIsLikeProcessing(false);
    }
  }, [isLiked, photo.id, session, isLikeProcessing]);

  return (
    <Card 
      onClick={handleCardClick} 
      sx={cardStyle}
    >
      <CardMedia
        component="img"
        image={photo.thumbnailUrl}
        alt={`Fotografie od ${photo.photographer}`}
        sx={{ 
          aspectRatio: '4/3',
          objectFit: 'cover'
        }}
      />
      
      <CardContent sx={{ pt: 1.5, pb: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          mb: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
              src={photo.avatarUrl} 
              alt={photo.photographer}
              sx={{ width: 28, height: 28 }}
            >
              {photo.photographer.charAt(0)}
            </Avatar>
            <Typography variant="body2" fontWeight="medium" color="text.primary">
              {photo.photographer}
            </Typography>
          </Box>
          {/* Počet liků s tlačítkem pro lajkování - stabilní šířka */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            minWidth: 42,    // Stabilní šířka pro oblast lajků
            justifyContent: 'flex-end'
          }}>
            {session?.user ? (
              <IconButton 
                size="small" 
                onClick={handleLikeClick}
                color={isLiked ? "primary" : "default"}
                disabled={isLikeProcessing}
                sx={{ 
                  p: 0.5,
                  animation: isAnimating ? `${pulseAnimation} 0.5s ease-in-out` : 'none',
                  transition: 'color 0.3s ease-in-out'
                }}
              >
                {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
              </IconButton>
            ) : (
              <FavoriteBorderIcon fontSize="small" color="action" />
            )}
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ minWidth: 14, textAlign: 'center' }}
            >
              {likeCount}
            </Typography>
          </Box>
        </Box>
        
        {photo.event && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mb: 2 }}
            component="div"
          >
            {photo.event}
          </Typography>
        )}

        {photo.tags && photo.tags.length > 0 && (
          <Stack 
            direction="row" 
            spacing={0.5} 
            sx={{ 
              flexWrap: 'wrap', 
              gap: 0.5, 
              mt: 'auto' 
            }}
          >
            {photo.tags.slice(0, 3).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                }}
              />
            ))}
            {photo.tags.length > 3 && (
              <Chip
                label={`+${photo.tags.length - 3}`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  bgcolor: 'primary.main',
                  color: 'white',
                  fontWeight: 'medium'
                }}
              />
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}; 