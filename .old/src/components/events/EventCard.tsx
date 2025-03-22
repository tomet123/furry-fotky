import React, { memo } from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import Link from 'next/link';
import Image from 'next/image';
import { CARD_HOVER_SHADOW } from '@/lib/constants';

export interface Event {
  id: number;
  name: string;
  description?: string;
  startDate: string;
  coverImageUrl?: string;
}

interface EventCardProps {
  event: Event;
}

/**
 * Komponenta pro zobrazení karty s informacemi o události
 */
const EventCard: React.FC<EventCardProps> = ({ event }) => (
  <Grid item key={event.id} xs={12} sm={6}>
    <Card sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', sm: 'row' },
      transition: 'all 0.2s',
      '&:hover': {
        boxShadow: CARD_HOVER_SHADOW,
      }
    }}>
      <Box sx={{ position: 'relative', width: { xs: '100%', sm: 150 }, height: { xs: 200, sm: '100%' } }}>
        <Image
          src={event.coverImageUrl || `/api/image?width=400&height=300&seed=${event.id}`}
          alt={event.name}
          fill
          loading="lazy"
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

export default memo(EventCard); 