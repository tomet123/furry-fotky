import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { User } from './useUsers';

interface Photo {
  id: number;
  title: string;
  url: string;
  likes: number;
  created_at: string;
  event_name?: string;
}

interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  image_url?: string;
}

export interface ExtendedUser extends User {
  recent_photos?: Photo[];
  recent_events?: Event[];
}

interface UseUserResult {
  user: ExtendedUser | null;
  isLoading: boolean;
  error: string | null;
}

export function useUser(userId: string | number): UseUserResult {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    if (!userId) {
      setIsLoading(false);
      setError('ID uživatele nebylo zadáno');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetchWithAuth(`/api/users/${userId}`);

        if (!response.success) {
          throw new Error(response.message || 'Při načítání uživatele došlo k chybě.');
        }

        if (isMounted) {
          setUser(response.data);
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setError((err as Error).message);
          setIsLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return {
    user,
    isLoading,
    error
  };
} 