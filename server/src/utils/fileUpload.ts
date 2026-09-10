import path from 'path';
import fs from 'fs';
import { config } from '../config/env';
import { AppError } from './AppError';

export async function saveBase64Image(base64String: string, folder: string): Promise<string> {
  try {
    // Extract base64 data
    const matches = base64String.match(/^data:image\/([A-Za-z-]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new AppError('Invalid image format', 400);
    }

    const extension = matches[1].toLowerCase();
    const allowedExtensions = ['jpeg', 'jpg', 'png', 'webp', 'gif'];
    if (!allowedExtensions.includes(extension)) {
      throw new AppError('Unsupported image format', 400);
    }

    const buffer = Buffer.from(matches[2], 'base64');
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
    const uploadDir = path.resolve(__dirname, '../../', config.uploadDir, folder);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    return `/uploads/${folder}/${filename}`;
  } catch (error) {
    throw error;
  }
}

export function deleteFile(filePath: string): void {
  try {
    const fullPath = path.resolve(__dirname, '../../', filePath.replace(/^\/uploads/, config.uploadDir));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    // Log but don't throw
    console.error('Failed to delete file:', error);
  }
}