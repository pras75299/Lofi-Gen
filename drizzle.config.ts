import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './supabase/migrations', // I can reuse the folder for consistency or create a new one
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.VITE_NEON_DATABASE_URL!,
    },
});
