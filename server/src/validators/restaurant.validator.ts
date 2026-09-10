import { z } from 'zod';

export const updateRestaurantSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  currency: z.string().length(3).optional(),
  accentColor: z.string().regex(/^#([0-9A-F]{6})$/i).optional(),
  themePreset: z.enum(['MINIMAL', 'BISTRO', 'BOLD']).optional(),
}).refine(data => Object.keys(data).length > 0, 'At least one field is required');

export const createOutletSchema = z.object({
  name: z.string().min(2, 'Outlet name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  openingHours: z.string().optional(),
});

export const updateOutletSchema = z.object({
  name: z.string().min(2).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  openingHours: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
}).refine(data => Object.keys(data).length > 0, 'At least one field is required');

export const createTableSchema = z.object({
  outletId: z.string().min(1, 'Outlet is required'),
  label: z.string().min(1, 'Table label is required'),
  capacity: z.number().int().min(1).max(50).default(4),
  location: z.string().optional(),
});

export const updateTableSchema = z.object({
  label: z.string().min(1).optional(),
  capacity: z.number().int().min(1).max(50).optional(),
  location: z.string().optional(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'INACTIVE']).optional(),
}).refine(data => Object.keys(data).length > 0, 'At least one field is required');