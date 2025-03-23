import { sqliteTable, text, integer, blob, primaryKey } from 'drizzle-orm/sqlite-core';
import { createId } from '../utils';
import { photographers } from './users';
import { events, tags } from './events';
import { user } from './auth';

// Úložiště fotografií
export const storagePhotos = sqliteTable('storage_photos', {
  id: text('id').primaryKey().$defaultFn(() => createId('storage_')),
  fileData: blob('file_data').notNull(),
  thumbnailData: blob('thumbnail_data').notNull(),
  contentType: text('content_type').notNull(),
  originalName: text('original_name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Úložiště profilových obrázků
export const storageProfilePictures = sqliteTable('storage_profile_pictures', {
  id: text('id').primaryKey().$defaultFn(() => createId('avatar_')),
  fileData: blob('file_data').notNull(),
  thumbnailData: blob('thumbnail_data').notNull(),
  contentType: text('content_type').notNull(),
  originalName: text('original_name').notNull(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Fotografie
export const photos = sqliteTable('photos', {
  id: text('id').primaryKey().$defaultFn(() => createId('photo_')),
  photographerId: text('photographer_id').notNull().references(() => photographers.id, { onDelete: 'cascade' }),
  eventId: text('event_id').references(() => events.id, { onDelete: 'set null' }),
  storageId: text('storage_id').notNull().references(() => storagePhotos.id, { onDelete: 'restrict' }),
  likes: integer('likes').notNull().default(0),
  date: text('date').notNull(), // SQLite nemá přímo datový typ DATE, použijeme text
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Propojení fotografií a tagů (many-to-many)
export const photoTags = sqliteTable('photo_tags', {
  photoId: text('photo_id').notNull().references(() => photos.id, { onDelete: 'cascade' }),
  tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.photoId, table.tagId] }),
  };
});

// Lajky fotografií (many-to-many)
export const photoLikes = sqliteTable('photo_likes', {
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  photoId: text('photo_id').notNull().references(() => photos.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.photoId] }),
  };
});