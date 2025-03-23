'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Avatar, Chip, Stack } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Photo } from '@/app/actions/photos';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

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

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick, userId = '1' }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleCardClick = () => {
    if (onClick) {
      onClick(photo);
      
      // Aktualizujeme URL s ID fotky
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('photoId', photo.id);
      router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
    }
  };

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
  );
}; 