import { NextResponse } from 'next/server';
import middleware, { config } from './middleware';
import { withAuth } from 'next-auth/middleware';
import { NextRequestWithAuth } from 'next-auth/middleware';

// Mock pro next-auth/middleware
jest.mock('next-auth/middleware', () => ({
  withAuth: jest.fn((fn, options) => {
    // Tato funkce vrací middleware s nastavenou konfigurací
    const wrappedMiddleware = (req: NextRequestWithAuth) => {
      // Simulujeme volání callbacku authorized pro testování
      const isAuthorized = options?.callbacks?.authorized?.({ token: mockToken }) ?? false;
      
      if (!isAuthorized) {
        // Simulujeme přesměrování na stránku přihlášení
        return NextResponse.redirect(new URL(options?.pages?.signIn || '/login', req.url));
      }
      
      // Pokud je autorizován, pokračujeme
      return fn ? fn(req) : NextResponse.next();
    };
    
    return wrappedMiddleware;
  }),
  NextRequestWithAuth: class {} // Mock pro typ
}));

// Mock pro NextResponse
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      next: jest.fn(() => ({ type: 'next' })),
      redirect: jest.fn((url) => ({ type: 'redirect', url })),
    },
  };
});

// Testovací data
let mockToken: any = null;
// Mock funkce event pro druhý parametr middleware
const mockEvent = {} as any;

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Výchozí nastavení - žádný token (nepřihlášený uživatel)
    mockToken = null;
  });
  
  it('správně konfiguruje chráněné cesty', () => {
    // Ověření, že config.matcher obsahuje očekávané cesty
    expect(config.matcher).toContain('/profil');
    expect(config.matcher).toContain('/user/profile');
    expect(config.matcher).toContain('/user/photographer/:path*');
    expect(config.matcher).toContain('/fotky/nahrát');
    expect(config.matcher).toContain('/admin/:path*');
  });
  
  it('používá withAuth pro autentizaci', () => {
    expect(withAuth).toHaveBeenCalled();
    
    // Kontrola nastavení stránky pro přihlášení
    const options = (withAuth as jest.Mock).mock.calls[0][1];
    expect(options.pages.signIn).toBe('/login');
  });
  
  it('povolí přístup k chráněným cestám pro přihlášeného uživatele', () => {
    // Nastavení tokenu pro přihlášeného uživatele
    mockToken = { user: { id: '123', role: 'user' } };
    
    // Vytvoření mock požadavku pro chráněnou cestu
    const req = {
      url: 'http://localhost:3000/user/profile',
      nextauth: { token: mockToken }
    } as NextRequestWithAuth;
    
    // Zavolání middleware
    middleware(req, mockEvent);
    
    // Ověření, že middleware zavolalo NextResponse.next() pro pokračování
    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });
  
  it('přesměruje nepřihlášeného uživatele na přihlašovací stránku', () => {
    // Bez tokenu = nepřihlášený uživatel
    mockToken = null;
    
    // Vytvoření mock požadavku pro chráněnou cestu
    const req = {
      url: 'http://localhost:3000/user/profile',
      nextauth: { token: null }
    } as NextRequestWithAuth;
    
    // Zavolání middleware
    middleware(req, mockEvent);
    
    // Ověření, že middleware zavolalo NextResponse.redirect() na přihlašovací stránku
    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
    expect(redirectUrl.pathname).toBe('/login');
  });
}); 