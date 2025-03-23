'use client';

import { 
  Box, 
  Typography, 
  Container, 
  Avatar, 
  Grid, 
  Divider, 
  Chip,
  Button,
  Tab,
  Tabs,
  CircularProgress,
  Paper
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { usePhotographer } from '@/app/hooks/usePhotographers';
import { usePhotos } from '@/app/hooks/usePhotos';
import { PhotoGrid } from '@/components/foto/PhotoGrid';
import Image from 'next/image';

// Funkce pro získání barvy avataru
const getAvatarColor = (id: string): string => {
  const colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', 
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', 
    '#009688', '#4caf50', '#8bc34a', '#cddc39'
  ];
  return colors[id.charCodeAt(0) % colors.length];
};

export default function PhotographerDetail() {
  const params = useParams();
  const id = params.id as string;
  
  // State pro aktivní záložku
  const [activeTab, setActiveTab] = useState(0);
  
  // Načítání dat fotografa
  const { photographer, loading, error } = usePhotographer(id);
  
  // Načítání fotek fotografa
  const { photos, loading: photosLoading } = usePhotos({
    photographer: id,
    limit: 12
  });
  
  // Funkce pro změnu záložky
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Paper sx={{ p: 4, my: 5, textAlign: 'center', bgcolor: 'background.paper' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Došlo k chybě při načítání fotografa
          </Typography>
          <Typography variant="body1">
            {error}
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (!photographer) {
    return (
      <Container maxWidth="lg">
        <Paper sx={{ p: 4, my: 5, textAlign: 'center', bgcolor: 'background.paper' }}>
          <Typography variant="h5" gutterBottom>
            Fotograf nebyl nalezen
          </Typography>
          <Typography variant="body1">
            Fotograf s ID {id} neexistuje nebo byl odstraněn.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 5 }}>
        {/* Header section with profile info */}
        <Box 
          sx={{ 
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            mb: 5,
            backgroundColor: 'background.paper',
            boxShadow: 3
          }}
        >
          {/* Cover photo */}
          <Box 
            sx={{ 
              height: 300, 
              position: 'relative', 
              backgroundImage: 'linear-gradient(45deg, #1a237e, #42a5f5)',
              display: 'flex',
              alignItems: 'flex-end',
              p: 3
            }}
          />
          
          {/* Profile information section */}
          <Box sx={{ p: { xs: 2, md: 4 }, position: 'relative' }}>
            {/* Avatar */}
            <Avatar 
              sx={{ 
                width: 180, 
                height: 180, 
                border: '5px solid', 
                borderColor: 'background.paper',
                position: 'absolute',
                top: -100,
                left: { xs: '50%', md: 50 },
                transform: { xs: 'translateX(-50%)', md: 'none' },
                bgcolor: getAvatarColor(photographer.id),
                fontSize: '4rem'
              }}
            >
              {photographer.username.charAt(0)}
            </Avatar>
            
            {/* Name and stats */}
            <Box sx={{ 
              pt: { xs: 10, md: 1 },
              pl: { xs: 0, md: 28 },
              textAlign: { xs: 'center', md: 'left' } 
            }}>
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 700, 
                  color: 'text.primary',
                  mb: 1
                }}
              >
                {photographer.username}
              </Typography>
              
              {/* Statistiky */}
              <Box sx={{ 
                display: 'flex', 
                gap: { xs: 3, md: 4 },
                justifyContent: { xs: 'center', md: 'flex-start' }, 
                mb: 3
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CameraAltIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="body1">
                    <strong>{photographer.stats.photos}</strong> fotek
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FavoriteIcon sx={{ color: 'error.main', mr: 1 }} />
                  <Typography variant="body1">
                    <strong>{photographer.stats.likes}</strong> oblíbených
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventIcon sx={{ color: 'info.main', mr: 1 }} />
                  <Typography variant="body1">
                    <strong>{photographer.stats.events}</strong> akcí
                  </Typography>
                </Box>
              </Box>
              
              {/* Bio */}
              {photographer.bio && (
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    mb: 3,
                    maxWidth: 700
                  }}
                >
                  {photographer.bio}
                </Typography>
              )}
              
              {/* Kontaktní informace */}
              <Box sx={{ 
                mb: 2, 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 2,
                justifyContent: { xs: 'center', md: 'flex-start' } 
              }}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<InfoIcon />}
                  href={`/profil/${photographer.userId}`}
                  size="small"
                >
                  Zobrazit profil
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
        
        {/* Tabs for different sections */}
        <Box sx={{ mb: 4 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            centered
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
              },
              '& .MuiTab-root': {
                color: 'text.secondary',
                fontWeight: 500,
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 700,
                }
              },
            }}
          >
            <Tab label="Fotografie" />
            <Tab label="Uplynulé akce" />
            <Tab label="O fotografovi" />
          </Tabs>
        </Box>
        
        {/* Content based on active tab */}
        <Box>
          {/* Photos Tab */}
          {activeTab === 0 && (
            <Box>
              {photosLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : photos.length > 0 ? (
                <PhotoGrid photos={photos} />
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
                  <Typography variant="h6" gutterBottom>
                    Žádné fotografie k zobrazení
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tento fotograf zatím nepřidal žádné fotografie.
                  </Typography>
                </Paper>
              )}
            </Box>
          )}
          
          {/* Events Tab */}
          {activeTab === 1 && (
            <Box>
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
                <Typography variant="h6" gutterBottom>
                  Tato sekce je ve vývoji
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Seznam akcí, kterých se fotograf zúčastnil, bude k dispozici brzy.
                </Typography>
              </Paper>
            </Box>
          )}
          
          {/* About Tab */}
          {activeTab === 2 && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    height: '100%', 
                    bgcolor: 'background.paper',
                    borderRadius: 2 
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Informace o fotografovi
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Uživatelské jméno
                    </Typography>
                    <Typography variant="body1">
                      {photographer.username}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Začátečník
                    </Typography>
                    <Typography variant="body1">
                      {photographer.isBeginner ? 'Ano' : 'Ne'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      ID fotografa
                    </Typography>
                    <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                      {photographer.id}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    height: '100%', 
                    bgcolor: 'background.paper',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Bio
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  {photographer.bio ? (
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {photographer.bio}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Tento fotograf zatím nepřidal žádné informace o sobě.
                    </Typography>
                  )}
                  
                  {photographer.description && (
                    <>
                      <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                        Popis
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        {photographer.description}
                      </Typography>
                    </>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>
    </Container>
  );
} 