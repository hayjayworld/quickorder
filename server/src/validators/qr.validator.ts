import { z } from 'zod';

export const generateQrSchema = z.object({
  outletId: z.string().min(1, 'Outlet is required'),
  tableId: z.string().optional(),
  label: z.string().optional(),
  customLabel: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const bulkGenerateQrSchema = z.object({
  outletId: z.string().min(1, 'Outlet is required'),
  tableIds: z.array(z.string().min(1)).min(1, 'At least one table is required'),
  labelPrefix: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const updateQrSchema = z.object({
  label: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'REVOKED']).optional(),
  tableId: z.string().optional(),
}).refine(data => Object.keys(data).length > 0, 'At least one field is required');