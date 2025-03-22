import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '../utils';
import { organizers } from './users';

// Tabulka událostí
export const events = sqliteTable('events', {
  id: text('id').primaryKey().$defaultFn(createId),
  name: text('name').notNull(),
  organizerId: text('organizer_id').notNull().references(() => organizers.id, { onDelete: 'restrict' }),
  description: text('description'),
  location: text('location').notNull(),
  date: text('date').notNull(), // SQLite nemá přímo datový typ DATE, použijeme text
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Tabulka tagů
export const tags = sqliteTable('tags', {
  id: text('id').primaryKey().$defaultFn(createId),
  name: text('name').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
