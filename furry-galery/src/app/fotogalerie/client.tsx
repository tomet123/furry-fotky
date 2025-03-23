'use client';

import React, { useCallback, useEffect } from 'react';
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
  Autocomplete,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  Grid,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { PhotoGrid } from '@/components/foto/PhotoGrid';
import { PhotoGalleryProvider, usePhotoGallery } from '@/app/contexts/PhotoGalleryContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PhotoDetailModal } from '@/components/foto/PhotoDetailModal';
import { Photo, likePhoto, unlikePhoto } from '@/app/actions/photos';

/**
 * Klientská wrapper komponenta, která obaluje fotogalerii v PhotoGalleryProvider
 */
export default function FotoGalleryClient() {
  return (
    <PhotoGalleryProvider>
      <FotoGalleryContent />
    </PhotoGalleryProvider>
  );
}

/**
 * Hlavní obsah fotogalerie s přístupem ke kontextu
 */
function FotoGalleryContent() {
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
          <GalleryFilterPanel />
        </Box>
        
        {/* Obsah fotogalerie */}
        <GalleryContent />
      </Stack>
    </Box>
  );
}

/**
 * Komponenta filtračního panelu využívající kontext fotogalerie
 */
function GalleryFilterPanel() {
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
    searchTags
  } = usePhotoGallery();

  // Handler pro změnu události
  const handleEventChange = (_event: React.SyntheticEvent, newValue: string | null) => {
    updateFilters({ event: newValue || '' });
  };

  // Handler pro změnu fotografa
  const handlePhotographerChange = (_event: React.SyntheticEvent, newValue: string | null) => {
    updateFilters({ photographer: newValue || '' });
  };

  // Handler pro změnu tagů
  const handleTagChange = (_event: React.SyntheticEvent, newValue: string[]) => {
    updateFilters({ tags: newValue });
  };

  // Handler pro změnu řazení
  const handleSortChange = (e: SelectChangeEvent) => {
    updateFilters({ sortBy: e.target.value as 'newest' | 'oldest' | 'most_liked' });
  };

  // Handler pro vyhledávání fotografů
  const handlePhotographerInputChange = (_event: React.SyntheticEvent, value: string) => {
    searchPhotographers(value);
  };

  // Handler pro vyhledávání událostí
  const handleEventInputChange = (_event: React.SyntheticEvent, value: string) => {
    searchEvents(value);
  };

  // Handler pro vyhledávání tagů
  const handleTagInputChange = (_event: React.SyntheticEvent, value: string) => {
    searchTags(value);
  };

  // Handler pro změnu zaškrtávátka oblíbených
  const handleOnlyLikedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ onlyLiked: event.target.checked });
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3, 
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Grid container spacing={2}>
        {/* Události */}
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Autocomplete
              id="event-filter"
              options={events}
              value={filters.event || null}
              onChange={handleEventChange}
              onInputChange={handleEventInputChange}
              loading={loadingFilterOptions}
              loadingText="Načítám události..."
              noOptionsText="Žádné události nenalezeny"
              disableClearable={false}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Událost"
                  fullWidth
                  variant="outlined"
                />
              )}
            />
            
            <Box sx={{ display: 'flex', mt: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!filters.onlyLiked}
                    onChange={handleOnlyLikedChange}
                    icon={<FavoriteBorderIcon />}
                    checkedIcon={<FavoriteIcon />}
                    color="primary"
                    size="small"
                  />
                }
                label="Jen oblíbené"
              />
            </Box>
          </Box>
        </Grid>

        {/* Fotografové */}
        <Grid item xs={12} sm={6} md={3}>
          <Autocomplete
            id="photographer-filter"
            options={photographers}
            value={filters.photographer || null}
            onChange={handlePhotographerChange}
            onInputChange={handlePhotographerInputChange}
            loading={loadingFilterOptions}
            loadingText="Načítám fotografy..."
            noOptionsText="Žádní fotografové nenalezeni"
            disableClearable={false}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Fotograf"
                fullWidth
                variant="outlined"
              />
            )}
          />
        </Grid>

        {/* Tagy */}
        <Grid item xs={12} sm={6} md={3}>
          <Autocomplete
            id="tags-filter"
            multiple
            options={availableTags}
            value={filters.tags || []}
            onChange={handleTagChange}
            onInputChange={handleTagInputChange}
            loading={loadingFilterOptions}
            loadingText="Načítám tagy..."
            noOptionsText="Žádné tagy nenalezeny"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tagy"
                fullWidth
                variant="outlined"
                placeholder={filters.tags && filters.tags.length > 0 ? "" : "Vyberte tagy"}
              />
            )}
          />
        </Grid>

        {/* Řazení */}
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="sort-by-label">Řadit podle</InputLabel>
              <Select
                labelId="sort-by-label"
                id="sort-by"
                value={filters.sortBy}
                onChange={handleSortChange}
                label="Řadit podle"
              >
                <MenuItem value="newest">Nejnovější</MenuItem>
                <MenuItem value="oldest">Nejstarší</MenuItem>
                <MenuItem value="most_liked">Nejvíce líbí</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, justifyContent: 'flex-end' }}>
              <IconButton
                onClick={resetFilters}
                color="primary"
                size="medium"
                aria-label="Vymazat filtry"
                title="Vymazat filtry"
              >
                <ClearIcon />
              </IconButton>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

/**
 * Komponenta pro zobrazení obsahu galerie včetně načítání a zpracování chyb
 */
function GalleryContent() {
  // Všechny potřebné údaje získáme z kontextu
  const { 
    photos, 
    loading, 
    error, 
    totalItems, 
    totalPages, 
    currentPage, 
    setPage,
    activePhotoId,
    setActivePhotoId
  } = usePhotoGallery();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Aktivní fotka pro modální okno a její index
  const activePhoto = photos.find(photo => photo.id === activePhotoId);
  const activePhotoIndex = activePhoto ? photos.findIndex(photo => photo.id === activePhotoId) : -1;

  // Navigace na předchozí fotku
  const handlePrevious = useCallback(() => {
    if (photos.length > 1 && activePhotoIndex !== -1) {
      const newIndex = (activePhotoIndex - 1 + photos.length) % photos.length;
      const prevPhoto = photos[newIndex];
      
      // Pouze aktualizujeme URL, o změnu stavu se postará useEffect
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('photoId', prevPhoto.id);
      router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
    }
  }, [photos, activePhotoIndex, router, pathname, searchParams]);

  // Navigace na další fotku
  const handleNext = useCallback(() => {
    if (photos.length > 1 && activePhotoIndex !== -1) {
      const newIndex = (activePhotoIndex + 1) % photos.length;
      const nextPhoto = photos[newIndex];
      
      // Pouze aktualizujeme URL, o změnu stavu se postará useEffect
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('photoId', nextPhoto.id);
      router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
    }
  }, [photos, activePhotoIndex, router, pathname, searchParams]);

  // Handler pro zavření modálu
  const handleCloseModal = useCallback(() => {
    // Pouze aktualizujeme URL, o změnu stavu se postará useEffect
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('photoId');
    const newUrl = newParams.toString() ? `${pathname}?${newParams.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [router, pathname, searchParams]);
  
  // Při změně URL parametrů kontrolujeme, zda se má zobrazit detail fotky
  useEffect(() => {
    const photoIdFromUrl = searchParams.get('photoId');
    
    // Pokud není žádné photoId v URL, zavřeme modál (pokud je otevřený)
    if (!photoIdFromUrl) {
      if (activePhotoId) {
        setActivePhotoId(null);
      }
      return;
    }
    
    // Pokud je photoId v URL a je jiné než aktuální activePhotoId
    if (photoIdFromUrl !== activePhotoId) {
      // Ověříme, že fotka existuje v aktuálním seznamu
      const photoExists = photos.some(photo => photo.id === photoIdFromUrl);
      if (photoExists) {
        setActivePhotoId(photoIdFromUrl);
      } else {
        // Pokud fotka neexistuje, odstraníme parametr z URL
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete('photoId');
        const newUrl = newParams.toString() ? `${pathname}?${newParams.toString()}` : pathname;
        router.replace(newUrl, { scroll: false });
      }
    }
  }, [searchParams, activePhotoId, photos, setActivePhotoId, router, pathname]);

  // Funkce pro lajkování fotografie
  const handleLike = useCallback(async (photo: Photo) => {
    try {
      await likePhoto(photo.id, 'current-user-id'); // TODO: Získat ID přihlášeného uživatele
    } catch (error) {
      console.error('Chyba při lajkování fotografie:', error);
    }
  }, []);

  // Funkce pro odlajkování fotografie
  const handleUnlike = useCallback(async (photo: Photo) => {
    try {
      await unlikePhoto(photo.id, 'current-user-id'); // TODO: Získat ID přihlášeného uživatele
    } catch (error) {
      console.error('Chyba při odlajkování fotografie:', error);
    }
  }, []);

  // Zobrazení načítání
  if (loading && photos.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Zobrazení chyby
  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error" sx={{ maxWidth: 'sm', mx: 'auto' }}>
          {error}
        </Alert>
      </Box>
    );
  }

  // Zobrazení prázdného stavu
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

  // Zobrazení fotografií
  return (
    <Box sx={{ width: '100%' }}>
      <PhotoGrid photos={photos} />
      
      {/* Společný modál pro detail fotky */}
      {activePhoto && (
        <PhotoDetailModal
          open={!!activePhoto}
          onClose={handleCloseModal}
          photo={activePhoto}
          allPhotos={photos}
          onLike={handleLike}
          onUnlike={handleUnlike}
          onPrevious={photos.length > 1 ? handlePrevious : undefined}
          onNext={photos.length > 1 ? handleNext : undefined}
        />
      )}
      
      {/* Stránkování */}
      <GalleryPagination />
      
      {/* Indikátor načítání při změně stránky */}
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
  
  // Handler pro změnu stránky
  const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };
  
  // Pokud máme jen jednu stránku, nezobrazíme stránkování
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