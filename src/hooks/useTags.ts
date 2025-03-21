import { useState, useEffect, useCallback } from 'react';
import { endpoints } from '@/lib/postgrest';

/**
 * Hook pro získání seznamu všech dostupných tagů
 */
export function useTags() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Funkce pro načtení tagů
  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(endpoints.tags);
      
      if (!response.ok) {
        throw new Error(`Chyba při načítání tagů: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTags(data.map((tag: { name: string }) => tag.name));
    } catch (err) {
      console.error('Chyba při načítání tagů:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Načtení tagů při prvním renderování
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);
  
  return {
    tags,
    loading,
    error,
    refreshTags: fetchTags
  };
} 