/**
 * Formátuje datum na lokalizovaný řetězec
 * @param dateString ISO 8601 řetězec data
 * @param options Možnosti formátování (volitelné)
 * @returns Formátovaný řetězec data
 */
export function formatDate(dateString: string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return 'Datum není k dispozici';
  
  try {
    const date = new Date(dateString);
    
    // Formátování data pomocí Intl.DateTimeFormat
    const formatter = new Intl.DateTimeFormat('cs-CZ', options || {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Kontrola, zda je datum validní
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Formátování pomocí lokalizovaného formátu
    return formatter.format(date);
  } catch {
    return '';
  }
}

/**
 * Funkce pro formátování počtu do čitelného formátu
 * např. 1000 -> 1k, 1500 -> 1.5k
 * 
 * @param count Číslo k naformátování
 * @returns Naformátované číslo
 */
export function formatCount(count: number): string {
  if (count < 1000) return count.toString();
  
  return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
}

/**
 * Pomocná funkce pro spojování CSS tříd
 * 
 * @param classes pole tříd nebo objektů s podmínkami
 * @returns spojený řetězec CSS tříd
 */
export function classNames(...classes: (string | boolean | undefined | null | Record<string, boolean>)[]): string {
  return classes
    .filter(Boolean)
    .map((cls) => {
      if (typeof cls === 'string') return cls;
      if (cls && typeof cls === 'object') {
        return Object.entries(cls)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key)
          .join(' ');
      }
      return '';
    })
    .join(' ');
} 