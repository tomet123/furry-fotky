'use client';
import { Container, Typography, Paper, Box, Button } from '@mui/material';
import Link from 'next/link';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Vítejte na FurryFotky.cz
        </Typography>
        <Typography variant="h6" sx={{ my: 2, color: 'text.secondary' }}>
          Vaše oblíbená fotogalerie pro komunitu furry nadšenců
        </Typography>
      </Box>
      
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          backgroundColor: 'background.paper',
        }}
      >
        <Typography variant="body1">
          Tento prostor bude brzy naplněn fotogalerií a dalšími funkcemi.
        </Typography>
        <Typography variant="body1">
          Připravujeme pro vás místo, kde můžete sdílet své nejlepší fotografie a spojit se s komunitou.
        </Typography>
      </Paper>

      <Box sx={{ mt: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Button
          component={Link}
          href="/fotogalerie"
          variant="contained"
          size="large"
          startIcon={<PhotoLibraryIcon />}
          sx={{ mb: 2 }}
        >
          Prohlédnout fotogalerii
        </Button>
        
        <Button
          component={Link}
          href="/test-filters"
          variant="outlined"
          size="small"
          sx={{ mt: 1 }}
        >
          Test filtrů a actions
        </Button>
      </Box>
    </Container>
  );
}
