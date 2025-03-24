import { Metadata } from 'next';
import ProfileClient from './client';
import { Container, Box } from '@mui/material';

export const metadata: Metadata = {
  title: 'Můj profil | FurryFotky.cz',
  description: 'Správa vašeho profilu na FurryFotky.cz',
};

export default function ProfilePage() {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <ProfileClient />
      </Box>
    </Container>
  );
} 