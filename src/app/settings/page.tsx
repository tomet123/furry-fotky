'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Tabs, Tab, Paper } from '@mui/material';
import { useAuthContext } from '@/components/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AvatarUpload from '@/components/profile/AvatarUpload';
import ProfileSettingsForm from '@/components/profile/ProfileSettingsForm';
import PasswordChangeForm from '@/components/profile/PasswordChangeForm';

export default function SettingsPage() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    // Nastavení hodnoty při inicializaci
    setIsSmallScreen(window.innerWidth < 900);
    
    // Přidání listeneru pro změnu velikosti okna
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 900);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup při odmontování komponenty
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <ProtectedRoute>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom>
          Nastavení profilu
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mt: 3 }}>
          <Box sx={{ width: { xs: '100%', md: 250 } }}>
            <Paper sx={{ mb: 3 }}>
              <Tabs
                orientation={isSmallScreen ? 'horizontal' : 'vertical'}
                variant="scrollable"
                value={activeTab}
                onChange={handleTabChange}
                sx={{ borderRight: 1, borderColor: 'divider' }}
              >
                <Tab label="Profil" />
                <Tab label="Zabezpečení" />
              </Tabs>
            </Paper>
          </Box>
          
          <Box sx={{ flexGrow: 1 }}>
            {activeTab === 0 && (
              <Box>
                <AvatarUpload 
                  currentAvatarId={user?.avatar_id || null} 
                  username={user?.username || ''} 
                  onAvatarUpdate={() => {}} 
                />
                
                <ProfileSettingsForm />
              </Box>
            )}
            
            {activeTab === 1 && (
              <Box>
                <PasswordChangeForm userId={user?.id || 0} />
              </Box>
            )}
            
          </Box>
        </Box>
      </Container>
    </ProtectedRoute>
  );
} 