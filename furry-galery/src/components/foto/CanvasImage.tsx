'use client';

import React, { useEffect, useRef, useState } from 'react';
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

export const CanvasImage: React.FC<CanvasImageProps> = ({
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

  // Efekt pro sledování změn photoId
  useEffect(() => {
    // Pokud se změnilo photoId, resetujeme stav načítání ale ponecháme zobrazení předchozího obrázku
    if (photoId !== lastPhotoId) {
      // Původní obrázek zůstává viditelný, dokud se nenačte nový
      setError(false);
      setImageSource(src || null);
      setLastPhotoId(photoId);
      console.log('PhotoId změněno, načítám nová data, ale zachovávám zobrazení:', photoId);
    }
  }, [photoId, lastPhotoId, src]);

  // Efekt pro získání dat fotky z server action, pokud máme photoId
  useEffect(() => {
    if (!photoId || imageSource) return;

    console.log('Načítám data pro photoId:', photoId);
    const fetchImageData = async () => {
      try {
        let result;
        if (isThumbnail) {
          result = await getPhotoThumbnailData(photoId);
        } else {
          result = await getPhotoData(photoId);
        }

        if (result && result.data) {
          console.log('Data načtena úspěšně pro photoId:', photoId);
          setImageSource(result.data);
        } else {
          console.error('Žádná data pro photoId:', photoId);
          setError(true);
          if (onError) onError();
        }
      } catch (err) {
        console.error('Chyba při načítání dat fotografie:', err);
        setError(true);
        if (onError) onError();
      }
    };

    fetchImageData();
  }, [photoId, isThumbnail, onError, imageSource]);

  // Efekt pro načtení a vykreslení obrázku do canvasu
  useEffect(() => {
    if (!imageSource) return;

    console.log('Vykreslování obrazu pro photoId:', photoId);
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Umožní manipulaci s obrázkem v canvasu
    
    img.onload = () => {
      console.log('Obrázek načten, nastavuji rozměry a renderuji:', photoId);
      setIsLoaded(true);
      setNaturalWidth(img.naturalWidth);
      setNaturalHeight(img.naturalHeight);
      renderImage(img);
      if (onLoad) onLoad();
    };
    
    img.onerror = () => {
      console.error('Nepodařilo se načíst obrázek:', photoId);
      setError(true);
      if (onError) onError();
    };
    
    img.src = imageSource;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageSource, onLoad, onError, objectFit, photoId]);

  // Efekt pro přizpůsobení velikosti canvasu při změně rozměrů
  useEffect(() => {
    if (isLoaded) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        renderImage(img);
      };
      
      img.src = imageSource || '';
    }
  }, [isLoaded, width, height, objectFit, imageSource]);

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
  }, [canvasRef.current, naturalWidth, naturalHeight, imageSource]);

  // Funkce pro vykreslení obrázku do canvasu
  const renderImage = (img: HTMLImageElement) => {
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
      
      const scaledWidth = img.naturalWidth * scale;
      const scaledHeight = img.naturalHeight * scale;
      
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
  };

  // Funkce pro vytvoření vodoznaku při stahování
  const handleDownload = async () => {
    if (!canvasRef.current) return;
    
    // Vytvoření dočasného canvasu pro verzi s vodoznakem
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = naturalWidth;
    tempCanvas.height = naturalHeight;
    
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;
    
    // Načtení originálního obrázku
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
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
      try {
        const dataUrl = tempCanvas.toDataURL('image/webp', 0.8);
        const link = document.createElement('a');
        const filename = 'furry-fotka-' + new Date().getTime() + '.webp';
        
        link.href = dataUrl;
        link.download = filename;
        link.click();
      } catch (error) {
        console.error('Chyba při stahování obrázku:', error);
      }
    };
    
    img.src = imageSource || '';
  };

  // Zakázání kontextového menu (pravé tlačítko myši)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  // Zakázání drag & drop
  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: width,
        height: height,
        overflow: 'hidden',
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
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.1)'
          }}
        >
          <CircularProgress color="primary" size={40} />
        </Box>
      )}
      {error && (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.1)'
          }}
        >
          Chyba načítání obrázku
        </Box>
      )}
    </Box>
  );
};

export default CanvasImage; 