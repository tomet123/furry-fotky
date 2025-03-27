import { createId } from '../utils';

// Mock nanoid pro konzistentní výsledky testů
jest.mock('nanoid', () => ({
  nanoid: () => 'abc123456789',
}));

describe('createId', () => {
  it('vytvoří ID bez prefixu', () => {
    const id = createId();
    expect(id).toBe('abc123456789');
  });

  it('vytvoří ID s prefixem', () => {
    const id = createId('user_');
    expect(id).toBe('user_abc123456789');
  });

  it('vytvoří ID se správným typem', () => {
    const id = createId();
    expect(typeof id).toBe('string');
  });

  it('vytvoří ID se správnou délkou při použití prefixu', () => {
    const prefix = 'test_';
    const id = createId(prefix);
    
    // Délka by měla být délka prefixu + délka nanoid výstupu
    const expectedLength = prefix.length + 'abc123456789'.length;
    expect(id.length).toBe(expectedLength);
  });
}); 