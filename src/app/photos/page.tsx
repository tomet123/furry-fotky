'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  useTheme, 
  SelectChangeEvent 
} from '@mui/material';
import { usePhotoItems, Photo } from '@/hooks/usePhotoItems';
import { PhotoCard } from '@/components/photos/PhotoCard';
import { PhotoDetail } from '@/components/photos/PhotoDetail';
import { FilterPanel } from '@/components/photos/FilterPanel';
import { PhotoPagination } from '@/components/photos/PhotoPagination';
import { NoPhotosFound } from '@/components/photos/NoPhotosFound';
import Grid from '@mui/material/Grid';

export default function Photos() {
  // Získání dat z hooků
  const allPhotos = usePhotoItems();
  
  // Stav stránky
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [eventFilter, setEventFilter] = useState<string | null>('');
  const [photographerFilter, setPhotographerFilter] = useState<string | null>('');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'most_liked'
  
  // Stav pro detail fotografie
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  // Počet položek na stránku
  const itemsPerPage = 12;
  
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
  
  // ODVOZENÁ DATA
  
  // Získání unikátních hodnot pro filtry
  const events = useMemo(() => {
    const uniqueEvents = [...new Set(allPhotos.map(photo => photo.event))];
    return uniqueEvents.sort();
  }, [allPhotos]);
  
  const photographers = useMemo(() => {
    const uniquePhotographers = [...new Set(allPhotos.map(photo => photo.photographer))];
    return uniquePhotographers.sort();
  }, [allPhotos]);
  
  const tags = useMemo(() => {
    const allTags = allPhotos.flatMap(photo => photo.tags);
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags.sort();
  }, [allPhotos]);
  
  // Filtrování fotografií podle filtrů
  const filteredPhotos = useMemo(() => {
    return allPhotos.filter(photo => {
      // Filtr podle vyhledávání (title, description, photographer, event)
      const matchesSearch = searchQuery 
        ? photo.photographer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          photo.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
          photo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
      
      // Filtr podle akce
      const matchesEvent = eventFilter ? photo.event === eventFilter : true;
      
      // Filtr podle fotografa
      const matchesPhotographer = photographerFilter ? photo.photographer === photographerFilter : true;
      
      // Filtr podle tagů - fotografie musí obsahovat všechny vybrané tagy
      const matchesTags = tagFilter.length > 0 
        ? tagFilter.every(tag => photo.tags.includes(tag))
        : true;
      
      return matchesSearch && matchesEvent && matchesPhotographer && matchesTags;
    });
  }, [allPhotos, searchQuery, eventFilter, photographerFilter, tagFilter]);
  
  // Seřazení filtrovaných fotografií
  const sortedPhotos = useMemo(() => {
    return [...filteredPhotos].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'most_liked':
          return b.likes - a.likes;
        default:
          return 0;
      }
    });
  }, [filteredPhotos, sortBy]);
  
  // Navigace mezi fotografiemi v detailu
  const handleNextPhoto = useCallback(() => {
    if (!selectedPhoto) return;
    
    const currentIndex = sortedPhotos.findIndex(photo => photo.id === selectedPhoto.id);
    if (currentIndex === -1 || currentIndex === sortedPhotos.length - 1) return;
    
    setSelectedPhoto(sortedPhotos[currentIndex + 1]);
  }, [selectedPhoto, sortedPhotos]);

  const handlePreviousPhoto = useCallback(() => {
    if (!selectedPhoto) return;
    
    const currentIndex = sortedPhotos.findIndex(photo => photo.id === selectedPhoto.id);
    if (currentIndex <= 0) return;
    
    setSelectedPhoto(sortedPhotos[currentIndex - 1]);
  }, [selectedPhoto, sortedPhotos]);
  
  // Výpočet stránkovaných fotografií
  const paginatedPhotos = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return sortedPhotos.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedPhotos, page, itemsPerPage]);
  
  // Výpočet celkového počtu stránek
  const pageCount = Math.ceil(sortedPhotos.length / itemsPerPage);
  
  // Určení, zda má fotografie předchozí a následující
  const hasNextPhoto = useMemo(() => {
    if (!selectedPhoto) return false;
    const currentIndex = sortedPhotos.findIndex(photo => photo.id === selectedPhoto.id);
    return currentIndex !== -1 && currentIndex < sortedPhotos.length - 1;
  }, [selectedPhoto, sortedPhotos]);
  
  const hasPreviousPhoto = useMemo(() => {
    if (!selectedPhoto) return false;
    const currentIndex = sortedPhotos.findIndex(photo => photo.id === selectedPhoto.id);
    return currentIndex > 0;
  }, [selectedPhoto, sortedPhotos]);
  
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
    setSortBy(event.target.value);
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
  
  // RENDER
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Fotografie
      </Typography>
      
      {/* Filtrování */}
      <FilterPanel 
        events={events}
        photographers={photographers}
        tags={tags}
        eventFilter={eventFilter}
        photographerFilter={photographerFilter}
        tagFilter={tagFilter}
        sortBy={sortBy}
        onEventChange={handleEventChange}
        onPhotographerChange={handlePhotographerChange}
        onTagChange={handleTagChange}
        onSortChange={handleSortChange}
      />
      
      {/* Obsah stránky */}
      {sortedPhotos.length > 0 ? (
        <>
          {/* Grid s fotografiemi */}
          <Grid container spacing={2.5}>
            {paginatedPhotos.map((photo) => (
              <Grid item key={photo.id} xs={12} sm={6} md={4} lg={3}>
                <PhotoCard photo={photo} onClick={handleOpenDetail} />
              </Grid>
            ))}
          </Grid>
          
          {/* Stránkování */}
          <PhotoPagination 
            page={page}
            totalPages={pageCount}
            totalItems={sortedPhotos.length}
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
      />
    </Container>
  );
} 