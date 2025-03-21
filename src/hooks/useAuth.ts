import { useState, useEffect, useCallback } from 'react';
import { endpoints } from '@/lib/api';
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
  login: (params: LoginParams) => Promise<void>;
  register: (params: RegisterParams) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Načtení přihlášeného uživatele
  const fetchUser = useCallback(async () => {
    // Kontrola, zda jsme na klientovi
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }
    
    // debug('Začínám načítání uživatele');
    const token = localStorage.getItem(JWT_STORAGE_KEY);
    
    if (!token) {
      // debug('Token nenalezen v localStorage');
      setIsLoading(false);
      return;
    }

    // debug(`Token nalezen: ${token.substring(0, 15)}...${token.substring(token.length - 5)}`);
    // debug(`Token délka: ${token.length}`);

    try {
      setIsLoading(true);
      
      // debug('Odesílám požadavek na endpoint currentUser:', endpoints.currentUser);
      
      const response = await fetch(endpoints.currentUser, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // debug(`Odpověď ze serveru: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        // debug('Chyba odpovědi:', errorData);
        throw new Error(errorData.message || 'Nepodařilo se načíst informace o uživateli');
      }

      const data = await response.json();
      // debug('Odpověď ze serveru:', data);
      
      if (data.success && data.user) {
        // debug('Nastavuji uživatele z odpovědi:', data.user);
        setUser(data.user);
      } else {
        // debug('Neočekávaný formát dat uživatele:', data);
        throw new Error('Neplatný formát dat uživatele');
      }
    } catch {
      // debug('Chyba při načítání uživatele:', err);
      localStorage.removeItem(JWT_STORAGE_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
      // debug('Dokončeno načítání uživatele');
    }
  }, []);

  // Načtení uživatele při prvním renderování
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // debug('Automatické načítání uživatele při načtení stránky');
      fetchUser();
    }
  }, [fetchUser]);

  // Přihlášení uživatele
  const login = useCallback(async (params: LoginParams) => {
    // debug('Začínám proces přihlášení', { username: params.username });
    try {
      setIsLoading(true);
      setError(null);

      // debug('Odesílám požadavek na login endpoint:', endpoints.login);
      const response = await fetch(endpoints.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(params)
      });

      // debug(`Odpověď na přihlášení: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      // debug('Odpověď ze serveru:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Přihlášení se nezdařilo');
      }

      if (data.success && data.token && data.user) {
        localStorage.setItem(JWT_STORAGE_KEY, data.token);
        // debug('Token uložen do localStorage');
        
        // debug('Nastavuji přihlášeného uživatele:', data.user);
        setUser(data.user);
      } else {
        throw new Error('Neplatná odpověď ze serveru při přihlášení');
      }
    } catch {
      // debug('Chyba při přihlašování:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Při přihlašování došlo k chybě');
      }
      throw err;
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
    } catch {
      // debug('Chyba při registraci:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Při registraci došlo k chybě');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Odhlášení uživatele
  const logout = useCallback(async () => {
    // debug('Odhlašuji uživatele');
    try {
      // Volání API pro přihlášení
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', 
      });

      if (!response.ok) {
        throw new Error('Nepodařilo se odhlásit');
      }

      // Vyčištění stavu po odhlášení
      localStorage.removeItem(JWT_STORAGE_KEY);
      setUser(null);
      setIsLoading(false);
      setError('');

      return { success: true };
    } catch {
      setIsLoading(false);
      setError('Nepodařilo se odhlásit');
      return { success: false, message: 'Nepodařilo se odhlásit' };
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
      const response = await fetch(endpoints.currentUser, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Nepodařilo se aktualizovat informace o uživateli');
      }

      const data = await response.json();
      
      if (data.success && data.user) {
        console.log('Aktualizuji uživatelská data:', data.user);
        setUser(data.user);
      }
    } catch {
      console.error('Error refreshing user data:', err);
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