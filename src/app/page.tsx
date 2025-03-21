'use client';

import { Box } from '@mui/material';
import { useEvents } from '@/hooks/useEvents';
import { usePhotographers } from '@/hooks/usePhotographers';
import PhotoCarousel from '@/components/photos/PhotoCarousel';
import EventList from '@/components/events/EventList';
import PhotographerList from '@/components/photographers/PhotographerList';

/**
 * Hlavní stránka aplikace
 */
export default function Home() {
  const { events, loading: eventsLoading } = useEvents();
  const { photographers, loading: photographersLoading } = usePhotographers();

  return (
    <Box>
      {/* Posouvatelná galerie nejlajkovanějších fotek */}
      <PhotoCarousel />

      {/* Sekce s nadcházejícími akcemi */}
      <EventList 
        events={events || []} 
        loading={eventsLoading} 
        title="Nadcházející akce"
      />

      {/* Sekce s fotografy */}
      <PhotographerList 
        photographers={photographers || []} 
        loading={photographersLoading}
        title="Naši fotografové"
      />
    </Box>
  );
}
