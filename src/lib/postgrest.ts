// URL pro Next.js API
export const API_URL = '/api';

// Endpointy pro API
export const endpoints = {
  // Základní endpointy pro entity
  photos: `${API_URL}/photos`,
  photoDetails: `${API_URL}/photos/details`,
  photographers: `${API_URL}/photographers`,
  events: `${API_URL}/events`,
  tags: `${API_URL}/tags`,
  photoTags: `${API_URL}/photo-tags`,
  
  // Endpointy pro fotografie
  photoFiles: `${API_URL}/photos/files`,
  photoThumbnails: `${API_URL}/photos/thumbnails`,

  // Autentizační endpointy
  register: `${API_URL}/auth/register`,
  login: `${API_URL}/auth/login`,
  currentUser: `${API_URL}/auth/me`,
  users: `${API_URL}/users`,
};

// Klíč pro uložení JWT tokenu v localStorage
export const JWT_STORAGE_KEY = 'furry_fotky_auth_token';

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
 * Pomocná funkce pro přípravu URL s filtry
 */
export function prepareApiUrl(
  baseUrl: string,
  options: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, string | string[]>;
  } = {}
): string {
  // Vytvoříme URLSearchParams pro práci s parametry
  const params = new URLSearchParams();
  
  // Stránkování
  if (options.page) {
    params.append('page', options.page.toString());
  }
  
  if (options.limit) {
    params.append('limit', options.limit.toString());
  }
  
  // Řazení
  if (options.sortBy) {
    params.append('sortBy', options.sortBy);
    params.append('sortOrder', options.sortOrder || 'asc');
  }
  
  // Filtry
  if (options.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Pro pole hodnot použijeme více parametrů se stejným názvem
        value.forEach(v => {
          if (v) params.append(key, v);
        });
      } else if (value) {
        params.append(key, value);
      }
    });
  }
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Získá celkový počet záznamů z HEAD požadavku
 */
export async function getTotalCount(url: string, params: URLSearchParams): Promise<number> {
  // Vytvoříme kopii parametrů pro počítání
  const countParams = new URLSearchParams(params);
  
  // Odstraníme limit a offset, protože chceme celkový počet
  countParams.delete('limit');
  countParams.delete('offset');
  
  // Sestavíme URL pro počítání
  const countUrl = `${url}${countParams.toString() ? '?' + countParams.toString() : ''}`;
  
  // Použijeme HEAD request pro získání počtu
  const response = await fetch(countUrl, {
    method: 'HEAD',
  });
  
  // Získáme počet z hlavičky Content-Range
  const contentRange = response.headers.get('Content-Range');
  if (contentRange) {
    // Formát Content-Range je například "0-9/42", kde 42 je celkový počet
    const totalPart = contentRange.split('/')[1];
    
    // Pokud je celkový počet hvězdička, musíme získat skutečný počet pomocí GET požadavku
    if (totalPart === '*') {
      // Pošleme GET požadavek pro získání všech záznamů
      const getResponse = await fetch(countUrl);
      if (getResponse.ok) {
        const data = await getResponse.json();
        // Vrátíme délku pole jako celkový počet
        return Array.isArray(data) ? data.length : 0;
      }
      return 0;
    }
    
    return parseInt(totalPart, 10);
  }
  
  return 0;
} 