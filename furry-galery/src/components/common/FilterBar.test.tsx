import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar, type Filter, type SortOption } from './FilterBar';

// Mock Material-UI komponenty
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Paper: ({ children, ...props }: any) => <div data-testid="paper" {...props}>{children}</div>,
    Box: ({ children, ...props }: any) => <div data-testid="box" {...props}>{children}</div>,
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
          data-testid="text-input"
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
    Autocomplete: ({
      options,
      value,
      onChange,
      onInputChange,
      inputValue,
      loading,
      renderInput,
      ...props
    }: any) => (
      <div data-testid="autocomplete" {...props}>
        {renderInput({
          InputProps: {
            endAdornment: (
              <div data-testid="autocomplete-endAdornment">
                {loading && <div data-testid="loading-indicator" />}
              </div>
            )
          }
        })}
        <select 
          data-testid="autocomplete-select"
          value={value || ''}
          onChange={(e) => onChange(e, e.target.value)}
        >
          <option value="">--Vyberte--</option>
          {options.map((option: string, index: number) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      </div>
    ),
    Typography: ({ children, ...props }: any) => <div data-testid="typography" {...props}>{children}</div>,
    Grid: ({ children, ...props }: any) => <div data-testid="grid" {...props}>{children}</div>,
    FormControl: ({ children, ...props }: any) => <div data-testid="form-control" {...props}>{children}</div>,
    InputLabel: ({ children, ...props }: any) => <label data-testid="input-label" {...props}>{children}</label>,
    Select: ({ children, value, onChange, ...props }: any) => (
      <select 
        data-testid="select"
        value={value || ''}
        onChange={onChange}
        {...props}
      >
        {children}
      </select>
    ),
    MenuItem: ({ children, value, ...props }: any) => (
      <option data-testid="menu-item" value={value} {...props}>
        {children}
      </option>
    ),
    Button: ({ children, onClick, ...props }: any) => (
      <button data-testid="button" onClick={onClick} {...props}>
        {children}
      </button>
    ),
    IconButton: ({ children, onClick, ...props }: any) => (
      <button data-testid="icon-button" onClick={onClick} {...props}>
        {children}
      </button>
    ),
    Chip: ({ label, ...props }: any) => <div data-testid="chip" {...props}>{label}</div>,
    InputAdornment: ({ children, ...props }: any) => <div data-testid="input-adornment" {...props}>{children}</div>,
    CircularProgress: (props: any) => <div data-testid="circular-progress" {...props} />,
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

jest.mock('@mui/icons-material/RestartAlt', () => ({
  __esModule: true,
  default: () => <div data-testid="restart-icon" />,
}));

jest.mock('@mui/icons-material/ExpandMore', () => ({
  __esModule: true,
  default: () => <div data-testid="expand-more-icon" />,
}));

jest.mock('@mui/icons-material/ExpandLess', () => ({
  __esModule: true,
  default: () => <div data-testid="expand-less-icon" />,
}));

describe('FilterBar Component', () => {
  const mockUpdateFilters = jest.fn();
  
  const defaultFilters: Filter = {
    query: '',
    sortBy: 'newest',
    page: 1,
    limit: 12,
  };
  
  const sortOptions: SortOption[] = [
    { value: 'newest', label: 'Nejnovější' },
    { value: 'oldest', label: 'Nejstarší' },
    { value: 'popular', label: 'Nejoblíbenější' },
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('zobrazuje správně vyhledávací pole', () => {
    render(
      <FilterBar 
        filters={defaultFilters}
        onUpdateFilters={mockUpdateFilters}
        showSearch={true}
      />
    );
    
    // Ověříme, že se zobrazuje vyhledávací pole
    expect(screen.getByTestId('text-field')).toBeInTheDocument();
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
    const searchInput = screen.getByTestId('text-input');
    
    // Změníme hodnotu inputu
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    
    // Ověříme, že byla zavolána funkce pro aktualizaci filtrů s novým dotazem
    // a že stránka byla resetována na 1
    expect(mockUpdateFilters).toHaveBeenCalledWith({
      query: 'test query',
      page: 1,
    });
  });
  
  it('zobrazuje pole pro řazení', () => {
    render(
      <FilterBar 
        filters={defaultFilters}
        onUpdateFilters={mockUpdateFilters}
        showSort={true}
        sortOptions={sortOptions}
      />
    );
    
    // Ověříme, že se zobrazuje select pro řazení
    expect(screen.getByTestId('select')).toBeInTheDocument();
    expect(screen.getByText('Řadit dle')).toBeInTheDocument();
    
    // Ověříme, že obsahuje všechny možnosti řazení
    expect(screen.getByText('Nejnovější')).toBeInTheDocument();
    expect(screen.getByText('Nejstarší')).toBeInTheDocument();
    expect(screen.getByText('Nejoblíbenější')).toBeInTheDocument();
  });
  
  it('aktualizuje filtry při změně řazení', () => {
    render(
      <FilterBar 
        filters={defaultFilters}
        onUpdateFilters={mockUpdateFilters}
        showSort={true}
        sortOptions={sortOptions}
      />
    );
    
    // Najdeme select
    const sortSelect = screen.getByTestId('select');
    
    // Změníme hodnotu selectu
    fireEvent.change(sortSelect, { target: { value: 'oldest' } });
    
    // Ověříme, že byla zavolána funkce pro aktualizaci filtrů s novým řazením
    expect(mockUpdateFilters).toHaveBeenCalledWith({
      sortBy: 'oldest',
      page: 1,
    });
  });
  
  it('zobrazuje pole pro filtrování podle fotografa', () => {
    const photographerOptions = ['Fotograf 1', 'Fotograf 2', 'Fotograf 3'];
    
    render(
      <FilterBar 
        filters={defaultFilters}
        onUpdateFilters={mockUpdateFilters}
        showPhotographer={true}
        photographerOptions={photographerOptions}
      />
    );
    
    // Ověříme, že se zobrazuje Autocomplete pro fotografa
    expect(screen.getAllByTestId('autocomplete')[0]).toBeInTheDocument();
    expect(screen.getByText('Fotograf')).toBeInTheDocument();
  });
  
  it('aktualizuje filtry při změně fotografa', () => {
    const photographerOptions = ['Fotograf 1', 'Fotograf 2', 'Fotograf 3'];
    
    render(
      <FilterBar 
        filters={defaultFilters}
        onUpdateFilters={mockUpdateFilters}
        showPhotographer={true}
        photographerOptions={photographerOptions}
      />
    );
    
    // Najdeme select v autocomplete
    const photographerSelect = screen.getByTestId('autocomplete-select');
    
    // Změníme hodnotu selectu
    fireEvent.change(photographerSelect, { target: { value: 'Fotograf 2' } });
    
    // Ověříme, že byla zavolána funkce pro aktualizaci filtrů s novým fotografem
    expect(mockUpdateFilters).toHaveBeenCalledWith({
      photographer: 'Fotograf 2',
      page: 1,
    });
  });
  
  it('zobrazuje počet nalezených položek', () => {
    render(
      <FilterBar 
        filters={defaultFilters}
        onUpdateFilters={mockUpdateFilters}
        totalItems={42}
        totalPages={4}
        showCount={true}
      />
    );
    
    // Ověříme, že se zobrazuje informace o počtu položek
    expect(screen.getByText(/Nalezeno 42 položek/)).toBeInTheDocument();
  });
  
  it('zobrazuje dodatečné komponenty v extraFields', () => {
    const extraFieldsContent = <div data-testid="extra-fields">Extra obsah</div>;
    
    render(
      <FilterBar 
        filters={defaultFilters}
        onUpdateFilters={mockUpdateFilters}
        extraFields={extraFieldsContent}
      />
    );
    
    // Ověříme, že se zobrazuje dodatečný obsah
    expect(screen.getByTestId('extra-fields')).toBeInTheDocument();
    expect(screen.getByText('Extra obsah')).toBeInTheDocument();
  });
  
  it('umožňuje vymazat vyhledávací dotaz', () => {
    const filtersWithQuery = {
      ...defaultFilters,
      query: 'test query'
    };
    
    render(
      <FilterBar 
        filters={filtersWithQuery}
        onUpdateFilters={mockUpdateFilters}
        showSearch={true}
      />
    );
    
    // Měl by být zobrazen button pro vymazání
    expect(screen.getByTestId('clear-icon')).toBeInTheDocument();
    
    // Klikneme na tlačítko pro vymazání
    const clearButton = screen.getByTestId('icon-button');
    fireEvent.click(clearButton);
    
    // Ověříme, že byla zavolána funkce pro aktualizaci filtrů s prázdným dotazem
    expect(mockUpdateFilters).toHaveBeenCalledWith({
      query: '',
      page: 1,
    });
  });
}); 