import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Vytvoření MSW serveru
export const server = setupServer(...handlers);

// Nastavení globálního beforeAll a afterAll pro testy
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close()); 