// URL pro PostgREST API přes Next.js proxy
export const POSTGREST_URL = '/api';

// Endpointy pro PostgREST API
export const endpoints = {
  // Základní endpointy pro entity
  photos: `${POSTGREST_URL}/photos`,
  photoDetails: `${POSTGREST_URL}/photo_details`,
  photographers: `${POSTGREST_URL}/photographers`,
  events: `${POSTGREST_URL}/events`,
  tags: `${POSTGREST_URL}/tags`,
  photoTags: `${POSTGREST_URL}/photo_tags`,
  
  // Endpointy pro soubory ve storage schématu
  photoFiles: `${POSTGREST_URL}/storage/photo_files`,
  photoThumbnails: `${POSTGREST_URL}/storage/photo_thumbnails`,


};


/**
 * Pomocná funkce pro přípravu PostgREST URL s filtry
 */
export function preparePostgRESTUrl(
  baseUrl: string,
  options: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, string | string[]>;
  } = {}
): URLSearchParams {
  // Vytvoříme URLSearchParams pro práci s parametry
  const params = new URLSearchParams();
  
  // Stránkování
  if (options.page && options.limit) {
    const offset = (options.page - 1) * options.limit;
    params.append('limit', options.limit.toString());
    params.append('offset', offset.toString());
  } else if (options.limit) {
    params.append('limit', options.limit.toString());
  }
  
  // Řazení
  if (options.sortBy) {
    const order = options.sortOrder || 'asc';
    params.append('order', `${options.sortBy}.${order}`);
  }
  
  // Filtry
  if (options.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // PostgREST používá operátor in pro pole hodnot
        // ?column=in.(val1,val2,val3)
        params.append(key, `in.(${value.join(',')})`);
      } else if (value) {
        // Základní filtrování podle rovnosti
        // ?column=eq.value
        params.append(key, `eq.${value}`);
      }
    });
  }
  
  return params;
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