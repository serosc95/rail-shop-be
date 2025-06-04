import { Injectable, Inject } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/tokens';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { Product } from '../../domain/models/product';

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: ProductRepository
  ) {}

  async execute(): Promise<Product[]> {
    return this.productRepo.findAll();
  }
}
