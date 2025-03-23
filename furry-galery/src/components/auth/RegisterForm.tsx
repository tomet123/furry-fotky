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

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    // Ověření, že všechna pole jsou vyplněna
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Vyplňte prosím všechna povinná pole');
      return false;
    }

    // Ověření délky uživatelského jména
    if (formData.username.length < 3) {
      setError('Uživatelské jméno musí mít alespoň 3 znaky');
      return false;
    }

    // Ověření formátu emailu
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(formData.email)) {
      setError('Zadejte platnou e-mailovou adresu');
      return false;
    }

    // Ověření minimální délky hesla
    if (formData.password.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků');
      return false;
    }

    // Ověření, že hesla se shodují
    if (formData.password !== formData.confirmPassword) {
      setError('Hesla se neshodují');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validace formuláře
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Odeslání registračních údajů na API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Při registraci došlo k chybě');
      } else {
        // Registrace byla úspěšná
        setSuccess(true);
        
        // Automatické přihlášení po úspěšné registraci
        setTimeout(async () => {
          await signIn('credentials', {
            username: formData.username,
            password: formData.password,
            redirect: false,
          });
          router.push('/');
          router.refresh();
        }, 1500);
      }
    } catch (error) {
      setError('Při registraci došlo k chybě');
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
        Registrace
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Registrace proběhla úspěšně. Budete přesměrováni na hlavní stránku.
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
          value={formData.username}
          onChange={handleChange}
          disabled={isLoading || success}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="E-mail"
          name="email"
          autoComplete="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading || success}
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
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading || success}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Potvrzení hesla"
          type="password"
          id="confirmPassword"
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={isLoading || success}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoading || success}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Registrovat se'}
        </Button>
        <Box display="flex" justifyContent="center">
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