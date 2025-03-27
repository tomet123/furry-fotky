import '@testing-library/jest-dom';
import fetch from 'node-fetch';

// Nastavení globálního fetch pro testovací prostředí
global.fetch = fetch as any;

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  }),
  usePathname: jest.fn().mockReturnValue('/fotogalerie'),
  useSearchParams: jest.fn().mockReturnValue({
    get: jest.fn().mockImplementation(key => {
      if (key === 'page') return '1';
      return null;
    }),
    toString: jest.fn().mockReturnValue(''),
    has: jest.fn().mockReturnValue(false),
    getAll: jest.fn().mockReturnValue([]),
  }),
}));

// Mock Next.js auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn().mockReturnValue({ data: null, status: 'unauthenticated' }),
  signIn: jest.fn(),
  signOut: jest.fn(),
})); 