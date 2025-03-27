import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FotoGalleryClient from '../client';
import { useSession } from 'next-auth/react';
import * as photosActions from '@/app/actions/photos';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'test-user-id'
      }
    }
  }))
}));

// Mock server akcí
jest.mock('@/app/actions/photos', () => ({
  getPhotos: jest.fn().mockResolvedValue({
    photos: [
      { 
        id: '1', 
        photographer: 'Test Photographer',
        likes: 5,
        isLikedByCurrentUser: false,
        tags: ['test'],
        event: 'Test Event',
        date: '2024-01-01'
      }
    ],
    totalItems: 1,
    totalPages: 1
  }),
  likePhoto: jest.fn().mockResolvedValue({ success: true }),
  unlikePhoto: jest.fn().mockResolvedValue({ success: true }),
  getPhotoById: jest.fn().mockResolvedValue({
    id: '1',
    photographer: 'Test Photographer',
    likes: 5,
    isLikedByCurrentUser: false,
    tags: ['test'],
    event: 'Test Event',
    date: '2024-01-01'
  })
}));

describe('FotoGalleryClient - synchronizace lajků', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('aktualizuje stav galerie po lajkování fotky v modálním okně', async () => {
    const user = userEvent.setup();
    
    // Renderujeme komponentu
    render(<FotoGalleryClient />);
    
    // Počkáme na načtení dat
    await waitFor(() => {
      expect(screen.getByTestId('canvas-image')).toBeInTheDocument();
    });
    
    // Klikneme na fotku pro otevření modálního okna
    await user.click(screen.getByTestId('canvas-image'));
    
    // Počkáme na otevření modálního okna
    await waitFor(() => {
      expect(screen.getByTestId('photo-detail-modal')).toBeInTheDocument();
    });
    
    // Klikneme na tlačítko pro lajkování
    await user.click(screen.getByTestId('like-button'));
    
    // Ověříme, že byla zavolána akce pro lajkování
    expect(photosActions.likePhoto).toHaveBeenCalledWith('1', 'test-user-id');
    
    // Ověříme, že byly znovu načteny fotografie
    expect(photosActions.getPhotos).toHaveBeenCalled();
    
    // Počkáme na aktualizaci stavu
    await waitFor(() => {
      expect(screen.getByText('6')).toBeInTheDocument(); // 5 + 1 like
    });
  });

  it('aktualizuje stav galerie po odlajkování fotky v modálním okně', async () => {
    const user = userEvent.setup();
    
    // Nastavíme mock pro fotku, která je již lajknutá
    (photosActions.getPhotos as jest.Mock).mockResolvedValueOnce({
      photos: [
        { 
          id: '1', 
          photographer: 'Test Photographer',
          likes: 6,
          isLikedByCurrentUser: true,
          tags: ['test'],
          event: 'Test Event',
          date: '2024-01-01'
        }
      ],
      totalItems: 1,
      totalPages: 1
    });
    
    // Renderujeme komponentu
    render(<FotoGalleryClient />);
    
    // Počkáme na načtení dat
    await waitFor(() => {
      expect(screen.getByTestId('canvas-image')).toBeInTheDocument();
    });
    
    // Klikneme na fotku pro otevření modálního okna
    await user.click(screen.getByTestId('canvas-image'));
    
    // Počkáme na otevření modálního okna
    await waitFor(() => {
      expect(screen.getByTestId('photo-detail-modal')).toBeInTheDocument();
    });
    
    // Klikneme na tlačítko pro odlajkování
    await user.click(screen.getByTestId('like-button'));
    
    // Ověříme, že byla zavolána akce pro odlajkování
    expect(photosActions.unlikePhoto).toHaveBeenCalledWith('1', 'test-user-id');
    
    // Ověříme, že byly znovu načteny fotografie
    expect(photosActions.getPhotos).toHaveBeenCalled();
    
    // Počkáme na aktualizaci stavu
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument(); // 6 - 1 like
    });
  });
}); 