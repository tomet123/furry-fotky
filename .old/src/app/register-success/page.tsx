import { Metadata } from 'next';
import { Container, Typography, Paper, Box, Button, Divider } from '@mui/material';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Registrace úspěšná | FurryFotky.cz',
  description: 'Vaše registrace na FurryFotky.cz proběhla úspěšně',
};

export default function RegisterSuccessPage() {
  return (
    <Container maxWidth="sm">
      <Paper 
        elevation={3}
        sx={{
          p: 4,
          mt: 4,
          mb: 6,
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          color="primary" 
          gutterBottom
        >
          Registrace úspěšná!
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            m: 4,
          }}
        >
          <Box
            component="svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            sx={{
              width: 80,
              height: 80,
              color: 'success.main',
            }}
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </Box>
        </Box>

        <Typography variant="body1" paragraph>
          Děkujeme za vaši registraci. Váš účet byl úspěšně vytvořen.
        </Typography>

        <Typography variant="body1" paragraph>
          Nyní se můžete přihlásit pomocí vašeho uživatelského jména a hesla a začít využívat všechny funkce FurryFotky.cz.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            href="/login"
            size="large"
            sx={{ minWidth: 200 }}
          >
            Přihlásit se
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 