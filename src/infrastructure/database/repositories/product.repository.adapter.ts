import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../../../domain/repositories/product.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../entities/product.entity';
import { Product } from '../../../domain/models/product';

@Injectable()
export class ProductRepositoryAdapter implements ProductRepository {

  constructor(
    @InjectRepository(ProductEntity)
    private readonly repo: Repository<ProductEntity>,
  ) {}

  async findAll(): Promise<Product[]> {
    const entities = await this.repo.find();
    return entities.map(Product.fromEntity);
  }

  async findById(id: string): Promise<Product | null> {
    try {
      const entity = await this.repo.findOneBy({ id });
      if (!entity) return null;
      return Product.fromEntity(entity);
    } catch (error) {
      throw error;
    }
  }

  async updateStock(id: string, newStock: number): Promise<void> {
    const result = await this.repo.update({ id }, { stock: newStock });
    if (result.affected === 0) {
      throw new Error(`No se encontró producto con id ${id} para actualizar stock`);
    }
  }
}
