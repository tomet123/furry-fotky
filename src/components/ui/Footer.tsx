'use client';

import React from 'react';
import { Box, Container, Typography, Link as MuiLink, Divider } from '@mui/material';
import Grid from '@mui/material/Grid';
import Link from 'next/link';
import { memo } from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="primary" gutterBottom>
              FurryFotky.cz
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Váš portál pro furry fotografii a umění.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="primary" gutterBottom>
              Odkazy
            </Typography>
            <Box>
              <MuiLink
                component={Link}
                href="/gallery"
                color="inherit"
                sx={{ display: 'block', mb: 1, '&:hover': { color: 'primary.main' } }}
              >
                Galerie
              </MuiLink>
              <MuiLink
                component={Link}
                href="/events"
                color="inherit"
                sx={{ display: 'block', mb: 1, '&:hover': { color: 'primary.main' } }}
              >
                Akce
              </MuiLink>
              <MuiLink
                component={Link}
                href="/photographers"
                color="inherit"
                sx={{ display: 'block', mb: 1, '&:hover': { color: 'primary.main' } }}
              >
                Fotografové
              </MuiLink>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="primary" gutterBottom>
              Kontakt
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: info@furryfotky.cz
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sledujte nás na sociálních sítích
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ mt: 3, mb: 2 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          {'Copyright © '}
          <MuiLink component={Link} color="inherit" href="/">
            FurryFotky.cz
          </MuiLink>{' '}
          {currentYear}
          {'.'}
        </Typography>
      </Container>
    </Box>
  );
};

// Použití memo pro optimalizaci renderování
export default memo(Footer); 