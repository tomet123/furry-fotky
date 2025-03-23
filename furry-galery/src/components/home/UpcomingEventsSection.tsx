'use client';

import { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  CircularProgress,
  Button
} from '@mui/material';
import Link from 'next/link';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PlaceIcon from '@mui/icons-material/Place';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getUpcomingEvents } from '@/app/actions/home';
import type { Event } from '@/app/actions/events';

// Funkce pro formátování data
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Kontrola zda je událost v příštím týdnu
const isComingSoon = (date: string) => {
  const eventDate = new Date(date);
  const now = new Date();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return eventDate.getTime() - now.getTime() < oneWeek;
};

// Karta události
export const UpcomingEventCard = ({ event }: { event: Event }) => {
  const comingSoon = isComingSoon(event.date);
  
  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      borderRadius: 2,
      overflow: 'hidden',
      position: 'relative',
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
      }
    }}>
      {comingSoon && (
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
      <Box sx={{ 
        height: 140, 
        bgcolor: `hsl(${event.id.charCodeAt(0) * 50}, 70%, 80%)`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
        }
      }}>
        <Typography variant="h2" component="span" sx={{ 
          position: 'relative', 
          zIndex: 1, 
          fontWeight: 'bold',
          color: 'white'
        }}>
          {event.name.charAt(0)}
        </Typography>
      </Box>
      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography component="h3" variant="h6" color="primary" fontWeight={600} gutterBottom>
          {event.name}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ 
            display: 'flex', 
            alignItems: 'center',
            whiteSpace: 'nowrap'
          }}>
            <CalendarMonthIcon sx={{ mr: 1, color: 'primary.main', fontSize: '1rem' }} />
            {formatDate(event.date)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ 
            display: 'flex', 
            alignItems: 'center',
            whiteSpace: 'nowrap'
          }}>
            <PlaceIcon sx={{ mr: 1, color: 'primary.main', fontSize: '1rem' }} />
            {event.location}
          </Typography>
        </Box>
        
        {/* Popis události (zobrazit pouze část) */}
        {event.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {event.description}
          </Typography>
        )}
        
        <Box sx={{ mt: 'auto' }}>
          <Button 
            component={Link} 
            href={`/akce/${event.id}`}
            variant="outlined" 
            size="small" 
            endIcon={<ArrowForwardIcon />}
            sx={{ 
              borderRadius: 2,
              mt: 2
            }}
          >
            Detail akce
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// Sekce s nadcházejícími událostmi
export default function UpcomingEventsSection() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const upcomingEvents = await getUpcomingEvents(6);
        setEvents(upcomingEvents);
        setError(null);
      } catch (err) {
        setError('Nepodařilo se načíst nadcházející události.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchEvents();
  }, []);
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h5" component="h2" fontWeight={600}>
          Nadcházející akce
        </Typography>
        <Button 
          component={Link}
          href="/akce"
          color="primary"
          endIcon={<ArrowForwardIcon />}
        >
          Všechny akce
        </Button>
      </Box>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Typography color="error" sx={{ py: 2 }}>
          {error}
        </Typography>
      )}
      
      {!loading && !error && events.length === 0 && (
        <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
          Žádné nadcházející akce nebyly nalezeny.
        </Typography>
      )}
      
      {!loading && !error && events.length > 0 && (
        <Grid container spacing={3}>
          {events.map(event => (
            <Grid item key={event.id} xs={12} sm={6} md={4}>
              <UpcomingEventCard event={event} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
} 