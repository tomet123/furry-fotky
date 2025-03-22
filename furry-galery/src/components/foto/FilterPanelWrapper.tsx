'use client';

import { useCallback } from 'react';
import { FilterPanel } from './FilterPanel';
import { useRouter } from 'next/navigation';

interface FilterPanelWrapperProps {
  initialEvent?: string;
  initialPhotographer?: string;
  initialTags?: string[];
  initialSortBy?: 'newest' | 'oldest' | 'most_liked';
}

/**
 * Klientský wrapper pro FilterPanel, který obsahuje logiku pro změnu filtrů
 */
export function FilterPanelWrapper(props: FilterPanelWrapperProps) {
  const router = useRouter();
  
  // Funkce pro zpracování změny filtrů
  const handleFilterChange = useCallback((filters: {
    event: string | null;
    photographer: string | null;
    tags: string[];
    sortBy: string;
  }) => {
    // Zde vytvoříme novou URL s aktualizovanými filtry
    const params = new URLSearchParams();
    
    // Přidáme filtry do URL pouze pokud nejsou prázdné
    if (filters.event) {
      params.set('event', filters.event);
    }
    
    if (filters.photographer) {
      params.set('photographer', filters.photographer);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      params.set('tags', filters.tags.join(','));
    }
    
    if (filters.sortBy && filters.sortBy !== 'newest') {
      params.set('sortBy', filters.sortBy);
    }
    
    // Reset stránkování při změně filtrů
    params.delete('page');
    
    // Navigace na novou URL s filtry
    const newPath = `/fotogalerie${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newPath);
  }, [router]);
  
  return (
    <FilterPanel 
      {...props}
      onFilterChange={handleFilterChange} 
    />
  );
} 