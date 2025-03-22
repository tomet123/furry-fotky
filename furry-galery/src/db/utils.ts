import { customAlphabet } from 'nanoid';

// Funkce pro generování unikátních ID
export const createId = (prefix = '') => {
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12);
  return `${prefix}${nanoid()}`;
}; 