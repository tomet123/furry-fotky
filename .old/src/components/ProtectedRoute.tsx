'use client';

import { useAuthContext } from '@/components/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname) {
      // Uložíme aktuální cestu pro přesměrování po přihlášení
      localStorage.setItem('redirectAfterLogin', pathname);
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '50vh',
        }}
      >
        <CircularProgress size={50} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Načítání...
        </Typography>
      </Box>
    );
  }

  // Pokud je uživatel přihlášen, zobrazíme chráněný obsah
  return isAuthenticated ? <>{children}</> : null;
} 