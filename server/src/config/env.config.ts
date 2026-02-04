import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('3000'),
    MONGODB_URL: z.string().min(1, 'MONGODB_URI is required'),
    JWT_ACCESS_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_ACCESS_EXPIRES_IN: z.string().min(2, 'JWT_EXPIRES_IN is required').default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().min(2, 'JWT_EXPIRES_IN is required').default('14d'),
    ENCRYPTION_KEY: z.string().length(64, 'ENCRYPTION_KEY must be 64 hex characters (32 bytes)'),
});

const env = envSchema.safeParse(process.env);
if (!env.success) {
    console.error('❌ Invalid environment variables:', env.error.format());
    process.exit(1);
}

export const config = {
    port: env.data.PORT,
    mongodbUrl: env.data.MONGODB_URL,
    jwtAccessSecret: env.data.JWT_ACCESS_SECRET,
    jwtRefreshSecret: env.data.JWT_REFRESH_SECRET,
    jwtAccessExpiresIn: env.data.JWT_ACCESS_EXPIRES_IN,
    jwtRefreshExpiresIn: env.data.JWT_REFRESH_EXPIRES_IN,
    encryptionKey: env.data.ENCRYPTION_KEY,
}