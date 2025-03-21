'use client';

import { useState, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  CircularProgress, 
  Snackbar, 
  Alert,
  Paper
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { JWT_STORAGE_KEY } from '@/lib/constants';
import UserAvatar from '../ui/UserAvatar';
import { useAuthContext } from '@/components/context/AuthContext';

// Zjednodušená funkce, která vrací pouze relativní URL
// a vyhýbá se použití window objektu pro zamezení hydratačních chyb
const getApiUrl = () => '/api/upload/avatar';

interface AvatarUploadProps {
  currentAvatarId?: number | null;
  username: string;
  onAvatarUpdate?: (newAvatarId: number) => void;
}

export default function AvatarUpload({ currentAvatarId, username, onAvatarUpdate }: AvatarUploadProps) {
  const { refreshUser } = useAuthContext();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [avatarId, setAvatarId] = useState<number | null>(currentAvatarId || null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validace souboru
    if (!file.type.startsWith('image/')) {
      setError('Vybraný soubor není obrázek');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Obrázek je příliš velký. Maximální velikost je 5MB.');
      return;
    }

    // Vytvoření náhledu
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Nahrání souboru na server
    try {
      setIsUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('avatar', file);

      // Získání tokenu z localStorage pro autorizaci
      const token = localStorage.getItem(JWT_STORAGE_KEY);
      if (!token) {
        throw new Error('Nejste přihlášeni. Přihlaste se prosím znovu.');
      }

      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Při nahrávání obrázku došlo k chybě.');
      }

      const data = await response.json();
      
      if (data.success && data.avatarId) {
        // Aktualizujeme lokální stav
        setAvatarId(data.avatarId);
        
        // Informujeme rodiče o změně
        if (onAvatarUpdate) {
          onAvatarUpdate(data.avatarId);
        }
        
        // Aktualizujeme informace o uživateli v kontextu
        await refreshUser();
        
        setSuccess(true);
      } else {
        throw new Error('Neočekávaný formát odpovědi ze serveru.');
      }
    } catch {
      setError(err instanceof Error ? err.message : 'Při nahrávání obrázku došlo k chybě.');
      console.error('Error uploading avatar:', err);
    } finally {
      setIsUploading(false);
    }
  }, [onAvatarUpdate, refreshUser]);

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(false);
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Profilový obrázek
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
        {/* Použijeme komponentu UserAvatar místo MUI Avatar */}
        {previewUrl ? (
          <UserAvatar
            avatarId={null}
            username={username}
            size={100}
            src={previewUrl}
            sx={{
              border: '3px solid #fff',
              boxShadow: 1
            }}
          />
        ) : (
          <UserAvatar
            avatarId={avatarId}
            username={username}
            size={100}
            sx={{
              border: '3px solid #fff',
              boxShadow: 1
            }}
          />
        )}
        
        <Box>
          <Typography variant="body1" gutterBottom>
            Nahrajte svůj profilový obrázek
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Povolené formáty: JPG, PNG, GIF. Maximální velikost: 5MB.
          </Typography>
          
          <input
            type="file"
            accept="image/*"
            id="avatar-upload"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            disabled={isUploading}
          />
          
          <label htmlFor="avatar-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
              disabled={isUploading}
              sx={{ mt: 1 }}
            >
              {isUploading ? 'Nahrávání...' : 'Nahrát obrázek'}
            </Button>
          </label>
        </Box>
      </Box>
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar open={success} autoHideDuration={6000} onClose={handleCloseSuccess}>
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          Profilový obrázek byl úspěšně aktualizován.
        </Alert>
      </Snackbar>
    </Paper>
  );
}