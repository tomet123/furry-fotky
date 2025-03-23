'use client';

import { Box, Typography, Avatar, Stack, Chip, IconButton, Tooltip } from '@mui/material';
import { Photo } from '@/app/actions/photos';
import styles from './PhotoFooter.module.css';

// Velikost avataru
const SMALL_AVATAR_SIZE = 32;

// Stylové konstanty
const darkOverlayStyle = {
  bgcolor: 'rgba(0, 0, 0, 0.3)',
};

const darkOverlayHoverStyle = {
  '&:hover': { 
    bgcolor: 'rgba(0, 0, 0, 0.5)' 
  }
};

const actionButtonStyle = {
  color: 'white',
  ...darkOverlayStyle,
  ...darkOverlayHoverStyle,
  p: 1,
  height: 32,
  width: 32
};

const controlBoxStyle = { 
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  px: 1.5,
  py: 0.5,
  borderRadius: 2,
  ...darkOverlayStyle
};

const dotSeparatorStyle = {
  width: '4px',
  height: '4px',
  borderRadius: '50%',
  bgcolor: 'rgba(255, 255, 255, 0.5)',
  mx: 1
};

const tagChipStyle = {
  bgcolor: 'rgba(0, 0, 0, 0.3)',
  color: 'white',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  '&:hover': {
    bgcolor: 'rgba(0, 0, 0, 0.5)',
  }
};

const footerStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
  padding: '16px',
  zIndex: 10
};

export interface PhotoFooterProps {
  photo: Photo;
  onDownload?: (photo: Photo, e: React.MouseEvent) => void;
  maxTags?: number;
  fullScreen?: boolean;
}

export const PhotoFooter = ({ 
  photo, 
  onDownload, 
  maxTags = 3,
  fullScreen = false
}: PhotoFooterProps) => {
  
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(photo, e);
    } else {
      // Výchozí implementace stahování
      const downloadLink = document.createElement('a');
      downloadLink.href = photo.imageUrl;
      downloadLink.download = `photo-${photo.id}`;
      downloadLink.click();
    }
  };
  
  return (
    <Box className={styles.footer}>
      <Box className={styles.infoContainer}>
        {/* Levá strana - fotograf, event a tagy */}
        <Box className={styles.leftSection}>
          {/* Fotograf */}
          <Box className={styles.userInfo}>
            <Avatar 
              src={photo.avatarUrl}
              sx={{ 
                width: SMALL_AVATAR_SIZE, 
                height: SMALL_AVATAR_SIZE,
                bgcolor: 'primary.main'
              }}
            >
              {photo.photographer.charAt(0)}
            </Avatar>
            <Typography variant="body2" className={styles.userName} sx={{ color: 'white' }}>
              {photo.photographer}
            </Typography>
          </Box>
          
          {/* Oddělovací tečka mezi fotografem a událostí */}
          {photo.event && <Box className={styles.dotSeparator} />}
          
          {/* Event na stejném řádku */}
          {photo.event && (
            <Box className={styles.metaInfo} sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: 'white' }}>
                {photo.event}
              </Typography>
            </Box>
          )}
          
          {/* Oddělovací tečka mezi akcí a tagy - samostatně mimo obě komponenty */}
          {photo.event && photo.tags && photo.tags.length > 0 && (
            <Box className={styles.dotSeparator} />
          )}
          
          {/* Tagy jako Chip komponenty vedle událostí */}
          {photo.tags && photo.tags.length > 0 && (
            <Stack 
              direction="row" 
              className={styles.tagContainer}
              sx={{ 
                display: 'flex'
              }}
            >
              {photo.tags?.slice(0, fullScreen ? maxTags - 2 : maxTags).map((tag: string) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  className={styles.tagChip}
                />
              ))}
            </Stack>
          )}
        </Box>

        {/* Pravá strana - pouze tlačítko stahování */}
        <Box className={styles.rightSection}>
          {/* Tlačítko pro stažení fotografie */}
          <Box className={styles.actionButtons}>
            <Tooltip title="Stáhnout fotografii">
              <IconButton
                onClick={handleDownload}
                aria-label="stáhnout fotografii"
                className={styles.downloadButton}
                size="small"
              >
                <Box component="span" sx={{ fontSize: '1.2rem' }}>
                  ↓
                </Box>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}; 