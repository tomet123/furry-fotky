import { POST } from '../route';
import * as dbModule from '@/db';
import bcrypt from 'bcrypt';

// Mock pro db
jest.mock('@/db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([]),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([{ id: '1' }]),
  },
  eq: jest.fn(),
  user: {
    id: 'id',
    name: 'name',
    email: 'email',
    password: 'password',
  },
}));

// Mock pro bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn(),
}));

describe('Register API', () => {
  // Helper pro vytvoření požadavku
  const createRequest = (body: any) => {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as unknown as Request;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock pro select, který simuluje, že uživatel neexistuje
    (dbModule.db.select as jest.Mock).mockImplementation(() => ({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(undefined),
        }),
      }),
    }));
  });

  it('odmítne registraci s chybějícími údaji', async () => {
    const req = createRequest({ username: 'testuser', email: 'test@example.com' });
    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toContain('Chybějící povinné údaje');
  });

  it('odmítne registraci s neplatným emailem', async () => {
    const req = createRequest({ 
      username: 'testuser', 
      email: 'neplatnyemail', 
      password: 'password123' 
    });
    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toContain('Neplatný formát emailu');
  });

  it('odmítne registraci s krátkým uživatelským jménem', async () => {
    const req = createRequest({ 
      username: 'te', 
      email: 'test@example.com', 
      password: 'password123' 
    });
    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toContain('Uživatelské jméno musí mít alespoň 3 znaky');
  });

  it('odmítne registraci s krátkým heslem', async () => {
    const req = createRequest({ 
      username: 'testuser', 
      email: 'test@example.com', 
      password: '12345' 
    });
    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toContain('Heslo musí mít alespoň 6 znaků');
  });

  it('úspěšně zpracuje platnou registraci', async () => {
    // Mock insert
    (dbModule.db.insert as jest.Mock).mockReturnValue({
      values: jest.fn().mockResolvedValue({ id: 'new-user-id' }),
    });

    const req = createRequest({ 
      username: 'testuser', 
      email: 'test@example.com', 
      password: 'password123' 
    });
    const response = await POST(req as any);
    const data = await response.json();

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(dbModule.db.insert).toHaveBeenCalled();
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
  });
}); 