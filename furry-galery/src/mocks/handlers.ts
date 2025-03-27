import { http, HttpResponse } from 'msw';

// Definice mockovaných API handlerů
export const handlers = [
  // Mockování přihlášení
  http.post('/api/auth/callback/credentials', () => {
    return HttpResponse.json({
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        image: '/images/avatars/default.png',
        isAdmin: false,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  }),

  // Mockování API pro získání událostí
  http.get('/api/events', () => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'Testovací událost 1',
        description: 'Popis testovací události 1',
        date: new Date(2024, 5, 15).toISOString(),
        location: 'Praha',
        createdAt: new Date(2024, 4, 1).toISOString(),
        updatedAt: new Date(2024, 4, 1).toISOString(),
      },
      {
        id: '2',
        title: 'Testovací událost 2',
        description: 'Popis testovací události 2',
        date: new Date(2024, 6, 20).toISOString(),
        location: 'Brno',
        createdAt: new Date(2024, 4, 2).toISOString(),
        updatedAt: new Date(2024, 4, 2).toISOString(),
      },
    ]);
  }),

  // Mockování API pro získání fotografií
  http.get('/api/photos', () => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'Testovací fotka 1',
        description: 'Popis testovací fotky 1',
        url: '/images/test1.jpg',
        userId: '1',
        createdAt: new Date(2024, 4, 1).toISOString(),
        updatedAt: new Date(2024, 4, 1).toISOString(),
      },
      {
        id: '2',
        title: 'Testovací fotka 2',
        description: 'Popis testovací fotky 2',
        url: '/images/test2.jpg',
        userId: '2',
        createdAt: new Date(2024, 4, 2).toISOString(),
        updatedAt: new Date(2024, 4, 2).toISOString(),
      },
    ]);
  }),

  // Mockování API pro získání uživatelů
  http.get('/api/users', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        image: '/images/avatars/default.png',
        isAdmin: false,
      },
      {
        id: '2',
        name: 'Admin User',
        email: 'admin@example.com',
        image: '/images/avatars/admin.png',
        isAdmin: true,
      },
    ]);
  }),
]; 