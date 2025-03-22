import React, { memo } from 'react';
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
  IconButton,
  Tooltip
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Photo } from '@/hooks/usePhotoItems';
import { CARD_HOVER_TRANSFORM, CARD_HOVER_SHADOW, SMALL_AVATAR_SIZE, THUMBNAIL_ASPECT_RATIO } from '@/lib/constants';

interface PhotoCardProps {
  photo: Photo;
  onClick: (photo: Photo) => void;
  onLike?: (photo: Photo) => Promise<void>;
  onUnlike?: (photo: Photo) => Promise<void>;
}

// Stylové konstanty
const cardStyles = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 2,
  border: '1px solid',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: CARD_HOVER_TRANSFORM,
    boxShadow: CARD_HOVER_SHADOW,
  },
  position: 'relative'
};

const likeBadgeStyles = {
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
};

const thumbnailStyles = {
  position: 'relative',
  paddingTop: THUMBNAIL_ASPECT_RATIO,
  overflow: 'hidden',
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8
};

const imageStyles = {
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
};

/**
 * Komponenta pro zobrazení karty fotografie v seznamu
 */
const PhotoCard: React.FC<PhotoCardProps> = ({ 
  photo, 
  onClick
}) => {
  const theme = useTheme();

  return (
    <Card 
      elevation={0} 
      sx={{ 
        ...cardStyles,
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
        '&:hover': {
          ...cardStyles['&:hover'],
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      {/* Lajk badge s počtem */}
      <Box 
        sx={likeBadgeStyles}
        onClick={(e) => e.stopPropagation()}
      >
        <Tooltip title="Počet lajků">
          <IconButton 
            size="small" 
            sx={{ 
              color: 'white', 
              p: 0,
              '&:hover': { color: '#ff6b6b' } 
            }}
            disabled={true}
          >
            <FavoriteIcon fontSize="small" color="error" />
          </IconButton>
        </Tooltip>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {photo.likes}
        </Typography>
      </Box>

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
        <Box sx={thumbnailStyles}>
          <Box
            component="img"
            src={photo.thumbnailUrl || undefined}
            loading="lazy"
            sx={imageStyles}
          />
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
                  width: SMALL_AVATAR_SIZE, 
                  height: SMALL_AVATAR_SIZE,
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
            {photo.tags && Array.isArray(photo.tags) && photo.tags.length > 0 ? (
              photo.tags.slice(0, 3).map((tag) => (
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
              ))
            ) : null}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

// Použití memo pro optimalizaci renderování
export default memo(PhotoCard);

// Export named verze pro případy, kdy je třeba neobalovat v memo
export { PhotoCard }; 