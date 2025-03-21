import { useState, useEffect, useCallback } from 'react';
import { endpoints, preparePostgRESTUrl, getTotalCount } from '@/lib/postgrest';
import { Photo } from './usePhotoItems';

export interface Event {
  id: number;
  name: string;
  description?: string;
  location?: string;
  date: string;
  photos_count?: number;
}

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
  type = 'all'
}: UseEventsParams = {}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  // Funkce pro načtení akcí
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      // Vytvoření parametrů pro PostgREST
      const params = new URLSearchParams();
      
      // Filtrování dle query
      if (query) {
        params.append('name', `ilike.%${query}%`);
      }
      
      // Filtrování dle typu (nadcházející/minulé)
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (type === 'upcoming') {
        params.append('date', `gte.${currentDate}`);
        params.append('order', 'date.asc');
      } else if (type === 'past') {
        params.append('date', `lt.${currentDate}`);
        params.append('order', 'date.desc');
      } else {
        params.append('order', 'date.desc');
      }
      
      // Získání celkového počtu záznamů
      const total = await getTotalCount(endpoints.events, params);
      
      // Načtení dat
      const url = `${endpoints.events}?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Chyba při načítání akcí: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setEvents(data);
      setTotalItems(total);
    } catch (err) {
      console.error('Chyba při načítání akcí:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [query, type]);
  
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
  const [event, setEvent] = useState<Event | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPhotos, setTotalPhotos] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  
  // Funkce pro načtení detailu akce
  const fetchEventDetail = useCallback(async () => {
    setLoading(true);
    try {
      // Nejprve získáme akci
      const eventUrl = `${endpoints.events}?id=eq.${id}`;
      const eventResponse = await fetch(eventUrl);
      
      if (!eventResponse.ok) {
        throw new Error(`Chyba při načítání akce: ${eventResponse.statusText}`);
      }
      
      const events = await eventResponse.json();
      
      if (events.length === 0) {
        throw new Error('Akce nebyla nalezena');
      }
      
      setEvent(events[0]);
      
      // Potom získáme fotografie z této akce
      const params = preparePostgRESTUrl(endpoints.photoDetails, {
        page,
        limit,
        filters: {
          event: events[0].name
        }
      });
      
      // Získání celkového počtu fotografií
      const total = await getTotalCount(endpoints.photoDetails, params);
      
      // Načtení fotografií
      const photosUrl = `${endpoints.photoDetails}?${params.toString()}`;
      const photosResponse = await fetch(photosUrl);
      
      if (!photosResponse.ok) {
        throw new Error(`Chyba při načítání fotografií: ${photosResponse.statusText}`);
      }
      
      const photosData = await photosResponse.json();
      
      setPhotos(photosData);
      setTotalPhotos(total);
      setTotalPages(Math.ceil(total / limit));
    } catch (err) {
      console.error('Chyba při načítání detailu akce:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id, page, limit]);
  
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