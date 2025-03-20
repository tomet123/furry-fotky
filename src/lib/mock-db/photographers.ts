import { PHOTOGRAPHERS } from './photos';

export interface Photographer {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string;
  contactInfo: {
    email?: string;
    website?: string;
    telegram?: string;
    twitter?: string;
  };
  stats: {
    photoCount: number;
    totalLikes: number;
  };
}

// Bio pro každého fotografa
const photographerBios = {
  'FOX': 'Specializuji se na outdoor fotografie a zachycení přirozených momentů. Mým cílem je zachytit autentickou atmosféru každé akce.',
  'Skia': 'Miluji experimenty se světlem a stínem. Specializuji se na studiovou fotografii a portréty s důrazem na detail.',
  'Tygr': 'Akční a sportovní fotograf se zaměřením na dynamické záběry. Rád zachycuji pohyb v jeho nejlepší formě.',
  'Panda': 'Fotím především umělecké portréty a koncepční fotografie. Mé dílo vypráví příběhy prostřednictvím vizuálních metafor.',
  'Vlk': 'Krajinář a cestovatel, který zachycuje krásné scenérie a atmosféru různých míst. Hledám jedinečné světelné podmínky a kompozice.',
  'Otter': 'Reportážní a dokumentární fotograf se zájmem o zachycení autentických momentů ze života komunity.',
  'Šakal': 'Specializuji se na kreativní portréty a módní fotografii. Rád experimentuji s barevností a kompozicí.'
};

// Vytvoření detailních informací pro každého fotografa
export const photographers: Photographer[] = PHOTOGRAPHERS.map((name, index) => {
  const id = name.toLowerCase().replace(' ', '-');
  return {
    id,
    name,
    bio: photographerBios[name as keyof typeof photographerBios] || 'Fotograf s vášní pro zachycení jedinečných momentů.',
    avatarUrl: `/api/avatar?size=300&seed=${index + 1}`, // Používáme náš API endpoint
    contactInfo: {
      email: `${name.toLowerCase()}@furryphotos.cz`,
      website: Math.random() > 0.5 ? `https://${name.toLowerCase()}.cz` : undefined,
      telegram: Math.random() > 0.3 ? `@${name.toLowerCase()}` : undefined,
      twitter: Math.random() > 0.7 ? `@${name.toLowerCase()}` : undefined
    },
    stats: {
      photoCount: Math.floor(Math.random() * 200) + 20,
      totalLikes: Math.floor(Math.random() * 2000) + 100
    }
  };
});

// Pomocné funkce pro práci s fotografy

// Vrátí všechny fotografy
export const getAllPhotographers = (): Photographer[] => {
  return photographers;
};

// Vrátí fotografa podle ID
export const getPhotographerById = (id: string): Photographer | undefined => {
  return photographers.find(photographer => photographer.id === id);
};

// Vrátí fotografa podle jména
export const getPhotographerByName = (name: string): Photographer | undefined => {
  return photographers.find(photographer => photographer.name === name);
};

// Vyhledávání fotografů podle query
export const searchPhotographers = (query: string): Photographer[] => {
  const lowerQuery = query.toLowerCase();
  return photographers.filter(photographer => 
    photographer.name.toLowerCase().includes(lowerQuery) || 
    photographer.bio.toLowerCase().includes(lowerQuery)
  );
}; 