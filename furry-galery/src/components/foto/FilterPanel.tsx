'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  Paper, 
  Box, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Grid,
  Autocomplete,
  CircularProgress,
  SelectChangeEvent,
  IconButton
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { getPhotographers, getEvents, getTags } from '@/app/actions/filters';

interface FilterPanelProps {
  initialEvent?: string;
  initialPhotographer?: string;
  initialTags?: string[];
  initialSortBy?: 'newest' | 'oldest' | 'most_liked';
  onFilterChange?: (filters: {
    event: string | null;
    photographer: string | null;
    tags: string[];
    sortBy: string;
  }) => void;
}

/**
 * Komponenta filtračního panelu pro fotogalerii
 */
export function FilterPanel({
  initialEvent = '',
  initialPhotographer = '',
  initialTags = [],
  initialSortBy = 'newest',
  onFilterChange
}: FilterPanelProps) {
  // State pro filtry
  const [event, setEvent] = useState<string | null>(initialEvent || null);
  const [photographer, setPhotographer] = useState<string | null>(initialPhotographer || null);
  const [tags, setTags] = useState<string[]>(initialTags || []);
  const [sortBy, setSortBy] = useState<string>(initialSortBy || 'newest');
  
  // State pro data filtrů
  const [photographers, setPhotographers] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  // State pro načítání a otevřené menu
  const [loadingPhotographers, setLoadingPhotographers] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  
  // Pomocný state pro input hodnoty
  const [eventInputValue, setEventInputValue] = useState('');
  const [photographerInputValue, setPhotographerInputValue] = useState('');
  const [tagInputValue, setTagInputValue] = useState('');
  
  // Funkce pro načtení fotografů s vyhledáváním
  const loadPhotographers = useCallback(async (search: string = '') => {
    setLoadingPhotographers(true);
    try {
      const data = await getPhotographers(search);
      setPhotographers(data);
    } catch (error) {
      console.error('Chyba při načítání fotografů:', error);
    } finally {
      setLoadingPhotographers(false);
    }
  }, []);
  
  // Funkce pro načtení událostí s vyhledáváním
  const loadEvents = useCallback(async (search: string = '') => {
    setLoadingEvents(true);
    try {
      const data = await getEvents(search);
      setEvents(data);
    } catch (error) {
      console.error('Chyba při načítání událostí:', error);
    } finally {
      setLoadingEvents(false);
    }
  }, []);
  
  // Funkce pro načtení tagů s vyhledáváním
  const loadTags = useCallback(async (search: string = '') => {
    setLoadingTags(true);
    try {
      const data = await getTags(search);
      setAvailableTags(data);
    } catch (error) {
      console.error('Chyba při načítání tagů:', error);
    } finally {
      setLoadingTags(false);
    }
  }, []);
  
  // Načtení počátečních dat při prvním renderování
  useEffect(() => {
    loadPhotographers();
    loadEvents();
    loadTags();
  }, [loadPhotographers, loadEvents, loadTags]);
  
  // Informování o změně filtrů
  const notifyFilterChange = useCallback(() => {
    if (onFilterChange) {
      onFilterChange({
        event,
        photographer,
        tags,
        sortBy
      });
    }
  }, [event, photographer, tags, sortBy, onFilterChange]);
  
  // Funkce pro změnu události
  const handleEventChange = useCallback((_event: React.SyntheticEvent, newValue: string | null) => {
    setEvent(newValue);
    setTimeout(() => {
      if (onFilterChange) {
        onFilterChange({
          event: newValue,
          photographer,
          tags,
          sortBy
        });
      }
    }, 0);
  }, [photographer, tags, sortBy, onFilterChange]);
  
  // Funkce pro vymazání filtru události
  const handleClearEvent = useCallback(() => {
    setEvent(null);
    setEventInputValue('');
    setTimeout(() => {
      if (onFilterChange) {
        onFilterChange({
          event: null,
          photographer,
          tags,
          sortBy
        });
      }
    }, 0);
  }, [photographer, tags, sortBy, onFilterChange]);
  
  // Funkce pro změnu fotografa
  const handlePhotographerChange = useCallback((_event: React.SyntheticEvent, newValue: string | null) => {
    setPhotographer(newValue);
    setTimeout(() => {
      if (onFilterChange) {
        onFilterChange({
          event,
          photographer: newValue,
          tags,
          sortBy
        });
      }
    }, 0);
  }, [event, tags, sortBy, onFilterChange]);
  
  // Funkce pro vymazání filtru fotografa
  const handleClearPhotographer = useCallback(() => {
    setPhotographer(null);
    setPhotographerInputValue('');
    setTimeout(() => {
      if (onFilterChange) {
        onFilterChange({
          event,
          photographer: null,
          tags,
          sortBy
        });
      }
    }, 0);
  }, [event, tags, sortBy, onFilterChange]);
  
  // Funkce pro změnu tagů
  const handleTagChange = useCallback((_event: React.SyntheticEvent, newValue: string[]) => {
    setTags(newValue);
    setTimeout(() => {
      if (onFilterChange) {
        onFilterChange({
          event,
          photographer,
          tags: newValue,
          sortBy
        });
      }
    }, 0);
  }, [event, photographer, sortBy, onFilterChange]);
  
  // Funkce pro vymazání všech tagů
  const handleClearTags = useCallback(() => {
    setTags([]);
    setTimeout(() => {
      if (onFilterChange) {
        onFilterChange({
          event,
          photographer,
          tags: [],
          sortBy
        });
      }
    }, 0);
  }, [event, photographer, sortBy, onFilterChange]);
  
  // Funkce pro změnu řazení
  const handleSortChange = useCallback((e: SelectChangeEvent) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    setTimeout(() => {
      if (onFilterChange) {
        onFilterChange({
          event,
          photographer,
          tags,
          sortBy: newSortBy
        });
      }
    }, 0);
  }, [event, photographer, tags, onFilterChange]);
  
  // Funkce pro zpracování změny vyhledávacího textu pro události
  const handleEventInputChange = useCallback((event: React.SyntheticEvent, value: string) => {
    setEventInputValue(value);
    loadEvents(value);
  }, [loadEvents]);
  
  // Funkce pro zpracování změny vyhledávacího textu pro fotografy
  const handlePhotographerInputChange = useCallback((event: React.SyntheticEvent, value: string) => {
    setPhotographerInputValue(value);
    loadPhotographers(value);
  }, [loadPhotographers]);
  
  // Funkce pro zpracování změny vyhledávacího textu pro tagy
  const handleTagInputChange = useCallback((event: React.SyntheticEvent, value: string) => {
    setTagInputValue(value);
    loadTags(value);
  }, [loadTags]);
  
  // Funkce pro reset všech filtrů
  const handleResetAllFilters = useCallback(() => {
    setEvent(null);
    setPhotographer(null);
    setTags([]);
    setSortBy('newest');
    setEventInputValue('');
    setPhotographerInputValue('');
    
    setTimeout(() => {
      if (onFilterChange) {
        onFilterChange({
          event: null,
          photographer: null,
          tags: [],
          sortBy: 'newest'
        });
      }
    }, 0);
  }, [onFilterChange]);
  
  return (
    <Paper
      elevation={0}
      sx={{ 
        mb: 2,
        p: { xs: 2, sm: 2.5 }, 
        borderRadius: 2,
        bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
        border: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`
      }}
    >
      <Grid container spacing={2} alignItems="flex-start">
        
        {/* Filtr podle fotografa */}
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <Autocomplete
            size="small"
            options={photographers}
            value={photographer}
            onChange={handlePhotographerChange}
            onInputChange={handlePhotographerInputChange}
            inputValue={photographerInputValue}
            loading={loadingPhotographers}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Fotograf" 
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {photographer && (
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
              />
            )}
            loadingText="Načítám fotografy..."
            noOptionsText="Žádní fotografové nenalezeni"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
        </Grid>
        
        {/* Filtr podle akce */}
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <Autocomplete
            size="small"
            options={events}
            value={event}
            onChange={handleEventChange}
            onInputChange={handleEventInputChange}
            inputValue={eventInputValue}
            loading={loadingEvents}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Akce"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {event && (
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
              />
            )}
            loadingText="Načítám akce..."
            noOptionsText="Žádné akce nenalezeny"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
        </Grid>
        
        {/* Filtr podle tagů */}
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <Autocomplete
            multiple
            disableCloseOnSelect
            size="small"
            options={availableTags}
            value={tags}
            onChange={handleTagChange}
            onInputChange={handleTagInputChange}
            loading={loadingTags}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Tagy"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {tags.length > 0 && (
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
              />
            )}
            loadingText="Načítám tagy..."
            noOptionsText="Žádné tagy nenalezeny"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
        </Grid>
        
        {/* Řazení - přesunuto doprava */}
        <Grid item xs={12} sm={6} md={3} lg={3} sx={{ ml: { md: 'auto' } }}>
          <FormControl 
            fullWidth 
            size="small"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          >
            <InputLabel id="sort-label">Řadit dle</InputLabel>
            <Select
              labelId="sort-label"
              value={sortBy}
              label="Řadit dle"
              onChange={handleSortChange}
            >
              <MenuItem value="newest">Nejnovější</MenuItem>
              <MenuItem value="oldest">Nejstarší</MenuItem>
              <MenuItem value="most_liked">Nejvíce lajků</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
} 