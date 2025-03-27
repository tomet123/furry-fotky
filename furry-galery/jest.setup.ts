import '@testing-library/jest-dom';
import React from 'react';
import fetch from 'node-fetch';

// Nastavení globálního fetch pro testovací prostředí
global.fetch = fetch as any;

// Definice Request a Response objektů pro testy
global.Request = class Request {
  constructor(url: string, options: RequestInit = {}) {
    this.url = url;
    this.options = options;
  }
  url: string;
  options: RequestInit;
} as unknown as typeof globalThis.Request;

global.Response = class Response {
  constructor(body: any, options: ResponseInit = {}) {
    this.body = body;
    this.options = options;
  }
  body: any;
  options: ResponseInit;
  headers: Headers = new Headers();
  ok: boolean = true;
  redirected: boolean = false;
  status: number = 200;
  statusText: string = '';
  type: ResponseType = 'default';
  url: string = '';
  json: () => Promise<any> = async () => this.body;
} as unknown as typeof globalThis.Response;

// Mock pro Response.json
global.Response = {
  json: (body: any, init?: ResponseInit) => {
    return new Response(JSON.stringify(body), init);
  }
} as any;

// Základní mocky pro testování
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'test-user-id',
      },
    },
  }),
}));

// Mock pro CanvasImage komponentu
jest.mock('@/components/foto/CanvasImage', () => ({
  __esModule: true,
  default: ({ alt, photoId, ...props }: any) => 
    React.createElement('div', {
      'data-testid': 'canvas-image',
      'data-photo-id': photoId,
      ...props
    }, alt)
}));

// Mock pro AspectRatioIcon
jest.mock('@mui/icons-material/AspectRatio', () => ({
  __esModule: true,
  default: () => React.createElement('div', {
    'data-testid': 'AspectRatioIcon'
  }, 'AspectRatioIcon')
})); 