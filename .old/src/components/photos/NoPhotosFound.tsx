import React from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';

interface NoPhotosFoundProps {
  onReset: () => void;
}

/**
 * Komponenta zobrazující prázdný stav, když nejsou nalezeny žádné fotografie
 */
export const NoPhotosFound: React.FC<NoPhotosFoundProps> = ({ onReset }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        textAlign: 'center'
      }}
    >
      <SearchOffIcon 
        sx={{ 
          fontSize: 80, 
          color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
          mb: 2
        }} 
      />
      
      <Typography variant="h5" gutterBottom>
        Žádné fotografie nenalezeny
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
        Zkuste změnit kritéria filtru nebo vyhledávání pro zobrazení více výsledků.
      </Typography>
      
      <Button 
        variant="outlined" 
        onClick={onReset}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          px: 3
        }}
      >
        Resetovat filtry
      </Button>
    </Box>
  );
}; 