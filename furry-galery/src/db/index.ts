import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { createId } from './utils';

// Import pomocných dotazovacích modulů
import { eq, and, or, not, like, sql, desc, asc } from 'drizzle-orm';

// Inicializace SQLite databáze
const sqlite = new Database('./sqlite.db');

// Vytvoření Drizzle klienta
export const db = drizzle(sqlite, { schema });


// Export schémat
export * from './schema';

// Import a export nové tabulky markdownImages
import { markdownImages } from './schema/markdown';

import { user, session, verificationToken, passwordResetToken } from './schema/auth';
import { photographers, organizers } from './schema/users';
import { events } from './schema/events';
import { photos, photoTags, photoLikes, tags, storagePhotos, storageProfilePictures } from './schema/photos';

// Export schema and query builders
export {
  db,
  eq,
  and,
  or,
  sql,
  desc,
  asc,
  not,
  like,
  // Tables
  user,
  session,
  verificationToken,
  photographers,
  organizers,
  events,
  photos,
  photoTags,
  photoLikes,
  tags,
  storagePhotos,
  storageProfilePictures,
  markdownImages,
}; 