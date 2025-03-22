'use client';

import { Box, Container, Typography, Button, Paper } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper 
        elevation={2}
        sx={{ 
          p: { xs: 3, md: 6 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          borderRadius: 2
        }}
      >
        <Typography variant="h1" component="h1" sx={{ mb: 2, fontSize: { xs: '6rem', md: '8rem' } }}>
          404
        </Typography>
        
        <Box 
          sx={{ 
            position: 'relative',
            width: '100%',
            maxWidth: 400,
            height: 300,
            mb: 4
          }}
        >
          <Image
            src="/api/image?width=800&height=600&seed=404"
            alt="Ztracená fotka"
            fill
            loading="lazy"
            style={{ objectFit: 'cover', borderRadius: 8 }}
          />
        </Box>
        
        <Typography variant="h4" component="h2" gutterBottom>
          Jejda, tady nic není!
        </Typography>
        
        <Typography variant="body1" paragraph color="text.secondary" sx={{ maxWidth: 500 }}>
          Stránka, kterou hledáte, byla buď přesunuta, odstraněna nebo nikdy neexistovala.
          Možná jste zadali nesprávnou adresu nebo odkaz, který jste následovali, je zastaralý.
        </Typography>
        
        <Button 
          variant="contained" 
          component={Link} 
          href="/" 
          size="large"
          sx={{ mt: 2 }}
        >
          Zpět na úvodní stránku
        </Button>
      </Paper>
    </Container>
  );
} 