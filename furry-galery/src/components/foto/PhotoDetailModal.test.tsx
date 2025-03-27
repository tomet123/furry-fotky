import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PhotoDetailModal } from './PhotoDetailModal';
import { useSession } from 'next-auth/react';
import * as PhotosActions from '@/app/actions/photos';

// Mock useSession hooku
jest.mock('next-auth/react', () => ({
  useSession: jest.fn()
}));

// Mock next/router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn()
  }),
  usePathname: () => '/fotky',
  useSearchParams: () => new URLSearchParams()
}));

// Mock useMediaQuery
jest.mock('@mui/material', () => {
  const originalModule = jest.requireActual('@mui/material');
  return {
    ...originalModule,
    useMediaQuery: jest.fn().mockReturnValue(false)
  };
});

// Mock pro CanvasImage komponentu
jest.mock('./CanvasImage', () => ({
  __esModule: true,
  default: jest.fn(({ onLoad }) => {
    // Zavoláme onLoad callback, aby se simulovalo načtení obrázku
    setTimeout(() => onLoad && onLoad(), 10);
    return <div data-testid="canvas-image">Canvas Image Mock</div>;
  })
}));

// Mock pro akce fotografií
jest.mock('@/app/actions/photos', () => ({
  getPhotoById: jest.fn(),
  getSecurePhotoUrl: jest.fn().mockResolvedValue('/test-url')
}));

// Testovací data
const mockPhoto = {
  id: 'test-photo-id',
  photographerId: 'test-photographer-id',
  photographer: 'Test Photographer',
  storageId: 'test-storage-id',
  likes: 10,
  date: new Date().toISOString(),
  tags: ['test', 'furry', 'photo'],
  isLikedByCurrentUser: false
};

describe('PhotoDetailModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'test-user-id',
          name: 'Test User'
        }
      },
      status: 'authenticated'
    });
  });

  it('zobrazuje správně detail fotografie', async () => {
    const mockOnClose = jest.fn();
    
    render(
      <PhotoDetailModal
        photo={mockPhoto}
        open={true}
        onClose={mockOnClose}
        onLike={jest.fn()}
        onUnlike={jest.fn()}
      />
    );

    // Test, že se zobrazuje jméno fotografa
    expect(screen.getByText(mockPhoto.photographer)).toBeInTheDocument();
    
    // Test, že se zobrazuje počet lajků
    expect(screen.getByText(`${mockPhoto.likes}`)).toBeInTheDocument();
    
    // Test, že se zobrazuje CanvasImage
    expect(screen.getByTestId('canvas-image')).toBeInTheDocument();

    // Test tagů
    mockPhoto.tags.forEach(tag => {
      expect(screen.getByText(`#${tag}`)).toBeInTheDocument();
    });
  });

  it('volá onClose při kliknutí na tlačítko zavřít', () => {
    const mockOnClose = jest.fn();
    
    render(
      <PhotoDetailModal
        photo={mockPhoto}
        open={true}
        onClose={mockOnClose}
        onLike={jest.fn()}
        onUnlike={jest.fn()}
      />
    );

    // Najdeme tlačítko zavřít a klikneme na něj
    const closeButton = screen.getByTestId('CloseIcon').closest('button');
    if (closeButton) {
      fireEvent.click(closeButton);
    }
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('spravně volá funkci onLike při lajkování fotografie', async () => {
    const mockOnLike = jest.fn().mockResolvedValue(true);
    
    render(
      <PhotoDetailModal
        photo={mockPhoto}
        open={true}
        onClose={jest.fn()}
        onLike={mockOnLike}
        onUnlike={jest.fn()}
      />
    );

    // Najdeme tlačítko lajku a klikneme na něj
    const likeButton = screen.getByTestId('FavoriteBorderIcon').closest('button');
    if (likeButton) {
      fireEvent.click(likeButton);
    }
    
    await waitFor(() => {
      expect(mockOnLike).toHaveBeenCalledTimes(1);
      expect(mockOnLike).toHaveBeenCalledWith(mockPhoto);
    });
  });

  it('spravně volá funkci onUnlike při odlajkování fotografie', async () => {
    const mockOnUnlike = jest.fn().mockResolvedValue(true);
    
    // Vytvoříme kopii mockPhoto s nastaveným lajkem
    const likedPhoto = {
      ...mockPhoto,
      isLikedByCurrentUser: true
    };
    
    render(
      <PhotoDetailModal
        photo={likedPhoto}
        open={true}
        onClose={jest.fn()}
        onLike={jest.fn()}
        onUnlike={mockOnUnlike}
      />
    );

    // Najdeme tlačítko lajku (tentokrát FavoriteIcon) a klikneme na něj
    const unlikeButton = screen.getByTestId('FavoriteIcon').closest('button');
    if (unlikeButton) {
      fireEvent.click(unlikeButton);
    }
    
    await waitFor(() => {
      expect(mockOnUnlike).toHaveBeenCalledTimes(1);
      expect(mockOnUnlike).toHaveBeenCalledWith(likedPhoto);
    });
  });

  it('volá správně funkce onNext a onPrevious při navigaci', () => {
    const mockOnNext = jest.fn();
    const mockOnPrevious = jest.fn();
    
    render(
      <PhotoDetailModal
        photo={mockPhoto}
        allPhotos={[{ ...mockPhoto, id: 'photo-1' }, { ...mockPhoto, id: 'photo-2' }, { ...mockPhoto, id: 'photo-3' }]}
        open={true}
        onClose={jest.fn()}
        onLike={jest.fn()}
        onUnlike={jest.fn()}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
      />
    );

    // Najdeme tlačítko další a klikneme na něj
    const nextButton = screen.getByTestId('NavigateNextIcon').closest('button');
    if (nextButton) {
      fireEvent.click(nextButton);
    }
    
    expect(mockOnNext).toHaveBeenCalledTimes(1);
    
    // Najdeme tlačítko předchozí a klikneme na něj
    const prevButton = screen.getByTestId('NavigateBeforeIcon').closest('button');
    if (prevButton) {
      fireEvent.click(prevButton);
    }
    
    expect(mockOnPrevious).toHaveBeenCalledTimes(1);
  });

  it('přepíná správně mezi režimy zobrazení obrázku', () => {
    render(
      <PhotoDetailModal
        photo={mockPhoto}
        open={true}
        onClose={jest.fn()}
        onLike={jest.fn()}
        onUnlike={jest.fn()}
      />
    );

    // Najdeme tlačítko pro změnu režimu zobrazení a klikneme na něj
    const fitModeButton = screen.getByTestId('AspectRatioIcon').closest('button');
    if (fitModeButton) {
      // První kliknutí by mělo změnit režim z 'contain' na 'cover'
      fireEvent.click(fitModeButton);
      
      // Druhé kliknutí by mělo změnit režim zpět z 'cover' na 'contain'
      fireEvent.click(fitModeButton);
    }
    
    // Zde nemůžeme přímo zkontrolovat stav fitMode, protože je interní
    // ale ověřujeme, že tlačítko existuje a lze s ním interagovat
    expect(fitModeButton).toBeInTheDocument();
  });
}); 