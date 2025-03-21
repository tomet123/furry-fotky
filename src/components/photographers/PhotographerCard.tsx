import React, { memo } from 'react';
import { Box, Card, CardContent, Typography, CardActionArea } from '@mui/material';
import Grid from '@mui/material/Grid';
import Link from 'next/link';
import Image from 'next/image';
import { CARD_HOVER_TRANSFORM, CARD_HOVER_SHADOW, DEFAULT_AVATAR_SIZE } from '@/lib/constants';

export interface Photographer {
  id: number;
  name: string;
  bio?: string;
  avatarUrl?: string;
}

interface PhotographerCardProps {
  photographer: Photographer;
}

/**
 * Komponenta pro zobrazení karty s informacemi o fotografovi
 */
const PhotographerCard: React.FC<PhotographerCardProps> = ({ photographer }) => (
  <Grid item key={photographer.id} xs={12} sm={4}>
    <Card sx={{ 
      height: '100%',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: CARD_HOVER_TRANSFORM,
        boxShadow: CARD_HOVER_SHADOW,
      }
    }}>
      <CardActionArea component={Link} href={`/photographers/${photographer.id}`}>
        <Box sx={{ position: 'relative', width: '60%', pt: '60%', borderRadius: '50%', margin: '20px auto' }}>
          <Image
            src={photographer.avatarUrl || `/api/avatar?size=${DEFAULT_AVATAR_SIZE}&seed=${photographer.id}`}
            alt={photographer.name}
            fill
            loading="lazy"
            style={{
              objectFit: 'cover',
              borderRadius: '50%',
            }}
            sizes="(max-width: 600px) 60vw, (max-width: 960px) 30vw, 20vw"
          />
        </Box>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography gutterBottom variant="h5" component="h2">
            {photographer.name}
          </Typography>
          <Typography>
            {photographer.bio || 'Informace o fotografovi nejsou k dispozici.'}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  </Grid>
);

export default memo(PhotographerCard); 