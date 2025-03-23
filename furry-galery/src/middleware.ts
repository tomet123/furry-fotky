import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  // Funkce spuštěná pro všechny stránky, které potřebují ochranu
  function middleware(req) {
    // Pokud máte funkce, které chcete spustit pro všechny autorizované požadavky
    // můžete je přidat zde
    return NextResponse.next();
  },
  {
    callbacks: {
      // Callback pro určení, které požadavky by měly být chráněny
      authorized: ({ token }) => !!token,
    },
    // Stránky, které vyžadují autorizaci
    // Změňte podle potřeb vaší aplikace
    pages: {
      signIn: '/login',
    },
  }
);

// Seznam stránek, které vyžadují autentizaci
export const config = { 
  matcher: [
    '/profil',
    '/fotky/nahrát',
    '/admin/:path*',
    // Přidejte další cesty podle potřeby
  ] 
}; 