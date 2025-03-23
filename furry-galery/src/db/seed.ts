import { faker } from '@faker-js/faker';
import { 
  db, 
  user, // Nová tabulka místo users
  photographers, 
  organizers, 
  events, 
  tags, 
  photos, 
  storagePhotos, 
  photoTags, 
  photoLikes, 
  storageProfilePictures 
} from './index';
import { createId } from './utils';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import * as https from 'https';
import bcrypt from 'bcrypt';

console.log('🌱 Začínám seed databáze...');

// Funkce pro vytvoření hashe hesla pomocí bcrypt
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Funkce pro stažení obrázku s podporou přesměrování
async function downloadImage(url: string, maxRedirects = 5): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const get = (currentUrl: string, redirectCount = 0) => {
      if (redirectCount > maxRedirects) {
        reject(new Error(`Příliš mnoho přesměrování (${maxRedirects})`));
        return;
      }

      https.get(currentUrl, (response) => {
        // Kontrola přesměrování (HTTP 301, 302, 303, 307, 308)
        if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          console.log(`Přesměrování z ${currentUrl} na ${response.headers.location}`);
          get(response.headers.location, redirectCount + 1);
          return;
        }

        const chunks: Buffer[] = [];
        
        response.on('data', (chunk) => {
          chunks.push(chunk);
        });
        
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve(buffer);
        });
        
        response.on('error', (error) => {
          reject(error);
        });
      }).on('error', (error) => {
        reject(error);
      });
    };

    get(url);
  });
}

// Funkce pro vyčištění všech tabulek
async function cleanDatabase() {
  console.log('🧹 Mažu existující data...');
  
  // Mažeme v obráceném pořadí kvůli cizím klíčům
  await db.delete(photoLikes);
  await db.delete(photoTags);
  await db.delete(photos);
  await db.delete(storagePhotos);
  await db.delete(storageProfilePictures);
  await db.delete(events);
  await db.delete(tags);
  await db.delete(photographers);
  await db.delete(organizers);
  await db.delete(user); // Používáme novou tabulku
}

// Hlavní funkce pro seed databáze
async function seedDatabase() {
  try {
    // Vyčistíme databázi
    await cleanDatabase();
    
    // Vložíme uživatele podle původního seeding skriptu
    console.log('👤 Vkládám uživatele...');
    const userRecords = [
      { username: 'FOXA', email: 'foxa@furry-fotky.cz', isAdmin: false },
      { username: 'SkiaA', email: 'skia@furry-fotky.cz', isAdmin: false },
      { username: 'TygrA', email: 'tygr@furry-fotky.cz', isAdmin: false },
      { username: 'PandaA', email: 'panda@furry-fotky.cz', isAdmin: false },
      { username: 'VlkA', email: 'vlk@furry-fotky.cz', isAdmin: false },
      { username: 'OtterA', email: 'otter@furry-fotky.cz', isAdmin: false },
      { username: 'ŠakalA', email: 'sakal@furry-fotky.cz', isAdmin: false },
      { username: 'AdminA', email: 'admin@furry-fotky.cz', isAdmin: true },
      { username: 'FurryEventsA', email: 'events@furry-fotky.cz', isAdmin: false },
      { username: 'PragueFurA', email: 'prague@furry-fotky.cz', isAdmin: false },
      { username: 'FurCzechiaA', email: 'furczechia@furry-fotky.cz', isAdmin: false },
      { username: 'CzechFursA', email: 'czechfurs@furry-fotky.cz', isAdmin: false },
      { username: 'PawsTogetherA', email: 'paws@furry-fotky.cz', isAdmin: false },
    ];
    
    const createdUsers = [];
    
    // Vytvoříme avatary pro uživatele
    console.log('👤 Stahuji avatary uživatelů...');
    const AVATAR_SIZE = 200;
    const createdAvatars: Array<{ id: string; fileData: Buffer; thumbnailData: Buffer; contentType: string; originalName: string; createdAt: Date }> = [];
    
    // Stáhneme pouze 5 skutečných avatarů pro efektivitu
    for (let i = 1; i <= 5; i++) {
      // Náhodné id pro Picsum Photos (1-1000)
      const randomId = Math.floor(Math.random() * 1000) + 1;
      const avatarUrl = `https://picsum.photos/id/${randomId}/${AVATAR_SIZE}/${AVATAR_SIZE}`;
      
      console.log(`Stahuji avatar ${i} z ${avatarUrl}...`);
      try {
        // Stáhneme obrázek
        const imageData = await downloadImage(avatarUrl);
        
        // Vytvoříme záznam v databázi
        const avatar = {
          id: createId('avatar_'),
          fileData: imageData,
          thumbnailData: imageData, // Použijeme stejný obrázek jako thumbnail (už je malý)
          contentType: 'image/jpeg',
          originalName: `avatar${i}.jpg`,
          createdAt: new Date(),
        };
        
        await db.insert(storageProfilePictures).values(avatar);
        createdAvatars.push(avatar);
        
        console.log(`Avatar ${i} úspěšně stažen a uložen (${imageData.length} bytů)`);
      } catch (error) {
        console.error(`Chyba při stahování avataru ${i}:`, error);
        // Vytvoříme prázdný avatar
        const emptyAvatar = {
          id: createId('avatar_'),
          fileData: Buffer.from(''),
          thumbnailData: Buffer.from(''),
          contentType: 'image/jpeg',
          originalName: `avatar${i}.jpg`,
          createdAt: new Date(),
        };
        await db.insert(storageProfilePictures).values(emptyAvatar);
        createdAvatars.push(emptyAvatar);
      }
      
      // Čekáme 500ms mezi požadavky, abychom nezahltili API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    for (const userData of userRecords) {
      // Vybereme náhodný avatar z vytvořených (může být null pro některé uživatele)
      const randomIndex = Math.floor(Math.random() * createdAvatars.length);
      const avatarId = Math.random() > 0.3 ? createdAvatars[randomIndex].id : null;
      
      // Hashování hesla pomocí bcrypt
      const passwordHash = await hashPassword('password123');
      
      const newUser = {
        id: createId('user_'),
        name: userData.username, // Jméno je nové pole v NextAuth schématu
        username: userData.username,
        email: userData.email,
        passwordHash: passwordHash,
        isAdmin: userData.isAdmin,
        isActive: true,
        createdAt: new Date(),
      };
      
      await db.insert(user).values(newUser);
      
      // Pokud máme avatar, vytvoříme nový záznam avataru s ID uživatele
      if (avatarId) {
        const avatar = createdAvatars[randomIndex];
        const updatedAvatar = {
          id: createId('avatar_'),
          fileData: avatar.fileData,
          thumbnailData: avatar.thumbnailData,
          contentType: avatar.contentType,
          originalName: avatar.originalName,
          userId: newUser.id,
          createdAt: new Date()
        };
        
        // Vložíme nový avatar s referencí na uživatele
        await db.insert(storageProfilePictures).values(updatedAvatar);
        
        // Smažeme původní avatar - pomocí přímého SQL příkazu
        const sqlite = db.$client;
        sqlite.prepare('DELETE FROM storage_profile_pictures WHERE id = ?').run(avatarId);
      }
      
      createdUsers.push(newUser);
    }
    
    // Vložíme fotografy
    console.log('📸 Vkládám fotografy...');
    const photographerBios = [
      { bio: 'Fotograf zvířat', description: 'Jsem profesionální fotograf specializující se na fotografování zvířat.', isBeginner: false },
      { bio: 'Portrétní fotograf', description: 'Specializuji se na portrétní fotografii.', isBeginner: false },
      { bio: 'Krajinář', description: 'Fotím především krajinu a přírodu.', isBeginner: false },
      { bio: 'Začínající fotograf', description: 'Jsem nadšený amatérský fotograf, který se teprve učí.', isBeginner: true },
      { bio: 'Fotím v přírodě', description: 'Specializuji se na fotografování v přírodě a wildlife fotografii.', isBeginner: true },
      { bio: 'Městský fotograf', description: 'Fotím především ve městě, architekturu a street photography.', isBeginner: true },
      { bio: 'Event fotograf', description: 'Specializuji se na fotografování akcí a událostí.', isBeginner: true },
    ];
    
    const createdPhotographers = [];
    
    // Přiřadíme prvních 7 uživatelů jako fotografy
    for (let i = 0; i < Math.min(7, createdUsers.length); i++) {
      const photographer = {
        id: createId('photographer_'),
        userId: createdUsers[i].id,
        bio: photographerBios[i].bio,
        description: photographerBios[i].description,
        isBeginner: photographerBios[i].isBeginner,
        createdAt: new Date(),
      };
      
      await db.insert(photographers).values(photographer);
      createdPhotographers.push(photographer);
    }
    
    // Vložíme organizátory
    console.log('🎪 Vkládám organizátory...');
    const organizerBios = [
      'Organizujeme největší furry události v ČR',
      'Pražský fursuit team zajišťující pravidelné meetupy',
      'Nezisková organizace podporující furry komunitu',
      'Spolek pořádající menší lokální akce',
      'Organizační tým specializující se na charitativní akce',
    ];
    
    const createdOrganizers = [];
    
    // Přiřadíme uživatele 8-12 jako organizátory (pokud existují)
    for (let i = 8; i < Math.min(13, createdUsers.length); i++) {
      const organizer = {
        id: createId('organizer_'),
        userId: createdUsers[i].id,
        bio: organizerBios[i - 8],
        createdAt: new Date(),
      };
      
      await db.insert(organizers).values(organizer);
      createdOrganizers.push(organizer);
    }
    
    // Vložíme události
    console.log('📅 Vkládám události...');
    const eventRecords = [
      { name: 'Furmeet PrahaA', description: 'Pravidelné setkání furry komunity v Praze', location: 'Praha', date: '2023-06-15' },
      { name: 'Czech Furry ConA', description: 'Největší furry konvence v Česku', location: 'Brno', date: '2023-10-20' },
      { name: 'FurFestA', description: 'Mezinárodní furry festival', location: 'Praha', date: '2023-08-05' },
      { name: 'PelíškováníA', description: 'Komorní setkání', location: 'Olomouc', date: '2023-05-12' },
      { name: 'FotomeetA', description: 'Setkání zaměřené na fotografování', location: 'Plzeň', date: '2023-09-30' },
      { name: 'Charity PawsA', description: 'Charitativní akce na podporu zvířecích útulků', location: 'České Budějovice', date: '2023-11-15' },
      { name: 'Winter FurConA', description: 'Zimní furry setkání', location: 'Liberec', date: '2023-12-25' },
      { name: 'Fursuit WalkA', description: 'Procházka v kostýmech po centru města', location: 'Praha', date: '2023-07-01' },
    ];
    
    const createdEvents = [];
    
    for (const eventData of eventRecords) {
      // Máme-li organizátory, přiřadíme náhodného organizátora k události
      const randomOrganizerIndex = createdOrganizers.length > 0 
        ? Math.floor(Math.random() * createdOrganizers.length) 
        : 0;
      
      if (createdOrganizers.length === 0) {
        console.log('⚠️ Žádní organizátoři nejsou k dispozici, události nebudou vytvořeny');
        break;
      }
      
      const event = {
        id: createId('event_'),
        name: eventData.name,
        description: eventData.description,
        location: eventData.location,
        date: eventData.date,
        organizerId: createdOrganizers[randomOrganizerIndex].id,
        createdAt: new Date(),
      };
      
      await db.insert(events).values(event);
      createdEvents.push(event);
    }
    
    // Vložíme tagy
    console.log('🏷️ Vkládám tagy...');
    const tagNames = [
      'fursuitA', 'outdoorA', 'indoorA', 'conA', 'meetupA', 'portraitA', 'groupA', 'black_whiteA',
      'colorfulA', 'nightA', 'summerA', 'winterA', 'springA', 'autumnA', 'studioA', 'natureA', 'urbanA', 'candidA'
    ];
    
    const createdTags = [];
    
    for (const tagName of tagNames) {
      const tag = {
        id: createId('tag_'),
        name: tagName,
        createdAt: new Date(),
      };
      
      await db.insert(tags).values(tag);
      createdTags.push(tag);
    }
    
    // Stáhneme a uložíme skutečné fotografie z Picsum Photos
    console.log('📦 Stahuji a ukládám fotografie...');
    const PHOTO_WIDTH = 1920;
    const PHOTO_HEIGHT = 1080;
    const THUMBNAIL_WIDTH = 1920/4;
    const THUMBNAIL_HEIGHT = 1080/4;
    const createdStorages = [];
    
    // Stáhneme pouze 5 skutečných fotografií pro efektivitu
    for (let i = 1; i <= 5; i++) {
      // Náhodné id pro Picsum Photos (1-1000)
      const randomId = Math.floor(Math.random() * 1000) + 1;
      const photoUrl = `https://picsum.photos/id/${randomId}/${PHOTO_WIDTH}/${PHOTO_HEIGHT}`;
      const thumbnailUrl = `https://picsum.photos/id/${randomId}/${THUMBNAIL_WIDTH}/${THUMBNAIL_HEIGHT}`;
      
      console.log(`Stahuji fotografii ${i} z ${photoUrl}...`);
      try {
        // Stáhneme originální obrázek a miniaturu
        const [imageData, thumbnailData] = await Promise.all([
          downloadImage(photoUrl),
          downloadImage(thumbnailUrl)
        ]);
        
        // Vytvoříme záznam v databázi
        const storage = {
          id: createId('storage_'),
          fileData: imageData,
          thumbnailData: thumbnailData,
          contentType: 'image/jpeg',
          originalName: `photo${i}.jpg`,
          createdAt: new Date(),
        };
        
        await db.insert(storagePhotos).values(storage);
        createdStorages.push(storage);
        
        console.log(`Fotografie ${i} úspěšně stažena a uložena (${imageData.length} bytů)`);
      } catch (error) {
        console.error(`Chyba při stahování fotografie ${i}:`, error);
        // Vytvoříme prázdnou fotografii
        const emptyStorage = {
          id: createId('storage_'),
          fileData: Buffer.from(''),
          thumbnailData: Buffer.from(''),
          contentType: 'image/jpeg',
          originalName: `photo${i}.jpg`,
          createdAt: new Date(),
        };
        await db.insert(storagePhotos).values(emptyStorage);
        createdStorages.push(emptyStorage);
      }
      
      // Čekáme 500ms mezi požadavky, abychom nezahltili API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Vytvoříme další záznamy (6-20) mapující na existující obrázky
    console.log('📦 Vytvářím dodatečné záznamy pro fotografie...');
    for (let i = 6; i <= 20; i++) {
      // Určení zdrojového ID (1-5) cyklicky
      const sourceIndex = (i - 6) % createdStorages.length;
      const sourceStorage = createdStorages[sourceIndex];
      
      // Vytvoříme nový záznam jako kopii existujícího
      const newStorage = {
        id: createId('storage_'),
        fileData: sourceStorage.fileData,
        thumbnailData: sourceStorage.thumbnailData,
        contentType: 'image/jpeg',
        originalName: `photo${i}.jpg`,
        createdAt: new Date(),
      };
      
      await db.insert(storagePhotos).values(newStorage);
      createdStorages.push(newStorage);
    }
    
    // Vložíme fotografie
    console.log('🖼️ Vkládám fotografie...');
    const createdPhotos = [];
    
    if (createdPhotographers.length === 0 || createdEvents.length === 0 || createdStorages.length === 0) {
      console.log('⚠️ Chybí potřebná data pro vytvoření fotografií');
    } else {
      // Vytvoříme 20 fotografií s různými parametry
      for (let i = 0; i < 20; i++) {
        const randomPhotographerIndex = Math.floor(Math.random() * createdPhotographers.length);
        const randomEventIndex = Math.floor(Math.random() * createdEvents.length);
        const randomLikes = Math.floor(Math.random() * 50);
        const randomDate = faker.date.past({ years: 1 }).toISOString().split('T')[0];
        
        const photo = {
          id: createId('photo_'),
          photographerId: createdPhotographers[randomPhotographerIndex].id,
          eventId: createdEvents[randomEventIndex].id,
          storageId: createdStorages[i % createdStorages.length].id,
          likes: randomLikes,
          date: randomDate,
          createdAt: new Date(),
        };
        
        await db.insert(photos).values(photo);
        createdPhotos.push(photo);
      }
      
      // Přidáme tagy k fotografiím
      console.log('🔖 Přiřazuji tagy k fotografiím...');
      
      for (const photo of createdPhotos) {
        // Každá fotografie dostane 2-4 náhodné tagy
        const numTags = Math.floor(Math.random() * 3) + 2;
        const randomTagIndices = new Set<number>();
        
        while (randomTagIndices.size < numTags) {
          randomTagIndices.add(Math.floor(Math.random() * createdTags.length));
        }
        
        for (const tagIndex of randomTagIndices) {
          await db.insert(photoTags).values({
            photoId: photo.id,
            tagId: createdTags[tagIndex].id,
            createdAt: new Date(),
          });
        }
      }
      
      // Přidáme náhodné lajky k fotografiím
      console.log('👍 Přidávám lajky k fotografiím...');
      
      for (const photo of createdPhotos) {
        // Každá fotografie dostane náhodný počet lajků (0-5)
        const numLikes = Math.floor(Math.random() * 6);
        const randomUserIndices = new Set<number>();
        
        while (randomUserIndices.size < numLikes) {
          randomUserIndices.add(Math.floor(Math.random() * createdUsers.length));
        }
        
        for (const userIndex of randomUserIndices) {
          await db.insert(photoLikes).values({
            userId: createdUsers[userIndex].id,
            photoId: photo.id,
            createdAt: new Date(),
          });
        }
      }
    }
    
    console.log('✅ Seed databáze dokončen!');
    console.log('👤 Všechny účty mají heslo: password123');
    
  } catch (error) {
    console.error('❌ Chyba při seedování databáze:', error);
  }
}

// Spustíme seed, pokud je skript spuštěn přímo
if (require.main === module) {
  seedDatabase().finally(() => {
    process.exit(0);
  });
}