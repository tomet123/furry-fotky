import React from 'react';
import { 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  SelectChangeEvent,
  Autocomplete,
  useTheme,
  CircularProgress
} from '@mui/material';
import Grid from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

interface FilterPanelProps {
  events: string[];
  photographers: string[];
  tags: string[];
  eventFilter: string | null;
  photographerFilter: string | null;
  tagFilter: string[];
  sortBy: string;
  loading?: boolean;
  onEventChange: (event: React.SyntheticEvent, newValue: string | null) => void;
  onPhotographerChange: (event: React.SyntheticEvent, newValue: string | null) => void;
  onTagChange: (event: React.SyntheticEvent, newValue: string[]) => void;
  onSortChange: (event: SelectChangeEvent) => void;
}

/**
 * Komponenta pro filtrování a řazení fotografií
 */
export const FilterPanel: React.FC<FilterPanelProps> = ({
  events,
  photographers,
  tags,
  eventFilter,
  photographerFilter,
  tagFilter,
  sortBy,
  loading = false,
  onEventChange,
  onPhotographerChange,
  onTagChange,
  onSortChange
}) => {
  const theme = useTheme();

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
            value={photographerFilter}
            onChange={onPhotographerChange}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Fotograf" 
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            loading={loading}
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
            value={eventFilter}
            onChange={onEventChange}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Akce"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            loading={loading}
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
            options={tags}
            value={tagFilter}
            onChange={onTagChange}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Tagy"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            loading={loading}
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
              onChange={onSortChange}
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
}; 