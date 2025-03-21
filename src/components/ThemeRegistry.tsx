'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/lib/theme';
import { StyledEngineProvider } from '@mui/material/styles';
import { useServerInsertedHTML } from 'next/navigation';
import { useState } from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  // Vytvoříme cahce klienta na straně klienta
  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: 'mui-cache', prepend: true });
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    
    return { cache, flush };
  });
  
  // Použijeme hook pro serverovou stránku
  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }
    
    let styles = '';
    for (const name of names) {
      styles += cache.inserted[name];
    }
    
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });
  
  return (
    <CacheProvider value={cache}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </StyledEngineProvider>
    </CacheProvider>
  );
} 