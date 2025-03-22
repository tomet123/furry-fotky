'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/lib/theme';
import { StyledEngineProvider } from '@mui/material/styles';
import { useServerInsertedHTML } from 'next/navigation';
import { useState, useRef } from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

// Vytvoření Emotion cache s optimalizací pro SSR a klient
const createEmotionCache = () => {
  return createCache({
    key: 'mui-style',
    prepend: true,
    stylisPlugins: [] // Zjednodušené pluginy
  });
};

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const isClient = typeof document !== 'undefined';
  const emotionCache = useRef(isClient ? createEmotionCache() : null);
  
  // Vytvoříme cache pro serveru
  const [{ cache, flush }] = useState(() => {
    // Na klientské straně použijeme existující cache
    if (emotionCache.current) {
      return {
        cache: emotionCache.current,
        flush: () => []
      };
    }
    
    // Na serverové straně vytvoříme nový cache
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
      <StyledEngineProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </StyledEngineProvider>
    </CacheProvider>
  );
} 