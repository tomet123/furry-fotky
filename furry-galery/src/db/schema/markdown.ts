import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';
import { createId } from '../utils';
import { user } from './auth';
import { relations } from 'drizzle-orm';

// Tabulka pro ukládání obrázků z Markdown editoru
export const markdownImages = sqliteTable('markdown_images', {
  id: text('id').primaryKey().$defaultFn(() => createId('mdimg_')),
  fileData: blob('file_data').notNull(),
  thumbnailData: blob('thumbnail_data').notNull(),
  contentType: text('content_type').notNull(),
  originalName: text('original_name').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  url: text('url').notNull(), // URL pro přístup k obrázku
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(true),
});

// Relace pro obrázky
export const markdownImagesRelations = relations(markdownImages, ({ one }) => ({
  user: one(user, {
    fields: [markdownImages.userId],
    references: [user.id],
  }),
})); 