import { Metadata } from 'next';
import { Container, Box, Typography } from '@mui/material';
import RequestPhotographerForm from './client';

export const metadata: Metadata = {
  title: 'Požádat o existující profil fotografa | FurryFotky.cz',
  description: 'Požádejte o převzetí existujícího profilu fotografa na FurryFotky.cz',
};

export default function RequestPhotographerPage() {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Požádat o existující profil fotografa
        </Typography>
        <Typography variant="body1" paragraph>
          Zde můžete vyhledat a požádat o převzetí existujícího profilu fotografa, který zatím nemá přiřazeného uživatele.
          Vyhledejte profil podle bio nebo popisu.
        </Typography>
        <RequestPhotographerForm />
      </Box>
    </Container>
  );
} 