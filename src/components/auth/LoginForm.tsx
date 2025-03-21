'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/context/AuthContext';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';

// Debugovací funkce
const debug = (message: string, data?: unknown) => {
  console.log(`[LOGIN FORM DEBUG] ${message}`, data !== undefined ? data : '');
};

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, isLoading, isAuthenticated, error, clearError } = useAuthContext();

  debug('Render LoginForm', { isLoading, isAuthenticated, error });

  useEffect(() => {
    // Vyčistíme chyby při prvním renderování
    clearError();
  }, [clearError]);

  useEffect(() => {
    // Pokud je uživatel přihlášen, přesměrujeme na domovskou stránku
    if (isAuthenticated) {
      debug('Uživatel je přihlášen, přesměrovávám na domovskou stránku');
      // Získáme případnou URL pro přesměrování z localStorage nebo použijeme '/'
      const redirectPath = localStorage.getItem('redirectAfterLogin') || '/';
      debug('Přesměrování na:', redirectPath);
      
      // Vyčistíme informaci o přesměrování
      localStorage.removeItem('redirectAfterLogin');
      
      router.push(redirectPath);
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    debug('Odesílám přihlašovací formulář', { username });
    
    // Validace formuláře
    if (!username || !password) {
      debug('Chyba validace - prázdná pole');
      setFormError('Vyplňte prosím uživatelské jméno a heslo');
      return;
    }

    // Vyčistíme chyby
    setFormError('');
    clearError();
    
    try {
      debug('Volám login funkci');
      await login({ username, password });
      debug('Login funkce dokončena');
    } catch {
      debug('Chyba při přihlašování:', err);
      setFormError(err instanceof Error ? err.message : 'Při přihlašování došlo k chybě');
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 500,
        mx: 'auto',
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" component="h1" gutterBottom textAlign="center">
        Přihlášení
      </Typography>

      {(error || formError) && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error || formError}
        </Alert>
      )}

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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          error={!username && formError !== ''}
          helperText={!username && formError !== '' ? 'Vyplňte uživatelské jméno' : ''}
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          error={!password && formError !== ''}
          helperText={!password && formError !== '' ? 'Vyplňte heslo' : ''}
          disabled={isLoading}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} />
          ) : (
            'Přihlásit se'
          )}
        </Button>
        
        <Box sx={{ textAlign: 'center', mt: 2 }}>
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