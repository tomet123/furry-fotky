import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api';

export interface User {
  id: number;
  username: string;
  display_name: string;
  email: string;
  is_active: boolean;
  color: string;
  role: string;
  created_at: string;
  photographer_id: number | null;
  organizer_id: number | null;
  avatar_url: string | null;
  photo_count?: number;
  total_likes?: number;
  event_count?: number;
  organized_events_count?: number;
  upcoming_events_count?: number;
}

interface UseUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  roles?: string[];
}

interface UseUsersResult {
  users: User[];
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  totalUsers: number;
}

export function useUsers({
  page = 1,
  limit = 10,
  search = '',
  roles = []
}: UseUsersParams = {}): UseUsersResult {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(page);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    // Aktualizujeme stránku když se změní props
    setCurrentPage(page);
  }, [page]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const fetchUsers = async () => {
      try {
        // Sestavení URL s parametry
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          sortBy: 'created_at',
          sortOrder: 'DESC'
        });

        // Přidání vyhledávacího dotazu, pokud existuje
        if (search) {
          params.append('username', search);
          params.append('display_name', search);
          params.append('email', search);
        }

        // Přidání filtru rolí, pokud existuje
        if (roles && roles.length > 0) {
          // Pro každou vybranou roli přidáme parametr role
          roles.forEach(role => {
            params.append('role', role);
          });
        }

        const url = `/api/users?${params.toString()}`;
        const response = await fetchWithAuth(url);

        if (!response.success) {
          throw new Error(response.message || 'Při načítání uživatelů došlo k chybě.');
        }

        if (isMounted) {
          setUsers(response.data);
          setTotalPages(response.pagination.totalPages);
          setTotalUsers(response.pagination.totalItems);
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setError((err as Error).message);
          setIsLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [page, limit, search, roles]);

  return {
    users,
    isLoading,
    error,
    totalPages,
    currentPage,
    totalUsers
  };
} 