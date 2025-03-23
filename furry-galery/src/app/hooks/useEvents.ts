'use client';

import { useState, useEffect, useCallback } from 'react';
import { getEvents, getEventById, Event, EventFilters } from '@/app/actions/events';

// Typ pro stav použitý v useEvents
export type EventsState = {
  events: Event[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  totalPages: number;
}

// Výchozí hodnoty filtrů
const DEFAULT_FILTERS: EventFilters = {
  query: '',
  location: '',
  upcoming: true,
  past: false,
  sortBy: 'newest',
  page: 1,
  limit: 10
};

/**
 * Hook pro práci s událostmi
 * Načte události podle filtrů
 */
export function useEvents(initialFilters: Partial<EventFilters> = {}) {
  // Stav pro události a metadata
  const [state, setState] = useState<EventsState>({
    events: [],
    loading: true,
    error: null,
    totalItems: 0,
    totalPages: 0
  });
  
  // Stav pro filtry
  const [filters, setFilters] = useState<EventFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters
  });
  
  // Funkce pro načtení událostí
  const fetchEvents = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await getEvents(filters);
      setState({
        events: result.events,
        loading: false,
        error: null,
        totalItems: result.totalItems,
        totalPages: result.totalPages
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Nepodařilo se načíst události',
        events: []
      }));
    }
  }, [filters]);
  
  // Načtení událostí při změně filtrů
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  
  // Funkce pro změnu stránky
  const setPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);
  
  // Funkce pro aktualizaci filtrů
  const updateFilters = useCallback((newFilters: Partial<EventFilters>) => {
    setFilters(prev => {
      // Pokud se mění jiný filtr než stránka, resetujeme stránku na 1
      const isPageResetNeeded = Object.keys(newFilters).some(key => key !== 'page');
      return {
        ...prev,
        ...newFilters,
        page: isPageResetNeeded ? 1 : newFilters.page || prev.page
      };
    });
  }, []);
  
  // Vrácení stavu a funkcí
  return {
    ...state,
    filters,
    setPage,
    updateFilters,
    refreshEvents: fetchEvents
  };
}

/**
 * Hook pro práci s jednou událostí
 * Načte detail události podle ID
 */
export function useEvent(eventId: string) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchEvent = useCallback(async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getEventById(eventId);
      setEvent(result);
      setLoading(false);
    } catch (err) {
      setError('Nepodařilo se načíst detail události');
      setLoading(false);
    }
  }, [eventId]);
  
  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);
  
  return {
    event,
    loading,
    error,
    refreshEvent: fetchEvent
  };
} 