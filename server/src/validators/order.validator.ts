import { z } from 'zod';

export const createOrderSchema = z.object({
  qrToken: z.string().min(1, 'QR token is required'),
  sessionId: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    options: z.array(z.object({
      optionId: z.string().min(1, 'Option ID is required'),
      valueId: z.string().min(1, 'Option value ID is required'),
    })).optional(),
  })).min(1, 'At least one item is required'),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerNotes: z.string().optional(),
  orderType: z.enum(['DINE_IN', 'TAKEAWAY']).default('DINE_IN'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']),
  notes: z.string().optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required'),
});