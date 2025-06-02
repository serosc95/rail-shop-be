import { Product } from '../models/product';

export interface ProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  updateStock(productId: string, newStock: number): Promise<void>;
}