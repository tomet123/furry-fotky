'use client';

import { useState, useEffect, useCallback } from 'react';
import { Photographer, PhotographerFilters, getPhotographers, getPhotographerById } from '../actions/photographers';

// Rozšíření typů o filtrování podle role uživatele
interface PhotographersFilters extends PhotographerFilters {
  page: number;
  userType?: 'all' | 'photographers' | 'organizers';
}

interface PhotographersState {
  photographers: Photographer[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  filters: PhotographersFilters;
}

// Výchozí hodnoty filtrů pro photographers
const defaultFilters: PhotographersFilters = {
  query: '',
  sortBy: 'username',
  page: 1,
  limit: 10,
  userType: 'all'
};

export function usePhotographers(initialFilters?: Partial<PhotographersFilters>) {
  // Výchozí stav
  const [state, setState] = useState<PhotographersState>({
    photographers: [],
    loading: true,
    error: null,
    totalPages: 1,
    filters: { ...defaultFilters, ...initialFilters }
  });

  // Funkce pro načtení fotografů
  const fetchPhotographers = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { photographers, totalPages } = await getPhotographers({
        query: state.filters.query,
        sortBy: state.filters.sortBy,
        page: state.filters.page,
        limit: state.filters.limit,
        userType: state.filters.userType
      });
      
      setState(prev => ({
        ...prev,
        photographers,
        totalPages,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Došlo k chybě při načítání fotografů'
      }));
    }
  }, [state.filters]);

  // Načtení fotografů při změně filtrů
  useEffect(() => {
    fetchPhotographers();
  }, [fetchPhotographers]);

  // Funkce pro změnu stránky
  const setPage = useCallback((page: number) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, page }
    }));
  }, []);

  // Funkce pro aktualizaci filtrů
  const updateFilters = useCallback((newFilters: Partial<PhotographersFilters>) => {
    setState(prev => {
      // Pokud měníme jiný filtr než stránku, resetujeme stránku na 1
      const shouldResetPage = Object.keys(newFilters).some(
        key => key !== 'page' && key in prev.filters
      );
      
      return {
        ...prev,
        filters: {
          ...prev.filters,
          ...(shouldResetPage ? { page: 1 } : {}),
          ...newFilters
        }
      };
    });
  }, []);

  return {
    photographers: state.photographers,
    loading: state.loading,
    error: state.error,
    totalPages: state.totalPages,
    filters: state.filters,
    setPage,
    updateFilters,
    refresh: fetchPhotographers
  };
}

export function usePhotographer(id: string) {
  const [photographer, setPhotographer] = useState<Photographer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPhotographer() {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getPhotographerById(id);
        setPhotographer(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError(error instanceof Error ? error.message : 'Došlo k chybě při načítání fotografa');
      }
    }

    fetchPhotographer();
  }, [id]);

  return { photographer, loading, error };
} 