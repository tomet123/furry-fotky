import { Box, Typography, Paper } from '@mui/material';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';

/**
 * Komponenta zobrazující informaci o tom, že nebyly nalezeny žádné fotografie
 */
export function NoPhotosFound() {
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 4, 
        textAlign: 'center',
        borderRadius: 2,
        border: '1px dashed',
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}
      >
        <ImageNotSupportedIcon 
          sx={{ 
            fontSize: 64,
            color: 'text.secondary',
            opacity: 0.7
          }}
        />
        
        <Typography variant="h6">
          Žádné fotografie nebyly nalezeny
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Zkuste upravit filtry nebo změnit vyhledávací dotaz.
        </Typography>
      </Box>
    </Paper>
  );
} 