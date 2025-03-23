'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Základní validace
    if (!username || !password) {
      setError('Vyplňte prosím uživatelské jméno a heslo');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Nesprávné přihlašovací údaje');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      setError('Při přihlašování došlo k chybě');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 500,
        width: '100%',
        mx: 'auto',
      }}
    >
      <Typography variant="h5" component="h1" gutterBottom textAlign="center">
        Přihlášení
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="Uživatelské jméno"
          name="username"
          autoComplete="username"
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Heslo"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Přihlásit se'}
        </Button>
        <Box display="flex" justifyContent="center">
          <Typography variant="body2">
            Nemáte účet?{' '}
            <MuiLink component={Link} href="/register">
              Zaregistrujte se
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
} 