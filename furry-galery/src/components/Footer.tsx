'use client';
import { Box, Container, Typography } from '@mui/material';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        bgcolor: 'background.paper',
        borderTop: '1px solid rgba(255, 255, 255, 0.12)'
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          © {currentYear} FurryFotky.cz | Všechna práva vyhrazena
        </Typography>
      </Container>
    </Box>
  );
} 