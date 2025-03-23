'use client';

import React, { useState } from 'react';
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
  Grid,
  Container,
  Pagination,
  Stack,
  useTheme,
  useMediaQuery,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  Tooltip,
  ButtonGroup,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import Link from 'next/link';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PlaceIcon from '@mui/icons-material/Place';
import PeopleIcon from '@mui/icons-material/People';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useEvents } from '@/app/hooks/useEvents';
import type { Event } from '@/app/actions/events';
import { FilterBar, type SortOption, type Filter } from '@/components/common/FilterBar';

// Funkce pro formátování data
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Možnosti řazení pro akce
const sortOptions: SortOption[] = [
  { value: 'newest', label: 'Nejnovější' },
  { value: 'oldest', label: 'Nejstarší' }
];

// Wrapper funkce pro konverzi typů filtrů
const createUpdateFilterHandler = (updateFn: (filters: Partial<any>) => void) => {
  return (newFilters: Partial<Filter>) => {
    const typedFilters: Partial<any> = {
      ...newFilters,
      sortBy: (newFilters.sortBy as 'newest' | 'oldest' | undefined)
    };
    updateFn(typedFilters);
  };
};

// Optimalizovaná komponenta pro nadcházející události
const UpcomingEventCard = ({ event }: { event: Event }) => {
  const isComingSoon = new Date(event.date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  return (
    <Grid item xs={12}>
      <Card sx={{ 
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
        },
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative'
      }}>
        {isComingSoon && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 16, 
              right: 16, 
              zIndex: 2,
              bgcolor: 'error.main',
              color: 'white',
              px: 2,
              py: 0.5,
              borderRadius: 4,
              fontSize: '0.75rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: 1
            }}
          >
            Již brzy
          </Box>
        )}
        <Grid container>
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'relative', height: { xs: 200, md: '100%' }, minHeight: { md: 250 } }}>
              <Box
                sx={{
                  height: '100%',
                  width: '100%',
                  bgcolor: `hsl(${event.id.charCodeAt(0) * 50}, 70%, 80%)`,
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
                <Typography variant="h2" component="span" sx={{ position: 'relative', zIndex: 1, fontWeight: 'bold' }}>
                  {event.name.charAt(0)}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <CardContent sx={{ p: 3 }}>
              <Typography component="h2" variant="h5" color="primary" fontWeight={600}>
                {event.name}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1, mb: 2 }}>
                <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarMonthIcon sx={{ mr: 1, color: 'primary.main' }} />
                  {formatDate(event.date)}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <PlaceIcon sx={{ mr: 1, color: 'primary.main' }} />
                  {event.location || 'Neznámé místo'}
                </Typography>
              </Box>
              
              {event.description && (
                <Typography variant="body1" sx={{ 
                  mb: 3,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: 'text.secondary'
                }}>
                  {event.description}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Chip 
                    label={event.organizerName} 
                    size="small" 
                    sx={{ bgcolor: 'rgba(33, 150, 243, 0.1)', color: 'primary.main' }} 
                  />
                </Box>
                <Button 
                  component={Link} 
                  href={`/akce/${event.id}`} 
                  variant="contained" 
                  color="primary"
                  size="small"
                >
                  Detaily
                </Button>
              </Box>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </Grid>
  );
};

// Komponenta pro minulé události
const PastEventCard = ({ event }: { event: Event }) => (
  <Grid item xs={12} sm={6} md={4}>
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
          height: 140,
          bgcolor: `hsl(${event.id.charCodeAt(0) * 50}, 60%, 75%)`,
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
          {event.name.charAt(0)}
        </Typography>
      </Box>
      <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
          {event.name}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <CalendarMonthIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
            {formatDate(event.date)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
            <PlaceIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
            {event.location || 'Neznámé místo'}
          </Typography>
        </Box>
        
        {event.description && (
          <Typography variant="body2" color="text.secondary" sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexGrow: 1
          }}>
            {event.description}
          </Typography>
        )}
        
        <Button 
          component={Link} 
          href={`/akce/${event.id}`} 
          variant="outlined" 
          color="primary"
          size="small"
          sx={{ alignSelf: 'flex-start', mt: 'auto' }}
        >
          Zobrazit
        </Button>
      </CardContent>
    </Card>
  </Grid>
);

export default function Page() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Stav pro typ zobrazení akcí
  const [eventViewType, setEventViewType] = useState<'all' | 'upcoming' | 'past'>('all');
  
  // Hook pro načtení událostí
  const {
    events,
    loading,
    error,
    totalPages,
    filters,
    setPage,
    updateFilters
  } = useEvents({
    sortBy: 'newest',
    limit: 10,
    upcoming: true,
    past: true // Načítáme všechny akce na začátku
  });
  
  // Vytvoření filtrační funkce s typovou konverzí
  const handleFilterUpdate = createUpdateFilterHandler(updateFilters);
  
  // Funkce pro zpracování změny stránky
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Scroll nahoru
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Handler pro změnu typu zobrazení akcí
  const handleViewTypeChange = (_event: React.MouseEvent<HTMLElement>, newViewType: 'all' | 'upcoming' | 'past') => {
    if (newViewType !== null) {
      setEventViewType(newViewType);
      
      // Aktualizujeme filtry podle výběru
      switch (newViewType) {
        case 'all':
          updateFilters({ upcoming: true, past: true });
          break;
        case 'upcoming':
          updateFilters({ upcoming: true, past: false });
          break;
        case 'past':
          updateFilters({ upcoming: false, past: true });
          break;
      }
    }
  };
  
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <Stack 
        spacing={4} 
        pb={10} 
        sx={{ 
          width: '100%', 
          maxWidth: '1280px',
          mx: 'auto',
          px: { xs: 2, sm: 3, md: 4 }
        }}
      >
        {/* Hlavička */}
        <Box sx={{ width: '100%', textAlign: 'center' }}>
          <Stack spacing={1} mb={1}>
            <Typography variant="h3" component="h1" fontWeight={600}>
              Akce
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Prohlédněte si nadcházející i minulé akce furry komunity
            </Typography>
          </Stack>
        </Box>
        
        <Divider />
        
        {/* Filtrační panel */}
        <FilterBar
          title="Filtrovat akce"
          filters={filters}
          onUpdateFilters={handleFilterUpdate}
          searchPlaceholder="Hledat akce"
          sortOptions={sortOptions}
          defaultSortBy="newest"
          totalItems={events.length}
          totalPages={totalPages}
          loading={loading}
          showReset={false}
          compactMode={true}
          showSearch={true}
          showCount={false}
          customFields={
            <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
              <ToggleButtonGroup
                value={eventViewType}
                exclusive
                onChange={handleViewTypeChange}
                size="small"
                aria-label="Zobrazit akce"
              >
                <ToggleButton value="all" aria-label="všechny akce">
                  Všechny
                </ToggleButton>
                <ToggleButton value="upcoming" aria-label="budoucí akce">
                  Budoucí
                </ToggleButton>
                <ToggleButton value="past" aria-label="proběhlé akce">
                  Proběhlé
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          }
          extraFields={
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mt: 2
            }}>
              {/* Text s počtem položek */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Nalezeno {events.length} položek
                  {totalPages && totalPages > 1 && filters.page
                    ? ` (stránka ${filters.page} z ${totalPages})`
                    : ''}
                </Typography>
              </Box>
              
              {/* Tlačítko pro reset filtrů */}
              <Tooltip title="Resetovat filtry">
                <IconButton
                  onClick={() => updateFilters({
                    query: '',
                    sortBy: 'newest',
                    page: 1
                  })}
                  size="small"
                  color="default"
                >
                  <RestartAltIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        
        {/* Loading stav */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h6" color="error">
              Došlo k chybě při načítání akcí.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {error}
            </Typography>
          </Paper>
        ) : events.length > 0 ? (
          <>
            {/* Zobrazení budoucích nebo proběhlých akcí podle filtru */}
            {eventViewType === 'upcoming' || eventViewType === 'all' ? 
              events.filter(event => new Date(event.date) >= new Date()).length > 0 ? (
                <Box>
                  <Typography variant="h5" component="h2" sx={{ 
                    fontWeight: 600, 
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Box 
                      sx={{ 
                        width: 8, 
                        height: 32, 
                        bgcolor: 'primary.main', 
                        mr: 2, 
                        borderRadius: 4 
                      }} 
                    />
                    Nadcházející akce
                  </Typography>
                  <Grid container spacing={3}>
                    {events
                      .filter(event => new Date(event.date) >= new Date())
                      .map(event => (
                        <UpcomingEventCard key={event.id} event={event} />
                      ))}
                  </Grid>
                </Box>
              ) : null
            : null}
            
            {/* Minulé události */}
            {eventViewType === 'past' || eventViewType === 'all' ? 
              events.filter(event => new Date(event.date) < new Date()).length > 0 ? (
                <Box>
                  <Typography variant="h5" component="h2" sx={{ 
                    fontWeight: 600, 
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Box 
                      sx={{ 
                        width: 8, 
                        height: 32, 
                        bgcolor: 'text.secondary', 
                        mr: 2, 
                        borderRadius: 4,
                        opacity: 0.7
                      }} 
                    />
                    Minulé akce
                  </Typography>
                  <Grid container spacing={3}>
                    {events
                      .filter(event => new Date(event.date) < new Date())
                      .map(event => (
                        <PastEventCard key={event.id} event={event} />
                      ))}
                  </Grid>
                </Box>
              ) : null
            : null}
            
            {/* Stránkování */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                  count={totalPages} 
                  page={filters.page} 
                  onChange={handlePageChange} 
                  color="primary" 
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: 'text.secondary',
                    },
                    '& .Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      }
                    }
                  }}
                />
              </Box>
            )}
          </>
        ) : (
          <Paper 
            sx={{ 
              p: 4, 
              textAlign: 'center', 
              bgcolor: 'background.paper',
              borderRadius: 2,
              mt: 4
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nebyly nalezeny žádné akce
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Zkuste upravit vyhledávací dotaz nebo zobrazit všechny akce.
            </Typography>
          </Paper>
        )}
      </Stack>
    </Box>
  );
} 