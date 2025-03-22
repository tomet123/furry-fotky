import { getPhotos } from '@/app/actions/photos';
import { PhotoGrid } from '@/components/foto/PhotoGrid';
import { Container, Divider, Stack, Typography, Box } from '@mui/material';
import { Suspense } from 'react';
import { FilterPanelWrapper } from '@/components/foto/FilterPanelWrapper';

// Parametry pro vyhledávání
type SearchParams = {
  query?: string;
  event?: string;
  photographer?: string;
  tags?: string;
  sortBy?: 'newest' | 'oldest' | 'most_liked';
  page?: string;
};

/**
 * Stránka fotogalerie
 */
export default async function FotogaleriePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Zpracování parametrů z URL
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const limit = 20; // Omezení počtu fotografií na stránku
  
  // Výchozí hodnoty filtrů
  const initialEvent = searchParams.event || '';
  const initialPhotographer = searchParams.photographer || '';
  const initialTags = searchParams.tags ? searchParams.tags.split(',') : [];
  const initialSortBy = searchParams.sortBy || 'newest';
  
  // Získání fotografií podle filtrů
  const { photos, totalItems, totalPages } = await getPhotos({
    event: initialEvent,
    photographer: initialPhotographer,
    tags: initialTags,
    sortBy: initialSortBy as 'newest' | 'oldest' | 'most_liked',
    page,
    limit,
  });
  
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <Stack 
        spacing={4} 
        pb={10} 
        sx={{ 
          width: '100%', 
          maxWidth: '1280px',
          mx: 'auto'
        }}
      >
        {/* Hlavička */}
        <Box sx={{ width: '100%', textAlign: 'center' }}>
          <Stack spacing={1} mb={1}>
            <Typography variant="h3" component="h1" fontWeight={600}>
              Fotogalerie
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Prohlédněte si fotografie ze setkání a akcí furry komunity
            </Typography>
          </Stack>
        </Box>
        
        <Divider />
        
        {/* Filtrační panel */}
        <Box sx={{ width: '100%' }}>
          <Suspense>
            <FilterPanelWrapper
              initialEvent={initialEvent}
              initialPhotographer={initialPhotographer}
              initialTags={initialTags}
              initialSortBy={initialSortBy as 'newest' | 'oldest' | 'most_liked'}
            />
          </Suspense>
        </Box>
        
        {/* Fotogalerie */}
        <Box sx={{ width: '100%' }}>
          <PhotoGrid photos={photos} />
        </Box>
      </Stack>
    </Box>
  );
} 