import { useState, useEffect, useCallback } from 'react';
import { endpoints } from '@/lib/api';

export interface PhotographerStats {
  photographer_id?: number;
  photographer_name?: string;
  photographer_bio?: string;
  photographer_avatar?: string;
  total_likes?: number;
  event_count?: number;
  photo_count?: number;
}

/**
 * Hook pro získání statistik fotografů
 */
export function usePhotographerStats(id?: string) {
  const [stats, setStats] = useState<PhotographerStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchStats = useCallback(async () => {
    let isMounted = true;
    setLoading(true);
    
    try {
      // Připravení URL s ID, pokud bylo zadáno
      let url = endpoints.photographerStats;
      if (id) {
        url += `?id=${id}`;
      }
      
      // Načtení dat
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Chyba při načítání statistik fotografů: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Chyba při načítání statistik fotografů');
      }
      
      // Transformace dat do správného formátu
      interface StatData {
        photographer_id: number;
        photographer_name: string;
        photographer_bio: string | null;
        photographer_avatar: string | null;
        photo_count: number;
        total_likes: number;
        event_count: number;
      }
      
      const transformedStats = (result.data || []).map((stat: StatData) => ({
        photographer_id: stat.photographer_id,
        photographer_name: stat.photographer_name,
        photographer_bio: stat.photographer_bio,
        photographer_avatar: stat.photographer_avatar,
        photo_count: stat.photo_count,
        total_likes: stat.total_likes,
        event_count: stat.event_count
      }));
      
      if (isMounted) {
        setStats(transformedStats);
        setLoading(false);
      }
    } catch {
      console.error('Chyba při načítání statistik fotografů:', err);
      if (isMounted) {
        setError((err as Error).message);
        setLoading(false);
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [id]);
  
  // Načtení statistik při změně ID
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  
  return { stats, loading, error, refreshStats: fetchStats };
} 