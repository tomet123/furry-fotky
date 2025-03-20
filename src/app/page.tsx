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
  useTheme
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Link from 'next/link';
import Image from 'next/image';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { usePhotoItems, Photo } from '@/hooks/usePhotoItems';
import { PhotoCard } from '@/components/photos/PhotoCard';
import { PhotoDetail } from '@/components/photos/PhotoDetail';

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
        src="https://picsum.photos/1920/1080"
        alt="FurryFotky.cz"
        fill
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
        }}
        sizes="100vw"
        priority // Prioritní načtení pro LCP (Largest Contentful Paint)
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

// Data pro carousel
const useFeaturedPhotos = () => {
  return useMemo(() => 
    Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      title: `Fotografie ${i + 1}`,
      event: ['FurCon 2023', 'Winter Photoshoot', 'Furry Meet Praha', 'CzechFur'][i % 4],
      photographer: ['Jan Novák', 'Petra Dvořáková', 'Martin Svoboda', 'Lucie Malá', 'Tomáš Horák'][i % 5],
      likes: 150 + Math.floor(Math.random() * 150),
    }))
    .sort((a, b) => b.likes - a.likes), // Seřazeno podle počtu like
  []);
};

// Carousel komponenta pro nejlajkovanější fotky
const PhotoCarousel = () => {
  const allPhotos = usePhotoItems();
  // Získáme 10 nejlajkovanějších fotografií
  const photos = useMemo(() => {
    return [...allPhotos]
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 10);
  }, [allPhotos]);
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  
  // Automatické posouvání
  useEffect(() => {
    if (!autoplay) return;
    
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % photos.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoplay, photos.length]);
  
  // Zastavení autoplay při hoveru
  const handleMouseEnter = useCallback(() => setAutoplay(false), []);
  const handleMouseLeave = useCallback(() => setAutoplay(true), []);
  
  // Navigační handlery
  const handlePrev = useCallback(() => {
    setActiveIndex((current) => (current - 1 + photos.length) % photos.length);
  }, [photos.length]);
  
  const handleNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % photos.length);
  }, [photos.length]);
  
  // Aktuální fotka
  const currentPhoto = photos[activeIndex];
  
  if (!currentPhoto) return null;
  
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
            showLikes={false}
            showViewAllButton={false}
            showHeader={false}
            showFooter={false}
            onNext={handleNext}
            onPrevious={handlePrev}
          />
        </Box>
      </Box>
    </Box>
  );
};

// Lazy-loaded EventCard komponenta
const EventCard = ({ item }: { item: number }) => (
  <Grid item key={item} xs={12} sm={6}>
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
          src={`https://picsum.photos/400/300?random=${item + 10}`}
          alt={`Akce ${item}`}
          fill
          style={{
            objectFit: 'cover',
          }}
          sizes="(max-width: 600px) 100vw, 150px"
        />
      </Box>
      <CardContent>
        <Typography component="h2" variant="h5">
          Akce {item}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {new Date().toLocaleDateString('cs-CZ')}
        </Typography>
        <Typography variant="body2" paragraph>
          Popis nadcházející akce. Tady budou uvedeny všechny důležité informace o akci.
        </Typography>
        <Button size="small" component={Link} href={`/events/${item}`}>
          Více informací
        </Button>
      </CardContent>
    </Card>
  </Grid>
);

// Lazy-loaded PhotographerCard komponenta
const PhotographerCard = ({ item }: { item: number }) => (
  <Grid item key={item} xs={12} sm={4}>
    <Card sx={{ 
      height: '100%',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 8,
      }
    }}>
      <CardActionArea component={Link} href={`/photographers/${item}`}>
        <Box sx={{ position: 'relative', width: '60%', pt: '60%', borderRadius: '50%', margin: '20px auto' }}>
          <Image
            src={`https://i.pravatar.cc/300?img=${item + 5}`}
            alt={`Fotograf ${item}`}
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
            Fotograf {item}
          </Typography>
          <Typography>
            Krátký popis fotografa a jeho specializace.
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  </Grid>
);

export default function Home() {
  // Memoizace dat pro lepší výkon
  const photoItems = useMemo(() => [1, 2, 3, 4], []);
  const eventItems = useMemo(() => [1, 2], []);
  const photographerItems = useMemo(() => [1, 2, 3], []);

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
          {eventItems.map((item) => (
            <EventCard key={item} item={item} />
          ))}
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
          {photographerItems.map((item) => (
            <PhotographerCard key={item} item={item} />
          ))}
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
