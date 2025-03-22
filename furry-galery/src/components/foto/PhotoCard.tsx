'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Avatar, Chip, Stack } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Photo } from '@/app/actions/photos';
import { PhotoDetailModal } from '@/components/foto/PhotoDetailModal';
import { likePhoto, unlikePhoto } from '@/app/actions/photos';

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
  allPhotos?: Photo[];
  onClick?: (photo: Photo) => void;
  userId?: string;  // Přidáno userId pro like/unlike operace
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, allPhotos = [], onClick, userId = '1' }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Při otevření modálu najdeme index aktuální fotografie v poli všech fotografií
  useEffect(() => {
    if (modalOpen && allPhotos.length > 0) {
      const index = allPhotos.findIndex(p => p.id === photo.id);
      if (index !== -1) {
        setCurrentPhotoIndex(index);
      }
    }
  }, [modalOpen, photo.id, allPhotos]);

  const handleCardClick = () => {
    if (onClick) {
      onClick(photo);
    } else {
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleLike = async (photo: Photo) => {
    try {
      await likePhoto(photo.id, userId);
    } catch (error) {
      console.error('Chyba při likování fotografie', error);
    }
  };

  const handleUnlike = async (photo: Photo) => {
    try {
      await unlikePhoto(photo.id, userId);
    } catch (error) {
      console.error('Chyba při unlikování fotografie', error);
    }
  };

  // Funkce pro navigaci na předchozí fotografii
  const handlePrevious = () => {
    if (allPhotos.length > 1) {
      const newIndex = (currentPhotoIndex - 1 + allPhotos.length) % allPhotos.length;
      setCurrentPhotoIndex(newIndex);
    }
  };

  // Funkce pro navigaci na následující fotografii
  const handleNext = () => {
    if (allPhotos.length > 1) {
      const newIndex = (currentPhotoIndex + 1) % allPhotos.length;
      setCurrentPhotoIndex(newIndex);
    }
  };

  // Aktuální fotka pro zobrazení v modálu (buď z parametru nebo z pole na základě indexu)
  const currentPhoto = allPhotos.length > 0 ? allPhotos[currentPhotoIndex] : photo;

  return (
    <>
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
            {/* Počet liků */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FavoriteBorderIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {photo.likes}
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

      <PhotoDetailModal
        open={modalOpen}
        onClose={handleCloseModal}
        photo={currentPhoto}
        allPhotos={allPhotos}
        onLike={handleLike}
        onUnlike={handleUnlike}
        onPrevious={allPhotos.length > 1 ? handlePrevious : undefined}
        onNext={allPhotos.length > 1 ? handleNext : undefined}
      />
    </>
  );
}; 