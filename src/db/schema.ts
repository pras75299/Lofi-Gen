import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const tracks = pgTable('tracks', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    originalName: text('original_name').notNull(),
    fileName: text('file_name').notNull(),
    storageUrl: text('storage_url').notNull(),
    effects: text('effects'), // JSON string of effect settings
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userProfiles = pgTable('user_profiles', {
    id: text('id').primaryKey(), // Using Supabase/Neon Auth user ID
    email: text('email').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
