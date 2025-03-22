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