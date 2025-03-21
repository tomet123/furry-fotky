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
  Paper,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useAuthContext } from '@/components/context/AuthContext';

interface PhotographerFormData {
  name: string;
  bio: string;
}

export default function PhotographerForm() {
  const { user, refreshUser } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Formulářová data
  const [formData, setFormData] = useState<PhotographerFormData>({
    name: '',
    bio: '',
  });

  // Získání existujících dat fotografa, pokud jsou k dispozici
  const fetchPhotographerData = useCallback(async () => {
    if (user?.photographer_id) {
      try {
        const response = await fetch(`/api/photographers/${user.photographer_id}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setFormData({
              name: data.data.name || '',
              bio: data.data.bio || '',
            });
          }
        }
      } catch {
        console.error('Error fetching photographer data:', err);
      }
    }
  }, [user?.photographer_id]);

  // Načtení dat při prvním renderování
  useEffect(() => {
    fetchPhotographerData();
  }, [fetchPhotographerData]);

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
    
    if (!formData.name.trim()) {
      setError('Prosím vyplňte jméno fotografa.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Určení správné URL a metody pro API požadavek
      const apiUrl = user?.photographer_id 
        ? `/api/photographers/${user.photographer_id}` 
        : `/api/photographers`;
      const method = user?.photographer_id ? 'PUT' : 'POST';
      
      // Odeslání požadavku
      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Při ukládání profilu fotografa došlo k chybě.');
      }
      
      const responseData = await response.json();
      
      if (responseData.success) {
        // Aktualizace informací o uživateli
        await refreshUser();
        setSuccess(true);
      } else {
        throw new Error('Při ukládání profilu fotografa došlo k chybě.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Při ukládání profilu fotografa došlo k chybě.');
      console.error('Error saving photographer profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, user?.photographer_id, refreshUser]);

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(false);
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {user?.photographer_id ? 'Upravit profil fotografa' : 'Vytvořit profil fotografa'}
      </Typography>
      
      {!user?.photographer_id && (
        <Typography variant="body2" color="text.secondary" paragraph>
          Jako začínající fotograf budete moci sdílet své fotografie a získávat zpětnou vazbu od komunity.
        </Typography>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="name"
          label="Jméno fotografa"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        
        <TextField
          margin="normal"
          fullWidth
          id="bio"
          label="O mně"
          name="bio"
          multiline
          rows={4}
          value={formData.bio}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="Napište něco o sobě jako fotografovi, o vašem stylu, zkušenostech a zaměření..."
        />
        
        <FormControlLabel
          control={
            <Switch 
              checked={true} 
              disabled={true}
            />
          }
          label="Začínající fotograf"
          sx={{ mt: 2, opacity: 0.8 }}
        />
        
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 2 }}>
          Všichni noví fotografové začínají jako začátečníci. Status lze později změnit.
        </Typography>
        
        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isSubmitting 
            ? 'Ukládání...' 
            : user?.photographer_id 
              ? 'Uložit změny' 
              : 'Vytvořit profil fotografa'
          }
        </Button>
      </Box>
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar open={success} autoHideDuration={6000} onClose={handleCloseSuccess}>
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          {user?.photographer_id 
            ? 'Profil fotografa byl úspěšně aktualizován.' 
            : 'Profil fotografa byl úspěšně vytvořen.'
          }
        </Alert>
      </Snackbar>
    </Paper>
  );
} 