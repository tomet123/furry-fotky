import { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';
import { Container, Box } from '@mui/material';

export const metadata: Metadata = {
  title: 'Registrace | FurryFotky.cz',
  description: 'Vytvořte si nový účet na FurryFotky.cz',
};

export default function RegisterPage() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 8 }}>
        <RegisterForm />
      </Box>
    </Container>
  );
} 