import { EVENTS } from './photos';

export interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  coverImageUrl: string;
  stats: {
    photoCount: number;
    participantCount: number;
  };
}

// Popisy pro každou akci
const eventDescriptions = {
  'Furmeet Praha': 'Pravidelné neformální setkání furry komunity v Praze. Přátelská atmosféra, hry a zábava pro všechny příznivce furry kultury.',
  'Czech Furry Con': 'Největší česká furry konvence s bohatým programem, workshopy, přednáškami a večerními aktivitami. Určeno pro všechny věkové kategorie.',
  'FurFest': 'Mezinárodní festival zaměřený na fursuit performance, umění a propojení komunity. Hosté z celé Evropy.',
  'Pelíškování': 'Komorní víkendová akce s důrazem na relaxaci a navazování přátelství v přírodním prostředí.',
  'Fotomeet': 'Specializované setkání zaměřené na fotografování fursuitů a furry tematiky. Skvělá příležitost pro fotografy i modely.'
};

// Lokace pro každou akci
const eventLocations = {
  'Furmeet Praha': 'Kavárna Pelíšek, Praha',
  'Czech Furry Con': 'Hotel Olympik, Praha',
  'FurFest': 'Výstaviště Flora, Olomouc',
  'Pelíškování': 'Penzion Lesní zátiší, Vysočina',
  'Fotomeet': 'Studio Phoenix, Brno'
};

// Generování náhodného data v poslední rok
const generateRandomPastDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 365));
  return date.toISOString().slice(0, 10);
};

// Generování data v budoucnosti (pro nadcházející akce)
const generateRandomFutureDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * 365));
  return date.toISOString().slice(0, 10);
};

// Vytvoření detailních informací pro každou akci
export const events: Event[] = EVENTS.map((name, index) => {
  // Určení, zda se jedná o minulou nebo budoucí akci
  const isPast = Math.random() > 0.3; // 70% šance, že je akce v minulosti
  
  const startDate = isPast ? generateRandomPastDate() : generateRandomFutureDate();
  const durationDays = Math.floor(Math.random() * 3) + 1; // Akce trvá 1-3 dny
  
  // Výpočet koncového data
  const endDateObj = new Date(startDate);
  endDateObj.setDate(endDateObj.getDate() + durationDays);
  const endDate = endDateObj.toISOString().slice(0, 10);
  
  const id = name.toLowerCase().replace(/\s+/g, '-');
  
  return {
    id,
    name,
    description: eventDescriptions[name as keyof typeof eventDescriptions] || 'Furry setkání plné zábavy a přátelské atmosféry.',
    location: eventLocations[name as keyof typeof eventLocations] || 'Česká republika',
    startDate,
    endDate,
    coverImageUrl: `/api/image?width=800&height=400&seed=${index + 1}`, // Používáme náš API endpoint
    stats: {
      photoCount: isPast ? Math.floor(Math.random() * 200) + 30 : 0,
      participantCount: Math.floor(Math.random() * 150) + 20
    }
  };
});

// Pomocné funkce pro práci s akcemi

// Vrátí všechny akce
export const getAllEvents = (): Event[] => {
  return events;
};

// Vrátí akci podle ID
export const getEventById = (id: string): Event | undefined => {
  return events.find(event => event.id === id);
};

// Vrátí akci podle jména
export const getEventByName = (name: string): Event | undefined => {
  return events.find(event => event.name === name);
};

// Vrátí nadcházející akce
export const getUpcomingEvents = (): Event[] => {
  const today = new Date().toISOString().slice(0, 10);
  return events
    .filter(event => event.startDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
};

// Vrátí minulé akce
export const getPastEvents = (): Event[] => {
  const today = new Date().toISOString().slice(0, 10);
  return events
    .filter(event => event.endDate < today)
    .sort((a, b) => b.endDate.localeCompare(a.endDate)); // Seřazeno od nejnovějších
};

// Vyhledávání akcí podle query
export const searchEvents = (query: string): Event[] => {
  const lowerQuery = query.toLowerCase();
  return events.filter(event => 
    event.name.toLowerCase().includes(lowerQuery) || 
    event.description.toLowerCase().includes(lowerQuery) ||
    event.location.toLowerCase().includes(lowerQuery)
  );
}; 