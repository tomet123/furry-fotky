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
  FormControlLabel,
  Button
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { PhotoGrid } from '@/components/foto/PhotoGrid';
import { PhotoGalleryProvider, usePhotoGallery } from '@/app/contexts/PhotoGalleryContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PhotoDetailModal } from '@/components/foto/PhotoDetailModal';
import { Photo, likePhoto, unlikePhoto, getPhotoById } from '@/app/actions/photos';
import { useSession } from 'next-auth/react';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expanded, setExpanded] = useState(!isMobile);
  const { data: session } = useSession();

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

  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: { xs: 2, sm: 2.5 }, 
        bgcolor: 'background.paper', 
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Mobilní verze s možností rozbalení/sbalení */}
      {isMobile && (
        <Box 
          onClick={toggleExpanded} 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer',
            mb: expanded ? 2 : 0,
            pb: 1
          }}
        >
          <Typography variant="subtitle1" fontWeight="medium">
            Filtry a vyhledávání
          </Typography>
          <IconButton size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      )}
      
      {/* Obsah filtračního panelu */}
      <Box sx={{ display: expanded ? 'block' : 'none' }}>
        {/* První řádek - všechna pole */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <Autocomplete
                freeSolo
                options={photographers}
                value={filters.photographer || null}
                onChange={handlePhotographerChange}
                onInputChange={handlePhotographerInputChange}
                loading={loadingFilterOptions}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Fotograf"
                    size={isMobile ? "small" : "medium"}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingFilterOptions ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <Autocomplete
                freeSolo
                options={events}
                value={filters.event || null}
                onChange={handleEventChange}
                onInputChange={handleEventInputChange}
                loading={loadingFilterOptions}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Událost"
                    size={isMobile ? "small" : "medium"}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingFilterOptions ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <Autocomplete
                multiple
                filterSelectedOptions
                limitTags={2}
                options={availableTags}
                value={filters.tags || []}
                onChange={handleTagChange}
                onInputChange={handleTagInputChange}
                loading={loadingFilterOptions}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tagy"
                    size={isMobile ? "small" : "medium"}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingFilterOptions ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <InputLabel id="sort-by-label">Řazení</InputLabel>
              <Select
                labelId="sort-by-label"
                id="sort-by-select"
                value={filters.sortBy || 'newest'}
                onChange={handleSortChange}
                label="Řazení"
                size={isMobile ? "small" : "medium"}
              >
                <MenuItem value="newest">Nejnovější</MenuItem>
                <MenuItem value="oldest">Nejstarší</MenuItem>
                <MenuItem value="most_liked">Nejoblíbenější</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {/* Druhý řádek - oblíbené a reset */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mt: 1
        }}>
          <Box>
            {session?.user && (
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filters.onlyLiked || false} 
                    onChange={handleOnlyLikedChange}
                    size={isMobile ? "small" : "medium"}
                  />
                }
                label="Jen oblíbené"
              />
            )}
          </Box>
          <Button 
            startIcon={<ClearIcon />}
            onClick={resetFilters}
            disabled={!filters.photographer && !filters.event && (!filters.tags || filters.tags.length === 0) && !filters.onlyLiked && filters.sortBy === 'newest'}
            size={isMobile ? "small" : "medium"}
          >
            Vyčistit filtry
          </Button>
        </Box>
      </Box>
    </Paper>
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
  
  // Lokální stav pro řízení zobrazení modálu a aktivní fotky
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  
  // Aktivní index fotky pro navigaci
  const activePhotoIndex = activePhoto ? photos.findIndex(photo => photo.id === activePhoto.id) : -1;

  // Funkce pro přednačtení okolních fotografií pro rychlejší navigaci
  const prefetchAdjacentPhotos = useCallback((currentIndex: number) => {
    if (photos.length <= 1 || currentIndex === -1) return;
    
    // Poznámka: Přednačítání pomocí URL je nyní zastaralé, protože používáme server actions
    // Tato funkce byla ponechána pro budoucí implementaci přednačtení pomocí server actions
    
    // Funkce pro kešování dat fotografie - prozatím deaktivováno
    const prefetchImage = (photoId: string) => {
      if (!photoId) return;
      
      // Zde bychom mohli implementovat prefetching pomocí server actions v budoucnu
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
  
  // Přednačtení fotek při změně aktivní fotky
  useEffect(() => {
    if (activePhoto && activePhotoIndex !== -1) {
      prefetchAdjacentPhotos(activePhotoIndex);
    }
  }, [activePhoto, activePhotoIndex, prefetchAdjacentPhotos]);

  // Navigace na předchozí fotku
  const handlePrevious = useCallback(() => {
    if (photos.length > 1 && activePhotoIndex !== -1) {
      const newIndex = (activePhotoIndex - 1 + photos.length) % photos.length;
      console.log('Navigace na předchozí, aktuální index:', activePhotoIndex, 'nový index:', newIndex);
      setActivePhoto(photos[newIndex]);
    }
  }, [photos, activePhotoIndex]);

  // Navigace na další fotku
  const handleNext = useCallback(() => {
    if (photos.length > 1 && activePhotoIndex !== -1) {
      const newIndex = (activePhotoIndex + 1) % photos.length;
      console.log('Navigace na další, aktuální index:', activePhotoIndex, 'nový index:', newIndex);
      setActivePhoto(photos[newIndex]);
    }
  }, [photos, activePhotoIndex]);

  // Handler pro zavření modálu
  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setActivePhoto(null);
  }, []);
  
  // Handler pro otevření modálu s konkrétní fotkou
  const handleOpenModal = useCallback((photo: Photo) => {
    setActivePhoto(photo);
    setModalOpen(true);
  }, []);

  // Funkce pro lajkování fotografie
  const handleLike = useCallback(async (photo: Photo) => {
    try {
      if (!session?.user?.id) return;
      await likePhoto(photo.id, session.user.id);
    } catch (error) {
      // Chyba zpracována tiše
    }
  }, [session]);
  
  // Funkce pro odlajkování fotografie
  const handleUnlike = useCallback(async (photo: Photo) => {
    try {
      if (!session?.user?.id) return;
      await unlikePhoto(photo.id, session.user.id);
    } catch (error) {
      // Chyba zpracována tiše
    }
  }, [session]);

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
      <PhotoGrid 
        photos={photos}
        onLikePhoto={handleLike}
        onUnlikePhoto={handleUnlike}
        onPhotoClick={handleOpenModal}
      />
      
      {/* Společný modál pro detail fotky - pouze když je otevřený */}
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