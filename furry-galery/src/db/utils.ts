import { nanoid } from 'nanoid';

/**
 * Vytvoří unikátní ID s volitelným prefixem
 * @param prefix Volitelný prefix pro ID
 * @returns Unikátní ID
 */
export function createId(prefix: string = ''): string {
  return `${prefix}${nanoid()}`;
} 