'use client';

import { useState, useEffect } from 'react';
import { getAllUsers } from '../actions/user';

export function useUsers(limit = 20) {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const result = await getAllUsers(limit);
        if (result.error) {
          setError(result.error);
        } else {
          setUsers(result.users || []);
          setError(null);
        }
      } catch (err) {
        setError('Nepodařilo se načíst uživatele');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [limit]);

  return { users, isLoading, error };
} 