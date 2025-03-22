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
  logout: `${API_URL}/auth/logout`,
  currentUser: `${API_URL}/auth/me`,
  users: `${API_URL}/users`,
};

/**
 * Pomocná funkce pro přidání autorizačního tokenu do hlavičky
 */
export function getAuthorizationHeader(): Record<string, string> | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const token = localStorage.getItem(JWT_STORAGE_KEY);
  return token ? { 'Authorization': `Bearer ${token}` } : undefined;
}

/**
 * Výsledek kontroly autentizace
 */
export interface AuthCheckResult {
  isAuthenticated: boolean;
  token?: string;
  message?: string;
}

/**
 * Vlastnosti pro authorizedFetch
 */
export interface AuthorizedFetchOptions extends RequestInit {
  skipAuthCheck?: boolean;
  onUnauthenticated?: (result: AuthCheckResult) => void;
}

/**
 * Kontroluje, zda je uživatel přihlášen a má platný token
 * 
 * Příklad použití:
 * ```
 * const authCheck = checkAuthentication();
 * if (authCheck.isAuthenticated) {
 *   console.log('Uživatel je přihlášen');
 * } else {
 *   console.log(`Uživatel není přihlášen: ${authCheck.message}`);
 * }
 * ```
 * 
 * @returns Výsledek kontroly autentizace
 */
export function checkAuthentication(): AuthCheckResult {
  // Na serveru není uživatel nikdy přihlášen
  if (typeof window === 'undefined') {
    return { 
      isAuthenticated: false,
      message: 'Server side nemá přístup k autentizaci klienta'
    };
  }

  // Získám token z localStorage
  const token = localStorage.getItem(JWT_STORAGE_KEY);
  
  // Pokud token neexistuje, uživatel není přihlášen
  if (!token) {
    return { 
      isAuthenticated: false,
      message: 'Uživatel není přihlášen (chybí token)'
    };
  }
  
  // Token existuje, uživatel je pravděpodobně přihlášen
  return {
    isAuthenticated: true,
    token
  };
}

/**
 * Vytvoří autorizovaný fetch požadavek s kontrolou autentizace
 * 
 * Příklad použití:
 * ```
 * // Základní použití - přidá token, pokud existuje
 * const response = await authorizedFetch('/api/data');
 * 
 * // S kontrolou autentizace - vrátí 401, pokud token chybí
 * const response = await authorizedFetch('/api/protected-data');
 * 
 * // S vlastním zpracováním chyby autentizace
 * const response = await authorizedFetch('/api/protected-data', {
 *   onUnauthenticated: (result) => {
 *     console.error(`Nejste přihlášeni: ${result.message}`);
 *     // Zde můžete přidat vlastní logiku
 *   }
 * });
 * 
 * // Přeskočení kontroly autentizace
 * const response = await authorizedFetch('/api/public-data', {
 *   skipAuthCheck: true
 * });
 * ```
 * 
 * @param url URL pro fetch požadavek
 * @param options Další fetch options, včetně možností pro kontrolu autentizace
 * @returns Promise s odpovědí
 */
export async function authorizedFetch(url: string, options: AuthorizedFetchOptions = {}): Promise<Response> {
  // Kontrola autentizace před odesláním požadavku (pokud není přeskočena)
  if (!options.skipAuthCheck) {
    const authCheck = checkAuthentication();
    
    // Pokud uživatel není přihlášen, informuji o tom
    if (!authCheck.isAuthenticated) {
      console.warn(`[API] Autentizace selhala: ${authCheck.message}`);
      
      // Pokud je definována callback funkce, zavolám ji
      if (options.onUnauthenticated) {
        options.onUnauthenticated(authCheck);
      }
      
      // Pokud je uživatel nepřihlášen a není definován callback, vrátím odpovídající Response
      // To zajistí, že neprovedeme fetch požadavek
      if (!options.onUnauthenticated) {
        return new Response(JSON.stringify({
          success: false, 
          message: 'Nejste přihlášeni'
        }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }
  }
  
  // Pokračuji s původním kódem pro authorizedFetch
  const authHeader = getAuthorizationHeader();
  
  // Vytvořím objekt s hlavičkami jako Record<string, string>
  const contentType = options.body ? 'application/json' : undefined;
  
  // Připravím všechny hlavičky
  const headers: Record<string, string> = {};
  
  // Přidám původní hlavičky
  if (options.headers) {
    const originalHeaders = options.headers as Record<string, string>;
    Object.keys(originalHeaders).forEach(key => {
      headers[key] = originalHeaders[key];
    });
  }
  
  // Přidám autorizační hlavičku
  if (authHeader) {
    Object.keys(authHeader).forEach(key => {
      headers[key] = authHeader[key];
    });
  }
  
  // Přidám Content-Type, pokud je definován
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  
  // Odstraním vlastní vlastnosti, které nejsou součástí standardního RequestInit
  const { skipAuthCheck, onUnauthenticated, ...standardOptions } = options;
  
  return fetch(url, {
    ...standardOptions,
    headers,
    credentials: 'include',  // Vždy posíláme cookies pro případy, kdy používáme httpOnly cookies
  });
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

/**
 * Vyžaduje přihlášení uživatele a případně přesměruje na přihlašovací stránku
 * Tato funkce staví na authorizedFetch, ale přidává automatické přesměrování
 * na přihlašovací stránku, pokud uživatel není přihlášen
 * 
 * Příklad použití:
 * ```
 * // Základní použití - přesměruje na /login, pokud uživatel není přihlášen
 * const response = await requireAuth('/api/protected-data');
 * 
 * // S vlastními options
 * const response = await requireAuth('/api/protected-data', {
 *   method: 'POST',
 *   body: JSON.stringify(data)
 * });
 * 
 * // Bez přesměrování (pouze kontrola autentizace)
 * const response = await requireAuth('/api/protected-data', {}, false);
 * if (!response.ok && response.status === 401) {
 *   console.log('Uživatel musí být přihlášen pro přístup k tomuto zdroji');
 * }
 * ```
 * 
 * @param url URL pro fetch požadavek
 * @param options Další fetch options
 * @param redirectToLogin Má se přesměrovat na přihlašovací stránku? Výchozí: true
 * @returns Promise s odpovědí, pokud je uživatel přihlášen
 */
export async function requireAuth(
  url: string, 
  options: AuthorizedFetchOptions = {}, 
  redirectToLogin = true
): Promise<Response> {
  // Definujeme callback pro nepřihlášeného uživatele
  options.onUnauthenticated = (result) => {
    if (redirectToLogin && typeof window !== 'undefined') {
      // Uložíme aktuální cestu pro přesměrování po přihlášení
      const currentPath = window.location.pathname;
      localStorage.setItem('redirectAfterLogin', currentPath);
      
      // Přesměrujeme na přihlašovací stránku
      console.log(`[API] Přesměrování na přihlašovací stránku, uživatel není přihlášen: ${result.message}`);
      window.location.href = '/login';
    }
  };
  
  // Použijeme authorizedFetch s naším callbackem
  return authorizedFetch(url, options);
} 