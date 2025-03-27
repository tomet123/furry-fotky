import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from './FilterBar';

// Mock Material-UI komponenty
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    TextField: ({ 
      label, 
      value, 
      onChange, 
      placeholder,
      InputProps,
      ...props 
    }: any) => (
      <div data-testid="text-field" {...props}>
        <label>{label}</label>
        <input 
          data-testid="search-input"
          value={value || ''} 
          onChange={onChange} 
          placeholder={placeholder}
        />
        {InputProps?.startAdornment && (
          <div data-testid="start-adornment">{InputProps.startAdornment}</div>
        )}
        {InputProps?.endAdornment && (
          <div data-testid="end-adornment">{InputProps.endAdornment}</div>
        )}
      </div>
    ),
    Paper: ({ children, ...props }: any) => <div data-testid="paper" {...props}>{children}</div>,
    Box: ({ children, ...props }: any) => <div data-testid="box" {...props}>{children}</div>,
    Grid: ({ children, ...props }: any) => <div data-testid="grid" {...props}>{children}</div>,
    IconButton: ({ children, onClick, ...props }: any) => (
      <button data-testid="icon-button" onClick={onClick} {...props}>
        {children}
      </button>
    ),
    InputAdornment: ({ children, position, ...props }: any) => (
      <div data-testid={`input-adornment-${position}`} {...props}>{children}</div>
    ),
    Typography: ({ children, ...props }: any) => <div data-testid="typography" {...props}>{children}</div>,
    useMediaQuery: jest.fn().mockReturnValue(false),
    useTheme: jest.fn().mockReturnValue({
      palette: {
        mode: 'light',
        divider: '#ccc',
      },
      breakpoints: {
        down: jest.fn().mockReturnValue(false),
      },
    }),
  };
});

// Mock ikony
jest.mock('@mui/icons-material/Search', () => ({
  __esModule: true,
  default: () => <div data-testid="search-icon" />,
}));

jest.mock('@mui/icons-material/Clear', () => ({
  __esModule: true,
  default: () => <div data-testid="clear-icon" />,
}));

describe('SearchBar Component (Using FilterBar)', () => {
  const mockUpdateFilters = jest.fn();
  
  const defaultFilters = {
    query: '',
    page: 1,
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('zobrazuje správně vyhledávací pole s placeholder textem', () => {
    const placeholder = 'Vyhledat fotografie...';
    render(
      <FilterBar 
        filters={defaultFilters}
        onUpdateFilters={mockUpdateFilters}
        showSearch={true}
        searchPlaceholder={placeholder}
      />
    );
    
    // Ověříme, že se zobrazuje vyhledávací pole
    expect(screen.getByTestId('text-field')).toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toHaveAttribute('placeholder', placeholder);
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });
  
  it('aktualizuje filtry při zadání vyhledávacího dotazu', () => {
    render(
      <FilterBar 
        filters={defaultFilters}
        onUpdateFilters={mockUpdateFilters}
        showSearch={true}
      />
    );
    
    // Najdeme input
    const searchInput = screen.getByTestId('search-input');
    
    // Změníme hodnotu inputu
    fireEvent.change(searchInput, { target: { value: 'furry' } });
    
    // Ověříme, že byla zavolána funkce pro aktualizaci filtrů s novým dotazem
    // a že stránka byla resetována na 1
    expect(mockUpdateFilters).toHaveBeenCalledWith({
      query: 'furry',
      page: 1,
    });
  });
  
  it('zobrazuje ikonu pro vymazání pokud je zadaný vyhledávací dotaz', () => {
    const filtersWithQuery = {
      ...defaultFilters,
      query: 'husky',
    };
    
    render(
      <FilterBar 
        filters={filtersWithQuery}
        onUpdateFilters={mockUpdateFilters}
        showSearch={true}
      />
    );
    
    // Ověříme, že se zobrazuje ikona pro vymazání
    expect(screen.getByTestId('clear-icon')).toBeInTheDocument();
  });
  
  it('nezobrazuje ikonu pro vymazání pokud není zadaný vyhledávací dotaz', () => {
    render(
      <FilterBar 
        filters={defaultFilters}
        onUpdateFilters={mockUpdateFilters}
        showSearch={true}
      />
    );
    
    // Ověříme, že se nezobrazuje ikona pro vymazání
    expect(screen.queryByTestId('clear-icon')).not.toBeInTheDocument();
  });
  
  it('vymaže vyhledávací dotaz po kliknutí na ikonu pro vymazání', () => {
    const filtersWithQuery = {
      ...defaultFilters,
      query: 'husky',
    };
    
    render(
      <FilterBar 
        filters={filtersWithQuery}
        onUpdateFilters={mockUpdateFilters}
        showSearch={true}
      />
    );
    
    // Najdeme tlačítko pro vymazání
    const clearButton = screen.getByTestId('icon-button');
    
    // Klikneme na tlačítko
    fireEvent.click(clearButton);
    
    // Ověříme, že byla zavolána funkce pro aktualizaci filtrů s prázdným dotazem
    expect(mockUpdateFilters).toHaveBeenCalledWith({
      query: '',
      page: 1,
    });
  });
  
  it('nezobrazuje vyhledávací pole pokud showSearch je false', () => {
    render(
      <FilterBar 
        filters={defaultFilters}
        onUpdateFilters={mockUpdateFilters}
        showSearch={false}
      />
    );
    
    // Ověříme, že se nezobrazuje vyhledávací pole
    expect(screen.queryByTestId('text-field')).not.toBeInTheDocument();
  });
  
  it('zobrazuje výsledky vyhledávání, pokud jsou k dispozici', () => {
    render(
      <FilterBar 
        filters={defaultFilters}
        onUpdateFilters={mockUpdateFilters}
        showSearch={true}
        showCount={true}
        totalItems={42}
        totalPages={3}
      />
    );
    
    // Ověříme, že se zobrazuje informace o výsledcích
    expect(screen.getByText(/Nalezeno 42 položek/)).toBeInTheDocument();
  });
  
  it('zobrazuje informaci o stránkování, pokud je více stránek', () => {
    const filtersWithPage = {
      ...defaultFilters,
      page: 2,
    };
    
    render(
      <FilterBar 
        filters={filtersWithPage}
        onUpdateFilters={mockUpdateFilters}
        showSearch={true}
        showCount={true}
        totalItems={42}
        totalPages={3}
      />
    );
    
    // Ověříme, že se zobrazuje informace o stránkování
    expect(screen.getByText('Nalezeno 42 položek (stránka 2 z 3)')).toBeInTheDocument();
  });
}); 