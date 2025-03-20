import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { Event } from '@/lib/mock-db/events';  // Importujeme interface z mock-db

interface UseEventsParams {
  query?: string;
  type?: 'all' | 'upcoming' | 'past';
}

interface UseEventDetailParams {
  id: string;
  page?: number;
  limit?: number;
}

/**
 * Hook pro získání seznamu akcí
 */
export function useEvents({
  query,
  type
}: UseEventsParams = {}) {
  const { get, loading, error } = useApi();
  const [events, setEvents] = useState<Event[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  // Funkce pro načtení akcí
  const fetchEvents = useCallback(async () => {
    const response = await get<Event[]>('/api/events', {
      query,
      type
    });
    
    if (response) {
      setEvents(response.data);
      setTotalItems(response.meta?.total || 0);
    }
  }, [get, query, type]);
  
  // Načtení akcí při změně parametrů
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  
  return {
    events,
    loading,
    error,
    totalItems,
    refreshEvents: fetchEvents
  };
}

/**
 * Hook pro získání nadcházejících akcí
 */
export function useUpcomingEvents({
  query
}: { query?: string } = {}) {
  return useEvents({ query, type: 'upcoming' });
}

/**
 * Hook pro získání minulých akcí
 */
export function usePastEvents({
  query
}: { query?: string } = {}) {
  return useEvents({ query, type: 'past' });
}

/**
 * Hook pro získání detailu akce a fotografií z této akce
 */
export function useEventDetail({
  id,
  page = 1,
  limit = 12
}: UseEventDetailParams) {
  const { get, loading, error } = useApi();
  const [event, setEvent] = useState<Event | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [totalPhotos, setTotalPhotos] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  
  // Funkce pro načtení detailu akce
  const fetchEventDetail = useCallback(async () => {
    const response = await get<Event & { photos: { data: any[], meta: { total: number, totalPages: number } } }>(`/api/events/${id}`, {
      page,
      limit
    });
    
    if (response) {
      const { photos, ...eventData } = response.data;
      
      setEvent(eventData);
      
      if (photos) {
        setPhotos(photos.data);
        setTotalPhotos(photos.meta.total);
        setTotalPages(photos.meta.totalPages);
      }
    }
  }, [get, id, page, limit]);
  
  // Načtení detailu akce při změně parametrů
  useEffect(() => {
    fetchEventDetail();
  }, [fetchEventDetail]);
  
  return {
    event,
    photos,
    loading,
    error,
    totalPhotos,
    totalPages,
    refreshEventDetail: fetchEventDetail
  };
} 