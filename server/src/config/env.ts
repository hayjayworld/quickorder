import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET || '';
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || '';
const databaseUrl = process.env.DATABASE_URL || '';

if (isProduction) {
  if (!databaseUrl || !jwtSecret || !jwtRefreshSecret) {
    throw new Error('DATABASE_URL, JWT_SECRET, and JWT_REFRESH_SECRET are required in production');
  }

  if (jwtSecret.includes('your-super-secret') || jwtRefreshSecret.includes('your-refresh-secret')) {
    throw new Error('Production JWT secrets must be changed from the example values');
  }
}

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  jwtSecret: jwtSecret || 'dev-secret-key',
  jwtRefreshSecret: jwtRefreshSecret || 'dev-refresh-secret',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  serverUrl: process.env.SERVER_URL || 'http://localhost:4000',
  databaseUrl,
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY || '',
  paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
  flutterwaveSecretKey: process.env.FLUTTERWAVE_SECRET_KEY || '',
  flutterwavePublicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || '',
  isProduction: process.env.NODE_ENV === 'production',
  cookieSameSite: (process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax')) as 'lax' | 'strict' | 'none',
};