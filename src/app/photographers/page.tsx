'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActionArea, 
  Container,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EventIcon from '@mui/icons-material/Event';
import Link from 'next/link';
import Grid from '@mui/material/Grid';
import { usePhotographerStats } from '@/hooks/usePhotographerStats';

export default function Photographers() {
  const isMounted = useRef(true);
  // Stav pro vyhledávání
  const [searchQuery, setSearchQuery] = useState('');
  
  // Získání statistik fotografů z databáze
  const { stats, loading, error } = usePhotographerStats();
  
  // Nastavení a vyčištění reference isMounted
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Bezpečná aktualizace stavu
  const safeSetSearchQuery = (query: string) => {
    if (isMounted.current) {
      setSearchQuery(query);
    }
  };
  
  // Filtrování fotografů podle vyhledávání
  const filteredPhotographers = stats.filter((photographer) => 
    (photographer.photographer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (photographer.photographer_bio || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      pt: 4,
      pb: 6
    }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
            color: 'text.primary',
            fontWeight: 600,
            mb: 4,
            textAlign: 'center'
          }}
        >
          Fotografové
        </Typography>
        
        {/* Vyhledávání */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            label="Hledat fotografa"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => safeSetSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'primary.main' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
              '& label.Mui-focused': {
                color: 'primary.main',
              },
              maxWidth: 600,
              mx: 'auto',
              display: 'block'
            }}
          />
        </Box>
        
        {/* Načítání a chybové stavy */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
        )}
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4,
              maxWidth: 800,
              mx: 'auto'
            }}
          >
            {error}
          </Alert>
        )}
        
        {/* Seznam fotografů */}
        {!loading && !error && (
          <Grid container spacing={4}>
            {filteredPhotographers.map((photographer) => (
              <Grid item key={photographer.photographer_id} xs={12} sm={6} md={4}>
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
                      boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                    },
                    border: '1px solid',
                    borderColor: 'rgba(255,255,255,0.1)'
                  }}
                >
                  <CardActionArea 
                    component={Link} 
                    href={`/photographers/${photographer.photographer_id}`}
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
                      borderColor: 'rgba(255,255,255,0.05)'
                    }}>
                      <Box sx={{ 
                        position: 'relative',
                        width: 130,
                        height: 130,
                        mb: 2,
                        borderRadius: '50%',
                        border: '4px solid',
                        borderColor: 'primary.main',
                        overflow: 'hidden'
                      }}>
                        <CardMedia
                          component="div"
                          sx={{
                            width: '100%',
                            height: '100%',
                            bgcolor: 'rgba(255,255,255,0.1)',
                          }}
                          image={photographer.photographer_avatar || '/vercel.svg'}
                        />
                      </Box>
                      <Typography 
                        gutterBottom 
                        variant="h5" 
                        component="h2" 
                        align="center"
                        sx={{ 
                          color: 'text.primary',
                          fontWeight: 600
                        }}
                      >
                        {photographer.photographer_name}
                      </Typography>
                      
                      {/* Statistiky */}
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 3, 
                        mt: 1,
                        mb: 1, 
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
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            bgcolor: 'rgba(255,167,38,0.15)',
                            mb: 0.5
                          }}>
                            <CameraAltIcon fontSize="small" sx={{ color: 'primary.main' }} />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {photographer.photo_count || 0}
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
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            bgcolor: 'rgba(244,67,54,0.15)',
                            mb: 0.5
                          }}>
                            <FavoriteIcon fontSize="small" sx={{ color: 'error.main' }} />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {photographer.total_likes || 0}
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
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            bgcolor: 'rgba(102,187,106,0.15)',
                            mb: 0.5
                          }}>
                            <EventIcon fontSize="small" sx={{ color: 'success.main' }} />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {photographer.event_count || 0}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <CardContent sx={{ p: 3, flexGrow: 1 }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        paragraph
                        sx={{
                          fontSize: '0.9rem',
                          lineHeight: 1.6,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {photographer.photographer_bio || 'Žádný životopis není k dispozici.'}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* Zpráva, pokud nejsou nalezeni žádní fotografové */}
        {!loading && !error && filteredPhotographers.length === 0 && (
          <Paper 
            elevation={0} 
            sx={{ 
              textAlign: 'center', 
              my: 8, 
              py: 6,
              px: 4,
              maxWidth: 600,
              mx: 'auto',
              bgcolor: 'rgba(255,255,255,0.05)',
              borderRadius: 2
            }}
          >
            <Typography 
              variant="h6"
              sx={{ color: 'text.primary', mb: 2 }}
            >
              Nebyli nalezeni žádní fotografové odpovídající vašemu vyhledávání.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Zkuste upravit vyhledávací dotaz.
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
} 