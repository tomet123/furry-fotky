import React from 'react';
import { 
  Card, 
  CardActionArea, 
  CardContent, 
  Avatar, 
  Typography, 
  Box, 
  Chip, 
  Stack, 
  useTheme,
  useMediaQuery
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Photo } from '@/hooks/usePhotoItems';

interface PhotoCardProps {
  photo: Photo;
  onClick: (photo: Photo) => void;
}

/**
 * Komponenta pro zobrazení karty fotografie v seznamu
 */
export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick }) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card 
      elevation={0} 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <CardActionArea 
        onClick={() => onClick(photo)}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch'
        }}
      >
        {/* Náhled fotky */}
        <Box 
          sx={{ 
            position: 'relative',
            paddingTop: '75%', // Poměr stran 4:3
            overflow: 'hidden',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8
          }}
        >
          <Box
            component="img"
            src={`https://picsum.photos/600/450?random=${photo.id}`}
            loading="lazy"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          />
          
          {/* Lajky v pravém horním rohu fotky */}
          <Box sx={{ 
            position: 'absolute', 
            top: 10, 
            right: 10, 
            bgcolor: 'rgba(0,0,0,0.6)', 
            color: 'white',
            borderRadius: '12px',
            px: 1.5,
            py: 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            zIndex: 2
          }}>
            <FavoriteIcon fontSize="small" />
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {photo.likes}
            </Typography>
          </Box>
        </Box>
        
        {/* Informace o fotce */}
        <CardContent 
          sx={{ 
            flexGrow: 1, 
            p: 2,
            '&:last-child': { pb: 2 } 
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="body2" fontWeight="medium" color="text.secondary">
              {photo.event}
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: { xs: 1, sm: 1.5 },
            mb: 1.5
          }}>
            {/* Fotograf */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 0.5
            }}>
              <Avatar 
                sx={{ 
                  width: 24, 
                  height: 24,
                  fontSize: '0.875rem',
                  bgcolor: 'primary.main'
                }}
              >
                {photo.photographer.charAt(0)}
              </Avatar>
              <Typography variant="body2" fontSize="0.875rem">
                {photo.photographer}
              </Typography>
            </Box>
          </Box>

          {/* Tagy */}
          <Stack 
            direction="row" 
            spacing={0.5} 
            sx={{ 
              flexWrap: 'nowrap',
              overflow: 'hidden'
            }}
          >
            {photo.tags.slice(0, 3).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.7rem',
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'
                }}
              />
            ))}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}; 