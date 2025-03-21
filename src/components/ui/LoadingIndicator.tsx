import React, { memo } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingIndicatorProps {
  message?: string;
  fullWidth?: boolean;
  height?: number | string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Centralizovaná komponenta pro zobrazení načítacího indikátoru
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message,
  fullWidth = true,
  height = 'auto',
  size = 'medium'
}) => {
  // Převedení velikosti na numerickou hodnotu pro CircularProgress
  const progressSize = size === 'small' 
    ? 24 
    : size === 'large' 
      ? 48 
      : 40;
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        width: fullWidth ? '100%' : 'auto',
        height,
        py: 4
      }}
    >
      <CircularProgress size={progressSize} />
      {message && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

// Použití memo pro optimalizaci renderování
export default memo(LoadingIndicator); 