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
      <Box sx={{ mt: 4, mb: 8 }}>
        <LoginForm />
      </Box>
    </Container>
  );
} 