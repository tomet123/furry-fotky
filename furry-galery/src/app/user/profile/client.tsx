'use client';

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Tabs, 
  Tab, 
  Avatar,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { useSession } from 'next-auth/react';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PhotoIcon from '@mui/icons-material/Photo';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import EditIcon from '@mui/icons-material/Edit';
import Link from 'next/link';
import { updateUserProfile, changeUserPassword } from '@/app/actions/users';
import { getUserPhotographerProfile } from '@/app/actions/photographers';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Komponenta pro jednotlivé záložky
function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Základní komponenta profilu
export default function ProfileClient() {
  const [tabValue, setTabValue] = useState(0);
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [photographerProfile, setPhotographerProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Inicializace formulářových dat
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    email: '',
  });

  // Inicializace dat pro změnu hesla
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Aktualizace formulářových dat když je k dispozici session
  useEffect(() => {
    if (session?.user) {
      setProfileData({
        name: session.user.name || '',
        username: session.user.username || '',
        email: session.user.email || '',
      });
    }
  }, [session]);

  // Načtení profilu fotografa, pokud existuje
  useEffect(() => {
    const loadPhotographerProfile = async () => {
      if (session?.user?.id) {
        setLoadingProfile(true);
        try {
          const profile = await getUserPhotographerProfile(session.user.id);
          setPhotographerProfile(profile);
        } catch (error) {
          console.error('Chyba při načítání profilu fotografa:', error);
        } finally {
          setLoadingProfile(false);
        }
      }
    };

    loadPhotographerProfile();
  }, [session?.user?.id]);

  // Handler pro změnu záložky
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handler pro změnu polí formuláře profilu
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  // Handler pro změnu polí formuláře hesla
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // Odeslání formuláře s osobními údaji
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    
    setLoading(true);
    setMessage(null);

    try {
      const result = await updateUserProfile({
        id: session.user.id,
        name: profileData.name,
        email: profileData.email,
      });
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        // Aktualizace session po změně dat
        await update({
          ...session,
          user: {
            ...session.user,
            name: profileData.name,
            email: profileData.email,
          },
        });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Při aktualizaci profilu došlo k chybě' });
    } finally {
      setLoading(false);
    }
  };

  // Odeslání formuláře změny hesla
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    
    // Validace, že hesla se shodují
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Hesla se neshodují' });
      return;
    }
    
    setLoading(true);
    setMessage(null);

    try {
      const result = await changeUserPassword({
        id: session.user.id,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Při změně hesla došlo k chybě' });
    } finally {
      setLoading(false);
    }
  };

  // Nahrání profilového obrázku
  const handleAvatarUpload = async (file: File) => {
    if (!file || !session?.user?.id) return;
    
    setLoading(true);
    setMessage(null);

    try {
      // Vytvoření FormData objektu a přidání souboru
      const formData = new FormData();
      formData.append('avatar', file);
      
      // Odeslání na server
      const response = await fetch('/api/profile-pictures/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Přidání časového razítka pro obejití cache profilového obrázku
        const timestamp = new Date().getTime();
        setMessage({ type: 'success', text: 'Profilový obrázek byl úspěšně nahrán' });
        
        // Aktualizace session s novým profilovým obrázkem
        await update({
          ...session,
          user: {
            ...session.user,
            image: `/api/profile-pictures/${session.user.id}?t=${timestamp}`,
          },
        });
      } else {
        setMessage({ type: 'error', text: result.error || 'Nahrávání se nezdařilo' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Při nahrávání obrázku došlo k chybě' });
    } finally {
      setLoading(false);
    }
  };

  // Kontrola, zda je uživatel přihlášen
  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Alert severity="warning">
        Pro zobrazení profilu se musíte přihlásit.
      </Alert>
    );
  }

  return (
    <>
      {/* Karta s přehledem rolí uživatele */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Váš profil na FurryFotky.cz
          </Typography>
          
          <Divider sx={{ my: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Fotograf
              </Typography>
              
              {loadingProfile ? (
                <CircularProgress size={24} />
              ) : photographerProfile ? (
                <Box>
                  <Typography variant="body1">
                    Máte vytvořený profil fotografa.
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button 
                      variant="outlined" 
                      component={Link} 
                      href={`/uzivatele/fotograf/${photographerProfile.id}`}
                      startIcon={<PhotoIcon />}
                    >
                      Zobrazit profil
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      component={Link}
                      href="/user/photographer/create?edit=true"
                      startIcon={<EditIcon />}
                    >
                      Upravit profil
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Typography variant="body1" paragraph>
                    Nemáte vytvořený profil fotografa. Jako fotograf můžete nahrávat fotky, 
                    vytvářet galerie a získávat hodnocení.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      variant="contained" 
                      component={Link}
                      href="/user/photographer/create"
                      color="primary"
                      startIcon={<AddCircleIcon />}
                    >
                      Vytvořit profil fotografa
                    </Button>
                    <Button 
                      variant="outlined"
                      component={Link}
                      href="/user/photographer/request"
                      startIcon={<ThumbUpIcon />}
                    >
                      Požádat o existující profil
                    </Button>
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Paper elevation={2}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="profile tabs"
            centered
          >
            <Tab icon={<PersonIcon />} iconPosition="start" label="Osobní údaje" />
            <Tab icon={<PhotoCameraIcon />} iconPosition="start" label="Profilový obrázek" />
            <Tab icon={<LockIcon />} iconPosition="start" label="Změna hesla" />
          </Tabs>
        </Box>

        {/* Zobrazení zprávy pro uživatele */}
        {message && (
          <Box sx={{ px: 3, pt: 2 }}>
            <Alert severity={message.type} onClose={() => setMessage(null)}>
              {message.text}
            </Alert>
          </Box>
        )}

        {/* Záložka s osobními údaji */}
        <TabPanel value={tabValue} index={0}>
          <form onSubmit={handleProfileSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  Osobní údaje
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Jméno"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Uživatelské jméno"
                  name="username"
                  value={profileData.username}
                  onChange={handleProfileChange}
                  disabled  // Uživatelské jméno by nemělo být možné měnit
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="E-mail"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Uložit změny'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>

        {/* Záložka pro nahrání profilového obrázku */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                Profilový obrázek
              </Typography>
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {session?.user?.id && (
                <Avatar
                  src={`/api/profile-pictures/${session.user.id}?t=${new Date().getTime()}`}
                  sx={{ width: 120, height: 120, mb: 2 }}
                >
                  {session.user.name?.charAt(0).toUpperCase() || <PersonIcon />}
                </Avatar>
              )}
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="avatar-upload"
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleAvatarUpload(e.target.files[0]);
                  }
                }}
              />
              <label htmlFor="avatar-upload">
                <Button
                  variant="contained"
                  component="span"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Nahrát nový obrázek'}
                </Button>
              </label>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Záložka pro změnu hesla */}
        <TabPanel value={tabValue} index={2}>
          <form onSubmit={handlePasswordSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  Změna hesla
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Aktuální heslo"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nové heslo"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Potvrzení nového hesla"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Změnit heslo'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>
      </Paper>
    </>
  );
} 