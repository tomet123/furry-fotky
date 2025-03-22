import { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';
import { Container, Typography, Box } from '@mui/material';

export const metadata: Metadata = {
  title: 'Registrace | FurryFotky.cz',
  description: 'Vytvořte si nový účet na FurryFotky.cz',
};

export default function RegisterPage() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          Vytvořit nový účet
        </Typography>
        <RegisterForm />
      </Box>
    </Container>
  );
} 