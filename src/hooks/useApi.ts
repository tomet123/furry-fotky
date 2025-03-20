import { useState, useCallback } from 'react';

// Základní rozhraní pro odpověď
interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  error?: string;
}

// Obecný hook pro volání API
export function useApi() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Obecná funkce pro volání API
  const fetchApi = useCallback(async <T>(
    endpoint: string, 
    options?: RequestInit
  ): Promise<ApiResponse<T> | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options
      });
      
      // Kontrola, zda server odpověděl úspěšně
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP chyba: ${response.status}`);
      }
      
      const result = await response.json();
      setLoading(false);
      return result;
    } catch (err) {
      setLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Neznámá chyba při komunikaci s API';
      setError(errorMessage);
      console.error('API chyba:', errorMessage);
      return null;
    }
  }, []);

  // GET metoda
  const get = useCallback(<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<T> | null> => {
    // Zpracování query parametrů
    let url = endpoint;
    
    if (params) {
      const queryParams = new URLSearchParams();
      
      // Přidání pouze definovaných parametrů
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
      
      // Přidání query string k URL, pokud nějaké parametry existují
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    return fetchApi<T>(url, { method: 'GET' });
  }, [fetchApi]);

  // POST metoda
  const post = useCallback(<T, D = any>(endpoint: string, data?: D): Promise<ApiResponse<T> | null> => {
    return fetchApi<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }, [fetchApi]);

  // PUT metoda
  const put = useCallback(<T, D = any>(endpoint: string, data?: D): Promise<ApiResponse<T> | null> => {
    return fetchApi<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }, [fetchApi]);

  // DELETE metoda
  const del = useCallback(<T>(endpoint: string): Promise<ApiResponse<T> | null> => {
    return fetchApi<T>(endpoint, { method: 'DELETE' });
  }, [fetchApi]);

  return {
    loading,
    error,
    get,
    post,
    put,
    del
  };
} 