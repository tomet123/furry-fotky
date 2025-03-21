'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Paper
} from '@mui/material';
import { useAuthContext } from '@/components/context/AuthContext';
import { JWT_STORAGE_KEY } from '@/lib/constants';

interface ProfileSettingsData {
  username: string;
  email: string;
}

export default function ProfileSettingsForm() {
  const { user, refreshUser } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Formulářová data - inicializace s prázdnými hodnotami
  const [formData, setFormData] = useState<ProfileSettingsData>({
    username: '',
    email: '',
  });
  
  // Nastavení formulářových dat po načtení uživatele
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
      });
    }
  }, [user]);

  // Změna formulářových dat
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Odeslání formuláře
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Validace formuláře - zkontrolujeme, že jsou vyplněna povinná pole
      if (!formData.username.trim()) {
        throw new Error('Uživatelské jméno je povinné');
      }
      
      if (!formData.email.trim()) {
        throw new Error('Email je povinný');
      }
      
      // Validace emailu pomocí jednoduchého regulárního výrazu
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Zadejte platný email');
      }
      
      // Získáme token z localStorage pro autorizaci
      const token = localStorage.getItem(JWT_STORAGE_KEY);
      if (!token) {
        throw new Error('Nejste přihlášeni. Přihlaste se prosím znovu.');
      }
      
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Přidáme autorizační token
        },
        body: JSON.stringify(formData),
      });
      
      // Zpracování specifických chybových kódů pro duplicity
      if (response.status === 400) {
        const responseData = await response.json();
        // Zpracování konkrétních chybových zpráv podle textu
        if (responseData.message.includes('uživatelské jméno je již používáno')) {
          throw new Error('Toto uživatelské jméno je již obsazeno. Zvolte prosím jiné.');
        } else if (responseData.message.includes('e-mail je již používán')) {
          throw new Error('Tento email je již registrován. Zvolte prosím jiný.');
        } else {
          throw new Error(responseData.message || 'Při ukládání nastavení profilu došlo k chybě.');
        }
      } else if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message || 'Při ukládání nastavení profilu došlo k chybě.');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Aktualizujeme informace o uživateli po úspěšné aktualizaci profilu
        await refreshUser();
        setSuccess(true);
      } else {
        throw new Error('Při ukládání nastavení profilu došlo k chybě.');
      }
    } catch {
      setError(err instanceof Error ? err.message : 'Při ukládání nastavení profilu došlo k chybě.');
      console.error('Error saving profile settings:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, user, refreshUser]);

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(false);
  };

  if (!user) {
    return (
      <Typography variant="body1">
        Pro úpravu nastavení profilu se musíte přihlásit.
      </Typography>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Základní nastavení profilu
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="Uživatelské jméno"
          name="username"
          value={formData.username}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="E-mail"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        
        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 3 }}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isSubmitting ? 'Ukládání...' : 'Uložit změny'}
        </Button>
      </Box>
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar open={success} autoHideDuration={6000} onClose={handleCloseSuccess}>
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          Nastavení profilu bylo úspěšně aktualizováno.
        </Alert>
      </Snackbar>
    </Paper>
  );
} 