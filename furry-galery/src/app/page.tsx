'use client';
import { Container, Typography, Paper, Box } from '@mui/material';

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
    </Container>
  );
}
