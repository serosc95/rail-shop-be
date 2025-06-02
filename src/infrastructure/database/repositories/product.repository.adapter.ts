import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../../../domain/repositories/product.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../entities/product.entity';

@Injectable()
export class ProductRepositoryAdapter implements ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repo: Repository<ProductEntity>,
  ) {}

  async findAll() {
    return this.repo.find();
  }

  async findById(id: string) {
    return this.repo.findOneBy({ id });
  }

  async updateStock(id: string, newStock: number) {
    await this.repo.update({ id }, { stock: newStock });
  }
}
