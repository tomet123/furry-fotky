import { useState, useEffect } from 'react';
import { endpoints, preparePostgRESTUrl } from '@/lib/postgrest';

export interface Photo {
  id: number;
  title?: string;
  description?: string;
  photographer: string;
  event: string;
  date: string;
  likes: number;
  tags: string[];
  imageUrl?: string;
  thumbnailUrl?: string;
}

export const usePhotoItems = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        // Vytvoříme parametry pro získání foto detailů z PostgREST
        const params = preparePostgRESTUrl(endpoints.photoDetails);
        
        // Nastavíme limity a řazení
        params.append('limit', '20');
        params.append('order', 'date.desc');
        
        // Sestavení URL s parametry
        const url = `${endpoints.photoDetails}?${params.toString()}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Chyba při načítání fotografií: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Transformace dat z API
        const transformedData = data.map((item: any) => ({
          ...item,
          imageUrl: item.image_url,
          thumbnailUrl: item.thumbnail_url
        }));
        
        setPhotos(transformedData);
      } catch (error) {
        console.error('Chyba při načítání fotografií:', error);
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  return { photos, loading, error };
};

// Export statických dat, která budeme používat v ukázkách
export const EVENTS = [
  "Mikulášská besídka 2022",
  "FurryFest 2022",
  "Pawladin 2023",
  "Furšíkův výlet 2023",
  "JarniSraz 2023"
];

export const PHOTOGRAPHERS = [
  "Michal Novák",
  "Jana Svobodová",
  "Petr Černý",
  "Eva Procházková",
  "Tomáš Králík"
];

export const TAGS = [
  "venku",
  "uvnitř",
  "skupinové",
  "portrét",
  "akce",
  "kostým",
  "fursuit",
  "večer",
  "zábava",
  "jídlo"
]; 