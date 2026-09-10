import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export function generateAccessToken(userId: string, role: string, restaurantId?: string): string {
  return jwt.sign(
    { userId, role, restaurantId },
    config.jwtSecret,
    { expiresIn: '15m' }
  );
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { userId },
    config.jwtRefreshSecret,
    { expiresIn: '7d' }
  );
}

export function verifyAccessToken(token: string): any {
  return jwt.verify(token, config.jwtSecret);
}

export function verifyRefreshToken(token: string): any {
  return jwt.verify(token, config.jwtRefreshSecret);
}