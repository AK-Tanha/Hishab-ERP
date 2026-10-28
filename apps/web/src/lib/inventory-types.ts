export interface Category { id: string; nameEn: string; nameBn?: string | null; }
export interface Unit { id: string; code: string; nameEn: string; nameBn?: string | null; }
export interface Warehouse { id: string; nameEn: string; nameBn?: string | null; }
export interface Product {
  id: string;
  sku: string;
  nameEn: string;
  nameBn?: string | null;
  sellingPrice: number;
  costPrice: number;
  categoryId?: string | null;
  unitId?: string | null;
}
export interface StockMovement {
  id: string;
  type: string;
  quantity: string | number;
  notes?: string | null;
  createdAt: string;
  product?: { nameEn: string } | null;
  warehouse?: { nameEn: string } | null;
  productId: string;
  warehouseId: string;
}
