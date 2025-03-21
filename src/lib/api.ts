// URL pro Next.js API
import { JWT_STORAGE_KEY, API_URL } from './constants';

// Endpointy pro API
export const endpoints = {
  // Základní endpointy pro entity
  photos: `${API_URL}/photos`,
  photoDetails: `${API_URL}/photos/details`,
  photographers: `${API_URL}/photographers`,
  photographerStats: `${API_URL}/photographers/stats`,
  events: `${API_URL}/events`,
  tags: `${API_URL}/tags`,
  photoTags: `${API_URL}/photo-tags`,
  
  // Endpointy pro fotografie
  photoFiles: (id: number) => `${API_URL}/photos/files/${id}`,
  photoThumbnails: (id: number) => `${API_URL}/photos/thumbnails/${id}`,

  // Autentizační endpointy
  register: `${API_URL}/auth/register`,
  login: `${API_URL}/auth/login`,
  currentUser: `${API_URL}/auth/me`,
  users: `${API_URL}/users`,
};

/**
 * Pomocná funkce pro přidání autorizačního tokenu do hlavičky
 */
export function getAuthorizationHeader(): HeadersInit | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const token = localStorage.getItem(JWT_STORAGE_KEY);
  return token ? { 'Authorization': `Bearer ${token}` } : undefined;
}

/**
 * Parametry URL pro API dotazy
 */
export interface ApiUrlParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, string | string[]>;
}

/**
 * Připraví parametry pro API URL
 */
export function prepareApiUrl(endpoint: string, params: ApiUrlParams): URLSearchParams {
  const searchParams = new URLSearchParams();
  
  // Stránkování
  if (params.page) {
    searchParams.set('page', params.page.toString());
  }
  
  if (params.limit) {
    searchParams.set('limit', params.limit.toString());
  }
  
  // Řazení
  if (params.sortBy) {
    searchParams.set('sortBy', params.sortBy);
  }
  
  if (params.sortOrder) {
    searchParams.set('sortOrder', params.sortOrder);
  }
  
  // Filtry
  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(val => {
          searchParams.append(key, val);
        });
      } else {
        searchParams.set(key, value);
      }
    });
  }
  
  return searchParams;
}

/**
 * Kompatibilní funkce pro formátování URL s PostgREST parametry
 * (Pro zpětnou kompatibilitu)
 */
// export function preparePostgRESTUrl(endpoint: string, params: ApiUrlParams): URLSearchParams {
//   return prepareApiUrl(endpoint, params);
// }

/**
 * Získá celkový počet záznamů z API
 */
export async function getTotalCount(endpoint: string, params: URLSearchParams): Promise<number> {
  // Kopírujeme parametry, ale změníme limit na 1, protože nás zajímá jen celkový počet
  const countParams = new URLSearchParams(params);
  countParams.set('limit', '1');
  
  try {
    const response = await fetch(`${endpoint}?${countParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Chyba při získávání počtu záznamů: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Nové API vrací data ve struktuře s pagination
    if (data.pagination && typeof data.pagination.totalItems === 'number') {
      return data.pagination.totalItems;
    }
    
    // Fallback, pokud by struktura odpovědi byla jiná
    return 0;
  } catch (error) {
    console.error('Chyba při získávání počtu záznamů:', error);
    return 0;
  }
}

/**
 * Zpracuje odpověď z API
 */
export async function processApiResponse<T>(response: Response): Promise<T[]> {
  if (!response.ok) {
    throw new Error(`API chyba: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Nové API vrací data v poli data
  if (data.data && Array.isArray(data.data)) {
    return data.data;
  }
  
  // Fallback, pokud by struktura odpovědi byla jiná
  if (Array.isArray(data)) {
    return data;
  }
  
  return [];
}

/**
 * Funkce pro volání API s autentizací
 * 
 * @param endpoint URL endpoint pro volání API
 * @param options Další fetch options
 * @returns Promise s odpovědí v JSON formátu
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // Příprava URL - zajištění správného formátu
  const url = endpoint.startsWith('http') ? endpoint : `${process.env.NEXT_PUBLIC_API_URL || ''}${endpoint}`;

  // Nastavení defaultních headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // TODO: Přidat autentizační token, např. z localStorage nebo cookie, pokud bude implementována autentizace
  // const token = localStorage.getItem('authToken');
  // if (token) {
  //   headers.Authorization = `Bearer ${token}`;
  // }

  // Provedení fetch požadavku
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Zpracování odpovědi
  const data = await response.json();
  
  // Vrácení zpracované odpovědi
  return data;
} 