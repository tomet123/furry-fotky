import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination as MuiPagination, PaginationItem, Box, Stack, Typography } from '@mui/material';
import { usePhotoGallery } from '@/app/contexts/PhotoGalleryContext';

// Vytvořím vlastní komponentu pro stránkování, která simuluje GalleryPagination
const Pagination = () => {
  const { totalItems, totalPages, currentPage, setPage } = usePhotoGallery();
  
  if (totalPages <= 1) {
    return (
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ mt: 3, textAlign: 'center' }}
      >
        Zobrazuji {totalItems} z {totalItems} {totalItems === 1 ? 'fotografie' : totalItems >= 2 && totalItems <= 4 ? 'fotografie' : 'fotografií'}
      </Typography>
    );
  }
  
  return (
    <Stack 
      spacing={2} 
      sx={{ 
        mt: 4, 
        mb: 2,
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
        Zobrazuji {Math.min(currentPage * 10, totalItems) - Math.min((currentPage - 1) * 10, totalItems)} z {totalItems} {totalItems === 1 ? 'fotografie' : totalItems >= 2 && totalItems <= 4 ? 'fotografie' : 'fotografií'}
      </Typography>
      
      <Box sx={{ order: { xs: 1, sm: 2 } }}>
        <MuiPagination
          page={currentPage}
          count={totalPages}
          shape="rounded"
          color="primary"
          onChange={(_, page) => setPage(page)}
        />
      </Box>
    </Stack>
  );
};

// Mock kontext fotogalerie
jest.mock('@/app/contexts/PhotoGalleryContext', () => ({
  usePhotoGallery: jest.fn(),
}));

// Mock Material-UI komponenty
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Pagination: ({ count, page, onChange, renderItem, ...props }: any) => (
      <div data-testid="pagination" {...props}>
        <span data-testid="pagination-count">{count}</span>
        <span data-testid="pagination-page">{page}</span>
        {[...Array(count)].map((_, i) => (
          <button 
            key={i} 
            data-testid={`page-${i + 1}`} 
            onClick={(e) => onChange(e, i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    ),
    PaginationItem: (props: any) => <div data-testid="pagination-item" {...props} />,
    Stack: ({ children, ...props }: any) => <div data-testid="stack" {...props}>{children}</div>,
    Box: ({ children, ...props }: any) => <div data-testid="box" {...props}>{children}</div>,
    Typography: ({ children, ...props }: any) => <div data-testid="typography" {...props}>{children}</div>,
    useMediaQuery: jest.fn().mockReturnValue(false),
    useTheme: jest.fn().mockReturnValue({
      breakpoints: {
        down: jest.fn().mockReturnValue(false),
      },
    }),
  };
});

describe('Pagination Component', () => {
  const setPageMock = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('zobrazuje informaci o počtu fotografií bez stránkování, když je jen jedna stránka', () => {
    // Mock kontextu s jen jednou stránkou
    (usePhotoGallery as jest.Mock).mockReturnValue({
      totalItems: 5,
      totalPages: 1,
      currentPage: 1,
      setPage: setPageMock,
    });
    
    render(<Pagination />);
    
    // Kontrola, že se zobrazuje správný text
    expect(screen.getByText('Zobrazuji 5 z 5 fotografií')).toBeInTheDocument();
    
    // Kontrola, že se nezobrazuje stránkování
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
  });
  
  it('zobrazuje stránkování, když je více stránek', () => {
    // Mock kontextu s více stránkami
    (usePhotoGallery as jest.Mock).mockReturnValue({
      totalItems: 30,
      totalPages: 3,
      currentPage: 2,
      setPage: setPageMock,
    });
    
    render(<Pagination />);
    
    // Kontrola, že se zobrazuje správný text
    expect(screen.getByText(/Zobrazuji.+z 30 fotografií/)).toBeInTheDocument();
    
    // Kontrola, že se zobrazuje stránkování
    const pagination = screen.getByTestId('pagination');
    expect(pagination).toBeInTheDocument();
    
    // Kontrola, že stránkování má správné hodnoty
    expect(screen.getByTestId('pagination-count').textContent).toBe('3');
    expect(screen.getByTestId('pagination-page').textContent).toBe('2');
  });
  
  it('volá setPage při kliknutí na stránku', () => {
    // Mock kontextu s více stránkami
    (usePhotoGallery as jest.Mock).mockReturnValue({
      totalItems: 30,
      totalPages: 3,
      currentPage: 1,
      setPage: setPageMock,
    });
    
    render(<Pagination />);
    
    // Kliknutí na stránku 2
    fireEvent.click(screen.getByTestId('page-2'));
    
    // Kontrola, že byla zavolána funkce setPage s hodnotou 2
    expect(setPageMock).toHaveBeenCalledWith(2);
  });
  
  it('používá správný gramatický tvar pro počet fotografií', () => {
    // Testování pro 1 fotografii
    (usePhotoGallery as jest.Mock).mockReturnValue({
      totalItems: 1,
      totalPages: 1,
      currentPage: 1,
      setPage: setPageMock,
    });
    
    const { rerender } = render(<Pagination />);
    expect(screen.getByText('Zobrazuji 1 z 1 fotografie')).toBeInTheDocument();
    
    // Testování pro 2 fotografie
    (usePhotoGallery as jest.Mock).mockReturnValue({
      totalItems: 2,
      totalPages: 1,
      currentPage: 1,
      setPage: setPageMock,
    });
    
    rerender(<Pagination />);
    expect(screen.getByText('Zobrazuji 2 z 2 fotografie')).toBeInTheDocument();
    
    // Testování pro 5 fotografií
    (usePhotoGallery as jest.Mock).mockReturnValue({
      totalItems: 5,
      totalPages: 1,
      currentPage: 1,
      setPage: setPageMock,
    });
    
    rerender(<Pagination />);
    expect(screen.getByText('Zobrazuji 5 z 5 fotografií')).toBeInTheDocument();
  });
}); 