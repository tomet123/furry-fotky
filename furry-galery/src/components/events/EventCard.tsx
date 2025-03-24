'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import Link from 'next/link';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PhotoIcon from '@mui/icons-material/Photo';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export interface EventData {
  id: string | null;
  name: string | null;
  date: string | null;
  location?: string | null;
  photoCount: number;
  photographerId?: string;
  photographerName?: string;
}

interface EventCardProps {
  event: EventData;
  index: number;
  showPhotosButton?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, index, showPhotosButton = false }) => {
  // Formátování data události
  const formatEventDate = (dateString: string | null) => {
    if (!dateString) return 'Datum neznámé';
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
  
  return (
    <Card sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
      },
      borderRadius: 2,
      overflow: 'hidden'
    }}>
      <Box
        sx={{
          height: 120,
          bgcolor: `hsl(${(event.id?.charCodeAt(0) || index) * 50}, 60%, 75%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '2rem',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
          }
        }}
      >
        <Typography variant="h3" component="span" sx={{ position: 'relative', zIndex: 1, fontWeight: 'bold' }}>
          {event.name?.charAt(0) || "?"}
        </Typography>
      </Box>
      <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
          {event.name || 'Neznámá akce'}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <CalendarMonthIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
            {formatEventDate(event.date)}
          </Typography>
          {event.location && (
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <PhotoIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
              {event.location}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <PhotoIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
            {event.photoCount} fotografií
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
          {event.id && (
            <Button 
              component={Link} 
              href={`/akce/${event.id}`} 
              variant="outlined" 
              color="primary"
              size="small"
            >
              Zobrazit akci
            </Button>
          )}
          
          {showPhotosButton && event.photographerId && event.id && (
            <Button 
              component={Link} 
              href={`/fotogalerie?event=${encodeURIComponent(event.name || '')}&photographer=${encodeURIComponent(event.photographerName || '')}`} 
              variant="contained" 
              color="primary"
              size="small"
              endIcon={<ArrowForwardIcon />}
            >
              Zobrazit fotografie
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default EventCard; 