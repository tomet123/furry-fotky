import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhotoCard } from './PhotoCard';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { likePhoto, unlikePhoto } from '@/app/actions/photos';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock actions
jest.mock('@/app/actions/photos', () => ({
  likePhoto: jest.fn(),
  unlikePhoto: jest.fn(),
}));

// Mock komponentu CanvasImage
jest.mock('./CanvasImage', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <div data-testid="canvas-image">{alt}</div>,
}));

// Mock Material-UI komponenty
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Card: ({ children, onClick, ...props }: any) => <div data-testid="card" onClick={onClick} {...props}>{children}</div>,
    Box: ({ children, ...props }: any) => <div data-testid="box" {...props}>{children}</div>,
    CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
    Typography: ({ children, ...props }: any) => <div data-testid="typography" {...props}>{children}</div>,
    Avatar: ({ children, ...props }: any) => <div data-testid="avatar" {...props}>{children}</div>,
    IconButton: ({ children, onClick, ...props }: any) => <button data-testid="icon-button" onClick={onClick} {...props}>{children}</button>,
    Chip: ({ label, ...props }: any) => <div data-testid="chip" {...props}>{label}</div>,
    Stack: ({ children, ...props }: any) => <div data-testid="stack" {...props}>{children}</div>,
  };
});

// Mock ikony
jest.mock('@mui/icons-material/FavoriteBorder', () => ({
  __esModule: true,
  default: () => <div data-testid="favorite-border-icon" />,
}));

jest.mock('@mui/icons-material/Favorite', () => ({
  __esModule: true,
  default: () => <div data-testid="favorite-icon" />,
}));

describe('PhotoCard Component', () => {
  const mockPhoto = {
    id: 'test-id',
    photographer: 'Test Photographer',
    avatarUrl: '/api/profile-pictures/test-user',
    likes: 10,
    tags: ['tag1', 'tag2', 'tag3'],
    event: 'Test Event',
    date: '2023-01-01',
    isLikedByCurrentUser: false,
    photographerId: 'photographer-1',
    storageId: 'storage-1',
  };

  const mockClick = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Výchozí mock implementace
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
    (usePathname as jest.Mock).mockReturnValue('/fotogalerie');
    (useSearchParams as jest.Mock).mockReturnValue({
      toString: jest.fn().mockReturnValue(''),
    });
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
  });

  it('zobrazuje správně fotografii a metadata', () => {
    render(<PhotoCard photo={mockPhoto} />);
    
    // Kontrola, že se zobrazuje správný obsah
    expect(screen.getByTestId('canvas-image')).toBeInTheDocument();
    expect(screen.getByText('Test Photographer')).toBeInTheDocument();
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    
    // Kontrola, že se zobrazují tagy
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    expect(screen.getByText('tag3')).toBeInTheDocument();
  });

  it('volá onClick handler při kliknutí na kartu', () => {
    render(<PhotoCard photo={mockPhoto} onClick={mockClick} />);
    
    // Kliknutí na kartu
    fireEvent.click(screen.getByTestId('card'));
    
    // Ověření, že byl zavolán handleClick
    expect(mockClick).toHaveBeenCalledWith(mockPhoto);
  });

  it('zobrazuje ikonu prázdného srdce pro nepřihlášeného uživatele', () => {
    render(<PhotoCard photo={mockPhoto} />);
    
    // Ověříme, že se zobrazuje prázdné srdce
    expect(screen.getByTestId('favorite-border-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('favorite-icon')).not.toBeInTheDocument();
  });

  it('zobrazuje ikonu vyplněného srdce pro lajkovanou fotografii', () => {
    const likedPhoto = { ...mockPhoto, isLikedByCurrentUser: true };
    
    // Simulace přihlášeného uživatele
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'test-user-id',
        },
      },
      status: 'authenticated',
    });
    
    render(<PhotoCard photo={likedPhoto} />);
    
    // Ověříme, že se zobrazuje vyplněné srdce
    expect(screen.getByTestId('favorite-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('favorite-border-icon')).not.toBeInTheDocument();
  });

  it('volá likePhoto při kliknutí na ikonu srdce u nelajkované fotky', () => {
    // Simulace přihlášeného uživatele
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'test-user-id',
        },
      },
      status: 'authenticated',
    });
    
    render(<PhotoCard photo={mockPhoto} />);
    
    // Najdeme tlačítko lajku
    const likeButton = screen.getByTestId('icon-button');
    
    // Klikneme na tlačítko
    fireEvent.click(likeButton);
    
    // Ověříme, že byla zavolána akce pro lajkování
    expect(likePhoto).toHaveBeenCalledWith('test-id', 'test-user-id');
  });

  it('volá unlikePhoto při kliknutí na ikonu srdce u lajkované fotky', () => {
    const likedPhoto = { ...mockPhoto, isLikedByCurrentUser: true };
    
    // Simulace přihlášeného uživatele
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'test-user-id',
        },
      },
      status: 'authenticated',
    });
    
    render(<PhotoCard photo={likedPhoto} />);
    
    // Najdeme tlačítko lajku
    const likeButton = screen.getByTestId('icon-button');
    
    // Klikneme na tlačítko
    fireEvent.click(likeButton);
    
    // Ověříme, že byla zavolána akce pro odlajkování
    expect(unlikePhoto).toHaveBeenCalledWith('test-id', 'test-user-id');
  });

  it('zobrazuje zkrácení tagů, pokud je jich více než 3', () => {
    const photoWithManyTags = {
      ...mockPhoto,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5']
    };
    
    render(<PhotoCard photo={photoWithManyTags} />);
    
    // Zkontrolujeme, že se zobrazují první 3 tagy
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    expect(screen.getByText('tag3')).toBeInTheDocument();
    
    // Zkontrolujeme, že se zobrazuje informace o dalších tazích
    expect(screen.getByText('+2')).toBeInTheDocument();
  });
}); 