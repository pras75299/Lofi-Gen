import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: "https://ep-cool-lake-afjqtwdf.neonauth.c-2.us-west-2.aws.neon.tech/neondb/auth"
});
