'use client';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          textAlign: 'center',
          py: 8,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 5,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: 600,
            width: '100%',
          }}
        >
          <Typography variant="h1" color="primary" sx={{ fontSize: { xs: '5rem', md: '8rem' }, fontWeight: 'bold' }}>
            404
          </Typography>
          
          <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
            Stránka nenalezena
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
            Omlouváme se, ale stránka, kterou hledáte, neexistuje nebo byla přesunuta.
          </Typography>
          
          <Button 
            variant="contained" 
            color="secondary" 
            component={Link} 
            href="/"
            size="large"
          >
            Zpět na hlavní stránku
          </Button>
        </Paper>
      </Box>
    </Container>
  );
} 