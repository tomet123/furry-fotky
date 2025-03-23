'use client';

import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { getPhotoData, getPhotoThumbnailData } from '@/app/actions/photos';

interface CanvasImageProps {
  src?: string;
  photoId?: string;
  isThumbnail?: boolean;
  alt?: string;
  width?: string | number;
  height?: string | number;
  objectFit?: 'contain' | 'cover';
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

// Použití memo pro optimalizaci vykreslování komponenty
export const CanvasImage: React.FC<CanvasImageProps> = memo(({
  src,
  photoId,
  isThumbnail = false,
  alt = '',
  width = '100%',
  height = '100%',
  objectFit = 'contain',
  onLoad,
  onError,
  className,
  style
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);
  const [error, setError] = useState(false);
  const [imageSource, setImageSource] = useState<string | null>(src || null);
  const [lastPhotoId, setLastPhotoId] = useState<string | undefined>(photoId);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Efekt pro sledování změn photoId
  useEffect(() => {
    // Pokud se změnilo photoId, resetujeme stav načítání ale ponecháme zobrazení předchozího obrázku
    if (photoId !== lastPhotoId) {
      // Původní obrázek zůstává viditelný, dokud se nenačte nový
      setError(false);
      setImageSource(src || null);
      setLastPhotoId(photoId);
    }
  }, [photoId, lastPhotoId, src]);

  // Efekt pro získání dat fotky z server action, pokud máme photoId
  useEffect(() => {
    if (!photoId || imageSource) return;

    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchImageData = async () => {
      try {
        let result;
        if (isThumbnail) {
          result = await getPhotoThumbnailData(photoId);
        } else {
          result = await getPhotoData(photoId);
        }

        if (signal.aborted) return;

        if (result && result.data) {
          setImageSource(result.data);
        } else {
          setError(true);
          if (onError) onError();
        }
      } catch (err) {
        if (signal.aborted) return;
        console.error('Chyba při načítání dat fotografie:', err);
        setError(true);
        if (onError) onError();
      }
    };

    fetchImageData();

    return () => {
      abortController.abort();
    };
  }, [photoId, isThumbnail, onError, imageSource]);

  // Memoizovaná funkce pro vykreslení obrázku do canvasu
  const renderImage = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Nastavení rozměrů canvasu podle rodiče
    const container = canvas.parentElement;
    if (!container) return;
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    // Vyčištění canvasu
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (objectFit === 'contain') {
      // Režim contain - zachovává poměr stran, celý obrázek je viditelný
      const scale = Math.min(
        containerWidth / img.naturalWidth,
        containerHeight / img.naturalHeight
      );
      
      // Zjistíme, zda budou černé pruhy
      const hasBlackBars = 
        containerWidth > img.naturalWidth * scale || 
        containerHeight > img.naturalHeight * scale;
      
      // Pokud se mají zobrazit černé pruhy, zvětšíme obrázek o 7% (střed rozmezí 5-10%)
      const zoomFactor = hasBlackBars ? 1.15 : 1;
      const scaledWidth = img.naturalWidth * scale * zoomFactor;
      const scaledHeight = img.naturalHeight * scale * zoomFactor;
      
      const x = (containerWidth - scaledWidth) / 2;
      const y = (containerHeight - scaledHeight) / 2;
      
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
    } else {
      // Režim cover - vyplní celý prostor, může oříznout obrázek
      const scale = Math.max(
        containerWidth / img.naturalWidth,
        containerHeight / img.naturalHeight
      );
      
      const scaledWidth = img.naturalWidth * scale;
      const scaledHeight = img.naturalHeight * scale;
      
      const x = (containerWidth - scaledWidth) / 2;
      const y = (containerHeight - scaledHeight) / 2;
      
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
    }
  }, [objectFit]);

  // Efekt pro načtení a vykreslení obrázku do canvasu
  useEffect(() => {
    if (!imageSource) return;

    const img = new Image();
    imageRef.current = img;
    img.crossOrigin = 'anonymous'; // Umožní manipulaci s obrázkem v canvasu
    
    img.onload = () => {
      if (!canvasRef.current) return; // Kontrola, zda komponenta stále existuje
      
      setIsLoaded(true);
      setNaturalWidth(img.naturalWidth);
      setNaturalHeight(img.naturalHeight);
      renderImage(img);
      if (onLoad) onLoad();
    };
    
    img.onerror = () => {
      if (!canvasRef.current) return; // Kontrola, zda komponenta stále existuje
      
      setError(true);
      if (onError) onError();
    };
    
    img.src = imageSource;
    
    return () => {
      img.onload = null;
      img.onerror = null;
      // Zastavit načítání obrázku při unmount
      if (imageRef.current) {
        imageRef.current.src = '';
      }
    };
  }, [imageSource, onLoad, onError, renderImage]);

  // Efekt pro přizpůsobení velikosti canvasu při změně rozměrů
  useEffect(() => {
    if (isLoaded && imageRef.current) {
      renderImage(imageRef.current);
    }
  }, [isLoaded, width, height, renderImage]);

  // Efekt pro přidání event listeneru pro stahování
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleDownloadEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.photoId) {
        handleDownload();
      }
    };

    // Přidáme posluchač na naši vlastní událost
    canvas.addEventListener('canvas-download', handleDownloadEvent);

    return () => {
      // Cleanup při odmontování komponenty
      canvas.removeEventListener('canvas-download', handleDownloadEvent);
    };
  }, []);

  // Funkce pro vytvoření vodoznaku při stahování
  const handleDownload = useCallback(async () => {
    if (!canvasRef.current || !imageSource || naturalWidth === 0 || naturalHeight === 0) return;
    
    try {
      // Vytvoření dočasného canvasu pro verzi s vodoznakem
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = naturalWidth;
      tempCanvas.height = naturalHeight;
      
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;
      
      // Načtení originálního obrázku
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      // Vrácíme promise pro lepší zpracování asynchronních operací
      return new Promise<void>((resolve, reject) => {
        img.onload = () => {
          try {
            // Vykreslení originálního obrázku
            ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);
            
            // Přidání vodoznaku
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '20px Arial';
            ctx.fillText('Furry Fotky', 20, naturalHeight - 20);
            
            // Vytvoření plynoucího vodoznaku přes celý obrázek
            ctx.font = '30px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.save();
            ctx.translate(naturalWidth / 2, naturalHeight / 2);
            ctx.rotate(-Math.PI / 4);
            ctx.textAlign = 'center';
            for (let i = -5; i <= 5; i++) {
              ctx.fillText('Furry Fotky', 0, i * 80);
            }
            ctx.restore();
            
            // Konverze do speciálního formátu a stažení
            const dataUrl = tempCanvas.toDataURL('image/webp', 0.8);
            const link = document.createElement('a');
            const filename = 'furry-fotka-' + new Date().getTime() + '.webp';
            
            link.href = dataUrl;
            link.download = filename;
            link.click();
            
            // Čištění paměti
            setTimeout(() => {
              URL.revokeObjectURL(dataUrl);
              tempCanvas.remove();
            }, 100);
            
            resolve();
          } catch (error) {
            console.error('Chyba při stahování obrázku:', error);
            reject(error);
          }
        };
        
        img.onerror = (err) => {
          console.error('Chyba při načítání obrázku pro stažení:', err);
          reject(err);
        };
        
        img.src = imageSource || '';
      });
    } catch (error) {
      console.error('Chyba při stahování obrázku:', error);
    }
  }, [imageSource, naturalWidth, naturalHeight]);

  // Zakázání kontextového menu (pravé tlačítko myši)
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  }, []);

  // Zakázání drag & drop
  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    return false;
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        width: width,
        height: height,
        overflow: 'hidden',
        backgroundColor: 'black', // Zajistit černé pozadí pro obrázky s jiným poměrem stran
        ...style
      }}
      className={className}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: isLoaded ? 'block' : 'none'
        }}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        aria-label={alt}
      />
      {!isLoaded && !error && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.1)'
          }}
        >
          <CircularProgress size={24} color="primary" />
        </Box>
      )}
      {error && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.05)'
          }}
        >
          <Box
            component="div"
            sx={{
              color: 'grey.500',
              fontSize: '0.75rem',
              textAlign: 'center',
              p: 2
            }}
          >
            Nepodařilo se načíst obrázek
          </Box>
        </Box>
      )}
    </Box>
  );
});

// Nastavení displayName pro komponentu memo
CanvasImage.displayName = 'CanvasImage';

export default CanvasImage; 