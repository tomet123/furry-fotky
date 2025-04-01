'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Stack,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Avatar,
  Chip
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import EventIcon from '@mui/icons-material/Event';
import EditIcon from '@mui/icons-material/Edit';
import { PhotoGrid } from '@/components/foto/PhotoGrid';
import { PhotoGalleryProvider } from '@/app/contexts/PhotoGalleryContext';
import { Event } from '@/app/actions/events';
import { Photo } from '@/app/actions/photos';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { useSession } from 'next-auth/react';

interface EventDetailClientProps {
  event: Event;
}

export function EventDetailClient({ event }: EventDetailClientProps) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data: session } = useSession();

  // Konverze fotek z akce na formát pro PhotoGrid
  const photos: Photo[] = event.topPhotos.map(photo => ({
    id: photo.id,
    storageId: photo.storageId,
    photographer: photo.photographer.user.username || 'Neznámý fotograf',
    photographerId: photo.photographer.id,
    likes: photo.likes,
    isLikedByCurrentUser: false,
    avatarUrl: '',
    event: event.name,
    tags: [],
    date: event.date
  }));

  // Kontrola, zda je aktuální uživatel na svém profilu
  const isOwnProfile = session?.user?.id === event.photographers.find(p => p.id === session?.user?.id)?.id;

  return (
    <Box sx={{ width: '100%', maxWidth: '1280px', mx: 'auto', px: 2 }}>
      {/* Horní lišta s tlačítky */}
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Tooltip title="Zpět na seznam akcí">
          <IconButton 
            onClick={() => router.push('/akce')}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={4}>
        {/* Levý sloupec - Informace o akci */}
        <Grid item xs={12} md={4}>
          <Card>
            <Box
              sx={{ 
                p: 3, 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Název akce */}
              <Typography variant="h5" component="h1" align="center" gutterBottom>
                {event.name}
              </Typography>
              
              {/* Organizátor */}
              <Typography variant="body1" color="text.secondary" align="center" paragraph>
                Organizátor: {event.organizerName}
              </Typography>
            </Box>
            
            <Divider />
            
            {/* Statistiky akce */}
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informace
              </Typography>
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1">
                    Datum: {format(new Date(event.date), 'd. MMMM yyyy', { locale: cs })}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1">
                    Místo: {event.location}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhotoLibraryIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1">
                    Fotografií: {event.topPhotos.length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Pravý sloupec - Obrázek, popis a fotografie */}
        <Grid item xs={12} md={8}>
          {/* Obrázek akce */}
          <Paper sx={{ p: 0, mb: 4, overflow: 'hidden' }}>
            <Box
              sx={{
                position: 'relative',
                height: { xs: 200, md: 300 },
                bgcolor: `hsl(${event.id.charCodeAt(0) * 50}, 70%, 80%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {event.imageId ? (
                <Box
                  component="img"
                  src={`/api/event-images/${event.imageId}`}
                  alt={event.name}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <Typography 
                  variant="h1" 
                  component="span" 
                  sx={{ 
                    fontSize: { xs: '4rem', md: '6rem' },
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                >
                  {event.name.charAt(0)}
                </Typography>
              )}
            </Box>
          </Paper>
          
          {/* Popis akce */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              O akci
            </Typography>

            <Box sx={{ mt: 2 }}>
              {event.description ? (
                <Typography variant="body1" whiteSpace="pre-wrap">
                  {event.description}
                </Typography>
              ) : (
                <Typography color="text.secondary" variant="body1">
                  Tato akce nemá vyplněný popis.
                </Typography>
              )}
            </Box>
          </Paper>

          {/* Fotky z akce */}
          {event.topPhotos.length > 0 && (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h2">
                  Nejvíce lajknuté fotografie
                </Typography>
                <Button
                  component={Link}
                  href={`/fotogalerie?event=${event.id}`}
                  variant="outlined"
                  color="primary"
                >
                  Zobrazit všechny fotky
                </Button>
              </Box>
              
              <PhotoGalleryProvider>
                <PhotoGrid 
                  photos={photos}
                  onPhotoClick={(photo) => {
                    router.push(`/fotogalerie?photoId=${photo.id}`);
                  }}
                />
              </PhotoGalleryProvider>
            </Paper>
          )}
          
          {/* Fotografové na akci */}
          {event.photographers.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Fotografové na akci
              </Typography>
              
              <Grid container spacing={2}>
                {event.photographers.map((photographer) => (
                  <Grid item xs={12} sm={6} md={4} key={photographer.id}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: theme => theme.shadows[4],
                          transform: 'translateY(-2px)',
                          transition: 'all 0.2s ease-in-out'
                        }
                      }}
                      onClick={() => router.push(`/uzivatele/${photographer.id}`)}
                    >
                      <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 64, 
                            height: 64, 
                            mb: 2,
                            bgcolor: 'primary.main',
                            fontSize: '1.5rem'
                          }}
                        >
                          {photographer.user.username?.[0] || '?'}
                        </Avatar>
                        
                        <Typography variant="h6" component="h3" gutterBottom>
                          {photographer.user.username || 'Neznámý fotograf'}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                          <Chip 
                            label={`${photographer.photoCount} fotek`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                        
                        <Button 
                          component={Link}
                          href={`/fotogalerie?event=${event.id}&photographer=${photographer.id}`}
                          variant="outlined"
                          size="small"
                          fullWidth
                        >
                          Zobrazit fotky
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
          
          {/* Pokud nejsou žádné fotky */}
          {event.topPhotos.length === 0 && event.photographers.length === 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Fotografie z akce
              </Typography>
              
              <Typography color="text.secondary" variant="body1">
                Zatím nejsou k dispozici žádné fotografie z této akce.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default EventDetailClient; 