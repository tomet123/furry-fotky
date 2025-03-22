import React, { memo } from 'react';
import { Box, Grid, Typography, Button } from '@mui/material';
import Link from 'next/link';
import EventCard from '@/components/events/EventCard';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import { Event } from '@/hooks/useEvents';

interface EventListProps {
  events: Event[];
  loading: boolean;
  title?: string;
  showViewAllButton?: boolean;
  emptyMessage?: string;
}

/**
 * Komponenta pro zobrazení seznamu událostí
 */
const EventList: React.FC<EventListProps> = ({
  events,
  loading,
  title = 'Nadcházející akce',
  showViewAllButton = true,
  emptyMessage = 'Žádné nadcházející akce'
}) => {
  return (
    <Box sx={{ mb: 6 }}>
      {title && (
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, color: 'primary.light' }}>
          {title}
        </Typography>
      )}
      
      <Grid container spacing={4}>
        {loading ? (
          <LoadingIndicator message="Načítání akcí..." />
        ) : events && events.length > 0 ? (
          events.map((event) => (
            <EventCard 
              key={event.id} 
              event={{
                ...event,
                startDate: event.date // Mapování z date na startDate
              }} 
            />
          ))
        ) : (
          <Box sx={{ width: '100%', p: 4, textAlign: 'center' }}>
            <Typography>{emptyMessage}</Typography>
          </Box>
        )}
      </Grid>
      
      {showViewAllButton && events && events.length > 0 && (
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
      )}
    </Box>
  );
};

export default memo(EventList); 