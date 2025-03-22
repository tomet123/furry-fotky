'use client';

import { useState, useCallback } from 'react';
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
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { JWT_STORAGE_KEY } from '@/lib/constants';

interface PasswordChangeFormProps {
  userId: number;
}

interface PasswordChangeFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Validační schéma pro formulář
const validationSchema = yup.object({
  currentPassword: yup.string()
    .required('Zadejte aktuální heslo'),
  newPassword: yup.string()
    .required('Zadejte nové heslo')
    .min(8, 'Heslo musí mít alespoň 8 znaků')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Heslo musí obsahovat alespoň jedno velké písmeno, jedno malé písmeno a jednu číslici'
    ),
  confirmPassword: yup.string()
    .required('Potvrďte nové heslo')
    .oneOf([yup.ref('newPassword')], 'Hesla se neshodují'),
});

export default function PasswordChangeForm({ userId }: PasswordChangeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<PasswordChangeFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = useCallback(async (data: PasswordChangeFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Získání tokenu z localStorage
      const token = localStorage.getItem(JWT_STORAGE_KEY);
      if (!token) {
        throw new Error('Nejste přihlášeni. Přihlaste se prosím znovu.');
      }

      const response = await fetch(`/api/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Přidáme autorizační token
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message || 'Při změně hesla došlo k chybě.');
      }

      setSuccess(true);
      reset();
    } catch {
      setError(err instanceof Error ? err.message : 'Při změně hesla došlo k chybě.');
      console.error('Error changing password:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, reset]);

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(false);
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Změna hesla
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller
          name="currentPassword"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              margin="normal"
              required
              fullWidth
              label="Současné heslo"
              type="password"
              autoComplete="current-password"
              error={!!errors.currentPassword}
              helperText={errors.currentPassword?.message}
              disabled={isSubmitting}
            />
          )}
        />

        <Controller
          name="newPassword"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              margin="normal"
              required
              fullWidth
              label="Nové heslo"
              type="password"
              autoComplete="new-password"
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
              disabled={isSubmitting}
            />
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              margin="normal"
              required
              fullWidth
              label="Potvrďte nové heslo"
              type="password"
              autoComplete="new-password"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              disabled={isSubmitting}
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 3 }}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isSubmitting ? 'Probíhá změna...' : 'Změnit heslo'}
        </Button>
      </Box>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={success} autoHideDuration={6000} onClose={handleCloseSuccess}>
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          Heslo bylo úspěšně změněno.
        </Alert>
      </Snackbar>
    </Paper>
  );
} 