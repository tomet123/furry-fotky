import { cn } from '../utils';

describe('cn utility', () => {
  it('spojuje CSS třídy', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });
  
  it('odstraňuje duplicitní třídy', () => {
    const result = cn('text-red-500', 'text-red-500');
    expect(result).toBe('text-red-500');
  });
  
  it('spojuje s podmíněnými třídami', () => {
    const isActive = true;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toBe('base-class active-class');
  });
  
  it('přeskakuje falsey hodnoty', () => {
    const result = cn('class1', false && 'class2', null, undefined, 0, 'class3');
    expect(result).toBe('class1 class3');
  });
  
  it('správně aplikuje tailwind třídy s prioritou', () => {
    const result = cn('px-2 py-1', 'px-4');
    // Poslední třída by měla mít prioritu, takže px-4 nahradí px-2
    expect(result).toBe('py-1 px-4');
  });
  
  it('zpracovává objekty s třídami', () => {
    const result = cn('base', { conditional: true, 'not-included': false });
    expect(result).toBe('base conditional');
  });
  
  it('zpracovává pole tříd', () => {
    const result = cn('base', ['class1', 'class2']);
    expect(result).toBe('base class1 class2');
  });
}); 