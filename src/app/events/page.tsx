'use client';

import React from 'react';
import { useMemo } from 'react';
import { Typography, Box, Card, CardContent, Divider, Chip, Paper, Button } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import Grid from '@mui/material/Grid';

// Simulovaná data pro akce - memoizovaná
const useEvents = () => {
  return useMemo(() => [
    {
      id: 1,
      title: 'Furry Meet Praha',
      date: '2023-10-15',
      location: 'Praha, Česká republika',
      description: 'Pravidelné setkání české furry komunity v Praze. Přijďte se potkat s přáteli, užít si zábavu a pořídit krásné fotografie.',
      tags: ['Praha', 'Setkání', 'Kostýmy'],
      upcoming: true,
    },
    {
      id: 2,
      title: 'FurCon 2023',
      date: '2023-11-20',
      location: 'Brno, Česká republika',
      description: 'Největší furry convention v České republice. Dva dny plné zábavy, workshopů, panelů a fotografování. Nenechte si ujít tuto jedinečnou událost!',
      tags: ['Convention', 'Brno', 'Kostýmy', 'Workshopy'],
      upcoming: true,
    },
    {
      id: 3,
      title: 'Winter Furry Photoshoot',
      date: '2023-12-10',
      location: 'Krkonoše, Česká republika',
      description: 'Speciální zimní fotografické setkání v Krkonoších. Přijďte si užít profesionální fotografování v zimní krajině.',
      tags: ['Foto', 'Zima', 'Outdoor'],
      upcoming: true,
    },
    {
      id: 4,
      title: 'Letní furry piknik',
      date: '2023-06-25',
      location: 'Průhonice, Česká republika',
      description: 'Letní setkání venku pod širým nebem. Grilování, hry a fotografování v přírodě.',
      tags: ['Piknik', 'Léto', 'Outdoor'],
      upcoming: false,
    },
    {
      id: 5,
      title: 'CzechFur 2023',
      date: '2023-08-05',
      location: 'Plzeň, Česká republika',
      description: 'Regionální setkání zaměřené na fursuit fotografování a networking.',
      tags: ['Plzeň', 'Fursuit', 'Foto'],
      upcoming: false,
    },
  ], []);
};

// Optimalizovaná komponenta pro nadcházející události
const UpcomingEventCard = ({ event }: { event: any }) => (
  <Grid item key={event.id} xs={12}>
    <Card sx={{ 
      transition: 'all 0.2s',
      '&:hover': {
        boxShadow: 6,
      }
    }}>
      <Grid container>
        <Grid item xs={12} md={4}>
          <Box sx={{ position: 'relative', height: { xs: 200, md: '100%' }, minHeight: { md: 250 } }}>
            <Image
              src={`/api/image?width=800&height=600&seed=${event.id + 50}`}
              alt={event.title}
              fill
              loading="lazy"
              style={{ objectFit: 'cover' }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          <CardContent>
            <Typography component="h2" variant="h5" color="primary.light">
              {event.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
              <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                <Box component="span" sx={{ mr: 1, fontSize: '18px' }}>📅</Box>
                {formatDate(event.date)}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <Box component="span" sx={{ mr: 1, fontSize: '18px' }}>📍</Box>
                {event.location}
              </Typography>
            </Box>
            <Typography variant="body1" paragraph>
              {event.description}
            </Typography>
            <Box sx={{ mt: 2, mb: 2 }}>
              {event.tags.map((tag: string) => (
                <Chip 
                  key={tag} 
                  label={tag} 
                  sx={{ 
                    mr: 1, 
                    mb: 1,
                    bgcolor: 'rgba(144, 202, 249, 0.08)',
                    color: 'primary.light' 
                  }} 
                />
              ))}
            </Box>
            <Button 
              variant="contained" 
              component={Link} 
              href={`/events/${event.id}`}
              sx={{ 
                mt: 1,
                bgcolor: 'primary.dark',
                '&:hover': {
                  bgcolor: 'primary.main',
                }
              }}
            >
              Více informací
            </Button>
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  </Grid>
);

// Optimalizovaná komponenta pro minulé události
const PastEventCard = ({ event }: { event: any }) => (
  <Grid item key={event.id} xs={12} sm={6}>
    <Card variant="outlined" sx={{ 
      height: '100%',
      transition: 'all 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 2,
      }
    }}>
      <Box sx={{ position: 'relative', height: 140 }}>
        <Image
          src={`/api/image?width=600&height=300&seed=${event.id + 80}`}
          alt={event.title}
          fill
          loading="lazy"
          style={{ objectFit: 'cover' }}
        />
      </Box>
      <CardContent>
        <Typography component="h2" variant="h6" color="primary.light">
          {event.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {formatDate(event.date)} | {event.location}
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ mt: 1, mb: 1 }}>
          {event.tags.map((tag: string) => (
            <Chip 
              key={tag} 
              label={tag} 
              size="small" 
              variant="outlined" 
              sx={{ mr: 0.5, mb: 0.5 }} 
            />
          ))}
        </Box>
        <Button 
          size="small" 
          component={Link} 
          href={`/events/${event.id}`}
          sx={{ mt: 1 }}
        >
          Fotogalerie
        </Button>
      </CardContent>
    </Card>
  </Grid>
);

// Formátování data
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('cs-CZ', options);
};

export default function Events() {
  const events = useEvents();
  
  // Rozdělení akcí na nadcházející a minulé
  const upcomingEvents = useMemo(() => events.filter(event => event.upcoming), [events]);
  const pastEvents = useMemo(() => events.filter(event => !event.upcoming), [events]);

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom color="primary.light">
        Akce
      </Typography>
      
      {/* Nadcházející akce */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ 
          display: 'flex', 
          alignItems: 'center',
          color: 'primary.light',
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box component="span" sx={{ mr: 1, fontSize: '24px' }}>📅</Box> 
          Nadcházející akce
        </Typography>
        <Grid container spacing={3}>
          {upcomingEvents.map((event) => (
            <UpcomingEventCard key={event.id} event={event} />
          ))}
        </Grid>
      </Box>
      
      {/* Minulé akce */}
      <Box>
        <Typography variant="h4" gutterBottom sx={{ 
          color: 'primary.light',
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          Minulé akce
        </Typography>
        <Paper sx={{ p: 3, bgcolor: 'background.paper', boxShadow: 2 }}>
          <Grid container spacing={3}>
            {pastEvents.map((event) => (
              <PastEventCard key={event.id} event={event} />
            ))}
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
} 