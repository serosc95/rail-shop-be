import { ProductRepository } from '../../domain/repositories/product.repository';

export class ListProductsUseCase {
  constructor(private readonly productRepo: ProductRepository) {}

  async execute() {
    return this.productRepo.findAll();
  }
}
