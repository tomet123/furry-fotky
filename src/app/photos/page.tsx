'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  useTheme, 
  SelectChangeEvent,
  CircularProgress,
  Alert
} from '@mui/material';
import { Photo } from '@/hooks/usePhotoItems'; // Ponecháváme import typu Photo
import { usePhotos } from '@/hooks/usePhotos'; // Nový hook pro API
import { useTags } from '@/hooks/useTags'; // Hook pro načtení tagů
import { usePhotographers } from '@/hooks/usePhotographers'; // Hook pro načtení fotografů
import { useEvents } from '@/hooks/useEvents'; // Hook pro načtení událostí
import { PhotoCard } from '@/components/photos/PhotoCard';
import { PhotoDetail } from '@/components/photos/PhotoDetail';
import { FilterPanel } from '@/components/photos/FilterPanel';
import { PhotoPagination } from '@/components/photos/PhotoPagination';
import { NoPhotosFound } from '@/components/photos/NoPhotosFound';
import Grid from '@mui/material/Grid';

export default function Photos() {
  // Stav stránky
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [eventFilter, setEventFilter] = useState<string | null>('');
  const [photographerFilter, setPhotographerFilter] = useState<string | null>('');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_liked'>('newest');
  
  // Stav pro detail fotografie
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  // Počet položek na stránku
  const itemsPerPage = 12;
  
  // Získání dat z API pomocí nových hooků
  const { 
    photos, 
    loading: photosLoading, 
    error: photosError, 
    totalItems, 
    totalPages,
    likePhoto,
    unlikePhoto 
  } = usePhotos({
    page,
    limit: itemsPerPage,
    query: searchQuery || undefined,
    event: eventFilter || undefined,
    photographer: photographerFilter || undefined,
    tags: tagFilter.length > 0 ? tagFilter : undefined,
    sortBy
  });
  
  // Načtení dat pro filtry
  const { tags, loading: tagsLoading } = useTags();
  const { photographers, loading: photographersLoading } = usePhotographers();
  const { events, loading: eventsLoading } = useEvents();
  
  // AKCE
  
  // Otevření detailu fotografie
  const handleOpenDetail = useCallback((photo: Photo) => {
    setSelectedPhoto(photo);
    setDetailOpen(true);
  }, []);
  
  // Zavření detailu fotografie
  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
  }, []);
  
  // Resetování všech filtrů
  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setEventFilter('');
    setPhotographerFilter('');
    setTagFilter([]);
    setSortBy('newest');
    setPage(1);
  }, []);
  
  // Změna vyhledávacího dotazu
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset stránkování při změně vyhledávání
  }, []);
  
  // Navigace mezi fotografiemi v detailu
  const handleNextPhoto = useCallback(() => {
    if (!selectedPhoto) return;
    
    const currentIndex = photos.findIndex(photo => photo.id === selectedPhoto.id);
    if (currentIndex === -1 || currentIndex === photos.length - 1) return;
    
    setSelectedPhoto(photos[currentIndex + 1]);
  }, [selectedPhoto, photos]);

  const handlePreviousPhoto = useCallback(() => {
    if (!selectedPhoto) return;
    
    const currentIndex = photos.findIndex(photo => photo.id === selectedPhoto.id);
    if (currentIndex <= 0) return;
    
    setSelectedPhoto(photos[currentIndex - 1]);
  }, [selectedPhoto, photos]);
  
  // Určení, zda má fotografie předchozí a následující
  const hasNextPhoto = useMemo(() => {
    if (!selectedPhoto) return false;
    const currentIndex = photos.findIndex(photo => photo.id === selectedPhoto.id);
    return currentIndex !== -1 && currentIndex < photos.length - 1;
  }, [selectedPhoto, photos]);
  
  const hasPreviousPhoto = useMemo(() => {
    if (!selectedPhoto) return false;
    const currentIndex = photos.findIndex(photo => photo.id === selectedPhoto.id);
    return currentIndex > 0;
  }, [selectedPhoto, photos]);
  
  // Handler pro změnu filtrů
  const handleEventChange = useCallback((_event: React.SyntheticEvent, newValue: string | null) => {
    setEventFilter(newValue);
    setPage(1); // Reset stránkování při změně filtru
  }, []);
  
  const handlePhotographerChange = useCallback((_event: React.SyntheticEvent, newValue: string | null) => {
    setPhotographerFilter(newValue);
    setPage(1); // Reset stránkování při změně filtru
  }, []);
  
  const handleTagChange = useCallback((_event: React.SyntheticEvent, newValue: string[]) => {
    setTagFilter(newValue);
    setPage(1); // Reset stránkování při změně filtru
  }, []);
  
  const handleSortChange = useCallback((event: SelectChangeEvent) => {
    setSortBy(event.target.value as 'newest' | 'oldest' | 'most_liked');
    setPage(1); // Reset stránkování při změně řazení
  }, []);
  
  const handlePageChange = useCallback((_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Posun na začátek sekce s fotografiemi
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);
  
  // Funkce pro lajkování fotografií
  const handleLikePhoto = useCallback(async (photo: Photo) => {
    await likePhoto(photo.id);
  }, [likePhoto]);
  
  const handleUnlikePhoto = useCallback(async (photo: Photo) => {
    await unlikePhoto(photo.id);
  }, [unlikePhoto]);
  
  // RENDER
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Fotografie
      </Typography>
      
      {/* Filtrování */}
      <FilterPanel 
        events={events?.map(e => e.name) || []}
        photographers={photographers?.map(p => p.name) || []}
        tags={tags || []}
        eventFilter={eventFilter}
        photographerFilter={photographerFilter}
        tagFilter={tagFilter}
        sortBy={sortBy}
        onEventChange={handleEventChange}
        onPhotographerChange={handlePhotographerChange}
        onTagChange={handleTagChange}
        onSortChange={handleSortChange}
        loading={tagsLoading || photographersLoading || eventsLoading}
      />
      
      {/* Zpracování chyby při načítání */}
      {photosError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Došlo k chybě při načítání fotografií: {photosError}
        </Alert>
      )}
      
      {/* Obsah stránky */}
      {photosLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : photos.length > 0 ? (
        <>
          {/* Grid s fotografiemi */}
          <Grid container spacing={2.5}>
            {photos.map((photo) => (
              <Grid item key={photo.id} xs={12} sm={6} md={4} lg={3}>
                <PhotoCard 
                  photo={photo} 
                  onClick={handleOpenDetail}
                  onLike={handleLikePhoto}
                  onUnlike={handleUnlikePhoto}
                />
              </Grid>
            ))}
          </Grid>
          
          {/* Stránkování */}
          <PhotoPagination 
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <NoPhotosFound onReset={handleResetFilters} />
      )}

      {/* Modal pro detail fotografie */}
      <PhotoDetail 
        photo={selectedPhoto} 
        open={detailOpen} 
        onClose={handleCloseDetail}
        onNext={hasNextPhoto ? handleNextPhoto : undefined}
        onPrevious={hasPreviousPhoto ? handlePreviousPhoto : undefined}
        onLike={handleLikePhoto}
        onUnlike={handleUnlikePhoto}
      />
    </Container>
  );
} 