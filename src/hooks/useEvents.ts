import { useCallback, useEffect, useState } from 'react';
import { prepareApiUrl, endpoints } from '@/lib/api';
import { Photo } from './usePhotoItems';
import { Event, PhotoDetail } from '@/lib/api-helpers';

interface UseEventsParams {
  query?: string;
  type?: 'all' | 'upcoming' | 'past';
  limit?: number;
  page?: number;
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
  type = 'all',
  limit = 10,
  page = 1
}: UseEventsParams = {}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  // Funkce pro načtení akcí
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      // Vytvoření filtrů
      const filters: Record<string, string> = {};
      
      // Filtrování dle query - mapujeme na name parametr pro vyhledávání
      if (query) {
        filters.name = query;
      }
      
      // Filtrování dle typu (nadcházející/minulé)
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const sortBy = 'date';
      let sortOrder: 'asc' | 'desc' = 'desc';
      
      if (type === 'upcoming') {
        filters.date_after = currentDate;
        sortOrder = 'asc';
      } else if (type === 'past') {
        filters.date_before = currentDate;
        sortOrder = 'desc';
      }
      
      // Připravíme parametry včetně stránkování
      const params = prepareApiUrl(endpoints.events, {
        page,
        limit,
        sortBy,
        sortOrder,
        filters
      });
      
      // Načtení dat
      const url = `${endpoints.events}?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Chyba při načítání akcí: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Chyba při načítání akcí');
      }
      
      setEvents(result.data || []);
      setTotalItems(result.pagination?.totalItems || 0);
    } catch {
      console.error('Chyba při načítání akcí:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [query, type, page, limit]);
  
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
      const eventUrl = `${endpoints.events}?id=${id}`;
      const eventResponse = await fetch(eventUrl);
      
      if (!eventResponse.ok) {
        throw new Error(`Chyba při načítání akce: ${eventResponse.statusText}`);
      }
      
      const eventResult = await eventResponse.json();
      
      if (!eventResult.success || !eventResult.data || eventResult.data.length === 0) {
        throw new Error('Akce nebyla nalezena');
      }
      
      setEvent(eventResult.data[0]);
      
      // Potom získáme fotografie z této akce
      const params = prepareApiUrl(endpoints.photoDetails, {
        page,
        limit,
        filters: {
          event_id: id
        }
      });
      
      // Načtení fotografií
      const photosUrl = `${endpoints.photoDetails}?${params.toString()}`;
      const photosResponse = await fetch(photosUrl);
      
      if (!photosResponse.ok) {
        throw new Error(`Chyba při načítání fotografií: ${photosResponse.statusText}`);
      }
      
      const photosResult = await photosResponse.json();
      
      if (!photosResult.success) {
        throw new Error(photosResult.message || 'Chyba při načítání fotografií');
      }
      
      const photosData = photosResult.data || [];
      const pagination = photosResult.pagination || {};
      
      // Transformace dat
      const transformedPhotos = photosData.map((item: PhotoDetail) => ({
        ...item,
        imageUrl: item.photo_id ? `/api/photos/files/${item.photo_id}` : undefined,
        thumbnailUrl: item.thumbnail_id ? `/api/photos/thumbnails/${item.thumbnail_id}` : undefined
      }));
      
      setPhotos(transformedPhotos);
      setTotalPhotos(pagination.totalItems || 0);
      setTotalPages(pagination.totalPages || 0);
    } catch {
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