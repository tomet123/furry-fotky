'use client';
import { Container, Typography, Box, Divider } from '@mui/material';
import { HomeCarousel } from '@/components/foto/HomeCarousel';

export default function Home() {
  return (
    <Container maxWidth="lg">
      {/* Carousel s nejoblíbenějšími fotkami */}
      <HomeCarousel />
      
      {/* Sekce s nadcházejícími akcemi */}
      <Box sx={{ mb: 5, mt: 5 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Nadcházející akce
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {/* Obsah bude implementován později */}
      </Box>
      
      {/* Sekce s fotografy */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Naši fotografové
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {/* Obsah bude implementován později */}
      </Box>
    </Container>
  );
}
