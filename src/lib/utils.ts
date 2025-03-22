
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