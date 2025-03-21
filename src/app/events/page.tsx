'use client';

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Divider, 
  Paper, 
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Pagination
} from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import Grid from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import { useEvents, Event } from '@/hooks/useEvents';

// Optimalizovaná komponenta pro nadcházející události
const UpcomingEventCard = ({ event }: { event: Event }) => (
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
              alt={event.name}
              fill
              loading="lazy"
              style={{ objectFit: 'cover' }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          <CardContent>
            <Typography component="h2" variant="h5" color="primary.light">
              {event.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
              <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                <Box component="span" sx={{ mr: 1, fontSize: '18px' }}>📅</Box>
                {formatDate(event.date)}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <Box component="span" sx={{ mr: 1, fontSize: '18px' }}>📍</Box>
                {event.location || 'Neznámé místo'}
              </Typography>
            </Box>
            {event.description && (
              <Typography variant="body1" paragraph>
                {event.description}
              </Typography>
            )}
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
const PastEventCard = ({ event }: { event: Event }) => (
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
          alt={event.name}
          fill
          loading="lazy"
          style={{ objectFit: 'cover' }}
        />
      </Box>
      <CardContent>
        <Typography component="h2" variant="h6" color="primary.light">
          {event.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {formatDate(event.date)} | {event.location || 'Neznámé místo'}
        </Typography>
        <Divider sx={{ my: 1 }} />
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
  // Stav pro vyhledávání a stránkování
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 6; // Počet událostí na stránku

  // Načtení událostí z API
  const { events, loading, error, totalItems } = useEvents({
    query: searchQuery,
    page,
    limit
  });

  // Výpočet celkového počtu stránek
  const totalPages = Math.ceil((totalItems || 0) / limit);

  // Obnovení na první stránku při změně vyhledávacího dotazu
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  // Funkce pro zpracování změny stránky
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Scroll nahoru
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Rozdělení akcí na nadcházející a minulé
  const now = new Date();
  const upcomingEvents = events ? events.filter(event => new Date(event.date) >= now) : [];
  const pastEvents = events ? events.filter(event => new Date(event.date) < now) : [];

  return (
    <Box sx={{ maxWidth: 'lg', mx: 'auto', px: 3, py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom color="primary.light">
        Akce
      </Typography>
      
      {/* Vyhledávání */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Hledat akci podle názvu nebo místa"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Loading stav */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Chybová zpráva */}
      {error && (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6" color="error">
            Došlo k chybě při načítání akcí.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {error}
          </Typography>
        </Box>
      )}
      
      {/* Zobrazení obsahu, když nejsou načítána data */}
      {!loading && !error && events && (
        <>
          {/* Nadcházející akce */}
          {upcomingEvents.length > 0 && (
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
          )}
          
          {/* Minulé akce */}
          {pastEvents.length > 0 && (
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
          )}

          {/* Zpráva, pokud nejsou nalezeny žádné akce */}
          {events.length === 0 && (
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Typography variant="h6">
                Nebyly nalezeny žádné akce odpovídající vašemu vyhledávání.
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Zkuste upravit vyhledávací dotaz nebo přijďte později.
              </Typography>
            </Box>
          )}

          {/* Stránkování */}
          {events.length > 0 && totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
} 