'use client';

import React, { useState } from 'react';
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
  console.log(`[REGISTER FORM DEBUG] ${message}`, data !== undefined ? data : '');
};

export default function RegisterForm() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthContext();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    general: '',
  });

  debug('Render RegisterForm', { isLoading, error });

  const validateForm = () => {
    let isValid = true;
    const errors = {
      username: '',
      email: '',
      password: '',
      passwordConfirm: '',
      general: '',
    };

    // Validace uživatelského jména
    if (!username.trim()) {
      errors.username = 'Uživatelské jméno je povinné';
      isValid = false;
    } else if (username.length < 3) {
      errors.username = 'Uživatelské jméno musí mít alespoň 3 znaky';
      isValid = false;
    }

    // Validace emailu
    if (!email.trim()) {
      errors.email = 'Email je povinný';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email není ve správném formátu';
      isValid = false;
    }

    // Validace hesla
    if (!password) {
      errors.password = 'Heslo je povinné';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Heslo musí mít alespoň 6 znaků';
      isValid = false;
    }

    // Kontrola shodnosti hesla
    if (password !== passwordConfirm) {
      errors.passwordConfirm = 'Hesla se neshodují';
      isValid = false;
    }

    debug('Validace formuláře', { isValid, errors });
    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    debug('Odesílám registrační formulář', { username, email });
    
    // Vyčištění chyb
    clearError();
    
    // Validace formuláře
    if (!validateForm()) {
      debug('Validace formuláře selhala');
      return;
    }

    try {
      debug('Volám register funkci');
      const success = await register({ username, email, password });
      debug('Registrace dokončena s výsledkem:', success);
      
      if (success) {
        // Přesměrování na stránku s informací o úspěšné registraci
        debug('Přesměrovávám na stránku s úspěchem registrace');
        router.push('/register-success');
      }
    } catch {
      debug('Chyba při registraci:', err);
      
      // Specifické zpracování chybových zpráv
      const errorMessage = err instanceof Error ? err.message : 'Při registraci došlo k chybě';
      
      // Nastavení specifických chyb pro jednotlivá pole
      if (errorMessage.includes('uživatelské jméno je již obsazeno')) {
        setFormErrors({
          ...formErrors,
          username: 'Toto uživatelské jméno je již obsazeno. Zvolte prosím jiné.',
          general: '',
        });
      } else if (errorMessage.includes('email je již registrován')) {
        setFormErrors({
          ...formErrors,
          email: 'Tento email je již registrován. Zvolte prosím jiný.',
          general: '',
        });
      } else {
        // Obecná chyba
        setFormErrors({
          ...formErrors,
          general: errorMessage,
        });
      }
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
        Registrace
      </Typography>

      {(error || formErrors.general) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || formErrors.general}
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
          error={!!formErrors.username}
          helperText={formErrors.username}
          disabled={isLoading}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          error={!!formErrors.email}
          helperText={formErrors.email}
          disabled={isLoading}
          type="email"
        />

        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Heslo"
          type="password"
          id="password"
          autoComplete="new-password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          error={!!formErrors.password}
          helperText={formErrors.password}
          disabled={isLoading}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          name="password-confirm"
          label="Potvrzení hesla"
          type="password"
          id="password-confirm"
          autoComplete="new-password"
          value={passwordConfirm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordConfirm(e.target.value)}
          error={!!formErrors.passwordConfirm}
          helperText={formErrors.passwordConfirm}
          disabled={isLoading}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Zaregistrovat se'}
        </Button>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2">
            Již máte účet?{' '}
            <MuiLink component={Link} href="/login">
              Přihlaste se
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
} 