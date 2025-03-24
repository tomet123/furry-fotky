'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { 
  Divider, 
  Stack, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert,
  Pagination,
  PaginationItem,
  useTheme,
  useMediaQuery,
  Paper,
  IconButton,
  Grid,
  Tooltip
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { PhotoGrid } from '@/components/foto/PhotoGrid';
import { PhotoGalleryProvider, usePhotoGallery } from '@/app/contexts/PhotoGalleryContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PhotoDetailModal } from '@/components/foto/PhotoDetailModal';
import { Photo, likePhoto, unlikePhoto, getPhotoById, PhotoFilters } from '@/app/actions/photos';
import { useSession } from 'next-auth/react';
import { FilterBar } from '@/components/common/FilterBar';

interface FotoGalleryClientProps {
  initialFilters?: Partial<PhotoFilters>;
}

/**
 * Klientská wrapper komponenta, která obaluje fotogalerii v PhotoGalleryProvider
 */
export default function FotoGalleryClient({ initialFilters }: FotoGalleryClientProps = {}) {
  return (
    <PhotoGalleryProvider initialFilters={initialFilters}>
      <FotoGalleryContent />
    </PhotoGalleryProvider>
  );
}

/**
 * Hlavní obsah fotogalerie s přístupem ke kontextu
 */
function FotoGalleryContent() {
  const { 
    filters, 
    updateFilters, 
    resetFilters,
    photographers,
    events,
    availableTags,
    loadingFilterOptions,
    searchPhotographers,
    searchEvents,
    searchTags,
    totalItems,
    totalPages
  } = usePhotoGallery();
  const { data: session } = useSession();
  
  const sortOptions = [
    { value: 'newest', label: 'Nejnovější' },
    { value: 'oldest', label: 'Nejstarší' },
    { value: 'most_liked', label: 'Nejoblíbenější' }
  ];
  
  const handleFilterUpdate = useCallback((newFilters: any) => {
    updateFilters(newFilters);
  }, [updateFilters]);
  
  const handleResetFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <Stack 
        spacing={4} 
        pb={10} 
        sx={{ width: '100%', maxWidth: '1280px', mx: 'auto' }}
      >
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
        
        <FilterBar
          title="Filtrovat fotografie"
          filters={{
            query: filters.query || '',
            sortBy: filters.sortBy || 'newest',
            page: filters.page || 1,
            photographer: filters.photographer || '',
            event: filters.event || '',
            tags: filters.tags || [],
            onlyLiked: filters.onlyLiked
          }}
          onUpdateFilters={handleFilterUpdate}
          searchPlaceholder="Hledat podle fotografa, akce nebo tagu"
          sortOptions={sortOptions}
          defaultSortBy="newest"
          totalItems={totalItems}
          totalPages={totalPages}
          loading={loadingFilterOptions}
          photographerOptions={photographers}
          loadingPhotographers={loadingFilterOptions}
          onPhotographerSearch={searchPhotographers}
          eventOptions={events}
          loadingEvents={loadingFilterOptions}
          onEventSearch={searchEvents}
          tagOptions={availableTags}
          loadingTags={loadingFilterOptions}
          onTagSearch={searchTags}
          showSearch={false}
          showPhotographer={true}
          showEvent={true}
          showTags={true}
          showReset={false}
          compactMode={true}
          showCount={false}
          extraFields={
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mt: 2
            }}>
              <Typography variant="body2" color="text.secondary">
                Nalezeno {totalItems} položek
                {totalPages && totalPages > 1 && filters.page
                  ? ` (stránka ${filters.page} z ${totalPages})`
                  : ''}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                {session && (
                  <Tooltip title="Pouze oblíbené">
                    <IconButton 
                      color={filters.onlyLiked ? "primary" : "default"}
                      onClick={() => updateFilters({ onlyLiked: !filters.onlyLiked })}
                      size="small"
                    >
                      {filters.onlyLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Resetovat filtry">
                  <IconButton
                    onClick={handleResetFilters}
                    size="small"
                    color="default"
                  >
                    <RestartAltIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          }
        />
        
        <GalleryContent />
      </Stack>
    </Box>
  );
}

/**
 * Komponenta pro zobrazení obsahu galerie včetně načítání a zpracování chyb
 */
function GalleryContent() {
  const { 
    photos, 
    loading, 
    error, 
    totalItems, 
    totalPages, 
    currentPage, 
    setPage
  } = usePhotoGallery();
  const { data: session } = useSession();
  
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  
  const activePhotoIndex = activePhoto ? photos.findIndex(photo => photo.id === activePhoto.id) : -1;

  const prefetchAdjacentPhotos = useCallback((currentIndex: number) => {
    if (photos.length <= 1 || currentIndex === -1) return;
    
    const prefetchImage = (photoId: string) => {
      if (!photoId) return;
      console.log('Přednačítám fotografii s ID:', photoId);
    };
    
    // Předchozí fotka
    const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
    const prevPhoto = photos[prevIndex];
    if (prevPhoto && prevPhoto.id) prefetchImage(prevPhoto.id);
    
    // Následující fotka
    const nextIndex = (currentIndex + 1) % photos.length;
    const nextPhoto = photos[nextIndex];
    if (nextPhoto && nextPhoto.id) prefetchImage(nextPhoto.id);
  }, [photos]);
  
  useEffect(() => {
    if (activePhoto && activePhotoIndex !== -1) {
      prefetchAdjacentPhotos(activePhotoIndex);
    }
  }, [activePhoto, activePhotoIndex, prefetchAdjacentPhotos]);

  const handlePrevious = useCallback(() => {
    if (photos.length > 1 && activePhotoIndex !== -1) {
      const newIndex = (activePhotoIndex - 1 + photos.length) % photos.length;
      setActivePhoto(photos[newIndex]);
    }
  }, [photos, activePhotoIndex]);

  const handleNext = useCallback(() => {
    if (photos.length > 1 && activePhotoIndex !== -1) {
      const newIndex = (activePhotoIndex + 1) % photos.length;
      setActivePhoto(photos[newIndex]);
    }
  }, [photos, activePhotoIndex]);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setActivePhoto(null);
  }, []);
  
  const handleOpenModal = useCallback((photo: Photo) => {
    setActivePhoto(photo);
    setModalOpen(true);
  }, []);

  const handleLike = useCallback(async (photo: Photo) => {
    try {
      if (!session?.user?.id) return;
      await likePhoto(photo.id, session.user.id);
    } catch (error) {
      // Chyba zpracována tiše
    }
  }, [session]);
  
  const handleUnlike = useCallback(async (photo: Photo) => {
    try {
      if (!session?.user?.id) return;
      await unlikePhoto(photo.id, session.user.id);
    } catch (error) {
      // Chyba zpracována tiše
    }
  }, [session]);

  if (loading && photos.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error" sx={{ maxWidth: 'sm', mx: 'auto' }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (photos.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Žádné fotografie nenalezeny
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Zkuste upravit filtry pro zobrazení více výsledků
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <PhotoGrid 
        photos={photos}
        onLikePhoto={handleLike}
        onUnlikePhoto={handleUnlike}
        onPhotoClick={handleOpenModal}
      />
      
      {modalOpen && activePhoto && (
        <PhotoDetailModal
          open={modalOpen}
          onClose={handleCloseModal}
          photo={activePhoto}
          allPhotos={photos}
          onLike={handleLike}
          onUnlike={handleUnlike}
          onPrevious={photos.length > 1 && activePhotoIndex !== -1 ? handlePrevious : undefined}
          onNext={photos.length > 1 && activePhotoIndex !== -1 ? handleNext : undefined}
        />
      )}
      
      <GalleryPagination />
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
}

/**
 * Komponenta pro stránkování využívající kontext fotogalerie
 */
function GalleryPagination() {
  const { totalItems, totalPages, currentPage, setPage } = usePhotoGallery();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };
  
  if (totalPages <= 1) {
    return (
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ mt: 3, textAlign: 'center' }}
      >
        Zobrazuji {totalItems} z {totalItems} {totalItems === 1 ? 'fotografie' : totalItems >= 2 && totalItems <= 4 ? 'fotografie' : 'fotografií'}
      </Typography>
    );
  }
  
  return (
    <Stack 
      spacing={2} 
      sx={{ 
        mt: 4, 
        mb: 2,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'center', sm: 'center' },
        justifyContent: 'space-between'
      }}
    >
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ 
          order: { xs: 2, sm: 1 },
          mt: { xs: 1, sm: 0 }
        }}
      >
        Zobrazuji {Math.min(currentPage * 10, totalItems) - Math.min((currentPage - 1) * 10, totalItems)} z {totalItems} {totalItems === 1 ? 'fotografie' : totalItems >= 2 && totalItems <= 4 ? 'fotografie' : 'fotografií'}
      </Typography>
      
      <Box sx={{ order: { xs: 1, sm: 2 } }}>
        <Pagination
          page={currentPage}
          count={totalPages}
          shape="rounded"
          color="primary"
          size={isMobile ? "small" : "medium"}
          siblingCount={isMobile ? 0 : 1}
          onChange={handlePageChange}
          renderItem={(item) => (
            <PaginationItem
              {...item}
              sx={{
                borderRadius: 1.5,
                '&.Mui-selected': {
                  fontWeight: 'bold',
                },
              }}
            />
          )}
        />
      </Box>
    </Stack>
  );
} 