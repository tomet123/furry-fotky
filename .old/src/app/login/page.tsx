import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';
import { Container, Typography, Box } from '@mui/material';

export const metadata: Metadata = {
  title: 'Přihlášení | FurryFotky.cz',
  description: 'Přihlaste se k vašemu účtu na FurryFotky.cz',
};

export default function LoginPage() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          Přihlášení k účtu
        </Typography>
        <LoginForm />
      </Box>
    </Container>
  );
} 