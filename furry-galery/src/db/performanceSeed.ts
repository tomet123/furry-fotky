import { faker } from '@faker-js/faker';
import { 
  db, 
  user,
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
import * as https from 'https';
import bcrypt from 'bcrypt';

console.log('🚀 Začínám performance seed databáze...');

// Nastavení počtu generovaných záznamů (výchozí hodnoty)
const CONFIG = {
  USERS: 300,            // Celkový počet uživatelů
  PHOTOGRAPHERS: 40,     // Počet fotografů (podmnožina uživatelů)
  ORGANIZERS: 20,        // Počet organizátorů (podmnožina uživatelů)
  EVENTS: 100,           // Počet akcí
  TAGS: 50,              // Počet tagů
  PHOTOS: 2000,          // Počet fotografií
  DOWNLOAD_IMAGES: 15,   // Počet obrázků ke stažení (ostatní budou recyklované)
  LIKES_PER_PHOTO: 20,   // Maximální počet lajků na fotografii
  TAGS_PER_PHOTO: 5,     // Maximální počet tagů na fotografii
  BATCH_SIZE: 100        // Velikost dávky pro hromadné vkládání
};

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
  await db.delete(user);
}

// Funkce pro stažení a uložení obrázků
async function downloadAndSaveImages(count: number) {
  console.log(`📷 Stahuji a ukládám ${count} obrázků...`);
  
  const PHOTO_WIDTH = 1920;
  const PHOTO_HEIGHT = 1080;
  const THUMBNAIL_WIDTH = Math.floor(PHOTO_WIDTH / 4);
  const THUMBNAIL_HEIGHT = Math.floor(PHOTO_HEIGHT / 4);
  const AVATAR_SIZE = 200;
  
  const createdAvatars: Array<{ id: string; fileData: Buffer; thumbnailData: Buffer; contentType: string; originalName: string; createdAt: Date }> = [];
  const createdStoragePhotos: Array<{ id: string; fileData: Buffer; thumbnailData: Buffer; contentType: string; originalName: string; createdAt: Date }> = [];
  
  // Stáhneme obrázky pro profilové fotky
  for (let i = 1; i <= Math.min(count, 5); i++) {
    const randomId = Math.floor(Math.random() * 1000) + 1;
    const avatarUrl = `https://picsum.photos/id/${randomId}/${AVATAR_SIZE}/${AVATAR_SIZE}`;
    
    console.log(`[${i}/${count}] Stahuji profilový obrázek z ${avatarUrl}...`);
    
    try {
      const imageData = await downloadImage(avatarUrl);
      
      const avatar = {
        id: createId('avatar_'),
        fileData: imageData,
        thumbnailData: imageData, // U profilových obrázků používáme stejný obrázek jako thumbnail
        contentType: 'image/jpeg',
        originalName: `avatar${i}.jpg`,
        createdAt: new Date(),
      };
      
      await db.insert(storageProfilePictures).values(avatar);
      createdAvatars.push(avatar);
      
      console.log(`Profilový obrázek ${i} úspěšně stažen a uložen (${imageData.length} bytů)`);
    } catch (error) {
      console.error(`Chyba při stahování profilového obrázku ${i}:`, error);
      // V případě chyby vytvoříme prázdný avatar
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
    
    // Krátké zpoždění mezi požadavky, aby nedošlo k zahlcení API
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Stáhneme obrázky pro fotografie
  for (let i = 1; i <= count; i++) {
    const randomId = Math.floor(Math.random() * 1000) + 1;
    const photoUrl = `https://picsum.photos/id/${randomId}/${PHOTO_WIDTH}/${PHOTO_HEIGHT}`;
    const thumbnailUrl = `https://picsum.photos/id/${randomId}/${THUMBNAIL_WIDTH}/${THUMBNAIL_HEIGHT}`;
    
    console.log(`[${i}/${count}] Stahuji fotografii z ${photoUrl}...`);
    
    try {
      const [imageData, thumbnailData] = await Promise.all([
        downloadImage(photoUrl),
        downloadImage(thumbnailUrl)
      ]);
      
      const storage = {
        id: createId('storage_'),
        fileData: imageData,
        thumbnailData: thumbnailData,
        contentType: 'image/jpeg',
        originalName: `photo${i}.jpg`,
        createdAt: new Date(),
      };
      
      await db.insert(storagePhotos).values(storage);
      createdStoragePhotos.push(storage);
      
      console.log(`Fotografie ${i} úspěšně stažena a uložena (${imageData.length} bytů)`);
    } catch (error) {
      console.error(`Chyba při stahování fotografie ${i}:`, error);
      // V případě chyby vytvoříme prázdnou fotografii
      const emptyStorage = {
        id: createId('storage_'),
        fileData: Buffer.from(''),
        thumbnailData: Buffer.from(''),
        contentType: 'image/jpeg',
        originalName: `photo${i}.jpg`,
        createdAt: new Date(),
      };
      await db.insert(storagePhotos).values(emptyStorage);
      createdStoragePhotos.push(emptyStorage);
    }
    
    // Krátké zpoždění mezi požadavky, aby nedošlo k zahlcení API
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return { 
    avatars: createdAvatars, 
    photos: createdStoragePhotos 
  };
}

// Funkce pro generování uživatelů
async function generateUsers(count: number, avatars: any[]) {
  console.log(`👤 Generuji ${count} uživatelů...`);
  
  const createdUsers = [];
  const passwordHash = await hashPassword('password123'); // Všichni uživatelé mají stejné heslo
  
  // Vytvoříme 2 admin účty vždy
  const adminUsers = [
    {
      id: createId('user_'),
      name: 'Admin',
      username: 'admin',
      email: 'admin@furry-fotky.cz',
      passwordHash,
      isAdmin: true,
      isActive: true,
      createdAt: new Date()
    },
    {
      id: createId('user_'),
      name: 'SuperAdmin',
      username: 'superadmin',
      email: 'superadmin@furry-fotky.cz',
      passwordHash,
      isAdmin: true,
      isActive: true,
      createdAt: new Date()
    }
  ];
  
  for (const adminUser of adminUsers) {
    await db.insert(user).values(adminUser);
    createdUsers.push(adminUser);
  }
  
  // Batch inserting uživatelů po dávkách
  const batchSize = CONFIG.BATCH_SIZE;
  
  for (let i = 0; i < count - 2; i += batchSize) {
    const batch = [];
    const batchEnd = Math.min(i + batchSize, count - 2);
    
    for (let j = i; j < batchEnd; j++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const username = faker.internet.userName({ firstName, lastName }).replace(/[^a-zA-Z0-9]/g, '');
      const email = faker.internet.email({ firstName, lastName });
      
      // Přiřadíme náhodný avatar (pokud jsou dostupné)
      const hasAvatar = avatars.length > 0 && Math.random() > 0.3;
      
      const newUser = {
        id: createId('user_'),
        name: `${firstName} ${lastName}`,
        username: username,
        email: email,
        passwordHash,
        isAdmin: false,
        isActive: true,
        createdAt: faker.date.past({ years: 2 })
      };
      
      batch.push(newUser);
      createdUsers.push(newUser);
      
      // Pokud máme avatar, vytvoříme nový záznam avataru s ID uživatele
      if (hasAvatar) {
        const randomAvatarIndex = Math.floor(Math.random() * avatars.length);
        const avatar = avatars[randomAvatarIndex];
        
        await db.insert(storageProfilePictures).values({
          id: createId('avatar_'),
          fileData: avatar.fileData,
          thumbnailData: avatar.thumbnailData,
          contentType: avatar.contentType,
          originalName: avatar.originalName,
          userId: newUser.id,
          createdAt: newUser.createdAt
        });
      }
    }
    
    if (batch.length > 0) {
      await db.insert(user).values(batch);
      console.log(`Vloženo ${batch.length} uživatelů (celkem ${i + batch.length}/${count})`);
    }
  }
  
  return createdUsers;
}

// Funkce pro generování fotografů a organizátorů
async function generatePhotographersAndOrganizers(users: any[]) {
  const nonAdminUsers = users.filter(u => !u.isAdmin);
  
  // Náhodně vybereme uživatele pro role fotografů (nepřekrývající se s organizátory)
  const photographerCount = Math.min(CONFIG.PHOTOGRAPHERS, Math.floor(nonAdminUsers.length * 0.4));
  console.log(`📸 Generuji ${photographerCount} fotografů...`);
  
  const shuffledForPhotographers = [...nonAdminUsers].sort(() => 0.5 - Math.random());
  const photographerUsers = shuffledForPhotographers.slice(0, photographerCount);
  
  const createdPhotographers = [];
  
  // Batch inserting fotografů
  const batchSize = CONFIG.BATCH_SIZE;
  
  for (let i = 0; i < photographerUsers.length; i += batchSize) {
    const batch = [];
    const batchEnd = Math.min(i + batchSize, photographerUsers.length);
    
    for (let j = i; j < batchEnd; j++) {
      const photographerUser = photographerUsers[j];
      const isBeginner = Math.random() > 0.3; // 70% jsou začátečníci
      
      const photographer = {
        id: createId('photographer_'),
        userId: photographerUser.id,
        bio: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        isBeginner,
        createdAt: photographerUser.createdAt
      };
      
      batch.push(photographer);
      createdPhotographers.push(photographer);
    }
    
    if (batch.length > 0) {
      await db.insert(photographers).values(batch);
      console.log(`Vloženo ${batch.length} fotografů (celkem ${i + batch.length}/${photographerCount})`);
    }
  }
  
  // Náhodně vybereme uživatele pro role organizátorů (nepřekrývající se s fotografy)
  const remainingUsers = nonAdminUsers.filter(u => !photographerUsers.includes(u));
  const organizerCount = Math.min(CONFIG.ORGANIZERS, Math.floor(remainingUsers.length * 0.3));
  console.log(`🎪 Generuji ${organizerCount} organizátorů...`);
  
  const organizerUsers = remainingUsers.slice(0, organizerCount);
  
  const createdOrganizers = [];
  
  // Batch inserting organizátorů
  for (let i = 0; i < organizerUsers.length; i += batchSize) {
    const batch = [];
    const batchEnd = Math.min(i + batchSize, organizerUsers.length);
    
    for (let j = i; j < batchEnd; j++) {
      const organizerUser = organizerUsers[j];
      
      const organizer = {
        id: createId('organizer_'),
        userId: organizerUser.id,
        bio: faker.lorem.paragraph(),
        createdAt: organizerUser.createdAt
      };
      
      batch.push(organizer);
      createdOrganizers.push(organizer);
    }
    
    if (batch.length > 0) {
      await db.insert(organizers).values(batch);
      console.log(`Vloženo ${batch.length} organizátorů (celkem ${i + batch.length}/${organizerCount})`);
    }
  }
  
  return { photographers: createdPhotographers, organizers: createdOrganizers };
}

// Funkce pro generování tagů
async function generateTags(count: number) {
  console.log(`🏷️ Generuji ${count} tagů...`);
  
  const createdTags = [];
  const tagCategories = [
    'zvíře', 'barva', 'místo', 'aktivita', 'nálada', 'denní doba',
    'styl', 'počasí', 'kostým', 'akce', 'sezona', 'téma'
  ];
  
  // Zajistíme, že každá kategorie má alespoň jeden tag
  for (const category of tagCategories) {
    const tag = {
      id: createId('tag_'),
      name: `${category}_${faker.word.sample()}`,
      createdAt: new Date()
    };
    
    await db.insert(tags).values(tag);
    createdTags.push(tag);
  }
  
  // Vygenerujeme zbytek tagů
  const remainingCount = count - tagCategories.length;
  
  if (remainingCount > 0) {
    const batchSize = CONFIG.BATCH_SIZE;
    
    for (let i = 0; i < remainingCount; i += batchSize) {
      const batch = [];
      const batchEnd = Math.min(i + batchSize, remainingCount);
      
      for (let j = i; j < batchEnd; j++) {
        const tag = {
          id: createId('tag_'),
          name: faker.word.sample() + '_' + faker.word.adjective(),
          createdAt: new Date()
        };
        
        batch.push(tag);
        createdTags.push(tag);
      }
      
      if (batch.length > 0) {
        await db.insert(tags).values(batch);
        console.log(`Vloženo ${batch.length} tagů (celkem ${createdTags.length}/${count})`);
      }
    }
  }
  
  return createdTags;
}

// Funkce pro generování akcí
async function generateEvents(organizers: any[], count: number) {
  console.log(`📅 Generuji ${count} akcí...`);
  
  if (organizers.length === 0) {
    console.log('⚠️ Žádní organizátoři nejsou k dispozici, akce nebudou vytvořeny.');
    return [];
  }
  
  const createdEvents = [];
  const cities = ['Praha', 'Brno', 'Ostrava', 'Plzeň', 'Liberec', 'Olomouc', 'České Budějovice', 'Hradec Králové', 'Ústí nad Labem', 'Pardubice'];
  const eventTypes = ['Meetup', 'Convention', 'Walk', 'Party', 'Workshop', 'Charity', 'Photo Session', 'Online Stream', 'Contest'];
  
  const batchSize = CONFIG.BATCH_SIZE;
  
  for (let i = 0; i < count; i += batchSize) {
    const batch = [];
    const batchEnd = Math.min(i + batchSize, count);
    
    for (let j = i; j < batchEnd; j++) {
      const city = cities[Math.floor(Math.random() * cities.length)];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const date = faker.date.between({ from: '2022-01-01', to: '2024-12-31' }).toISOString().split('T')[0];
      const randomOrganizerIndex = Math.floor(Math.random() * organizers.length);
      
      const event = {
        id: createId('event_'),
        name: `${city} ${eventType} ${date.substring(0, 4)}`,
        description: faker.lorem.paragraph(),
        location: `${city}, ${faker.location.streetAddress()}`,
        date: date,
        organizerId: organizers[randomOrganizerIndex].id,
        createdAt: new Date(Date.parse(date) - Math.random() * 7776000000) // Vytvořeno 0-90 dní před akcí
      };
      
      batch.push(event);
      createdEvents.push(event);
    }
    
    if (batch.length > 0) {
      await db.insert(events).values(batch);
      console.log(`Vloženo ${batch.length} akcí (celkem ${i + batch.length}/${count})`);
    }
  }
  
  return createdEvents;
}

// Funkce pro generování fotografií
async function generatePhotos(photographers: any[], events: any[], storagePhotos: any[], count: number) {
  console.log(`🖼️ Generuji ${count} fotografií...`);
  
  if (photographers.length === 0 || events.length === 0 || storagePhotos.length === 0) {
    console.log('⚠️ Chybí potřebná data pro vytvoření fotografií (fotografové, akce nebo úložiště)');
    return [];
  }
  
  const createdPhotos = [];
  const batchSize = CONFIG.BATCH_SIZE;
  
  for (let i = 0; i < count; i += batchSize) {
    const batch = [];
    const batchEnd = Math.min(i + batchSize, count);
    
    for (let j = i; j < batchEnd; j++) {
      const randomPhotographerIndex = Math.floor(Math.random() * photographers.length);
      const randomEventIndex = Math.floor(Math.random() * events.length);
      const randomStorageIndex = Math.floor(Math.random() * storagePhotos.length);
      const randomLikes = Math.floor(Math.random() * 100);
      
      // Datum fotografie je mezi datem akce a týdnem po ní
      const eventDate = new Date(events[randomEventIndex].date);
      const photoDate = new Date(eventDate);
      photoDate.setDate(photoDate.getDate() + Math.floor(Math.random() * 7)); // 0-7 dní po akci
      
      const photo = {
        id: createId('photo_'),
        photographerId: photographers[randomPhotographerIndex].id,
        eventId: events[randomEventIndex].id,
        storageId: storagePhotos[randomStorageIndex].id,
        likes: randomLikes,
        date: photoDate.toISOString().split('T')[0],
        createdAt: new Date(photoDate.getTime() + Math.random() * 86400000) // Vytvořeno 0-24 hodin po datu fotografie
      };
      
      batch.push(photo);
      createdPhotos.push(photo);
    }
    
    if (batch.length > 0) {
      await db.insert(photos).values(batch);
      console.log(`Vloženo ${batch.length} fotografií (celkem ${i + batch.length}/${count})`);
    }
  }
  
  return createdPhotos;
}

// Funkce pro přiřazení tagů a lajků
async function assignTagsAndLikes(photos: any[], tags: any[], users: any[]) {
  console.log(`🔖 Přiřazuji tagy a lajky k fotografiím...`);
  
  // Přiřazení tagů k fotografiím
  console.log(`Přiřazuji tagy...`);
  let tagCounter = 0;
  const totalTagAssignments = photos.length * CONFIG.TAGS_PER_PHOTO;
  const tagBatchSize = CONFIG.BATCH_SIZE * 5; // Větší dávky pro rychlejší vkládání
  const photoTagBatches = [];
  
  for (const photo of photos) {
    // Každá fotografie dostane 1-5 náhodných tagů
    const numTags = Math.floor(Math.random() * CONFIG.TAGS_PER_PHOTO) + 1;
    const usedTagIndices = new Set<number>();
    
    for (let i = 0; i < numTags; i++) {
      let randomTagIndex;
      do {
        randomTagIndex = Math.floor(Math.random() * tags.length);
      } while (usedTagIndices.has(randomTagIndex));
      
      usedTagIndices.add(randomTagIndex);
      
      photoTagBatches.push({
        photoId: photo.id,
        tagId: tags[randomTagIndex].id,
        createdAt: photo.createdAt
      });
      
      tagCounter++;
      
      // Pokud jsme dosáhli velikosti dávky, provedeme vložení
      if (photoTagBatches.length >= tagBatchSize) {
        await db.insert(photoTags).values(photoTagBatches);
        console.log(`Přiřazeno ${tagCounter} tagů z ${totalTagAssignments}`);
        photoTagBatches.length = 0; // Vyprázdníme pole
      }
    }
  }
  
  // Vložíme zbývající tagy
  if (photoTagBatches.length > 0) {
    await db.insert(photoTags).values(photoTagBatches);
    console.log(`Přiřazeno ${tagCounter} tagů z ${totalTagAssignments}`);
  }
  
  // Přiřazení lajků k fotografiím
  console.log(`Přiřazuji lajky...`);
  let likeCounter = 0;
  const likeBatchSize = CONFIG.BATCH_SIZE * 5; // Větší dávky pro rychlejší vkládání
  const photoLikeBatches = [];
  
  for (const photo of photos) {
    // Každá fotografie dostane 0-20 náhodných lajků
    const numLikes = Math.floor(Math.random() * (CONFIG.LIKES_PER_PHOTO + 1));
    const usedUserIndices = new Set<number>();
    
    for (let i = 0; i < numLikes; i++) {
      let randomUserIndex;
      do {
        randomUserIndex = Math.floor(Math.random() * users.length);
      } while (usedUserIndices.has(randomUserIndex));
      
      usedUserIndices.add(randomUserIndex);
      
      photoLikeBatches.push({
        userId: users[randomUserIndex].id,
        photoId: photo.id,
        createdAt: new Date(photo.createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000) // 0-30 dní po vytvoření fotografie
      });
      
      likeCounter++;
      
      // Pokud jsme dosáhli velikosti dávky, provedeme vložení
      if (photoLikeBatches.length >= likeBatchSize) {
        await db.insert(photoLikes).values(photoLikeBatches);
        console.log(`Přiřazeno ${likeCounter} lajků`);
        photoLikeBatches.length = 0; // Vyprázdníme pole
      }
    }
  }
  
  // Vložíme zbývající lajky
  if (photoLikeBatches.length > 0) {
    await db.insert(photoLikes).values(photoLikeBatches);
    console.log(`Přiřazeno ${likeCounter} lajků`);
  }
}

// Hlavní funkce pro seed databáze pro výkonnostní testování
async function seedPerformanceDatabase() {
  const startTime = new Date().getTime();
  
  try {
    // Vyčistíme databázi
    await cleanDatabase();
    
    // Stáhneme obrázky
    console.log(`Stahuji ${CONFIG.DOWNLOAD_IMAGES} obrázků pro recyklaci...`);
    const { avatars, photos: downloadedPhotos } = await downloadAndSaveImages(CONFIG.DOWNLOAD_IMAGES);
    
    // Generujeme uživatele
    const users = await generateUsers(CONFIG.USERS, avatars);
    
    // Určíme fotografy a organizátory
    const { photographers: createdPhotographers, organizers: createdOrganizers } = 
      await generatePhotographersAndOrganizers(users);
    
    // Generujeme tagy
    const createdTags = await generateTags(CONFIG.TAGS);
    
    // Generujeme akce
    const createdEvents = await generateEvents(createdOrganizers, CONFIG.EVENTS);
    
    // Generujeme fotografie
    const createdPhotos = await generatePhotos(
      createdPhotographers, 
      createdEvents, 
      downloadedPhotos, 
      CONFIG.PHOTOS
    );
    
    // Přiřadíme tagy a lajky
    await assignTagsAndLikes(createdPhotos, createdTags, users);
    
    const endTime = new Date().getTime();
    const durationSeconds = (endTime - startTime) / 1000;
    
    console.log(`✅ Performance seed databáze dokončen za ${durationSeconds.toFixed(2)} sekund!`);
    console.log(`📊 Statistika vygenerovaných dat:`);
    console.log(`   👤 Uživatelů: ${users.length}`);
    console.log(`   📸 Fotografů: ${createdPhotographers.length}`);
    console.log(`   🎪 Organizátorů: ${createdOrganizers.length}`);
    console.log(`   📅 Akcí: ${createdEvents.length}`);
    console.log(`   🏷️ Tagů: ${createdTags.length}`);
    console.log(`   🖼️ Fotografií: ${createdPhotos.length}`);
    console.log(`👤 Všechny účty mají heslo: password123`);
    
  } catch (error) {
    console.error('❌ Chyba při performance seedování databáze:', error);
  }
}

// Spustíme seed, pokud je skript spuštěn přímo
if (require.main === module) {
  // Zpracování CLI argumentů
  const args = process.argv.slice(2);
  
  // Pokud je první argument "light", snížíme počty pro rychlejší testovací seed
  if (args.includes("light")) {
    console.log("🔍 Spouštím light verzi performance seedu...");
    CONFIG.USERS = 50;
    CONFIG.PHOTOGRAPHERS = 10;
    CONFIG.ORGANIZERS = 5;
    CONFIG.EVENTS = 20;
    CONFIG.TAGS = 15;
    CONFIG.PHOTOS = 200;
    CONFIG.DOWNLOAD_IMAGES = 5;
  }
  
  seedPerformanceDatabase().finally(() => {
    process.exit(0);
  });
}

export { seedPerformanceDatabase }; 