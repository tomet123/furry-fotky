'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Paper, 
  Typography, 
  Alert, 
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { searchAvailablePhotographers, requestPhotographerTakeover } from '@/app/actions/photographers';
import SearchIcon from '@mui/icons-material/Search';

// Formát pro fotografa bez přiřazeného uživatele
interface AvailablePhotographer {
  id: string;
  bio: string | null;
  description: string | null;
  isBeginner: boolean;
  createdAt: Date | null;
}

export default function RequestPhotographerForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [photographers, setPhotographers] = useState<AvailablePhotographer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Dialog pro potvrzení převzetí profilu
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPhotographer, setSelectedPhotographer] = useState<AvailablePhotographer | null>(null);
  const [requestReason, setRequestReason] = useState('');
  const [requestingTakeover, setRequestingTakeover] = useState(false);

  // Funkce pro vyhledání fotografů
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Zadejte prosím vyhledávací dotaz');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await searchAvailablePhotographers(searchQuery);
      setPhotographers(results);
      setSearchPerformed(true);
    } catch (error) {
      setError('Při vyhledávání došlo k chybě');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  // Funkcionalita dialogu
  const openRequestDialog = (photographer: AvailablePhotographer) => {
    setSelectedPhotographer(photographer);
    setDialogOpen(true);
  };
  
  const closeRequestDialog = () => {
    setDialogOpen(false);
    setSelectedPhotographer(null);
    setRequestReason('');
  };
  
  // Funkce pro odeslání žádosti o převzetí
  const submitTakeoverRequest = async () => {
    if (!session?.user?.id || !selectedPhotographer) {
      setError('Pro odeslání žádosti musíte být přihlášeni');
      closeRequestDialog();
      return;
    }
    
    if (!requestReason.trim()) {
      setError('Vyplňte prosím důvod žádosti');
      return;
    }
    
    setRequestingTakeover(true);
    
    try {
      const result = await requestPhotographerTakeover(
        session.user.id,
        selectedPhotographer.id,
        requestReason
      );
      
      if (result.success) {
        setSuccess(true);
        closeRequestDialog();
        
        // Přesměrujeme na profil po 2 sekundách
        setTimeout(() => {
          router.push('/user/profil');
          router.refresh();
        }, 2000);
      } else {
        setError(result.message || 'Při zpracování žádosti došlo k chybě');
        closeRequestDialog();
      }
    } catch (error) {
      setError('Při odesílání žádosti došlo k chybě');
      console.error(error);
      closeRequestDialog();
    } finally {
      setRequestingTakeover(false);
    }
  };
  
  // Redirect to login page if user is not logged in
  if (!session) {
    return (
      <Alert severity="error">
        Pro žádost o profil fotografa musíte být přihlášeni.
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
            Žádost o převzetí profilu fotografa byla úspěšně odeslána! Budete přesměrováni na váš profil.
          </Alert>
        )}
        
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Vyhledat existující profil fotografa
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={9}>
              <TextField
                fullWidth
                placeholder="Hledat podle bio nebo popisu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={loading || success}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                disabled={loading || success}
                startIcon={<SearchIcon />}
                sx={{ height: '100%' }}
              >
                {loading ? <CircularProgress size={24} /> : 'Vyhledat'}
              </Button>
            </Grid>
          </Grid>
        </Box>
        
        {searchPerformed && photographers.length === 0 && !loading && (
          <Alert severity="info">
            Nebyl nalezen žádný profil fotografa bez přiřazeného uživatele odpovídající vašemu vyhledávání.
          </Alert>
        )}
        
        {photographers.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Nalezené profily fotografů ({photographers.length})
            </Typography>
            
            <Grid container spacing={3}>
              {photographers.map((photographer) => (
                <Grid item xs={12} key={photographer.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Bio
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {photographer.bio || 'Bez bio'}
                      </Typography>
                      
                      <Typography variant="subtitle1" gutterBottom>
                        Popis
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {photographer.description ? (
                          photographer.description.length > 200 
                            ? `${photographer.description.substring(0, 200)}...` 
                            : photographer.description
                        ) : 'Bez popisu'}
                      </Typography>
                      
                      <Typography variant="caption" color="text.secondary">
                        {photographer.isBeginner ? 'Začínající fotograf' : 'Zkušený fotograf'} • 
                        Vytvořen: {photographer.createdAt ? new Date(photographer.createdAt).toLocaleDateString() : 'Neznámé datum'}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        color="primary"
                        onClick={() => openRequestDialog(photographer)}
                        disabled={success}
                      >
                        Požádat o převzetí
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>
      
      {/* Dialog pro potvrzení převzetí */}
      <Dialog open={dialogOpen} onClose={closeRequestDialog}>
        <DialogTitle>Požádat o převzetí profilu fotografa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Chystáte se požádat o převzetí existujícího profilu fotografa. Uveďte prosím důvod, proč byste měli dostat tento profil.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Důvod žádosti"
            fullWidth
            multiline
            rows={4}
            value={requestReason}
            onChange={(e) => setRequestReason(e.target.value)}
            disabled={requestingTakeover}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRequestDialog} disabled={requestingTakeover}>
            Zrušit
          </Button>
          <Button 
            onClick={submitTakeoverRequest} 
            color="primary"
            disabled={requestingTakeover || !requestReason.trim()}
          >
            {requestingTakeover ? <CircularProgress size={24} /> : 'Odeslat žádost'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 