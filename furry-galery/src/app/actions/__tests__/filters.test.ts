import { getPhotographers, getEvents, getTags } from '../filters';
import { db } from "@/db";
import { type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

// Vytvoříme vlastní typ pro náš mock
type MockDb = {
  select: jest.Mock;
  from: jest.Mock;
  leftJoin: jest.Mock;
  where: jest.Mock;
  groupBy: jest.Mock;
  orderBy: jest.Mock;
  limit: jest.Mock;
  mockResolvedValue: jest.Mock;
  mockRejectedValue: jest.Mock;
};

// Mock databáze
jest.mock('@/db', () => {
  // Vytvoříme kompletní mock funkci pro každou metodu řetězce
  const dbMethodMock = jest.fn().mockReturnThis();
  return {
    db: {
      select: dbMethodMock,
      from: dbMethodMock,
      leftJoin: dbMethodMock,
      where: dbMethodMock,
      groupBy: dbMethodMock, 
      orderBy: dbMethodMock,
      limit: dbMethodMock,
      // Poslední metoda v řetězci by měla vracet data
      mockResolvedValue: jest.fn(),
      mockRejectedValue: jest.fn(),
    }
  };
});

// Získáme typovaný mock db
const mockDb = db as unknown as MockDb;

// Pomocná funkce pro nastavení výsledku
const setupDbResult = (result: any): void => {
  // Nastavíme poslední metodu v řetězci (limit) aby vracela náš výsledek
  mockDb.limit.mockImplementation(() => Promise.resolve(result));
};

// Pomocná funkce pro simulaci chyby
const setupDbError = (error: Error): void => {
  // Nastavíme poslední metodu v řetězci (limit) aby vyhodila chybu
  mockDb.limit.mockImplementation(() => Promise.reject(error));
};

describe('Filtry API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getPhotographers', () => {
    it('vrací seznam fotografů', async () => {
      // Mock dat
      const mockPhotographers = [
        { id: '1', userId: 'user1', username: 'Fotograf 1', photoCount: 10 },
        { id: '2', userId: 'user2', username: 'Fotograf 2', photoCount: 5 }
      ];
      
      // Nastavení mock implementace
      setupDbResult(mockPhotographers);
      
      // Volání funkce
      const result = await getPhotographers();
      
      // Ověření výsledku
      expect(result).toEqual(['Fotograf 1', 'Fotograf 2']);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(30); // Defaultní limit
    });
    
    it('filtruje fotografy podle vyhledávání', async () => {
      // Mock dat
      const mockPhotographers = [
        { id: '1', userId: 'user1', username: 'Testovací Fotograf', photoCount: 10 }
      ];
      
      // Nastavení mock implementace
      setupDbResult(mockPhotographers);
      
      // Volání funkce s vyhledávacím dotazem
      const result = await getPhotographers('Testovací');
      
      // Ověření výsledku
      expect(result).toEqual(['Testovací Fotograf']);
      expect(mockDb.where).toHaveBeenCalled();
    });
    
    it('omezuje počet výsledků podle limitu', async () => {
      // Mock dat
      const mockPhotographers = [{ id: '1', userId: 'user1', username: 'Fotograf 1', photoCount: 10 }];
      
      // Nastavení mock implementace
      setupDbResult(mockPhotographers);
      
      // Volání funkce s vlastním limitem
      await getPhotographers('', 5);
      
      // Ověření výsledku
      expect(mockDb.limit).toHaveBeenCalledWith(5);
    });
    
    it('vrací "Neznámý fotograf" pokud nejsou nalezeny výsledky', async () => {
      // Nastavení mock implementace pro prázdný výsledek
      setupDbResult([]);
      
      // Volání funkce
      const result = await getPhotographers();
      
      // Ověření výsledku
      expect(result).toEqual(['Neznámý fotograf']);
    });
    
    it('zpracuje chybu a vrátí fallback hodnotu', async () => {
      // Simulace chyby
      setupDbError(new Error('Database error'));
      
      // Volání funkce
      const result = await getPhotographers();
      
      // Ověření výsledku - chyba by měla být zachycena a vrácen fallback
      expect(result).toEqual(['Neznámý fotograf']);
    });
  });
  
  describe('getEvents', () => {
    it('vrací seznam událostí', async () => {
      // Mock dat
      const mockEvents = [
        { id: '1', name: 'Událost 1', date: new Date() },
        { id: '2', name: 'Událost 2', date: new Date() }
      ];
      
      // Nastavení mock implementace
      setupDbResult(mockEvents);
      
      // Volání funkce
      const result = await getEvents();
      
      // Ověření výsledku
      expect(result).toEqual(['Událost 1', 'Událost 2']);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(30); // Defaultní limit
    });
    
    it('filtruje události podle vyhledávání', async () => {
      // Mock dat
      const mockEvents = [
        { id: '1', name: 'Testovací Událost', date: new Date() }
      ];
      
      // Nastavení mock implementace
      setupDbResult(mockEvents);
      
      // Volání funkce s vyhledávacím dotazem
      const result = await getEvents('Testovací');
      
      // Ověření výsledku
      expect(result).toEqual(['Testovací Událost']);
      expect(mockDb.where).toHaveBeenCalled();
    });
    
    it('omezuje počet výsledků podle limitu', async () => {
      // Mock dat
      const mockEvents = [{ id: '1', name: 'Událost 1', date: new Date() }];
      
      // Nastavení mock implementace
      setupDbResult(mockEvents);
      
      // Volání funkce s vlastním limitem
      await getEvents('', 5);
      
      // Ověření výsledku
      expect(mockDb.limit).toHaveBeenCalledWith(5);
    });
    
    it('vrací "Žádné události" pokud nejsou nalezeny výsledky', async () => {
      // Nastavení mock implementace pro prázdný výsledek
      setupDbResult([]);
      
      // Volání funkce
      const result = await getEvents();
      
      // Ověření výsledku
      expect(result).toEqual(['Žádné události']);
    });
    
    it('zpracuje chybu a vrátí fallback hodnotu', async () => {
      // Simulace chyby
      setupDbError(new Error('Database error'));
      
      // Volání funkce
      const result = await getEvents();
      
      // Ověření výsledku - chyba by měla být zachycena a vrácen fallback
      expect(result).toEqual(['Žádné události']);
    });
  });
  
  describe('getTags', () => {
    it('vrací seznam tagů', async () => {
      // Mock dat
      const mockTags = [
        { id: '1', name: 'Tag 1', usage: 10 },
        { id: '2', name: 'Tag 2', usage: 5 }
      ];
      
      // Nastavení mock implementace
      setupDbResult(mockTags);
      
      // Volání funkce
      const result = await getTags();
      
      // Ověření výsledku
      expect(result).toEqual(['Tag 1', 'Tag 2']);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(30); // Defaultní limit
    });
    
    it('filtruje tagy podle vyhledávání', async () => {
      // Mock dat
      const mockTags = [
        { id: '1', name: 'Testovací Tag', usage: 10 }
      ];
      
      // Nastavení mock implementace
      setupDbResult(mockTags);
      
      // Volání funkce s vyhledávacím dotazem
      const result = await getTags('Testovací');
      
      // Ověření výsledku
      expect(result).toEqual(['Testovací Tag']);
      expect(mockDb.where).toHaveBeenCalled();
    });
    
    it('omezuje počet výsledků podle limitu', async () => {
      // Mock dat
      const mockTags = [{ id: '1', name: 'Tag 1', usage: 10 }];
      
      // Nastavení mock implementace
      setupDbResult(mockTags);
      
      // Volání funkce s vlastním limitem
      await getTags('', 5);
      
      // Ověření výsledku
      expect(mockDb.limit).toHaveBeenCalledWith(5);
    });
    
    it('vrací "Žádné tagy" pokud nejsou nalezeny výsledky', async () => {
      // Nastavení mock implementace pro prázdný výsledek
      setupDbResult([]);
      
      // Volání funkce
      const result = await getTags();
      
      // Ověření výsledku
      expect(result).toEqual(['Žádné tagy']);
    });
    
    it('zpracuje chybu a vrátí fallback hodnotu', async () => {
      // Simulace chyby
      setupDbError(new Error('Database error'));
      
      // Volání funkce
      const result = await getTags();
      
      // Ověření výsledku - chyba by měla být zachycena a vrácen fallback
      expect(result).toEqual(['Žádné tagy']);
    });
  });
}); 