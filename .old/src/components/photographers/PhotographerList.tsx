import React, { memo } from 'react';
import { Box, Grid, Typography, Button } from '@mui/material';
import Link from 'next/link';
import PhotographerCard from '@/components/photographers/PhotographerCard';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import { Photographer } from '@/hooks/usePhotographers';

interface PhotographerListProps {
  photographers: Photographer[];
  loading: boolean;
  title?: string;
  showViewAllButton?: boolean;
  emptyMessage?: string;
}

/**
 * Komponenta pro zobrazení seznamu fotografů
 */
const PhotographerList: React.FC<PhotographerListProps> = ({
  photographers,
  loading,
  title = 'Naši fotografové',
  showViewAllButton = true,
  emptyMessage = 'Žádní fotografové k zobrazení'
}) => {
  return (
    <Box sx={{ mb: 6 }}>
      {title && (
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, color: 'primary.light' }}>
          {title}
        </Typography>
      )}
      
      <Grid container spacing={4}>
        {loading ? (
          <LoadingIndicator message="Načítání fotografů..." />
        ) : photographers && photographers.length > 0 ? (
          photographers.map((photographer) => (
            <PhotographerCard 
              key={photographer.id} 
              photographer={photographer}
            />
          ))
        ) : (
          <Box sx={{ width: '100%', p: 4, textAlign: 'center' }}>
            <Typography>{emptyMessage}</Typography>
          </Box>
        )}
      </Grid>
      
      {showViewAllButton && photographers && photographers.length > 0 && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button 
            variant="outlined" 
            component={Link} 
            href="/photographers"
            sx={{ borderRadius: 8, px: 4 }}
          >
            Zobrazit všechny fotografy
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default memo(PhotographerList); 