'use client';

import { useState, useCallback, useEffect, ReactNode } from 'react';
import { 
  Paper, 
  Box, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Grid,
  Typography,
  Autocomplete,
  CircularProgress,
  SelectChangeEvent,
  useTheme,
  useMediaQuery,
  IconButton,
  InputAdornment,
  Button,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FilterListIcon from '@mui/icons-material/FilterList';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// Typ pro obecný filter
export type Filter = {
  query?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
  photographer?: string | null;
  event?: string | null;
  tags?: string[];
  onlyLiked?: boolean;
  [key: string]: any;
};

// Typy hodnot pro řazení
export type SortOption = {
  value: string;
  label: string;
};

// Typ pro volbu Autocomplete
export type AutocompleteOption = {
  id: string;
  label: string;
  value: string;
};

// Možnosti filtrovacího panelu
export interface FilterBarProps {
  title?: string;
  filters: Filter;
  // Možnosti pro řazení
  sortOptions?: SortOption[];
  // Funkce pro aktualizaci filtrů
  onUpdateFilters: (newFilters: Partial<Filter>) => void;
  // Placeholder pro vyhledávání
  searchPlaceholder?: string;
  // Zobrazit pole pro vyhledávání
  showSearch?: boolean;
  // Zobrazit pole pro řazení
  showSort?: boolean;
  // Výchozí hodnota řazení
  defaultSortBy?: string;
  // Další políčka formuláře
  extraFields?: ReactNode;
  // Vlastní komponenty pro vložení mezi vyhledávání a řazení
  customFields?: ReactNode;
  // Počet nalezených položek
  totalItems?: number;
  // Celkový počet stránek
  totalPages?: number;
  // Loading stav
  loading?: boolean;
  // Možnosti fotografů pro Autocomplete
  photographerOptions?: string[] | AutocompleteOption[];
  // Načítání fotografů
  loadingPhotographers?: boolean;
  // Funkce pro vyhledávání fotografů
  onPhotographerSearch?: (search: string) => void;
  // Možnosti událostí pro Autocomplete
  eventOptions?: string[] | AutocompleteOption[];
  // Načítání událostí
  loadingEvents?: boolean;
  // Funkce pro vyhledávání událostí
  onEventSearch?: (search: string) => void;
  // Možnosti tagů pro Autocomplete
  tagOptions?: string[] | AutocompleteOption[];
  // Načítání tagů
  loadingTags?: boolean;
  // Funkce pro vyhledávání tagů
  onTagSearch?: (search: string) => void;
  // Zobrazit pole pro fotografa
  showPhotographer?: boolean;
  // Zobrazit pole pro událost
  showEvent?: boolean;
  // Zobrazit pole pro tagy
  showTags?: boolean;
  // Zobrazit tlačítko resetovat filtry
  showReset?: boolean;
  // Zobrazit pouze ve výchozím stavu základní filtry (search a sort)
  compactMode?: boolean;
  // Zobrazit počet položek
  showCount?: boolean;
}

/**
 * Univerzální komponenta pro filtrování obsahu
 */
export function FilterBar({
  title,
  filters,
  sortOptions = [],
  onUpdateFilters,
  searchPlaceholder = 'Hledat...',
  showSearch = true,
  showSort = true,
  defaultSortBy = '',
  extraFields,
  customFields,
  totalItems,
  totalPages,
  loading = false,
  photographerOptions = [],
  loadingPhotographers = false,
  onPhotographerSearch,
  eventOptions = [],
  loadingEvents = false,
  onEventSearch,
  tagOptions = [],
  loadingTags = false,
  onTagSearch,
  showPhotographer = false,
  showEvent = false,
  showTags = false,
  showReset = false,
  compactMode = false,
  showCount = true
}: FilterBarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expanded, setExpanded] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);
  
  // Debug log
  useEffect(() => {
    console.log('FilterBar props:', { 
      title, 
      isMobile,
      compactMode,
      expanded,
      showAdvancedFilters,
      filters,
      showSearch,
      showSort,
      sortOptions
    });
  }, [title, isMobile, compactMode, expanded, showAdvancedFilters, filters, showSearch, showSort, sortOptions]);
  
  // Pomocné stavy pro autocomplete vyhledávání
  const [photographerInput, setPhotographerInput] = useState('');
  const [eventInput, setEventInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  
  // Zachycení změny z mobilního na desktop režim
  useEffect(() => {
    // Vždy ponecháme expanded jako true
    setExpanded(true);
  }, [isMobile, compactMode]);
  
  // Funkce pro zpracování vyhledávání
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateFilters({ query: e.target.value, page: 1 });
  };
  
  // Funkce pro zpracování změny řazení
  const handleSortChange = (e: SelectChangeEvent) => {
    onUpdateFilters({ sortBy: e.target.value, page: 1 });
  };
  
  // Funkce pro vymazání vyhledávání
  const handleClearSearch = () => {
    onUpdateFilters({ query: '', page: 1 });
  };
  
  // Funkce pro změnu fotografa
  const handlePhotographerChange = (_event: React.SyntheticEvent, newValue: string | null) => {
    onUpdateFilters({ photographer: newValue, page: 1 });
  };
  
  // Funkce pro zpracování vyhledávání fotografů
  const handlePhotographerInputChange = (_event: React.SyntheticEvent, value: string) => {
    setPhotographerInput(value);
    if (onPhotographerSearch) {
      onPhotographerSearch(value);
    }
  };
  
  // Funkce pro vymazání fotografa
  const handleClearPhotographer = () => {
    onUpdateFilters({ photographer: null, page: 1 });
    setPhotographerInput('');
  };
  
  // Funkce pro změnu události
  const handleEventChange = (_event: React.SyntheticEvent, newValue: string | null) => {
    onUpdateFilters({ event: newValue, page: 1 });
  };
  
  // Funkce pro zpracování vyhledávání událostí
  const handleEventInputChange = (_event: React.SyntheticEvent, value: string) => {
    setEventInput(value);
    if (onEventSearch) {
      onEventSearch(value);
    }
  };
  
  // Funkce pro vymazání události
  const handleClearEvent = () => {
    onUpdateFilters({ event: null, page: 1 });
    setEventInput('');
  };
  
  // Funkce pro změnu tagů
  const handleTagChange = (_event: React.SyntheticEvent, newValue: string[]) => {
    onUpdateFilters({ tags: newValue, page: 1 });
  };
  
  // Funkce pro zpracování vyhledávání tagů
  const handleTagInputChange = (_event: React.SyntheticEvent, value: string) => {
    setTagInput(value);
    if (onTagSearch) {
      onTagSearch(value);
    }
  };
  
  // Funkce pro vymazání tagů
  const handleClearTags = () => {
    onUpdateFilters({ tags: [], page: 1 });
    setTagInput('');
  };
  
  // Funkce pro reset všech filtrů
  const handleResetAllFilters = () => {
    onUpdateFilters({
      query: '',
      photographer: null,
      event: null,
      tags: [],
      page: 1,
      sortBy: defaultSortBy || undefined
    });
    setPhotographerInput('');
    setEventInput('');
    setTagInput('');
  };
  
  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Toggle advanced filters
  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };
  
  // Kontrola, zda jsou filtry aktivní
  const areFiltersActive = 
    (filters.query && filters.query.length > 0) || 
    (filters.photographer) || 
    (filters.event) || 
    (filters.tags && filters.tags.length > 0) ||
    (filters.sortBy && filters.sortBy !== defaultSortBy);
  
  return (
    <Box sx={{ width: '100%' }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, sm: 2.5 }, 
          pt: { xs: 2, sm: 2.5 },
          pb: { xs: 2, sm: 2.5 },
          mb: 0,
          borderRadius: 2,
          bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          border: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
          width: '100%'
        }}
      >
        {/* Titulek (pouze pro mobilní verzi) */}
        {(isMobile && title) && (
          <Box 
            onClick={toggleExpanded} 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer',
              mb: expanded ? 2 : 0,
              pb: expanded ? 1 : 0,
              borderBottom: expanded ? `1px solid ${theme.palette.divider}` : 'none'
            }}
          >
            <Typography variant="subtitle1" fontWeight="medium">
              {title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {areFiltersActive && (
                <Chip 
                  size="small" 
                  label="Aktivní filtry" 
                  color="primary" 
                  variant="outlined" 
                  sx={{ mr: 1 }}
                />
              )}
              <IconButton size="small">
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Box>
        )}
        
        {/* Obsah filtračního panelu */}
        <Box sx={{ display: expanded ? 'block' : 'none', width: '100%' }}>
          <Grid container spacing={2} alignItems="flex-start">
            {/* Vyhledávání */}
            {showSearch && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder={searchPlaceholder}
                  label="Vyhledávání podle jména, akce nebo tagu"
                  variant="outlined"
                  size={isMobile ? "small" : "small"}
                  value={filters.query || ''}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                    endAdornment: filters.query ? (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="vymazat vyhledávání"
                          onClick={handleClearSearch}
                          edge="end"
                          size="small"
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
            )}
            
            {/* Vlastní komponenty */}
            {customFields && customFields}
            
            {/* Fotograf */}
            {showPhotographer && (
              <Grid item xs={12} sm={6} md={3}>
                <Autocomplete
                  size="small"
                  options={photographerOptions as any[]}
                  value={filters.photographer}
                  onChange={handlePhotographerChange}
                  onInputChange={handlePhotographerInputChange}
                  inputValue={photographerInput}
                  loading={loadingPhotographers}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Fotograf"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {filters.photographer && (
                              <IconButton 
                                size="small" 
                                onClick={handleClearPhotographer}
                                sx={{ mr: 0.5 }}
                              >
                                <ClearIcon fontSize="small" />
                              </IconButton>
                            )}
                            {loadingPhotographers ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  )}
                  loadingText="Načítám fotografy..."
                  noOptionsText="Žádní fotografové nenalezeni"
                />
              </Grid>
            )}
            
            {/* Událost */}
            {showEvent && (
              <Grid item xs={12} sm={6} md={3}>
                <Autocomplete
                  size="small"
                  options={eventOptions as any[]}
                  value={filters.event}
                  onChange={handleEventChange}
                  onInputChange={handleEventInputChange}
                  inputValue={eventInput}
                  loading={loadingEvents}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Akce"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {filters.event && (
                              <IconButton 
                                size="small" 
                                onClick={handleClearEvent}
                                sx={{ mr: 0.5 }}
                              >
                                <ClearIcon fontSize="small" />
                              </IconButton>
                            )}
                            {loadingEvents ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  )}
                  loadingText="Načítám akce..."
                  noOptionsText="Žádné akce nenalezeny"
                />
              </Grid>
            )}
            
            {/* Tagy */}
            {showTags && (
              <Grid item xs={12} sm={6} md={3}>
                <Autocomplete
                  multiple
                  size="small"
                  options={tagOptions as any[]}
                  value={filters.tags || []}
                  onChange={handleTagChange}
                  onInputChange={handleTagInputChange}
                  inputValue={tagInput}
                  loading={loadingTags}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Tagy"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {filters.tags && filters.tags.length > 0 && (
                              <IconButton 
                                size="small" 
                                onClick={handleClearTags}
                                sx={{ mr: 0.5 }}
                              >
                                <ClearIcon fontSize="small" />
                              </IconButton>
                            )}
                            {loadingTags ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  )}
                  loadingText="Načítám tagy..."
                  noOptionsText="Žádné tagy nenalezeny"
                />
              </Grid>
            )}
            
            {/* Řazení */}
            {showSort && sortOptions.length > 0 && (
              <Grid item xs={12} sm={6} md={3} sx={{ ml: { xs: 0, md: 'auto' } }}>
                <FormControl 
                  fullWidth 
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                >
                  <InputLabel>Řadit dle</InputLabel>
                  <Select
                    value={filters.sortBy || defaultSortBy}
                    onChange={handleSortChange}
                    label="Řadit dle"
                  >
                    {sortOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            {/* Reset filtrů */}
            {showReset && areFiltersActive && (
              <Grid item xs={12} display="flex" justifyContent="flex-end">
                <Button
                  variant="text"
                  color="primary"
                  size={isMobile ? "small" : "small"}
                  onClick={handleResetAllFilters}
                  startIcon={<RestartAltIcon />}
                >
                  Resetovat filtry
                </Button>
              </Grid>
            )}
          </Grid>
          
          {/* Informace o výsledcích */}
          {!loading && totalItems !== undefined && showCount && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Nalezeno {totalItems} položek
                {totalPages && totalPages > 1 && filters.page
                  ? ` (stránka ${filters.page} z ${totalPages})`
                  : ''}
              </Typography>
            </Box>
          )}
          
          {/* Extra komponenty pod hlavním filtrem */}
          {extraFields && (
            <Box sx={{ 
              width: '100%', 
              pt: 2,
              mt: 1,
              borderTop: `1px solid ${theme.palette.divider}`
            }}>
              {extraFields}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
} 