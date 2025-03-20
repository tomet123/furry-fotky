'use client';

import { useState } from 'react';
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
  Chip,
  Rating
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import Link from 'next/link';
import Grid from '@mui/material/Grid';

// Simulovaná data pro fotografy
const photographers = [
  {
    id: 1,
    name: 'Jan Novák',
    avatar: '/images/photographer-1.jpg',
    description: 'Fotograf specializující se na portrétní fotografii a kostýmy.',
    specializations: ['Portrét', 'Kostýmy', 'Studio'],
    location: 'Praha',
    rating: 4.8,
    photoCount: 235,
  },
  {
    id: 2,
    name: 'Petra Dvořáková',
    avatar: '/images/photographer-2.jpg',
    description: 'Fotografka zaměřená na venkovní a přírodní scenérie s fursuity.',
    specializations: ['Outdoor', 'Skupinové', 'Příroda'],
    location: 'Brno',
    rating: 4.9,
    photoCount: 312,
  },
  {
    id: 3,
    name: 'Martin Svoboda',
    avatar: '/images/photographer-3.jpg',
    description: 'Zkušený fotograf specializující se na convention fotografie a reportáže.',
    specializations: ['Convention', 'Reportáž', 'Akce'],
    location: 'Ostrava',
    rating: 4.7,
    photoCount: 518,
  },
  {
    id: 4,
    name: 'Lucie Malá',
    avatar: '/images/photographer-1.jpg',
    description: 'Fotografka s uměleckým přístupem, specializuje se na atmosférické a dramatické fotografie.',
    specializations: ['Umělecké', 'Studio', 'Portrét'],
    location: 'Plzeň',
    rating: 4.5,
    photoCount: 178,
  },
  {
    id: 5,
    name: 'Tomáš Horák',
    avatar: '/images/photographer-2.jpg',
    description: 'Fotograf a editor, specialista na post-processing a digitální úpravy.',
    specializations: ['Post-processing', 'Studio', 'Kostýmy'],
    location: 'Liberec',
    rating: 4.6,
    photoCount: 245,
  },
  {
    id: 6,
    name: 'Klára Novotná',
    avatar: '/images/photographer-3.jpg',
    description: 'Mladá fotografka se zájmem o experimentální fotografie a netradiční kompozice.',
    specializations: ['Experimentální', 'Kostýmy', 'Outdoor'],
    location: 'Praha',
    rating: 4.4,
    photoCount: 156,
  },
];

export default function Photographers() {
  // Stav pro vyhledávání
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filtrování fotografů podle vyhledávání
  const filteredPhotographers = photographers.filter((photographer) => 
    photographer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    photographer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    photographer.specializations.some(spec => 
      spec.toLowerCase().includes(searchQuery.toLowerCase())
    ) ||
    photographer.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container>
      <Typography variant="h3" component="h1" gutterBottom>
        Fotografové
      </Typography>
      
      {/* Vyhledávání */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Hledat fotografa, specializaci nebo místo"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      {/* Seznam fotografů */}
      <Grid container spacing={4}>
        {filteredPhotographers.map((photographer) => (
          <Grid item key={photographer.id} xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardActionArea component={Link} href={`/photographers/${photographer.id}`}>
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <CardMedia
                    component="div"
                    sx={{
                      width: 150,
                      height: 150,
                      borderRadius: '50%',
                      backgroundColor: 'grey.300',
                      mb: 2,
                    }}
                    image={photographer.avatar}
                  />
                  <Typography gutterBottom variant="h5" component="h2" align="center">
                    {photographer.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={photographer.rating} precision={0.1} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({photographer.rating})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CameraAltIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {photographer.photoCount} fotografií
                    </Typography>
                  </Box>
                </Box>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {photographer.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Lokace:</strong> {photographer.location}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {photographer.specializations.map((spec) => (
                      <Chip key={spec} label={spec} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Zpráva, pokud nejsou nalezeni žádní fotografové */}
      {filteredPhotographers.length === 0 && (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6">
            Nebyli nalezeni žádní fotografové odpovídající vašemu vyhledávání.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Zkuste upravit vyhledávací dotaz.
          </Typography>
        </Box>
      )}
    </Container>
  );
} 