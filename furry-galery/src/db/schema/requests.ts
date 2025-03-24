import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { createId } from '../utils';
import { relations } from 'drizzle-orm';
import { user } from './auth';
import { photographers } from './users';

// Tabulka žádostí o převzetí profilu fotografa
export const photographerTakeoverRequests = sqliteTable('photographer_takeover_requests', {
  id: text('id').primaryKey().$defaultFn(() => createId('takeover_')),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  photographerId: text('photographer_id').notNull().references(() => photographers.id, { onDelete: 'cascade' }),
  reason: text('reason'),
  status: text('status').notNull().default('pending'), // pending, approved, rejected
  adminNote: text('admin_note'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Relace pro žádosti o převzetí profilu fotografa
export const photographerTakeoverRequestsRelations = relations(photographerTakeoverRequests, ({ one }) => ({
  user: one(user, {
    fields: [photographerTakeoverRequests.userId],
    references: [user.id],
  }),
  photographer: one(photographers, {
    fields: [photographerTakeoverRequests.photographerId],
    references: [photographers.id],
  }),
})); 