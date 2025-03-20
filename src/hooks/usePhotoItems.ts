import { useMemo } from 'react';

export interface Photo {
  id: number;
  event: string;
  photographer: string;
  likes: number;
  date: string;
  tags: string[];
  imageUrl?: string;     // URL pro plnou velikost obrázku
  thumbnailUrl?: string; // URL pro náhled obrázku
}

export const EVENTS = [
  'Furmeet Praha', 
  'Czech Furry Con', 
  'FurFest', 
  'Pelíškování', 
  'Fotomeet'
];

export const PHOTOGRAPHERS = [
  'FOX', 
  'Skia', 
  'Tygr', 
  'Panda', 
  'Vlk', 
  'Otter', 
  'Šakal'
];

export const TAGS = [
  'fursuit', 
  'částečný fursuit', 
  'krajina', 
  'město', 
  'portrét', 
  'skupina', 
  'příroda', 
  'akce', 
  'kostým', 
  'umělecké', 
  'černobílé', 
  'barevné'
];

/**
 * Hook pro získání dat fotografií pro ukázkové účely
 * V produkci by tyto data pocházely z API
 */
export function usePhotoItems(): Photo[] {
  const photos = useMemo(() => {
    const items: Photo[] = [];
    
    // Generování 24 ukázkových fotografií
    for (let i = 1; i <= 50; i++) {
      // Náhodný počet tagů (1-4)
      const numTags = Math.floor(Math.random() * 4) + 1;
      const photoTags: string[] = [];
      
      // Náhodný výběr tagů bez opakování
      const shuffledTags = [...TAGS].sort(() => 0.5 - Math.random());
      for (let j = 0; j < numTags; j++) {
        photoTags.push(shuffledTags[j]);
      }
      
      // Generování náhodného data v posledním roce
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 365));
      
      items.push({
        id: i,
        event: EVENTS[Math.floor(Math.random() * EVENTS.length)],
        photographer: PHOTOGRAPHERS[Math.floor(Math.random() * PHOTOGRAPHERS.length)],
        likes: Math.floor(Math.random() * 50) + 1,
        date: date.toISOString().slice(0, 10),
        tags: photoTags
      });
    }
    
    return items;
  }, []);
  
  return photos;
} 