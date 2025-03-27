import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PhotoUploadForm } from './PhotoUploadForm';
import { CloudinaryUploadWidget } from '../common/CloudinaryUploadWidget';
import userEvent from '@testing-library/user-event';

// Mock CloudinaryUploadWidget
jest.mock('../common/CloudinaryUploadWidget', () => ({
  CloudinaryUploadWidget: jest.fn(({ onUploadSuccess }) => (
    <button
      data-testid="upload-widget-button"
      onClick={() => onUploadSuccess({
        secure_url: 'https://example.com/test-image.jpg',
        public_id: 'test-public-id',
        format: 'jpg',
        width: 800,
        height: 600,
      })}
    >
      Nahrát fotografii
    </button>
  )),
}));

// Mock Material-UI komponenty
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    TextField: ({ 
      label, 
      name,
      value, 
      onChange, 
      placeholder,
      required,
      error,
      helperText,
      ...props 
    }: any) => (
      <div data-testid={`text-field-${name}`}>
        <label>{label}{required ? ' *' : ''}</label>
        <input 
          data-testid={`input-${name}`}
          name={name}
          value={value || ''} 
          onChange={onChange} 
          placeholder={placeholder}
          required={required}
        />
        {error && <div data-testid={`error-${name}`}>{helperText}</div>}
      </div>
    ),
    Autocomplete: ({
      options,
      value,
      onChange,
      renderInput,
      multiple,
      name,
      ...props
    }: any) => (
      <div data-testid={`autocomplete-${name}`}>
        {renderInput({ name })}
        <select 
          data-testid={`select-${name}`}
          multiple={multiple}
          value={value || (multiple ? [] : '')}
          onChange={(e) => {
            if (multiple) {
              const values = Array.from(e.target.selectedOptions).map(opt => opt.value);
              onChange(null, values);
            } else {
              onChange(null, e.target.value);
            }
          }}
        >
          <option value="">--Vyberte--</option>
          {options.map((option: string, index: number) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      </div>
    ),
    Button: ({ children, onClick, type, disabled, ...props }: any) => (
      <button 
        data-testid={`button-${type || 'button'}`}
        onClick={onClick}
        disabled={disabled}
        type={type}
        {...props}
      >
        {children}
      </button>
    ),
    Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
    CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
    Typography: ({ children, ...props }: any) => <div data-testid="typography" {...props}>{children}</div>,
    Box: ({ children, ...props }: any) => <div data-testid="box" {...props}>{children}</div>,
    Grid: ({ children, ...props }: any) => <div data-testid="grid" {...props}>{children}</div>,
    CircularProgress: (props: any) => <div data-testid="circular-progress" {...props} />,
    Alert: ({ children, severity, ...props }: any) => (
      <div data-testid={`alert-${severity}`} {...props}>
        {children}
      </div>
    ),
  };
});

describe('PhotoUploadForm Component', () => {
  const mockOnUploadComplete = jest.fn();
  const mockOnCancel = jest.fn();
  
  const mockPhotographers = ['Fotograf 1', 'Fotograf 2', 'Fotograf 3'];
  const mockEvents = ['Akce 1', 'Akce 2', 'Akce 3'];
  const mockTags = ['Tag 1', 'Tag 2', 'Tag 3', 'Tag 4'];
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('zobrazuje formulář pro nahrání fotografie', () => {
    render(
      <PhotoUploadForm
        onUploadComplete={mockOnUploadComplete}
        onCancel={mockOnCancel}
        photographers={mockPhotographers}
        events={mockEvents}
        tags={mockTags}
      />
    );
    
    // Ověříme, že se zobrazuje widget pro nahrání
    expect(screen.getByTestId('upload-widget-button')).toBeInTheDocument();
    // Ověříme, že se zobrazují vstupní pole pro metadata
    expect(screen.getByTestId('text-field-title')).toBeInTheDocument();
    expect(screen.getByTestId('text-field-description')).toBeInTheDocument();
    expect(screen.getByTestId('autocomplete-photographer')).toBeInTheDocument();
    expect(screen.getByTestId('autocomplete-event')).toBeInTheDocument();
    expect(screen.getByTestId('autocomplete-tags')).toBeInTheDocument();
  });
  
  it('aktualizuje hodnoty polí při změně vstupu', async () => {
    const user = userEvent.setup();
    render(
      <PhotoUploadForm
        onUploadComplete={mockOnUploadComplete}
        onCancel={mockOnCancel}
        photographers={mockPhotographers}
        events={mockEvents}
        tags={mockTags}
      />
    );
    
    // Nejprve nahrajeme fotografii kliknutím na widget
    await user.click(screen.getByTestId('upload-widget-button'));
    
    // Vyplníme formulářová pole
    await user.type(screen.getByTestId('input-title'), 'Test fotografie');
    await user.type(screen.getByTestId('input-description'), 'Popis testovací fotografie');
    
    // Vybereme fotografa
    fireEvent.change(screen.getByTestId('select-photographer'), { 
      target: { value: 'Fotograf 2' } 
    });
    
    // Vybereme akci
    fireEvent.change(screen.getByTestId('select-event'), { 
      target: { value: 'Akce 1' } 
    });
    
    // Vybereme tagy (více hodnot)
    const tagsSelect = screen.getByTestId('select-tags');
    fireEvent.change(tagsSelect, { 
      target: { 
        selectedOptions: [
          { value: 'Tag 1' },
          { value: 'Tag 3' }
        ] 
      } 
    });
    
    // Odešleme formulář
    await user.click(screen.getByTestId('button-submit'));
    
    // Ověříme, že byla zavolána funkce pro dokončení uploadu se správnými daty
    expect(mockOnUploadComplete).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Test fotografie',
      description: 'Popis testovací fotografie',
      photographer: 'Fotograf 2',
      event: 'Akce 1',
      tags: ['Tag 1', 'Tag 3'],
      image: {
        url: 'https://example.com/test-image.jpg',
        publicId: 'test-public-id',
        format: 'jpg',
        width: 800,
        height: 600
      }
    }));
  });
  
  it('zobrazuje validační chyby pro povinná pole', async () => {
    const user = userEvent.setup();
    render(
      <PhotoUploadForm
        onUploadComplete={mockOnUploadComplete}
        onCancel={mockOnCancel}
        photographers={mockPhotographers}
        events={mockEvents}
        tags={mockTags}
      />
    );
    
    // Nejprve nahrajeme fotografii kliknutím na widget
    await user.click(screen.getByTestId('upload-widget-button'));
    
    // Nezadáme žádné hodnoty a odešleme formulář
    await user.click(screen.getByTestId('button-submit'));
    
    // Ověříme, že se zobrazují validační chyby pro povinná pole
    await waitFor(() => {
      expect(screen.getByTestId('error-title')).toBeInTheDocument();
    });
    
    // Ověříme, že nebyla zavolána funkce pro dokončení uploadu
    expect(mockOnUploadComplete).not.toHaveBeenCalled();
  });
  
  it('zruší upload po kliknutí na tlačítko zrušit', async () => {
    const user = userEvent.setup();
    render(
      <PhotoUploadForm
        onUploadComplete={mockOnUploadComplete}
        onCancel={mockOnCancel}
        photographers={mockPhotographers}
        events={mockEvents}
        tags={mockTags}
      />
    );
    
    // Klikneme na tlačítko zrušit
    await user.click(screen.getByText('Zrušit'));
    
    // Ověříme, že byla zavolána funkce pro zrušení
    expect(mockOnCancel).toHaveBeenCalled();
  });
  
  it('nepovolí odeslat formulář dokud není nahrána fotografie', async () => {
    // Mock CloudinaryUploadWidget tak, že onUploadSuccess není voláno
    (CloudinaryUploadWidget as jest.Mock).mockImplementationOnce(({ children }) => (
      <button data-testid="upload-widget-button">
        {children}
      </button>
    ));
    
    const user = userEvent.setup();
    render(
      <PhotoUploadForm
        onUploadComplete={mockOnUploadComplete}
        onCancel={mockOnCancel}
        photographers={mockPhotographers}
        events={mockEvents}
        tags={mockTags}
      />
    );
    
    // Vyplníme formulářová pole ale nenahraje se fotografie
    await user.type(screen.getByTestId('input-title'), 'Test fotografie');
    
    // Odešleme formulář
    await user.click(screen.getByTestId('button-submit'));
    
    // Ověříme, že nebyla zavolána funkce pro dokončení uploadu
    expect(mockOnUploadComplete).not.toHaveBeenCalled();
    
    // A že se zobrazí chybové hlášení
    await waitFor(() => {
      expect(screen.getByText('Nejprve je nutné nahrát fotografii')).toBeInTheDocument();
    });
  });
  
  it('umožňuje vytvořit novou fotografii bez výběru nepovinných polí', async () => {
    const user = userEvent.setup();
    render(
      <PhotoUploadForm
        onUploadComplete={mockOnUploadComplete}
        onCancel={mockOnCancel}
        photographers={mockPhotographers}
        events={mockEvents}
        tags={mockTags}
      />
    );
    
    // Nejprve nahrajeme fotografii kliknutím na widget
    await user.click(screen.getByTestId('upload-widget-button'));
    
    // Vyplníme pouze povinné pole
    await user.type(screen.getByTestId('input-title'), 'Test fotografie');
    
    // Odešleme formulář
    await user.click(screen.getByTestId('button-submit'));
    
    // Ověříme, že byla zavolána funkce pro dokončení uploadu s minimálními daty
    expect(mockOnUploadComplete).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Test fotografie',
      image: expect.any(Object)
    }));
  });
}); 