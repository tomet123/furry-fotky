import { Session } from 'next-auth';

// Standardní uživatelská relace
export const mockSession: Session = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    image: '/images/avatars/default.png',
    isAdmin: false,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Administrátorská relace
export const mockAdminSession: Session = {
  user: {
    id: '2',
    name: 'Admin User',
    email: 'admin@example.com',
    image: '/images/avatars/admin.png',
    isAdmin: true,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Nepřihlášený uživatel
export const mockUnauthenticatedSession = null; 