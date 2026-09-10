import crypto from 'crypto';

export function generateQrToken(): string {
  return `qr_${crypto.randomBytes(16).toString('hex')}`;
}