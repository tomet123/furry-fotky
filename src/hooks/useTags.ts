import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';

/**
 * Hook pro získání seznamu všech dostupných tagů
 */
export function useTags() {
  const { get, loading, error } = useApi();
  const [tags, setTags] = useState<string[]>([]);
  
  // Funkce pro načtení tagů
  const fetchTags = useCallback(async () => {
    const response = await get<string[]>('/api/tags');
    
    if (response) {
      setTags(response.data);
    }
  }, [get]);
  
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