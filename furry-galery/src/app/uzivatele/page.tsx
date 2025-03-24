'use client';

import { useState } from 'react';
import { 
  Typography, 
  Box, 
  Card, 
  CardActionArea, 
  Container,
  Paper,
  Grid,
  Avatar,
  CircularProgress,
  Pagination,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EventIcon from '@mui/icons-material/Event';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Link from 'next/link';
import Image from 'next/image';
import { usePhotographers } from '@/app/hooks/usePhotographers';
import type { Photographer, PhotographerFilters } from '@/app/actions/photographers';
import { FilterBar, type SortOption, type Filter } from '@/components/common/FilterBar';

// Funkce pro získání barvy avataru
const getAvatarColor = (id: string): string => {
  const colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', 
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', 
    '#009688', '#4caf50', '#8bc34a', '#cddc39'
  ];
  return colors[id.charCodeAt(0) % colors.length];
};

// Možnosti řazení pro fotografy
const sortOptions: SortOption[] = [
  { value: 'username', label: 'Podle jména' },
  { value: 'photos', label: 'Podle počtu fotografií' },
  { value: 'likes', label: 'Podle oblíbenosti' }
];

// Wrapper funkce pro konverzi typů filtrů
const createUpdateFilterHandler = (updateFn: (filters: Partial<PhotographerFilters>) => void) => {
  return (newFilters: Partial<Filter>) => {
    const typedFilters: Partial<PhotographerFilters> = {
      ...newFilters,
      sortBy: (newFilters.sortBy as 'username' | 'photos' | 'likes' | undefined)
    };
    updateFn(typedFilters);
  };
};

export default function Photographers() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Stav pro typ zobrazení uživatelů
  const [userType, setUserType] = useState<'all' | 'photographers' | 'organizers'>('all');
  
  // Použití custom hooku pro načtení fotografů
  const { 
    photographers, 
    loading, 
    error, 
    totalPages,
    filters, 
    setPage, 
    updateFilters 
  } = usePhotographers({
    sortBy: 'username',
    limit: 12
  });

  // Vytvoření filtrační funkce s typovou konverzí
  const handleFilterUpdate = createUpdateFilterHandler(updateFilters);

  // Funkce pro zpracování změny stránky
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Scroll nahoru
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Handler pro změnu typu zobrazení uživatelů
  const handleUserTypeChange = (_event: React.MouseEvent<HTMLElement>, newUserType: 'all' | 'photographers' | 'organizers') => {
    if (newUserType !== null) {
      setUserType(newUserType);
      
      // Aktualizujeme filtry podle výběru
      // Poznámka: tato logika bude muset být implementována v backendu
      updateFilters({ userType: newUserType });
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <Stack 
        spacing={3}
        pb={10} 
        sx={{ 
          width: '100%', 
          maxWidth: '1280px',
          mx: 'auto',
          px: 1,
          boxSizing: 'border-box'
        }}
      >
        {/* Hlavička */}
        <Box sx={{ width: '100%', textAlign: 'center', pt: 2 }}>
          <Typography variant="h3" component="h1" fontWeight={600}>
            Uživatelé
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Prohlédněte si profily fotografů a organizátorů furry komunity
          </Typography>
        </Box>
        
        <Divider />
        
        {/* Filtrační panel */}
        <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
          <FilterBar
            title="Filtrovat uživatele"
            filters={filters}
            onUpdateFilters={handleFilterUpdate}
            searchPlaceholder="Hledat uživatele"
            sortOptions={sortOptions}
            defaultSortBy="username"
            totalItems={photographers.length}
            totalPages={totalPages}
            loading={loading}
            showReset={false}
            compactMode={true}
            showSearch={true}
            showCount={false}
            customFields={
              <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
                <ToggleButtonGroup
                  value={userType}
                  exclusive
                  onChange={handleUserTypeChange}
                  size="small"
                  aria-label="Zobrazit uživatele"
                >
                  <ToggleButton value="all" aria-label="všichni uživatelé">
                    Všichni
                  </ToggleButton>
                  <ToggleButton value="photographers" aria-label="fotografové">
                    Fotografové
                  </ToggleButton>
                  <ToggleButton value="organizers" aria-label="organizátoři">
                    Organizátoři
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            }
            extraFields={
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mt: 1,
                mb: 0
              }}>
                {/* Text s počtem položek */}
                <Typography variant="body2" color="text.secondary">
                  Nalezeno {photographers.length} položek
                  {totalPages && totalPages > 1 && filters.page
                    ? ` (stránka ${filters.page} z ${totalPages})`
                    : ''}
                </Typography>
                
                {/* Tlačítko pro reset filtrů */}
                <Tooltip title="Resetovat filtry">
                  <IconButton
                    onClick={() => updateFilters({
                      query: '',
                      sortBy: 'username',
                      page: 1,
                      userType: 'all' // Reset na zobrazení všech uživatelů
                    })}
                    size="small"
                    color="default"
                  >
                    <RestartAltIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          />
        </Box>
        
        {/* Loading stav */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4, width: '100%' }}>
            <CircularProgress size={60} />
          </Box>
        )}
        
        {/* Chybová zpráva */}
        {error && (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2, width: '100%' }}>
            <Typography variant="h6" color="error">
              Došlo k chybě při načítání fotografů.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {error}
            </Typography>
          </Paper>
        )}
        
        {/* Prázdné výsledky */}
        {!loading && !error && photographers.length === 0 && (
          <Paper 
            sx={{ 
              p: 4, 
              textAlign: 'center', 
              bgcolor: 'background.paper',
              borderRadius: 2,
              mt: 4,
              width: '100%'
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nebyly nalezeny žádné výsledky
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Zkuste upravit vyhledávací dotaz nebo zobrazit všechny uživatele.
            </Typography>
          </Paper>
        )}
        
        {/* Seznam fotografů */}
        {!loading && !error && photographers.length > 0 ? (
          <>
            <Box sx={{ 
              width: '100%', 
              boxSizing: 'border-box',
              overflow: 'visible',
              ml: -1, /* Kompenzuje negativní margin gridu */
              mr: -1,
              px: 0
            }}>
              <Grid 
                container 
                spacing={2}
                sx={{
                  mt: 0,
                  pt: 0,
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                {photographers.map((photographer) => (
                  <Grid item key={photographer.id} xs={12} sm={6} md={3} lg={3}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        overflow: 'hidden',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                        }
                      }}
                    >
                      <CardActionArea 
                        component={Link} 
                        href={`/uzivatele/fotograf/${photographer.id}`}
                        sx={{ 
                          flexGrow: 1, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'stretch',
                          height: '100%'
                        }}
                      >
                        <Box sx={{ 
                          p: 3, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          position: 'relative'
                        }}>
                          {/* Ikony role uživatele */}
                          <Box sx={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 0.5 }}>
                            {/* Ikona pro fotografa */}
                            {!photographer.isOrganizer && (
                              <Tooltip title="Fotograf">
                                <Box sx={{ 
                                  p: 0.5, 
                                  bgcolor: 'primary.light', 
                                  color: 'primary.contrastText',
                                  borderRadius: '50%',
                                  display: 'flex'
                                }}>
                                  <CameraAltIcon fontSize="small" />
                                </Box>
                              </Tooltip>
                            )}
                            
                            {/* Ikona pro organizátora */}
                            {photographer.isOrganizer && (
                              <Tooltip title="Organizátor">
                                <Box sx={{ 
                                  p: 0.5, 
                                  bgcolor: 'secondary.light', 
                                  color: 'secondary.contrastText',
                                  borderRadius: '50%',
                                  display: 'flex'
                                }}>
                                  <EventIcon fontSize="small" />
                                </Box>
                              </Tooltip>
                            )}
                          </Box>

                          <Box
                            sx={{ 
                              width: 110,
                              height: 110,
                              mb: 2,
                              border: '4px solid',
                              borderColor: photographer.isOrganizer ? 'secondary.main' : 'primary.main',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              position: 'relative'
                            }}
                          >
                            {photographer.userId ? (
                              <Image 
                                src={`/api/profile-pictures/${photographer.userId}`}
                                alt={photographer.username}
                                fill
                                style={{ objectFit: 'cover' }}
                                onError={(e) => {
                                  // Fallback na barevný avatar pokud obrázek selže
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const container = target.parentElement;
                                  if (container) {
                                    container.style.backgroundColor = getAvatarColor(photographer.id);
                                    container.innerText = photographer.username.charAt(0);
                                    container.style.display = 'flex';
                                    container.style.justifyContent = 'center';
                                    container.style.alignItems = 'center';
                                    container.style.fontSize = '2.5rem';
                                    container.style.color = 'white';
                                  }
                                }}
                              />
                            ) : (
                              <Avatar 
                                sx={{ 
                                  width: '100%',
                                  height: '100%',
                                  bgcolor: getAvatarColor(photographer.id),
                                  fontSize: '2.5rem'
                                }}
                              >
                                {photographer.username.charAt(0)}
                              </Avatar>
                            )}
                          </Box>
                          <Typography 
                            gutterBottom 
                            variant="h6" 
                            component="h2" 
                            align="center"
                            sx={{ 
                              color: 'text.primary',
                              fontWeight: 600
                            }}
                          >
                            {photographer.username}
                          </Typography>
                          
                          {/* Statistiky */}
                          <Box sx={{ 
                            display: 'flex', 
                            gap: 2, 
                            mt: 1,
                            mb: 2, 
                            justifyContent: 'center', 
                            width: '100%' 
                          }}>
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center' 
                            }}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: 'rgba(255,167,38,0.15)',
                                mb: 0.5
                              }}>
                                <CameraAltIcon fontSize="small" sx={{ color: 'primary.main' }} />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {photographer.stats.photos}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center' 
                            }}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: 'rgba(244,67,54,0.15)',
                                mb: 0.5
                              }}>
                                <FavoriteIcon fontSize="small" sx={{ color: 'error.main' }} />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {photographer.stats.likes}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center' 
                            }}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: 'rgba(33,150,243,0.15)',
                                mb: 0.5
                              }}>
                                <EventIcon fontSize="small" sx={{ color: 'info.main' }} />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {photographer.stats.events}
                              </Typography>
                            </Box>
                          </Box>
                          
                          {/* Bio */}
                          {photographer.bio && (
                            <Typography 
                              variant="body2" 
                              align="center" 
                              color="text.secondary"
                              sx={{ 
                                maxHeight: 80, 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical'
                              }}
                            >
                              {photographer.bio}
                            </Typography>
                          )}
                        </Box>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
            
            {/* Stránkování */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 0, width: '100%' }}>
                <Pagination 
                  count={totalPages} 
                  page={filters.page} 
                  onChange={handlePageChange} 
                  color="primary" 
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: 'text.secondary',
                    },
                    '& .Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      }
                    }
                  }}
                />
              </Box>
            )}
          </>
        ) : null}
      </Stack>
    </Box>
  );
} 