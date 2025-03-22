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

interface OrganizerFormData {
  name: string;
  description: string;
  contact_email: string;
  website: string;
}

export default function OrganizerForm() {
  const { user, refreshUser } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Formulářová data
  const [formData, setFormData] = useState<OrganizerFormData>({
    name: '',
    description: '',
    contact_email: '',
    website: '',
  });

  // Získání existujících dat organizátora, pokud jsou k dispozici
  const fetchOrganizerData = useCallback(async () => {
    if (user?.organizer_id) {
      try {
        const response = await fetch(`/api/organizers/${user.organizer_id}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setFormData({
              name: data.data.name || '',
              description: data.data.description || '',
              contact_email: data.data.contact_email || '',
              website: data.data.website || '',
            });
          }
        }
      } catch {
        console.error('Error fetching organizer data:', err);
      }
    }
  }, [user?.organizer_id]);

  // Načtení dat při prvním renderování
  useEffect(() => {
    fetchOrganizerData();
  }, [fetchOrganizerData]);

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
      setError('Prosím vyplňte název organizátora.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Určení správné URL a metody pro API požadavek
      const apiUrl = user?.organizer_id 
        ? `/api/organizers/${user.organizer_id}` 
        : `/api/organizers`;
      const method = user?.organizer_id ? 'PUT' : 'POST';
      
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
        throw new Error(errorData.message || 'Při ukládání profilu organizátora došlo k chybě.');
      }
      
      const responseData = await response.json();
      
      if (responseData.success) {
        // Aktualizace informací o uživateli
        await refreshUser();
        setSuccess(true);
      } else {
        throw new Error('Při ukládání profilu organizátora došlo k chybě.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Při ukládání profilu organizátora došlo k chybě.');
      console.error('Error saving organizer profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, user?.organizer_id, refreshUser]);

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(false);
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {user?.organizer_id ? 'Upravit profil organizátora' : 'Vytvořit profil organizátora'}
      </Typography>
      
      {!user?.organizer_id && (
        <Typography variant="body2" color="text.secondary" paragraph>
          Jako začínající organizátor budete moci vytvářet a spravovat události pro komunitu.
        </Typography>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="name"
          label="Název organizátora/organizace"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        
        <TextField
          margin="normal"
          fullWidth
          id="description"
          label="Popis"
          name="description"
          multiline
          rows={4}
          value={formData.description}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="Napište něco o sobě nebo vaší organizaci, jaké typy akcí pořádáte..."
        />
        
        <TextField
          margin="normal"
          fullWidth
          id="contact_email"
          label="Kontaktní e-mail"
          name="contact_email"
          type="email"
          value={formData.contact_email}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="kontakt@vasedomena.cz"
        />
        
        <TextField
          margin="normal"
          fullWidth
          id="website"
          label="Webové stránky"
          name="website"
          value={formData.website}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="https://www.vasedomena.cz"
        />
        
        <FormControlLabel
          control={
            <Switch 
              checked={true} 
              disabled={true}
            />
          }
          label="Začínající organizátor"
          sx={{ mt: 2, opacity: 0.8 }}
        />
        
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 2 }}>
          Všichni noví organizátoři začínají jako začátečníci. Status lze později změnit.
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
            : user?.organizer_id 
              ? 'Uložit změny' 
              : 'Vytvořit profil organizátora'
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
          {user?.organizer_id 
            ? 'Profil organizátora byl úspěšně aktualizován.' 
            : 'Profil organizátora byl úspěšně vytvořen.'
          }
        </Alert>
      </Snackbar>
    </Paper>
  );
} 