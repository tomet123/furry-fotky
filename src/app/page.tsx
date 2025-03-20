'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Card, 
  CardContent, 
  CardActionArea,
  IconButton, 
  Stack,
  Chip,
  Avatar,
  useMediaQuery,
  useTheme,
  CircularProgress
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Link from 'next/link';
import Image from 'next/image';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Photo } from '@/hooks/usePhotoItems';
import { PhotoCard } from '@/components/photos/PhotoCard';
import { PhotoDetail } from '@/components/photos/PhotoDetail';
import { usePhotos } from '@/hooks/usePhotos';
import { useEvents } from '@/hooks/useEvents';
import { usePhotographers } from '@/hooks/usePhotographers';
import { Photographer } from '@/lib/mock-db/photographers';
import { Event } from '@/lib/mock-db/events';

// Optimalizované načítání obrázků pomocí Next.js Image
const HeroSection = () => (
  <Paper
    sx={{
      position: 'relative',
      backgroundColor: 'background.paper',
      color: '#fff',
      mb: 4,
      overflow: 'hidden',
      height: 400,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7))',
          zIndex: 1,
        },
      }}
    >
      {/* Použití online dummy obrázku pro hero sekci */}
      <Image
        src="/api/image?width=1920&height=1080&seed=hero"
        alt="FurryFotky.cz"
        fill
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          opacity: 0.3,
          zIndex: -1
        }}
        priority
      />
    </Box>
    <Box
      sx={{
        position: 'relative',
        p: { xs: 3, md: 6 },
        textAlign: 'center',
        zIndex: 2,
      }}
    >
      <Typography component="h1" variant="h3" color="inherit" gutterBottom>
        Vítejte na FurryFotky.cz
      </Typography>
      <Typography variant="h5" color="inherit" paragraph>
        Váš portál pro furry fotografii a umění
      </Typography>
      <Button variant="contained" component={Link} href="/photos" size="large">
        Procházet fotky
      </Button>
    </Box>
  </Paper>
);

// Carousel komponenta pro nejlajkovanější fotky
const PhotoCarousel = () => {
  const { photos, loading, error, likePhoto, unlikePhoto } = usePhotos({ 
    sortBy: 'most_liked',
    limit: 10
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  
  // Automatické posouvání
  useEffect(() => {
    if (!autoplay || !photos || photos.length === 0) return;
    
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % photos.length);
    }, 5000);
    
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
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 500 }}>
        <CircularProgress />
      </Box>
    );
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
            Vítejte na FurryFotky.cz
          </Typography>
          <Typography variant="h5" color="white" paragraph sx={{ 
            textShadow: '0 2px 10px rgba(0,0,0,0.9)'
          }}>
            Váš portál pro furry fotografii a umění
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

// EventCard komponenta
const EventCard = ({ event }: { event: Event }) => (
  <Grid item key={event.id} xs={12} sm={6}>
    <Card sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', sm: 'row' },
      transition: 'all 0.2s',
      '&:hover': {
        boxShadow: 6,
      }
    }}>
      <Box sx={{ position: 'relative', width: { xs: '100%', sm: 150 }, height: { xs: 200, sm: '100%' } }}>
        <Image
          src={event.coverImageUrl || `/api/image?width=400&height=300&seed=${event.id}`}
          alt={event.name}
          fill
          style={{
            objectFit: 'cover',
          }}
          sizes="(max-width: 600px) 100vw, 150px"
        />
      </Box>
      <CardContent>
        <Typography component="h2" variant="h5">
          {event.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {new Date(event.startDate).toLocaleDateString('cs-CZ')}
        </Typography>
        <Typography variant="body2" paragraph>
          {event.description || 'Popis akce není k dispozici.'}
        </Typography>
        <Button size="small" component={Link} href={`/events/${event.id}`}>
          Více informací
        </Button>
      </CardContent>
    </Card>
  </Grid>
);

// PhotographerCard komponenta
const PhotographerCard = ({ photographer }: { photographer: Photographer }) => (
  <Grid item key={photographer.id} xs={12} sm={4}>
    <Card sx={{ 
      height: '100%',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 8,
      }
    }}>
      <CardActionArea component={Link} href={`/photographers/${photographer.id}`}>
        <Box sx={{ position: 'relative', width: '60%', pt: '60%', borderRadius: '50%', margin: '20px auto' }}>
          <Image
            src={photographer.avatarUrl || `/api/avatar?size=300&seed=${photographer.id}`}
            alt={photographer.name}
            fill
            style={{
              objectFit: 'cover',
              borderRadius: '50%',
            }}
            sizes="(max-width: 600px) 60vw, (max-width: 960px) 30vw, 20vw"
          />
        </Box>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography gutterBottom variant="h5" component="h2">
            {photographer.name}
          </Typography>
          <Typography>
            {photographer.bio || 'Informace o fotografovi nejsou k dispozici.'}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  </Grid>
);

export default function Home() {
  const { events, loading: eventsLoading } = useEvents();
  const { photographers, loading: photographersLoading } = usePhotographers();

  return (
    <Box>
      {/* Posouvatelná galerie 10 nejlajkovanějších fotek */}
      <PhotoCarousel />

      {/* Sekce s nadcházejícími akcemi */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, color: 'primary.light' }}>
          Nadcházející akce
        </Typography>
        <Grid container spacing={4}>
          {eventsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : events && events.length > 0 ? (
            events.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <Box sx={{ width: '100%', p: 4, textAlign: 'center' }}>
              <Typography>Žádné nadcházející akce</Typography>
            </Box>
          )}
        </Grid>
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button 
            variant="outlined" 
            component={Link} 
            href="/events"
            sx={{ borderRadius: 8, px: 4 }}
          >
            Zobrazit všechny akce
          </Button>
        </Box>
      </Box>

      {/* Sekce s fotografy */}
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, color: 'primary.light' }}>
          Naši fotografové
        </Typography>
        <Grid container spacing={4}>
          {photographersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : photographers && photographers.length > 0 ? (
            photographers.map((photographer) => <PhotographerCard key={photographer.id} photographer={photographer} />)
          ) : (
            <Box sx={{ width: '100%', p: 4, textAlign: 'center' }}>
              <Typography>Žádní fotografové k zobrazení</Typography>
            </Box>
          )}
        </Grid>
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button 
            variant="outlined" 
            component={Link} 
            href="/photographers"
            sx={{ borderRadius: 8, px: 4 }}
          >
            Zobrazit všechny fotografy
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
