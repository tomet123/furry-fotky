import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { createId } from '../utils';
import { relations } from 'drizzle-orm';
import { user } from './auth';

// Tabulka fotografů
export const photographers = sqliteTable('photographers', {
  id: text('id').primaryKey().$defaultFn(() => createId('photographer_')),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  bio: text('bio'),
  description: text('description'),
  isBeginner: integer('is_beginner', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Relace pro fotografy
export const photographersRelations = relations(photographers, ({ one }) => ({
  user: one(user, {
    fields: [photographers.userId],
    references: [user.id],
  }),
}));

// Tabulka organizátorů
export const organizers = sqliteTable('organizers', {
  id: text('id').primaryKey().$defaultFn(() => createId('organizer_')),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  bio: text('bio'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Relace pro organizátory
export const organizersRelations = relations(organizers, ({ one }) => ({
  user: one(user, {
    fields: [organizers.userId],
    references: [user.id],
  }),
}));