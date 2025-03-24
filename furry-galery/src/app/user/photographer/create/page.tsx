import { Metadata } from 'next';
import { Container, Box, Typography } from '@mui/material';
import PhotographerForm from './client';

export const metadata: Metadata = {
  title: 'Profil fotografa | FurryFotky.cz',
  description: 'Vytvořte nebo upravte svůj profil fotografa na FurryFotky.cz',
};

export default async function PhotographerProfilePage({ searchParams }: { searchParams: { edit?: string } }) {
  const isEditMode = searchParams.edit === 'true';

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditMode ? 'Upravit profil fotografa' : 'Vytvořit profil fotografa'}
        </Typography>
        <Typography variant="body1" paragraph>
          {isEditMode 
            ? 'Upravte informace o vašem fotografickém profilu. Vyplněné informace se budou zobrazovat ostatním uživatelům.' 
            : 'Vyplňte následující formulář pro vytvoření profilu fotografa. Vyplněné informace se budou zobrazovat ostatním uživatelům.'}
        </Typography>
        <PhotographerForm />
      </Box>
    </Container>
  );
}