'use client';

import { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Card, 
  Avatar, 
  Grid, 
  CircularProgress,
  Button,
  Badge,
  alpha
} from '@mui/material';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { getTopPhotographers } from '@/app/actions/home';
import type { Photographer } from '@/app/actions/home';

// Karta fotografa
export const PhotographerCard = ({ photographer }: { photographer: Photographer }) => {
  // Generování konzistentní barvy na základě ID fotografa
  const generateColor = (id: string) => {
    const hue = (id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360);
    return `hsl(${hue}, 70%, 45%)`;
  };
  
  const color = generateColor(photographer.id);
  
  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      borderRadius: 2,
      overflow: 'hidden',
      position: 'relative',
      transition: 'transform 0.3s, box-shadow 0.3s',
      p: 2,
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
      }
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        py: 2
      }}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <Box
              sx={{
                bgcolor: color,
                width: 24,
                height: 24,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                border: '2px solid white',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}
            >
              {photographer.rank}
            </Box>
          }
        >
          <Avatar 
            sx={{ 
              width: 96, 
              height: 96, 
              bgcolor: alpha(color, 0.2), 
              color: color,
              mb: 2,
              fontSize: '2rem',
              fontWeight: 'bold'
            }}
            src={photographer.avatarUrl || undefined}
          >
            {photographer.name && photographer.name.charAt(0).toUpperCase()}
          </Avatar>
        </Badge>
        
        <Typography 
          component="h3" 
          variant="h6" 
          align="center" 
          fontWeight={600} 
          gutterBottom
          sx={{
            mt: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            maxWidth: '100%'
          }}
        >
          {photographer.name}
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          justifyContent: 'center',
          flexWrap: 'wrap',
          mt: 1
        }}>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <PhotoCameraIcon fontSize="small" color="primary" />
            {photographer.photoCount || 0} fotek
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <FavoriteIcon fontSize="small" color="error" />
            {photographer.likesCount || 0} líbí se
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ mt: 'auto', textAlign: 'center' }}>
        <Button 
          component={Link} 
          href={`/fotograf/${photographer.id}`}
          variant="outlined" 
          size="small" 
          endIcon={<ArrowForwardIcon />}
          sx={{ 
            borderRadius: 2,
            mt: 1
          }}
        >
          Zobrazit profil
        </Button>
      </Box>
    </Card>
  );
};

// Sekce s nejlepšími fotografy
export default function TopPhotographersSection() {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchPhotographers() {
      try {
        setLoading(true);
        const topPhotographers = await getTopPhotographers();
        
        // Přidání pořadí (rank) pro každého fotografa
        const rankedPhotographers = topPhotographers.map((photographer, idx) => ({
          ...photographer,
          rank: idx + 1
        }));
        
        setPhotographers(rankedPhotographers);
        setError(null);
      } catch (err) {
        setError('Nepodařilo se načíst nejlepší fotografy.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchPhotographers();
  }, []);
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h5" component="h2" fontWeight={600}>
          Nejlepší fotografové
        </Typography>
        <Button 
          component={Link}
          href="/fotografove"
          color="primary"
          endIcon={<ArrowForwardIcon />}
        >
          Všichni fotografové
        </Button>
      </Box>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Typography color="error" sx={{ py: 2 }}>
          {error}
        </Typography>
      )}
      
      {!loading && !error && photographers.length === 0 && (
        <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
          Žádní fotografové nebyli nalezeni.
        </Typography>
      )}
      
      {!loading && !error && photographers.length > 0 && (
        <Grid container spacing={2}>
          {photographers.map((photographer, index) => (
            <Grid item key={photographer.id} xs={6} sm={4} md={3} lg={2.4}>
              <PhotographerCard photographer={photographer} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
} 