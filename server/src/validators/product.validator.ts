import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  categoryId: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url().optional(),
  preparationTime: z.number().int().min(0).default(15),
  options: z.array(z.object({
    name: z.string().min(1, 'Option name is required'),
    isRequired: z.boolean().default(false),
    minSelections: z.number().int().min(0).default(0),
    maxSelections: z.number().int().min(1).default(1),
    values: z.array(z.object({
      label: z.string().min(1, 'Option value label is required'),
      priceDelta: z.number().default(0),
    })).min(1, 'At least one option value is required'),
  })).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  categoryId: z.string().min(1).optional(),
  imageUrl: z.string().url().optional(),
  preparationTime: z.number().int().min(0).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']).optional(),
}).refine(data => Object.keys(data).length > 0, 'At least one field is required');

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  description: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, 'At least one field is required');