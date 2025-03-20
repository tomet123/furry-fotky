import React from 'react';
import { 
  Box, 
  Pagination, 
  PaginationItem, 
  Typography, 
  Stack, 
  useTheme,
  useMediaQuery
} from '@mui/material';

interface PhotoPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
}

/**
 * Komponenta pro stránkování fotografií
 */
export const PhotoPagination: React.FC<PhotoPaginationProps> = ({
  page,
  totalPages,
  totalItems,
  onPageChange
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (totalPages <= 0) {
    return null;
  }

  return (
    <Stack 
      spacing={2} 
      sx={{ 
        mt: 3, 
        mb: 4,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'center', sm: 'center' },
        justifyContent: 'space-between'
      }}
    >
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ 
          order: { xs: 2, sm: 1 },
          mt: { xs: 1, sm: 0 }
        }}
      >
        Nalezeno celkem {totalItems} {totalItems === 1 ? 'fotografie' : totalItems >= 2 && totalItems <= 4 ? 'fotografie' : 'fotografií'}
      </Typography>
      
      <Box sx={{ order: { xs: 1, sm: 2 } }}>
        <Pagination
          page={page}
          count={totalPages}
          shape="rounded"
          color="primary"
          size={isMobile ? "small" : "medium"}
          siblingCount={isMobile ? 0 : 1}
          onChange={onPageChange}
          renderItem={(item) => (
            <PaginationItem
              {...item}
              sx={{
                borderRadius: 1.5,
                '&.Mui-selected': {
                  fontWeight: 'bold',
                },
              }}
            />
          )}
        />
      </Box>
    </Stack>
  );
}; 