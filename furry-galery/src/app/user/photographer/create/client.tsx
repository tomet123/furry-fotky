'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Paper, 
  Typography, 
  Alert, 
  CircularProgress,
  FormControlLabel,
  Switch,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import MDEditor from '@uiw/react-md-editor';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  createPhotographerProfile, 
  getUserPhotographerProfile,
  updatePhotographer,
  deletePhotographer
} from '@/app/actions/photographers';
import EnhancedMarkdownEditor from '@/components/markdown/EnhancedMarkdownEditor';

export default function PhotographerForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photographerData, setPhotographerData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    bio: '',
    description: '',
    isBeginner: true,
  });

  // Načtení dat existujícího profilu fotografa, pokud jsme v režimu editace
  useEffect(() => {
    const loadPhotographerProfile = async () => {
      if (session?.user?.id) {
        setLoadingProfile(true);
        try {
          const profile = await getUserPhotographerProfile(session.user.id);
          setPhotographerData(profile);
          
          if (profile) {
            // Předvyplnění formuláře daty z existujícího profilu
            setFormData({
              bio: profile.bio || '',
              description: profile.description || '',
              isBeginner: profile.isBeginner
            });
          }
        } catch (error) {
          console.error('Chyba při načítání profilu fotografa:', error);
          setError('Nepodařilo se načíst data profilu fotografa');
        } finally {
          setLoadingProfile(false);
        }
      }
    };

    if (isEditMode) {
      loadPhotographerProfile();
    }
  }, [session?.user?.id, isEditMode]);

  // Funkce pro aktualizaci bio pole
  const handleBioChange = (value: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      bio: value || ''
    }));
  };

  // Funkce pro aktualizaci description pole
  const handleDescriptionChange = (value: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      description: value || ''
    }));
  };

  // Funkce pro přepínání isBeginner
  const handleBeginnerToggle = () => {
    setFormData(prev => ({
      ...prev,
      isBeginner: !prev.isBeginner
    }));
  };

  // Funkce pro otevření dialogu pro smazání profilu
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  // Funkce pro zavření dialogu pro smazání profilu
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  // Funkce pro smazání profilu fotografa
  const handleDeletePhotographer = async () => {
    if (!session?.user?.id || !photographerData?.id) return;
    
    setDeleteLoading(true);
    try {
      const result = await deletePhotographer(session.user.id, photographerData.id);
      
      if (result.success) {
        setSuccess(true);
        setDeleteDialogOpen(false);
        // Přesměrujeme na profil po 2 sekundách
        setTimeout(() => {
          router.push('/user/profile');
          router.refresh();
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Chyba při mazání profilu fotografa:', error);
      setError(error instanceof Error ? error.message : 'Při mazání profilu fotografa došlo k neočekávané chybě');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Funkce pro odeslání formuláře
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      setError('Pro úpravu profilu fotografa musíte být přihlášeni');
      console.error('Pokus o úpravu profilu fotografa bez přihlášeného uživatele');
      return;
    }
    
    if (!formData.bio.trim() || !formData.description.trim()) {
      setError('Vyplňte prosím všechna povinná pole');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      if (isEditMode && photographerData?.id) {
        // Aktualizace existujícího profilu
        result = await updatePhotographer(
          session.user.id,
          photographerData.id,
          {
            bio: formData.bio,
            description: formData.description,
            isBeginner: formData.isBeginner
          }
        );
      } else {
        // Vytvoření nového profilu
        result = await createPhotographerProfile(
          session.user.id,
          {
            bio: formData.bio,
            description: formData.description,
            isBeginner: formData.isBeginner
          }
        );
      }
      
      if (result.success) {
        setSuccess(true);
        // Přesměrujeme na profil po 2 sekundách
        setTimeout(() => {
          router.push('/user/profile');
          router.refresh();
        }, 2000);
      } else {
        setError(result.error ? `${result.message}: ${result.error}` : result.message);
      }
    } catch (error) {
      console.error('Neočekávaná chyba při úpravě profilu fotografa:', error);
      if (error instanceof Error) {
        setError(`Při úpravě profilu fotografa došlo k chybě: ${error.message}`);
      } else {
        setError('Při úpravě profilu fotografa došlo k neočekávané chybě');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Redirect to login page if user is not logged in
  if (!session) {
    return (
      <Alert severity="error">
        Pro úpravu profilu fotografa musíte být přihlášeni.
      </Alert>
    );
  }
  
  // Pokud načítáme data profilu v režimu editace
  if (isEditMode && loadingProfile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Pokud jsme v režimu editace, ale profil nebyl nalezen
  if (isEditMode && !loadingProfile && !photographerData) {
    return (
      <Alert severity="warning">
        Nemáte vytvořený profil fotografa, který byste mohli upravit.
      </Alert>
    );
  }

  return (
    <>
      <Paper elevation={3} sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {isEditMode 
              ? "Profil fotografa byl úspěšně aktualizován! Budete přesměrováni na váš profil." 
              : "Profil fotografa byl úspěšně vytvořen! Budete přesměrováni na váš profil."}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Krátké bio
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Stručný popis vaší fotografické činnosti (max. 100 znaků)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Krátké představení vaší fotografické činnosti"
                value={formData.bio}
                onChange={(e) => handleBioChange(e.target.value)}
                inputProps={{ maxLength: 100 }}
                disabled={loading || success}
              />
              <Typography variant="caption" color="text.secondary">
                {formData.bio.length}/100 znaků
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Detailní popis
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Detailnější popis vašich zkušeností, fotografické techniky, stylu a zaměření.
                Můžete použít Markdown formátování.
              </Typography>
              <EnhancedMarkdownEditor
                value={formData.description}
                onChange={handleDescriptionChange}
                height={300}
                placeholder="Detailní popis vašeho fotografického stylu a zkušeností..."
                disabled={loading || success}
                helperText="Využijte formátování pro přehledný a atraktivní popis"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isBeginner}
                    onChange={handleBeginnerToggle}
                    disabled={loading || success}
                  />
                }
                label="Jsem začínající fotograf"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading || success}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Uložit změny' : 'Vytvořit profil fotografa')}
              </Button>
            </Grid>
            
            {isEditMode && photographerData && (
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleOpenDeleteDialog}
                  disabled={loading || success || deleteLoading}
                  fullWidth
                >
                  {deleteLoading ? <CircularProgress size={24} /> : 'Smazat profil fotografa'}
                </Button>
              </Grid>
            )}
          </Grid>
        </Box>
      </Paper>
      
      {/* Dialog pro potvrzení smazání profilu */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Smazat profil fotografa?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Opravdu chcete smazat svůj profil fotografa? Tato akce je nevratná. 
            Všechny vaše galerie a fotky zůstanou zachovány, ale nebudou přiřazeny k žádnému fotografovi.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
            Zrušit
          </Button>
          <Button 
            onClick={handleDeletePhotographer} 
            color="error" 
            disabled={deleteLoading}
            variant="contained"
          >
            {deleteLoading ? <CircularProgress size={24} /> : 'Smazat'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 