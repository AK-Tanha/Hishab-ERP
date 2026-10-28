import { z } from "zod";

export const CreateCategorySchema = z.object({
  nameEn: z.string().min(1),
  nameBn: z.string().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const CreateUnitSchema = z.object({
  code: z.string().min(1).max(32),
  nameEn: z.string().min(1),
  nameBn: z.string().optional().nullable(),
});

export const CreateWarehouseSchema = z.object({
  nameEn: z.string().min(1),
  nameBn: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
});

export const UpdateWarehouseSchema = CreateWarehouseSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const CreateProductSchema = z.object({
  sku: z.string().min(1).max(64),
  nameEn: z.string().min(1),
  nameBn: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  descriptionBn: z.string().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  unitId: z.string().uuid().optional().nullable(),
  costPrice: z.number().int().nonnegative().optional(),
  sellingPrice: z.number().int().nonnegative().optional(),
  reorderLevel: z.number().nonnegative().optional(),
  hasVariants: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const StockAdjustmentSchema = z.object({
  productId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  type: z.enum(["in", "out", "adjustment"]),
  quantity: z.number().positive(),
  notes: z.string().optional().nullable(),
});
