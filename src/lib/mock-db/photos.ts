import { Photo } from '@/hooks/usePhotoItems';

// Definice mockových tagů, akcí a fotografů pro konzistentnost
export const TAGS = [
  'fursuit', 'outdoor', 'indoor', 'con', 'meetup', 'portrait', 
  'group', 'black_white', 'colorful', 'night', 'summer', 'winter',
  'spring', 'autumn', 'studio', 'nature', 'urban', 'candid'
];

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

// Generování náhodného data v posledním roce
const generateRandomDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 365));
  return date.toISOString().slice(0, 10);
};

// Generování náhodných tagů
const generateRandomTags = () => {
  const numTags = Math.floor(Math.random() * 4) + 1;
  const photoTags: string[] = [];
  
  // Náhodný výběr tagů bez opakování
  const shuffledTags = [...TAGS].sort(() => 0.5 - Math.random());
  for (let j = 0; j < numTags; j++) {
    photoTags.push(shuffledTags[j]);
  }
  
  return photoTags;
};

// Funkce pro generování URL obrázků
const generateImageUrls = (photo: Photo): Photo => {
  return {
    ...photo,
    thumbnailUrl: `/api/image?width=600&height=450&seed=${photo.id}`,
    imageUrl: `/api/image?width=1920&height=1080&seed=${photo.id}`
  };
};

// Mockové fotografie
export const photos: Photo[] = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  event: EVENTS[Math.floor(Math.random() * EVENTS.length)],
  photographer: PHOTOGRAPHERS[Math.floor(Math.random() * PHOTOGRAPHERS.length)],
  likes: Math.floor(Math.random() * 50) + 1,
  date: generateRandomDate(),
  tags: generateRandomTags()
}));

// Pomocné funkce pro manipulaci s daty

// Vrátí všechny fotografie
export const getAllPhotos = (): Photo[] => {
  return photos.map(generateImageUrls);
};

// Vrátí fotografii podle ID
export const getPhotoById = (id: number): Photo | undefined => {
  const photo = photos.find(photo => photo.id === id);
  return photo ? generateImageUrls(photo) : undefined;
};

// Filtruje fotografie podle parametrů
export const filterPhotos = (params: {
  query?: string;
  event?: string;
  photographer?: string;
  tags?: string[];
  sortBy?: 'newest' | 'oldest' | 'most_liked';
  page?: number;
  limit?: number;
}): { data: Photo[], total: number } => {
  let filtered = [...photos];
  
  // Filtrování podle vyhledávání
  if (params.query) {
    const query = params.query.toLowerCase();
    filtered = filtered.filter(photo => 
      photo.photographer.toLowerCase().includes(query) ||
      photo.event.toLowerCase().includes(query) ||
      photo.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  // Filtrování podle akce
  if (params.event) {
    filtered = filtered.filter(photo => photo.event === params.event);
  }
  
  // Filtrování podle fotografa
  if (params.photographer) {
    filtered = filtered.filter(photo => photo.photographer === params.photographer);
  }
  
  // Filtrování podle tagů
  if (params.tags && params.tags.length > 0) {
    filtered = filtered.filter(photo => 
      params.tags!.every(tag => photo.tags.includes(tag))
    );
  }
  
  // Řazení
  if (params.sortBy) {
    switch (params.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'most_liked':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
    }
  } else {
    // Výchozí řazení podle nejnovějších
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  // Celkový počet před stránkováním
  const total = filtered.length;
  
  // Stránkování
  if (params.page && params.limit) {
    const start = (params.page - 1) * params.limit;
    const end = start + params.limit;
    filtered = filtered.slice(start, end);
  }
  
  // Přidání URL obrázků ke každé fotce
  const dataWithUrls = filtered.map(generateImageUrls);
  
  return { data: dataWithUrls, total };
}; 