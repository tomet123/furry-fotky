import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { createId } from "../utils";

// Standardní tabulka uživatelů pro NextAuth.js
export const user = sqliteTable("user", {
  id: text("id").primaryKey().$defaultFn(() => createId("user_")),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp" }),
  
  // Přidáváme vlastní pole pro zachování původních funkcionalit
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash"),
  isAdmin: integer("is_admin", { mode: "boolean" }).notNull().default(false),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Tabulka pro OAuth accounts
export const account = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compositePk: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

// Tabulka pro sessions
export const session = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

// Tabulka pro verification tokens (např. pro reset hesla)
export const verificationToken = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp" }).notNull(),
  },
  (vt) => ({
    compositePk: primaryKey({
      columns: [vt.identifier, vt.token],
    }),
  })
); 