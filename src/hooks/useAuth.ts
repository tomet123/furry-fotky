import { useState, useEffect, useCallback } from 'react';
import { endpoints, authorizedFetch } from '@/lib/api';
import { JWT_STORAGE_KEY } from '@/lib/constants';
import { User } from '@/lib/auth';

// Re-export User interface
export type { User } from '@/lib/auth';

// Debugovací funkce
// const debug = (message: string, data?: any) => {
//   console.log(`[AUTH DEBUG] ${message}`, data !== undefined ? data : '');
// };

interface RegisterParams {
  username: string;
  email: string;
  password: string;
}

interface LoginParams {
  username: string;
  password: string;
}

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (params: RegisterParams) => Promise<boolean>;
  logout: () => Promise<boolean>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Načtení přihlášeného uživatele
  const fetchUser = useCallback(async () => {
    // Nastavím, že probíhá načítání - toto nastavení bude platit i když se nevykoná žádný požadavek
    console.log('[useAuth] fetchUser: Začínám proces načítání uživatele, isLoading=true');
    setIsLoading(true);
    
    // Kontrola, zda jsme na klientovi
    if (typeof window === 'undefined') {
      console.log('[useAuth] fetchUser: Nejsme na klientovi, končím');
      setIsLoading(false);
      return;
    }
    
    // debug('Začínám načítání uživatele');
    const token = localStorage.getItem(JWT_STORAGE_KEY);
    
    if (!token) {
      console.log('[useAuth] fetchUser: Token nenalezen v localStorage, končím');
      setIsLoading(false);
      return;
    }

    try {
      // Tady již nemusím znovu nastavovat isLoading, protože je nastaveno výše
      console.log('[useAuth] fetchUser: Token nalezen, odesílám požadavek na API');
      
      // debug('Odesílám požadavek na endpoint currentUser:', endpoints.currentUser);
      
      // Použití authorizedFetch namísto ručního přidávání Authorization hlavičky
      const response = await authorizedFetch(endpoints.currentUser);

      console.log(`[useAuth] fetchUser: Odpověď ze serveru: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('[useAuth] fetchUser: Chyba odpovědi:', errorData);
        throw new Error(errorData.message || 'Nepodařilo se načíst informace o uživateli');
      }

      const data = await response.json();
      console.log('[useAuth] fetchUser: Data získána:', data.success, !!data.user);
      
      if (data.success && data.user) {
        console.log('[useAuth] fetchUser: Nastavuji uživatele');
        setUser(data.user);
      } else {
        console.log('[useAuth] fetchUser: Neplatný formát dat');
        throw new Error('Neplatný formát dat uživatele');
      }
    } catch (error) {
      console.log('[useAuth] fetchUser: Chyba při načítání:', error);
      localStorage.removeItem(JWT_STORAGE_KEY);
      setUser(null);
    } finally {
      console.log('[useAuth] fetchUser: Dokončeno načítání, isLoading=false');
      setIsLoading(false);
    }
  }, []);

  // Načtení uživatele při prvním načtení aplikace
  useEffect(() => {
    // Spustíme fetchUser pouze jednou při prvním renderování
    console.log('[useAuth] První načtení aplikace, spouštím fetchUser');
    fetchUser();
  }, []); // Prázdné dependency array znamená spuštění pouze při montování komponenty

  // Sledování změn uživatele
  useEffect(() => {
    // Pokud se uživatel odhlásí nebo nastane chyba, isLoading bude false a user bude null
    // Toto zajistí, že se useEffect nespustí při prvním načtení (to řeší předchozí useEffect)
    if (!user && !isLoading) {
      console.log('[useAuth] Změna stavu - uživatel není přihlášen a načítání skončilo, zkouším znovu fetchUser');
      fetchUser();
    }
  }, [user, isLoading, fetchUser]);

  const login = useCallback(async (username: string, password: string) => {
    try {
      setIsLoading(true);
      
      // debug('Odesílání přihlašovacích údajů na:', endpoints.login);
      
      const response = await fetch(endpoints.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // Pro zachování cookies
      });

      // debug(`Odpověď ze serveru: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      
      // debug('Odpověď serveru:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Přihlášení selhalo');
      }
      
      if (data.token) {
        // debug('Token získán z odpovědi, ukládám ho do localStorage');
        localStorage.setItem(JWT_STORAGE_KEY, data.token);
      } else {
        // debug('Token nebyl součástí odpovědi, pokračuji bez nastavení tokenu');
      }
      
      if (data.user) {
        // debug('Nastavuji uživatele z odpovědi:', data.user);
        setUser(data.user);
      } else {
        // debug('Uživatel nebyl součástí odpovědi');
      }
      
      return true;
    } catch (error) {
      console.error('Chyba při přihlašování:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Registrace uživatele
  const register = useCallback(async (params: RegisterParams): Promise<boolean> => {
    // debug('Začínám proces registrace', { username: params.username, email: params.email });
    try {
      setIsLoading(true);
      setError(null);

      // debug('Odesílám požadavek na register endpoint:', endpoints.register);
      const response = await fetch(endpoints.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(params)
      });

      // debug(`Odpověď na registraci: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      // debug('Odpověď ze serveru:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Registrace se nezdařila');
      }

      return data.success || false;
    } catch (error) {
      // debug('Chyba při registraci:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Při registraci došlo k chybě');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // debug('Odesílání požadavku na odhlášení:', endpoints.logout);
      
      const response = await fetch(endpoints.logout, {
        method: 'POST',
        credentials: 'include', // Pro odstranění cookies
      });
      
      // debug(`Odpověď ze serveru: ${response.status} ${response.statusText}`);
      
      // Odstraníme token a uživatele i když server selže
      localStorage.removeItem(JWT_STORAGE_KEY);
      
      setUser(null);
      
      return true;
    } catch (error) {
      console.error('Chyba při odhlašování:', error);
      // I v případě chyby odstraníme token a uživatele
      localStorage.removeItem(JWT_STORAGE_KEY);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Vyčištění chyb
  const clearError = useCallback(() => {
    // debug('Čistím chyby');
    setError(null);
  }, []);

  // Aktualizace uživatelských dat - nová funkce pro refresh uživatele
  const refreshUser = useCallback(async () => {
    // Kontrola, zda jsme na klientovi (browser) a nikoliv na serveru
    if (typeof window === 'undefined') return;
    
    // Pokud uživatel není přihlášen, nemá smysl nic aktualizovat
    if (!user) return;
    
    const token = localStorage.getItem(JWT_STORAGE_KEY);
    if (!token) return;

    try {
      // Použití authorizedFetch namísto ručního přidávání Authorization hlavičky
      const response = await authorizedFetch(endpoints.currentUser);
      
      if (!response.ok) {
        throw new Error('Nepodařilo se aktualizovat informace o uživateli');
      }

      const data = await response.json();
      
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        throw new Error('Neplatný formát dat uživatele');
      }
    } catch (error) {
      console.error('Chyba při aktualizaci uživatele:', error);
    }
  }, [user]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    register,
    logout,
    clearError,
    refreshUser
  };
} 